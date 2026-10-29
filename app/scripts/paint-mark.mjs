import { crc32, deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const sum = Buffer.alloc(4)
  sum.writeUInt32BE(crc32(body) >>> 0)
  return Buffer.concat([length, body, sum])
}

function png(size, paint) {
  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * stride] = 0
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = paint(x + 0.5, y + 0.5, size)
      const i = y * stride + 1 + x * 4
      raw[i] = r
      raw[i + 1] = g
      raw[i + 2] = b
      raw[i + 3] = a
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

function inside(x, y, ax, ay, bx, by, cx, cy) {
  const v = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px)
  const d1 = v(x, y, ax, ay, bx, by)
  const d2 = v(x, y, bx, by, cx, cy)
  const d3 = v(x, y, cx, cy, ax, ay)
  const neg = d1 < 0 || d2 < 0 || d3 < 0
  const pos = d1 > 0 || d2 > 0 || d3 > 0
  return !(neg && pos)
}

function mark(x, y, size, pad) {
  const s = size
  const sunX = s * 0.5
  const sunY = s * (0.22 + pad)
  const sunR = s * (0.11 - pad * 0.2)
  const dx = x - sunX
  const dy = y - sunY
  if (dx * dx + dy * dy <= sunR * sunR) return [230, 168, 0, 255]
  const roof = inside(x, y, s * 0.16, s * 0.82, s * 0.5, s * (0.36 + pad), s * 0.84, s * 0.82)
  if (roof) return [0, 82, 204, 255]
  return null
}

function paint(x, y, size, maskable) {
  const hit = mark(x, y, size, maskable ? 0.08 : 0)
  if (hit) {
    const roof = hit[0] === 0 && hit[2] === 204
    if (maskable && roof) return [255, 255, 255, 255]
    return hit
  }
  return maskable ? [0, 82, 204, 255] : [255, 255, 255, 255]
}

writeFileSync('public/icon-192.png', png(192, (x, y, size) => paint(x, y, size, false)))
writeFileSync('public/icon-512.png', png(512, (x, y, size) => paint(x, y, size, false)))
writeFileSync('public/icon-512-maskable.png', png(512, (x, y, size) => paint(x, y, size, true)))
console.log('painted roof marks')

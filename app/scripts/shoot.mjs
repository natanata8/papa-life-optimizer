import { mkdir, writeFile } from 'node:fs/promises'
import { deflateSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const base = process.env.SHOOT_URL || 'http://127.0.0.1:5173'
const out = process.env.SHOOT_OUT || join(dirname(fileURLToPath(import.meta.url)), '../screenshots')

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })

async function shot(name) {
  await mkdir(out, { recursive: true })
  const file = join(out, `${name}.png`)
  await page.screenshot({ path: file, fullPage: false })
  console.log(file)
}

async function clickText(text) {
  const clicked = await page.evaluate((label) => {
    const el = [...document.querySelectorAll('button, a')].find((node) => node.textContent?.includes(label))
    if (!el) return false
    el.click()
    return true
  }, text)
  if (!clicked) throw new Error(`button not found: ${text}`)
}

async function waitText(text) {
  await page.waitForFunction((label) => document.body.innerText.includes(label), { timeout: 8000 }, text)
}

try {
  await page.goto(base, { waitUntil: 'networkidle0' })
  await page.evaluate(() => {
    localStorage.clear()
  })
  await page.reload({ waitUntil: 'networkidle0' })
  await page.waitForSelector('[data-testid="ob-start"]')
  await shot('01-onboarding')

  await page.click('[data-testid="ob-start"]')
  await page.click('[data-testid="count-2"]')
  await page.click('[data-age="0:4歳"]')
  await page.click('[data-age="1:1歳"]')
  await page.click('[data-testid="ob-next"]')
  await clickText('両方フルタイム')
  await clickText('土日')
  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')].filter((node) => node.textContent?.trim() === 'シフト制')
    buttons[1]?.click()
  })
  await page.click('[data-testid="ob-next"]')
  await clickText('19〜20時')
  await page.click('[data-testid="ob-next"]')
  await clickText('今はない')
  await page.waitForSelector('[data-testid="nav-profile"]')

  await page.click('[data-testid="nav-profile"]')
  await waitText('園・学校')
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('div')].filter((node) => node.textContent?.startsWith('園・学校'))
    const card = cards.at(-1)
    card?.querySelectorAll('button').forEach((button) => {
      if (button.textContent?.trim() === '保育園') button.click()
    })
  })
  for (const id of ['gomi-可燃-1', 'gomi-可燃-4', 'gomi-プラ-3', 'gomi-資源-5', 'shop-6']) {
    await page.click(`[data-testid="${id}"]`)
  }

  await page.click('[data-testid="nav-home"]')
  await waitText('帰宅前にできる一手')
  await shot('02-home-before')
  for (const [mode, file] of [
    ['朝', '03-home-morning'],
    ['昼', '04-home-noon'],
    ['夜', '05-home-night'],
    ['金曜夜', '06-home-friday'],
  ]) {
    await page.click(`[data-testid="mode-${mode}"]`)
    await page.waitForSelector(`[data-testid="mode-${mode}"]`)
    await new Promise((resolve) => setTimeout(resolve, 200))
    await shot(file)
  }
  await page.click('[data-testid="mode-帰宅前"]')

  await page.click('[data-testid="nav-consult"]')
  await page.click('[data-testid="scene-nomi"]')
  await waitText('答えずに進む')
  await clickText('答えずに進む')
  await waitText('いつですか')
  await clickText('明日')
  await waitText('ふだん自分がやっていること')
  await clickText('寝かしつけ')
  await page.waitForSelector('[data-testid="latest-answer"]')
  await page.$eval('[data-testid="latest-answer"]', (el) => el.scrollIntoView({ block: 'start' }))
  await new Promise((resolve) => setTimeout(resolve, 250))
  await shot('07-consult-answer')

  await page.click('[data-testid="nav-cal"]')
  await page.waitForSelector('[data-testid="week-view"]')
  await shot('08-calendar-week')
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((node) => node.textContent?.includes('水') && node.textContent?.includes('28'))
    button?.click()
  })
  await page.waitForSelector('[data-testid="day-view"]')
  await shot('09-calendar-day')
  const inv = await page.$('[data-testid^="inv-"]')
  if (!inv) throw new Error('invisible pill missing')
  await inv.click()
  await page.waitForSelector('[data-testid="sheet-invisible"]')
  await shot('10-invisible-detail')
  await clickText('閉じる')

  await page.click('[data-testid="nav-home"]')
  await page.click('[data-testid="mode-朝"]')
  await waitText('うまくいった')
  await clickText('一覧')
  await page.waitForSelector('[data-testid="review"]')
  await shot('11-review')

  await page.click('[data-testid="nav-profile"]')
  await page.waitForSelector('[data-testid="profile"]')
  await shot('12-profile')

  await page.click('[data-testid="nav-home"]')
  await page.click('[data-testid="mode-帰宅前"]')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForSelector('[data-testid="today-tasks"]')
  await new Promise((resolve) => setTimeout(resolve, 200))
  await shot('13-today-top')
  await page.$eval('[data-testid="today-events"]', (el) => el.scrollIntoView({ block: 'start' }))
  await new Promise((resolve) => setTimeout(resolve, 200))
  await shot('14-today-events')
  await page.waitForSelector('[data-testid="message-preview"]')
  await page.click('[data-testid="message-copy"]')
  await waitText('コピーしました')
  await page.$eval('[data-testid="message-copy"]', (el) => {
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.62))
  })
  await new Promise((resolve) => setTimeout(resolve, 250))
  await shot('15-today-message')
  await page.click('[data-testid="mode-金曜夜"]')
  await page.waitForSelector('[data-testid="weekend-card"]')
  await page.$eval('[data-testid="weekend-card"]', (el) => el.scrollIntoView({ block: 'start' }))
  await new Promise((resolve) => setTimeout(resolve, 200))
  await shot('16-today-weekend')
  await page.click('[data-testid="nav-consult"]')
  const fresh = await page.$('xpath///button[contains(., "新しい相談")]')
  if (fresh) await fresh.click()
  await page.waitForSelector('[data-testid="scene-late"]')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.$eval('[data-testid="scene-late"]', (el) => el.scrollIntoView({ block: 'center' }))
  await new Promise((resolve) => setTimeout(resolve, 200))
  await shot('17-consult-late')

  await page.click('[data-testid="nav-home"]')
  await page.click('[data-testid="mode-夜"]')
  await page.waitForSelector('[data-testid="bring-reminder"]')
  await page.$eval('[data-testid="bring-reminder"]', (el) => {
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, Math.max(0, top - 220))
  })
  await new Promise((resolve) => setTimeout(resolve, 200))
  await shot('18-today-children')
  await page.click('[data-testid="child-open"]')
  await page.waitForSelector('[data-testid="child-list"]')
  await shot('19-child-list')
  await page.click('[data-testid="child-close"]')
  await page.waitForFunction(() => !document.querySelector('[data-testid="child-list"]'))
  await page.click('[data-testid="nav-cal"]')
  await page.waitForSelector('[data-testid^="child-"]')
  await page.$eval('[data-testid^="child-"]', (el) => el.scrollIntoView({ block: 'center' }))
  await new Promise((resolve) => setTimeout(resolve, 200))
  await shot('20-calendar-children')
  await page.click('[data-testid="nav-home"]')
  await page.waitForSelector('[data-testid="child-open"]')
  await page.$eval('[data-testid="child-open"]', (el) => el.scrollIntoView({ block: 'center' }))
  await page.$eval('[data-testid="child-open"]', (el) => el.click())
  await page.waitForSelector('[data-testid="child-list"]')
  await writePrint('/tmp/tone-print.png')
  const imageInput = await page.$('[data-testid="child-image"]')
  if (!imageInput) throw new Error('image input missing')
  await imageInput.uploadFile('/tmp/tone-print.png')
  await page.waitForSelector('[data-testid="child-preview"]')
  await shot('21-child-upload')
  await page.click('[data-testid="child-read"]')
  await page.waitForSelector('[data-testid="child-confirm"]')
  await shot('22-child-confirm')
  await page.click('[data-testid="child-close"]')
  await page.waitForFunction(() => !document.querySelector('[data-testid="child-confirm"]'))

  await page.click('[data-testid="nav-home"]')
  await page.click('[data-testid="mode-帰宅前"]')
  await page.waitForSelector('[data-testid="quick-clash"]')
  await page.evaluate(() => window.scrollTo(0, 0))
  await new Promise((resolve) => setTimeout(resolve, 200))
  await shot('23-quick-grid')
  await answerQuick('late', ['21時', 'お風呂'], '24-answer-late')
  await answerQuick('nomi', ['明日', 'お風呂'], '25-answer-nomi')
  await answerQuick('clash', ['寝かしつけ'], '26-answer-clash')

  await page.click('[data-testid="nav-consult"]')
  const again = await page.$('xpath///button[contains(., "新しい相談")]')
  if (again) await again.click()
  await page.waitForSelector('input[placeholder*="ひとことでOK"]')
  await page.type('input[placeholder*="ひとことでOK"]', '殴られるのが怖い')
  await clickText('送る')
  await waitText('110')
  console.log('safety hotline shown')
} catch (error) {
  await shot('error').catch(() => {})
  console.error(error)
  process.exitCode = 1
} finally {
  await browser.close()
}

async function clickExact(label) {
  const clicked = await page.evaluate((text) => {
    const el = [...document.querySelectorAll('button')].find((node) => node.textContent?.trim() === text)
    if (!el) return false
    el.click()
    return true
  }, label)
  if (!clicked) throw new Error(`button not found: ${label}`)
}

async function answerQuick(id, options, file) {
  await page.click('[data-testid="nav-home"]')
  await page.waitForSelector(`[data-testid="quick-${id}"]`)
  await page.click(`[data-testid="quick-${id}"]`)
  await page.waitForFunction(() => document.body.innerText.includes('タップで答える'), { timeout: 8000 })
  for (let i = 0; i < 4; i += 1) {
    const skipped = await page.evaluate(() => {
      const el = [...document.querySelectorAll('button')].find((node) => node.textContent?.trim() === '答えずに進む')
      if (!el) return false
      el.click()
      return true
    })
    if (!skipped) break
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  for (const option of options) {
    await page.waitForFunction(
      (label) => [...document.querySelectorAll('button')].some((node) => node.textContent?.trim() === label),
      { timeout: 8000 },
      option,
    )
    await clickExact(option)
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  await page.waitForSelector('[data-testid="latest-answer"]')
  await page.$eval('[data-testid="latest-answer"]', (el) => el.scrollIntoView({ block: 'start' }))
  await new Promise((resolve) => setTimeout(resolve, 300))
  await shot(file)
}

async function writePrint(path) {
  const width = 320
  const height = 180
  const raw = Buffer.alloc((width * 3 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1)
    raw[row] = 0
    for (let x = 0; x < width; x += 1) {
      const index = row + 1 + x * 3
      raw[index] = 248
      raw[index + 1] = 236
      raw[index + 2] = 214
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 2
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
  await writeFile(path, png)
}

function pngChunk(type, data) {
  const name = Buffer.from(type)
  const head = Buffer.alloc(4)
  head.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([name, data])
  const sum = Buffer.alloc(4)
  sum.writeUInt32BE(pngCrc(body), 0)
  return Buffer.concat([head, body, sum])
}

function pngCrc(buf) {
  let crc = ~0
  for (const byte of buf) {
    crc ^= byte
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return ~crc >>> 0
}

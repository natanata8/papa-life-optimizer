const MAX_EDGE = 1280
const JPEG_QUALITY = 0.72

export async function downscaleToJpeg(file: Blob): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('画像を縮小できませんでした')
    context.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('画像を縮小できませんでした'))), 'image/jpeg', JPEG_QUALITY)
    })
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    const chunk = 0x8000
    for (let index = 0; index < bytes.length; index += chunk) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunk))
    }
    return btoa(binary)
  } finally {
    bitmap.close()
  }
}

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() || ''
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() || ''

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset)

function optimizeCloudinaryUrl(url: string): string {
  const marker = '/image/upload/'
  if (!url.includes(marker) || url.includes('/f_auto')) {
    return url
  }
  return url.replace(marker, `${marker}f_auto,q_auto,w_1000,c_limit/`)
}

/**
 * Uploads any image format (JPG, PNG, WEBP, HEIC, etc.) directly to Cloudinary
 * using an unsigned preset and returns an auto-optimized CDN URL.
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary ayarları henüz yapılmamış (.env dosyasını kontrol edin).')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', 'cebeci-products')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  )

  if (!response.ok) {
    let message = 'Fotoğraf yüklenirken bir hata oluştu.'
    try {
      const errorData = await response.json()
      if (errorData?.error?.message) {
        message = `Fotoğraf yüklenemedi: ${errorData.error.message}`
      }
    } catch {
      // ignore json parse errors
    }
    throw new Error(message)
  }

  const data = (await response.json()) as { secure_url?: string }
  if (!data.secure_url) {
    throw new Error('Cloudinary geçerli bir görsel bağlantısı döndürmedi.')
  }

  return optimizeCloudinaryUrl(data.secure_url)
}

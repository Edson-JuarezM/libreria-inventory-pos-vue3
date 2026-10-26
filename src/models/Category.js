export const DEFAULT_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=640&q=80'

export function toCategory(raw) {
  if (!raw) return null

  return {
    id: raw.id,
    name: (raw.name ?? '').trim(),
    slug: raw.slug ?? '',
    image: (raw.image ?? '').trim(),
    productCount: Number(raw.productCount) || 0,
  }
}

export function toCategoryPayload(category) {
  return {
    name: (category?.name ?? '').trim(),
    image: (category?.image ?? '').trim(),
  }
}

export function isValidImageUrl(value) {
  try {
    const url = new URL(String(value).trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateCategory(category) {
  const name = (category?.name ?? '').trim()
  if (!name) return 'El nombre de la categoría es obligatorio.'
  if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres.'
  if (!isValidImageUrl(category?.image)) {
    return 'La URL de la imagen debe comenzar con http:// o https://.'
  }
  return null
}

export function categoryErrorMessage(error, fallback = 'No se pudo completar la operación.') {
  const message = error?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  return message || error?.message || fallback
}

export const Category = {
  toDomain: toCategory,
  toApi: toCategoryPayload,
  validate: validateCategory,
}

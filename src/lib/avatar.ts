import { glass } from '@dicebear/collection'
import { createAvatar } from '@dicebear/core'

export function getAvatarUrl(
  user: { 
    image?: string | null
    name?: string
    email?: string 
  }
): string {
  if (user.image) {
    return user.image
  }

  const seed = user.name || user.email || 'anonymous'
  
  const avatar = createAvatar(glass, {
    seed,
    size: 128,
    radius: 50,
  })
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(avatar.toString())}`
}

export function getInitials(name?: string): string {
  if (!name) return '?'
  
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  
  return name.slice(0, 2).toUpperCase()
}
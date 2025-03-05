/**
 * Generates a default avatar URL based on the user's name
 * @param name User's name
 * @param size Size of the avatar in pixels
 * @returns URL for the default avatar
 */
export function getDefaultAvatar(name: string, size = 128): string {
  // If a name is provided, use the first letter as the placeholder
  if (name && name.length > 0) {
    const initial = name.charAt(0).toUpperCase()
    return `/placeholder.svg?height=${size}&width=${size}&text=${initial}`
  }

  // Default avatar for users without a name
  return `/placeholder.svg?height=${size}&width=${size}&text=U`
}

/**
 * Returns the appropriate avatar URL, falling back to a default if none is provided
 * @param avatarUrl User's avatar URL (if any)
 * @param name User's name (for generating default)
 * @param size Size of the avatar in pixels
 * @returns The appropriate avatar URL
 */
export function getAvatarUrl(avatarUrl: string | undefined | null, name: string, size = 128): string {
  if (avatarUrl && avatarUrl !== "") {
    return avatarUrl
  }

  return getDefaultAvatar(name, size)
}


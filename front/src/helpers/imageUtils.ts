/**
 * Helper functions for handling images in the application
 */

/**
 * Get the appropriate default image URL for a player based on their gender
 * @param genre The player's gender (Masculino, Femenino, or undefined)
 * @returns The URL of the default image
 */
export const getDefaultPlayerImage = (genre?: string): string => {
  if (genre === "Masculino") {
    return "/default-avatar.webp";
  } else if (genre === "Femenino") {
    return "/default-avatar.webp";
  } else {
    return "/default-avatar.webp";
  }
}; 
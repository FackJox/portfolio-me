/**
 * Layout constants specific to Contents components
 */

// Spacing constants
export const SPACING = {
  STACK_HEIGHT_FACTOR: 0.4, // Factor used to determine the height of the stacked skills relative to viewport height
  COLUMN_OFFSET_DIVISOR: 75, // Divisor used to calculate horizontal offset between creative and engineering columns
  FIXED_SKILL_SPACING_LANDSCAPE: 1, // Fixed vertical spacing between skills in landscape mode
  FIXED_SKILL_SPACING_PORTRAIT: 1.4, // Fixed vertical spacing between skills in portrait mode
  EXPLOSION_RADIUS_MULTIPLIER: 1.5, // Multiplier for explosion radius relative to viewport dimensions
}

// Position constants
export const POSITION = {
  DEFAULT_Z: -5, // Default z-index for positioning skills in 3D space
  HOVER_DETECTOR: -5.5, // Z-position of the hover detection plane
  MAIN_GROUP: 4, // Z-position of the main content group
  CONTENT_GROUP: -5, // Z-position of the secondary content group for landscape mode
  PORTRAIT_CONTENT_GROUP: -10, // Z-position of the secondary content group for portrait mode
  CAROUSEL: 6.75, // Z-position of the carousel elements
}

// Text layout constants
export const TEXT = {
  SIZE: {
    ENGINEERING: 0.5, // Text size for engineering-related content
    CREATIVE: 0.6, // Slightly larger text size for creative content
  },
  LETTER_SPACING: {
    ENGINEERING: -0.06, // Tighter letter spacing for engineering text
    CREATIVE: 0, // Normal letter spacing for creative text
  },
  CURVE_SEGMENTS: 12, // Number of segments used when rendering curved text
  VERTICAL_OFFSET: 0.15, // Vertical positioning offset for text elements
}

// Viewport-related constants
export const VIEWPORT = {
  MAIN_DIVIDER: 35, // Primary division of viewport space (in percent or units)
  COLUMN_DIVIDER: 50, // Column division ratio for layout (in percent or units)
}

// Export all layout constants as a group for backward compatibility
export const LAYOUT = {
  SPACING,
  POSITION,
  TEXT,
  VIEWPORT,
} 
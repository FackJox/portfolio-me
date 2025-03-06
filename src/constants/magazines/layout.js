/**
 * Layout constants specific to Magazine components
 */

// Spacing constants
export const SPACING = {
  PORTRAIT: {
    MAGAZINE: 2.5, // Spacing between magazines in portrait mode
    TOTAL: 7.5, // Total spacing (magazine * 3)
    Z_OFFSET: 2.5, // z-offset for middle magazine
    PAGE_OPEN_OFFSET: 0.65, // x-offset when page is open
  },
  LANDSCAPE: {
    MAGAZINE: 2, // Spacing between magazines in landscape mode
    TOTAL: 6, // Total spacing (magazine * 3)
    Z_OFFSET: 2.5, // z-offset for hover effect
  },
}

// Position constants
export const POSITION = {
  PORTRAIT: {
    X: -0.65, // Default x position in portrait mode
    Y: 0, // Default y position in portrait mode
    Z: 3.5, // Default z position in portrait mode
  },
  LANDSCAPE: {
    ENGINEER: {
      X: -2.5, // Engineer magazine x position
      Y: 0.3, // Engineer magazine y position (slightly raised)
      Z: 4.5, // Engineer magazine z position
    },
    VAGUE: {
      X: -0.5, // Vague magazine x position (center)
      Y: 0.3, // Vague magazine y position
      Z: 4.5, // Vague magazine z position
    },
    SMACK: {
      X: 1.5, // Smack magazine x position
      Y: 0.3, // Smack magazine y position (slightly lowered)
      Z: 4.5, // Smack magazine z position
    },
    BUTTON: {
      X: 0.65, // Button x position
      Y: -1.05, // Button y position
      Z: 0, // Button z position
      HOVER: {
        Y: -1.2, // Button y position when hovered
        Z: 4, // Button z position when hovered (forward)
      },
    },
  },
}

// Camera constants
export const CAMERA = {
  PORTRAIT: {
    Z_DISTANCE: 2.8, // Camera z distance in portrait mode
    X_OFFSET: -0.003, // Camera x offset in portrait mode
  },
  LANDSCAPE: {
    Z_DISTANCE: 2.7, // Camera z distance in landscape mode
    X_OFFSET: -0.15, // Camera x offset in landscape mode
  },
}

// Size constants
export const SIZE = {
  PORTRAIT: {
    WIDTH: 3, // Magazine width in portrait mode
    VIEW_OFFSET: 3.8, // Divisor for page view offset in portrait mode
  },
  LANDSCAPE: {
    WIDTH: 3, // Magazine width in landscape mode
    VIEW_OFFSET: 3.8, // Divisor for page view offset in landscape mode
  },
}

// Offset constants
export const OFFSET = {
  LANDSCAPE: {
    DRAG: 1, // Position offset during drag in landscape mode
    PAGE: 1, // Position offset when page is open in landscape mode
  },
}

// Export all layout constants as a group
export const LAYOUT = {
  SPACING,
  POSITION,
  CAMERA,
  SIZE,
  OFFSET,
} 
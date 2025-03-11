/**
 * Layout constants specific to Magazine components
 */

// Spacing constants for portrait and landscape modes
export const SPACING = {
  PORTRAIT: {
    MAGAZINE: 2.5,              // Spacing between magazines in portrait mode
    TOTAL: 7.5,                 // Total spacing (magazine * 3)
    Z_OFFSET: 2.5,              // Z-offset for middle magazine
    PAGE_OPEN_OFFSET: 0.65,     // X-offset when page is open
  },
  LANDSCAPE: {
    MAGAZINE: 2,                // Spacing between magazines in landscape mode
    TOTAL: 6,                   // Total spacing (magazine * 3)
    Z_OFFSET: 2.5,              // Z-offset for hover effect
    DRAG_OFFSET: 1,             // Offset applied during drag
    PAGE_OFFSET: 1,             // Offset applied when page is open
  },
}

// Position constants
export const POSITION = {
  PORTRAIT: {
    X: -0.65,                   // Base X position in portrait mode
    Y: 0,                       // Base Y position in portrait mode
    Z: 3.5,                     // Base Z position in portrait mode
  },
  LANDSCAPE: {
    ENGINEER: {
      X: -2.5,                  // X position for Engineer magazine
      Y: 0.3,                   // Y position for Engineer magazine (slightly raised)
      Z: 4.5,                   // Z position for Engineer magazine
    },
    VAGUE: {
      X: -0.5,                  // X position for Vague magazine
      Y: 0.3,                   // Y position for Vague magazine (center)
      Z: 4.5,                   // Z position for Vague magazine
    },
    SMACK: {
      X: 1.5,                   // X position for Smack magazine
      Y: 0.3,                   // Y position for Smack magazine
      Z: 4.5,                   // Z position for Smack magazine
    },
    BUTTON: {
      X: 0.65,                  // X position for buttons
      Y: -1.05,                 // Y position for buttons
      Z: 0,                     // Z position for buttons
    },
  },
}

// Camera position constants
export const CAMERA = {
  PORTRAIT: {
    Z_DISTANCE: 2.8,            // Distance from camera in portrait mode
    X_OFFSET: -0.003,           // X offset from camera center in portrait mode
  },
  LANDSCAPE: {
    Z_DISTANCE: 2.7,            // Distance from camera in landscape mode
    X_OFFSET: -0.15,            // X offset from camera center in landscape mode
  },
}

// Hover offsets
export const HOVER = {
  LANDSCAPE: {
    ENGINEER: { X: 1 },         // Move right when Engineer magazine hovered
    SMACK: { X: -1 },           // Move left when Smack magazine hovered
    BUTTON: {
      Y: -1.2,                  // Y position for buttons when hovered
      Z: 4,                     // Z position for buttons when hovered
    },
  },
}

// Geometry constants
export const GEOMETRY = {
  PORTRAIT: {
    WIDTH: 3,                   // Width in portrait mode
    VIEW_OFFSET: 3.8,           // Divisor for page view offset in portrait
  },
  LANDSCAPE: {
    WIDTH: 3,                   // Width in landscape mode
    VIEW_OFFSET: 3.8,           // Divisor for page view offset in landscape
  },
}

// Magazine order constants
export const ORDER = {
  DEFAULT: ['engineer', 'vague', 'smack'], // Default order of magazines
}

// Export all layout constants as a group
export const LAYOUT = {
  SPACING,
  POSITION,
  CAMERA,
  HOVER,
  GEOMETRY,
  ORDER,
}
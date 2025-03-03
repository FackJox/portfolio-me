// Animation Constants - Controls all animation behaviors in the canvas
export const ANIMATION = {
  SCALE: {
    HOVER: 1.1,      // Scale factor when elements are hovered (10% increase)
    HOVER_LARGE: 1.2, // Larger scale factor for emphasized hover effects (20% increase)
    DEFAULT: 1.0,    // Default/normal scale with no effects applied
  },
  HEIGHT: {
    MIN: 0.01,       // Minimum height value for animated elements
    MAX: 0.1,        // Maximum height value for animated elements
  },
  LERP: {            // Linear interpolation factors for smooth transitions
    SCALE: 0.2,      // Controls how quickly scale animations occur
    POSITION: {
      NORMAL: 0.1,   // Standard position transition speed
      SLOW: 0.05,    // Slower position transition for subtle movements
      X_AXIS: 0.03,  // Very slow horizontal movement for gentle effects
    },
    HEIGHT: {
      INCREASING: 0.1,  // Speed when height is increasing
      DECREASING: 0.02, // Slower speed when height is decreasing (for smoother falloff)
    },
  },
  THRESHOLD: {
    BOTTOM_PROXIMITY: 0.5, // Distance threshold to detect proximity to bottom
    POSITION_CHANGE: 0.001, // Minimum position change to trigger updates
  },
  DELAY: {
    HOVER: 100,      // Millisecond delay before hover animations begin
    INITIAL: 500,    // Millisecond delay for initial animations on load
  },
}

// Layout Constants - Defines positioning, sizing and structural arrangement
export const LAYOUT = {
  TEXT: {
    SIZE: {
      ENGINEERING: 0.5, // Text size for engineering-related content
      CREATIVE: 0.6,    // Slightly larger text size for creative content
    },
    LETTER_SPACING: {
      ENGINEERING: -0.06, // Tighter letter spacing for engineering text
      CREATIVE: 0,        // Normal letter spacing for creative text
    },
    CURVE_SEGMENTS: 12,   // Number of segments used when rendering curved text
    VERTICAL_OFFSET: 0.15, // Vertical positioning offset for text elements
  },
  VIEWPORT: {
    MAIN_DIVIDER: 35,     // Primary division of viewport space (in percent or units)
    COLUMN_DIVIDER: 50,   // Column division ratio for layout (in percent or units)
  },
  POSITION: {
    HOVER_DETECTOR: -5.5, // Z-position of the hover detection plane
    MAIN_GROUP: 4,        // Z-position of the main content group
    CONTENT_GROUP: -3,    // Z-position of the secondary content group
    CAROUSEL: 6.75,          // Z-position of the carousel elements
  },
}

// Color Constants - Defines the color palette used throughout the canvas
export const COLORS = {
  DEFAULT: '#F4EEDC',    // Default/base color (cream/off-white)
  HOVER: {
    ENGINEERING: '#FFB79C', // Coral/peach color for engineering elements on hover
    CREATIVE: '#FABE7F',    // Orange/amber color for creative elements on hover
  },
}
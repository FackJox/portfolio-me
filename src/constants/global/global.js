/**
 * Global application constants
 */

// Device and Viewport constants
export const VIEWPORT = {
  MAIN_DIVIDER: 35, // Primary division of viewport space
  COLUMN_DIVIDER: 50, // Column division ratio for layout
}

// Animation constants (shared/global)
export const ANIMATION = {
  SCALE: {
    HOVER: 1.1,      // Scale factor when elements are hovered (10% increase)
    HOVER_LARGE: 1.2, // Larger scale factor for emphasized hover effects (20% increase)
    DEFAULT: 1.0,    // Default/normal scale with no effects applied
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
  DURATION: {
    DEFAULT: 400,    // Default animation duration (ms)
    TRANSITION: 400, // Standard transition duration 
    BACKGROUND: 400, // Background color transition duration
  }
}

// Position constants
export const POSITION = {
  HOVER_DETECTOR: -5.5, // Z-position of the hover detection plane
  MAIN_GROUP: 4,        // Z-position of the main content group
  CONTENT_GROUP: -5,    // Z-position of the secondary content group for landscape mode
  PORTRAIT_CONTENT_GROUP: -10,  // Z-position of the secondary content group for portrait mode
  CAROUSEL: 6.75,       // Z-position of the carousel elements
}

// Layout constants for contents and magazines
export const LAYOUT = {
  STACK_HEIGHT_FACTOR: 0.4,   // Factor used to determine stack height relative to viewport
  COLUMN_OFFSET_DIVISOR: 75,  // Divisor to calculate horizontal column offsets
  DEFAULT_Z: -5,              // Default z-index for positioning skills
  STAGGER_DELAY: {
    STACK: 100,               // Delay between skill animations in stack
    EXPLOSION: 50,            // Delay between skill animations during explosion
  },
  EXPLOSION_RADIUS_MULTIPLIER: 1.5, // Multiplier for explosion radius
  SKILL_SPACING: {
    LANDSCAPE: 1,             // Vertical spacing between skills in landscape mode
    PORTRAIT: 1.4,            // Vertical spacing between skills in portrait mode
  }
}

// Color constants
export const COLORS = {
  DEFAULT: '#F4EEDC',    // Default/base color (cream/off-white)
  HOVER: {
    ENGINEERING: '#FFB79C', // Coral/peach color for engineering elements on hover
    CREATIVE: '#FABE7F',    // Orange/amber color for creative elements on hover
  },
  BACKGROUND: {
    SMACK: '#0E0504',
    VAGUE: '#2C272F',
    ENGINEER: '#200B5F'
  }
}
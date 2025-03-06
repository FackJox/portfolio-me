/**
 * Global application constants
 */

// Device and Viewport constants
export const VIEWPORT = {
  MAIN_DIVIDER: 35, // Primary division of viewport space from Constants.js
  COLUMN_DIVIDER: 50, // Column division ratio for layout from Constants.js
}

// Animation constants (shared/global)
export const ANIMATION = {
  DURATION: {
    DEFAULT: 1000,
    HOVER: 100,      // Millisecond delay before hover animations begin
    INITIAL: 500,    // Millisecond delay for initial animations on load
    BACKGROUND: 400, // Duration for background transitions
  },
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
    },
  },
}

// Color constants used across the application
export const COLORS = {
  DEFAULT: '#F4EEDC',    // Default/base color (cream/off-white)
  BACKGROUND: {
    SMACK: '#0E0504',
    VAGUE: '#2C272F',
    ENGINEER: '#200B5F'
  },
}

// Gesture recognition constants
export const GESTURE = {
  TAP: {
    MAX_DURATION: 150, // ms
    MAX_MOVEMENT: 10,  // pixels
  },
  SWIPE: {
    MIN_MOVEMENT: 5,   // pixels
    PAGE_THRESHOLD: 50, // pixels for page turn
  },
  DRAG: {
    THRESHOLD: 5,      // minimum movement to trigger drag
    SENSITIVITY: 0.01, // multiplier for drag movement
  },
}

// Layout and positioning constants
export const LAYOUT = {
  POSITION: {
    HOVER_DETECTOR: -5.5, // Z-position of the hover detection plane
    MAIN_GROUP: 4,        // Z-position of the main content group
  },
} 
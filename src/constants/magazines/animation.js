/**
 * Animation constants specific to Magazine components
 */

// Timing constants
export const TIMING = {
  FOCUS_DEBOUNCE: 500, // ms to wait after carousel move before allowing focus
  PAGE_TURN_THRESHOLD: 50, // pixels for page turn
  CAROUSEL_MOVE_THRESHOLD: 20, // pixels for carousel movement
  HOVER_DELAY: 0, // Delay before hover animation starts
  DURATION: 0.3, // Standard duration for animations
  STAGGER: 0.1, // Stagger delay between sequential animations
  LERP_FACTOR: 0.1, // Lerp factor for smooth transitions
}

// Float animation constants
export const FLOAT = {
  INTENSITY: 0.5, // Float movement intensity
  SPEED: 0.7, // Float animation speed
  ROTATION_INTENSITY: 2, // Rotation intensity during float
}

// Linear interpolation factors
export const LERP = {
  BUTTON: {
    TEXT: 0.1, // Text transition speed
    COLOR: 0.1, // Color transition speed
    POSITION: 0.1, // Button position transition speed
  },
  PAGE_VIEW: 0.03, // Page view transition speed
  CAROUSEL: 0.1, // Carousel movement transition speed
  POSITION: 0.03, // General position transition speed
}

// Thresholds for animation triggers
export const THRESHOLD = {
  MIDDLE_MAGAZINE: 0.3, // Threshold for determining middle magazine
  WRAP_MAGAZINE: 1.5, // Threshold for wrapping magazines
  DRAG: 5, // Minimum movement to trigger drag
  SWIPE_MIN_MOVEMENT: 5, // Minimum movement to trigger swipe
}

// Position offsets
export const OFFSET = {
  PORTRAIT: {
    PAGE_OPEN: 0.65, // x-offset when page is open in portrait mode
    Z_MIDDLE: 2.5, // z-offset for middle magazine in portrait
  },
  LANDSCAPE: {
    HOVER: {
      ENGINEER: { X: 1 }, // Move right when engineer magazine hovered
      SMACK: { X: -1 }, // Move left when smack magazine hovered
    },
    DRAG: 1, // Position offset during drag
    PAGE: 1, // Position offset when page is open
  },
}

// Spring animation configurations
export const SPRING = {
  STIFFNESS: {
    NORMAL: 150,
    HIGH: 200,
  },
  DAMPING: {
    NORMAL: 20,
    HIGH: 25,
  },
}

// Animation durations
export const DURATION = {
  TRANSITION: 0.4, // Standard transition duration
  BACKGROUND: 0.4, // Background transition duration
}

// Easing functions
export const EASING = {
  BACKGROUND: 'easeInOut', // Background transition easing
}

// Export all animation constants as a group
export const ANIMATION = {
  TIMING,
  FLOAT,
  LERP,
  THRESHOLD,
  OFFSET,
  SPRING,
  DURATION,
  EASING,
} 
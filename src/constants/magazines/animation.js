/**
 * Animation constants specific to Magazine components
 */

// Timing constants
export const TIMING = {
  CAROUSEL_DEBOUNCE: 500,        // ms to wait after carousel move before allowing focus
  TRANSITION_DURATION: 400,      // ms duration for background transitions
  TAP_MAX_DURATION: 150,         // ms maximum duration for tap detection
}

// Linear interpolation (Lerp) constants
export const LERP = {
  BUTTON: {
    TEXT: 0.1,                   // Speed of button text transitions
    COLOR: 0.1,                  // Speed of button color transitions
  },
  PAGE_VIEW: 0.03,               // Speed of page view transitions
  CAROUSEL: 0.1,                 // Speed of carousel movement transitions
}

// Float animation constants
export const FLOAT = {
  INTENSITY: 0.5,                // Intensity of floating animation
  SPEED: 0.7,                    // Speed of floating animation
  ROTATION_INTENSITY: 2,         // Intensity of rotation in floating animation
}

// Threshold constants
export const THRESHOLD = {
  DRAG: 5,                       // Minimum movement to trigger drag
  SWIPE: {
    MIN_MOVEMENT: 5,             // Minimum pixels for swipe detection
    PAGE_TURN: 50,               // Pixels required for page turn
    CAROUSEL: 20,                // Pixels required for carousel movement
  },
  TAP: {
    MAX_MOVEMENT: 10,            // Maximum pixels movement for tap detection
  },
  CAROUSEL: {
    MIDDLE: 0.3,                 // Threshold for determining middle magazine
    WRAP: 1.5,                   // Threshold for wrapping magazines
  },
}

// Sensitivity constants
export const SENSITIVITY = {
  DRAG: 0.01,                    // Multiplier for drag movement
}

// Background transition constants
export const BACKGROUND = {
  DURATION: 0.4,                 // Duration of background color transitions
  EASE: 'easeInOut',             // Easing function for background transitions
  COLORS: {
    SMACK: '#0E0504',            // Background color for Smack magazine
    VAGUE: '#2C272F',            // Background color for Vague magazine
    ENGINEER: '#200B5F',         // Background color for Engineer magazine
  },
}

// Export all animation constants as a group
export const ANIMATION = {
  TIMING,
  LERP,
  FLOAT,
  THRESHOLD,
  SENSITIVITY,
  BACKGROUND,
}
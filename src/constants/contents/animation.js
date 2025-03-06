/**
 * Animation constants specific to Contents components
 */

// Timing constants
export const TIMING = {
  STAGGER_DELAY_STACK: 100, // Delay (ms) between each skill animation in stack layout
  EXPLOSION_STAGGER_DELAY: 50, // Delay (ms) between each skill animation during explosion effect
  HOVER: 100, // Millisecond delay before hover animations begin
  INITIAL: 500, // Millisecond delay for initial animations on load
}

// Scale constants
export const SCALE = {
  DEFAULT: 1.0, // Default/normal scale with no effects applied
  HOVER: 1.1, // Scale factor when elements are hovered (10% increase)
  HOVER_LARGE: 1.2, // Larger scale factor for emphasized hover effects (20% increase)
}

// Height constants
export const HEIGHT = {
  MIN: 0.01, // Minimum height value for animated elements
  MAX: 0.1, // Maximum height value for animated elements
}

// Animation thresholds
export const THRESHOLD = {
  BOTTOM_PROXIMITY: 0.5, // Distance threshold to detect proximity to bottom
  POSITION_CHANGE: 0.001, // Minimum position change to trigger updates
}

// Spacing constants
export const SPACING = {
  STACK_HEIGHT_FACTOR: 0.4, // Factor determining height of stacked skills relative to viewport
  COLUMN_OFFSET_DIVISOR: 75, // Divisor for horizontal offset between columns
  EXPLOSION_RADIUS_MULTIPLIER: 1.5, // Multiplier for explosion radius relative to viewport
  FIXED_SKILL_SPACING_LANDSCAPE: 1, // Fixed vertical spacing between skills in landscape mode
  FIXED_SKILL_SPACING_PORTRAIT: 1.4, // Fixed vertical spacing between skills in portrait mode
}

// Lerp speeds
export const LERP = {
  SCALE: 0.2, // Controls how quickly scale animations occur
  POSITION: {
    NORMAL: 0.1, // Standard position transition speed
    SLOW: 0.05, // Slower position transition for subtle movements
    X_AXIS: 0.03, // Very slow horizontal movement for gentle effects
  },
  HEIGHT: {
    INCREASING: 0.1, // Speed when height is increasing
    DECREASING: 0.02, // Slower speed when height is decreasing (for smoother falloff)
  },
}

// Export all animation constants as a group for backward compatibility
export const ANIMATION = {
  TIMING,
  SCALE,
  HEIGHT,
  THRESHOLD,
  SPACING,
  LERP,
} 
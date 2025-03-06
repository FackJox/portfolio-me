/**
 * Global animation utility functions
 */

import * as THREE from 'three'

/**
 * Performs linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export const lerp = (start, end, t) => {
  return start * (1 - t) + end * t
}

/**
 * Performs linear interpolation between two THREE.Vector3 objects
 * @param {THREE.Vector3} current - Current vector to modify
 * @param {THREE.Vector3} target - Target vector
 * @param {number} lerpFactor - Interpolation factor (0-1)
 * @returns {THREE.Vector3} Modified current vector
 */
export const lerpVector3 = (current, target, lerpFactor) => {
  current.lerp(target, lerpFactor)
  return current
}

/**
 * Easing function - ease in out cubic
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Easing function - ease out quad
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export const easeOutQuad = (t) => {
  return 1 - (1 - t) * (1 - t)
}

/**
 * Easing function - ease in quad
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export const easeInQuad = (t) => {
  return t * t
}

/**
 * Performs linear interpolation with different speeds for different axes
 * @param {THREE.Vector3} current - Current vector to modify
 * @param {THREE.Vector3} target - Target vector
 * @param {number} xSpeed - Interpolation factor for x axis
 * @param {number} normalSpeed - Interpolation factor for y and z axes
 * @param {boolean} [isNearBottom=false] - Whether position is near bottom threshold
 * @returns {THREE.Vector3} Modified current vector
 */
export const lerpVectorWithDifferentSpeeds = (current, target, xSpeed, normalSpeed, isNearBottom = false) => {
  if (!isNearBottom) {
    current.x = THREE.MathUtils.lerp(current.x, target.x, xSpeed)
  } else {
    current.x = target.x
  }
  current.y = THREE.MathUtils.lerp(current.y, target.y, normalSpeed)
  current.z = THREE.MathUtils.lerp(current.z, target.z, normalSpeed)
  
  return current
}

/**
 * Creates a spring animation configuration object
 * @param {number} stiffness - Spring stiffness factor 
 * @param {number} damping - Spring damping factor
 * @returns {Object} Spring animation configuration
 */
export const createSpringConfig = (stiffness = 150, damping = 20) => {
  return {
    type: "spring",
    stiffness,
    damping
  }
}

/**
 * Creates a transition configuration object
 * @param {number} duration - Animation duration in seconds
 * @param {string} ease - Easing function name (e.g., 'easeInOut')
 * @param {number} [delay=0] - Delay before animation starts
 * @returns {Object} Transition configuration object
 */
export const createTransitionConfig = (duration = 0.4, ease = 'easeInOut', delay = 0) => {
  return {
    duration,
    ease,
    delay
  }
} 
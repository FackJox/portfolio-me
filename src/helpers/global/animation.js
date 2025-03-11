/**
 * Global animation utility functions
 */

import * as THREE from 'three'

/**
 * Linearly interpolates between two scalar values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export const lerp = (start, end, t) => {
  return THREE.MathUtils.lerp(start, end, t)
}

/**
 * Performs linear interpolation between two vectors
 * @param {THREE.Vector3} current - Vector to modify
 * @param {THREE.Vector3} target - Target vector
 * @param {number} lerpFactor - Interpolation factor (0-1)
 * @returns {THREE.Vector3} Modified vector (same as current)
 */
export const lerpVector = (current, target, lerpFactor) => {
  current.lerp(target, lerpFactor)
  return current
}

/**
 * Clamps a value between a minimum and maximum
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return THREE.MathUtils.clamp(value, min, max)
}

/**
 * Easing function for smooth cubic ease-in-out
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export const easeInOutCubic = (t) => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Easing function for smooth cubic ease-out
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export const easeOutCubic = (t) => {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Easing function for smooth cubic ease-in
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export const easeInCubic = (t) => {
  return t * t * t
}

/**
 * Maps a value from one range to another
 * @param {number} value - Value to map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export const degToRad = (degrees) => {
  return THREE.MathUtils.degToRad(degrees)
}

/**
 * Converts radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export const radToDeg = (radians) => {
  return THREE.MathUtils.radToDeg(radians)
}
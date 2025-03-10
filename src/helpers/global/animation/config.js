/**
 * Animation configuration presets
 */

/**
 * Animation configurations for different viewport modes
 */
export const ANIMATION_CONFIG = {
  portrait: {
    float: {
      intensity: 0.5,
      speed: 0.7,
      rotationIntensity: 2
    },
    lerp: {
      button: {
        text: 0.1,
        color: 0.1
      },
      pageView: 0.03,
      carousel: 0.1
    }
  },
  landscape: {
    float: {
      intensity: 0.5,
      speed: 0.7,
      rotationIntensity: 2
    },
    lerp: {
      button: {
        text: 0.1,
        color: 0.1
      },
      pageView: 0.03,
      carousel: 0.1
    }
  }
};
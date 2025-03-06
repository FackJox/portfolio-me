/**
 * Device detection and viewport utilities
 */

import { useState, useEffect } from 'react'

/**
 * Detects if the device is in portrait orientation
 * @returns {boolean} True if device is in portrait mode
 */
export const isPortraitOrientation = () => {
  if (typeof window === 'undefined') return true // Default to portrait for SSR
  return window.innerWidth < window.innerHeight
}

/**
 * Custom hook to track device orientation and handle orientation changes
 * @param {Object} params Optional parameters for orientation change handling
 * @param {Function} params.onOrientationChange Callback when orientation changes
 * @returns {boolean} True if device is in portrait mode
 */
export const useDeviceOrientation = ({ onOrientationChange } = {}) => {
  const [isPortrait, setIsPortrait] = useState(() => isPortraitOrientation())

  useEffect(() => {
    const handleResize = () => {
      const newIsPortrait = isPortraitOrientation()

      // Only trigger if orientation actually changed
      if (newIsPortrait !== isPortrait) {
        setIsPortrait(newIsPortrait)
        if (onOrientationChange) {
          onOrientationChange(newIsPortrait)
        }
      }
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isPortrait, onOrientationChange])

  return isPortrait
}

/**
 * Get layout configuration based on device orientation
 * @param {boolean} isPortrait Current orientation state
 * @returns {Object} Layout configuration object
 */
export const getLayoutConfig = (isPortrait) => {
  return {
    showTopBar: !isPortrait,
    showHeader: isPortrait,
    showButtons: isPortrait,
    showCTA: isPortrait,
  }
}

/**
 * Gets viewport measurements using window dimensions
 * @returns {Object} Object containing viewport dimensions and aspect ratio
 */
export const getViewportMeasurements = () => ({
  vpWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
  vpHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  aspect: typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1,
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0,
})

/**
 * Custom hook to handle viewport measurements with optimized updates
 * Uses window dimensions for viewport calculations
 * @param {boolean} shouldUpdate Whether to update measurements on resize
 * @returns {Object} Viewport measurements and aspect ratio
 */
export const useViewportMeasurements = (shouldUpdate = false) => {
  // Store initial values in state
  const [initialMeasurements] = useState(() => getViewportMeasurements())
  const [measurements, setMeasurements] = useState(initialMeasurements)

  useEffect(() => {
    if (!shouldUpdate) return

    const handleResize = () => {
      setMeasurements(getViewportMeasurements())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [shouldUpdate])

  return shouldUpdate ? measurements : initialMeasurements
}

/**
 * Gets device type based on viewport width
 * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
 */
export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop' // Default for SSR
  
  const width = window.innerWidth
  
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
} 
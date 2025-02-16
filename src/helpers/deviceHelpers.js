/**
 * Device orientation and responsive layout utilities
 */

import { useState, useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * Custom hook to track device orientation and handle orientation changes
 * @param {Object} params Optional parameters for orientation change handling
 * @param {Function} params.onOrientationChange Callback when orientation changes
 * @returns {boolean} True if device is in portrait mode
 */
export const useDeviceOrientation = ({ onOrientationChange } = {}) => {
  const [isPortrait, setIsPortrait] = useState(() => {
    // Initialize with window check for SSR
    if (typeof window !== 'undefined') {
      return window.innerWidth < window.innerHeight
    }
    return true // Default to portrait for SSR
  })

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const newIsPortrait = windowWidth < windowHeight

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
 * Custom hook to handle viewport measurements with optimized updates
 * Uses window dimensions for viewport calculations
 * @returns {Object} Viewport measurements and aspect ratio
 */
export const useViewportMeasurements = (shouldUpdate = false) => {
  // Store initial values in state
  const [initialMeasurements] = useState(() => ({
    vpWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    vpHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    aspect: typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }))

  const [measurements, setMeasurements] = useState(initialMeasurements)

  useEffect(() => {
    if (!shouldUpdate) return

    const handleResize = () => {
      setMeasurements({
        vpWidth: window.innerWidth,
        vpHeight: window.innerHeight,
        aspect: window.innerWidth / window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [shouldUpdate])

  return shouldUpdate ? measurements : initialMeasurements
}

// Helper function for viewport calculations using window dimensions
export const getViewportMeasurements = () => ({
  vpWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
  vpHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
  aspect: typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 1,
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0,
})

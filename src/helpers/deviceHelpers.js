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
 * Uses R3F's useThree for consistent viewport calculations
 * @returns {Object} Viewport measurements and aspect ratio
 */
export const useViewportMeasurements = (shouldUpdate = false) => {
  const { size, viewport } = useThree()

  // Store initial values in state
  const [initialMeasurements] = useState(() => ({
    vpWidth: viewport.width,
    vpHeight: viewport.height,
    aspect: size.width / size.height,
    width: size.width,
    height: size.height,
  }))

  // Only compute new measurements if shouldUpdate is true
  return useMemo(
    () =>
      shouldUpdate
        ? {
            vpWidth: viewport.width,
            vpHeight: viewport.height,
            aspect: size.width / size.height,
            width: size.width,
            height: size.height,
          }
        : initialMeasurements,
    // Only include dependencies if shouldUpdate is true
    shouldUpdate ? [viewport.width, viewport.height, size.width, size.height] : [],
  )
}

// Create a stable reference for viewport calculations
export const getViewportMeasurements = (viewport, size) => ({
  vpWidth: viewport.width,
  vpHeight: viewport.height,
  aspect: size.width / size.height,
  width: size.width,
  height: size.height,
})

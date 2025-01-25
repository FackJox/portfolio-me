/**
 * Device orientation and responsive layout utilities
 */

import { useState, useEffect } from 'react';

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
      return window.innerWidth < window.innerHeight;
    }
    return true; // Default to portrait for SSR
  });

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const newIsPortrait = windowWidth < windowHeight;
      
      // Only trigger if orientation actually changed
      if (newIsPortrait !== isPortrait) {
        setIsPortrait(newIsPortrait);
        if (onOrientationChange) {
          onOrientationChange(newIsPortrait);
        }
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPortrait, onOrientationChange]);

  return isPortrait;
};

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
  };
}; 
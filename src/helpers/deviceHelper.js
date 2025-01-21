/**
 * Device orientation and responsive layout utilities
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook to track device orientation
 * @returns {boolean} True if device is in portrait mode
 */
export const useDeviceOrientation = () => {
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
      setIsPortrait(windowWidth < windowHeight);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
import { useFrame, useThree } from '@react-three/fiber';
import { useAtom } from 'jotai';
import * as THREE from 'three';
import { useDeviceOrientation } from '@/helpers/deviceHelpers';
import { focusedMagazineAtom } from '@/helpers/atoms';
import { useEffect, useRef } from 'react';

export default function CameraDistanceController() {
  const { camera } = useThree();
  const isPortrait = useDeviceOrientation();
  const [focusedMagazine] = useAtom(focusedMagazineAtom);

  // Track previous focus state to detect transitions
  const prevFocusedRef = useRef(null);

  // Camera distance configuration
  const LANDSCAPE_BASE_DISTANCE = 13 // Base camera distance in landscape mode
  const PORTRAIT_BASE_DISTANCE = 10 // Base camera distance in portrait mode
  const REFERENCE_HEIGHT = 900 // Reference viewport height for calculations

  // Adjustment factors
  const WIDTH_SENSITIVITY = 0.5 // How much camera reacts to width changes (lower = less sensitive)
  const LANDSCAPE_HEIGHT_SENSITIVITY = 0.1 // How much camera reacts to height in landscape (lower = less sensitive)
  const PORTRAIT_HEIGHT_SENSITIVITY = 0.5 // How much camera reacts to height in portrait (lower = less sensitive)

  // Target z-position based on aspect ratio
  const getTargetDistance = () => {
    if (typeof window !== 'undefined') {
      if (camera.aspect > 1) {
        // Landscape: adjust based on both width and height
        // Move closer for wider screens, further for shorter screens
        return LANDSCAPE_BASE_DISTANCE *
          (1 / Math.pow(camera.aspect, WIDTH_SENSITIVITY)) *
          Math.pow((REFERENCE_HEIGHT / window.innerHeight), LANDSCAPE_HEIGHT_SENSITIVITY);
      } else {
        // Portrait: maintain base distance with height adjustment
        return PORTRAIT_BASE_DISTANCE *
          Math.pow((REFERENCE_HEIGHT / window.innerHeight), PORTRAIT_HEIGHT_SENSITIVITY);
      }
    }
    return LANDSCAPE_BASE_DISTANCE;
  };

  // Store the target distance in a ref to avoid recalculating it on every frame
  const targetDistanceRef = useRef(null);

  // Initialize target distance on first render
  useEffect(() => {
    // Set initial target distance based on current state
    if (focusedMagazine) {
      // When a magazine is focused, always use PORTRAIT_BASE_DISTANCE
      // This ensures consistent behavior with magazinePositionHelpers.js
      targetDistanceRef.current = PORTRAIT_BASE_DISTANCE;
      camera.position.z = PORTRAIT_BASE_DISTANCE;
      console.log('Initial load with focused magazine, setting camera position to:', PORTRAIT_BASE_DISTANCE);
    } else {
      // When no magazine is focused, use the appropriate distance based on orientation
      targetDistanceRef.current = isPortrait ? PORTRAIT_BASE_DISTANCE : getTargetDistance();
    }

    // Initialize previous focus state
    prevFocusedRef.current = focusedMagazine;
  }, []);

  // Effect to update target distance when focused magazine or orientation changes
  useEffect(() => {
    // Calculate the appropriate target distance
    if (focusedMagazine) {
      // When a magazine is focused, always use PORTRAIT_BASE_DISTANCE
      // This ensures consistent behavior with magazinePositionHelpers.js
      targetDistanceRef.current = PORTRAIT_BASE_DISTANCE;
      console.log('Magazine focused, setting target distance to:', PORTRAIT_BASE_DISTANCE);

      // If this is the first time loading with a focused magazine (from URL),
      // immediately set the camera position without animation
      if (prevFocusedRef.current === null) {
        console.log('Initial focus from URL, immediately setting camera position to:', PORTRAIT_BASE_DISTANCE);
        camera.position.z = PORTRAIT_BASE_DISTANCE;
      }
    } else {
      // When no magazine is focused, use the appropriate distance based on orientation
      const unfocusedDistance = isPortrait ? PORTRAIT_BASE_DISTANCE : getTargetDistance();
      console.log('Magazine unfocused, setting target distance to:', unfocusedDistance);
      targetDistanceRef.current = unfocusedDistance;
    }

    // Update previous focus state
    prevFocusedRef.current = focusedMagazine;
  }, [focusedMagazine, isPortrait]);

  // Use useFrame for smooth transitions in all cases
  useFrame(() => {
    // If no target distance is set yet, initialize it
    if (targetDistanceRef.current === null) {
      targetDistanceRef.current = focusedMagazine
        ? PORTRAIT_BASE_DISTANCE
        : (isPortrait ? PORTRAIT_BASE_DISTANCE : getTargetDistance());
    }

    // Always use smooth transitions for both focusing and unfocusing
    const lerpFactor = 0.1;

    // Only log significant changes to avoid console spam
    const previousZ = camera.position.z;
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      targetDistanceRef.current,
      lerpFactor
    );

    if (Math.abs(previousZ - camera.position.z) > 0.01) {
      console.log('Camera Z updated:', {
        from: previousZ.toFixed(2),
        to: camera.position.z.toFixed(2),
        target: targetDistanceRef.current.toFixed(2),
        focusedMagazine
      });
    }
  });

  return null;
} 
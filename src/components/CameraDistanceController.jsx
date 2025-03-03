import { useFrame, useThree } from '@react-three/fiber';
import { useAtom } from 'jotai';
import * as THREE from 'three';
import { useDeviceOrientation } from '@/helpers/deviceHelpers';
import { focusedMagazineAtom } from '@/helpers/atoms';

export default function CameraDistanceController() {
  const { camera } = useThree();
  const isPortrait = useDeviceOrientation();
  const [focusedMagazine] = useAtom(focusedMagazineAtom);

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

  useFrame(() => {
    let targetDistance;
    
    // Use fixed distance in portrait mode or when magazine is focused
    if (isPortrait || focusedMagazine) {
      targetDistance = PORTRAIT_BASE_DISTANCE;
    } else {
      targetDistance = getTargetDistance();
    }
    
    // Smoothly interpolate camera z position
    const lerpFactor = 0.1;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetDistance, lerpFactor);
   });

  return null;
} 
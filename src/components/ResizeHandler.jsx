import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { onResize } from '@/helpers/resizeCamera';
import { useDeviceOrientation } from '@/helpers/deviceHelpers';

export default function ResizeHandler() {
  const { camera, gl: renderer } = useThree();
  const isPortrait = useDeviceOrientation();

  useEffect(() => {
    function handleResize() {
      // Pass the current orientation to the resize helper.
      onResize(camera, renderer, isPortrait);
    }
    
    window.addEventListener('resize', handleResize, false);
    // Call it once on mount.
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize, false);
  }, [camera, renderer, isPortrait]);

  return null;
} 
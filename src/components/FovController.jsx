import { useFrame, useThree } from '@react-three/fiber';
import { useAtom } from 'jotai';
import * as THREE from 'three';
import { useDeviceOrientation } from '@/helpers/deviceHelpers';
import { focusedMagazineAtom } from '@/helpers/atoms';

export default function FovController() {
  const { camera } = useThree();
  const isPortrait = useDeviceOrientation();
  const [focusedMagazine] = useAtom(focusedMagazineAtom);

  const BASELINE_FOV = 40;
  const BASELINE_WIDTH = 1200;

  const getDynamicFov = () => {
    if (typeof window !== 'undefined') {
      return BASELINE_FOV * (BASELINE_WIDTH / window.innerWidth);
    }
    return BASELINE_FOV;
  };

  useFrame(() => {
    let targetFov;
    if (isPortrait || focusedMagazine) {
      targetFov = 40;
    } else {
      targetFov = getDynamicFov();
    }
    
    const lerpFactor = 0.1;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, lerpFactor);
    camera.updateProjectionMatrix();
  });

  return null;
} 
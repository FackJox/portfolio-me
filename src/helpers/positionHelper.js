// portfolio-me/src/utils/positionHelper.js
import * as THREE from 'three';

/**
 * Calculates the target position for a magazine based on various states.
 * @param {Object} params - Parameters for position calculation.
 * @param {boolean} params.isPortrait - Whether the layout is in portrait mode.
 * @param {number} params.dragOffset - Current drag offset.
 * @param {string|null} params.focusedMagazine - The currently focused magazine.
 * @param {string} params.magazine - The magazine name.
 * @param {number} params.page - Current page.
 * @param {number} params.delayedPage - Delayed page for animation.
 * @param {Array} params.layoutPosition - Current layout position [offsetX, offsetY, offsetZ].
 * @param {boolean} params.viewingRightPage - Whether viewing the right page.
 * @param {THREE.Camera} params.camera - The current camera object.
 * @returns {THREE.Vector3} The target position vector.
 */
export const calculateMagazineTargetPosition = ({
  isPortrait,
  dragOffset,
  focusedMagazine,
  magazine,
  page,
  delayedPage,
  layoutPosition,
  viewingRightPage,
  camera
}) => {
  const geometryWidth = 3;
  const zDist = 2.6;

  let targetPos = new THREE.Vector3();

  if (focusedMagazine === magazine) {
    // Position the magazine in front of the camera
    targetPos.copy(camera.position);

    const forward = new THREE.Vector3(-0.003, 0.0, -1)
      .applyQuaternion(camera.quaternion)
      .normalize();

    targetPos.addScaledVector(forward, zDist);

    const right = new THREE.Vector3(1, 0, 0)
      .applyQuaternion(camera.quaternion)
      .normalize();

    if (isPortrait) {
      // Portrait mode offset
      const horizontalOffset = viewingRightPage ? -geometryWidth / 4.75 : geometryWidth / 4.75;
      targetPos.addScaledVector(right, horizontalOffset);
    } else {
      // Landscape mode - smooth transition
      const targetOffset = delayedPage < 1 ? -geometryWidth / 4.75 : 0;
      targetPos.addScaledVector(right, targetOffset);
    }

    // Apply layout-specific offset
    if (layoutPosition && layoutPosition.length === 3) {
      const [offsetX, offsetY, offsetZ] = layoutPosition;
      targetPos.add(new THREE.Vector3(-offsetX, -offsetY, -offsetZ));
    }
  } else {
    // Not focused - calculate based on carousel drag offset
    const spacing = 2.2;

    let basePos = new THREE.Vector3();

    switch (magazine) {
      case 'vague':
        basePos.set(
          isPortrait ? -0.65 + (page > 0 ? 0.65 : 0) : -0.5 + (page > 0 ? 0.65 : 0),
          isPortrait ? 2 : 0,
          isPortrait ? 3.5 : 4.5 - (page > 0 ? 1 : 0)
        );
        break;
      case 'smack':
        basePos.set(
          isPortrait ? -0.65 + (page > 0 ? 0.65 : 0) : -2.5 - (dragOffset > 0 ? 1 : 0) + (page > 0 ? 0.65 : 0),
          isPortrait ? -2 : 0,
          isPortrait ? 3.5 : 4.5 - (dragOffset > 0 ? 1 : 0)
        );
        break;
      case 'engineer':
        basePos.set(
          isPortrait ? -0.65 + (page > 0 ? 0.65 : 0) : 1.5 + (dragOffset > 0 ? 1 : 0) + (page > 0 ? 0.65 : 0),
          isPortrait ? 0 : 0,
          isPortrait ? 3.5 : 4.5 - (dragOffset > 0 ? 1 : 0)
        );
        break;
      default:
        basePos.set(0, 0, 0);
    }

    // Adjust based on dragOffset
    if (isPortrait) {
      basePos.y += dragOffset;
    } else {
      basePos.x += dragOffset;
    }

    targetPos.copy(basePos);
  }

  return targetPos;
};

/**
 * Performs linear interpolation between two vectors.
 * @param {THREE.Vector3} current - Current position.
 * @param {THREE.Vector3} target - Target position.
 * @param {number} lerpFactor - Lerp factor.
 * @returns {THREE.Vector3} The new position.
 */
export const performLerp = (current, target, lerpFactor) => {
  current.lerp(target, lerpFactor);
  return current;
};
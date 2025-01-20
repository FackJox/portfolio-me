// portfolio-me/src/utils/positionHelper.js
import * as THREE from 'three';

/**
 * Handles the page viewing state transitions based on swipe direction
 * @param {Object} params - Parameters for state transition
 * @param {number} params.deltaX - Horizontal swipe delta
 * @param {boolean} params.isViewingRightPage - Current right page viewing state
 * @param {number} params.currentPage - Current page number
 * @param {number} params.maxPages - Maximum number of pages
 * @returns {Object} New state { newPage, newViewingRightPage }
 */
export const handlePageViewTransition = ({
  deltaX,
  isViewingRightPage,
  currentPage,
  maxPages
}) => {
  // Going backward (swipe right)
  if (deltaX > 50) {
    if (isViewingRightPage) {
      // If on right page, shift focus to left page
      return { newPage: currentPage, newViewingRightPage: false };
    } else {
      // If on left page and not at the start, turn page backward
      if (currentPage > 0) {
        return { newPage: currentPage - 1, newViewingRightPage: true };
      }
    }
  } 
  // Going forward (swipe left)
  else if (deltaX < -50) {
    if (!isViewingRightPage) {
      // If on left page, shift focus to right page
      return { newPage: currentPage, newViewingRightPage: true };
    } else {
      // If on right page and not at the end, turn page forward
      if (currentPage < maxPages) {
        return { newPage: currentPage + 1, newViewingRightPage: false };
      }
    }
  }

  // No change if conditions aren't met
  return { newPage: currentPage, newViewingRightPage: isViewingRightPage };
};

const logPosition = (prefix, data) => {
  const now = Date.now();
  console.log(`[PositionHelper ${now}] ${prefix}:`, {
    ...data,
    // Ensure arrays are properly stringified
    ...(data.cameraPosition && {
      cameraPosition: Array.from(data.cameraPosition).map(v => v.toFixed(3))
    }),
    ...(data.basePosition && {
      basePosition: Array.from(data.basePosition).map(v => v.toFixed(3))
    }),
    ...(data.finalPosition && {
      finalPosition: Array.from(data.finalPosition).map(v => v.toFixed(3))
    })
  });
};

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

  // Add debug logging for input parameters
  const debugInfo = {
    magazine,
    isFocused: focusedMagazine === magazine,
    isPortrait,
    page,
    cameraPosition: camera.position.toArray(),
    dragOffset,
    viewingRightPage
  };

  if (focusedMagazine === magazine) {
    logPosition(`Calculating focused position for ${magazine}`, debugInfo);

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
      const horizontalOffset = viewingRightPage ? -geometryWidth / 4.75 : geometryWidth / 4.75;
      targetPos.addScaledVector(right, horizontalOffset);
      
      logPosition(`Portrait mode adjustments for ${magazine}`, {
        horizontalOffset,
        finalPosition: targetPos.toArray(),
        viewingRightPage
      });
    } else {
      const targetOffset = delayedPage < 1 ? -geometryWidth / 4.75 : 0;
      targetPos.addScaledVector(right, targetOffset);
      
      logPosition(`Landscape mode adjustments for ${magazine}`, {
        targetOffset,
        finalPosition: targetPos.toArray(),
        delayedPage
      });
    }

    if (layoutPosition && layoutPosition.length === 3) {
      const [offsetX, offsetY, offsetZ] = layoutPosition;
      targetPos.add(new THREE.Vector3(-offsetX, -offsetY, -offsetZ));
      
      logPosition(`Applied layout position for ${magazine}`, {
        layoutOffsets: [offsetX, offsetY, offsetZ],
        finalPosition: targetPos.toArray()
      });
    }
  } else {
    logPosition(`Calculating unfocused position for ${magazine}`, debugInfo);
    
    const basePos = new THREE.Vector3();

    switch (magazine) {
      case 'vague':
        basePos.set(
          isPortrait ? -0.65 + (page > 0 ? 0.65 : 0) : -0.5 + (page > 0 ? 0.65 : 0),
          isPortrait ? 0 : 0,
          isPortrait ? 3.5 : 4.5 - (page > 0 ? 1 : 0)
        );
        break;
      case 'smack':
        basePos.set(
          isPortrait ? -0.65 + (page > 0 ? 0.65 : 0) : 1.5 + (dragOffset > 0 ? 1 : 0) + (page > 0 ? 0.65 : 0),
          isPortrait ? -2 : 0,
          isPortrait ? 3.5 : 4.5 - (dragOffset > 0 ? 1 : 0)
        );
        break;
      case 'engineer':
        basePos.set(
          isPortrait ? -0.65 + (page > 0 ? 0.65 : 0) : -2.5 - (dragOffset > 0 ? 1 : 0) + (page > 0 ? 0.65 : 0),
          isPortrait ? 2 : 0,
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

    logPosition(`Final position for ${magazine}`, {
      basePosition: basePos.toArray(),
      finalPosition: targetPos.toArray(),
      dragOffset,
      isPortrait
    });
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

/**
 * Calculates smooth horizontal transitions for page views.
 * @param {THREE.Vector3} position - Current position vector.
 * @param {THREE.Vector3} right - Right direction vector.
 * @param {number} currentOffset - Current horizontal offset.
 * @param {number} targetOffset - Target horizontal offset.
 * @param {number} lerpFactor - Lerp factor for smooth transition.
 * @returns {number} The new horizontal offset.
 */
export const calculateHorizontalTransition = (position, right, currentOffset, targetOffset, lerpFactor = 0.03) => {

  // Lerp the horizontal offset
  const newOffset = THREE.MathUtils.lerp(currentOffset, targetOffset, lerpFactor);
  
  // Calculate the difference in offset
  const offsetDelta = newOffset - currentOffset;
  


  // Apply the offset change to the position
  position.addScaledVector(right, offsetDelta);
  
  
  return newOffset;
};
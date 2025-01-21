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

/**
 * Calculates the horizontal offset for page viewing transitions
 */
export const calculatePageViewOffset = ({
  position,
  right,
  currentOffset,
  targetOffset,
  isPortrait,
  viewingRightPage,
  page,
  delayedPage,
  lerpFactor = 0.03
}) => {
  const geometryWidth = 3;
  
  // Calculate target horizontal offset based on view mode
  if (isPortrait) {
    targetOffset = viewingRightPage ? -geometryWidth / 4.75 : geometryWidth / 4.75;
  } else {
    targetOffset = delayedPage < 1 ? -geometryWidth / 4.75 : 0;
  }

  // Lerp the horizontal offset
  const newOffset = THREE.MathUtils.lerp(currentOffset, targetOffset, lerpFactor);
  
  // Calculate and apply the offset change
  const offsetDelta = newOffset - currentOffset;
  position.addScaledVector(right, offsetDelta);
  
  return newOffset;
};

/**
 * Calculates the focus position of a magazine relative to the camera
 */
export const calculateFocusPosition = ({
  camera,
  focusedMagazine,
  magazine,
  layoutPosition
}) => {
  const zDist = 2.6;
  let targetPos = new THREE.Vector3();

  if (focusedMagazine === magazine) {
    // Position the magazine in front of the camera
    targetPos.copy(camera.position);

    const forward = new THREE.Vector3(-0.003, 0.0, -1)
      .applyQuaternion(camera.quaternion)
      .normalize();

    targetPos.addScaledVector(forward, zDist);

    // Apply layout position offset if provided
    if (layoutPosition && layoutPosition.length === 3) {
      const [offsetX, offsetY, offsetZ] = layoutPosition;
      targetPos.add(new THREE.Vector3(-offsetX, -offsetY, -offsetZ));
    }
  }

  return targetPos;
};

export const calculateMiddleMagazine = (targetOffset) => {
  const spacing = 2;
  const wrappedOffset = ((targetOffset % (spacing * 3)) + spacing * 4.5) % (spacing * 3) - spacing * 1.5;
  const index = Math.round(wrappedOffset / spacing) % 3;
  const magazineOrder = ['engineer', 'vague', 'smack'];
  const calculatedIndex = (index + 1) % 3;
  return magazineOrder[calculatedIndex];
};

/**
 * Updates magazine position and rotation in the carousel or focused state
 */
export const updateMagazineCarousel = ({
  magazineRef,
  targetPosition,
  camera,
  focusedMagazine,
  magazine,
  isPortrait,
  dragOffset,
  page,
  targetOffsetRef,
  currentMiddleMagazine,
  setMiddleMagazine,
  lerpFactor = 0.1
}) => {
  if (!magazineRef) return;

  // Update dragOffset without lerping for portrait mode
  if (isPortrait && targetOffsetRef) {
    dragOffset = targetOffsetRef.current;
  }

  // Calculate and update middle magazine if needed
  if (isPortrait && setMiddleMagazine && currentMiddleMagazine) {
    const middleMagazine = calculateMiddleMagazine(dragOffset);
    if (middleMagazine !== currentMiddleMagazine) {
      setMiddleMagazine(middleMagazine);
    }
  }

  // Rest of the existing carousel positioning logic
  const spacing = 2;
  let finalPosition = new THREE.Vector3();

  if (focusedMagazine !== magazine) {
    // Calculate carousel position
    const getBaseIndex = (mag) => {
      switch (mag) {
        case 'engineer': return 0;
        case 'vague': return 1;
        case 'smack': return 2;
        default: return 0;
      }
    };

    const baseIndex = getBaseIndex(magazine);
    const normalizedOffset = Math.round(dragOffset / spacing);
    const wrappedIndex = ((baseIndex - normalizedOffset) % 3 + 3) % 3;

    if (isPortrait) {
      // Portrait mode positioning
      const yPositions = [2, 0, -2];
      const yPos = yPositions[wrappedIndex];
      const isWrapping = Math.abs(normalizedOffset - dragOffset / spacing) > 0.1;
      const wrapPos = isWrapping ? (dragOffset > 0 ? -6 : 6) : yPos;
      
      finalPosition.set(
        -0.65 + (page > 0 ? 0.65 : 0),
        wrapPos,
        3.5 + Math.abs(wrapPos) * 0.1
      );
    } else {
      // Landscape mode positioning
      switch (magazine) {
        case 'engineer':
          finalPosition.set(-2.5 - (dragOffset > 0 ? 1 : 0) + (page > 0 ? 0.65 : 0), 0, 4.5 - (dragOffset > 0 ? 1 : 0));
          break;
        case 'vague':
          finalPosition.set(-0.5 + (page > 0 ? 0.65 : 0), 0, 4.5 - (page > 0 ? 1 : 0));
          break;
        case 'smack':
          finalPosition.set(1.5 + (dragOffset > 0 ? 1 : 0) + (page > 0 ? 0.65 : 0), 0, 4.5 - (dragOffset > 0 ? 1 : 0));
          break;
      }
    }

    // Apply final position
    magazineRef.position.lerp(finalPosition, lerpFactor);
  } else {
    // When focused, lerp to target position
    magazineRef.position.lerp(targetPosition, lerpFactor);
  }
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
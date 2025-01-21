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
      return { newPage: currentPage, newViewingRightPage: false };
    } else {
      // If on left page and at page 1, close the magazine
      if (currentPage === 1) {
        return { newPage: 0, newViewingRightPage: false };
      }
      // If on left page and not at the start, turn page backward
      else if (currentPage > 0) {
        return { newPage: currentPage - 1, newViewingRightPage: true };
      }
    }
  } 
  // Going forward (swipe left)
  else if (deltaX < -50) {
    // Check if we're on the last page
    if (currentPage === maxPages - 1 && isViewingRightPage) {
      return { newPage: 0, newViewingRightPage: false };
    }
    if (!isViewingRightPage) {
      return { newPage: currentPage, newViewingRightPage: true };
    } else {
      // If on right page and not at the end, turn page forward
      if (currentPage < maxPages - 1) {
        return { newPage: currentPage + 1, newViewingRightPage: false };
      }
    }
  }

  // No change if conditions aren't met
  return { newPage: currentPage, newViewingRightPage: isViewingRightPage };
};

/**
 * Calculates the horizontal offset for page viewing transitions
 * @param {Object} params - Parameters for offset calculation
 * @param {THREE.Vector3} params.position - Current position vector
 * @param {THREE.Vector3} params.right - Right direction vector
 * @param {number} params.currentOffset - Current horizontal offset
 * @param {number} params.targetOffset - Target horizontal offset
 * @param {boolean} params.isPortrait - Whether the view is in portrait mode
 * @param {boolean} params.viewingRightPage - Whether viewing the right page
 * @param {number} params.page - Current page number
 * @param {number} params.delayedPage - Delayed page number for animations
 * @param {number} [params.lerpFactor=0.03] - Linear interpolation factor
 * @returns {number} The new horizontal offset
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
  
  // If page is 0, we're closing, so don't apply any offset
  if (page === 0) {
    return currentOffset;
  }
  
  // Calculate target horizontal offset based on view mode
  if (isPortrait) {
    targetOffset = viewingRightPage ? -geometryWidth / 3.8 : geometryWidth / 3.8;
  } else {
    targetOffset = delayedPage < 1 ? -geometryWidth / 3.8 : 0;
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
 * @param {Object} params - Parameters for focus position calculation
 * @param {THREE.Camera} params.camera - The camera object
 * @param {string} params.focusedMagazine - Currently focused magazine ID
 * @param {string} params.magazine - Magazine ID to calculate position for
 * @param {number[]} [params.layoutPosition] - Optional layout position offset [x, y, z]
 * @param {boolean} params.isPortrait - Whether the view is in portrait mode
 * @returns {THREE.Vector3} The calculated focus position
 */
export const calculateFocusPosition = ({
  camera,
  focusedMagazine,
  magazine,
  layoutPosition,
  isPortrait
}) => {
  // Different z-distances for portrait and landscape
  const zDist = isPortrait ? 2.8 : 2.7;
  let targetPos = new THREE.Vector3();

  if (focusedMagazine === magazine) {
    // Position the magazine in front of the camera
    targetPos.copy(camera.position);

    const forward = new THREE.Vector3(
      isPortrait ? -0.003 : -0.15, // Different x-offset for portrait/landscape
      0.0,
      -1
    )
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

/**
 * Calculates which magazine should be in the middle position based on carousel offset
 * @param {number} targetOffset - The current carousel offset
 * @param {boolean} isPortrait - Whether the view is in portrait mode
 * @returns {string} The ID of the magazine that should be in the middle ('engineer', 'vague', or 'smack')
 */
export const calculateMiddleMagazine = (targetOffset, isPortrait) => {
  const spacing = isPortrait ? 2.5 : 2;
  const wrappedOffset = ((targetOffset % (spacing * 3)) + spacing * 4.5) % (spacing * 3) - spacing * 1.5;
  const index = Math.round(wrappedOffset / spacing) % 3;
  const magazineOrder = ['engineer', 'vague', 'smack'];
  const calculatedIndex = (index + 1) % 3;
  return magazineOrder[calculatedIndex];
};

/**
 * Updates magazine position and rotation in the carousel or focused state
 * @param {Object} params - Parameters for magazine position update
 * @param {THREE.Object3D} params.magazineRef - Reference to the magazine mesh
 * @param {THREE.Vector3} params.targetPosition - Target position for focused state
 * @param {THREE.Camera} params.camera - The camera object
 * @param {string} params.focusedMagazine - Currently focused magazine ID
 * @param {string} params.magazine - Magazine ID being updated
 * @param {boolean} params.isPortrait - Whether the view is in portrait mode
 * @param {number} params.dragOffset - Current drag offset
 * @param {number} params.page - Current page number
 * @param {React.MutableRefObject} params.targetOffsetRef - Reference to target offset
 * @param {string} params.currentMiddleMagazine - Currently middle magazine ID
 * @param {Function} params.setMiddleMagazine - Function to update middle magazine
 * @param {Function} params.setPage - Function to update page number
 * @param {number} [params.lerpFactor=0.1] - Linear interpolation factor
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
  setPage,
  lerpFactor = 0.1
}) => {
  if (!magazineRef) return;

  // Initialize needsJump ref if it doesn't exist
  if (!magazineRef.needsJump) {
    magazineRef.needsJump = true;
  }

  // Update dragOffset without lerping for portrait mode
  if (isPortrait && targetOffsetRef) {
    dragOffset = targetOffsetRef.current;
  }

  // Calculate and update middle magazine if needed
  if (isPortrait && setMiddleMagazine && currentMiddleMagazine) {
    const middleMagazine = calculateMiddleMagazine(dragOffset, isPortrait);
    if (middleMagazine !== currentMiddleMagazine) {
      setMiddleMagazine(middleMagazine);
    }
  }

  // Automatically open to page 1 when focused in both portrait and landscape modes
  if (focusedMagazine === magazine && setPage && page === 0) {
    setPage(1);
  }

  const spacing = isPortrait ? 2.5 : 2;
  let finalPosition = new THREE.Vector3();

  if (focusedMagazine !== magazine) {
    const getBaseIndex = (mag) => {
      switch (mag) {
        case 'engineer': return 1;
        case 'vague': return 0;
        case 'smack': return 2;
        default: return 0;
      }
    };

    if (isPortrait) {
      // Portrait mode positioning with instant wrapping
      const baseIndex = getBaseIndex(magazine);
      const totalSpacing = spacing * 3;
      const magazineOffset = dragOffset + (baseIndex * spacing);
      
      // Wrap the offset instantly
      const wrapOffset = (offset, total) => {
        return ((offset % total) + total * 1.5) % total - total / 2;
      };
      
      const wrappedOffset = wrapOffset(magazineOffset, totalSpacing);
      
      // Calculate target position exactly as specified
      finalPosition.set(
        -0.65 + (page > 0 ? 0.65 : 0),
        wrappedOffset,
        3.5
      );

      // Bring current middle magazine closer to camera
      if (currentMiddleMagazine === magazine) {
        finalPosition.z -= -2.5;
      }
      
      // Check if we're wrapping around
      const isWrapping = Math.abs(magazineRef.position.y - wrappedOffset) > spacing * 1.5;
      
      if (isWrapping) {
        const currentY = magazineRef.position.y;
        const direction = wrappedOffset > currentY ? 1 : -1;
        
        // If we need to jump, do the initial jump
        if (magazineRef.needsJump) {
          magazineRef.position.set(
            finalPosition.x,
            wrappedOffset + (direction * spacing),
            finalPosition.z
          );
          magazineRef.needsJump = false;
        } else {
          // After jump, interpolate to final position
          magazineRef.position.lerp(finalPosition, lerpFactor);
        }
      } else {
        // Reset needsJump when not wrapping
        magazineRef.needsJump = true;
        // Smooth interpolation for adjacent positions
        magazineRef.position.lerp(finalPosition, lerpFactor);
      }
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
      // Apply lerping only in landscape mode
      magazineRef.position.lerp(finalPosition, lerpFactor);
    }
  } else {
    // When focused, lerp to target position
    magazineRef.position.lerp(targetPosition, lerpFactor);
  }
};

/**
 * Performs linear interpolation between two vectors
 * @param {THREE.Vector3} current - Current position vector
 * @param {THREE.Vector3} target - Target position vector
 * @param {number} lerpFactor - Linear interpolation factor (0-1)
 * @returns {THREE.Vector3} The interpolated position vector
 */
export const performLerp = (current, target, lerpFactor) => {
  current.lerp(target, lerpFactor);
  return current;
};
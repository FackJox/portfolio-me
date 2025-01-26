// portfolio-me/src/utils/positionHelper.js
import * as THREE from 'three';
import { ANIMATION_CONFIG } from './animationConfigs';
import { GESTURE_CONFIG } from './gestureHelper';

// Spacing and positioning configuration
const SPACING_CONFIG = {
  portrait: {
    magazine: 2.5,
    total: 7.5, // magazine * 3
    positions: {
      x: -0.65,
      y: 0,
      z: 3.5,
      zOffset: 2.5, // z-offset for middle magazine
      pageOpenOffset: 0.65 // x-offset when page is open
    },
    camera: {
      zDistance: 2.8,
      xOffset: -0.003
    },
    geometry: {
      width: 3,
      viewOffset: 3.8 // divisor for page view offset
    }
  },
  landscape: {
    magazine: 2,
    total: 6, // magazine * 3
    zOffset: 2.5, // z-offset for hover effect
    positions: {
      engineer: {
        x: -2.5,
        y: 0.3, // Slightly raised
        z: 4.5,
        dragOffset: 1,
        hoverOffset: { x: 1 } // move right when hovered
      },
      vague: {
        x: -0.5,
        y: 0.3, // Center
        z: 4.5,
        pageOffset: 1
      },
      smack: {
        x: 1.5,
        y: 0.3, // Slightly lowered
        z: 4.5,
        dragOffset: 1,
        hoverOffset: { x: -1 } // move left when hovered
      },
      button: {
        x: 0.65,
        y: -1.05,
        z: 0,
        hover: {
          y: -1.2,     // Y position when hovered
          z: 4,        // Forward distance from camera
          lerpSpeed: 0.1 // Speed of position transition
        }
      }
    },
    camera: {
      zDistance: 2.7,
      xOffset: -0.15
    },
    geometry: {
      width: 3,
      viewOffset: 3.8
    }
  }
};

/**
 * Gets the appropriate spacing configuration based on view mode
 * @param {boolean} isPortrait - Whether the view is in portrait mode
 * @returns {Object} The spacing configuration
 */
export const getSpacingConfig = (isPortrait) => {
  return isPortrait ? SPACING_CONFIG.portrait : SPACING_CONFIG.landscape;
};

/**
 * Gets the appropriate animation configuration based on view mode
 * @param {boolean} isPortrait - Whether the view is in portrait mode
 * @returns {Object} The animation configuration
 */
export const getAnimationConfig = (isPortrait) => {
  return isPortrait ? ANIMATION_CONFIG.portrait : ANIMATION_CONFIG.landscape;
};

/**
 * Gets the appropriate gesture configuration based on view mode
 * @param {boolean} isPortrait - Whether the view is in portrait mode
 * @returns {Object} The gesture configuration
 */
export const getGestureConfig = (isPortrait) => {
  return isPortrait ? GESTURE_CONFIG.portrait : GESTURE_CONFIG.landscape;
};

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
  const { magazine: spacing, total: totalSpacing } = getSpacingConfig(isPortrait);
  const wrappedOffset = ((targetOffset % totalSpacing) + spacing * 4.5) % totalSpacing - spacing * 1.5;
  const index = Math.round(wrappedOffset / spacing) % 3;
  const magazineOrder = ['engineer', 'vague', 'smack'];
  const calculatedIndex = (index + 1) % 3;
  return magazineOrder[calculatedIndex];
};

/**
 * Gets the base index for a magazine in the carousel
 * @param {string} magazine - Magazine ID
 * @returns {number} Base index for the magazine
 */
const getBaseIndex = (magazine) => {
  switch (magazine) {
    case 'engineer': return 1;
    case 'vague': return 0;
    case 'smack': return 2;
    default: return 0;
  }
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
}) => {
  if (!magazineRef) return;

  const spacingConfig = getSpacingConfig(isPortrait);
  const animConfig = getAnimationConfig(isPortrait);
  const gestureConfig = getGestureConfig(isPortrait);

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

  const { magazine: spacing, total: totalSpacing } = spacingConfig;
  let finalPosition = new THREE.Vector3();

  if (focusedMagazine !== magazine) {
    if (isPortrait) {
      // Portrait mode positioning with instant wrapping
      const baseIndex = getBaseIndex(magazine);
      const magazineOffset = dragOffset + (baseIndex * spacing);
      
      // Wrap the offset instantly
      const wrapOffset = (offset, total) => {
        return ((offset % total) + total * gestureConfig.interaction.carousel.wrapThreshold) % total - total / 2;
      };
      
      const wrappedOffset = wrapOffset(magazineOffset, totalSpacing);
      
      // Calculate target position exactly as specified
      finalPosition.set(
        spacingConfig.positions.x + (page > 0 ? spacingConfig.positions.pageOpenOffset : 0),
        wrappedOffset,
        spacingConfig.positions.z
      );

      // Bring current middle magazine closer to camera
      if (currentMiddleMagazine === magazine) {
        finalPosition.z += spacingConfig.positions.zOffset;
      }
      
      // Check if we're wrapping around
      const isWrapping = Math.abs(magazineRef.position.y - wrappedOffset) > spacing * gestureConfig.interaction.carousel.wrapThreshold;
      
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
          magazineRef.position.lerp(finalPosition, animConfig.lerp.carousel);
        }
      } else {
        // Reset needsJump when not wrapping
        magazineRef.needsJump = true;
        // Smooth interpolation for adjacent positions
        magazineRef.position.lerp(finalPosition, animConfig.lerp.carousel);
      }
    } else {
      // Landscape mode positioning
      const magazineConfig = spacingConfig.positions[magazine];
      switch (magazine) {
        case 'engineer':
          finalPosition.set(
            magazineConfig.x + (dragOffset > 0 ? magazineConfig.dragOffset : 0) + (page > 0 ? spacingConfig.positions.button.x : 0),
            magazineConfig.y,
            magazineConfig.z - (dragOffset > 0 ? magazineConfig.dragOffset : 0)
          );
          break;
        case 'vague':
          finalPosition.set(
            magazineConfig.x + (page > 0 ? spacingConfig.positions.button.x : 0),
            magazineConfig.y,
            magazineConfig.z - (page > 0 ? magazineConfig.pageOffset : 0)
          );
          break;
        case 'smack':
          finalPosition.set(
            magazineConfig.x + (dragOffset > 0 ? magazineConfig.dragOffset : 0) + (page > 0 ? spacingConfig.positions.button.x : 0),
            magazineConfig.y,
            magazineConfig.z - (dragOffset > 0 ? magazineConfig.dragOffset : 0)
          );
          break;
      }
    }
  } else {
    // When focused, lerp to target position
    finalPosition.copy(targetPosition);
  }

  // Apply position with lerping
  if (magazineRef.position) {
    magazineRef.position.lerp(finalPosition, animConfig.lerp.carousel);
  } else {
    magazineRef.position = finalPosition.clone();
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

/**
 * Gets the button position configuration
 * @param {boolean} isPortrait - Whether the view is in portrait mode
 * @returns {Object|null} Button position or null in portrait mode
 */
export const getButtonPosition = (isPortrait) => {
  return isPortrait ? null : getSpacingConfig(isPortrait).positions.button;
};

/**
 * Calculates the magazine position in landscape mode
 * @param {string} magazine - Magazine ID
 * @param {number} dragOffset - Current drag offset
 * @param {number} page - Current page number
 * @param {boolean} isPortrait - Whether in portrait mode
 * @returns {THREE.Vector3} The calculated position
 */
export const calculateMagazinePosition = (magazine, dragOffset, page, isPortrait) => {
  const position = new THREE.Vector3();
  const config = getSpacingConfig(isPortrait);

  if (isPortrait) {
    position.set(
      config.positions.x + (page > 0 ? config.positions.pageOpenOffset : 0),
      0,
      config.positions.z
    );
  } else {
    const magazineConfig = config.positions[magazine];
    position.set(
      magazineConfig.x + 
        (dragOffset > 0 ? magazineConfig.dragOffset || 0 : 0) + 
        (page > 0 ? config.positions.button.x : 0),
      magazineConfig.y,
      magazineConfig.z - (page > 0 ? magazineConfig.pageOffset || 0 : 0)
    );
  }

  return position;
};

/**
 * Checks if a magazine is in the middle position
 * @param {Object} params - Check parameters
 * @param {THREE.Vector3} params.position - Magazine position
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @returns {boolean} Whether the magazine is in the middle
 */
export const isMiddleMagazine = ({ position, isPortrait }) => {
  const config = getSpacingConfig(isPortrait).interaction.carousel;
  if (isPortrait) {
    return Math.abs(position.y) < config.middleThreshold;
  }
  return Math.abs(position.x) < config.middleThreshold;
};

/**
 * Applies hover effect to magazine position
 * @param {Object} params - Hover parameters
 * @param {THREE.Vector3} params.position - Magazine position
 * @param {boolean} params.isHovered - Whether magazine is hovered
 * @param {string} params.magazine - Magazine ID
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @returns {THREE.Vector3} Updated position with hover effect
 */
export const hoverMagazine = ({ position, isHovered, magazine, isPortrait }) => {
  const spacingConfig = getSpacingConfig(isPortrait);
  const animConfig = getAnimationConfig(isPortrait);
  
  if (!isPortrait) {
    const magazineConfig = spacingConfig.positions[magazine];
    if (magazineConfig) {
      const targetPosition = position.clone();
      
      // Apply z-axis hover effect (moving towards camera)
      targetPosition.z = magazineConfig.z + (isHovered ? spacingConfig.zOffset : 0);
      
      // Apply x-axis hover effect for side magazines
      if (magazineConfig.hoverOffset && isHovered) {
        targetPosition.x = magazineConfig.x + magazineConfig.hoverOffset.x;
      } else {
        targetPosition.x = magazineConfig.x;
      }
      
      performLerp(position, targetPosition, animConfig.lerp.button.text);
    }
  }
  
  return position;
};

/**
 * Calculates and applies Float nullification for focused or hovered elements
 * @param {Object} params - Parameters for Float nullification
 * @param {THREE.Object3D} params.floatRef - Reference to Float component
 * @param {THREE.Object3D} params.nullifyRef - Reference to group that will nullify Float
 * @param {boolean} params.shouldNullify - Whether Float should be nullified
 */
export const applyFloatNullification = ({ floatRef, nullifyRef, shouldNullify }) => {
  if (!floatRef || !nullifyRef) return;

  const floatGroup = floatRef;

  if (shouldNullify) {
    nullifyRef.matrix
      .copy(floatGroup.matrix)
      .invert();
    nullifyRef.matrixAutoUpdate = false;
  } else {
    nullifyRef.matrix.identity();
    nullifyRef.matrixAutoUpdate = true;
  }
};

/**
 * Calculates button position with Float nullification
 * @param {Object} params - Parameters for button positioning
 * @param {THREE.Vector3} params.position - Current position
 * @param {THREE.Camera} params.camera - Camera reference
 * @param {boolean} params.isHovered - Whether element is hovered
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @param {THREE.Object3D} params.floatRef - Reference to Float component
 * @param {THREE.Object3D} params.buttonRef - Reference to button object
 * @param {THREE.Quaternion} params.floatQuaternion - Quaternion for float rotation
 * @param {THREE.Quaternion} params.uprightQuaternion - Upright quaternion reference
 * @returns {void} Updates button position and rotation directly
 */
export const calculateButtonPosition = ({
  position,
  camera,
  isHovered,
  isPortrait,
  floatRef,
  buttonRef,
  floatQuaternion,
  uprightQuaternion
}) => {
  if (isPortrait || !buttonRef) return position.clone(); // Return the current position if in portrait mode

  const config = getSpacingConfig(isPortrait);
  const buttonConfig = config.positions.button;
  const targetPos = new THREE.Vector3();

  if (isHovered) {
    // Calculate centered position at bottom of viewport
    targetPos.copy(camera.position);
    const forward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .normalize();
    targetPos.addScaledVector(forward, buttonConfig.hover.z);
    targetPos.y = buttonConfig.hover.y;

    // Apply Float nullification if needed
    if (floatRef) {
      const floatMatrix = new THREE.Matrix4();
      floatRef.updateWorldMatrix(true, false);
      floatMatrix.copy(floatRef.matrixWorld);
      const floatInverseMatrix = floatMatrix.clone().invert();
      targetPos.applyMatrix4(floatInverseMatrix);
    }
  } else {
    targetPos.set(buttonConfig.x, buttonConfig.y, buttonConfig.z);
  }

  return targetPos;
};
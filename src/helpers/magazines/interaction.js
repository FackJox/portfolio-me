/**
 * Interaction helper functions for Magazine components
 */

// Import necessary constants and dependencies
import { TIMING } from '@/constants/magazines/animation';
import { SPACING } from '@/constants/magazines/layout';
import { THRESHOLD } from '@/constants/magazines/animation';
import * as THREE from 'three';

/**
 * Handles the page viewing state transitions based on swipe direction
 * @param {Object} props - Parameters for the transition
 * @param {number} props.deltaX - Horizontal movement amount
 * @param {boolean} props.isViewingRightPage - Whether currently viewing the right page
 * @param {number} props.currentPage - Current page index
 * @param {number} props.maxPages - Maximum number of pages
 * @returns {Object} Updated page and viewing state
 */
export const handlePageViewTransition = ({ deltaX, isViewingRightPage, currentPage, maxPages }) => {
  const pageThreshold = THRESHOLD.PAGE_TURN_THRESHOLD;
  
  // Going backward (swipe right)
  if (deltaX > pageThreshold) {
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
  else if (deltaX < -pageThreshold) {
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
 * Determines if an interaction should be treated as a tap/click
 * @param {Object} params - Parameters for tap detection
 * @param {number} params.duration - Duration of the interaction in ms
 * @param {number} params.totalMovement - Total movement distance
 * @returns {boolean} Whether the interaction should be treated as a tap
 */
export const isTapInteraction = ({ duration, totalMovement }) => {
  const maxDuration = TIMING.FOCUS_DEBOUNCE / 3; // One third of focus debounce time
  const maxMovement = THRESHOLD.SWIPE_MIN_MOVEMENT * 2; // Twice the minimum swipe movement
  
  return duration < maxDuration && totalMovement < maxMovement;
};

/**
 * Determines if an interaction should be treated as a swipe
 * @param {Object} params - Parameters for swipe detection
 * @param {number} params.deltaX - Horizontal movement
 * @param {number} params.deltaY - Vertical movement
 * @param {boolean} params.isDrag - Whether the interaction is a drag
 * @returns {boolean} Whether the interaction should be treated as a swipe
 */
export const isSwipeInteraction = ({ deltaX, deltaY, isDrag }) => {
  return isDrag && Math.abs(deltaX) > THRESHOLD.SWIPE_MIN_MOVEMENT;
};

/**
 * Checks if it's safe to focus a magazine based on recent carousel movement
 * @param {Object} params - Parameters for focus check
 * @param {string} params.magazine - Magazine being checked
 * @param {string} params.currentMiddleMagazine - Currently middle magazine
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @param {string} params.focusedMagazine - Currently focused magazine
 * @param {Object} params.lastCarouselMove - Information about the last carousel movement
 * @param {number} params.dragDuration - Duration of the drag interaction
 * @param {number} params.totalMovement - Total movement during the interaction
 * @returns {boolean} Whether it's safe to focus the magazine
 */
export const canFocusMagazine = ({
  magazine,
  currentMiddleMagazine,
  isPortrait,
  focusedMagazine,
  lastCarouselMove,
  dragDuration,
  totalMovement,
}) => {
  // Basic validation checks
  if (isPortrait && currentMiddleMagazine !== magazine) {
    return false;
  }

  if (focusedMagazine && focusedMagazine !== magazine) {
    return false;
  }

  // Check for recent carousel movement
  const timeSinceCarouselMove = Date.now() - lastCarouselMove.time;
  const hasRecentCarouselMove = timeSinceCarouselMove < TIMING.FOCUS_DEBOUNCE;

  if (hasRecentCarouselMove) {
    return false;
  }

  // Check if this is a valid tap
  return isTapInteraction({ duration: dragDuration, totalMovement });
};

/**
 * Handles drag interactions in the library view
 * @param {Object} params - Parameters for library drag
 * @param {boolean} params.isPortrait - Whether device is in portrait mode
 * @param {number} params.dx - X movement amount
 * @param {number} params.dy - Y movement amount
 * @param {boolean} params.isLast - Whether this is the last movement event
 * @param {Object} params.config - Spacing configuration
 * @param {number} params.dragStartPosition - Starting drag position
 * @param {Object} params.targetOffsetRef - Reference to target offset
 * @param {Function} params.setIsDragging - Function to set dragging state
 * @param {Function} params.setLastCarouselMove - Function to track last carousel movement
 */
export const handleLibraryDrag = ({
  isPortrait,
  dx,
  dy,
  isLast,
  config,
  dragStartPosition,
  targetOffsetRef,
  setIsDragging,
  setLastCarouselMove,
}) => {
  const totalMovement = Math.sqrt(dx * dx + dy * dy);
  const dragThreshold = THRESHOLD.DRAG;
  const dragSensitivity = 0.01; // Multiplier for drag movement

  if (totalMovement > dragThreshold) {
    const movement = isPortrait ? -dy * dragSensitivity : dx * dragSensitivity;

    // Update carousel movement tracking
    if (totalMovement > THRESHOLD.CAROUSEL_MOVE_THRESHOLD) {
      setLastCarouselMove({
        time: Date.now(),
        movement: totalMovement,
      });
    }

    // Use SPACING directly if config is not provided
    const magSpacing = config?.MAGAZINE || 
                       (isPortrait ? SPACING.PORTRAIT.MAGAZINE : SPACING.LANDSCAPE.MAGAZINE);

    if (isLast) {
      setIsDragging(false);

      // Calculate the nearest snap position
      const currentPosition = Math.round(dragStartPosition / magSpacing);

      // Determine direction based on the total movement
      const deltaMovement = isPortrait ? -dy : dx;
      const movementThreshold = 20; // Threshold for significant movement
      
      if (Math.abs(deltaMovement) > movementThreshold) {
        const targetPosition = currentPosition + (deltaMovement > 0 ? 1 : -1);
        targetOffsetRef.current = targetPosition * magSpacing;
      } else {
        targetOffsetRef.current = currentPosition * magSpacing;
      }
    } else {
      // During drag, snap to the nearest position
      const newOffset = dragStartPosition + movement;
      targetOffsetRef.current = Math.round(newOffset / magSpacing) * magSpacing;
    }
  } else if (isLast) {
    setIsDragging(false);
  }
};

/**
 * Handles magazine interaction (tap/click or swipe)
 * @param {Object} params - Parameters for magazine interaction
 * @param {number} params.deltaX - Horizontal movement
 * @param {number} params.deltaY - Vertical movement
 * @param {boolean} params.isDrag - Whether the interaction is a drag
 * @param {string} params.magazine - Magazine being interacted with
 * @param {string} params.focusedMagazine - Currently focused magazine
 * @param {Function} params.setFocusedMagazine - Function to set focused magazine
 * @param {number} params.page - Current page index
 * @param {Array} params.pages - Array of pages
 * @param {Function} params.setPage - Function to set page
 * @param {boolean} params.viewingRightPage - Whether viewing right page
 * @param {Function} params.setViewingRightPage - Function to set viewing right page
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @param {string} params.currentMiddleMagazine - Currently middle magazine
 * @param {Object} params.lastPageRef - Reference to last page
 * @param {Object} params.lastViewingStateRef - Reference to last viewing state
 * @param {Object} params.lastCarouselMove - Information about the last carousel movement
 * @param {number} params.dragDuration - Duration of the drag interaction
 * @param {number} params.totalMovement - Total movement during the interaction
 */
export const handleMagazineInteraction = ({
  deltaX,
  deltaY,
  isDrag,
  magazine,
  focusedMagazine,
  setFocusedMagazine,
  page,
  pages,
  setPage,
  setViewingRightPage,
  viewingRightPage,
  isPortrait,
  currentMiddleMagazine,
  lastPageRef,
  lastViewingStateRef,
  lastCarouselMove,
  dragDuration,
  totalMovement,
}) => {
  // Check if we can focus the magazine
  const canFocus = canFocusMagazine({
    magazine,
    currentMiddleMagazine,
    isPortrait,
    focusedMagazine,
    lastCarouselMove,
    dragDuration,
    totalMovement,
  });

  if (canFocus) {
    // Handle as click/tap
    if (focusedMagazine !== magazine) {
      // Store current state before focusing
      if (page !== 0) {
        lastPageRef.current = page;
        lastViewingStateRef.current = viewingRightPage;
      }
      // Focus the new magazine
      setFocusedMagazine(magazine);
      // If we have a stored page, restore it, otherwise start at page 1
      if (lastPageRef.current > 0) {
        setPage(lastPageRef.current);
        // Only restore viewing state in portrait mode
        if (isPortrait) {
          setViewingRightPage(lastViewingStateRef.current);
        } else {
          setViewingRightPage(false); // Always center in landscape
        }
      } else {
        setPage(1);
        setViewingRightPage(false); // Always center in landscape
      }
    } else if (focusedMagazine === magazine) {
      // Store state before unfocusing
      if (page !== 0) {
        lastPageRef.current = page;
        lastViewingStateRef.current = viewingRightPage;
      }
      // Reset page to 0 and unfocus
      setPage(0);
      setViewingRightPage(false);
      setFocusedMagazine(null);
    }
    return;
  }

  const isSwipe = isSwipeInteraction({ deltaX, deltaY, isDrag });

  // Handle swipes only if focused on this magazine
  if (isSwipe && focusedMagazine === magazine) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Store state before closing from last page
      if (page === pages.length - 1 && deltaX < -THRESHOLD.PAGE_TURN_THRESHOLD) {
        lastPageRef.current = page;
        lastViewingStateRef.current = viewingRightPage;
      }

      if (isPortrait) {
        const result = handlePageViewTransition({
          deltaX,
          isViewingRightPage: viewingRightPage,
          currentPage: page,
          maxPages: pages.length,
        });

        setPage(result.newPage);
        setViewingRightPage(result.newViewingRightPage);
      } else {
        if (deltaX > THRESHOLD.PAGE_TURN_THRESHOLD) {
          setPage((p) => Math.max(p - 1, 0));
        } else if (deltaX < -THRESHOLD.PAGE_TURN_THRESHOLD) {
          if (page === pages.length - 1) {
            setPage(0);
            setFocusedMagazine(null);
          } else {
            setPage((p) => Math.min(p + 1, pages.length - 1));
          }
        }
      }
    }
  }
};

/**
 * Returns whether a magazine is in the middle position
 * @param {Object} params - Parameters
 * @param {Object} params.position - Current position vector
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @returns {boolean} Whether the magazine is in the middle position
 */
export const isMiddleMagazine = ({ position, isPortrait }) => {
  const middleThreshold = THRESHOLD.MIDDLE_MAGAZINE;
  
  if (isPortrait) {
    return Math.abs(position.y) < middleThreshold;
  }
  return Math.abs(position.x) < middleThreshold;
};

/**
 * Calculates the focus position for a magazine based on current camera and focus state
 * @param {Object} params - Position calculation parameters
 * @param {Object} params.camera - The camera object
 * @param {string} params.focusedMagazine - Currently focused magazine name
 * @param {string} params.magazine - Target magazine name
 * @param {Array} params.layoutPosition - Optional layout position override
 * @param {boolean} params.isPortrait - Whether device is in portrait mode
 * @returns {Array} The calculated [x, y, z] position
 */
export const calculateFocusPosition = ({ camera, focusedMagazine, magazine, layoutPosition, isPortrait }) => {
  // Default position calculation
  let x = 0, y = 0, z = 0;
  
  // If this is the focused magazine, position it directly in front of the camera
  if (focusedMagazine === magazine) {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    const focusDistance = isPortrait ? 2 : 2.5;
    
    x = camera.position.x + forward.x * focusDistance;
    y = camera.position.y + forward.y * focusDistance;
    z = camera.position.z + forward.z * focusDistance;
  } 
  // Otherwise position based on magazine type and spacing config
  else {
    const spacing = isPortrait ? SPACING.PORTRAIT : SPACING.LANDSCAPE;
    const offset = magazine === 'smack' ? 1 : magazine === 'engineer' ? -1 : 0;
    
    x = offset * spacing.MAGAZINE;
    y = 0;
    z = camera.position.z - 1;
  }
  
  // Apply layout position offset if provided
  if (layoutPosition && layoutPosition.length === 3) {
    const [offsetX, offsetY, offsetZ] = layoutPosition;
    x += offsetX;
    y += offsetY;
    z += offsetZ;
  }
  
  return [x, y, z];
};

/**
 * Calculates which magazine should be in the middle based on the current target offset
 * @param {number} targetOffset - The current target offset value
 * @param {boolean} isPortrait - Whether the device is in portrait mode
 * @returns {string} The magazine name that should be in the middle
 */
export const calculateMiddleMagazine = (targetOffset, isPortrait) => {
  const spacing = isPortrait ? SPACING.PORTRAIT.MAGAZINE : SPACING.LANDSCAPE.MAGAZINE;
  
  // Determine middle magazine based on target offset
  if (targetOffset < -spacing / 2) {
    return 'engineer';
  } else if (targetOffset > spacing / 2) {
    return 'smack';
  } else {
    return 'vague';
  }
};

/**
 * Updates the magazine carousel positioning and state
 * @param {Object} params - Parameters for updating the carousel
 * @param {Object} params.magazineRef - Reference to the magazine object
 * @param {Array} params.targetPosition - Target [x, y, z] position for the magazine
 * @param {Object} params.camera - Camera object
 * @param {string} params.focusedMagazine - Currently focused magazine
 * @param {string} params.magazine - The magazine being updated
 * @param {boolean} params.isPortrait - Whether device is in portrait orientation
 * @param {number} params.dragOffset - Current drag offset
 * @param {number} params.page - Current page number
 * @param {Object} params.targetOffsetRef - Reference to the target offset
 * @param {string} params.currentMiddleMagazine - Current middle magazine
 * @param {Function} params.setMiddleMagazine - Function to set middle magazine
 * @param {Function} params.setPage - Function to set page
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
  if (!magazineRef.position) return;
  
  // Create THREE.Vector3 from target position array
  const finalPosition = new THREE.Vector3(...targetPosition);
  
  // If this magazine is focused, apply the target position directly
  if (focusedMagazine === magazine) {
    // Use lerp for smooth transition
    magazineRef.position.lerp(finalPosition, TIMING.LERP_FACTOR);
    return;
  }
  
  // For carousel effect, apply offset based on drag amount
  const spacing = isPortrait ? SPACING.PORTRAIT.MAGAZINE : SPACING.LANDSCAPE.MAGAZINE;
  
  // Calculate magazine position in carousel
  let offset = 0;
  if (magazine === 'engineer') offset = -spacing;
  if (magazine === 'smack') offset = spacing;
  
  // Apply drag offset to adjust position during dragging
  finalPosition.x = offset + dragOffset;
  
  // Handle carousel wrapping for infinite scrolling effect
  const totalWidth = spacing * 3;
  
  // Check if we need to wrap around (create infinite carousel effect)
  if (Math.abs(finalPosition.x) > totalWidth) {
    // If magazine goes too far left or right, wrap it to the other side
    const wrapOffset = (offset, total) => {
      if (offset > total / 2) return offset - total;
      if (offset < -total / 2) return offset + total;
      return offset;
    };
    
    finalPosition.x = wrapOffset(finalPosition.x, totalWidth);
    
    // Need to jump instantly when wrapping
    if (!magazineRef.needsJump) {
      magazineRef.position.copy(finalPosition);
      magazineRef.needsJump = true;
    } else {
      // After jump, interpolate to final position
      magazineRef.position.lerp(finalPosition, TIMING.LERP_FACTOR);
    }
  } else {
    // Reset needsJump when not wrapping
    magazineRef.needsJump = false;
    // Smooth interpolation for adjacent positions
    magazineRef.position.lerp(finalPosition, TIMING.LERP_FACTOR);
  }
};

/**
 * Applies hover effect to a magazine
 * @param {Object} params - Parameters for hover effect
 * @param {Object} params.position - The magazine position
 * @param {boolean} params.isHovered - Whether the magazine is hovered
 * @param {string} params.magazine - The magazine type
 * @param {boolean} params.isPortrait - Whether device is in portrait mode
 */
export const hoverMagazine = ({ position, isHovered, magazine, isPortrait }) => {
  if (!position || isPortrait) return;
  
  // Skip hover effect in portrait mode
  if (isPortrait) return;
  
  // Apply hover effect - slightly raise the magazine when hovered
  const targetY = isHovered ? 0.1 : 0;
  
  // Apply lerp for smooth transition
  position.y = THREE.MathUtils.lerp(position.y, targetY, TIMING.LERP_FACTOR);
};

/**
 * Applies float nullification effect when a magazine is focused
 * @param {Object} params - Parameters for float nullification
 * @param {Object} params.floatRef - Reference to the float component
 * @param {Object} params.nullifyRef - Reference to the nullify property
 * @param {boolean} params.shouldNullify - Whether to nullify the float effect
 */
export const applyFloatNullification = ({ floatRef, nullifyRef, shouldNullify }) => {
  if (!floatRef || !nullifyRef) return;
  
  // Nullify float effect when magazine is focused
  nullifyRef.current = shouldNullify;
};

/**
 * Calculates the position for magazine buttons
 * @param {Object} params - Parameters for button position calculation
 * @param {Object} params.position - Current button position Vector3
 * @param {Object} params.camera - Camera object
 * @param {boolean} params.isHovered - Whether the magazine is hovered
 * @param {boolean} params.isPortrait - Whether device is in portrait mode
 * @param {Object} params.floatRef - Reference to the float component
 * @param {Object} params.buttonRef - Reference to the button component
 * @returns {THREE.Vector3} Calculated button position
 */
export const calculateButtonPosition = ({
  position,
  camera,
  isHovered,
  isPortrait,
  floatRef,
  buttonRef,
}) => {
  if (!position || !camera || isPortrait) {
    return position || new THREE.Vector3();
  }
  
  // Create a new vector for the target position
  const targetPos = new THREE.Vector3();
  
  // Set target position based on camera orientation
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  
  // Base position in front of camera
  targetPos.copy(camera.position).addScaledVector(forward, 2);
  
  // Offset to the right
  targetPos.addScaledVector(right, 0.65);
  
  // Lower position
  targetPos.y -= 1.2;
  
  // Use lerp for smooth transition
  position.lerp(targetPos, TIMING.LERP_FACTOR);
  
  return position;
};

/**
 * Calculates page view offset for smooth transitions between pages
 * @param {Object} params - Parameters for calculating page view offset
 * @param {Object} params.position - The position Vector3 to update
 * @param {Object} params.right - The right direction vector
 * @param {number} params.currentOffset - Current horizontal offset
 * @param {number} params.targetOffset - Target horizontal offset
 * @param {boolean} params.isPortrait - Whether device is in portrait mode
 * @param {boolean} params.viewingRightPage - Whether viewing right page
 * @param {number} params.page - Current page number
 * @param {number} params.delayedPage - Delayed page number for animations
 * @param {number} params.lerpFactor - Lerp factor for smooth transitions
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
  lerpFactor = 0.03,
}) => {
  if (!position || !right) return;
  
  // Skip in portrait mode
  if (isPortrait) return;
  
  // Only apply page view offset when on an actual page
  if (page > 0) {
    // Calculate current x position without offset
    const basePosition = position.clone();
    basePosition.addScaledVector(right, -currentOffset);
    
    // Calculate target position with new offset
    const targetPosition = basePosition.clone();
    targetPosition.addScaledVector(right, targetOffset);
    
    // Interpolate between positions
    position.lerp(targetPosition, lerpFactor);
  }
}; 
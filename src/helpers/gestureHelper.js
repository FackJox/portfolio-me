import { handlePageViewTransition, getGestureConfig } from "@/helpers/positionHelper";
import { lastCarouselMoveAtom } from "@/helpers/atoms";

/**
 * Determines if an interaction should be treated as a tap/click
 * @param {Object} params - Parameters for tap detection
 * @param {number} params.duration - Duration of the interaction in ms
 * @param {number} params.totalMovement - Total movement distance
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @returns {boolean} Whether the interaction should be treated as a tap
 */
export const isTapInteraction = ({ duration, totalMovement, isPortrait }) => {
  const config = getGestureConfig(isPortrait).interaction.tap;
  return duration < config.maxDuration && totalMovement < config.maxMovement;
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
  return isDrag && Math.abs(deltaX) > getGestureConfig(true).interaction.swipe.minMovement;
};

/**
 * Checks if it's safe to focus a magazine based on recent carousel movement
 */
export const canFocusMagazine = ({ 
  magazine, 
  currentMiddleMagazine, 
  isPortrait, 
  focusedMagazine,
  lastCarouselMove,
  dragDuration,
  totalMovement
}) => {
  // Basic validation checks
  if (isPortrait && currentMiddleMagazine !== magazine) {
    return false;
  }

  if (focusedMagazine && focusedMagazine !== magazine) {
    return false;
  }

  // Check for recent carousel movement
  const config = getGestureConfig(isPortrait).interaction;
  const timeSinceCarouselMove = Date.now() - lastCarouselMove.time;
  const hasRecentCarouselMove = timeSinceCarouselMove < config.focus.debounceTime;

  if (hasRecentCarouselMove) {
    return false;
  }

  // Check if this is a valid tap
  return isTapInteraction({ duration: dragDuration, totalMovement, isPortrait });
};

/**
 * Handles library carousel drag interaction
 * @param {Object} params - Parameters for drag handling
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @param {number} params.dx - Horizontal movement
 * @param {number} params.dy - Vertical movement
 * @param {boolean} params.isLast - Whether this is the last event in the drag
 * @param {Object} params.config - Spacing configuration
 * @param {number} params.dragStartPosition - Starting position of the drag
 * @param {Object} params.targetOffsetRef - Reference to target offset
 * @param {Function} params.setIsDragging - Function to set dragging state
 * @returns {void}
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
  setLastCarouselMove
}) => {
  const totalMovement = Math.sqrt(dx * dx + dy * dy);
  const gestureConfig = getGestureConfig(isPortrait);
  
  if (totalMovement > gestureConfig.dragThreshold) {
    const movement = isPortrait ? -dy * gestureConfig.dragSensitivity : dx * gestureConfig.dragSensitivity;
    
    // Update carousel movement tracking
    if (totalMovement > gestureConfig.interaction.swipe.carouselThreshold) {
      setLastCarouselMove({
        time: Date.now(),
        movement: totalMovement
      });
    }
    
    if (isLast) {
      setIsDragging(false);
      
      // Calculate the nearest snap position
      const currentPosition = Math.round(dragStartPosition / config.magazine);
      
      // Determine direction based on the total movement
      const deltaMovement = isPortrait ? -dy : dx;
      if (Math.abs(deltaMovement) > gestureConfig.threshold) {
        const targetPosition = currentPosition + (deltaMovement > 0 ? 1 : -1);
        targetOffsetRef.current = targetPosition * config.magazine;
      } else {
        targetOffsetRef.current = currentPosition * config.magazine;
      }
    } else {
      // During drag, snap to the nearest position
      const newOffset = dragStartPosition + movement;
      targetOffsetRef.current = Math.round(newOffset / config.magazine) * config.magazine;
    }
  } else if (isLast) {
    setIsDragging(false);
  }
}; 

/**
 * Handles magazine interaction (tap/click or swipe)
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
  totalMovement
}) => {
  // Check if we can focus the magazine
  const canFocus = canFocusMagazine({
    magazine,
    currentMiddleMagazine,
    isPortrait,
    focusedMagazine,
    lastCarouselMove,
    dragDuration,
    totalMovement
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
  const config = getGestureConfig(isPortrait).interaction.swipe;
  
  // Handle swipes only if focused on this magazine
  if (isSwipe && focusedMagazine === magazine) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Store state before closing from last page
      if (page === pages.length - 1 && deltaX < -config.pageThreshold) {
        lastPageRef.current = page;
        lastViewingStateRef.current = viewingRightPage;
      }

      if (isPortrait) {
        const result = handlePageViewTransition({
          deltaX,
          isViewingRightPage: viewingRightPage,
          currentPage: page,
          maxPages: pages.length
        });
        
        setPage(result.newPage);
        setViewingRightPage(result.newViewingRightPage);
      } else {
        if (deltaX > config.pageThreshold) {
          setPage((p) => Math.max(p - 1, 0));
        } else if (deltaX < -config.pageThreshold) {
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

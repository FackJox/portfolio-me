import { handlePageViewTransition } from "@/helpers/positionHelper";
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
  // In portrait mode, be more strict with what counts as a tap
  const isTap = isPortrait ? 
    (duration < 150 && totalMovement < 10) : 
    (duration < 150 && totalMovement < 10);
  
  console.log('[Gesture] Tap detection', { duration, totalMovement, isPortrait, isTap });
  return isTap;
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
  const isSwipe = isDrag && Math.abs(deltaX) > 5;
  console.log('[Gesture] Swipe detection', { deltaX, deltaY, isDrag, isSwipe });
  return isSwipe;
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
    console.log('[Gesture] Focus blocked - not middle magazine', { magazine, currentMiddleMagazine });
    return false;
  }

  if (focusedMagazine && focusedMagazine !== magazine) {
    console.log('[Gesture] Focus blocked - different magazine focused', { magazine, focusedMagazine });
    return false;
  }

  // Check for recent carousel movement
  const timeSinceCarouselMove = Date.now() - lastCarouselMove.time;
  const hasRecentCarouselMove = timeSinceCarouselMove < 500; // Increased to 500ms for safety

  if (hasRecentCarouselMove) {
    console.log('[Gesture] Focus blocked - recent carousel movement', { 
      timeSinceCarouselMove,
      lastMovement: lastCarouselMove.movement 
    });
    return false;
  }

  // Check if this is a valid tap
  const isTap = isTapInteraction({ duration: dragDuration, totalMovement, isPortrait });
  
  return isTap;
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
  
  if (totalMovement > config.dragThreshold) {
    const movement = isPortrait ? -dy * config.dragSensitivity : dx * config.dragSensitivity;
    
    // Update carousel movement tracking
    if (totalMovement > 20) {
      setLastCarouselMove({
        time: Date.now(),
        movement: totalMovement
      });
      console.log('[Gesture] Carousel movement detected', { totalMovement });
    }
    
    if (isLast) {
      setIsDragging(false);
      
      // Calculate the nearest snap position
      const currentPosition = Math.round(dragStartPosition / config.magazine);
      
      // Determine direction based on the total movement
      const deltaMovement = isPortrait ? -dy : dx;
      if (Math.abs(deltaMovement) > config.threshold) {
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
      console.log('[Gesture] Focusing magazine', { magazine, previousFocus: focusedMagazine });
      // Store current state before focusing
      if (page !== 0) {
        lastPageRef.current = page;
        lastViewingStateRef.current = viewingRightPage;
      }
      // Focus the new magazine
      setFocusedMagazine(magazine);
      // If we have a stored page, restore it, otherwise start at page 1
      if (lastPageRef.current > 1) {
        console.log('[Gesture] Restoring to last page', { lastPage: lastPageRef.current });
        setPage(lastPageRef.current);
        // Only restore viewing state in portrait mode
        if (isPortrait) {
          setViewingRightPage(lastViewingStateRef.current);
        } else {
          setViewingRightPage(false); // Always center in landscape
        }
      } else {
        console.log('[Gesture] Starting at page 1');
        setPage(1);
        setViewingRightPage(false); // Always center in landscape
      }
    } else if (focusedMagazine === magazine) {
      console.log('[Gesture] Unfocusing magazine', { magazine });
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
      if (page === pages.length - 1 && deltaX < -50) {
        console.log('[Gesture] Storing last page state', { page, viewingRightPage });
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
        
        console.log('[Gesture] Page transition in portrait', { 
          deltaX,
          currentPage: page,
          newPage: result.newPage,
          currentViewState: viewingRightPage,
          newViewState: result.newViewingRightPage
        });
        
        setPage(result.newPage);
        setViewingRightPage(result.newViewingRightPage);
      } else {
        console.log('[Gesture] Page transition in landscape', { deltaX, page });
        if (deltaX > 50) {
          setPage((p) => Math.max(p - 1, 0));
        } else if (deltaX < -50) {
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

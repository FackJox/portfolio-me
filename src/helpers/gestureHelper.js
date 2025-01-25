import { handlePageViewTransition } from "@/helpers/positionHelper";

/**
 * Determines if an interaction should be treated as a tap/click
 * @param {Object} params - Parameters for tap detection
 * @param {number} params.duration - Duration of the interaction in ms
 * @param {number} params.totalMovement - Total movement distance
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @returns {boolean} Whether the interaction should be treated as a tap
 */
export const isTapInteraction = ({ duration, totalMovement, isPortrait }) => {
  // In portrait mode, be more lenient with what counts as a tap
  return isPortrait ? 
    (duration < 200 && totalMovement < 20) : 
    (duration < 150 && totalMovement < 10);
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
  return isDrag && Math.abs(deltaX) > 5;
};

/**
 * Handles magazine interaction (tap/click or swipe)
 * @param {Object} params - Parameters for interaction handling
 * @param {number} params.deltaX - Horizontal movement
 * @param {number} params.deltaY - Vertical movement
 * @param {boolean} params.isDrag - Whether the interaction is a drag
 * @param {string} params.magazine - Magazine ID
 * @param {string} params.focusedMagazine - Currently focused magazine ID
 * @param {Function} params.setFocusedMagazine - Function to set focused magazine
 * @param {number} params.page - Current page number
 * @param {Array} params.pages - Array of pages
 * @param {Function} params.setPage - Function to set page number
 * @param {Function} params.setViewingRightPage - Function to set right page viewing state
 * @param {boolean} params.viewingRightPage - Current right page viewing state
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @param {string} params.currentMiddleMagazine - Currently middle magazine ID
 * @returns {void}
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
  lastViewingStateRef
}) => {
  // Check if magazine is clickable in portrait mode
  if (isPortrait && currentMiddleMagazine !== magazine) {
    return;
  }

  const isSwipe = isSwipeInteraction({ deltaX, deltaY, isDrag });

  if (!isSwipe) {
    // Handle as click/tap
    if (focusedMagazine !== magazine) {
      setFocusedMagazine(magazine);
    } else if (focusedMagazine === magazine) {
      setFocusedMagazine(null);
    }
    return;
  }

  // Ignore swipes if not focused on this magazine
  if (focusedMagazine && focusedMagazine !== magazine) return;

  // Handle horizontal swipes
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Store state before closing from last page
    if (page === pages.length - 1 && deltaX < -50) {
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
  setIsDragging
}) => {
  const totalMovement = Math.sqrt(dx * dx + dy * dy);
  
  if (totalMovement > config.dragThreshold) {
    const movement = isPortrait ? -dy * config.dragSensitivity : dx * config.dragSensitivity;
    
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

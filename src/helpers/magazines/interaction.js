/**
 * Interaction helper functions for Magazine components
 */

import { handlePageViewTransition } from '@/helpers/magazines/position'
import { 
  TIMING, 
  THRESHOLD, 
  SENSITIVITY 
} from '@/constants/magazines/animation'

/**
 * Determines if an interaction should be treated as a tap/click
 * @param {Object} params - Parameters for tap detection
 * @param {number} params.duration - Duration of the interaction in ms
 * @param {number} params.totalMovement - Total movement distance
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @returns {boolean} Whether the interaction should be treated as a tap
 */
export const isTapInteraction = ({ duration, totalMovement }) => {
  return duration < TIMING.TAP_MAX_DURATION && totalMovement < THRESHOLD.TAP.MAX_MOVEMENT
}

/**
 * Determines if an interaction should be treated as a swipe
 * @param {Object} params - Parameters for swipe detection
 * @param {number} params.deltaX - Horizontal movement
 * @param {number} params.deltaY - Vertical movement
 * @param {boolean} params.isDrag - Whether the interaction is a drag
 * @returns {boolean} Whether the interaction should be treated as a swipe
 */
export const isSwipeInteraction = ({ deltaX, deltaY, isDrag }) => {
  return isDrag && Math.abs(deltaX) > THRESHOLD.SWIPE.MIN_MOVEMENT
}

/**
 * Checks if it's safe to focus a magazine based on recent carousel movement
 * @param {Object} params - Parameters for focus check
 * @param {string} params.magazine - Magazine identifier
 * @param {string} params.currentMiddleMagazine - Current middle magazine
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @param {string} params.focusedMagazine - Currently focused magazine
 * @param {Object} params.lastCarouselMove - Last carousel movement data
 * @param {number} params.dragDuration - Duration of drag interaction
 * @param {number} params.totalMovement - Total movement distance
 * @returns {boolean} Whether the magazine can be focused
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
    return false
  }

  if (focusedMagazine && focusedMagazine !== magazine) {
    return false
  }

  // Check for recent carousel movement
  const timeSinceCarouselMove = Date.now() - lastCarouselMove.time
  const hasRecentCarouselMove = timeSinceCarouselMove < TIMING.CAROUSEL_DEBOUNCE

  if (hasRecentCarouselMove) {
    return false
  }

  // Check if this is a valid tap
  return isTapInteraction({ duration: dragDuration, totalMovement, isPortrait })
}

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
 * @param {Function} params.setLastCarouselMove - Function to update last carousel movement
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
  setLastCarouselMove,
}) => {
  const totalMovement = Math.sqrt(dx * dx + dy * dy)

  if (totalMovement > THRESHOLD.DRAG) {
    const movement = isPortrait ? -dy * SENSITIVITY.DRAG : dx * SENSITIVITY.DRAG

    // Update carousel movement tracking
    if (totalMovement > THRESHOLD.SWIPE.CAROUSEL) {
      setLastCarouselMove({
        time: Date.now(),
        movement: totalMovement,
      })
    }

    if (isLast) {
      setIsDragging(false)

      // Calculate the nearest snap position
      const currentPosition = Math.round(dragStartPosition / config.magazine)

      // Determine direction based on the total movement
      const deltaMovement = isPortrait ? -dy : dx
      if (Math.abs(deltaMovement) > 20) { // Fixed threshold for direction determination
        const targetPosition = currentPosition + (deltaMovement > 0 ? 1 : -1)
        targetOffsetRef.current = targetPosition * config.magazine
      } else {
        targetOffsetRef.current = currentPosition * config.magazine
      }
    } else {
      // During drag, snap to the nearest position
      const newOffset = dragStartPosition + movement
      targetOffsetRef.current = Math.round(newOffset / config.magazine) * config.magazine
    }
  } else if (isLast) {
    setIsDragging(false)
  }
}

/**
 * Handles magazine interaction (tap/click or swipe)
 * @param {Object} params - Parameters for magazine interaction
 * @param {number} params.deltaX - Horizontal movement
 * @param {number} params.deltaY - Vertical movement
 * @param {boolean} params.isDrag - Whether the interaction is a drag
 * @param {string} params.magazine - Magazine identifier
 * @param {string} params.focusedMagazine - Currently focused magazine
 * @param {Function} params.setFocusedMagazine - Function to update focused magazine
 * @param {number} params.page - Current page number
 * @param {Array} params.pages - Array of page data
 * @param {Function} params.setPage - Function to update page
 * @param {Function} params.setViewingRightPage - Function to update viewing state
 * @param {boolean} params.viewingRightPage - Whether viewing right page
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @param {string} params.currentMiddleMagazine - Current middle magazine
 * @param {Object} params.lastPageRef - Reference to last page
 * @param {Object} params.lastViewingStateRef - Reference to last viewing state
 * @param {Object} params.lastCarouselMove - Last carousel movement data
 * @param {number} params.dragDuration - Duration of drag interaction
 * @param {number} params.totalMovement - Total movement distance
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
  })

  if (canFocus) {
    // Handle as click/tap
    if (focusedMagazine !== magazine) {
      // Store current state before focusing
      if (page !== 0) {
        lastPageRef.current = page
        lastViewingStateRef.current = viewingRightPage
      }
      // Focus the new magazine
      setFocusedMagazine(magazine)
      // If we have a stored page, restore it, otherwise start at page 1
      if (lastPageRef.current > 0) {
        setPage(lastPageRef.current)
        // Only restore viewing state in portrait mode
        if (isPortrait) {
          setViewingRightPage(lastViewingStateRef.current)
        } else {
          setViewingRightPage(false) // Always center in landscape
        }
      } else {
        setPage(1)
        setViewingRightPage(false) // Always center in landscape
      }
    } else if (focusedMagazine === magazine) {
      // Store state before unfocusing
      if (page !== 0) {
        lastPageRef.current = page
        lastViewingStateRef.current = viewingRightPage
      }
      // Reset page to 0 and unfocus
      setPage(0)
      setViewingRightPage(false)
      setFocusedMagazine(null)
    }
    return
  }

  const isSwipe = isSwipeInteraction({ deltaX, deltaY, isDrag })

  // Handle swipes only if focused on this magazine
  if (isSwipe && focusedMagazine === magazine) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Store state before closing from last page
      if (page === pages.length - 1 && deltaX < -THRESHOLD.SWIPE.PAGE_TURN) {
        lastPageRef.current = page
        lastViewingStateRef.current = viewingRightPage
      }

      if (isPortrait) {
        const result = handlePageViewTransition({
          deltaX,
          isViewingRightPage: viewingRightPage,
          currentPage: page,
          maxPages: pages.length,
        })

        setPage(result.newPage)
        setViewingRightPage(result.newViewingRightPage)
      } else {
        if (deltaX > THRESHOLD.SWIPE.PAGE_TURN) {
          setPage((p) => Math.max(p - 1, 0))
        } else if (deltaX < -THRESHOLD.SWIPE.PAGE_TURN) {
          if (page === pages.length - 1) {
            setPage(0)
            setFocusedMagazine(null)
          } else {
            setPage((p) => Math.min(p + 1, pages.length - 1))
          }
        }
      }
    }
  }
}

/**
 * Creates handlers for magazine drag operations
 * @param {Object} params - Configuration parameters
 * @param {boolean} params.isPortrait - Whether in portrait mode
 * @param {Object} params.targetOffsetRef - Reference to target offset
 * @param {Function} params.setIsDragging - Function to set dragging state
 * @param {Function} params.setLastCarouselMove - Function to update last carousel movement
 * @param {Object} params.config - Spacing configuration
 * @returns {Object} Drag handlers and state
 */
export const useMagazineDragHandlers = ({
  isPortrait,
  targetOffsetRef,
  setIsDragging,
  setLastCarouselMove,
  config
}) => {
  let dragStartPosition = 0
  let dragStartTime = 0
  let dragDistance = { x: 0, y: 0 }

  const handleDragStart = () => {
    dragStartPosition = targetOffsetRef.current
    dragStartTime = Date.now()
    dragDistance = { x: 0, y: 0 }
    setIsDragging(true)
  }

  const handleDragMove = (dx, dy) => {
    dragDistance.x += dx
    dragDistance.y += dy

    handleLibraryDrag({
      isPortrait,
      dx,
      dy,
      isLast: false,
      config,
      dragStartPosition,
      targetOffsetRef,
      setIsDragging,
      setLastCarouselMove
    })
  }

  const handleDragEnd = () => {
    const dragDuration = Date.now() - dragStartTime
    const totalMovement = Math.sqrt(dragDistance.x * dragDistance.x + dragDistance.y * dragDistance.y)

    handleLibraryDrag({
      isPortrait,
      dx: dragDistance.x,
      dy: dragDistance.y,
      isLast: true,
      config,
      dragStartPosition,
      targetOffsetRef,
      setIsDragging,
      setLastCarouselMove
    })

    return { dragDuration, totalMovement }
  }

  return { handleDragStart, handleDragMove, handleDragEnd }
}

/**
 * Initializes state for magazine interaction
 * @returns {Object} Initial interaction state
 */
export const getInitialInteractionState = () => ({
  lastCarouselMove: { time: 0, movement: 0 },
  lastPageRef: { current: 0 },
  lastViewingStateRef: { current: false },
  isDragging: false,
  targetOffset: 0
})
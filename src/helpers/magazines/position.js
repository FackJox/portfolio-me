/**
 * Position calculation helper functions for Magazine components
 */

import * as THREE from 'three'
import { SPACING, POSITION, CAMERA, HOVER, GEOMETRY, ORDER } from '@/constants/magazines/layout'
import { LERP, THRESHOLD, SENSITIVITY } from '@/constants/magazines/animation'

/**
 * Gets the appropriate spacing configuration based on view mode
 * @param {boolean} isPortrait - Whether in portrait orientation
 * @returns {Object} Spacing configuration for current orientation
 */
export const getSpacingConfig = (isPortrait) => {
  return {
    magazine: isPortrait ? SPACING.PORTRAIT.MAGAZINE : SPACING.LANDSCAPE.MAGAZINE,
    total: isPortrait ? SPACING.PORTRAIT.TOTAL : SPACING.LANDSCAPE.TOTAL,
    positions: isPortrait ? POSITION.PORTRAIT : POSITION.LANDSCAPE,
    camera: isPortrait ? CAMERA.PORTRAIT : CAMERA.LANDSCAPE,
    geometry: isPortrait ? GEOMETRY.PORTRAIT : GEOMETRY.LANDSCAPE,
  }
}

/**
 * Gets the appropriate lerp configuration based on view mode
 * @param {boolean} isPortrait - Whether in portrait orientation
 * @returns {Object} Animation lerp configuration
 */
export const getLerpConfig = (isPortrait) => {
  // Both portrait and landscape use the same lerp values in this implementation
  return {
    button: {
      text: LERP.BUTTON.TEXT,
      color: LERP.BUTTON.COLOR
    },
    pageView: LERP.PAGE_VIEW,
    carousel: LERP.CAROUSEL
  }
}

/**
 * Gets the appropriate gesture threshold configuration based on view mode
 * @param {boolean} isPortrait - Whether in portrait orientation
 * @returns {Object} Threshold configuration
 */
export const getGestureConfig = (isPortrait) => {
  // Both portrait and landscape use the same threshold values in this implementation
  return {
    threshold: 20,
    dragSensitivity: SENSITIVITY.DRAG,
    dragThreshold: THRESHOLD.DRAG,
    interaction: {
      tap: {
        maxDuration: THRESHOLD.TAP.MAX_MOVEMENT,
        maxMovement: THRESHOLD.TAP.MAX_MOVEMENT,
      },
      swipe: {
        minMovement: THRESHOLD.SWIPE.MIN_MOVEMENT,
        pageThreshold: THRESHOLD.SWIPE.PAGE_TURN,
        carouselThreshold: THRESHOLD.SWIPE.CAROUSEL,
      },
      focus: {
        debounceTime: 500,
      },
      carousel: {
        middleThreshold: THRESHOLD.CAROUSEL.MIDDLE,
        wrapThreshold: THRESHOLD.CAROUSEL.WRAP,
      },
    }
  }
}

/**
 * Handles the page viewing state transitions based on swipe direction
 * @param {Object} params - Parameters for page transition
 * @param {number} params.deltaX - Horizontal delta movement
 * @param {boolean} params.isViewingRightPage - Whether currently viewing right page
 * @param {number} params.currentPage - Current page index
 * @param {number} params.maxPages - Maximum number of pages
 * @returns {Object} New page and viewing state
 */
export const handlePageViewTransition = ({ deltaX, isViewingRightPage, currentPage, maxPages }) => {
  // Going backward (swipe right)
  if (deltaX > THRESHOLD.SWIPE.PAGE_TURN) {
    if (isViewingRightPage) {
      return { newPage: currentPage, newViewingRightPage: false }
    } else {
      // If on left page and at page 1, close the magazine
      if (currentPage === 1) {
        return { newPage: 0, newViewingRightPage: false }
      }
      // If on left page and not at the start, turn page backward
      else if (currentPage > 0) {
        return { newPage: currentPage - 1, newViewingRightPage: true }
      }
    }
  }
  // Going forward (swipe left)
  else if (deltaX < -THRESHOLD.SWIPE.PAGE_TURN) {
    // Check if we're on the last page
    if (currentPage === maxPages - 1 && isViewingRightPage) {
      return { newPage: 0, newViewingRightPage: false }
    }
    if (!isViewingRightPage) {
      return { newPage: currentPage, newViewingRightPage: true }
    } else {
      // If on right page and not at the end, turn page forward
      if (currentPage < maxPages - 1) {
        return { newPage: currentPage + 1, newViewingRightPage: false }
      }
    }
  }

  // No change if conditions aren't met
  return { newPage: currentPage, newViewingRightPage: isViewingRightPage }
}

/**
 * Calculates the horizontal offset for page viewing transitions
 * @param {Object} params - Parameters for offset calculation
 * @returns {number} New offset value
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
  lerpFactor = LERP.PAGE_VIEW,
}) => {
  const geometryWidth = 3

  // If page is 0, we're closing, so don't apply any offset
  if (page === 0) {
    return currentOffset
  }

  // Calculate target horizontal offset based on view mode
  if (isPortrait) {
    targetOffset = viewingRightPage ? -geometryWidth / GEOMETRY.PORTRAIT.VIEW_OFFSET : geometryWidth / GEOMETRY.PORTRAIT.VIEW_OFFSET
  } else {
    targetOffset = delayedPage < 1 ? -geometryWidth / GEOMETRY.LANDSCAPE.VIEW_OFFSET : 0
  }

  // Lerp the horizontal offset
  const newOffset = THREE.MathUtils.lerp(currentOffset, targetOffset, lerpFactor)

  // Calculate and apply the offset change
  const offsetDelta = newOffset - currentOffset
  position.addScaledVector(right, offsetDelta)

  return newOffset
}

/**
 * Calculates the focus position of a magazine relative to the camera
 * @param {Object} params - Parameters for focus position calculation
 * @returns {THREE.Vector3} Target position vector
 */
export const calculateFocusPosition = ({ camera, focusedMagazine, magazine, layoutPosition, isPortrait }) => {
  // Different z-distances for portrait and landscape
  const zDist = isPortrait ? CAMERA.PORTRAIT.Z_DISTANCE : CAMERA.LANDSCAPE.Z_DISTANCE
  let targetPos = new THREE.Vector3()

  if (focusedMagazine === magazine) {
    // Position the magazine in front of the camera
    // Create a copy of the camera position to avoid modifying the original
    targetPos.copy(camera.position)
    
    // For focused magazines, we need to ensure consistent positioning
    // regardless of the current camera position during animation
    // Use a fixed z-position for consistency
    const FIXED_CAMERA_Z = 10
    targetPos.z = FIXED_CAMERA_Z

    const forward = new THREE.Vector3(
      isPortrait ? CAMERA.PORTRAIT.X_OFFSET : CAMERA.LANDSCAPE.X_OFFSET,
      0.0,
      -1,
    )
      .applyQuaternion(camera.quaternion)
      .normalize()

    targetPos.addScaledVector(forward, zDist)

    // Apply layout position offset if provided
    if (layoutPosition && layoutPosition.length === 3) {
      const [offsetX, offsetY, offsetZ] = layoutPosition
      targetPos.add(new THREE.Vector3(-offsetX, -offsetY, -offsetZ))
    }
  }

  return targetPos
}

/**
 * Calculates which magazine should be in the middle position based on carousel offset
 * @param {number} targetOffset - Current carousel offset
 * @param {boolean} isPortrait - Whether in portrait orientation
 * @returns {string} Magazine identifier ('engineer', 'vague', 'smack')
 */
export const calculateMiddleMagazine = (targetOffset, isPortrait) => {
  const { magazine: spacing, total: totalSpacing } = isPortrait ? 
    { magazine: SPACING.PORTRAIT.MAGAZINE, total: SPACING.PORTRAIT.TOTAL } : 
    { magazine: SPACING.LANDSCAPE.MAGAZINE, total: SPACING.LANDSCAPE.TOTAL }
    
  const wrappedOffset = (((targetOffset % totalSpacing) + spacing * 4.5) % totalSpacing) - spacing * 1.5
  const index = Math.round(wrappedOffset / spacing) % 3
  const magazineOrder = ORDER.DEFAULT
  const calculatedIndex = (index + 1) % 3
  return magazineOrder[calculatedIndex]
}

/**
 * Gets the base index for a magazine in the carousel
 * @param {string} magazine - Magazine identifier
 * @returns {number} Base index
 */
export const getBaseIndex = (magazine) => {
  const magazineOrder = ORDER.DEFAULT
  return magazineOrder.indexOf(magazine)
}

/**
 * Updates magazine position and rotation in the carousel or focused state
 * @param {Object} params - Parameters for magazine carousel update
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
  if (!magazineRef) return

  const spacingConfig = getSpacingConfig(isPortrait)
  const lerpConfig = getLerpConfig(isPortrait)
  const gestureConfig = getGestureConfig(isPortrait)

  // Initialize needsJump ref if it doesn't exist
  if (!magazineRef.needsJump) {
    magazineRef.needsJump = true
  }

  // Update dragOffset without lerping for portrait mode
  if (isPortrait && targetOffsetRef) {
    dragOffset = targetOffsetRef.current
  }

  // Calculate and update middle magazine if needed
  if (isPortrait && setMiddleMagazine && currentMiddleMagazine) {
    const middleMagazine = calculateMiddleMagazine(dragOffset, isPortrait)
    if (middleMagazine !== currentMiddleMagazine) {
      setMiddleMagazine(middleMagazine)
    }
  }

  // Automatically open to page 1 when focused in both portrait and landscape modes
  if (focusedMagazine === magazine && setPage && page === 0) {
    setPage(1)
  }

  const { magazine: spacing, total: totalSpacing } = isPortrait ?
    { magazine: SPACING.PORTRAIT.MAGAZINE, total: SPACING.PORTRAIT.TOTAL } :
    { magazine: SPACING.LANDSCAPE.MAGAZINE, total: SPACING.LANDSCAPE.TOTAL }
    
  let finalPosition = new THREE.Vector3()

  if (focusedMagazine !== magazine) {
    if (isPortrait) {
      // Portrait mode positioning with instant wrapping
      const baseIndex = getBaseIndex(magazine)
      const magazineOffset = dragOffset + baseIndex * spacing

      // Wrap the offset instantly
      const wrapOffset = (offset, total) => {
        return (((offset % total) + total * gestureConfig.interaction.carousel.wrapThreshold) % total) - total / 2
      }

      const wrappedOffset = wrapOffset(magazineOffset, totalSpacing)

      // Calculate target position exactly as specified
      finalPosition.set(
        POSITION.PORTRAIT.X + (page > 0 ? SPACING.PORTRAIT.PAGE_OPEN_OFFSET : 0),
        wrappedOffset,
        POSITION.PORTRAIT.Z,
      )

      // Bring current middle magazine closer to camera
      if (currentMiddleMagazine === magazine) {
        finalPosition.z += SPACING.PORTRAIT.Z_OFFSET
      }

      // Check if we're wrapping around
      const isWrapping =
        Math.abs(magazineRef.position.y - wrappedOffset) > spacing * gestureConfig.interaction.carousel.wrapThreshold

      if (isWrapping) {
        const currentY = magazineRef.position.y
        const direction = wrappedOffset > currentY ? 1 : -1

        // If we need to jump, do the initial jump
        if (magazineRef.needsJump) {
          magazineRef.position.set(finalPosition.x, wrappedOffset + direction * spacing, finalPosition.z)
          magazineRef.needsJump = false
        } else {
          // After jump, interpolate to final position
          magazineRef.position.lerp(finalPosition, lerpConfig.carousel)
        }
      } else {
        // Reset needsJump when not wrapping
        magazineRef.needsJump = true
        // Smooth interpolation for adjacent positions
        magazineRef.position.lerp(finalPosition, lerpConfig.carousel)
      }
    } else {
      // Landscape mode positioning
      const magazineConfig = POSITION.LANDSCAPE[magazine.toUpperCase()]
      const buttonConfig = POSITION.LANDSCAPE.BUTTON
      const dragOffsetValue = SPACING.LANDSCAPE.DRAG_OFFSET
      const pageOffsetValue = SPACING.LANDSCAPE.PAGE_OFFSET
      
      switch (magazine) {
        case 'engineer':
          finalPosition.set(
            magazineConfig.X +
              (dragOffset > 0 ? dragOffsetValue : 0) +
              (page > 0 ? buttonConfig.X : 0),
            magazineConfig.Y,
            magazineConfig.Z - (dragOffset > 0 ? dragOffsetValue : 0),
          )
          break
        case 'vague':
          finalPosition.set(
            magazineConfig.X + (page > 0 ? buttonConfig.X : 0),
            magazineConfig.Y,
            magazineConfig.Z - (page > 0 ? pageOffsetValue : 0),
          )
          break
        case 'smack':
          finalPosition.set(
            magazineConfig.X +
              (dragOffset > 0 ? dragOffsetValue : 0) +
              (page > 0 ? buttonConfig.X : 0),
            magazineConfig.Y,
            magazineConfig.Z - (dragOffset > 0 ? dragOffsetValue : 0),
          )
          break
      }
    }
  } else {
    // When focused, lerp to target position
    finalPosition.copy(targetPosition)
  }

  // Apply position with lerping
  if (magazineRef.position) {
    magazineRef.position.lerp(finalPosition, lerpConfig.carousel)
  } else {
    magazineRef.position = finalPosition.clone()
  }
}

/**
 * Performs linear interpolation between two vectors
 * @param {THREE.Vector3} current - Vector to modify
 * @param {THREE.Vector3} target - Target vector
 * @param {number} lerpFactor - Interpolation factor (0-1)
 * @returns {THREE.Vector3} Modified vector (same as current)
 */
export const performLerp = (current, target, lerpFactor) => {
  current.lerp(target, lerpFactor)
  return current
}

/**
 * Gets the button position configuration
 * @param {boolean} isPortrait - Whether in portrait orientation
 * @returns {Object|null} Button position config or null
 */
export const getButtonPosition = (isPortrait) => {
  return isPortrait ? null : POSITION.LANDSCAPE.BUTTON
}

/**
 * Calculates the magazine position in landscape mode
 * @param {string} magazine - Magazine identifier
 * @param {number} dragOffset - Current drag offset
 * @param {number} page - Current page number
 * @param {boolean} isPortrait - Whether in portrait orientation
 * @returns {THREE.Vector3} Position vector
 */
export const calculateMagazinePosition = (magazine, dragOffset, page, isPortrait) => {
  const position = new THREE.Vector3()

  if (isPortrait) {
    position.set(
      POSITION.PORTRAIT.X + (page > 0 ? SPACING.PORTRAIT.PAGE_OPEN_OFFSET : 0), 
      0, 
      POSITION.PORTRAIT.Z
    )
  } else {
    const magazineConfig = POSITION.LANDSCAPE[magazine.toUpperCase()]
    const buttonConfig = POSITION.LANDSCAPE.BUTTON
    const dragOffsetValue = SPACING.LANDSCAPE.DRAG_OFFSET
    const pageOffsetValue = SPACING.LANDSCAPE.PAGE_OFFSET
    
    position.set(
      magazineConfig.X +
        (dragOffset > 0 ? dragOffsetValue || 0 : 0) +
        (page > 0 ? buttonConfig.X : 0),
      magazineConfig.Y,
      magazineConfig.Z - (page > 0 ? pageOffsetValue || 0 : 0),
    )
  }

  return position
}

/**
 * Checks if a magazine is in the middle position
 * @param {Object} params - Parameters for middle check
 * @param {THREE.Vector3} params.position - Current position
 * @param {boolean} params.isPortrait - Whether in portrait orientation
 * @returns {boolean} True if magazine is in middle position
 */
export const isMiddleMagazine = ({ position, isPortrait }) => {
  const thresholdValue = THRESHOLD.CAROUSEL.MIDDLE
  if (isPortrait) {
    return Math.abs(position.y) < thresholdValue
  }
  return Math.abs(position.x) < thresholdValue
}

/**
 * Applies hover effect to magazine position
 * @param {Object} params - Parameters for hover effect
 * @param {THREE.Vector3} params.position - Position to modify
 * @param {boolean} params.isHovered - Whether magazine is hovered
 * @param {string} params.magazine - Magazine identifier
 * @param {boolean} params.isPortrait - Whether in portrait orientation
 * @returns {THREE.Vector3} Updated position
 */
export const hoverMagazine = ({ position, isHovered, magazine, isPortrait }) => {
  if (!isPortrait) {
    const magazineConfig = POSITION.LANDSCAPE[magazine.toUpperCase()]
    if (magazineConfig) {
      const targetPosition = position.clone()

      // Apply z-axis hover effect (moving towards camera)
      targetPosition.z = magazineConfig.Z + (isHovered ? SPACING.LANDSCAPE.Z_OFFSET : 0)

      // Apply x-axis hover effect for side magazines
      const hoverOffset = HOVER.LANDSCAPE[magazine.toUpperCase()]
      if (hoverOffset && isHovered) {
        targetPosition.x = magazineConfig.X + hoverOffset.X
      } else {
        targetPosition.x = magazineConfig.X
      }

      performLerp(position, targetPosition, LERP.BUTTON.TEXT)
    }
  }

  return position
}

/**
 * Calculates and applies Float nullification for focused or hovered elements
 * @param {Object} params - Parameters for float nullification
 */
export const applyFloatNullification = ({ floatRef, nullifyRef, shouldNullify }) => {
  if (!floatRef || !nullifyRef) return

  const floatGroup = floatRef

  if (shouldNullify) {
    nullifyRef.matrix.copy(floatGroup.matrix).invert()
    nullifyRef.matrixAutoUpdate = false
  } else {
    nullifyRef.matrix.identity()
    nullifyRef.matrixAutoUpdate = true
  }
}

/**
 * Calculates button position with Float nullification
 * @param {Object} params - Parameters for button position
 * @returns {THREE.Vector3} Button position
 */
export const calculateButtonPosition = ({
  position,
  camera,
  isHovered,
  isPortrait,
  floatRef,
  buttonRef,
  floatQuaternion,
  uprightQuaternion,
}) => {
  if (isPortrait || !buttonRef) return position.clone() // Return the current position if in portrait mode

  const buttonConfig = POSITION.LANDSCAPE.BUTTON
  const hoverConfig = HOVER.LANDSCAPE.BUTTON
  const targetPos = new THREE.Vector3()

  if (isHovered) {
    // Calculate centered position at bottom of viewport
    targetPos.copy(camera.position)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize()
    targetPos.addScaledVector(forward, hoverConfig.Z)
    targetPos.y = hoverConfig.Y

    // Apply Float nullification if needed
    if (floatRef) {
      const floatMatrix = new THREE.Matrix4()
      floatRef.updateWorldMatrix(true, false)
      floatMatrix.copy(floatRef.matrixWorld)
      const floatInverseMatrix = floatMatrix.clone().invert()
      targetPos.applyMatrix4(floatInverseMatrix)
    }
  } else {
    targetPos.set(buttonConfig.X, buttonConfig.Y, buttonConfig.Z)
  }

  return targetPos
}
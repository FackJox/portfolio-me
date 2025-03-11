/**
 * Position calculation helper functions for Contents components
 */

import * as THREE from 'three'
import { SPACING, POSITION } from '@/constants/contents/layout'
import { TIMING } from '@/constants/contents/animation'
import { SmackContents, EngineerContents, VagueContents } from '@/constants/contents/config'

/**
 * Gets the appropriate content spacing configuration based on view mode
 * @param {boolean} isPortrait - Whether in portrait orientation
 * @returns {Object} Spacing configuration for current orientation
 */
export const getSpacingConfig = (isPortrait) => {
  return {
    positions: {
      button: {
        hover: {
          y: -1.2, // Button hover Y position
        }
      }
    }
  }
}

/**
 * Calculates the positions for skill text elements in a stacked layout.
 * Skills are arranged in two columns: creative (left) and engineering (right).
 * Each column is vertically centered and skills are evenly spaced within their column.
 *
 * @param {Array} skills - Array of skill objects, each containing at least {isEngineering: boolean}
 * @param {number} vpWidth - Viewport width in pixels
 * @param {number} vpHeight - Viewport height in pixels
 * @param {boolean} isPortrait - Indicates if the viewport is in portrait mode
 * @returns {Object} Layout configuration containing:
 *   - positions: Array of [x, y, z] coordinates for final positions
 *   - startPositions: Array of [x, y, z] coordinates for initial animation positions
 *   - delays: Array of animation delay times in milliseconds
 */
export const calculateStackPositions = (skills, vpWidth, vpHeight, isPortrait = false) => {
  const positions = []
  const startPositions = []
  const delays = []

  // Separate skills into columns
  const creativeSkills = skills.filter((skill) => !skill.isEngineering)
  const engineeringSkills = skills.filter((skill) => skill.isEngineering)

  // Calculate column offset
  const columnOffset = 0.75 // Distance between columns
  
  // Use appropriate z position based on orientation
  const zPosition = isPortrait ? POSITION.PORTRAIT_CONTENT_GROUP : POSITION.CONTENT_GROUP
  
  if (isPortrait) {
    // PORTRAIT MODE: Interlace skills vertically
    // Get the total number of skills and calculate fixed vertical spacing
    const totalSkills = creativeSkills.length + engineeringSkills.length
    // Use fixed spacing from constants
    const verticalSpacing = SPACING.FIXED_SKILL_SPACING_PORTRAIT
    
    // Negative offset for horizontal overlap in the center
    const portraitColumnOffset = columnOffset * -5
    
    // Position creative skills (left side)
    creativeSkills.forEach((_, index) => {
      // Calculate y position - evenly space creative skills
      const y = ((index * 2) - (totalSkills - 1) / 2) * verticalSpacing
      
      positions.unshift([-portraitColumnOffset, y, zPosition])
      startPositions.unshift([-portraitColumnOffset, vpHeight + verticalSpacing * index, zPosition])
      delays.unshift(index * 2 * TIMING.STAGGER_DELAY_STACK)
    })
    
    // Position engineering skills (right side)
    engineeringSkills.forEach((_, index) => {
      // Calculate y position - offset by one position to interlace with creative skills
      const y = ((index * 2 + 1) - (totalSkills - 1) / 2) * verticalSpacing
      
      positions.push([portraitColumnOffset, y, zPosition])
      startPositions.push([portraitColumnOffset, -vpHeight - verticalSpacing * index, zPosition])
      delays.push((index * 2 + 1) * TIMING.STAGGER_DELAY_STACK)
    })
  } else {
    // LANDSCAPE MODE: Original column-based layout
    // Use fixed spacing from constants
    const creativeSpacing = SPACING.FIXED_SKILL_SPACING_LANDSCAPE
    const engineeringSpacing = SPACING.FIXED_SKILL_SPACING_LANDSCAPE

    // Calculate positions for creative skills (left column) if any exist
    creativeSkills.forEach((_, index) => {
      // Center the stack vertically and apply creative spacing
      const y = (index - (creativeSkills.length - 1) / 2) * creativeSpacing
      // Add to the start of the arrays to ensure creative skills are processed first
      positions.unshift([-columnOffset, y, zPosition])
      startPositions.unshift([-columnOffset, vpHeight + creativeSpacing * index, zPosition])
      delays.unshift(index * TIMING.STAGGER_DELAY_STACK)
    })

    // Calculate positions for engineering skills (right column)
    engineeringSkills.forEach((_, index) => {
      // Center the stack vertically and apply engineering spacing
      const y = (index - (engineeringSkills.length - 1) / 2) * engineeringSpacing
      // Add to the end of the arrays for engineering skills
      positions.push([columnOffset, y, zPosition])
      startPositions.push([columnOffset, -vpHeight - engineeringSpacing * index, zPosition])
      delays.push((creativeSkills.length + index) * TIMING.STAGGER_DELAY_STACK)
    })
  }

  return { positions, startPositions, delays }
}

/**
 * Calculates explosion positions for skills when one is clicked.
 * The clicked skill moves to center while others explode outward in a circular pattern.
 *
 * @param {Array} skills - Array of skill objects, each containing at least {content: string}
 * @param {number} vpWidth - Viewport width in pixels
 * @param {number} vpHeight - Viewport height in pixels
 * @param {string} clickedContent - Content text of the clicked skill
 * @param {boolean} isPortrait - Indicates if the viewport is in portrait mode
 * @returns {Object} Explosion configuration containing:
 *   - positions: Array of [x, y, z] coordinates for exploded positions
 *   - delays: Array of animation delay times in milliseconds
 */
export const calculateExplosionPositions = (skills, vpWidth, vpHeight, clickedContent, isPortrait = false) => {
  const positions = []
  const delays = []
  const radius = Math.max(vpWidth, vpHeight) * SPACING.EXPLOSION_RADIUS_MULTIPLIER
  const nonClickedSkills = skills.filter((skill) => skill.content !== clickedContent)

  // Use appropriate z position based on orientation
  const zPosition = isPortrait ? POSITION.PORTRAIT_CONTENT_GROUP : POSITION.CONTENT_GROUP

  // Guard: If there are no non-clicked skills, angleStep would be undefined (2π/0)
  // In this case, we don't need to calculate angles as there are no skills to position
  const angleStep = nonClickedSkills.length > 0 ? (2 * Math.PI) / nonClickedSkills.length : 0
  let currentAngle = 0

  skills.forEach((skill, index) => {
    if (skill.content === clickedContent) {
      // Center position for clicked skill
      positions.push([0, 0, 0])
      delays.push(0)
    } else {
      // Only calculate circular positions if we have non-clicked skills
      if (nonClickedSkills.length > 0) {
        const x = Math.cos(currentAngle) * radius
        const y = Math.sin(currentAngle) * radius
        positions.push([x, y, zPosition])
        delays.push(index * TIMING.EXPLOSION_STAGGER_DELAY)
        currentAngle += angleStep
      } else {
        // Fallback position if this is the only skill (shouldn't occur in normal cases)
        positions.push([0, 0, zPosition])
        delays.push(index * TIMING.EXPLOSION_STAGGER_DELAY)
      }
    }
  })

  return { positions, delays }
}

/**
 * Gets the number of pages for a given title by searching through all content sources.
 *
 * @param {string} title - The title to search for (case-sensitive)
 * @returns {number} The number of pages for the matching title, or 0 if not found
 */
export const getPageCountForTitle = (title) => {
  const contentSources = [SmackContents, EngineerContents, VagueContents]

  for (const source of contentSources) {
    for (const contentItem of Object.values(source)) {
      if (contentItem.title === title) {
        return Object.keys(contentItem.pages).length
      }
    }
  }

  return 0
}

/**
 * Calculates cumulative page counts for an ordered array of titles.
 * Uses getPageCountForTitle to get individual counts and accumulates them.
 *
 * @param {string[]} titles - Ordered array of title strings to calculate cumulative counts for
 * @returns {number[]} Array of cumulative page counts
 */
export const getCumulativePageCounts = (titles) => {
  let sum = 0
  return titles.map((title) => {
    sum += getPageCountForTitle(title)
    return sum
  })
}

/**
 * Calculates scroll thresholds for each title's enter, stationary, and exit positions.
 * Uses cumulative page counts to determine when each title should transition during scrolling.
 *
 * @param {string[]} titles - Ordered array of title strings
 * @param {number} baseAngle - Base angle value for calculating thresholds
 * @returns {Array<{
 *   title: string,
 *   enter: number,
 *   stationary: number,
 *   exit: number,
 *   pageCount: number
 * }>} Array of threshold objects for each title
 */
export const getTitleScrollThresholds = (titles, baseAngle) => {
  const cumulativeCounts = getCumulativePageCounts(titles)

  return titles.map((title, index) => {
    const pageCount = getPageCountForTitle(title)

    if (index === 0) {
      return {
        title,
        enter: 0,
        stationary: 0,
        exit: baseAngle * cumulativeCounts[0] - baseAngle,
        pageCount,
      }
    }

    return {
      title,
      enter: baseAngle * cumulativeCounts[index - 1] - 0.5 * baseAngle,
      stationary: baseAngle * cumulativeCounts[index - 1],
      exit: baseAngle * cumulativeCounts[index] - baseAngle,
      pageCount,
    }
  })
}

/**
 * Computes the effective rotation angle and phase for a title based on current scroll position
 * and its threshold values.
 *
 * @param {number} currentRotation - Current scroll-based rotation value
 * @param {Object} threshold - Threshold object containing enter, stationary, and exit values
 * @param {number} nextThreshold - The threshold value for the next title's enter phase or current title's exit + baseAngle
 * @returns {Object} Object containing:
 *   - effectiveRotation: number (the calculated rotation angle)
 *   - phase: string ('waiting' | 'entering' | 'stationary' | 'exiting' | 'hidden')
 *   - opacity: number (calculated opacity value between 0 and 1)
 */
export const computeEffectiveRotation = (currentRotation, threshold, nextThreshold) => {
  let effectiveRotation
  let phase
  let opacity = 1

  if (currentRotation < threshold.enter) {
    // Waiting phase: title starts at -90 degrees (bottom)
    effectiveRotation = -90
    phase = 'waiting'
    opacity = 0
  } else if (currentRotation >= threshold.enter && currentRotation < threshold.stationary) {
    // Enter phase: rotate from -90 to 0 degrees
    const progress = (currentRotation - threshold.enter) / (threshold.stationary - threshold.enter)
    effectiveRotation = -90 + progress * 90
    phase = 'entering'
    opacity = Math.max(0, progress)
  } else if (currentRotation >= threshold.stationary && currentRotation < threshold.exit) {
    // Stationary phase: hold at 0 degrees
    effectiveRotation = 0
    phase = 'stationary'
    opacity = 1
  } else if (currentRotation >= threshold.exit && currentRotation < nextThreshold) {
    // Exit phase: rotate from 0 to 90 degrees
    const progress = (currentRotation - threshold.exit) / (nextThreshold - threshold.exit)
    effectiveRotation = progress * 90
    phase = 'exiting'
    opacity = Math.max(0, 1 - progress)
  } else {
    // Hidden phase: stay at 90 degrees (top)
    effectiveRotation = 90
    phase = 'hidden'
    opacity = 0
  }

  return {
    effectiveRotation,
    phase,
    opacity,
  }
}
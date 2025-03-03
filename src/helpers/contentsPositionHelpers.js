// portfolio-me/src/utils/contentsPositionHelpers.js
import * as THREE from 'three'
import { SmackContents, EngineerContents, VagueContents } from './contentsConfig'

// Constants for layout configuration
/**
 * Factor used to determine the height of the stacked skills relative to viewport height.
 * Value of 0.3 means the stack will occupy 30% of the viewport height.
 */
const STACK_HEIGHT_FACTOR = 0.4

/**
 * Divisor used to calculate horizontal offset between creative and engineering columns.
 * A larger value creates a smaller gap between columns.
 */
const COLUMN_OFFSET_DIVISOR = 75

/**
 * Default z-index for positioning skills in 3D space.
 * Negative value places elements "into" the screen.
 */
const DEFAULT_Z = -5

/**
 * Delay (in ms) between each skill animation in the stack layout.
 * Controls the cascading animation effect of skills appearing.
 */
const STAGGER_DELAY_STACK = 100

/**
 * Multiplier for explosion radius relative to viewport dimensions.
 * Value > 1 means skills will explode beyond viewport boundaries.
 */
const EXPLOSION_RADIUS_MULTIPLIER = 1.5

/**
 * Delay (in ms) between each skill animation during explosion effect.
 * Controls the sequential timing of skills exploding outward.
 */
const EXPLOSION_STAGGER_DELAY = 50

/**
 * Calculates the positions for skill text elements in a stacked layout.
 * Skills are arranged in two columns: creative (left) and engineering (right).
 * Each column is vertically centered and skills are evenly spaced within their column.
 *
 * @param {Array} skills - Array of skill objects, each containing at least {isEngineering: boolean}
 * @param {number} vpWidth - Viewport width in pixels
 * @param {number} vpHeight - Viewport height in pixels
 * @returns {Object} Layout configuration containing:
 *   - positions: Array of [x, y, z] coordinates for final positions
 *   - startPositions: Array of [x, y, z] coordinates for initial animation positions
 *   - delays: Array of animation delay times in milliseconds
 *
 * @remarks
 * - Guards against empty skill arrays to prevent division by zero
 * - Creative skills enter from top, engineering skills from bottom
 * - Column spacing is proportional to viewport width
 * - Stack height is proportional to viewport height (controlled by STACK_HEIGHT_FACTOR)
 */
export const calculateStackPositions = (skills, vpWidth, vpHeight) => {
  const positions = []
  const startPositions = []
  const delays = []

  // Separate skills into columns
  const creativeSkills = skills.filter((skill) => !skill.isEngineering)
  const engineeringSkills = skills.filter((skill) => skill.isEngineering)

  // Guard against empty skill arrays to prevent division by zero
  // If no skills in a category, spacing will be 0 (no vertical distribution needed)
  const creativeSpacing = creativeSkills.length > 0 ? (vpHeight * STACK_HEIGHT_FACTOR) / creativeSkills.length : 0
  const engineeringSpacing =
    engineeringSkills.length > 0 ? (vpHeight * STACK_HEIGHT_FACTOR) / engineeringSkills.length : 0
  const columnOffset = vpWidth / COLUMN_OFFSET_DIVISOR // Distance between columns

  // Calculate positions for creative skills (left column) if any exist
  creativeSkills.forEach((_, index) => {
    // Center the stack vertically and apply creative spacing
    const y = (index - (creativeSkills.length - 1) / 2) * creativeSpacing
    // Add to the start of the arrays to ensure creative skills are processed first
    positions.unshift([-columnOffset, y, DEFAULT_Z])
    startPositions.unshift([-columnOffset, vpHeight + creativeSpacing * index, DEFAULT_Z])
    delays.unshift(index * STAGGER_DELAY_STACK)
  })

  // Calculate positions for engineering skills (right column)
  engineeringSkills.forEach((_, index) => {
    // Center the stack vertically and apply engineering spacing
    const y = (index - (engineeringSkills.length - 1) / 2) * engineeringSpacing
    // Add to the end of the arrays for engineering skills
    positions.push([columnOffset, y, DEFAULT_Z])
    startPositions.push([columnOffset, -vpHeight - engineeringSpacing * index, DEFAULT_Z])
    delays.push((creativeSkills.length + index) * STAGGER_DELAY_STACK)
  })

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
 * @returns {Object} Explosion configuration containing:
 *   - positions: Array of [x, y, z] coordinates for exploded positions
 *   - delays: Array of animation delay times in milliseconds
 *
 * @remarks
 * - Guards against scenarios where there's only one skill (no explosion needed)
 * - Explosion radius is proportional to the larger viewport dimension
 * - Clicked skill moves to center (0, 0, 0)
 * - Other skills distribute evenly in a circle around center
 * - Animation delays create sequential explosion effect
 */
export const calculateExplosionPositions = (skills, vpWidth, vpHeight, clickedContent) => {
  const positions = []
  const delays = []
  const radius = Math.max(vpWidth, vpHeight) * EXPLOSION_RADIUS_MULTIPLIER
  const nonClickedSkills = skills.filter((skill) => skill.content !== clickedContent)

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
        positions.push([x, y, DEFAULT_Z])
        delays.push(index * EXPLOSION_STAGGER_DELAY)
        currentAngle += angleStep
      } else {
        // Fallback position if this is the only skill (shouldn't occur in normal cases)
        positions.push([0, 0, DEFAULT_Z])
        delays.push(index * EXPLOSION_STAGGER_DELAY)
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
 *
 * @example
 * const pageCount = getPageCountForTitle("My Project");
 * console.log(pageCount); // Returns the number of pages or 0 if not found
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
 *
 * @example
 * const titles = ["Project A", "Project B", "Project C"];
 * const counts = getCumulativePageCounts(titles);
 * // If individual counts are [2, 4, 3], returns [2, 6, 9]
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
 *
 * @example
 * const titles = ["Project A", "Project B"];
 * const thresholds = getTitleScrollThresholds(titles, 171.25);
 * // Returns array of objects with enter/stationary/exit thresholds and page counts
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

// portfolio-me/src/utils/contentsPositionHelpers.js
import * as THREE from 'three'

/**
 * Calculates the positions for skill text elements in a stacked layout
 * @param {Array} skills - Array of skill objects
 * @param {number} vpWidth - Viewport width
 * @param {number} vpHeight - Viewport height
 * @returns {Object} Object containing positions, startPositions, and delays arrays
 */
export const calculateStackPositions = (skills, vpWidth, vpHeight) => {
  const positions = []
  const startPositions = []
  const delays = []

  // Separate skills into columns
  const creativeSkills = skills.filter((skill) => !skill.isEngineering)
  const engineeringSkills = skills.filter((skill) => skill.isEngineering)

  // Calculate spacing for each column independently
  const creativeSpacing = (vpHeight * 0.3) / creativeSkills.length
  const engineeringSpacing = (vpHeight * 0.3) / engineeringSkills.length
  const columnOffset = vpWidth / 75 // Distance between columns
  const staggerDelay = 100 // Delay between each skill in ms

  // Calculate positions for creative skills (left column)
  creativeSkills.forEach((_, index) => {
    // Center the stack vertically and apply creative spacing
    const y = (index - (creativeSkills.length - 1) / 2) * creativeSpacing
    // Add to the start of the arrays to ensure creative skills are processed first
    positions.unshift([-columnOffset, y, -5])
    startPositions.unshift([-columnOffset, vpHeight + creativeSpacing * index, -5])
    delays.unshift(index * staggerDelay)
  })

  // Calculate positions for engineering skills (right column)
  engineeringSkills.forEach((_, index) => {
    // Center the stack vertically and apply engineering spacing
    const y = (index - (engineeringSkills.length - 1) / 2) * engineeringSpacing
    // Add to the end of the arrays for engineering skills
    positions.push([columnOffset, y, -5])
    startPositions.push([columnOffset, -vpHeight - engineeringSpacing * index, -5])
    delays.push((creativeSkills.length + index) * staggerDelay)
  })

  return { positions, startPositions, delays }
}

/**
 * Calculates explosion positions for skills when one is clicked
 * @param {Array} skills - Array of skill objects
 * @param {number} vpWidth - Viewport width
 * @param {number} vpHeight - Viewport height
 * @param {string} clickedContent - Content of the clicked skill
 * @returns {Object} Object containing explosion positions and delays
 */
export const calculateExplosionPositions = (skills, vpWidth, vpHeight, clickedContent) => {
  const positions = []
  const delays = []
  const radius = Math.max(vpWidth, vpHeight) * 1.5 // Large enough to ensure skills go off screen
  const nonClickedSkills = skills.filter((skill) => skill.content !== clickedContent)
  const angleStep = (2 * Math.PI) / nonClickedSkills.length // Divide circle by number of non-clicked skills
  let currentAngle = 0
  const staggerDelay = 50 // Delay between each exploding skill

  skills.forEach((skill, index) => {
    if (skill.content === clickedContent) {
      // Reserve space for clicked skill, but let handleSkillClick set the actual position
      positions.push([0, 0, 0])
      delays.push(0)
    } else {
      // Calculate position on circle for other skills
      const x = Math.cos(currentAngle) * radius
      const y = Math.sin(currentAngle) * radius
      positions.push([x, y, -5])
      delays.push(index * staggerDelay)
      currentAngle += angleStep
    }
  })

  return { positions, delays }
}

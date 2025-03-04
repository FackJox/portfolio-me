import * as THREE from 'three'
import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useViewportMeasurements } from '@/helpers/deviceHelpers'
import { calculateStackPositions, calculateExplosionPositions } from '@/helpers/contentsPositionHelpers'
import { getSpacingConfig } from '@/helpers/magazinePositionHelpers'
import { ANIMATION, LAYOUT } from './Constants'
import SkillText from './SkillText'

/**
 * SkillStack component manages a collection of SkillText elements with animations
 * 
 * @param {Object} props - Component props
 * @param {Array} props.skills - Array of skill objects
 * @param {Function} props.onSkillClick - Click handler for skills
 */
const SkillStacks = forwardRef(({ skills, onSkillClick }, ref) => {
  const { camera } = useThree()
  const { vpWidth: pixelWidth, vpHeight: pixelHeight } = useViewportMeasurements(false)

  // Convert pixel measurements to Three.js units
  const vpWidth = pixelWidth / LAYOUT.VIEWPORT.MAIN_DIVIDER
  const vpHeight = pixelHeight / LAYOUT.VIEWPORT.MAIN_DIVIDER

  const [activeSkills, setActiveSkills] = useState([])
  const [hoveredStates, setHoveredStates] = useState({})
  const [explodedSkill, setExplodedSkill] = useState(null)
  const [isReady, setIsReady] = useState(false)

  // Replace state with refs for animation values
  const targetPositionsRef = useRef([])
  const currentPositionsRef = useRef([])
  const delaysRef = useRef([])
  const startTimeRef = useRef(0)
  const skillRefs = useRef([])
  const positionRefs = useRef([])
  const movingSkillsRef = useRef(new Set())
  const resetStatesRef = useRef({})
  const isInitialAnimationRef = useRef(true)
  const previousXPositionRef = useRef(null)
  const lastLoggedTimeRef = useRef(0)
  const lastStateRef = useRef(null)

  // Cache vector objects for reuse
  const tempVec3 = useRef(new THREE.Vector3())
  const tempForward = useRef(new THREE.Vector3(0, 0, -1))
  const tempTargetPos = useRef(new THREE.Vector3())

  // Trigger a rerender when animation states change significantly
  const [animationStateVersion, setAnimationStateVersion] = useState(0)

  /**
   * Initialize skill positions and animation states.
   */
  useEffect(() => {
    if (skills.length > 0) {
      const { positions, startPositions, delays } = calculateStackPositions(skills, vpWidth, vpHeight)
      targetPositionsRef.current = positions
      currentPositionsRef.current = startPositions
      delaysRef.current = delays
      setActiveSkills(skills.map((skill, index) => ({ skill, index })))
      skillRefs.current = skills.map(() => ({ position: new THREE.Vector3() }))
      positionRefs.current = startPositions.map((pos) => new THREE.Vector3(pos[0], pos[1], pos[2]))

      const timer = setTimeout(() => {
        startTimeRef.current = performance.now()
        setIsReady(true)
      }, ANIMATION.DELAY.INITIAL)

      return () => clearTimeout(timer)
    }
  }, [skills, vpWidth, vpHeight])

  /**
   * Handle skill click interactions and position updates.
   */
  const handleSkillClick = useCallback(
    (content, textWidth) => {
      isInitialAnimationRef.current = false
      const now = performance.now()
      if (content === 'Three.js') {
        console.log('Click:', content, explodedSkill === content)
        lastLoggedTimeRef.current = now
      }

      if (explodedSkill === content) {
        const { positions, delays } = calculateStackPositions(skills, vpWidth, vpHeight)
        if (content === 'Three.js') {
          const newPosition = positions.find((_, i) => skills[i].content === content)
          console.log('Stack position:', content, newPosition)
        }
        targetPositionsRef.current = positions
        delaysRef.current = delays
        setExplodedSkill(null)
        movingSkillsRef.current = new Set([...skills.map((skill) => skill.content)])
        onSkillClick(null) // Clear carousel when collapsing

        // Update reset states
        resetStatesRef.current = {}
        skills.forEach((skill) => {
          resetStatesRef.current[skill.content] = true
        })
      } else {
        const { positions, delays } = calculateExplosionPositions(skills, vpWidth, vpHeight, content)

        const clickedIndex = skills.findIndex((skill) => skill.content === content)
        if (clickedIndex !== -1) {
          tempForward.current.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize()
          tempTargetPos.current.copy(camera.position)
          const buttonConfig = getSpacingConfig(false).positions.button
          tempTargetPos.current.addScaledVector(tempForward.current, buttonConfig.hover.z + 1)
          tempTargetPos.current.y = buttonConfig.hover.y

          // Set target position with x=0 for centering
          positions[clickedIndex] = [0, tempTargetPos.current.y, tempTargetPos.current.z]
        }

        targetPositionsRef.current = positions
        delaysRef.current = delays
        setExplodedSkill(content)
        movingSkillsRef.current = new Set([...skills.map((skill) => skill.content)])
        resetStatesRef.current = {}
        onSkillClick(content) // Pass clicked skill to parent
      }
      startTimeRef.current = performance.now()
      setAnimationStateVersion((v) => v + 1)
    },
    [camera, explodedSkill, onSkillClick, skills, vpHeight, vpWidth],
  )

  // Function to trigger stack animation
  const triggerStackAnimation = useCallback(() => {
    const { positions, delays } = calculateStackPositions(skills, vpWidth, vpHeight)
    targetPositionsRef.current = positions
    delaysRef.current = delays
    movingSkillsRef.current = new Set([...skills.map((skill) => skill.content)])
    resetStatesRef.current = {}
    skills.forEach((skill) => {
      resetStatesRef.current[skill.content] = true
    })
    startTimeRef.current = performance.now()
    setAnimationStateVersion((v) => v + 1)
  }, [skills, vpWidth, vpHeight])

  // Expose methods through ref
  useImperativeHandle(
    ref,
    () => ({
      handleSkillClick,
      triggerStackAnimation,
    }),
    [handleSkillClick, triggerStackAnimation],
  )

  const handleHoverChange = (index, isHovered) => {
    setHoveredStates((prev) => ({
      ...prev,
      [index]: isHovered,
    }))
  }

  /**
   * Animation frame update for skill positions.
   */
  useFrame(() => {
    if (!isReady) return

    const positions = currentPositionsRef.current
    const targets = targetPositionsRef.current
    if (positions.length === targets.length) {
      const elapsed = performance.now() - startTimeRef.current
      let significantChanges = false

      positions.forEach((pos, index) => {
        if (elapsed < delaysRef.current[index]) return

        const target = targets[index]
        const skill = activeSkills[index]?.skill
        const currentPos = positionRefs.current[index]
        const prevPos = currentPos.clone()

        // Set target position
        tempVec3.current.set(target[0], target[1], target[2])

        // Apply lerp with different speeds for x and y/z
        const xLerpSpeed = ANIMATION.LERP.POSITION.X_AXIS
        const normalLerpSpeed = ANIMATION.LERP.POSITION.NORMAL

        // Determine if we're near the bottom position (using y coordinate as reference)
        const buttonY = getSpacingConfig(false).positions.button.hover.y
        const isNearBottom = Math.abs(currentPos.y - buttonY) < ANIMATION.THRESHOLD.BOTTOM_PROXIMITY

        // Only lerp x when not near bottom
        if (!isNearBottom) {
          currentPos.x = THREE.MathUtils.lerp(currentPos.x, tempVec3.current.x, xLerpSpeed)
        } else {
          // Instantly set x position when near bottom
          currentPos.x = tempVec3.current.x
        }

        // Lerp y and z
        currentPos.y = THREE.MathUtils.lerp(currentPos.y, tempVec3.current.y, normalLerpSpeed)
        currentPos.z = THREE.MathUtils.lerp(currentPos.z, tempVec3.current.z, normalLerpSpeed)

        // Check if this skill has reached its target position
        if (currentPos.distanceTo(tempVec3.current) < ANIMATION.THRESHOLD.POSITION_CHANGE) {
          if (movingSkillsRef.current.has(skill.content)) {
            movingSkillsRef.current.delete(skill.content)
            significantChanges = true

            // Check for bottom position state
            if (target[1] === buttonY && !resetStatesRef.current[skill.content]?.isBottomPosition) {
              resetStatesRef.current[skill.content] = {
                isBottomPosition: true,
              }
              significantChanges = true
            }
          }
        }

        // Update current positions array
        positions[index] = [currentPos.x, currentPos.y, currentPos.z]

        // Check if position changed significantly
        if (prevPos.distanceTo(currentPos) > ANIMATION.THRESHOLD.POSITION_CHANGE) {
          significantChanges = true
        }
      })

      // Only trigger rerender if there were significant changes
      if (significantChanges) {
        setAnimationStateVersion((v) => v + 1)
      }
    }
  })

  if (!isReady) return null

  return (
    <>
      {activeSkills.map(({ skill, index }) => {
        const currentPos = currentPositionsRef.current[index] || [0, vpHeight, -5]
        const isHovered = hoveredStates[index]
        const isMoving = movingSkillsRef.current.has(skill.content)
        const scale = isMoving
          ? ANIMATION.SCALE.DEFAULT
          : isHovered
            ? ANIMATION.SCALE.HOVER_LARGE
            : ANIMATION.SCALE.DEFAULT
        const elapsed = performance.now() - startTimeRef.current
        const isActive = isInitialAnimationRef.current ? elapsed >= delaysRef.current[index] : true
        const isInViewport = Math.abs(currentPos[0]) <= vpWidth * 1.5 && Math.abs(currentPos[1]) <= vpHeight * 1.5
        const opacity = isActive ? (isInViewport ? 1 : 0) : 0

        return (
          <SkillText
            key={`skill-${skill.content}-${index}`}
            content={skill.content}
            isEngineering={skill.isEngineering}
            onClick={handleSkillClick}
            position={currentPos}
            onHoverChange={(isHovered) => handleHoverChange(index, isHovered)}
            scale={scale}
            opacity={opacity}
            isMoving={isMoving}
            resetState={resetStatesRef.current[skill.content]}
          />
        )
      })}
    </>
  )
})

export default SkillStacks
import * as THREE from 'three'
import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useViewportMeasurements, useDeviceOrientation } from '@/helpers/global/device'
import { calculateStackPositions, calculateExplosionPositions, getSpacingConfig } from '@/helpers/contents/position'
import { ANIMATION } from '@/constants/contents/animation'
import { LAYOUT } from '@/constants/contents/layout'
import SkillText from './SkillText'

/**
 * SkillStack component manages a collection of SkillText elements with animations
 * 
 * @param {Object} props - Component props
 * @param {Array} props.skills - Array of skill objects
 * @param {Function} props.onSkillClick - Click handler for skills
 * @param {string} props.selectedSkill - Currently selected skill content
 */
const SkillStacks = forwardRef(({ skills, onSkillClick, selectedSkill }, ref) => {
  const { camera } = useThree()
  const { vpWidth: pixelWidth, vpHeight: pixelHeight } = useViewportMeasurements(false)
  const isPortrait = useDeviceOrientation();

  // Debug useEffect to log skills
  useEffect(() => {
    console.log('SkillStacks received skills:', skills);
    console.log('Skills array length:', skills?.length);
  }, [skills]);

  // Convert pixel measurements to Three.js units
  const vpWidth = pixelWidth / LAYOUT.VIEWPORT.MAIN_DIVIDER
  const vpHeight = pixelHeight / LAYOUT.VIEWPORT.MAIN_DIVIDER

  const [activeSkills, setActiveSkills] = useState([])
  const [hoveredStates, setHoveredStates] = useState({})
  const [isReady, setIsReady] = useState(false)

  // Track initialization state
  const hasInitializedRef = useRef(false)
  const prevOrientationRef = useRef(isPortrait)

  // Animation state refs
  const targetPositionsRef = useRef([])
  const currentPositionsRef = useRef([])
  const delaysRef = useRef([])
  const startTimeRef = useRef(0)
  const skillRefs = useRef([])
  const positionRefs = useRef([])
  const movingSkillsRef = useRef(new Set())
  const resetStatesRef = useRef({})
  const isInitialAnimationRef = useRef(true)

  // Cache vector objects for reuse
  const tempVec3 = useRef(new THREE.Vector3())
  const tempForward = useRef(new THREE.Vector3(0, 0, -1))
  const tempTargetPos = useRef(new THREE.Vector3())

  // Trigger a rerender when animation states change significantly
  const [animationStateVersion, setAnimationStateVersion] = useState(0)

  /**
   * Initialize skill positions and animation states
   */
  useEffect(() => {
    if (skills.length > 0) {
      // Calculate positions based on current orientation
      const { positions, startPositions, delays } = calculateStackPositions(skills, vpWidth, vpHeight, isPortrait)

      if (!hasInitializedRef.current) {
        // FIRST LOAD: Set up initial animation with start positions
        console.log('[SkillStacks] First initialization')
        targetPositionsRef.current = positions
        currentPositionsRef.current = startPositions
        delaysRef.current = delays
        setActiveSkills(skills.map((skill, index) => ({ skill, index })))
        skillRefs.current = skills.map(() => ({ position: new THREE.Vector3() }))
        positionRefs.current = startPositions.map((pos) => new THREE.Vector3(pos[0], pos[1], pos[2]))
        isInitialAnimationRef.current = true

        const timer = setTimeout(() => {
          startTimeRef.current = performance.now()
          setIsReady(true)
          hasInitializedRef.current = true
        }, ANIMATION.TIMING.INITIAL_DELAY)

        return () => clearTimeout(timer)
      }
      else if (prevOrientationRef.current !== isPortrait) {
        // ORIENTATION CHANGE: Update target positions but keep current positions
        console.log('[SkillStacks] Orientation changed, updating positions')
        targetPositionsRef.current = positions

        // Mark all skills as moving to trigger smooth transitions
        movingSkillsRef.current = new Set(skills.map((skill) => skill.content))

        // Don't reset current positions or animation state
        isInitialAnimationRef.current = false

        // Update animation state to trigger rerender
        setAnimationStateVersion((v) => v + 1)

        // Store new orientation
        prevOrientationRef.current = isPortrait
      }
    }
  }, [skills, vpWidth, vpHeight, isPortrait])

  console.log('[SkillStacks] isReady', isReady)
  console.log('[SkillStacks] currentPositionsRef.Current', currentPositionsRef.current)
  console.log('[SkillStacks] delayRef', delaysRef.current)


  /**
   * Handles animation and positioning logic for skills
   * @param {string} content - The skill content to animate
   * @param {boolean} isCollapsing - Whether we're collapsing the stack
   */
  const handleSkillAnimations = useCallback(
    (content, isCollapsing) => {
      console.log('Animation triggered:', { content, isCollapsing });
      isInitialAnimationRef.current = false

      if (isCollapsing) {
        const { positions, delays } = calculateStackPositions(skills, vpWidth, vpHeight, isPortrait)
        console.log('Collapse positions:', positions);
        targetPositionsRef.current = positions
        delaysRef.current = delays
        movingSkillsRef.current = new Set(skills.map((skill) => skill.content))
        resetStatesRef.current = Object.fromEntries(
          skills.map((skill) => [skill.content, true])
        )
      } else {
        const { positions, delays } = calculateExplosionPositions(skills, vpWidth, vpHeight, content, isPortrait)
        console.log('Explosion positions:', positions);
        console.log('targetPositionsRef.current', targetPositionsRef.current)
        const clickedIndex = skills.findIndex((skill) => skill.content === content)
        console.log('Clicked Skill Index:', clickedIndex)

        if (clickedIndex !== -1) {
          tempForward.current.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize()
          tempTargetPos.current.copy(camera.position)
          console.log('Computed target position for clicked skill:', tempTargetPos.current)
          const buttonConfig = getSpacingConfig(false).positions.button
          console.log('Button config:', buttonConfig)
          tempTargetPos.current.addScaledVector(tempForward.current, buttonConfig.hover.z + 1)
          tempTargetPos.current.y = buttonConfig.hover.y
          positions[clickedIndex] = [0, tempTargetPos.current.y, tempTargetPos.current.z]
        }

        targetPositionsRef.current = positions
        delaysRef.current = delays
        movingSkillsRef.current = new Set(skills.map((skill) => skill.content))
        resetStatesRef.current = {}
      }

      startTimeRef.current = performance.now()
      setAnimationStateVersion((v) => v + 1)
    },
    [camera, skills, vpWidth, vpHeight, isPortrait]
  )

  /**
   * Handle skill click events
   */
  const handleSkillClick = useCallback(
    (content, textWidth) => {
      onSkillClick?.(content)
    },
    [onSkillClick]
  )

  const handleHoverChange = useCallback((index, isHovered) => {
    setHoveredStates((prev) => ({
      ...prev,
      [index]: isHovered,
    }))
  }, [])

  // Expose methods through ref
  useImperativeHandle(
    ref,
    () => ({
      handleSkillClick,
      handleSkillAnimations
    }),
    [handleSkillClick, handleSkillAnimations]
  )

  /**
   * Animation frame update for skill positions
   */
  useFrame(() => {
    if (!isReady) return

    const positions = currentPositionsRef.current
    const targets = targetPositionsRef.current
    if (positions.length === targets.length) {
      const elapsed = performance.now() - startTimeRef.current
      let significantChanges = false

      positions.forEach((pos, index) => {
        // For initial animation, respect delays
        // For orientation changes, start moving immediately
        if (isInitialAnimationRef.current && elapsed < delaysRef.current[index]) return

        const target = targets[index]
        const skill = activeSkills[index]?.skill
        const currentPos = positionRefs.current[index]
        if (!currentPos) return

        const prevPos = currentPos.clone()

        // Set target position
        tempVec3.current.set(target[0], target[1], target[2])

        // Apply lerp with different speeds for x and y/z
        const xLerpSpeed = ANIMATION.LERP.POSITION.X_AXIS
        const normalLerpSpeed = ANIMATION.LERP.POSITION.NORMAL

        // Determine if we're near the bottom position
        const buttonY = getSpacingConfig(false).positions.button.hover.y
        const isNearBottom = Math.abs(currentPos.y - buttonY) < ANIMATION.THRESHOLD.BOTTOM_PROXIMITY

        // Only lerp x when not near bottom
        if (!isNearBottom) {
          currentPos.x = THREE.MathUtils.lerp(currentPos.x, tempVec3.current.x, xLerpSpeed)
        } else {
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
        const scale = isMoving ? ANIMATION.SCALE.DEFAULT : isHovered ? ANIMATION.SCALE.HOVER_LARGE : ANIMATION.SCALE.DEFAULT

        // For initial animation, respect delays
        // For orientation changes, show immediately
        const elapsed = performance.now() - startTimeRef.current
        const isActive = isInitialAnimationRef.current ? elapsed >= delaysRef.current[index] : true

        const isInViewport = Math.abs(currentPos[0]) <= vpWidth * 1.5 && Math.abs(currentPos[1]) <= vpHeight * 1.5
        const opacity = isActive ? (isInViewport ? 1 : 0) : 0
        const isForceClicked = skill.content === selectedSkill

        console.log(`[SkillStacks] Rendering SkillText ${skill.content}, forceClicked:`, isForceClicked)

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
            forceClicked={isForceClicked}
          />
        )
      })}
    </>
  )
})

export default SkillStacks
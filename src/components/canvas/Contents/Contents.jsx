import * as THREE from 'three'
import React, { useEffect, useRef, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text3D, OrthographicCamera } from '@react-three/drei'
import { skills, transformSkillsConfig, SmackContents, EngineerContents } from '@/helpers/contentsConfig'
import { calculateStackPositions, calculateExplosionPositions } from '@/helpers/contentsPositionHelpers'
import { performLerp, getSpacingConfig } from '@/helpers/magazinePositionHelpers'
import { useViewportMeasurements } from '@/helpers/deviceHelpers'
import { throttle } from '@/helpers/throttleHelpers'
import HKGroteskFont from './HKGrotesk-SemiBold.json'
import LemonFont from './Lemon_Regular.json'
import { useSetAtom } from 'jotai'
import { styleMagazineAtom, titleSlidesAtom } from '@/helpers/atoms'
import { PageCarousel } from '@/components/canvas/PageCarousel/PageCarousel'
import { getTexturePath } from '@/helpers/textureLoaders'

// Animation Constants
const ANIMATION = {
  SCALE: {
    HOVER: 1.1,
    HOVER_LARGE: 1.2,
    DEFAULT: 1.0,
  },
  HEIGHT: {
    MIN: 0.01,
    MAX: 0.1,
  },
  LERP: {
    SCALE: 0.2,
    POSITION: {
      NORMAL: 0.1,
      SLOW: 0.05,
      X_AXIS: 0.03,
    },
    HEIGHT: {
      INCREASING: 0.1,
      DECREASING: 0.02,
    },
  },
  THRESHOLD: {
    BOTTOM_PROXIMITY: 0.5,
    POSITION_CHANGE: 0.001,
  },
  DELAY: {
    HOVER: 100,
    INITIAL: 500,
  },
}

// Layout Constants
const LAYOUT = {
  TEXT: {
    SIZE: {
      ENGINEERING: 0.5,
      CREATIVE: 0.6,
    },
    LETTER_SPACING: {
      ENGINEERING: -0.06,
      CREATIVE: 0,
    },
    CURVE_SEGMENTS: 12,
    VERTICAL_OFFSET: 0.15,
  },
  VIEWPORT: {
    MAIN_DIVIDER: 35,
    COLUMN_DIVIDER: 50,
  },
  POSITION: {
    HOVER_DETECTOR: -5.5,
    MAIN_GROUP: 4,
    CONTENT_GROUP: -3,
    CAROUSEL: 6,
  },
}

// Color Constants
const COLORS = {
  DEFAULT: '#F4EEDC',
  HOVER: {
    ENGINEERING: '#FFB79C',
    CREATIVE: '#FABE7F',
  },
}

function SkillText({
  content,
  isEngineering,
  onClick,
  position,
  onHoverChange,
  scale = ANIMATION.SCALE.DEFAULT,
  opacity = 1,
  isMoving = false,
  resetState = false,
}) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [isBottomPosition, setIsBottomPosition] = useState(false)
  const [isStackPosition, setIsStackPosition] = useState(true)
  const textRef = useRef()
  const [textSize, setTextSize] = useState([1, 0.5, 0.25])
  const currentScaleRef = useRef(new THREE.Vector3(scale, scale, scale))
  const currentHeightRef = useRef(ANIMATION.HEIGHT.MIN)
  const groupRef = useRef()
  const meshRef = useRef()
  const text3DRef = useRef()

  // Cache vector objects for reuse in animation loop
  const targetScaleVec = useRef(new THREE.Vector3())
  const tempVec3 = useRef(new THREE.Vector3())
  const tempBox3 = useRef(new THREE.Box3())
  const meshPositionRef = useRef(new THREE.Vector3())
  const text3DPositionRef = useRef(new THREE.Vector3())

  const setStyleMagazine = useSetAtom(styleMagazineAtom)

  /**
   * Reset component states based on resetState prop changes.
   *
   * @effect
   * - Resets stack and bottom position states based on resetState value
   * - Clears clicked state when not moving and resetState is true
   * - Sets bottom position when resetState.isBottomPosition is true
   *
   * Dependencies:
   * - resetState: Triggers state resets
   * - content: Ensures proper reset when content changes
   * - isMoving: Affects click state during movement
   */
  useEffect(() => {
    if (resetState === true) {
      setIsStackPosition(true)
      setIsBottomPosition(false)
      if (!isMoving) {
        setClicked(false)
      }
    } else if (resetState && typeof resetState === 'object' && resetState.isBottomPosition) {
      setIsBottomPosition(true)
      setIsStackPosition(false)
    }
  }, [resetState, content, isMoving])

  /**
   * Update position states when movement or click states change.
   *
   * @effect
   * - Updates stack and bottom position states during movement
   * - Resets click state when returning to stack position
   *
   * Dependencies:
   * - isMoving: Triggers position updates during animations
   * - clicked: Current click state
   * - content: Ensures updates when content changes
   * - isStackPosition: Current stack position state
   */
  useEffect(() => {
    if (isMoving && clicked) {
      setIsStackPosition(false)
      setIsBottomPosition(false)
    } else if (!isMoving && isStackPosition && clicked) {
      setClicked(false)
    }
  }, [isMoving, clicked, content, isStackPosition])

  // Calculate target scale based on states
  const targetScale = !isMoving && hovered && (!clicked || isBottomPosition) ? scale * ANIMATION.SCALE.HOVER : scale

  // Calculate target height based on states
  const targetHeight = isStackPosition
    ? ANIMATION.HEIGHT.MIN
    : clicked || isBottomPosition
      ? ANIMATION.HEIGHT.MAX
      : ANIMATION.HEIGHT.MIN

  // Get color based on states
  const getColor = () => {
    if (isMoving && clicked) return COLORS.DEFAULT
    if (hovered && (!clicked || isBottomPosition)) {
      return isEngineering ? COLORS.HOVER.ENGINEERING : COLORS.HOVER.CREATIVE
    }
    return COLORS.DEFAULT
  }

  const handleClick = (e) => {
    e.stopPropagation()
    const newClickedState = !clicked
    setClicked(newClickedState)

    if (newClickedState) {
      if (isStackPosition) {
        setIsStackPosition(false)
      } else if (isBottomPosition) {
        setIsBottomPosition(false)
      }
      setHovered(false)
    }

    onClick && onClick(content, textSize[0])
  }

  /**
   * Throttled hover handler to prevent excessive state updates.
   *
   * @callback
   * - Updates hover state and magazine style based on current component state
   * - Throttles updates to prevent performance issues
   *
   * Dependencies:
   * - isMoving: Prevents hover during movement
   * - clicked: Affects hover behavior based on click state
   * - isBottomPosition: Modifies hover behavior at bottom
   * - isEngineering: Determines style on hover
   * - onHoverChange: Callback prop for hover state changes
   * - setStyleMagazine: Atom setter for magazine style
   */
  const handleHoverChange = useCallback(
    throttle((isHovered) => {
      if (!isMoving && (!clicked || isBottomPosition)) {
        setHovered(isHovered)
        onHoverChange && onHoverChange(isHovered)
        setStyleMagazine(isHovered ? (isEngineering ? 'engineer' : 'smack') : 'vague')
      }
    }, ANIMATION.DELAY.HOVER),
    [isMoving, clicked, isBottomPosition, isEngineering, onHoverChange, setStyleMagazine],
  )

  const handlePointerOver = (e) => {
    e.stopPropagation()
    handleHoverChange(true)
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    handleHoverChange(false)
  }

  // Helper function for synchronized lerping
  const performSyncedLerp = (current, target, xSpeed, normalSpeed, isNearBottom) => {
    if (!isNearBottom) {
      current.x = THREE.MathUtils.lerp(current.x, target.x, xSpeed)
    } else {
      current.x = target.x
    }
    current.y = THREE.MathUtils.lerp(current.y, target.y, normalSpeed)
    current.z = THREE.MathUtils.lerp(current.z, target.z, normalSpeed)
  }

  /**
   * Animation frame update for smooth transitions.
   *
   * @frame
   * - Handles scale lerping with smooth transitions
   * - Updates height with different lerp speeds for increasing/decreasing
   * - Manages synchronized position updates for mesh and text
   * - Calculates and updates bounding box for text sizing
   *
   * Dependencies:
   * - targetScale: Current target scale value
   * - targetHeight: Current target height value
   * - position: Current position vector
   * - opacity: Current opacity value
   * - textRef: Reference to text component
   * - meshRef: Reference to mesh component
   * - text3DRef: Reference to Text3D component
   * - isEngineering: Affects text positioning
   * - textSize: Current text dimensions
   */
  useFrame(() => {
    if (groupRef.current && meshRef.current && text3DRef.current) {
      // Scale lerping
      targetScaleVec.current.set(targetScale, targetScale, targetScale)
      performLerp(currentScaleRef.current, targetScaleVec.current, ANIMATION.LERP.SCALE)
      groupRef.current.scale.copy(currentScaleRef.current)

      // Height lerping
      const prevHeight = currentHeightRef.current
      const isIncreasing = targetHeight > prevHeight
      const heightLerpFactor = isIncreasing ? ANIMATION.LERP.HEIGHT.INCREASING : ANIMATION.LERP.HEIGHT.DECREASING
      currentHeightRef.current = THREE.MathUtils.lerp(currentHeightRef.current, targetHeight, heightLerpFactor)

      // Calculate target positions
      const targetMeshX =
        isMoving || clicked
          ? isStackPosition
            ? !isEngineering
              ? -textSize[0] / 2
              : textSize[0] / 2
            : 0
          : !isEngineering
            ? -textSize[0] / 2
            : textSize[0] / 2

      const targetText3DX =
        isMoving || clicked
          ? isStackPosition
            ? !isEngineering
              ? -textSize[0]
              : 0
            : -textSize[0] / 2
          : !isEngineering
            ? -textSize[0]
            : 0

      const isNearBottom = Math.abs(groupRef.current.position.y - -0.807) < ANIMATION.THRESHOLD.BOTTOM_PROXIMITY

      // Update mesh position
      meshPositionRef.current.set(targetMeshX, textSize[1] / 2 - textSize[1] * LAYOUT.TEXT.VERTICAL_OFFSET, 0)
      performSyncedLerp(
        meshRef.current.position,
        meshPositionRef.current,
        ANIMATION.LERP.POSITION.X_AXIS,
        ANIMATION.LERP.POSITION.NORMAL,
        isNearBottom,
      )

      // Update text3D position
      text3DPositionRef.current.set(targetText3DX, 0, 0)
      performSyncedLerp(
        text3DRef.current.position,
        text3DPositionRef.current,
        ANIMATION.LERP.POSITION.X_AXIS,
        ANIMATION.LERP.POSITION.NORMAL,
        isNearBottom,
      )
    }
  })

  /**
   * Update text size when content or engineering state changes.
   * Dependencies:
   * - content: Recalculate size when text changes
   * - isEngineering: Affects text styling and size
   */
  useEffect(() => {
    if (textRef.current) {
      tempBox3.current.setFromObject(textRef.current)
      tempBox3.current.getSize(tempVec3.current)
      setTextSize([tempVec3.current.x, tempVec3.current.y, tempVec3.current.z])
    }
  }, [content, isEngineering])

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Invisible mesh for hover detection */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          position={[
            !isEngineering ? -textSize[0] / 2 : textSize[0] / 2,
            textSize[1] / 2 - textSize[1] * LAYOUT.TEXT.VERTICAL_OFFSET,
            0,
          ]}
        >
          <boxGeometry args={[textSize[0], textSize[1], Math.max(ANIMATION.HEIGHT.MIN, textSize[2])]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <Text3D
          ref={(ref) => {
            textRef.current = ref
            text3DRef.current = ref
          }}
          font={isEngineering ? HKGroteskFont : LemonFont}
          size={isEngineering ? LAYOUT.TEXT.SIZE.ENGINEERING : LAYOUT.TEXT.SIZE.CREATIVE}
          height={currentHeightRef.current}
          curveSegments={LAYOUT.TEXT.CURVE_SEGMENTS}
          bevelEnabled={false}
          letterSpacing={isEngineering ? LAYOUT.TEXT.LETTER_SPACING.ENGINEERING : LAYOUT.TEXT.LETTER_SPACING.CREATIVE}
          position={[!isEngineering ? -textSize[0] : 0, 0, 0]}
        >
          {content}
          <meshStandardMaterial color={getColor()} toneMapped={false} transparent opacity={opacity} />
        </Text3D>
      </group>
    </group>
  )
}

// SkillStack component with lerping animation
const SkillStack = forwardRef(({ skills, onSkillClick }, ref) => {
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
   * Dependencies:
   * - skills: Trigger recalculation when skills change
   * - vpWidth/vpHeight: Update positions on viewport changes
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
   * Dependencies:
   * - camera: For position calculations
   * - explodedSkill: Track expanded state
   * - onSkillClick: Parent callback
   * - skills: Update when skills change
   * - vpWidth/vpHeight: Recalculate on viewport changes
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
          tempTargetPos.current.addScaledVector(tempForward.current, buttonConfig.hover.z)
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
   * Handles:
   * - Delayed animations
   * - Position lerping
   * - State updates on significant changes
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

function SkillStackContent() {
  const skillsContent = useMemo(() => transformSkillsConfig(skills), [])
  const [carouselPages, setCarouselPages] = useState(null)
  const [carouselType, setCarouselType] = useState(null)
  const [currentSkill, setCurrentSkill] = useState(null)
  const [isExitingCarousel, setIsExitingCarousel] = useState(false)
  const setStyleMagazine = useSetAtom(styleMagazineAtom)
  const setTitles = useSetAtom(titleSlidesAtom)
  const skillStackRef = useRef(null)

  // Function to reset all carousel-related state
  const resetCarouselState = useCallback(() => {
    setCarouselPages(null)
    setCarouselType(null)
    setTitles([])
    setIsExitingCarousel(false)
  }, [setTitles])

  const findRelevantContent = useCallback((clickedSkill) => {
    // Search through SmackContents and EngineerContents
    const searchContents = (contents, type) => {
      const relevantSections = []
      for (const [key, section] of Object.entries(contents)) {
        if (section.skills && section.skills.length > 0) {
          const hasSkill = section.skills.some((skill) => skill && skill.title === clickedSkill)
          if (hasSkill) {
            relevantSections.push({
              ...section,
              type: section.magazine || type, // Use section.magazine if available, fallback to type
            })
          }
        }
      }
      return relevantSections
    }

    // Search in both content types
    const smackSections = searchContents(SmackContents, 'smack')
    const engineerSections = searchContents(EngineerContents, 'engineer')

    // Combine and return all relevant sections
    return [...smackSections, ...engineerSections]
  }, [])

  const handleSkillClick = useCallback(
    (content) => {
      if (!content) {
        // If we have a current skill, trigger the exit animation
        if (currentSkill && skillStackRef.current) {
          setIsExitingCarousel(true)
        } else {
          resetCarouselState()
        }
        return
      }

      // If clicking the same skill that's already expanded, start exit animation
      if (content === currentSkill) {
        setIsExitingCarousel(true)
        return
      }

      // Store the clicked skill
      setCurrentSkill(content)

      const relevantSections = findRelevantContent(content)
      if (relevantSections.length > 0) {
        // Get all titles from relevant sections
        const sectionTitles = relevantSections.map((section) => section.title)
        setTitles(sectionTitles)

        // Collect all pages from all relevant sections
        const allPages = relevantSections.reduce((acc, section) => {
          // Get pages in order based on pageIndex
          const orderedPages = Object.values(section.pages)
            .sort((a, b) => a.pageIndex - b.pageIndex)
            .map((page) => getTexturePath(section.magazine, page.image))
          return [...acc, ...orderedPages]
        }, [])

        // Use the first section's type for the magazine style
        const firstSection = relevantSections[0]
        setCarouselType(firstSection.magazine)
        setCarouselPages(allPages)
        setStyleMagazine(firstSection.magazine)
      } else {
        resetCarouselState()
      }
    },
    [findRelevantContent, setStyleMagazine, setTitles, currentSkill, resetCarouselState],
  )

  // Handle carousel finish
  const handleCarouselFinish = useCallback(() => {
    if (currentSkill && skillStackRef.current) {
      const skillToReset = currentSkill
      setCurrentSkill(null)
      resetCarouselState()
      // Trigger stack animation through the ref
      skillStackRef.current.triggerStackAnimation()
    } else {
      resetCarouselState()
    }
  }, [currentSkill, resetCarouselState])

  // Cleanup effect for carousel state
  useEffect(() => {
    return () => {
      resetCarouselState()
    }
  }, [resetCarouselState])

  return (
    <>
      <SkillStack skills={skillsContent} onSkillClick={handleSkillClick} ref={skillStackRef} />
      {carouselPages && (
        <group position={[0, 0, LAYOUT.POSITION.CAROUSEL]}>
          <PageCarousel images={carouselPages} onFinish={handleCarouselFinish} isExiting={isExitingCarousel} />
        </group>
      )}
    </>
  )
}

function HoverDetector({ vpWidth }) {
  const setStyleMagazine = useSetAtom(styleMagazineAtom)
  const columnOffset = vpWidth / LAYOUT.VIEWPORT.COLUMN_DIVIDER // Match the offset from calculateStackPositions

  // Create throttled pointer move handler
  const handlePointerMove = useCallback(
    throttle((e) => {
      // Convert pointer position to local space
      const x = e.point.x

      if (x < -columnOffset) {
        setStyleMagazine('smack')
      } else if (x > columnOffset) {
        setStyleMagazine('engineer')
      } else {
        setStyleMagazine('vague')
      }
    }, ANIMATION.DELAY.HOVER),
    [columnOffset, setStyleMagazine],
  )

  return (
    <mesh position={[0, 0, LAYOUT.POSITION.HOVER_DETECTOR]} onPointerMove={handlePointerMove}>
      <planeGeometry args={[vpWidth * 2, vpWidth * 2]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

export default function Contents() {
  const { vpWidth, vpHeight } = useViewportMeasurements()

  return (
    <group position={[0, 0, LAYOUT.POSITION.MAIN_GROUP]}>
      <HoverDetector vpWidth={vpWidth / LAYOUT.VIEWPORT.MAIN_DIVIDER} />
      <group position={[0, 0, LAYOUT.POSITION.CONTENT_GROUP]}>
        <SkillStackContent />
      </group>
    </group>
  )
}

// Only export SkillStack if it's needed externally
export { SkillStack }

import * as THREE from 'three'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text3D, OrthographicCamera } from '@react-three/drei'
import { skills, transformSkillsConfig } from '@/helpers/contentsConfig'
import {
  calculateStackPositions,
  performLerp,
  calculateExplosionPositions,
  getSpacingConfig,
} from '@/helpers/positionHelpers'
import { useViewportMeasurements } from '@/helpers/deviceHelpers'
import HKGroteskFont from './HKGrotesk-SemiBold.json'
import LemonFont from './Lemon_Regular.json'
import { useSetAtom } from 'jotai'
import { styleMagazineAtom } from '@/helpers/atoms'

function SkillText({
  content,
  isEngineering,
  onClick,
  position,
  onHoverChange,
  scale = 1,
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
  const currentHeightRef = useRef(0.01)
  const groupRef = useRef()

  // Cache vector objects for reuse in animation loop
  const targetScaleVec = useRef(new THREE.Vector3())
  const tempVec3 = useRef(new THREE.Vector3())
  const tempBox3 = useRef(new THREE.Box3())

  const setStyleMagazine = useSetAtom(styleMagazineAtom)

  // Reset states when resetState changes
  useEffect(() => {
    if (resetState === true) {
      setClicked(false)
      setIsStackPosition(true)
      setIsBottomPosition(false)
    } else if (resetState && typeof resetState === 'object' && resetState.isBottomPosition) {
      setIsBottomPosition(true)
      setIsStackPosition(false)
    }
  }, [resetState])

  // Update position states based on isMoving
  useEffect(() => {
    if (isMoving && clicked) {
      setIsStackPosition(false)
      setIsBottomPosition(false)
    }
  }, [isMoving, clicked])

  // Calculate target scale based on states
  const targetScale = !isMoving && hovered && (!clicked || isBottomPosition) ? scale * 1.1 : scale

  // Calculate target height based on states
  const targetHeight = isStackPosition ? 0.01 : clicked || isBottomPosition ? 0.1 : 0.01

  // Get color based on states
  const getColor = () => {
    if (isMoving && clicked) return '#F4EEDC' // Default color while moving only for clicked skill
    if (hovered && (!clicked || isBottomPosition)) return isEngineering ? '#FFB79C' : '#FABE7F'
    return '#F4EEDC'
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
      // Clear hover state when clicking
      setHovered(false)
    }

    onClick && onClick(content, textSize[0])
  }

  const handlePointerOver = (e) => {
    e.stopPropagation()
    // Allow hover effects if not moving and either not clicked or in bottom position
    if (!isMoving && (!clicked || isBottomPosition)) {
      setHovered(true)
      onHoverChange && onHoverChange(true)
      setStyleMagazine(isEngineering ? 'engineer' : 'smack')
    }
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    onHoverChange && onHoverChange(false)
    setStyleMagazine('vague')
  }

  useFrame(() => {
    if (groupRef.current) {
      // Reuse cached vector for target scale
      targetScaleVec.current.set(targetScale, targetScale, targetScale)
      performLerp(currentScaleRef.current, targetScaleVec.current, 0.2)
      groupRef.current.scale.copy(currentScaleRef.current)

      // Lerp height with different speeds based on direction
      const prevHeight = currentHeightRef.current
      const isIncreasing = targetHeight > prevHeight
      const lerpFactor = isIncreasing ? 0.1 : 0.02 // Slower when decreasing height
      currentHeightRef.current = THREE.MathUtils.lerp(currentHeightRef.current, targetHeight, lerpFactor)
    }
  })

  useEffect(() => {
    if (textRef.current) {
      // Reuse cached Box3 and Vector3
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
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          position={[!isEngineering ? -textSize[0] / 2 : textSize[0] / 2, textSize[1] / 2 - textSize[1] * 0.15, 0]}
        >
          <boxGeometry args={[textSize[0], textSize[1], Math.max(0.01, textSize[2])]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <Text3D
          ref={textRef}
          font={isEngineering ? HKGroteskFont : LemonFont}
          size={isEngineering ? 0.5 : 0.6}
          height={currentHeightRef.current}
          curveSegments={12}
          bevelEnabled={false}
          letterSpacing={isEngineering ? -0.06 : 0}
          position={!isEngineering ? [-textSize[0], 0, 0] : [0, 0, 0]}
        >
          {content}
          <meshBasicMaterial color={getColor()} toneMapped={false} transparent opacity={opacity} />
        </Text3D>
      </group>
    </group>
  )
}

// SkillStack component with lerping animation
function SkillStack({ skills }) {
  const { camera } = useThree()
  const { vpWidth: pixelWidth, vpHeight: pixelHeight } = useViewportMeasurements(false)

  // Convert pixel measurements to Three.js units
  const vpWidth = pixelWidth / 35
  const vpHeight = pixelHeight / 35

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

  // Cache vector objects for reuse
  const tempVec3 = useRef(new THREE.Vector3())
  const tempForward = useRef(new THREE.Vector3(0, 0, -1))
  const tempTargetPos = useRef(new THREE.Vector3())
  const lerpSpeed = 0.05

  // Trigger a rerender when animation states change significantly
  const [animationStateVersion, setAnimationStateVersion] = useState(0)

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
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [skills])

  const handleSkillClick = (content, textWidth) => {
    isInitialAnimationRef.current = false
    if (explodedSkill === content) {
      // Reset to original stack positions
      const { positions, delays } = calculateStackPositions(skills, vpWidth, vpHeight)
      targetPositionsRef.current = positions
      delaysRef.current = delays
      setExplodedSkill(null)
      movingSkillsRef.current = new Set([...skills.map((skill) => skill.content)])

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

        const skill = skills[clickedIndex]
        const offset = skill.isEngineering ? textWidth / 2 : -textWidth / 2
        tempTargetPos.current.x = -offset

        positions[clickedIndex] = [tempTargetPos.current.x, tempTargetPos.current.y, tempTargetPos.current.z]
      }

      targetPositionsRef.current = positions
      delaysRef.current = delays
      setExplodedSkill(content)
      movingSkillsRef.current = new Set([...skills.map((skill) => skill.content)])
      resetStatesRef.current = {}
    }
    startTimeRef.current = performance.now()
    // Trigger rerender to reflect new animation state
    setAnimationStateVersion((v) => v + 1)
  }

  const handleHoverChange = (index, isHovered) => {
    setHoveredStates((prev) => ({
      ...prev,
      [index]: isHovered,
    }))
  }

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
        tempVec3.current.set(target[0], target[1], target[2])
        const currentPos = positionRefs.current[index]
        const prevPos = currentPos.clone()

        performLerp(currentPos, tempVec3.current, lerpSpeed)

        // Check if this skill has reached its target position
        if (currentPos.distanceTo(tempVec3.current) < 0.01) {
          const skill = activeSkills[index].skill
          if (movingSkillsRef.current.has(skill.content)) {
            movingSkillsRef.current.delete(skill.content)
            significantChanges = true

            // Check for bottom position state
            const buttonY = getSpacingConfig(false).positions.button.hover.y
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
        if (prevPos.distanceTo(currentPos) > 0.1) {
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
        const scale = isMoving ? 1 : isHovered ? 1.2 : 1
        const elapsed = performance.now() - startTimeRef.current
        const isActive = isInitialAnimationRef.current ? elapsed >= delaysRef.current[index] : true
        const isInViewport = Math.abs(currentPos[0]) <= vpWidth * 1.5 && Math.abs(currentPos[1]) <= vpHeight * 1.5
        const opacity = isActive ? (isInViewport ? 1 : 0) : 0

        return (
          <SkillText
            key={`skill-${skill.content}-${index}`}
            content={skill.content}
            isEngineering={skill.isEngineering}
            position={currentPos}
            onHoverChange={(isHovered) => handleHoverChange(index, isHovered)}
            onClick={handleSkillClick}
            scale={scale}
            opacity={opacity}
            isMoving={isMoving}
            resetState={resetStatesRef.current[skill.content]}
          />
        )
      })}
    </>
  )
}

function SkillStackContent() {
  const skillsContent = useMemo(() => transformSkillsConfig(skills), [])
  return <SkillStack skills={skillsContent} />
}

function HoverDetector({ vpWidth }) {
  const setStyleMagazine = useSetAtom(styleMagazineAtom)
  const columnOffset = vpWidth / 50 // Match the offset from calculateStackPositions

  const handlePointerMove = (e) => {
    // Convert pointer position to local space
    const x = e.point.x

    if (x < -columnOffset) {
      setStyleMagazine('smack')
    } else if (x > columnOffset) {
      setStyleMagazine('engineer')
    } else {
      setStyleMagazine('vague')
    }
  }

  return (
    <mesh position={[0, 0, -5.5]} onPointerMove={handlePointerMove}>
      <planeGeometry args={[vpWidth * 2, vpWidth * 2]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}

export default function Contents() {
  const { vpWidth } = useViewportMeasurements(false)
  return (
    <group position={[0, 0, 2]}>
      <HoverDetector vpWidth={vpWidth / 35} />
      <SkillStackContent />
    </group>
  )
}

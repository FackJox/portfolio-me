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

function hasSignificantChange(a, b, threshold = 0.001) {
  if (!a || !b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.some((val, i) => Math.abs(val - b[i]) > threshold)
  }
  return Math.abs(a - b) > threshold
}

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
  const meshRef = useRef()
  const text3DRef = useRef()
  const lastLoggedTimeRef = useRef(0)
  const lastPositionsRef = useRef(null)

  // Cache vector objects for reuse in animation loop
  const targetScaleVec = useRef(new THREE.Vector3())
  const tempVec3 = useRef(new THREE.Vector3())
  const tempBox3 = useRef(new THREE.Box3())
  const meshPositionRef = useRef(new THREE.Vector3())
  const text3DPositionRef = useRef(new THREE.Vector3())

  const setStyleMagazine = useSetAtom(styleMagazineAtom)

  // Reset states when resetState changes
  useEffect(() => {
    if (content === 'Three.js') {
      console.log('SkillText state:', content, isBottomPosition, isStackPosition, resetState)
    }
    if (resetState === true) {
      // Only update stack position state immediately
      setIsStackPosition(true)
      setIsBottomPosition(false)
      // Keep clicked state until movement is complete
      if (!isMoving) {
        setClicked(false)
      }
    } else if (resetState && typeof resetState === 'object' && resetState.isBottomPosition) {
      setIsBottomPosition(true)
      setIsStackPosition(false)
    }
  }, [resetState, content, isMoving])

  // Update position states based on isMoving
  useEffect(() => {
    if (content === 'Three.js' && isMoving) {
      console.log('SkillText moving:', content, isMoving, clicked, isBottomPosition, isStackPosition)
    }
    if (isMoving && clicked) {
      setIsStackPosition(false)
      setIsBottomPosition(false)
    } else if (!isMoving && isStackPosition && clicked) {
      // Reset clicked state only when we've finished moving back to stack position
      setClicked(false)
    }
  }, [isMoving, clicked, content, isStackPosition])

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
    if (groupRef.current && meshRef.current && text3DRef.current) {
      const now = performance.now()
      const shouldLog = content === 'Three.js' && now - lastLoggedTimeRef.current > 500

      if (shouldLog) {
        const currentPositions = {
          group: groupRef.current.position.toArray(),
          mesh: meshRef.current.position.toArray(),
          text3D: text3DRef.current.position.toArray(),
        }

        const hasChanged =
          !lastPositionsRef.current ||
          hasSignificantChange(currentPositions.group, lastPositionsRef.current.group) ||
          hasSignificantChange(currentPositions.mesh, lastPositionsRef.current.mesh) ||
          hasSignificantChange(currentPositions.text3D, lastPositionsRef.current.text3D)

        if (hasChanged) {
          console.log(
            'SkillText positions:',
            content,
            currentPositions.group.map((v) => v.toFixed(3)),
            currentPositions.mesh.map((v) => v.toFixed(3)),
            currentPositions.text3D.map((v) => v.toFixed(3)),
          )
          lastPositionsRef.current = currentPositions
          lastLoggedTimeRef.current = now
        }
      }

      // Reuse cached vector for target scale
      targetScaleVec.current.set(targetScale, targetScale, targetScale)
      performLerp(currentScaleRef.current, targetScaleVec.current, 0.2)
      groupRef.current.scale.copy(currentScaleRef.current)

      // Lerp height with different speeds based on direction
      const prevHeight = currentHeightRef.current
      const isIncreasing = targetHeight > prevHeight
      const lerpFactor = isIncreasing ? 0.1 : 0.02 // Slower when decreasing height
      currentHeightRef.current = THREE.MathUtils.lerp(currentHeightRef.current, targetHeight, lerpFactor)

      // Calculate target positions for mesh and text3D based on state
      const targetMeshX =
        isMoving || clicked
          ? isStackPosition
            ? !isEngineering
              ? -textSize[0] / 2
              : textSize[0] / 2 // Moving back to stack
            : 0 // Moving to/at bottom
          : !isEngineering
            ? -textSize[0] / 2
            : textSize[0] / 2 // At stack

      const targetText3DX =
        isMoving || clicked
          ? isStackPosition
            ? !isEngineering
              ? -textSize[0]
              : 0 // Moving back to stack
            : -textSize[0] / 2 // Moving to/at bottom
          : !isEngineering
            ? -textSize[0]
            : 0 // At stack

      // Lerp mesh position
      meshPositionRef.current.set(targetMeshX, textSize[1] / 2 - textSize[1] * 0.15, 0)
      const meshLerpSpeed = { x: 0.03, y: 0.1, z: 0.1 }
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        meshPositionRef.current.x,
        meshLerpSpeed.x,
      )
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        meshPositionRef.current.y,
        meshLerpSpeed.y,
      )
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        meshPositionRef.current.z,
        meshLerpSpeed.z,
      )

      // Lerp text3D position
      text3DPositionRef.current.set(targetText3DX, 0, 0)
      const text3DLerpSpeed = { x: 0.03, y: 0.1, z: 0.1 }
      text3DRef.current.position.x = THREE.MathUtils.lerp(
        text3DRef.current.position.x,
        text3DPositionRef.current.x,
        text3DLerpSpeed.x,
      )
      text3DRef.current.position.y = THREE.MathUtils.lerp(
        text3DRef.current.position.y,
        text3DPositionRef.current.y,
        text3DLerpSpeed.y,
      )
      text3DRef.current.position.z = THREE.MathUtils.lerp(
        text3DRef.current.position.z,
        text3DPositionRef.current.z,
        text3DLerpSpeed.z,
      )
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
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          position={[!isEngineering ? -textSize[0] / 2 : textSize[0] / 2, textSize[1] / 2 - textSize[1] * 0.15, 0]}
        >
          <boxGeometry args={[textSize[0], textSize[1], Math.max(0.01, textSize[2])]} />
          <meshBasicMaterial transparent opacity={0.3} />
        </mesh>

        <Text3D
          ref={(ref) => {
            textRef.current = ref
            text3DRef.current = ref
          }}
          font={isEngineering ? HKGroteskFont : LemonFont}
          size={isEngineering ? 0.5 : 0.6}
          height={currentHeightRef.current}
          curveSegments={12}
          bevelEnabled={false}
          letterSpacing={isEngineering ? -0.06 : 0}
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
  const previousXPositionRef = useRef(null)
  const lastLoggedTimeRef = useRef(0)
  const lastStateRef = useRef(null)

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

        if (content === 'Three.js') {
          console.log('Bottom target:', content, positions[clickedIndex])
        }
      }

      targetPositionsRef.current = positions
      delaysRef.current = delays
      setExplodedSkill(content)
      movingSkillsRef.current = new Set([...skills.map((skill) => skill.content)])
      resetStatesRef.current = {}
    }
    startTimeRef.current = performance.now()
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
        const skill = activeSkills[index]?.skill
        const currentPos = positionRefs.current[index]
        const prevPos = currentPos.clone()

        // Debug log for Three.js skill
        const now = performance.now()
        if (skill?.content === 'Three.js' && now - lastLoggedTimeRef.current > 500) {
          const currentState = {
            pos: currentPos.toArray(),
            target,
            isMoving: movingSkillsRef.current.has(skill.content),
            isBottom: resetStatesRef.current[skill.content]?.isBottomPosition,
          }

          const hasChanged =
            !lastStateRef.current ||
            hasSignificantChange(currentState.pos, lastStateRef.current.pos) ||
            hasSignificantChange(currentState.target, lastStateRef.current.target) ||
            currentState.isMoving !== lastStateRef.current.isMoving ||
            currentState.isBottom !== lastStateRef.current.isBottom

          if (hasChanged) {
            console.log(
              'Position:',
              skill.content,
              currentState.pos.map((v) => v.toFixed(3)),
              currentState.target.map((v) => v.toFixed(3)),
            )
            if (
              currentState.isMoving !== lastStateRef.current?.isMoving ||
              currentState.isBottom !== lastStateRef.current?.isBottom
            ) {
              console.log('State:', skill.content, currentState.isMoving, currentState.isBottom)
            }
            lastStateRef.current = currentState
            lastLoggedTimeRef.current = now
          }
        }

        // Set target position
        tempVec3.current.set(target[0], target[1], target[2])

        // Apply lerp with different speeds for x and y/z
        const xLerpSpeed = 0.03 // Much slower for x-axis
        const normalLerpSpeed = 0.05 // Normal speed for y and z

        // Lerp x separately
        currentPos.x = THREE.MathUtils.lerp(currentPos.x, tempVec3.current.x, xLerpSpeed)

        // Lerp y and z
        currentPos.y = THREE.MathUtils.lerp(currentPos.y, tempVec3.current.y, normalLerpSpeed)
        currentPos.z = THREE.MathUtils.lerp(currentPos.z, tempVec3.current.z, normalLerpSpeed)

        // Check if this skill has reached its target position
        if (currentPos.distanceTo(tempVec3.current) < 0.001) {
          if (movingSkillsRef.current.has(skill.content)) {
            movingSkillsRef.current.delete(skill.content)
            significantChanges = true

            // Check for bottom position state
            const buttonY = getSpacingConfig(false).positions.button.hover.y
            if (target[1] === buttonY && !resetStatesRef.current[skill.content]?.isBottomPosition) {
              resetStatesRef.current[skill.content] = {
                isBottomPosition: true,
              }
              if (skill.content === 'Three.js') {
                console.log(
                  'Bottom reached:',
                  skill.content,
                  currentPos.toArray().map((v) => v.toFixed(3)),
                )
              }
              significantChanges = true
            }
          }
        }

        // Update current positions array
        positions[index] = [currentPos.x, currentPos.y, currentPos.z]

        // Check if position changed significantly
        if (prevPos.distanceTo(currentPos) > 0.001) {
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

export { SkillStack }

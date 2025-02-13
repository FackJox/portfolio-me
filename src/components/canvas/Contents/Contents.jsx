import * as THREE from 'three'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useAspect, Text3D, OrthographicCamera } from '@react-three/drei'
import { skills, transformSkillsConfig } from '@/helpers/contentsConfig'
import { calculateStackPositions, performLerp } from '@/helpers/positionHelpers'
import HKGroteskFont from './HKGrotesk-SemiBold.json'
import LemonFont from './Lemon_Regular.json'

// SkillText remains very similar so that the text material and pointer events work.
function SkillText({ content, isEngineering, onClick, position, onHoverChange, scale = 1, opacity = 1 }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const textRef = useRef()
  const [textSize, setTextSize] = useState([1, 0.5, 0.25])
  const currentScaleRef = useRef(new THREE.Vector3(scale, scale, scale))
  const groupRef = useRef()

  const targetScale = hovered ? scale * 1.2 : scale

  useEffect(() => {
    if (textRef.current) {
      const box = new THREE.Box3().setFromObject(textRef.current)
      const size = box.getSize(new THREE.Vector3())
      setTextSize([size.x, size.y, size.z])
    }
  }, [content, isEngineering])

  useFrame(() => {
    if (groupRef.current) {
      const targetScaleVec = new THREE.Vector3(targetScale, targetScale, targetScale)
      performLerp(currentScaleRef.current, targetScaleVec, 0.1)
      groupRef.current.scale.copy(currentScaleRef.current)
    }
  })

  const getColor = () => {
    if (clicked) return isEngineering ? '#FFB79C' : '#FABE7F'
    if (hovered) return isEngineering ? '#FFB79C' : '#FABE7F'
    return '#F4EEDC'
  }

  const handleClick = (e) => {
    e.stopPropagation()
    const newClickedState = !clicked
    setClicked(newClickedState)
    onClick && onClick(content)
  }

  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    onHoverChange && onHoverChange(true)
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    onHoverChange && onHoverChange(false)
  }

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
          height={0.01}
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
  // Use the useThree hook normally to get the canvas size, then capture it once.
  const { size } = useThree()
  const [initialSize] = useState(() => size)
  
  // useAspect will now compute based on the captured initial size only.
  const [vpWidth, vpHeight] = useAspect(initialSize.width, initialSize.height)

  const [activeSkills, setActiveSkills] = useState([])
  const [hoveredStates, setHoveredStates] = useState({})
  const [targetPositions, setTargetPositions] = useState([])
  const [currentPositions, setCurrentPositions] = useState([])
  const [delays, setDelays] = useState([])
  const [isReady, setIsReady] = useState(false)
  const startTimeRef = useRef(0)
  const skillRefs = useRef([])
  const positionRefs = useRef([])
  const lerpSpeed = 0.05 // Increased for faster movement

  useEffect(() => {
    if (skills.length > 0) {
      const { positions, startPositions, delays } = calculateStackPositions(skills, vpWidth, vpHeight)
      setTargetPositions(positions)
      setCurrentPositions(startPositions)
      setDelays(delays)
      setActiveSkills(skills.map((skill, index) => ({ skill, index })))
      skillRefs.current = skills.map(() => ({ position: new THREE.Vector3() }))
      positionRefs.current = startPositions.map((pos) => new THREE.Vector3(pos[0], pos[1], pos[2]))

      const timer = setTimeout(() => {
        startTimeRef.current = performance.now()
        setIsReady(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [skills, vpWidth, vpHeight])

  const handleHoverChange = (index, isHovered) => {
    setHoveredStates((prev) => ({
      ...prev,
      [index]: isHovered,
    }))
  }

  useFrame(() => {
    if (!isReady) return

    if (currentPositions.length === targetPositions.length) {
      const elapsed = performance.now() - startTimeRef.current
      const newPositions = currentPositions.map((pos, index) => {
        if (elapsed < delays[index]) return pos

        const target = targetPositions[index]
        const targetVec = new THREE.Vector3(target[0], target[1], target[2])
        performLerp(positionRefs.current[index], targetVec, lerpSpeed)
        return [
          positionRefs.current[index].x,
          positionRefs.current[index].y,
          positionRefs.current[index].z,
        ]
      })
      setCurrentPositions(newPositions)
    }
  })

  if (!isReady) return null

  return (
    <>
      {activeSkills.map(({ skill, index }) => {
        const currentPos = currentPositions[index] || [0, vpHeight, -5]
        const isHovered = hoveredStates[index]
        const scale = isHovered ? 1.2 : 1
        const elapsed = performance.now() - startTimeRef.current
        const isActive = elapsed >= delays[index]

        return (
          <SkillText
            key={`skill-${skill.content}-${index}`}
            content={skill.content}
            isEngineering={skill.isEngineering}
            position={currentPos}
            onHoverChange={(isHovered) => handleHoverChange(index, isHovered)}
            scale={scale}
            opacity={isActive ? 1 : 0}
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

export default function Contents() {
  // We removed the useThree() hook here because reading viewport size
  // in this render function causes re-renders on resize.
  return (
    <group position={[0, 0, 2]}>

      <SkillStackContent />
    </group>
  )
}

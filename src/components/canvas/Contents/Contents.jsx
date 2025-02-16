import * as THREE from 'three'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text3D, OrthographicCamera } from '@react-three/drei'
import { skills, transformSkillsConfig } from '@/helpers/contentsConfig'
import { calculateStackPositions, performLerp } from '@/helpers/positionHelpers'
import { useViewportMeasurements } from '@/helpers/deviceHelpers'
import HKGroteskFont from './HKGrotesk-SemiBold.json'
import LemonFont from './Lemon_Regular.json'
import { useSetAtom } from 'jotai'
import { styleMagazineAtom } from '@/helpers/atoms'

function SkillText({ content, isEngineering, onClick, position, onHoverChange, scale = 1, opacity = 1 }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const textRef = useRef()
  const [textSize, setTextSize] = useState([1, 0.5, 0.25])
  const currentScaleRef = useRef(new THREE.Vector3(scale, scale, scale))
  const groupRef = useRef()
  const setStyleMagazine = useSetAtom(styleMagazineAtom)

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
    setStyleMagazine(isEngineering ? 'engineer' : 'smack')
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    onHoverChange && onHoverChange(false)
    setStyleMagazine('vague')
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
  const { vpWidth: pixelWidth, vpHeight: pixelHeight } = useViewportMeasurements(false)

  // Store the viewport measurements in a ref to avoid rerenders
  const viewportRef = useRef({ width: 0, height: 0 })

  // Convert pixel measurements to Three.js units
  const vpWidth = pixelWidth / 35
  const vpHeight = pixelHeight / 35

  const [activeSkills, setActiveSkills] = useState([])
  const [hoveredStates, setHoveredStates] = useState({})
  const [targetPositions, setTargetPositions] = useState([])
  const [currentPositions, setCurrentPositions] = useState([])
  const [delays, setDelays] = useState([])
  const [isReady, setIsReady] = useState(false)
  const startTimeRef = useRef(0)
  const skillRefs = useRef([])
  const positionRefs = useRef([])
  const lerpSpeed = 0.05

  // Handle viewport resize with debounce
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth / 35
      const newHeight = window.innerHeight / 35

      // Only update if the change is significant (more than 5%)
      const widthDiff = Math.abs(newWidth - viewportRef.current.width) / viewportRef.current.width
      const heightDiff = Math.abs(newHeight - viewportRef.current.height) / viewportRef.current.height

      if (widthDiff > 0.05 || heightDiff > 0.05) {
        viewportRef.current = { width: newWidth, height: newHeight }
        if (skills.length > 0) {
          const { positions, startPositions, delays } = calculateStackPositions(skills, newWidth, newHeight)
          setTargetPositions(positions)
          setCurrentPositions(startPositions)
          setDelays(delays)
        }
      }
    }

    // Initialize viewport ref
    viewportRef.current = { width: vpWidth, height: vpHeight }

    let resizeTimeout
    const debouncedResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(handleResize, 250) // 250ms debounce
    }

    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(resizeTimeout)
    }
  }, [skills])

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
  }, [skills]) // Remove vpWidth and vpHeight from dependencies

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
        return [positionRefs.current[index].x, positionRefs.current[index].y, positionRefs.current[index].z]
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

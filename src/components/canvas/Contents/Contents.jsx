import * as THREE from 'three'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useAspect, Text3D, OrthographicCamera } from '@react-three/drei'
import { skills } from '@/helpers/contentsConfig'
import HKGroteskFont from './HKGrotesk-SemiBold.json'
import LemonFont from './Lemon_Regular.json'

// SkillText remains very similar so that the text material and pointer events work.
function SkillText({ content, isEngineering, onClick, position, onHoverChange, scale = 1, opacity = 1 }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const textRef = useRef()
  const [textSize, setTextSize] = useState([1, 0.5, 0.25])
  const [fontLoaded, setFontLoaded] = useState(false)
  const [currentScale, setCurrentScale] = useState(scale)

  // Calculate the target scale including hover effect
  const targetScale = hovered ? scale * 1 : scale

  // Lerp the current scale
  useFrame((_, delta) => {
    setCurrentScale(THREE.MathUtils.lerp(currentScale, targetScale, delta * 15))
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
      <group scale={currentScale}>
        {/* Invisible mesh for hover detection */}
        <mesh onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
          <boxGeometry args={[textSize[0] * 2, textSize[1] * 2, textSize[2] * 2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <Text3D
          onSync={(troika) => {
            troika.font.manager._loaders[0].load(() => {
              setFontLoaded(true)
            })
          }}
          ref={textRef}
          font={isEngineering ? HKGroteskFont : LemonFont}
          size={isEngineering ? 0.45 : 0.55}
          height={0.5}
          curveSegments={12}
          bevelEnabled={false}
          letterSpacing={isEngineering ? -0.06 : 0}
        >
          {content}
          <meshBasicMaterial color={getColor()} toneMapped={false} transparent opacity={opacity} />
        </Text3D>
      </group>
    </group>
  )
}

// Helper function to calculate stack positions
function calculateStackPositions(skills, vpWidth, vpHeight) {
  const positions = []
  const startPositions = []
  const delays = []

  // Separate skills into columns
  const creativeSkills = skills.filter((skill) => !skill.isEngineering)
  const engineeringSkills = skills.filter((skill) => skill.isEngineering)

  // Calculate spacing for each column independently
  const creativeSpacing = (vpHeight * 0.8) / creativeSkills.length
  const engineeringSpacing = (vpHeight * 0.8) / engineeringSkills.length
  const columnOffset = vpWidth / 5 // Distance between columns
  const staggerDelay = 350 // Delay between each skill in ms

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
    startPositions.push([columnOffset, vpHeight + engineeringSpacing * index, -5])
    delays.push((creativeSkills.length + index) * staggerDelay)
  })

  return { positions, startPositions, delays }
}

// SkillCloud component with lerping animation
function SkillStack({ skills }) {
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)
  const [activeSkills, setActiveSkills] = useState([])
  const [hoveredStates, setHoveredStates] = useState({})
  const [targetPositions, setTargetPositions] = useState([])
  const [currentPositions, setCurrentPositions] = useState([])
  const [delays, setDelays] = useState([])
  const [isReady, setIsReady] = useState(false)
  const startTimeRef = useRef(0)
  const skillRefs = useRef([])
  const lerpSpeed = 0.05 // Increased from 0.03 for faster movement

  // Initialize skill refs and positions
  useEffect(() => {
    if (skills.length > 0) {
      const { positions, startPositions, delays } = calculateStackPositions(skills, vpWidth, vpHeight)
      setTargetPositions(positions)
      setCurrentPositions(startPositions)
      setDelays(delays)
      setActiveSkills(skills.map((skill, index) => ({ skill, index })))
      skillRefs.current = skills.map(() => ({ position: new THREE.Vector3() }))

      // Add a small delay before starting animations
      const timer = setTimeout(() => {
        startTimeRef.current = performance.now()
        setIsReady(true)
      }, 500) // 500ms delay

      return () => clearTimeout(timer)
    }
  }, [skills, vpWidth, vpHeight])

  const handleHoverChange = (index, isHovered) => {
    setHoveredStates((prev) => ({
      ...prev,
      [index]: isHovered,
    }))
  }

  // Lerp positions in useFrame with staggered timing
  useFrame(() => {
    if (!isReady) return

    if (currentPositions.length === targetPositions.length) {
      const elapsed = performance.now() - startTimeRef.current
      const newPositions = currentPositions.map((pos, index) => {
        // Only start lerping if enough time has elapsed for this skill
        if (elapsed < delays[index]) {
          return pos
        }

        const target = targetPositions[index]
        return [
          THREE.MathUtils.lerp(pos[0], target[0], lerpSpeed),
          THREE.MathUtils.lerp(pos[1], target[1], lerpSpeed),
          pos[2],
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

// Modify SkillCloudContent to ensure correct skill ordering
function SkillStackContent() {
  const { engineeringSkills, creativeSkills } = useMemo(() => {
    const engineering = []
    const creative = []
    Object.entries(skills).forEach(([category, skillSet]) => {
      const orderedSkills = Object.values(skillSet)
      orderedSkills.forEach((skill) => {
        if (category === 'engineering') {
          engineering.push({ content: skill.title, isEngineering: true })
        } else {
          creative.push({ content: skill.title, isEngineering: false })
        }
      })
    })
    return {
      engineeringSkills: engineering,
      creativeSkills: creative,
    }
  }, [])

  // Concatenate arrays instead of interleaving to maintain column separation
  const skillsContent = useMemo(() => {
    return [...creativeSkills, ...engineeringSkills]
  }, [engineeringSkills, creativeSkills])

  return <SkillStack skills={skillsContent} />
}

// contents – simplified version without scrolling or page changes
export default function Contents() {
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)

  return (
    <group position={[0, 0, 0]}>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 0]}
        zoom={90}
        near={1}
        far={100}
        left={-vpWidth / 2}
        right={vpWidth / 2}
        top={vpHeight / 2}
        bottom={-vpHeight / 2}
      >
        <SkillStackContent />
      </OrthographicCamera>
    </group>
  )
}

import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useAspect, Html, Text, Plane, PerspectiveCamera, useTexture } from '@react-three/drei'
import { Flex, Box, useReflow } from '@react-three/flex'
import { useAtom } from 'jotai'
import { pagesAtom, scrollState } from '@/helpers/atoms'
import { skills } from '@/helpers/contentsConfig'
import { picturesSmack, picturesEngineer, picturesVague, getTexturePath } from '@/helpers/textureLoader'

function Reflower() {
  const reflow = useReflow()
  useFrame(reflow)
  return null
}

function PicturePlane({ magazine, page }) {
  const texture = useTexture(getTexturePath(magazine, page))
  const scale = 1.2 // Scale down the pictures to better match text size
  return (
    <mesh scale={[scale, scale, 1]}>
      <planeGeometry args={[1.28, 1.71]} /> {/* A4 aspect ratio */}
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Interleave arrays to ensure better distribution
function interleaveArrays(arrays) {
  const maxLength = Math.max(...arrays.map((arr) => arr.length))
  const result = []

  for (let i = 0; i < maxLength; i++) {
    arrays.forEach((array) => {
      if (i < array.length) {
        result.push(array[i])
      }
    })
  }

  return shuffleArray(result)
}

function SkillText({ content, isEngineering, onClick }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const textRef = useRef()

  const getColor = () => {
    if (clicked) return '#ff9f43' // Orange when clicked
    if (hovered) return '#f7d794' // Light yellow when hovered
    return isEngineering ? '#2d4059' : '#ea5455' // Default colors
  }

  return (
    <group
      ref={textRef}
      onClick={(e) => {
        e.stopPropagation()
        setClicked(true)
        onClick(content)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
      }}
    >
      <Text
        font={isEngineering ? '/fonts/HKGrotesk-SemiBold.otf' : '/fonts/lemon-regular.otf'}
        fontSize={isEngineering ? 0.5 : 1}
        maxWidth={2}
        anchorX='center'
        anchorY='middle'
        color={getColor()}
        textAlign='center'
        position={[0, 0, 0]}
      >
        {content}
      </Text>
      <mesh visible={false}>
        <planeGeometry args={[2, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

function Content() {
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)
  const [selectedSkill, setSelectedSkill] = useState(null)

  // Split skills into engineering and creative arrays
  const { engineeringSkills, creativeSkills } = useMemo(() => {
    const engineering = []
    const creative = []

    Object.entries(skills).forEach(([category, skillSet]) => {
      Object.values(skillSet).forEach((skill) => {
        if (category === 'engineering') {
          engineering.push({ type: 'skill', content: skill.title, isEngineering: true })
        } else {
          creative.push({ type: 'skill', content: skill.title, isEngineering: false })
        }
      })
    })

    return { engineeringSkills: shuffleArray(engineering), creativeSkills: shuffleArray(creative) }
  }, [])

  // Combine only skill content
  const skillsContent = useMemo(() => {
    return interleaveArrays([engineeringSkills, creativeSkills])
  }, [engineeringSkills, creativeSkills])

  // Adjust grid calculations
  const itemWidth = 0.8
  const itemsPerRow = Math.floor((vpWidth * 0.9) / itemWidth)
  const rows = Math.ceil(skillsContent.length / itemsPerRow)
  const totalHeight = rows * itemWidth

  const handleSkillClick = (content) => {
    setSelectedSkill(content)
  }

  return (
    <Box
      flexDirection='row'
      alignItems='flex-start'
      justifyContent='center'
      flexWrap='wrap'
      width={vpWidth * 0.9}
      height={totalHeight}
      position={[0, -totalHeight / 2, 0]}
    >
      {skillsContent.map(
        (item, i) =>
          (!selectedSkill || selectedSkill === item.content) && (
            <Box margin={0.75} key={i} width={1} height={1} centerAnchor>
              <SkillText content={item.content} isEngineering={item.isEngineering} onClick={handleSkillClick} />
            </Box>
          ),
      )}
    </Box>
  )
}

export default function WordCloud({ onChangePages }) {
  const group = useRef()
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.innwidth, size.height)
  const vec = new THREE.Vector3()

  useFrame(() => {
    group.current.position.lerp(vec.set(0, scrollState.top / 100, 0), 0.1)
  })

  const handleReflow = useCallback(
    (w, h) => {
      const calculatedPages = h / vpHeight
      onChangePages(calculatedPages)
    },
    [onChangePages, vpHeight],
  )

  return (
    <group ref={group} position={[0, 0, 2]}>
      <Flex flexDirection='column' size={[vpWidth, vpHeight, 0]} onReflow={handleReflow} centerAnchor>
        <Reflower />
        <Content />
      </Flex>
    </group>
  )
}

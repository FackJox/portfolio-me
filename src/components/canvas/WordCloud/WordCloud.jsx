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

function Content() {
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)

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

  // Prepare pictures array
  const pictures = useMemo(() => {
    const pics = [
      ...picturesSmack.map((pic) => ({ type: 'picture', magazine: 'smack', page: pic })),
      ...picturesEngineer.map((pic) => ({ type: 'picture', magazine: 'engineer', page: pic })),
      ...picturesVague.map((pic) => ({ type: 'picture', magazine: 'vague', page: pic })),
    ]
    return shuffleArray(pics)
  }, [])

  // Interleave all content types for better distribution
  const mixedContent = useMemo(() => {
    return interleaveArrays([engineeringSkills, creativeSkills, pictures])
  }, [engineeringSkills, creativeSkills, pictures])

  // Adjust grid calculations
  const itemWidth = 0.8 // Total width including margin
  const itemsPerRow = Math.floor((vpWidth * 0.9) / itemWidth) // Use 90% of viewport width
  const rows = Math.ceil(mixedContent.length / itemsPerRow)
  const totalHeight = rows * itemWidth // Use same spacing vertically

  return (
    <Box
      flexDirection='row'
      alignItems='flex-start'
      justifyContent='center'
      flexWrap='wrap'
      width={vpWidth * 0.9}
      height={totalHeight}
      position={[0, -totalHeight / 2, 0]} // Center vertically
    >
      {mixedContent.map((item, i) => (
        <Box margin={0.75} key={i} width={1} height={1} centerAnchor>
          {item.type === 'skill' ? (
            <Text
              font={item.isEngineering ? '/fonts/HKGrotesk-SemiBold.otf' : '/fonts/lemon-regular.otf'}
              fontSize={item.isEngineering ? 0.5 : 1}
              maxWidth={2}
              anchorX='center'
              anchorY='middle'
              color={item.isEngineering ? '#2d4059' : '#ea5455'}
              textAlign='center'
            >
              {item.content}
            </Text>
          ) : (
            <PicturePlane magazine={item.magazine} page={item.page} />
          )}
        </Box>
      ))}
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
      <Flex
        flexDirection='column'
        size={[vpWidth, vpHeight, 0]}
        onReflow={handleReflow}
        centerAnchor
      >
        <Reflower />
        <Content />
      </Flex>
    </group>
  )
}


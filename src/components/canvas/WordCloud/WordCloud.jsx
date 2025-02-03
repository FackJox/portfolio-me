import * as THREE from 'three'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { useAspect, Text } from '@react-three/drei'
import { skills } from '@/helpers/contentsConfig'
import { getTexturePath } from '@/helpers/textureLoader'
import { Physics, usePlane, useBox } from '@react-three/p2'

// ------------------------------
// (Unchanged) Texture manager – you can keep this if you use it elsewhere
const textureManager = {
  cache: new Map(),
  loadingPromises: new Map(),
  async load(path) {
    if (this.cache.has(path)) {
      return this.cache.get(path)
    }
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path)
    }
    const loadingPromise = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const texture = new THREE.Texture(img)
        texture.needsUpdate = true
        this.cache.set(path, texture)
        this.loadingPromises.delete(path)
        resolve(texture)
      }
      img.onerror = reject
      img.src = path
    })
    this.loadingPromises.set(path, loadingPromise)
    return loadingPromise
  },
  dispose(path) {
    if (this.cache.has(path)) {
      const texture = this.cache.get(path)
      texture.dispose()
      this.cache.delete(path)
    }
  },
  clear() {
    this.cache.forEach((texture) => texture.dispose())
    this.cache.clear()
    this.loadingPromises.clear()
  },
}

// ------------------------------
// SkillText remains very similar so that the text material and pointer events work.
// (You can choose to keep or remove onClick/hover styling as needed.)
function SkillText({ content, isEngineering, onClick, position }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const textRef = useRef()

  // Calculate font size based on content length
  const fontSize = useMemo(() => {
    const baseSize = 0.8 // Increased base size
    const length = content.length
    const words = content.split(' ')
    const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b))

    // For single words, scale based on length
    if (words.length === 1) {
      return baseSize * Math.min(1, 6 / length)
    }

    // For multiple words
    const scaleFactor = Math.min(
      1,
      Math.min(
        5 / longestWord.length, // Scale based on longest word
        10 / length, // Scale based on total length
      ),
    )

    return baseSize * scaleFactor
  }, [content])

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
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
  }

  return (
    <group position={position} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <Text
        ref={textRef}
        font={isEngineering ? '/fonts/HKGrotesk-SemiBold.otf' : '/fonts/lemon-regular.otf'}
        fontSize={fontSize}
        maxWidth={1.1}
        anchorX='center'
        anchorY='middle'
        color={getColor()}
        textAlign='center'
        material={new THREE.MeshBasicMaterial({ toneMapped: false })}
        overflowWrap='normal'
        whiteSpace='pre-line'
        lineHeight={1}
      >
        {content}
      </Text>
    </group>
  )
}

// ------------------------------
// Helper functions for shuffling and interleaving
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

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

// Wall component using usePlane
function Wall({ position, angle = 0 }) {
  const [ref] = usePlane(() => ({
    type: 'static',
    position,
    angle,
  }))
  return <group ref={ref} />
}

// Bounds – create invisible walls based on the current viewport dimensions
function Bounds() {
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)

  return (
    <>
      {/* Left Wall */}
      <Wall position={[-vpWidth / 2, 0]} angle={Math.PI / 2} />
      {/* Right Wall */}
      <Wall position={[vpWidth / 2, 0]} angle={-Math.PI / 2} />
      {/* Floor */}
      <Wall position={[0, -vpHeight / 2]} angle={0} />
    </>
  )
}

// SkillBody component using useBox
function SkillBody({ position, children }) {
  const [ref] = useBox(() => ({
    mass: 1,
    position,
    args: [0.5, 0.5],
    linearDamping: 0.2,
    angularDamping: 0.9,
  }))

  return <group ref={ref}>{children}</group>
}

// FallingSkills – each skill text is wrapped in a dynamic body
function FallingSkills({ skills }) {
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)
  const spawnYBase = vpHeight / 2 + 1

  // Create a grid of possible positions and shuffle them
  const gridSpacing = 3 // Space between spawn points
  const columns = Math.floor(vpWidth / gridSpacing)
  const rows = Math.ceil(skills.length / columns)

  // Generate all possible positions
  const positions = useMemo(() => {
    const points = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Add some controlled randomness to the grid positions
        const randomOffset = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 1.5,
        }

        const x = col * gridSpacing - vpWidth / 2 + gridSpacing / 2 + randomOffset.x
        const y = spawnYBase + row * gridSpacing + randomOffset.y

        points.push([x, y])
      }
    }
    return shuffleArray([...points])
  }, [columns, rows, vpWidth, spawnYBase])

  return (
    <>
      {skills.map((skill, i) => {
        const spawnPos = positions[i] || [0, spawnYBase]

        return (
          <SkillBody key={i} position={spawnPos}>
            <SkillText content={skill.content} isEngineering={skill.isEngineering} />
          </SkillBody>
        )
      })}
    </>
  )
}

// FallingContent – set up the physics simulation and create the falling skills
function FallingContent() {
  const { engineeringSkills, creativeSkills } = useMemo(() => {
    const engineering = []
    const creative = []
    Object.entries(skills).forEach(([category, skillSet]) => {
      Object.values(skillSet).forEach((skill) => {
        if (category === 'engineering') {
          engineering.push({ content: skill.title, isEngineering: true })
        } else {
          creative.push({ content: skill.title, isEngineering: false })
        }
      })
    })
    return {
      engineeringSkills: shuffleArray(engineering),
      creativeSkills: shuffleArray(creative),
    }
  }, [])

  const skillsContent = useMemo(
    () => interleaveArrays([engineeringSkills, creativeSkills]),
    [engineeringSkills, creativeSkills],
  )

  return (
    <Physics gravity={[0, -9.81]}>
      <Bounds />
      <FallingSkills skills={skillsContent} />
    </Physics>
  )
}

// ------------------------------
// WordCloud – simplified version without scrolling or page changes
export default function WordCloud() {
  return (
    <group position={[0, 0, 0]}>
      <FallingContent />
    </group>
  )
}

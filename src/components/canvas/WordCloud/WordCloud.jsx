import * as THREE from 'three'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { useAspect, Text3D, OrthographicCamera } from '@react-three/drei'
import { skills } from '@/helpers/contentsConfig'
import { getTexturePath } from '@/helpers/textureLoader'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import HKGroteskFont from './HKGrotesk-SemiBold.json'
import LemonFont from './Lemon_Regular.json'

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
function SkillText({ content, isEngineering, onClick, position, onHoverChange, scale = 1 }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const textRef = useRef()
  const [textSize, setTextSize] = useState([1, 0.5, 0.25])

  useEffect(() => {
    if (textRef.current) {
      const box = new THREE.Box3().setFromObject(textRef.current)
      const size = box.getSize(new THREE.Vector3())
      setTextSize([size.x / 2, size.y / 2, size.z / 2])
    }
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
    onHoverChange && onHoverChange(true)
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    onHoverChange && onHoverChange(false)
  }

  return (
    <group position={position} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <Text3D
        ref={textRef}
        font={isEngineering ? HKGroteskFont : LemonFont}
        size={isEngineering ? 0.45 : 0.65}
        height={0.5}
        curveSegments={12}
        bevelEnabled={false}
      >
        {content}
        <meshBasicMaterial color={getColor()} toneMapped={false} />
      </Text3D>
      <CuboidCollider args={textSize.map((s) => s * scale)} />
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

// ------------------------------
// Bounds – create invisible walls (and a ceiling and floor) based on the current viewport dimensions.
function Bounds() {
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)
  const thickness = 1

  const bounds = useMemo(
    () => ({
      left: [-vpWidth / 2 - thickness / 2, 0, -5],
      right: [vpWidth / 2 + thickness / 2, 0, -5],
      floor: [0, -vpHeight / 2 - thickness / 2, -5],
      dimensions: {
        walls: [thickness, vpHeight, 10],
        floor: [vpWidth, thickness, 10],
      },
    }),
    [vpWidth, vpHeight, thickness],
  )

  return (
    <>
      {/* Left Wall */}
      <RigidBody type='fixed'>
        <CuboidCollider args={bounds.dimensions.walls} position={bounds.left} />
      </RigidBody>
      {/* Right Wall */}
      <RigidBody type='fixed'>
        <CuboidCollider args={bounds.dimensions.walls} position={bounds.right} />
      </RigidBody>
      {/* Floor */}
      <RigidBody type='fixed'>
        <CuboidCollider args={bounds.dimensions.floor} position={bounds.floor} />
      </RigidBody>
    </>
  )
}

// ------------------------------
// FallingSkills – each skill text is wrapped in a dynamic RigidBody. They start from a random x position and from a y position above the top.
function FallingSkills({ skills }) {
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)
  const spawnYBase = vpHeight / 2 + 3
  const [activeSkills, setActiveSkills] = useState([])
  const [hoveredStates, setHoveredStates] = useState({})

  // Create a grid of possible positions and shuffle them
  const gridSpacing = 3
  const verticalSpacing = 4
  const columns = Math.floor(vpWidth / gridSpacing)
  const rows = Math.ceil(skills.length / columns)

  // Generate all possible positions
  const positions = useMemo(() => {
    const points = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const randomOffset = {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 2.5,
        }

        const x = col * gridSpacing - vpWidth / 2 + gridSpacing / 2 + randomOffset.x
        const y = spawnYBase + row * verticalSpacing + randomOffset.y

        points.push([x, y, 0])
      }
    }
    return shuffleArray([...points])
  }, [columns, rows, vpWidth, spawnYBase])

  // Gradually add skills with a delay
  useEffect(() => {
    let timeoutIds = []

    skills.forEach((skill, index) => {
      const delay = index * 300
      const timeoutId = setTimeout(() => {
        setActiveSkills((prev) => [...prev, { skill, index }])
      }, delay)
      timeoutIds.push(timeoutId)
    })

    return () => {
      timeoutIds.forEach((id) => clearTimeout(id))
    }
  }, [skills])

  const handleHoverChange = (index, isHovered) => {
    setHoveredStates((prev) => ({
      ...prev,
      [index]: isHovered,
    }))
  }

  return (
    <>
      {activeSkills.map(({ skill, index }) => {
        const spawnPos = positions[index] || [0, spawnYBase, 0]
        spawnPos[2] = -5
        const isHovered = hoveredStates[index]
        const scale = isHovered ? 1.2 : 1

        return (
          <RigidBody
            key={index}
            colliders={false}
            position={spawnPos}
            type='dynamic'
            restitution={0.1}
            friction={1.5}
            linearDamping={2.5}
            angularDamping={100}
            mass={50}
            density={500}
            gravityScale={4}
            enabledRotations={[false, false, true]}
            enabledTranslations={[true, true, false]}
          >
            <SkillText
              content={skill.content}
              isEngineering={skill.isEngineering}
              position={[0, 0, 0]}
              onHoverChange={(isHovered) => handleHoverChange(index, isHovered)}
              scale={scale}
            />
          </RigidBody>
        )
      })}
    </>
  )
}

// ------------------------------
// FallingContent – set up the physics simulation and create the falling skills.
// Here we prepare the list of skills (by interleaving and shuffling the creative
// and engineering skills as before) and then render them inside a Physics container.
function FallingContent() {
  const [isPhysicsReady, setPhysicsReady] = useState(false)
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

  useEffect(() => {
    // Add a small delay before enabling physics to ensure stable viewport dimensions
    const timer = setTimeout(() => {
      setPhysicsReady(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isPhysicsReady) return null

  return (
    <Physics gravity={[0, -9.81, 0]} debug>
      <Bounds />
      <FallingSkills skills={skillsContent} />
    </Physics>
  )
}

// ------------------------------
// WordCloud – simplified version without scrolling or page changes
export default function WordCloud() {
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)

  return (
    <group position={[0, 0, 0]}>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 0]}
        zoom={100}
        near={1}
        far={100}
        left={-vpWidth / 2}
        right={vpWidth / 2}
        top={vpHeight / 2}
        bottom={-vpHeight / 2}
      >
        <FallingContent />
      </OrthographicCamera>
    </group>
  )
}

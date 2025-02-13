import * as THREE from 'three'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
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
  const [fontLoaded, setFontLoaded] = useState(false)
  const [currentScale, setCurrentScale] = useState(scale)

  // Calculate the target scale including hover effect
  const targetScale = hovered ? scale * 1 : scale

  // Lerp the current scale
  useFrame((_, delta) => {
    setCurrentScale(THREE.MathUtils.lerp(currentScale, targetScale, delta * 15))
  })

  // Calculate scaled collider size with proper scaling
  const scaledColliderSize = textSize.map((s) => s * currentScale)

  useEffect(() => {
    let retries = 0
    let timeoutId
    const tryMeasure = () => {
      if (textRef.current?.geometry) {
        textRef.current.geometry.computeBoundingBox()
        const box = textRef.current.geometry.boundingBox
        if (box) {
          const size = new THREE.Vector3()
          box.getSize(size)
          // Adjust the collider size to better match the text
          setTextSize([size.x / 2, size.y / 2, size.z / 2])

          const center = new THREE.Vector3()
          box.getCenter(center)
          textRef.current.geometry.translate(-center.x, -center.y, -center.z)

          return
        }
      }

      if (retries < 5) {
        retries++
        timeoutId = setTimeout(tryMeasure, 100 + retries * 50) // Backoff
      } else {
        console.error('Failed to measure text after retries')
      }
    }

    tryMeasure()

    return () => clearTimeout(timeoutId)
  }, [content, fontLoaded])

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
          <meshBasicMaterial color={getColor()} toneMapped={false} />
        </Text3D>
      </group>
      <CuboidCollider args={scaledColliderSize} />
    </group>
  )
}

// ------------------------------
// Helper functions for interleaving
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
  return result
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

      floor: [0, -vpHeight / 2.5 - thickness / 2, -5],
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
  const [isPhysicsPaused, setPhysicsPaused] = useState(false)
  const verticalSpacing = 4 // Increased from 2.5
  const columnOffset = vpWidth / 5 // Increased from vpWidth / 4 for more horizontal space

  const [activeSkills, setActiveSkills] = useState([])
  const [hoveredStates, setHoveredStates] = useState({})

  useEffect(() => {
    const handler = (e) => e.key === 'p' && setPhysicsPaused(!isPhysicsPaused)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isPhysicsPaused])

  // Split and generate positions for two columns
  const { positions, splitSkills } = useMemo(() => {
    const points = []

    // Separate skills into engineering and creative
    const engineeringSkills = skills.filter((skill) => skill.isEngineering)
    const creativeSkills = skills.filter((skill) => !skill.isEngineering)

    // Calculate rows needed for the longer column
    const maxSkills = Math.max(engineeringSkills.length, creativeSkills.length)
    const totalHeight = maxSkills * verticalSpacing
    const startY = vpHeight + totalHeight * 1.5 // Increased starting height

    // Generate positions for creative skills (left column)
    creativeSkills.forEach((skill, index) => {
      const randomOffset = {
        x: (Math.random() - 0.5) * 3, // Increased horizontal spread
        y: (Math.random() - 0.5) * 2, // Increased vertical spread
      }

      const x = -columnOffset + randomOffset.x
      const y = startY - index * verticalSpacing * 1.5 + randomOffset.y // Increased spacing

      points.push([x, y, -5])
    })

    // Generate positions for engineering skills (right column)
    engineeringSkills.forEach((skill, index) => {
      const randomOffset = {
        x: (Math.random() - 0.5) * 3, // Increased horizontal spread
        y: (Math.random() - 0.5) * 2, // Increased vertical spread
      }

      const x = columnOffset + randomOffset.x
      const y = startY - index * verticalSpacing * 1.5 + randomOffset.y // Increased spacing

      points.push([x, y, -5])
    })

    // Combine skills in the same order as positions
    const orderedSkills = [...creativeSkills, ...engineeringSkills]

    return {
      positions: points,
      splitSkills: orderedSkills.map((skill, index) => ({ skill, index })),
    }
  }, [vpWidth, vpHeight, skills])

  // Set active skills using the properly ordered skills
  useEffect(() => {
    if (splitSkills.length > 0) {
      setActiveSkills(splitSkills)
    }
  }, [splitSkills])

  const handleHoverChange = (index, isHovered) => {
    setHoveredStates((prev) => ({
      ...prev,
      [index]: isHovered,
    }))
  }

  return (
    <>
      {activeSkills.map(({ skill, index }) => {
        const spawnPos = positions[index] || [0, 0, 0]
        spawnPos[2] = -5
        const isHovered = hoveredStates[index]
        const scale = isHovered ? 1.2 : 1

        return (
          <RigidBody
            key={index}
            colliders={false}
            position={spawnPos}
            restitution={0.2}
            friction={1.5}
            mass={1}
            density={50}
            gravityScale={3}
            enabledRotations={[false, false, false]}
            enabledTranslations={[true, true, false]}
            type={isPhysicsPaused ? 'fixed' : 'dynamic'}
            linearDamping={isPhysicsPaused ? 100 : 2}
            angularDamping={isPhysicsPaused ? 100 : 100}
            ccd={true}
            sleepThreshold={0.2}
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
      console.log(`Processing category: ${category}, number of skills:`, Object.keys(skillSet).length)
      // Convert to array while maintaining order
      const orderedSkills = Object.values(skillSet)
      orderedSkills.forEach((skill) => {
        if (category === 'engineering') {
          engineering.push({ content: skill.title, isEngineering: true })
        } else {
          creative.push({ content: skill.title, isEngineering: false })
        }
      })
    })
    console.log('Total engineering skills:', engineering.length)
    console.log('Total creative skills:', creative.length)
    return {
      engineeringSkills: engineering, // Remove shuffling
      creativeSkills: creative, // Remove shuffling
    }
  }, [])

  const skillsContent = useMemo(() => {
    const interleaved = interleaveArrays([engineeringSkills, creativeSkills])
    console.log('Total interleaved skills:', interleaved.length)
    return interleaved
  }, [engineeringSkills, creativeSkills])

  useEffect(() => {
    // Add a small delay before enabling physics to ensure stable viewport dimensions
    const timer = setTimeout(() => {
      setPhysicsReady(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isPhysicsReady) return null

  return (
    <Physics
      gravity={[0, -9.81, 0]}
      debug
      maxStabilizationIterations={20}
      maxVelocityIterations={20}
      maxVelocityFriction={20}
      collisionIterations={10}
      timeStep={1 / 60}
    >
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
        zoom={90}
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

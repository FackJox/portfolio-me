import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useAspect, Html, Text, Plane, PerspectiveCamera, useTexture } from '@react-three/drei'
import { Flex, Box, useReflow } from '@react-three/flex'
import { useAtom } from 'jotai'
import { pagesAtom, scrollState } from '@/helpers/atoms'
import { skills, SmackContents, EngineerContents } from '@/helpers/contentsConfig'
import { picturesSmack, picturesEngineer, picturesVague, getTexturePath } from '@/helpers/textureLoader'

function Reflower() {
  const reflow = useReflow()
  useFrame(reflow)
  return null
}

// Create a texture manager to handle texture loading and caching
const textureManager = {
  cache: new Map(),
  loadingPromises: new Map(),

  async load(path) {
    // Return cached texture if available
    if (this.cache.has(path)) {
      return this.cache.get(path)
    }

    // Return existing promise if texture is already loading
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path)
    }

    // Create new loading promise
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

function PicturePlane({ magazine, page }) {
  const [texture, setTexture] = useState(null)
  const [error, setError] = useState(false)
  const texturePath = getTexturePath(magazine, page)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    const loadTexture = async () => {
      try {
        const tex = await textureManager.load(texturePath)
        if (mounted.current) {
          setTexture(tex)
          setError(false)
        }
      } catch (err) {
        if (mounted.current) {
          setError(true)
        }
      }
    }

    loadTexture()

    return () => {
      mounted.current = false
    }
  }, [texturePath, magazine, page])

  if (error || !texture) return null

  const scale = 1.2
  return (
    <mesh scale={[scale, scale, 1]}>
      <planeGeometry args={[1.28, 1.71]} />
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

// Find pages that contain a specific skill
function findPagesWithSkill(skillTitle) {
  const matchingPages = []

  // Helper function to add pages with proper validation
  const addPages = (magazine, pages, page) => {
    if (pages) {
      pages.forEach((p) => {
        matchingPages.push({ magazine, page: p })
      })
    } else if (page) {
      // For single page entries, format the page number properly
      const formattedPage = typeof page === 'number' ? page.toString().padStart(2, '0') : page
      matchingPages.push({ magazine, page: formattedPage })
    }
  }

  // Find the skill object that matches the title
  let matchingSkill = null
  Object.entries(skills).forEach(([category, skillSet]) => {
    Object.values(skillSet).forEach((skill) => {
      if (skill.title === skillTitle) {
        matchingSkill = skill
      }
    })
  })

  if (!matchingSkill) return []

  // Check SmackContents
  Object.entries(SmackContents).forEach(([section, content]) => {
    if (content.skills && content.skills.length > 0) {
      const hasSkill = content.skills.some((skill) => skill === matchingSkill)
      if (hasSkill) {
        addPages('smack', content.pages, content.page)
      }
    }
  })

  // Check EngineerContents
  Object.entries(EngineerContents).forEach(([section, content]) => {
    if (content.skills && content.skills.length > 0) {
      const hasSkill = content.skills.some((skill) => skill === matchingSkill)
      if (hasSkill) {
        addPages('engineer', content.pages, content.page)
      }
    }
  })

  return matchingPages
}

function Content() {
  const { size, gl } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [matchingPages, setMatchingPages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)

  // Clean up textures when component unmounts
  useEffect(() => {
    return () => {
      textureManager.clear()
    }
  }, [])

  // Handle page cycling
  useEffect(() => {
    if (matchingPages.length > 4) {
      const interval = setInterval(() => {
        setCurrentPageIndex((current) => (current + 1) % Math.max(1, matchingPages.length - 3))
      }, 3000) // Cycle every 3 seconds

      return () => clearInterval(interval)
    }
  }, [matchingPages.length])

  // Preload only the first batch of textures
  useEffect(() => {
    const preloadInitialTextures = async () => {
      setIsLoading(true)
      try {
        const initialPictures = [
          ...picturesSmack.slice(0, 4).map((page) => ({ magazine: 'smack', page })),
          ...picturesEngineer.slice(0, 4).map((page) => ({ magazine: 'engineer', page })),
        ]

        await Promise.all(
          initialPictures.map(({ magazine, page }) => textureManager.load(getTexturePath(magazine, page))),
        )
      } catch (error) {
        // Keep this warning for debugging purposes
        console.warn('Error preloading textures:', error)
      }
      setIsLoading(false)
    }

    preloadInitialTextures()
  }, [])

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
    if (selectedSkill === content) {
      setSelectedSkill(null)
      setMatchingPages([])
    } else {
      setSelectedSkill(content)
      const pages = findPagesWithSkill(content)
      setMatchingPages(pages)
    }
  }

  return (
    <Box
      flexDirection='column'
      alignItems='flex-start'
      justifyContent='flex-start'
      width={vpWidth * 0.9}
      height={totalHeight + (matchingPages.length > 0 ? 2 : 0)}
      position={[0, -totalHeight / 2, 0]}
    >
      {/* Skills Grid */}
      <Box
        flexDirection='row'
        alignItems='flex-start'
        justifyContent='center'
        flexWrap='wrap'
        width={vpWidth * 0.9}
        height={totalHeight}
      >
        {!isLoading &&
          skillsContent.map(
            (item, i) =>
              (!selectedSkill || selectedSkill === item.content) && (
                <Box margin={0.75} key={i} width={1} height={1} centerAnchor>
                  <SkillText content={item.content} isEngineering={item.isEngineering} onClick={handleSkillClick} />
                </Box>
              ),
          )}
      </Box>

      {/* Matching Pages Row */}
      {!isLoading && matchingPages.length > 0 && (
        <Box
          flexDirection='row'
          alignItems='center'
          justifyContent='center'
          flexWrap='wrap'
          width={vpWidth * 0.9}
          height={2}
          marginTop={1}
        >
          {matchingPages.slice(currentPageIndex, currentPageIndex + 4).map((page, index) => (
            <Box
              margin={0.5}
              key={`${page.magazine}-${page.page}-${index}`}
              width={1.28 * 1.2}
              height={1.71 * 1.2}
              centerAnchor
            >
              <Suspense fallback={null}>
                <PicturePlane magazine={page.magazine} page={page.page} />
              </Suspense>
            </Box>
          ))}
        </Box>
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

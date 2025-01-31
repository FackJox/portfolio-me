import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useAspect, Html, Text, Plane, PerspectiveCamera, useTexture } from '@react-three/drei'
import { useAtom } from 'jotai'
import { pagesAtom, scrollTopAtom, styleMagazineAtom } from '@/helpers/atoms'
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

function PicturePlane({ magazine, page, position }) {
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

  const scale = 1.4
  return (
    <mesh scale={[scale, scale, 1]} position={position}>
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

function SkillText({ content, isEngineering, onClick, isSelected, position }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [, setStyleMagazine] = useAtom(styleMagazineAtom)
  const textRef = useRef()

  const getColor = () => {
    if (clicked) return isEngineering ? '#FFB79C' : '#FABE7F' // Orange when clicked
    if (hovered) return isEngineering ? '#FFB79C' : '#FABE7F' // Light yellow when hovered
    return '#F4EEDC' // Default colors
  }

  const handleClick = (e) => {
    e.stopPropagation()
    const newClickedState = !clicked
    setClicked(newClickedState)
    if (newClickedState) {
      setStyleMagazine(isEngineering ? 'engineer' : 'smack')
    } else {
      setStyleMagazine('vague')
    }
    onClick(content)
  }

  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    if (!clicked) {
      setStyleMagazine(isEngineering ? 'engineer' : 'smack')
    }
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    setHovered(false)
    if (!clicked) {
      setStyleMagazine('vague')
    }
  }

  return (
    <group
      ref={textRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <Text
        font={isEngineering ? '/fonts/HKGrotesk-SemiBold.otf' : '/fonts/lemon-regular.otf'}
        fontSize={isEngineering ? 0.5 : 0.75}
        maxWidth={2}
        anchorX='center'
        anchorY='middle'
        color={getColor()}
        textAlign='center'
        material={
          new THREE.MeshBasicMaterial({
            toneMapped: false,
          })
        }
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

function AnimatedBox({ children, position, ...props }) {
  const ref = useRef()
  const targetPos = useRef(position)

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x += (targetPos.current[0] - ref.current.position.x) * 0.1
      ref.current.position.y += (targetPos.current[1] - ref.current.position.y) * 0.1
      ref.current.position.z += (targetPos.current[2] - ref.current.position.z) * 0.1
    }
  })

  useEffect(() => {
    targetPos.current = position
  }, [position])

  return (
    <Box ref={ref} {...props}>
      {children}
    </Box>
  )
}

function Content() {
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [matchingPages, setMatchingPages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [savedSkillsContent, setSavedSkillsContent] = useState(null)
  const groupRef = useRef()

  // Clean up textures when component unmounts
  useEffect(() => {
    return () => {
      textureManager.clear()
    }
  }, [])

  // Handle page cycling with cleanup
  useEffect(() => {
    let interval
    if (matchingPages.length > 4) {
      interval = setInterval(() => {
        setCurrentPageIndex((current) => (current + 1) % Math.max(1, matchingPages.length - 3))
      }, 3000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [matchingPages.length])

  // Split and shuffle skills only once on mount
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

    return {
      engineeringSkills: shuffleArray([...engineering]),
      creativeSkills: shuffleArray([...creative]),
    }
  }, [])

  // Create initial interleaved content
  const initialSkillsContent = useMemo(() => {
    return interleaveArrays([engineeringSkills, creativeSkills])
  }, [engineeringSkills, creativeSkills])

  // Use saved content or initial content
  const skillsContent = useMemo(() => {
    return savedSkillsContent || initialSkillsContent
  }, [savedSkillsContent, initialSkillsContent])

  const handleSkillClick = useCallback(
    (content) => {
      if (selectedSkill === content) {
        // Unselecting - restore previous state
        setSelectedSkill(null)
        setMatchingPages([])
        setSavedSkillsContent(null)
      } else {
        // Selecting new skill - save current state
        if (!selectedSkill) {
          setSavedSkillsContent(skillsContent)
        }
        setSelectedSkill(content)
        const pages = findPagesWithSkill(content)
        setMatchingPages(pages)
      }
    },
    [selectedSkill, skillsContent],
  )

  const calculateSkillPosition = (index, total) => {
    const columns = Math.ceil(Math.sqrt(total))
    const rows = Math.ceil(total / columns)
    const x = ((index % columns) - columns / 2) * 2.5
    const y = (Math.floor(index / columns) - rows / 2) * 2
    return [x, y, 0]
  }

  const calculatePagePosition = (index) => {
    const x = ((index % 2) - 0.5) * 3
    const y = -vpHeight / 4
    return [x, y, 0]
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {!isLoading &&
        skillsContent.map((item, i) => {
          const isSelected = selectedSkill === item.content
          const basePos = calculateSkillPosition(i, skillsContent.length)
          const yOffset = isSelected ? 2 : 0
          const position = [basePos[0], basePos[1] + yOffset, basePos[2]]
          const shouldShow = !selectedSkill || isSelected

          return shouldShow ? (
            <SkillText
              key={`${item.content}-${i}`}
              content={item.content}
              isEngineering={item.isEngineering}
              onClick={handleSkillClick}
              isSelected={isSelected}
              position={position}
            />
          ) : null
        })}

      {!isLoading &&
        matchingPages
          .slice(currentPageIndex, currentPageIndex + 4)
          .map((page, index) => (
            <PicturePlane
              key={`${page.magazine}-${page.page}-${index}-${currentPageIndex}`}
              magazine={page.magazine}
              page={page.page}
              position={calculatePagePosition(index)}
            />
          ))}
    </group>
  )
}

export default function WordCloud({ onChangePages }) {
  const group = useRef()
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)
  const [scrollTop] = useAtom(scrollTopAtom)

  useFrame(() => {
    if (group.current) {
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, scrollTop / 100, 0.1)
    }
  })

  useEffect(() => {
    if (onChangePages) {
      onChangePages(3) // Set a fixed number of pages since we're not using flex layout
    }
  }, [onChangePages])

  return (
    <group ref={group} position={[0, 0, 2]}>
      <Content />
    </group>
  )
}

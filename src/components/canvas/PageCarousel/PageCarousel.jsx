import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { scrollState } from '@/helpers/components/Scroll'
import { useTexture } from '@react-three/drei'
import { useSetAtom, useAtomValue } from 'jotai'
import { carouselReadyAtom } from '@/helpers/atoms'
import { configureMaterialShader } from '@/helpers/shaderHelpers'
import { carouselExitingAtom } from '@/components/dom/DescriptionCarousel'

export const PageCarousel = ({ images = [], onFinish, isExiting = false }) => {
  const groupRef = useRef()
  const meshesRef = useRef([])
  const scrollRef = useRef(0)
  const initialAnimationRef = useRef(-10) // Start at -10
  const hasLoggedReady = useRef(false) // Track if we've logged ready
  const hasFinished = useRef(false) // Track if we've finished
  const setCarouselReady = useSetAtom(carouselReadyAtom)
  const exitProgressRef = useRef(0) // Track exit animation progress
  const lastLogTimeRef = useRef(0) // For throttling logs
  const shouldExit = useAtomValue(carouselExitingAtom)
  const combinedIsExiting = isExiting || shouldExit

  // Load textures at component level
  const textures = useTexture(images)

  // Helper function for entrance animation
  const handleEntranceAnimation = (delta) => {
    initialAnimationRef.current = THREE.MathUtils.lerp(initialAnimationRef.current, 0, 0.05)

    // Check if initial animation is complete
    if (!hasLoggedReady.current && Math.abs(initialAnimationRef.current) < 0.01) {
      hasLoggedReady.current = true
      setCarouselReady(true)
    }
  }

  // Helper function for exit animation
  const handleExitAnimation = (delta) => {
    const targetProgress = images.length * 1.75
    const prevExitProgress = exitProgressRef.current
    exitProgressRef.current = THREE.MathUtils.lerp(exitProgressRef.current, targetProgress, 0.01)

    // Check if exit animation is complete
    if (!hasFinished.current && Math.abs(exitProgressRef.current - targetProgress) < 0.01) {
      hasFinished.current = true
      // Reset scroll state before calling onFinish
      scrollState.top = 0
      scrollState.progress = 0
      onFinish?.()
    }

    return exitProgressRef.current
  }

  // Helper function for updating individual mesh animations
  const updateMeshAnimation = (mesh, pos, index, scrollValue, delta, isExiting) => {
    const finalProgress = -scrollValue - pos + initialAnimationRef.current

    if (mesh.material.userData.shader) {
      mesh.material.userData.shader.uniforms.progress.value = finalProgress
      mesh.material.userData.shader.uniforms.time.value += delta
    }

    return finalProgress < 2
  }

  // Reset scroll state when unmounting
  useEffect(() => {
    return () => {
      scrollState.top = 0
      scrollState.progress = 0
    }
  }, [])

  useEffect(() => {
    // Reset ready state and scroll when component mounts or images change
    setCarouselReady(false)
    hasFinished.current = false
    hasLoggedReady.current = false
    scrollState.top = 0
    scrollState.progress = 0
    initialAnimationRef.current = -10
    exitProgressRef.current = 0

    return () => {
      setCarouselReady(false)
      scrollState.top = 0
      scrollState.progress = 0
    }
  }, [images])

  useEffect(() => {
    if (!images.length) return

    // Create meshes for each image
    meshesRef.current = images.map((image, i) => {
      const geometry = new THREE.PlaneGeometry(1.28, 1.71, 100, 100)

      // Configure texture properties
      const texture = textures[i]
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        color: new THREE.Color('white'),
        roughness: 0.1,
        metalness: 0.0,
        emissive: new THREE.Color('orange'),
        emissiveIntensity: 0.0,
      })

      // Configure shader using helper function
      configureMaterialShader(material, i)

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(0, 0, 0)
      mesh.castShadow = true
      mesh.receiveShadow = true
      groupRef.current.add(mesh)

      return {
        mesh,
        progress: -10, // Set initial progress to match initialAnimationRef
        pos: i * 1.75,
      }
    })

    return () => {
      if (!groupRef.current) return // Add null check for cleanup
      meshesRef.current.forEach(({ mesh }) => {
        mesh.geometry.dispose()
        mesh.material.dispose()
        groupRef.current.remove(mesh)
      })
    }
  }, [images])

  useFrame((state, delta) => {
    if (!meshesRef.current.length) return

    // Update scroll progress
    const scrollSpeed = 5.1
    let currentScrollValue = combinedIsExiting ? handleExitAnimation(delta) : scrollState.progress * scrollSpeed

    if (!combinedIsExiting) {
      handleEntranceAnimation(delta)
    }

    // Update each mesh and check if all are finished
    let allFinished = true
    meshesRef.current.forEach(({ mesh, pos }, index) => {
      const isVisible = updateMeshAnimation(mesh, pos, index, currentScrollValue, delta, combinedIsExiting)
      if (!combinedIsExiting && isVisible) {
        allFinished = false
      }
    })

    // Check if finished scrolling normally (not during exit animation)
    if (!combinedIsExiting && allFinished && !hasFinished.current) {
      hasFinished.current = true
      // Reset scroll state before calling onFinish
      scrollState.top = 0
      scrollState.progress = 0
      onFinish?.()
    }
  })

  return <group ref={groupRef} />
}

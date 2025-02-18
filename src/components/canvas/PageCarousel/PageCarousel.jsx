import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { UniformsUtils } from 'three'
import { useFrame } from '@react-three/fiber'
import { scrollState } from '@/templates/Scroll'
import fragmentShader from './glsl/shader.frag'
import vertexShader from './glsl/shader.vert'
import { useTexture } from '@react-three/drei'

export const PageCarousel = ({ images = [] }) => {
  const groupRef = useRef()
  const meshesRef = useRef([])
  const scrollRef = useRef(0)
  const camera = useRef()

  useEffect(() => {
    if (!images.length) return

    // Create meshes for each image
    meshesRef.current = images.map((image, i) => {
      const geometry = new THREE.PlaneGeometry(1.28, 1.71, 100, 100)

      // Load texture
      const texture = new THREE.TextureLoader().load(image)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.needsUpdate = true

      // Merge built-in uniforms for lighting with our custom uniforms:
      const material = new THREE.ShaderMaterial({
        extensions: {
          derivatives: '#extension GL_OES_standard_derivatives : enable',
        },
        side: THREE.DoubleSide,
        uniforms: UniformsUtils.merge([
          THREE.UniformsLib.common,
          THREE.UniformsLib.lights,
          {
            time: { value: 0 },
            uTexture: { value: texture },
            progress: { value: 0 },
            resolution: { value: new THREE.Vector4(1, 1, 1, 1) },
          },
        ]),
        transparent: true,
        vertexShader,
        fragmentShader,
        lights: true, // This tells Three.js to inject the lighting uniforms.
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(0, 0, 0)
      groupRef.current.add(mesh)

      return {
        mesh,
        progress: 0,
        pos: i * 2,
      }
    })

    return () => {
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
    scrollRef.current = scrollState.progress * scrollSpeed

    // Update each mesh
    meshesRef.current.forEach(({ mesh, pos }) => {
      mesh.material.uniforms.progress.value = -scrollRef.current - pos
      mesh.material.uniforms.time.value += delta
    })
  })

  return <group ref={groupRef} />
}

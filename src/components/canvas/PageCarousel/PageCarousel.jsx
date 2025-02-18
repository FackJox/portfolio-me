import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { scrollState } from '@/templates/Scroll'
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

      // Custom shader injection
      material.onBeforeCompile = (shader) => {
        shader.uniforms.time = { value: 0 }
        shader.uniforms.progress = { value: 0 }

        // Inject custom varying declarations and functions at the top of vertex shader
        shader.vertexShader = `
          uniform float time;
          uniform float progress;
          varying vec3 vPosition;

          vec3 rotateX(vec3 pos, float angle) {
            float c = cos(angle);
            float s = sin(angle);
            return vec3(pos.x, pos.y*c - pos.z*s, pos.y*s + pos.z*c);
          }

          ${shader.vertexShader}
        `

        // Replace begin_vertex chunk with our transformations
        const vertexTransformations = `
          vec3 transformed = position;
          transformed.y += progress;
          float rotationAngle = cos(smoothstep(-2., 2., transformed.y) * 3.141592653589793238);
          transformed = rotateX(transformed, rotationAngle);
          vPosition = transformed;

          // Rotate the normal using the same transformation
          objectNormal = rotateX(objectNormal, rotationAngle);
        `

        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', vertexTransformations)

        // Add our custom alpha calculation after all lighting calculations
        shader.fragmentShader = `
          varying vec3 vPosition;
          ${shader.fragmentShader}
        `.replace(
          '#include <dithering_fragment>',
          `
          #include <dithering_fragment>
          float customAlpha = smoothstep(-0.7, 0.0, vPosition.z);
          gl_FragColor.a *= customAlpha;
          `,
        )

        material.userData.shader = shader
      }

      // Ensure material updates properly
      material.needsUpdate = true

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(0, 0, 0)
      mesh.castShadow = true
      mesh.receiveShadow = true
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
      if (mesh.material.userData.shader) {
        mesh.material.userData.shader.uniforms.progress.value = -scrollRef.current - pos
        mesh.material.userData.shader.uniforms.time.value += delta
      }
    })
  })

  return <group ref={groupRef} />
}

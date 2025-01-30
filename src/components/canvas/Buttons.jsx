import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ANIMATION_CONFIG } from '@/helpers/animationConfigs'
import { useDeviceOrientation } from '@/helpers/deviceHelper'

// Helper function to get animation config based on orientation
const getAnimationConfig = (isPortrait) => {
  return isPortrait ? ANIMATION_CONFIG.portrait : ANIMATION_CONFIG.landscape;
};

export const VagueButton = ({ highlighted }) => {
  const textRef = useRef()
  const colorRef = useRef(new THREE.Color("#F7F6F7"))
  const baseSize = 0.35
  const isPortrait = useDeviceOrientation()
  const animConfig = getAnimationConfig(isPortrait)
  
  useFrame(() => {
    if (!textRef.current) return
    // Lerp text size
    textRef.current.fontSize = THREE.MathUtils.lerp(
      textRef.current.fontSize,
      highlighted ? baseSize * 1.5 : baseSize,
      animConfig.lerp.button.text
    )
    
    // Lerp color
    const targetColor = new THREE.Color(highlighted ? "white" : "#F7F6F7")
    colorRef.current.lerp(targetColor, animConfig.lerp.button.color)
    if (textRef.current.material) {
      textRef.current.material.color.copy(colorRef.current)
    }
  })

  return (
    <Text
      ref={textRef}
      position={[0.0, -0.03, 0]}
      fontSize={baseSize}
      anchorX="center"
      anchorY="middle"
      font="/fonts/Vogue.ttf"
      letterSpacing={-0.07}
      material={new THREE.MeshBasicMaterial({
        toneMapped: false,
        color: colorRef.current
      })}
    >
      ABOUT
    </Text>
  )
}

export const EngineerButton = ({ highlighted }) => {
  const textRef = useRef()
  const colorRef = useRef(new THREE.Color("#F7F6F7"))
  const baseSize = 0.25
  const isPortrait = useDeviceOrientation()
  const animConfig = getAnimationConfig(isPortrait)
  
  useFrame(() => {
    if (!textRef.current) return
    // Lerp text size
    textRef.current.fontSize = THREE.MathUtils.lerp(
      textRef.current.fontSize,
      highlighted ? baseSize * 1.5 : baseSize,
      animConfig.lerp.button.text
    )
    
    // Lerp color
    const targetColor = new THREE.Color(highlighted ? "#FFB79C" : "#F7F6F7")
    colorRef.current.lerp(targetColor, animConfig.lerp.button.color)
    if (textRef.current.material) {
      textRef.current.material.color.copy(colorRef.current)
    }
  })

  return (
    <Text
      ref={textRef}
      position={[0, -0.0, 0]}
      fontSize={baseSize}
      anchorX="center"
      anchorY="middle"
      font="/fonts/HKGrotesk-SemiBold.otf"
      letterSpacing={-0.13}
      material={new THREE.MeshBasicMaterial({
        toneMapped: false,
        color: colorRef.current
      })}
    >
      Technical Work
    </Text>
  )
}

export const SmackButton = ({ highlighted }) => {
  const leftTextRef = useRef()
  const rightTextRef = useRef()
  const colorRef = useRef(new THREE.Color("#F7F6F7"))
  const baseSize = 0.3
  const isPortrait = useDeviceOrientation()
  const animConfig = getAnimationConfig(isPortrait)
  
  useFrame(() => {
    if (!leftTextRef.current || !rightTextRef.current) return
    // Lerp text size
    const targetSize = highlighted ? baseSize * 1.5 : baseSize
    leftTextRef.current.fontSize = THREE.MathUtils.lerp(
      leftTextRef.current.fontSize,
      targetSize,
      animConfig.lerp.button.text
    )
    rightTextRef.current.fontSize = THREE.MathUtils.lerp(
      rightTextRef.current.fontSize,
      targetSize,
      animConfig.lerp.button.text
    )
    
    // Lerp color
    const targetColor = new THREE.Color(highlighted ? "#FABE7F" : "#F7F6F7")
    colorRef.current.lerp(targetColor, animConfig.lerp.button.color)
    if (leftTextRef.current.material && rightTextRef.current.material) {
      leftTextRef.current.material.color.copy(colorRef.current)
      rightTextRef.current.material.color.copy(colorRef.current)
    }
  })

  return (
    <group position={[0, 0, 0]}>
    <Text
        ref={leftTextRef}
        position={[-0.295, -0.0, 0]}
      fontSize={baseSize}
        anchorX="right"
      anchorY="middle"
        font="/fonts/lemon-regular.otf"
      material={new THREE.MeshBasicMaterial({
        toneMapped: false,
        color: colorRef.current
      })}
    >
        CREA
    </Text>
      <Text
        ref={rightTextRef}
        position={[-0.295, -0.0, 0]}
        fontSize={baseSize}
        anchorX="left"
        anchorY="middle"
        font="/fonts/lemon-wide.otf"
        material={new THREE.MeshBasicMaterial({
          color: colorRef.current,
          toneMapped: false
        })}
      >
        TIVE WORK
      </Text>
    </group>
  )
}



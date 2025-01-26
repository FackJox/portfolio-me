import { Text } from '@react-three/drei'
import { group } from '@react-three/fiber'

export const VagueButton = () => {
  return (
    <Text
      position={[0.0, -0.03, 0]}
      fontSize={0.35}
      color="#F7F6F7"
      anchorX="center"
      anchorY="middle"
      font="/fonts/Vogue.ttf"
             letterSpacing={-0.07}

    >
      ABOUT
    </Text>
  )
}

export const EngineerButton = () => {
  return (
    <Text
      position={[0, -0.03, 0]}
      fontSize={0.27}
      color="#F7F6F7"
      anchorX="center"
      anchorY="middle"
      font="/fonts/HKGrotesk-SemiBold.otf"
       letterSpacing={-0.13}
    >
      TECHNICAL
    </Text>
  )
}

export const SmackButton = () => {
  return (
    <group position={[0, 0, 0]}>
      <Text
        position={[-0.1, -0.05, 0]}
        fontSize={0.4}
        color="#F7F6F7"
        anchorX="right"
        anchorY="middle"
        font="/fonts/lemon-regular.otf"
      >
        CREA
      </Text>
      <Text
        position={[-0.1, -0.05, 0]}
        fontSize={0.4}
        color="#F7F6F7"
        anchorX="left"
        anchorY="middle"
        font="/fonts/lemon-wide.otf"
      >
        TIVE
      </Text>
    </group>
  )
}



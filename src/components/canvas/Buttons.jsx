import { Text } from '@react-three/drei'
import * as THREE from 'three'

export const VagueButton = ({ highlighted }) => {
  return (
    <Text
      position={[0.0, -0.03, 0]}
      fontSize={0.35}
      anchorX="center"
      anchorY="middle"
      font="/fonts/Vogue.ttf"
      letterSpacing={-0.07}
      material={new THREE.MeshBasicMaterial({
        toneMapped: false,
        color: highlighted ? "white" : "#F7F6F7",
        // emissive: new THREE.Color("orange"),
        // emissiveIntensity: highlighted ? 10.22 : 0
      })}
    >
      ABOUT
    </Text>
  )
}

export const EngineerButton = ({ highlighted }) => {
  return (
    <Text
      position={[0, -0.0, 0]}
      fontSize={0.25}
      anchorX="center"
      anchorY="middle"
      font="/fonts/HKGrotesk-SemiBold.otf"
      letterSpacing={-0.13}
      material={new THREE.MeshBasicMaterial({
        toneMapped: false,
        color: highlighted ? "#FFB79C" : "#F7F6F7",
        // emissive: new THREE.Color("orange"),
        // emissiveIntensity: highlighted ? 10.22 : 0
      })}
    >
      Technical Work
    </Text>
  )
}

export const SmackButton = ({ highlighted }) => {
  return (
    <group position={[0, 0, 0]}>
      <Text
        position={[-0.295, -0.0, 0]}
        fontSize={0.3}
        anchorX="right"
        anchorY="middle"
        font="/fonts/lemon-regular.otf"
        material={new THREE.MeshBasicMaterial({
          toneMapped: false,
          color: highlighted ? "#FABE7F" : "#F7F6F7",
          // emissive: new THREE.Color("orange"),
          // emissiveIntensity: highlighted ? 10.22 : 0
        })}
      >
        CREA
      </Text>
      <Text
        position={[-0.295, -0.0, 0]}
        fontSize={0.3}
        anchorX="left"
        anchorY="middle"
        font="/fonts/lemon-wide.otf"
        material={new THREE.MeshBasicMaterial({
          color: highlighted ? "#FABE7F" : "#F7F6F7",
          toneMapped: false,
          // emissive: new THREE.Color("orange"),
          // emissiveIntensity: highlighted ? 10.22 : 0
        })}
      >
        TIVE WORK
      </Text>
    </group>
  )
}



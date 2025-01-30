import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useAspect, Html, TorusKnot, Plane, PerspectiveCamera } from '@react-three/drei'
import { Flex, Box, useReflow } from '@react-three/flex'
import { Text } from './Text'
import { useAtom } from 'jotai'
import { pagesAtom, scrollState } from '@/helpers/atoms'

function Reflower() {
  const reflow = useReflow()
  useFrame(reflow)
  return null
}

function Title() {
  return (
    <Box flexDirection='column' alignItems='center' justifyContent='center' width='100%' height='100%'>
      <Box margin={0.05}>
        <Text fontSize={0.5} letterSpacing={0.1} textAlign='center'>
          REACT
          <meshStandardMaterial />
        </Text>
      </Box>
      <Box margin={0.05}>
        <Text fontSize={0.5} letterSpacing={0.1} textAlign='center'>
          THREE
          <meshStandardMaterial />
        </Text>
      </Box>
      <Box margin={0.05}>
        <Text fontSize={0.5} letterSpacing={0.1} textAlign='center'>
          FIBER
          <meshStandardMaterial />
        </Text>
      </Box>
    </Box>
  )
}

function BackGrid() {
  const { scene } = useThree()
  useEffect(() => {
    scene.fog = new THREE.FogExp2(0, 0.05)
  }, [scene])

  return (
    <Plane position={[0, -1, -8]} rotation={[Math.PI / 2, 0, 0]} args={[80, 80, 128, 128]}>
      <meshStandardMaterial color='#ea5455' wireframe side={THREE.DoubleSide} />
    </Plane>
  )
}



function Page({ onChangePages }) {
  const group = useRef()
  const { size } = useThree()
  const [vpWidth, vpHeight] = useAspect(size.width, size.height)
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
    <group ref={group} position={[0, 0, -2]}>
      <BackGrid />

      <Flex
        flexDirection='column'
        size={[vpWidth, vpHeight, 0]}
        onReflow={handleReflow}
        position={[-vpWidth / 2, vpHeight / 2, 0]}
      >
        {/* <Reflower /> */}
        <Title />

        <Box
          flexDirection='row'
          alignItems='center'
          justifyContent='center'
          flexWrap='wrap'
          width='100%'
          // width="70%"
        >
          {new Array(8 * 4).fill(0).map((k, i) => (
            <Box margin={0.05} key={i}>
              <mesh position={[0.5, -0.5, 0]}>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial color={['#2d4059', '#ea5455', '#decdc3', '#e5e5e5'][i % 4]} />
              </mesh>
            </Box>
          ))}
        </Box>
      </Flex>
    </group>
  )
}


export default function WordCloud() {
  const [, setPages] = useAtom(pagesAtom)

  return (
    <>
      <pointLight position={[0, 1, 4]} intensity={0.1} />
      <ambientLight intensity={0.2} />
      <spotLight
        position={[1, 1, 1]}
        penumbra={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Suspense fallback={<Html center>loading..</Html>}>
        <Page onChangePages={setPages} />
      </Suspense>

    </>
  )
}

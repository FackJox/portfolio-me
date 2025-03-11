'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef, useEffect } from 'react'
import { OrbitControls, PerspectiveCamera, Environment, View as ViewImpl, OrthographicCamera } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import { useAtom } from 'jotai'
import { hdrLoadedAtom } from '@/state/atoms/global'
import { hdrLoader } from '@/helpers/global/texture'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Perf } from 'r3f-perf'
import CameraDistanceController from '../CameraDistanceController'

export const Common = ({ color }) => {
  const [hdrLoaded] = useAtom(hdrLoadedAtom)
  const { scene } = useThree()

  useEffect(() => {
    if (hdrLoaded && hdrLoader.loadedHDR) {
      scene.environment = hdrLoader.loadedHDR
      scene.background = null // or hdrLoader.loadedHDR if you want HDR as background
    }
  }, [hdrLoaded, scene])

  if (!hdrLoaded) return null

  return (
    <Suspense fallback={null}>
      {color && <color attach='background' args={[color]} />}
      <PerspectiveCamera makeDefault fov={40} />
      {process.env.NODE_ENV === 'development' && <Perf position='bottom-right' />}
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[2, 3, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
    </Suspense>
  )
}

const View = forwardRef(({ children, orbit, ...props }, ref) => {
  const localRef = useRef(null)
  useImperativeHandle(ref, () => localRef.current)

  return (
    <>
      <div ref={localRef} {...props} />

      <Three>
        <ViewImpl track={localRef} >
          <CameraDistanceController />
          {children}
          {/* {orbit && <OrbitControls />} */}
        </ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }

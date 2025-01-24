'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef } from 'react'
import { OrbitControls, PerspectiveCamera, Environment, View as ViewImpl } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import { useAtom } from 'jotai'
import { hdrLoadedAtom } from '@/helpers/atoms'
import { hdrLoader } from '@/helpers/textureLoader'

export const Common = ({ color }) => {
  const [hdrLoaded] = useAtom(hdrLoadedAtom)

  return (
    <Suspense fallback={null}>
      {color && <color attach='background' args={[color]} />}
      <PerspectiveCamera makeDefault fov={40} position={[0, 0, 10]} />
      
      {hdrLoaded && (
        <Environment
          map={hdrLoader.loadedHDR}
          environmentIntensity={0.5}
          environmentRotation={[0, Math.PI / 180, 0]}
        />
      )}
      
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
        <ViewImpl track={localRef}>
          {children}
          {orbit && <OrbitControls />}
        </ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }


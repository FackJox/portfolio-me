'use client'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { r3f } from '@/helpers/global/views'
import * as THREE from 'three'
import { Library } from './Magazines/Library'


export default function Scene({ ...props }) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas {...props} frameloop='always' onCreated={(state) => (state.gl.toneMapping = THREE.AgXToneMapping)}>
      {/* @ts-ignore */}
      <r3f.Out />
      <Preload all />

    </Canvas>
  )
}

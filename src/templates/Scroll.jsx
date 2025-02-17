// https://github.com/studio-freight/lenis
// TODO refactor for app-directory
// See https://github.com/pmndrs/react-three-next/pull/123

// 1 - wrap <Component {...pageProps} /> with <Scroll /> in _app.jsx
// 2 - add <ScrollTicker /> wherever in the canvas
// 3 - enjoy
import { addEffect, useFrame } from '@react-three/fiber'
import { useEffect } from 'react'
import { useRef } from 'react'
import * as THREE from 'three'

export const scrollState = {
  top: 0,
  progress: 0,
}

const { damp } = THREE.MathUtils

export default function Scroll({ children }) {
  const content = useRef(null)
  const wrapper = useRef(null)

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault() // Prevent actual scrolling
      const delta = e.deltaY / 50 // Reduced divisor for faster scrolling
      // Remove clamping to allow continuous scrolling
      scrollState.top += delta
      scrollState.progress = scrollState.top / 100
      //   console.log('Wheel scroll:', {
      //     delta,
      //     top: scrollState.top.toFixed(2),
      //     progress: scrollState.progress.toFixed(2),
      //   })
    }

    wrapper.current?.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      wrapper.current?.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <div ref={wrapper} className='absolute inset-0 w-full h-full overflow-hidden'>
      <div ref={content} className='relative min-h-screen'>
        {children}
      </div>
    </div>
  )
}

export const ScrollTicker = ({ smooth = 9999999 }) => {
  const prevState = useRef({ progress: 0, top: 0 })

  useFrame(() => {
    // Only log if values have changed
    if (prevState.current.progress !== scrollState.progress || prevState.current.top !== scrollState.top) {
      // console.log('Scroll state:', { progress: scrollState.progress, top: scrollState.top })
      prevState.current = { ...scrollState }
    }
  })
  return null
}

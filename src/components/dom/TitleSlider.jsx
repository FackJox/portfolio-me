import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { scrollState } from '@/templates/Scroll'

const TitleSlider = ({ titles = ['Title 1', 'Title 2', 'Title 3'] }) => {
  const [currentRotation, setCurrentRotation] = useState(0)
  const baseAngle = 180
  const perspective = 500
  const sensitivity = 5 // Increased sensitivity factor

  useEffect(() => {
    const updateRotation = () => {
      // Use negative scrollState.top multiplied by sensitivity to get faster rotation in opposite direction
      setCurrentRotation(-scrollState.top * sensitivity)
    }

    // Create a RAF loop to smoothly update rotation
    let rafId
    const animate = () => {
      updateRotation()
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [sensitivity])

  return (
    <div
      className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap'
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
        zIndex: 50,
      }}
    >
      {titles.map((title, index) => {
        // Calculate rotation based on current scroll-driven rotation
        const rotationAngle = -(index * baseAngle) + (currentRotation % (baseAngle * titles.length))

        return (
          <motion.h1
            key={title}
            className='absolute top-1/2 left-1/2 uppercase text-white text-7xl'
            style={{
              transformOrigin: `50% 50% -${perspective / 1.2}px`,
              backfaceVisibility: 'hidden',
            }}
            animate={{
              rotateX: rotationAngle,
              x: '-50%',
              y: '-50%',
            }}
            transition={{
              duration: 0.1, // Faster transition for more responsive feel
              ease: 'linear',
            }}
          >
            {title}
          </motion.h1>
        )
      })}
    </div>
  )
}

export default TitleSlider

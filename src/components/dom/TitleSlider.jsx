import { motion } from 'motion/react'
import { useEffect, useState, useRef } from 'react'
import { scrollState } from '@/helpers/components/Scroll'
import { useAtomValue } from 'jotai'
import { carouselReadyAtom } from '@/helpers/atoms'

const TitleSlider = ({ titles = ['Title 1', 'Title 2', 'Title 3'] }) => {
  const [currentRotation, setCurrentRotation] = useState(0)
  const baseAngle = 171.25
  const perspective = 500
  const sensitivity = 5 // Increased sensitivity factor
  const isCarouselReady = useAtomValue(carouselReadyAtom)
  const hasFinishedLogged = useRef(false)

  useEffect(() => {
    const updateRotation = () => {
      // Calculate new rotation based on scroll with adjusted sensitivity
      const newRotation = -scrollState.top * sensitivity
      // Calculate total rotation needed to reach the last mesh
      // Multiply by titles.length instead of (titles.length - 1) to reach the final mesh
      const totalRotation = baseAngle * titles.length
      // Clamp between 0 and totalRotation to ensure smooth transitions
      const clampedRotation = Math.max(0, Math.min(newRotation, totalRotation))

      // Log when we reach the final rotation
      if (clampedRotation >= totalRotation && !hasFinishedLogged.current) {
        console.log('Title Slider finished')
        hasFinishedLogged.current = true
      }

      setCurrentRotation(clampedRotation)
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
  }, [sensitivity, titles.length])

  if (!isCarouselReady) return null

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
        const rotationAngle = -(index * baseAngle) + currentRotation

        // Calculate opacity based on rotation angle
        // Hide when rotated more than 90 degrees in either direction
        const opacity = Math.abs(rotationAngle) > 90 ? 0 : 1

        console.log(
          `Title "${title}" at index ${index}: rotationAngle = ${rotationAngle.toFixed(2)}, currentRotation = ${currentRotation.toFixed(2)}`,
        )

        return (
          <motion.div
            key={title}
            className='absolute top-1/2 left-1/2 uppercase text-white text-7xl'
            style={{
              transformOrigin: `50% 50% -${perspective / 1.2}px`,
              backfaceVisibility: 'hidden',
              opacity,
              transition: 'opacity 0.3s ease',
            }}
            initial={{
              rotateX: rotationAngle,
              x: '-50%',
              y: '-50%',
            }}
            animate={{
              rotateX: rotationAngle,
              x: '-50%',
              y: '-50%',
            }}
            transition={{
              rotateX: { duration: 0.1, ease: 'linear' },
            }}
          >
            <div
              className='relative'
              style={{
                animation: isCarouselReady ? 'edgeToCenter 2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black, transparent)',
                WebkitMaskSize: '200% 100%',
                maskSize: '200% 100%',
                WebkitMaskPosition: '0 0',
                maskPosition: '0 0',
              }}
            >
              {title}
            </div>
            <style jsx global>{`
              @keyframes edgeToCenter {
                0% {
                  -webkit-mask-position: 100% 0;
                  mask-position: 100% 0;
                }
                100% {
                  -webkit-mask-position: 0 0;
                  mask-position: 0 0;
                }
              }
            `}</style>
          </motion.div>
        )
      })}
    </div>
  )
}

export default TitleSlider

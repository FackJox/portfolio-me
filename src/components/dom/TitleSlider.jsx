import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { scrollState } from '@/templates/Scroll'
import { useAtomValue } from 'jotai'
import { carouselReadyAtom } from '@/helpers/atoms'

const TitleSlider = ({ titles = ['Title 1', 'Title 2', 'Title 3'] }) => {
  const [currentRotation, setCurrentRotation] = useState(0)
  const baseAngle = 170
  const perspective = 500
  const sensitivity = 5 // Increased sensitivity factor
  const isCarouselReady = useAtomValue(carouselReadyAtom)

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
        const rotationAngle = -(index * baseAngle) + (currentRotation % (baseAngle * titles.length))

        return (
          <motion.div
            key={title}
            className='absolute top-1/2 left-1/2 uppercase text-white text-7xl'
            style={{
              transformOrigin: `50% 50% -${perspective / 1.2}px`,
              backfaceVisibility: 'hidden',
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

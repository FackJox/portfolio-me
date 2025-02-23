import { motion } from 'motion/react'
import { useEffect, useState, useRef, useMemo } from 'react'
import { scrollState } from '@/helpers/components/Scroll'
import { useAtomValue } from 'jotai'
import { carouselReadyAtom } from '@/helpers/atoms'
import { getTitleScrollThresholds, computeEffectiveRotation } from '@/helpers/contentsPositionHelpers'
import { throttle } from '@/helpers/throttleHelpers'

const DescriptionCarousel = ({ items = [{ title: 'Title 1', description: 'Description 1' }] }) => {
  const [currentRotation, setCurrentRotation] = useState(0)
  const baseAngle = 171.25
  const perspective = 500
  const sensitivity = 5
  const isCarouselReady = useAtomValue(carouselReadyAtom)
  const hasFinishedLogged = useRef(false)
  const lastLoggedValues = useRef({
    scroll: null,
    rotation: null,
    thresholds: null,
    effectiveRotations: null,
  })

  // Extract titles for threshold calculations
  const titles = useMemo(() => items.map((item) => item.title), [items])

  // Throttled logging functions
  const logScrollUpdate = useMemo(
    () =>
      throttle((scroll, rotation, effectiveRotations) => {
        const rotationStr = JSON.stringify(effectiveRotations)
        if (
          lastLoggedValues.current.scroll !== scroll ||
          lastLoggedValues.current.rotation !== rotation ||
          lastLoggedValues.current.effectiveRotations !== rotationStr
        ) {
          console.log({
            'Scroll Position': scroll,
            'Raw Rotation': -scroll * sensitivity,
            'Clamped Rotation': rotation,
            'Effective Rotations': effectiveRotations,
          })
          lastLoggedValues.current.scroll = scroll
          lastLoggedValues.current.rotation = rotation
          lastLoggedValues.current.effectiveRotations = rotationStr
        }
      }, 500),
    [],
  )

  const logItemUpdate = useMemo(
    () =>
      throttle((index, item, data) => {
        const key = `item_${index}`
        const dataStr = JSON.stringify(data)

        if (!lastLoggedValues.current[key] || lastLoggedValues.current[key] !== dataStr) {
          console.log(`Item ${index} (${item.title}) update:`, data)
          lastLoggedValues.current[key] = dataStr
        }
      }, 500),
    [],
  )

  // Calculate scroll thresholds for all titles
  const thresholds = useMemo(() => {
    const calculatedThresholds = getTitleScrollThresholds(titles, baseAngle)
    const thresholdsStr = JSON.stringify(calculatedThresholds)

    if (lastLoggedValues.current.thresholds !== thresholdsStr) {
      console.log('Thresholds updated:', calculatedThresholds)
      lastLoggedValues.current.thresholds = thresholdsStr
    }
    return calculatedThresholds
  }, [titles])

  useEffect(() => {
    const updateRotation = () => {
      const newRotation = -scrollState.top * sensitivity
      // Calculate total rotation based on the last title's exit threshold plus one baseAngle
      const lastThreshold = thresholds[thresholds.length - 1]
      const totalRotation = lastThreshold.exit + baseAngle
      const clampedRotation = Math.max(0, Math.min(newRotation, totalRotation))

      // Calculate effective rotations for all items
      const effectiveRotations = items.map((item, index) => {
        const threshold = thresholds[index]
        // For the next threshold, use the next title's enter, or if it's the last title, use its exit + baseAngle
        const nextThreshold = index < items.length - 1 ? thresholds[index + 1].enter : threshold.exit + baseAngle

        const { effectiveRotation, phase } = computeEffectiveRotation(clampedRotation, threshold, nextThreshold)

        return {
          item,
          effectiveRotation,
          phase,
          threshold: {
            enter: threshold.enter,
            stationary: threshold.stationary,
            exit: threshold.exit,
            nextEnter: nextThreshold,
          },
          debug: {
            currentRotation: clampedRotation,
            thresholdRange: [threshold.enter, threshold.stationary, threshold.exit, nextThreshold],
          },
        }
      })

      logScrollUpdate(scrollState.top, clampedRotation, effectiveRotations)

      if (clampedRotation >= totalRotation && !hasFinishedLogged.current) {
        console.log('Description Carousel finished')
        hasFinishedLogged.current = true
      }

      setCurrentRotation(clampedRotation)
    }

    let rafId
    const animate = () => {
      updateRotation()
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [sensitivity, items.length])

  if (!isCarouselReady) {
    if (!lastLoggedValues.current.carouselReady) {
      console.log('Carousel not ready yet')
      lastLoggedValues.current.carouselReady = true
    }
    return null
  }

  return (
    <div
      className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap'
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
        zIndex: 50,
      }}
    >
      {items.map((item, index) => {
        const threshold = thresholds[index]
        // Match the same nextThreshold calculation as in the effect
        const nextThreshold = index < items.length - 1 ? thresholds[index + 1].enter : threshold.exit + baseAngle

        const { effectiveRotation, phase, opacity } = computeEffectiveRotation(
          currentRotation,
          threshold,
          nextThreshold,
        )
        const rotationAngle = effectiveRotation

        logItemUpdate(index, item, {
          threshold,
          effectiveRotation,
          rotationAngle,
          opacity,
          phase,
          debug: {
            currentRotation,
            thresholdRange: [threshold.enter, threshold.stationary, threshold.exit, nextThreshold],
          },
        })

        return (
          <motion.div
            key={item.title}
            className='absolute top-1/2 left-1/2 flex flex-col gap-2'
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
              className='relative uppercase text-white text-7xl'
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
              {item.title}
            </div>
            <div
              className='relative text-white text-xl max-w-2xl'
              style={{
                animation: isCarouselReady ? 'edgeToCenter 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards' : 'none',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black, transparent)',
                maskImage: 'linear-gradient(to right, transparent, black, transparent)',
                WebkitMaskSize: '200% 100%',
                maskSize: '200% 100%',
                WebkitMaskPosition: '0 0',
                maskPosition: '0 0',
              }}
            >
              {item.description}
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

export default DescriptionCarousel

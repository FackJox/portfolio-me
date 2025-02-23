import { motion } from 'motion/react'
import { useEffect, useState, useRef, useMemo } from 'react'
import { scrollState } from '@/helpers/components/Scroll'
import { useAtomValue } from 'jotai'
import { carouselReadyAtom } from '@/helpers/atoms'
import { getTitleScrollThresholds } from '@/helpers/contentsPositionHelpers'
import { throttle } from '@/helpers/throttleHelpers'

const TitleSlider = ({ titles = ['Title 1', 'Title 2', 'Title 3'] }) => {
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

  const logTitleUpdate = useMemo(
    () =>
      throttle((index, title, data) => {
        const key = `title_${index}`
        const dataStr = JSON.stringify(data)

        if (!lastLoggedValues.current[key] || lastLoggedValues.current[key] !== dataStr) {
          console.log(`Title ${index} (${title}) update:`, data)
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

      // Calculate effective rotations for all titles
      const effectiveRotations = titles.map((_, index) => {
        const threshold = thresholds[index]
        // For the next threshold, use the next title's enter, or if it's the last title, use its exit + baseAngle
        const nextThreshold = index < titles.length - 1 ? thresholds[index + 1].enter : threshold.exit + baseAngle

        let effectiveRotation
        let phase

        if (clampedRotation < threshold.enter) {
          // Waiting phase: title starts at -90 degrees (bottom)
          effectiveRotation = -90
          phase = 'waiting'
        } else if (clampedRotation >= threshold.enter && clampedRotation < threshold.stationary) {
          // Enter phase: rotate from -90 to 0 degrees
          const progress = (clampedRotation - threshold.enter) / (threshold.stationary - threshold.enter)
          effectiveRotation = -90 + progress * 90
          phase = 'entering'
        } else if (clampedRotation >= threshold.stationary && clampedRotation < threshold.exit) {
          // Stationary phase: hold at 0 degrees
          effectiveRotation = 0
          phase = 'stationary'
        } else if (clampedRotation >= threshold.exit && clampedRotation < nextThreshold) {
          // Exit phase: rotate from 0 to 90 degrees
          const progress = (clampedRotation - threshold.exit) / (nextThreshold - threshold.exit)
          effectiveRotation = progress * 90
          phase = 'exiting'
        } else {
          // Hidden phase: stay at 90 degrees (top)
          effectiveRotation = 90
          phase = 'hidden'
        }

        return {
          title: titles[index],
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
        console.log('Title Slider finished')
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
  }, [sensitivity, titles.length])

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
      {titles.map((title, index) => {
        const threshold = thresholds[index]
        // Match the same nextThreshold calculation as in the effect
        const nextThreshold = index < titles.length - 1 ? thresholds[index + 1].enter : threshold.exit + baseAngle

        let effectiveRotation
        let phase

        if (currentRotation < threshold.enter) {
          effectiveRotation = -90
          phase = 'waiting'
        } else if (currentRotation >= threshold.enter && currentRotation < threshold.stationary) {
          const progress = (currentRotation - threshold.enter) / (threshold.stationary - threshold.enter)
          effectiveRotation = -90 + progress * 90
          phase = 'entering'
        } else if (currentRotation >= threshold.stationary && currentRotation < threshold.exit) {
          effectiveRotation = 0
          phase = 'stationary'
        } else if (currentRotation >= threshold.exit && currentRotation < nextThreshold) {
          const progress = (currentRotation - threshold.exit) / (nextThreshold - threshold.exit)
          effectiveRotation = progress * 90
          phase = 'exiting'
        } else {
          effectiveRotation = 90
          phase = 'hidden'
        }

        const rotationAngle = effectiveRotation

        let opacity = 1
        if (phase === 'waiting' || phase === 'hidden') {
          opacity = 0
        } else if (phase === 'entering') {
          opacity = Math.max(0, (currentRotation - threshold.enter) / (threshold.stationary - threshold.enter))
        } else if (phase === 'exiting') {
          opacity = Math.max(0, 1 - (currentRotation - threshold.exit) / (nextThreshold - threshold.exit))
        }

        logTitleUpdate(index, title, {
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

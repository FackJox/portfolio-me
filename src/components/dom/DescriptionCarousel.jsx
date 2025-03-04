import { motion } from 'motion/react'
import { useEffect, useState, useRef, useMemo } from 'react'
import { scrollState } from '@/helpers/components/Scroll'
import { useAtomValue, useSetAtom } from 'jotai'
import { carouselReadyAtom } from '@/helpers/atoms'
import { getTitleScrollThresholds, computeEffectiveRotation } from '@/helpers/contentsPositionHelpers'
import { throttle } from '@/helpers/throttleHelpers'
import { atom } from 'jotai'
import { easeIn } from 'motion'

export const carouselExitingAtom = atom(false)

const DescriptionCarousel = ({ items = [{ title: 'Title 1', description: 'Description 1' }] }) => {
  const [currentRotation, setCurrentRotation] = useState(0)
  const [selectedItemIndex, setSelectedItemIndex] = useState(0)
  const baseAngle = 171.25
  const perspective = 500
  const sensitivity = 5
  const isCarouselReady = useAtomValue(carouselReadyAtom)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const setIsExiting = useSetAtom(carouselExitingAtom)
  const hasFinishedLogged = useRef(false)
  const navigationTimeoutRef = useRef(null)
  const lastLoggedValues = useRef({
    scroll: null,
    rotation: null,
    thresholds: null,
    effectiveRotations: null,
  })

  const titles = useMemo(() => items.map((item) => item.title), [items])

  const logScrollUpdate = useMemo(
    () =>
      throttle((scroll, rotation, effectiveRotations) => {
        const rotationStr = JSON.stringify(effectiveRotations)
        if (
          lastLoggedValues.current.scroll !== scroll ||
          lastLoggedValues.current.rotation !== rotation ||
          lastLoggedValues.current.effectiveRotations !== rotationStr
        ) {
          // console.log({
          //   'Scroll Position': scroll,
          //   'Raw Rotation': -scroll * sensitivity,
          //   'Clamped Rotation': rotation,
          //   'Effective Rotations': effectiveRotations,
          // })
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
          // console.log(`Item ${index} (${item.title}) update:`, data)
          lastLoggedValues.current[key] = dataStr
        }
      }, 500),
    [],
  )

  const thresholds = useMemo(() => {
    const calculatedThresholds = getTitleScrollThresholds(titles, baseAngle)
    const thresholdsStr = JSON.stringify(calculatedThresholds)

    if (lastLoggedValues.current.thresholds !== thresholdsStr) {
      // console.log('Thresholds updated:', calculatedThresholds)
      lastLoggedValues.current.thresholds = thresholdsStr
    }
    return calculatedThresholds
  }, [titles])

  // Safe navigation function that works outside of Next.js context
  const navigateToPage = (url) => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  };

  // Determine which item is currently most visible/centered
  const determineSelectedItem = () => {
    // Find the item whose rotation is closest to 0 (most centered)
    let minRotation = Infinity;
    let selectedIndex = 0;
    
    items.forEach((item, index) => {
      const threshold = thresholds[index];
      const nextThreshold = index < items.length - 1 ? thresholds[index + 1].enter : threshold.exit + baseAngle;
      const { effectiveRotation } = computeEffectiveRotation(currentRotation, threshold, nextThreshold);
      
      // The item with rotation closest to 0 is the most visible
      const rotationDistance = Math.abs(effectiveRotation);
      if (rotationDistance < minRotation) {
        minRotation = rotationDistance;
        selectedIndex = index;
      }
    });
    
    return selectedIndex;
  };

  const handleCarouselClick = () => {
    // Prevent multiple clicks from creating multiple timeouts
    if (isFadingOut) return;
    
    // Determine which item is currently selected
    const selectedIndex = determineSelectedItem();
    setSelectedItemIndex(selectedIndex);
    const selectedItem = items[selectedIndex];
    
    // Start fading out
    setIsFadingOut(true)
    // Tell PageCarousel to start exit animation
    setIsExiting(true)
    // console.log('DescriptionCarousel: Exit animation triggered')
    
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    // Set timeout to match the fade-out animation duration (500ms)
    navigationTimeoutRef.current = setTimeout(() => {
      // Extract magazine and article from the selected item
      // The magazine and article information should be available in the item
      // If not directly available, we can determine it based on the title
      const magazine = selectedItem.magazine || 'smack'; // Default to smack if not specified
      const article = selectedItem.title || 'Graphics'; // Use the title as the article name
      
      // Navigate to the new URL after animation completes
      const url = `/?magazine=${magazine}&article=${article}`;
      // console.log(`DescriptionCarousel: Navigation triggered to ${url}`);
      
      // Use the safe navigation function instead of router
      navigateToPage(url);
    }, 500); // Match the duration of the fade-out animation
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateRotation = () => {
      const newRotation = -scrollState.top * sensitivity
      const lastThreshold = thresholds[thresholds.length - 1]
      const totalRotation = lastThreshold.exit + baseAngle
      const clampedRotation = Math.max(0, Math.min(newRotation, totalRotation))

      const effectiveRotations = items.map((item, index) => {
        const threshold = thresholds[index]
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
        // console.log('Description Carousel finished')
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

  useEffect(() => {
    if (!isCarouselReady) {
      setIsFadingOut(false)
      setIsExiting(false)
      
      // Clear navigation timeout if carousel is not ready
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    }
  }, [isCarouselReady, setIsExiting])

  if (!isCarouselReady) {
    if (!lastLoggedValues.current.carouselReady) {
      // console.log('Carousel not ready yet')
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
      onClick={handleCarouselClick}
    >
      {items.map((item, index) => {
        const threshold = thresholds[index]
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
              cursor: 'pointer',
            }}
            initial={{
              rotateX: rotationAngle,
              x: '-50%',
              y: '-50%',
              opacity: opacity,
            }}
            animate={{
              rotateX: rotationAngle,
              x: '-50%',
              y: '-50%',
              opacity: isFadingOut ? 0 : opacity,
            }}
            transition={{
              rotateX: { duration: 0.1, ease: 'linear' },
              opacity: isFadingOut ? { duration: 0.5, easeIn: 'easeInOut' } : { duration: 0.3, easeIn: 'ease' },
            }}
            onClick={handleCarouselClick}
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

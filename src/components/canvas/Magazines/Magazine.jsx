// portfolio-me/src/components/canvas/Magazines/Magazine.jsx
import { useAtom } from 'jotai'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Page } from './Page'
import { Float, useCursor, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useGesture } from '@use-gesture/react'
import * as THREE from 'three'
import { styleMagazineAtom } from '@/state/atoms/global'
import { magazineViewingStateAtom } from '@/state/atoms/magazines'
import {
  calculatePageViewOffset,
  hoverMagazine,
  getSpacingConfig,
  applyFloatNullification,
  calculateButtonPosition,
} from '@/helpers/magazines/position'
import { useDeviceOrientation } from '@/helpers/global/device'
import { handleMagazineInteraction, isTapInteraction } from '@/helpers/magazines/interaction'
import { LERP, FLOAT, THRESHOLD } from '@/constants/magazines/animation'

// Helper functions to get animation configs based on orientation
const getAnimationConfig = (isPortrait) => {
  return {
    float: {
      intensity: FLOAT.INTENSITY,
      speed: FLOAT.SPEED,
      rotationIntensity: FLOAT.ROTATION_INTENSITY
    },
    lerp: {
      button: {
        text: LERP.BUTTON.TEXT,
        color: LERP.BUTTON.COLOR
      },
      pageView: LERP.PAGE_VIEW,
      carousel: LERP.CAROUSEL
    }
  }
}

const getGestureConfig = (isPortrait) => {
  return {
    threshold: 20,
    dragSensitivity: 0.01,
    dragThreshold: THRESHOLD.DRAG,
    interaction: {
      tap: {
        maxDuration: THRESHOLD.TAP.MAX_MOVEMENT,
        maxMovement: THRESHOLD.TAP.MAX_MOVEMENT,
      },
      swipe: {
        minMovement: THRESHOLD.SWIPE.MIN_MOVEMENT,
        pageThreshold: THRESHOLD.SWIPE.PAGE_TURN,
        carouselThreshold: THRESHOLD.SWIPE.CAROUSEL,
      },
      focus: {
        debounceTime: 500,
      },
      carousel: {
        middleThreshold: THRESHOLD.CAROUSEL.MIDDLE,
        wrapThreshold: THRESHOLD.CAROUSEL.WRAP,
      },
    }
  }
}

// Helper function to get float config based on orientation
const getFloatConfig = () => {
  return {
    intensity: FLOAT.INTENSITY,
    speed: FLOAT.SPEED,
    rotationIntensity: FLOAT.ROTATION_INTENSITY
  }
}

export const Magazine = ({
  pictures,
  magazine,
  pageAtom,
  focusedMagazineAtom,
  layoutPosition,
  Button,
  targetPosition,
  camera,
  lastCarouselMove,
  ...props
}) => {
  // Atoms & State
  const [page, setPage] = useAtom(pageAtom)
  const [delayedPage, setDelayedPage] = useState(page)
  const [focusedMagazine, setFocusedMagazine] = useAtom(focusedMagazineAtom)
  const [, setStyleMagazine] = useAtom(styleMagazineAtom)
  const [highlighted, setHighlighted] = useState(false)
  const viewingStateAtom = useMemo(() => magazineViewingStateAtom(magazine), [magazine])
  const [viewingRightPage, setViewingRightPage] = useAtom(viewingStateAtom)
  const [isDragging, setIsDragging] = useState(false)
  const [currentMiddleMagazine] = useAtom(styleMagazineAtom)

  // Refs
  const dragStartTimeRef = useRef(0)
  const dragStartRef = useRef(0)
  const velocityRef = useRef(0)
  const targetOffsetRef = useRef(0)
  const lastMovementTimeRef = useRef(0)
  const lastMovementAmountRef = useRef(0)
  const isHoveredRef = useRef(false)
  const groupRef = useRef()
  const floatRef = useRef()
  const floatNullifyRef = useRef()
  const lastPageRef = useRef(1) // Store last viewed page
  const lastViewingStateRef = useRef(false) // Store last viewing state

  // Initial transforms
  const initialPositionRef = useRef(null)
  const initialQuaternionRef = useRef(null)
  const previousViewingRightPageRef = useRef(false)

  const buttonRef = useRef()
  const buttonPositionRef = useRef(new THREE.Vector3())

  // Add these refs near the top with other refs
  const floatMatrixRef = useRef(new THREE.Matrix4())
  const floatQuaternionRef = useRef(new THREE.Quaternion())
  const uprightQuaternionRef = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)))
  const targetButtonPosRef = useRef(new THREE.Vector3())

  // Handle orientation changes
  const handleOrientationChange = useCallback(
    (newIsPortrait) => {
      if (!newIsPortrait && focusedMagazine === magazine) {
        setViewingRightPage(false)
      }
    },
    [focusedMagazine, magazine],
  )

  const isPortrait = useDeviceOrientation({ onOrientationChange: handleOrientationChange })

  // Delayed flip logic
  useEffect(() => {
    let timeout
    const animatePageFlip = () => {
      setDelayedPage((current) => {
        if (current === page) return current
        // Flip exactly 1 page at a time every 150ms
        timeout = setTimeout(animatePageFlip, 150)
        return current < page ? current + 1 : current - 1
      })
    }
    animatePageFlip()
    return () => clearTimeout(timeout)
  }, [page])

  // Focus/unfocus logic
  useEffect(() => {
    if (focusedMagazine === magazine) {
      // When focusing, check if we should restore state
      if (page === 0) {
        setPage(lastPageRef.current)
        setViewingRightPage(lastViewingStateRef.current)
      }
      // Update style magazine when focused
      setStyleMagazine(magazine)
    } else if (focusedMagazine !== magazine && page > 0) {
      // Store state if we're not already closing (page !== 0)
      // Changed condition to store state for any page > 0
      if (page !== 0) {
        lastPageRef.current = page
        lastViewingStateRef.current = viewingRightPage
      }
      // Set initial page when unfocused
      setPage(0)
      setViewingRightPage(false)
    }
  }, [focusedMagazine, magazine])

  // Only update stored state when explicitly changing pages
  useEffect(() => {
    if (focusedMagazine === magazine && page > 0) {
      lastPageRef.current = page
      lastViewingStateRef.current = viewingRightPage
    }
  }, [page, viewingRightPage, focusedMagazine])

  // useCursor
  useCursor(highlighted && focusedMagazine !== magazine)

  // Pages setup and texture preloads
  const pages = useMemo(() => {
    const pagesArray = [{ front: '01Front', back: pictures[0] }]
    for (let i = 1; i < pictures.length - 1; i += 2) {
      pagesArray.push({
        front: pictures[i % pictures.length],
        back: pictures[(i + 1) % pictures.length],
      })
    }
    pagesArray.push({
      front: pictures[pictures.length - 1],
      back: '01Front',
    })
    return pagesArray
  }, [pictures])

  useEffect(() => {
    pages.forEach((p) => {
      useTexture.preload(`/textures/${magazine}/${p.front}.png`)
      useTexture.preload(`/textures/${magazine}/${p.back}.png`)
      useTexture.preload(`/textures/book-cover-roughness.png`)
    })
  }, [pages, magazine])

  // Audio effect on page change
  useEffect(() => {
    const audio = new Audio('/audios/page-flip-01a.mp3')
    // audio.play();
  }, [page])

  // Gestures (swipe vs click)
  const bind = useGesture(
    {
      onDragStart: ({ event }) => {
        // Check if magazine is clickable first
        if (isPortrait && currentMiddleMagazine !== magazine) {
          return
        }
        if (focusedMagazine && focusedMagazine !== magazine) {
          return
        }

        event.stopPropagation()
        setIsDragging(true)
        dragStartTimeRef.current = Date.now()
      },
      onDrag: ({ last, movement: [dx, dy], event }) => {
        // Check if magazine is clickable first
        if (isPortrait && currentMiddleMagazine !== magazine) {
          return
        }

        if (focusedMagazine && focusedMagazine !== magazine) {
          return
        }

        if (event.preventDefault) event.preventDefault()

        if (last) {
          const dragDuration = Date.now() - dragStartTimeRef.current
          const totalMovement = Math.sqrt(dx * dx + dy * dy)

          handleMagazineInteraction({
            deltaX: dx,
            deltaY: dy,
            isDrag: totalMovement > 5,
            magazine,
            focusedMagazine,
            setFocusedMagazine,
            page,
            pages,
            setPage,
            setViewingRightPage,
            viewingRightPage,
            isPortrait,
            currentMiddleMagazine,
            lastPageRef,
            lastViewingStateRef,
            lastCarouselMove,
            dragDuration,
            totalMovement,
          })

          setIsDragging(false)
        }
      },
    },
    { eventOptions: { passive: false } },
  )

  // Set initial position on mount
  useEffect(() => {
    if (!groupRef.current || !targetPosition) return
    // Set initial position directly
    groupRef.current.position.copy(targetPosition)
    initialPositionRef.current = targetPosition.clone()
    initialQuaternionRef.current = groupRef.current.quaternion.clone()
  }, []) // Empty deps array to only run on mount

  // Store initial transforms when target changes
  useEffect(() => {
    if (!groupRef.current || !targetPosition) return
    initialPositionRef.current = targetPosition.clone()
    initialQuaternionRef.current = groupRef.current.quaternion.clone()
  }, [targetPosition])

  // Combine all useFrame calls into one
  useFrame((_, delta) => {
    if (!groupRef.current) return

    const spacingConfig = getSpacingConfig(isPortrait)
    const animConfig = getAnimationConfig(isPortrait)
    const gestureConfig = getGestureConfig(isPortrait)

    // Calculate horizontal offset if focused
    if (focusedMagazine === magazine) {
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize()

      // If magazine is closing (transitioning from any page to 0), offset to center and unfocus
      if (page === 0) {
        const centerOffset = isPortrait ? 0.65 : -0.65
        groupRef.current.position.addScaledVector(right, centerOffset * delta * 5)
        // Unfocus the magazine after it's closed
        setFocusedMagazine(null)
      } else {
        calculatePageViewOffset({
          position: groupRef.current.position,
          right,
          currentOffset: previousViewingRightPageRef.current ? 1.5 : -1.5,
          targetOffset: viewingRightPage ? 1.5 : -1.5,
          isPortrait,
          viewingRightPage,
          page,
          delayedPage,
          lerpFactor: animConfig.lerp.pageView,
        })
      }

      previousViewingRightPageRef.current = viewingRightPage
    }

    // Apply hover effect
    if (!isPortrait && !focusedMagazine) {
      hoverMagazine({
        position: groupRef.current.position,
        isHovered: isHoveredRef.current,
        magazine,
        isPortrait,
      })
    }

    // Handle Float nullification
    if (floatRef.current && floatNullifyRef.current) {
      applyFloatNullification({
        floatRef: floatRef.current,
        nullifyRef: floatNullifyRef.current,
        shouldNullify: focusedMagazine === magazine,
      })
    }

    // Update button position and rotation
    if (!isPortrait && buttonRef.current && camera && floatRef.current) {
      const buttonConfig = spacingConfig.positions.button

      // Calculate target button position
      const targetPos = calculateButtonPosition({
        position: buttonPositionRef.current,
        camera,
        isHovered: isHoveredRef.current,
        isPortrait,
        floatRef: floatRef.current,
        buttonRef: buttonRef.current,
      })

      // Lerp to target position
      buttonRef.current.position.lerp(targetPos, animConfig.lerp.button.text)

      // Update button rotation when hovered
      if (isHoveredRef.current && floatRef.current) {
        floatRef.current.getWorldQuaternion(floatQuaternionRef.current)
        buttonRef.current.quaternion.copy(floatQuaternionRef.current).invert().multiply(uprightQuaternionRef.current)
      } else {
        buttonRef.current.quaternion.set(0, 0, 0, 1)
      }
    }
  })

  return (
    <group ref={groupRef} userData={{ magazine }}>
      {/* Invisible bounding box for interaction */}
      <mesh
        position={[page === 0 ? 0.65 : 0, 0, -0.1]}
        geometry={
          new THREE.BoxGeometry(
            page === 0 ? 1.25 : 2.5, // Width: smaller when closed
            page === 0 ? 1.5 : 1.5, // Height: smaller when closed
            page === 0 ? 1 : 1, // Depth: smaller when closed
          )
        }
        material={
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
            depthTest: false,
          })
        }
        onPointerEnter={(e) => {
          e.stopPropagation()
          // Only set highlighted and isHovered if this magazine is clickable
          if (!isPortrait || (isPortrait && currentMiddleMagazine === magazine)) {
            setHighlighted(true)
            isHoveredRef.current = true
            // Only set style magazine in landscape mode
            if (!isPortrait) {
              setStyleMagazine(magazine)
            }
          }
        }}
        onPointerLeave={(e) => {
          e.stopPropagation()
          if (!isPortrait || (isPortrait && currentMiddleMagazine === magazine)) {
            setHighlighted(false)
            isHoveredRef.current = false
          }
        }}
        {...bind()}
        pointerEvents={
          (focusedMagazine && focusedMagazine !== magazine) || (isPortrait && currentMiddleMagazine !== magazine)
            ? 'none'
            : 'auto'
        }
      />

      {/* Magazine content */}
      <Float ref={floatRef} {...getFloatConfig(isPortrait)} enabled={focusedMagazine !== magazine}>
        <group ref={floatNullifyRef}>
          <group rotation={[0, -Math.PI / 2, 0]}>
            {pages.map((pageData, idx) => (
              <Page
                key={idx}
                page={delayedPage}
                number={idx}
                magazine={magazine}
                opened={delayedPage > idx}
                magazineClosed={delayedPage === 0 || delayedPage === pages.length}
                pages={pages}
                setPage={setPage}
                highlighted={highlighted}
                isFocused={focusedMagazine === magazine}
                {...pageData}
              />
            ))}
          </group>
          {!isPortrait && (
            <group ref={buttonRef}>
              <Button highlighted={highlighted && !isPortrait} />
            </group>
          )}
        </group>
      </Float>
    </group>
  )
}

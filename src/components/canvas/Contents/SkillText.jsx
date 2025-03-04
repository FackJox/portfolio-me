import * as THREE from 'three'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text3D } from '@react-three/drei'
import { useSetAtom } from 'jotai'
import { styleMagazineAtom } from '@/helpers/atoms'
import { throttle } from '@/helpers/throttleHelpers'
import { performLerp } from '@/helpers/magazinePositionHelpers'
import { ANIMATION, LAYOUT, COLORS } from './Constants'
import HKGroteskFont from './HKGrotesk-SemiBold.json'
import LemonFont from './Lemon_Regular.json'

/**
 * SkillText component renders a 3D text element with hover and click interactions
 * 
 * @param {Object} props - Component props
 * @param {string} props.content - Text content to display
 * @param {boolean} props.isEngineering - Whether this is an engineering skill
 * @param {Function} props.onClick - Click handler function
 * @param {Array} props.position - [x, y, z] position
 * @param {Function} props.onHoverChange - Hover state change handler
 * @param {number} props.scale - Scale factor for the text
 * @param {number} props.opacity - Opacity value
 * @param {boolean} props.isMoving - Whether the text is currently animating
 * @param {boolean|Object} props.resetState - State reset trigger
 * @param {boolean} props.forceClicked - Force the clicked state to true
 */
export default function SkillText({
  content,
  isEngineering,
  onClick,
  position,
  onHoverChange,
  scale = ANIMATION.SCALE.DEFAULT,
  opacity = 1,
  isMoving = false,
  resetState = false,
  forceClicked = false,
}) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [isBottomPosition, setIsBottomPosition] = useState(false)
  const [isStackPosition, setIsStackPosition] = useState(true)
  const textRef = useRef()
  const [textSize, setTextSize] = useState([1, 0.5, 0.25])
  const currentScaleRef = useRef(new THREE.Vector3(scale, scale, scale))
  const currentHeightRef = useRef(ANIMATION.HEIGHT.MIN)
  const groupRef = useRef()
  const meshRef = useRef()
  const text3DRef = useRef()

  // Cache vector objects for reuse in animation loop
  const targetScaleVec = useRef(new THREE.Vector3())
  const tempVec3 = useRef(new THREE.Vector3())
  const tempBox3 = useRef(new THREE.Box3())
  const meshPositionRef = useRef(new THREE.Vector3())
  const text3DPositionRef = useRef(new THREE.Vector3())

  const setStyleMagazine = useSetAtom(styleMagazineAtom)

  /**
   * Handle click interactions and maintain local state
   * @param {Event} e - Click event
   */
  const handleClick = (e) => {
    e.stopPropagation()

    // Only update local state if we're not in a moving state
    if (!isMoving) {
      const newClickedState = !clicked
      setClicked(newClickedState)

      // Update position states based on new clicked state
      if (newClickedState) {
        if (isStackPosition) {
          setIsStackPosition(false)
        } else if (isBottomPosition) {
          setIsBottomPosition(false)
        }
        setHovered(false)
      }
    }

    // Always notify parent of click, letting it handle the business logic
    onClick?.(content, textSize[0])
  }

  /**
   * Handle forced click state changes
   */
  useEffect(() => {
    if (forceClicked && !clicked && !isMoving) {
      console.log('[SkillText] forceClicked true, setting clicked state to true');
      setClicked(true);
    }
  }, [forceClicked, clicked, isMoving]);

  /**
   * Reset component states based on resetState prop changes.
   */
  useEffect(() => {
    if (resetState === true) {
      setIsStackPosition(true)
      setIsBottomPosition(false)
      if (!isMoving) {
        setClicked(false)
      }
    } else if (resetState && typeof resetState === 'object' && resetState.isBottomPosition) {
      setIsBottomPosition(true)
      setIsStackPosition(false)
    }
  }, [resetState, content, isMoving])

  /**
   * Update position states when movement or click states change.
   */
  useEffect(() => {
    if (isMoving && clicked) {
      setIsStackPosition(false)
      setIsBottomPosition(false)
    } else if (!isMoving && isStackPosition && clicked) {
      setClicked(false)
    }
  }, [isMoving, clicked, content, isStackPosition])

  // Calculate target scale based on states
  const targetScale = !isMoving && hovered && (!clicked || isBottomPosition) ? scale * ANIMATION.SCALE.HOVER : scale

  // Calculate target height based on states
  const targetHeight = isStackPosition
    ? ANIMATION.HEIGHT.MIN
    : clicked || isBottomPosition
      ? ANIMATION.HEIGHT.MAX
      : ANIMATION.HEIGHT.MIN

  // Get color based on states
  const getColor = () => {
    if (isMoving && clicked) return COLORS.DEFAULT
    if (hovered && (!clicked || isBottomPosition)) {
      return isEngineering ? COLORS.HOVER.ENGINEERING : COLORS.HOVER.CREATIVE
    }
    return COLORS.DEFAULT
  }

  /**
   * Throttled hover handler to prevent excessive state updates.
   */
  const handleHoverChange = useCallback(
    throttle((isHovered) => {
      if (!isMoving && (!clicked || isBottomPosition)) {
        setHovered(isHovered)
        onHoverChange && onHoverChange(isHovered)
        setStyleMagazine(isHovered ? (isEngineering ? 'engineer' : 'smack') : 'vague')
      }
    }, ANIMATION.DELAY.HOVER),
    [isMoving, clicked, isBottomPosition, isEngineering, onHoverChange, setStyleMagazine],
  )

  const handlePointerOver = (e) => {
    e.stopPropagation()
    handleHoverChange(true)
  }

  const handlePointerOut = (e) => {
    e.stopPropagation()
    handleHoverChange(false)
  }

  // Helper function for synchronized lerping
  const performSyncedLerp = (current, target, xSpeed, normalSpeed, isNearBottom) => {
    if (!isNearBottom) {
      current.x = THREE.MathUtils.lerp(current.x, target.x, xSpeed)
    } else {
      current.x = target.x
    }
    current.y = THREE.MathUtils.lerp(current.y, target.y, normalSpeed)
    current.z = THREE.MathUtils.lerp(current.z, target.z, normalSpeed)
  }

  /**
   * Animation frame update for smooth transitions.
   */
  useFrame(() => {
    if (groupRef.current && meshRef.current && text3DRef.current) {

      console.log('[SkillText] Clicked', clicked,)
      // Scale lerping
      targetScaleVec.current.set(targetScale, targetScale, targetScale)
      performLerp(currentScaleRef.current, targetScaleVec.current, ANIMATION.LERP.SCALE)
      groupRef.current.scale.copy(currentScaleRef.current)

      // Height lerping
      const prevHeight = currentHeightRef.current
      const isIncreasing = targetHeight > prevHeight
      const heightLerpFactor = isIncreasing ? ANIMATION.LERP.HEIGHT.INCREASING : ANIMATION.LERP.HEIGHT.DECREASING
      currentHeightRef.current = THREE.MathUtils.lerp(currentHeightRef.current, targetHeight, heightLerpFactor)

      // Calculate target positions
      let targetMeshX = 0;
      let targetText3DX = 0;

      if (clicked && !isStackPosition && !isBottomPosition) {
        // When clicked and in center position (not stack, not bottom)
        targetMeshX = -textSize[0] / 2;
        targetText3DX = -textSize[0] / 2;
      } else if (isMoving || clicked) {
        // When moving or clicked in other positions
        if (isStackPosition) {
          targetMeshX = !isEngineering ? -textSize[0] / 2 : textSize[0] / 2;
          targetText3DX = !isEngineering ? -textSize[0] : 0;
        } else {
          targetMeshX = 0;
          targetText3DX = -textSize[0] / 2;
        }
      } else {
        // Default positions
        targetMeshX = !isEngineering ? -textSize[0] / 2 : textSize[0] / 2;
        targetText3DX = !isEngineering ? -textSize[0] : 0;
      }

      const isNearBottom = Math.abs(groupRef.current.position.y - -0.807) < ANIMATION.THRESHOLD.BOTTOM_PROXIMITY

      // Update mesh position
      meshPositionRef.current.set(targetMeshX, textSize[1] / 2 - textSize[1] * LAYOUT.TEXT.VERTICAL_OFFSET, 0)
      performSyncedLerp(
        meshRef.current.position,
        meshPositionRef.current,
        ANIMATION.LERP.POSITION.X_AXIS,
        ANIMATION.LERP.POSITION.NORMAL,
        isNearBottom,
      )

      // Update text3D position
      text3DPositionRef.current.set(targetText3DX, 0, 0)
      performSyncedLerp(
        text3DRef.current.position,
        text3DPositionRef.current,
        ANIMATION.LERP.POSITION.X_AXIS,
        ANIMATION.LERP.POSITION.NORMAL,
        isNearBottom,
      )
    }
  })

  /**
   * Update text size when content or engineering state changes.
   */
  useEffect(() => {
    if (textRef.current) {
      tempBox3.current.setFromObject(textRef.current)
      tempBox3.current.getSize(tempVec3.current)
      setTextSize([tempVec3.current.x, tempVec3.current.y, tempVec3.current.z])
    }
  }, [content, isEngineering])

  return (
    <group position={position}>
      <group ref={groupRef}>
        {/* Invisible mesh for hover detection */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          position={[
            !isEngineering ? -textSize[0] / 2 : textSize[0] / 2,
            textSize[1] / 2 - textSize[1] * LAYOUT.TEXT.VERTICAL_OFFSET,
            0,
          ]}
        >
          <boxGeometry args={[textSize[0], textSize[1], Math.max(ANIMATION.HEIGHT.MIN, textSize[2])]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <Text3D
          ref={(ref) => {
            textRef.current = ref
            text3DRef.current = ref
          }}
          font={isEngineering ? HKGroteskFont : LemonFont}
          size={isEngineering ? LAYOUT.TEXT.SIZE.ENGINEERING : LAYOUT.TEXT.SIZE.CREATIVE}
          height={currentHeightRef.current}
          curveSegments={LAYOUT.TEXT.CURVE_SEGMENTS}
          bevelEnabled={false}
          letterSpacing={isEngineering ? LAYOUT.TEXT.LETTER_SPACING.ENGINEERING : LAYOUT.TEXT.LETTER_SPACING.CREATIVE}
          position={[!isEngineering ? -textSize[0] : 0, 0, 0]}
        >
          {content}
          <meshStandardMaterial color={getColor()} toneMapped={false} transparent opacity={opacity} />
        </Text3D>
      </group>
    </group>
  )
} 
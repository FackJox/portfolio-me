import React, { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { styleMagazineAtom } from '@/state/atoms/global'
import { throttle } from '@/helpers/global/throttle'
import { ANIMATION } from '@/constants/contents/animation'
import { LAYOUT } from '@/constants/contents/layout'

/**
 * HoverDetector component that changes the magazine style based on cursor position
 * 
 * @param {Object} props - Component props
 * @param {number} props.vpWidth - Viewport width
 */
export default function HoverDetector({ vpWidth }) {
  const setStyleMagazine = useSetAtom(styleMagazineAtom)
  const columnOffset = vpWidth / LAYOUT.VIEWPORT.COLUMN_DIVIDER // Match the offset from calculateStackPositions

  // Create throttled pointer move handler
  const handlePointerMove = useCallback(
    throttle((e) => {
      // Convert pointer position to local space
      const x = e.point.x

      if (x < -columnOffset) {
        setStyleMagazine('smack')
      } else if (x > columnOffset) {
        setStyleMagazine('engineer')
      } else {
        setStyleMagazine('vague')
      }
    }, ANIMATION.TIMING.HOVER_DELAY),
    [columnOffset, setStyleMagazine],
  )

  return (
    <mesh position={[0, 0, LAYOUT.POSITION.HOVER_DETECTOR]} onPointerMove={handlePointerMove}>
      <planeGeometry args={[vpWidth * 2, vpWidth * 2]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
} 
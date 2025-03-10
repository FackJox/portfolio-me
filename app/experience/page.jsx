'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { motion } from 'motion/react'
import DescriptionCarousel from '@/components/dom/DescriptionCarousel'
import { useAtomValue, useSetAtom } from 'jotai'
import { titleSlidesAtom } from '@/state/atoms/contents'
import { useViewportMeasurements } from '@/helpers/global/device'
import HoverDetector from '@/components/canvas/Contents/HoverDetector'
import Contents from '@/components/canvas/Contents/Contents'
import { LAYOUT } from '@/constants/contents/layout'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
})

const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })


export default function Page() {
  const items = useAtomValue(titleSlidesAtom)
  const { vpWidth, vpHeight } = useViewportMeasurements()

  return (
    <motion.div layout className='relative w-full flex-1'>
      {items.length > 0 && <DescriptionCarousel items={items} />}

      <View className='absolute w-full inset-0 flex items-center justify-center'>
        <Suspense fallback={null}>
          <group position={[0, 0, LAYOUT.POSITION.MAIN_GROUP]}>
            <HoverDetector vpWidth={vpWidth / LAYOUT.VIEWPORT.MAIN_DIVIDER} />
            <group position={[0, 0, LAYOUT.POSITION.CONTENT_GROUP]}>
              <Contents />
            </group>
          </group>
          <Common />
        </Suspense>
      </View>
    </motion.div>
  )
}

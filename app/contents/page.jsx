'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { motion } from 'motion/react'
import Contents from '@/components/canvas/Contents/Contents'
import TitleSlider from '@/components/dom/TitleSlider'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
})

const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function Page() {
  return (
    <motion.div layout className='relative w-full flex-1'>
      <View className='absolute w-full inset-0 flex items-center justify-center'>
        <Suspense fallback={null}>
          <Contents />
          <Common />
        </Suspense>
      </View>
    </motion.div>
  )
}

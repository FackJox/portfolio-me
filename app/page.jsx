'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useAtom } from 'jotai'
import { motion } from 'motion/react'
import { allAssetsLoadedAtom } from '@/helpers/atoms'
import QueryParamHandler from '@/components/QueryParamHandler'

// Keep dynamic imports for canvas components
const Library = dynamic(() => import('@/components/canvas/Magazines/Library').then((mod) => mod.Library), {
  ssr: false,
})

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
})

const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

const AllAssetsLoader = ({ children }) => {
  const [allAssetsLoaded] = useAtom(allAssetsLoadedAtom)
  if (!allAssetsLoaded) return null
  return children
}

export default function Page() {
  return (
    <motion.div layout className='relative w-full flex-1'>
      {/* Regular React components */}
      <AllAssetsLoader>
        <QueryParamHandler />
      </AllAssetsLoader>

      {/* 3D/R3F components */}
      <View className='absolute w-full inset-0 flex items-center justify-center'>
        <Suspense fallback={null}>
          <AllAssetsLoader>
            <Library position={[0, 0, 0]} />
          </AllAssetsLoader>
          <Common />
        </Suspense>
      </View>
    </motion.div>
  )
}

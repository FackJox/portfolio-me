'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
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

/**
 * Component that renders children only when all assets are loaded
 * Provides a consistent way to gate content based on asset loading state
 */
const AllAssetsLoader = ({ children }) => {
  const [allAssetsLoaded] = useAtom(allAssetsLoadedAtom)
  if (!allAssetsLoaded) return null
  return children
}

/**
 * Enhanced QueryParamHandler wrapper that ensures URL parameters are synchronized
 * with internal state immediately after assets are loaded
 */
const EnhancedQueryParamHandler = () => {
  // Track when the component has mounted to ensure synchronization happens after assets are loaded
  const [isMounted, setIsMounted] = useState(false);
  const [allAssetsLoaded] = useAtom(allAssetsLoadedAtom);

  useEffect(() => {
    // Set mounted state after component mounts
    setIsMounted(true);
  }, []);

  // Only render QueryParamHandler when both conditions are met:
  // 1. Component has mounted (ensuring client-side execution)
  // 2. All assets are loaded (ensuring the app is ready to handle state changes)
  if (!isMounted || !allAssetsLoaded) return null;

  // When both conditions are met, render QueryParamHandler which will
  // immediately synchronize URL parameters with internal state
  return <QueryParamHandler />;
};

export default function Page() {
  return (
    <motion.div layout className='relative w-full flex-1'>
      {/* 
        Render EnhancedQueryParamHandler outside of AllAssetsLoader
        This ensures it has its own lifecycle and can independently
        check for asset loading state
      */}
      <EnhancedQueryParamHandler />

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

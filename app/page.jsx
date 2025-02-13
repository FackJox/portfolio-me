'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect, useRef } from 'react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'motion/react'
import {
  styleMagazineAtom,
  texturesLoadedAtom,
  hdrLoadedAtom,
  allAssetsLoadedAtom,
  wordCloudVisibleAtom,
  scrollTopAtom,
  totalPagesAtom,
  pagesAtom,
  scrollState,
} from '@/helpers/atoms'
import {
  textureCache,
  getTexturePath,
  getRoughnessPath,
  picturesSmack,
  picturesEngineer,
  picturesVague,
  hdrLoader,
  getHDRPath,
} from '@/helpers/textureLoader'
import { useDeviceOrientation, getLayoutConfig } from '@/helpers/deviceHelper'
import { layoutAnimations, backgroundTransitions } from '@/helpers/animationConfigs'

// Direct imports for UI components
import { SmackHeader, SmackButtons, SmackLabel, SmackTopBar } from '@/components/dom/SmackUI'
import { EngineerHeader, EngineerButtons, EngineerLabel, EngineerTopBar } from '@/components/dom/EngineerUI'
import { VagueHeader, VagueButtons, VagueLabel, VagueTopBar } from '@/components/dom/VagueUI'
import Contents from '../src/components/canvas/Contents/Contents' // Import the WordCloud component
import WordCloud from '../src/components/canvas/WordCloud/WordCloud' // Import the WordCloud component
import { PerspectiveCamera } from '@react-three/drei'
import React from 'react'

// Keep dynamic imports for canvas components
const Library = dynamic(() => import('@/components/canvas/Magazines/Library').then((mod) => mod.Library), {
  ssr: false,
})

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

const PreloadComponents = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [, setTexturesLoaded] = useAtom(texturesLoadedAtom)
  const [, setHdrLoaded] = useAtom(hdrLoadedAtom)

  useEffect(() => {
    const preloadAssets = async () => {
      const texturePaths = [
        ...picturesSmack.map((pic) => getTexturePath('smack', pic)),
        ...picturesEngineer.map((pic) => getTexturePath('engineer', pic)),
        ...picturesVague.map((pic) => getTexturePath('vague', pic)),
        getRoughnessPath(),
      ]

      try {
        // Load textures and HDR in parallel
        await Promise.all([
          textureCache.preloadTextures(texturePaths).then(() => setTexturesLoaded(true)),
          hdrLoader.loadHDR(getHDRPath()).then(() => setHdrLoaded(true)),
        ])

        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Failed to load assets:', error)
        // Continue even if some assets fail to load
        setTexturesLoaded(true)
        setHdrLoaded(true)
        setIsLoading(false)
      }
    }

    preloadAssets()
  }, [setTexturesLoaded, setHdrLoaded])

  if (isLoading) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center'>
        <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-white' fill='none' viewBox='0 0 24 24'>
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
      </div>
    )
  }

  return children
}

const AllAssetsLoader = ({ children }) => {
  const [allAssetsLoaded] = useAtom(allAssetsLoadedAtom)

  if (!allAssetsLoaded) {
    return null
  }

  return children
}

export default function Page() {
  const [styleMagazine] = useAtom(styleMagazineAtom)
  const isPortrait = useDeviceOrientation()
  const layout = getLayoutConfig(isPortrait)
  const [wordCloudVisible] = useAtom(wordCloudVisibleAtom)
  const [, setScrollTop] = useAtom(scrollTopAtom)
  const [pages, setPages] = useAtom(pagesAtom)

  const scrollArea = useRef()
  const onScroll = (e) => {
    const scrollTop = e.target.scrollTop
    scrollState.top = scrollTop
    setScrollTop(scrollTop)
  }

  return (
    <PreloadComponents>
      <motion.div
        className='relative flex min-h-[100dvh] w-full flex-col items-center'
        animate={{
          backgroundColor: backgroundTransitions.colors[styleMagazine],
        }}
        transition={{ duration: backgroundTransitions.duration, ease: backgroundTransitions.ease }}
      >
        {/* TopBar for landscape */}
        <motion.div layout className={layout.showTopBar ? 'block w-full' : 'hidden'}>
          <AnimatePresence mode='wait'>
            <motion.div key={`top-${styleMagazine}`} {...layoutAnimations.topBar}>
              {styleMagazine === 'smack' && <SmackTopBar />}
              {styleMagazine === 'engineer' && <EngineerTopBar />}
              {styleMagazine === 'vague' && <VagueTopBar />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Header for portrait */}
        <motion.div layout className={layout.showHeader ? 'block w-full' : 'hidden'}>
          <AnimatePresence mode='wait'>
            <motion.div className='w-full' key={`header-${styleMagazine}`} {...layoutAnimations.header}>
              {styleMagazine === 'smack' && <SmackHeader />}
              {styleMagazine === 'engineer' && <EngineerHeader />}
              {styleMagazine === 'vague' && <VagueHeader />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Buttons Section */}
        <motion.div layout className={layout.showButtons ? 'block w-full' : 'hidden'}>
          <AnimatePresence mode='wait'>
            <motion.div key={`buttons-${styleMagazine}`} {...layoutAnimations.buttons}>
              {styleMagazine === 'smack' && <SmackButtons />}
              {styleMagazine === 'engineer' && <EngineerButtons />}
              {styleMagazine === 'vague' && <VagueButtons />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {/* 
        <motion.div layout className='relative w-full flex-1'>
          <View className='absolute w-full inset-0 flex items-center justify-center'>
            <Suspense fallback={null}>
              <AllAssetsLoader>
                <Library position={[0, 0, 0]} />
              </AllAssetsLoader>
              <Common />
            </Suspense>
          </View>
        </motion.div> */}

        <motion.div layout className='relative w-full flex-1'>
          <View className='absolute w-full inset-0 flex items-center justify-center'>
        
            <Suspense fallback={null}>
              {/* <WordCloud onChangePages={setPages} /> */}
              <Contents />
              <Common />
            </Suspense>
          </View>
        </motion.div>

        <motion.div layout className={layout.showCTA ? 'block w-full' : 'hidden'}>
          <AnimatePresence mode='wait'>
            <motion.div key={`cta-${styleMagazine}`} {...layoutAnimations.cta}>
              {styleMagazine === 'smack' && <SmackLabel />}
              {styleMagazine === 'engineer' && <EngineerLabel />}
              {styleMagazine === 'vague' && <VagueLabel />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </PreloadComponents>
  )
}

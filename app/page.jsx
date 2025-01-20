'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { styleMagazineAtom } from '@/helpers/atoms';

// Direct imports for UI components
import { SmackHeader, SmackButtons, SmackCTA, SmackTopBar } from '@/components/dom/SmackUI'
import { EngineerHeader, EngineerButtons, EngineerCTA, EngineerTopBar } from '@/components/dom/EngineerUI'
import { VagueHeader, VagueButtons, VagueCTA, VagueTopBar } from '@/components/dom/VagueUI'

const Buttons = dynamic(() => import('@/components/canvas/Buttons').then((mod) => mod.Buttons), {
  ssr: false,
})

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

// Magazine textures to preload
const picturesSmack = [
  "01Front",
  "02Contents",
  "03Contents",
  "04Editorial",
  "05Editorial",
  "06Graphics",
  "07Graphics",
  "08Scout",
  "09Scout",
  "10Bunker",
  "11Bunker",
  "12AI",
  "13AI",
  "14Sandro",
  "15Sandro",
  "16Tarot",
  "17Tarot",
  "18Tarot",
  "19Tarot",
  "20Events",
  "21Events",
];

const picturesEngineer = [
  "01Front",
  "02Contents",
  "03Contents",
  "04Editorial",
  "05Editorial",
  "06DigitalTwins",
  "07DigitalTwins",
  "08DigitalTwins",
  "09DigitalTwins",
  "10WindTurbines",
  "11WindTurbines",
  "12HPC",
  "13HPC",
  "14Modelling",
  "15Modelling",
  "16Transformation",
  "17Transformation",
  "18Transformation",
  "19Transformation",
];

const picturesVague = [
  "01Front",
  "02Contents",
  "03Contents",
  "04Editorial",
  "05Editorial",
  "06Timeline",
  "07Timeline",
  "08About",
  "09About",
  "10Contributers",
  "11Contributers",
];

const PreloadComponents = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Helper function to preload an image
    const preloadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = src
        img.onload = resolve
        img.onerror = reject
      })
    }

    // Preload all textures
    const preloadTextures = async () => {
      const texturePromises = [
        ...picturesSmack.map(pic => preloadImage(`/textures/smack/${pic}.png`)),
        ...picturesEngineer.map(pic => preloadImage(`/textures/engineer/${pic}.png`)),
        ...picturesVague.map(pic => preloadImage(`/textures/vague/${pic}.png`)),
        preloadImage('/textures/book-cover-roughness.png')
      ]

      try {
        await Promise.all(texturePromises)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to preload some textures:', error)
        setIsLoading(false) // Continue even if some textures fail to load
      }
    }

    preloadTextures()
  }, [])

  if (isLoading) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center'>
        <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
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

export default function Page() {
  const [styleMagazine] = useAtom(styleMagazineAtom)

  return (
    <PreloadComponents>
      <motion.div
        className='relative flex min-h-[100dvh] w-full flex-col items-center'
        animate={{
          backgroundColor: styleMagazine === 'smack' ? '#0E0504' : styleMagazine === 'vague' ? '#2C272F' : '#200B5F',
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {/* TopBar for md and above */}
        <motion.div layout className='hidden md:block w-full'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={`top-${styleMagazine}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              {styleMagazine === 'smack' && <SmackTopBar />}
              {styleMagazine === 'engineer' && <EngineerTopBar />}
              {styleMagazine === 'vague' && <VagueTopBar />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Original UI for below md */}
        <motion.div layout className='md:hidden w-full'>
          <AnimatePresence mode='wait'>
            <motion.div 
              className='w-full' 
              key={`header-${styleMagazine}`}
              initial={{ opacity: 0, rotateX: 90 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, rotateX: -90 }}
              transition={{ duration: 0.4 }}
            >
              {styleMagazine === 'smack' && <SmackHeader />}
              {styleMagazine === 'engineer' && <EngineerHeader />}
              {styleMagazine === 'vague' && <VagueHeader />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Buttons Section */}
        <motion.div layout className='md:hidden w-full'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={`buttons-${styleMagazine}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {styleMagazine === 'smack' && <SmackButtons />}
              {styleMagazine === 'engineer' && <EngineerButtons />}
              {styleMagazine === 'vague' && <VagueButtons />}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div layout className='relative w-full flex-1'>
          <View className='absolute w-full inset-0 flex items-center justify-center'>
            <Suspense fallback={null}>
              <Library position={[0, 0, 0]} />
              <Common />
            </Suspense>
          </View>
        </motion.div>

        <motion.div layout className='w-full md:hidden'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={`cta-${styleMagazine}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {styleMagazine === 'smack' && <SmackCTA />}
              {styleMagazine === 'engineer' && <EngineerCTA />}
              {styleMagazine === 'vague' && <VagueCTA />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </PreloadComponents>
  )
}

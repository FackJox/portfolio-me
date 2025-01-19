'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { styleMagazineAtom } from '@/components/canvas/Magazines/Library'

const SmackHeader = dynamic(() => import('@/components/dom/SmackUI').then((mod) => mod.SmackHeader), { ssr: true })
const SmackButtons = dynamic(() => import('@/components/dom/SmackUI').then((mod) => mod.SmackButtons), { ssr: true })
const SmackCTA = dynamic(() => import('@/components/dom/SmackUI').then((mod) => mod.SmackCTA), { ssr: true })
const SmackTopBar = dynamic(() => import('@/components/dom/SmackUI').then((mod) => mod.SmackTopBar), { ssr: true })

const EngineerHeader = dynamic(() => import('@/components/dom/EngineerUI').then((mod) => mod.EngineerHeader), {
  ssr: true,
})
const EngineerButtons = dynamic(() => import('@/components/dom/EngineerUI').then((mod) => mod.EngineerButtons), {
  ssr: true,
})
const EngineerCTA = dynamic(() => import('@/components/dom/EngineerUI').then((mod) => mod.EngineerCTA), { ssr: true })
const EngineerTopBar = dynamic(() => import('@/components/dom/EngineerUI').then((mod) => mod.EngineerTopBar), {
  ssr: true,
})

const VagueHeader = dynamic(() => import('@/components/dom/VagueUI').then((mod) => mod.VagueHeader), { ssr: true })
const VagueButtons = dynamic(() => import('@/components/dom/VagueUI').then((mod) => mod.VagueButtons), { ssr: true })
const VagueCTA = dynamic(() => import('@/components/dom/VagueUI').then((mod) => mod.VagueCTA), { ssr: true })
const VagueTopBar = dynamic(() => import('@/components/dom/VagueUI').then((mod) => mod.VagueTopBar), { ssr: true })

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

export default function Page() {
  const [styleMagazine] = useAtom(styleMagazineAtom)

  return (
    <>
      <motion.div
        className='relative flex min-h-[100dvh] w-full flex-col items-center'
        animate={{
          backgroundColor: styleMagazine === 'smack' ? '#0E0504' : styleMagazine === 'vague' ? '#2C272F' : '#200B5F',
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* TopBar for md and above */}
        <motion.div layout className='hidden md:block w-full'>
          <AnimatePresence mode='wait'>
            {styleMagazine === 'smack' && (
              <motion.div
                key="smack-top"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
              >
                <SmackTopBar />
              </motion.div>
            )}
            {styleMagazine === 'engineer' && (
              <motion.div
                key="engineer-top"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
              >
                <EngineerTopBar />
              </motion.div>
            )}
            {styleMagazine === 'vague' && (
              <motion.div
                key="vague-top"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
              >
                <VagueTopBar />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Original UI for below md */}
        <motion.div layout className='md:hidden w-full'>
          <AnimatePresence mode='wait'>
            <motion.div className='w-full' key={`header-${styleMagazine}`}>
              {styleMagazine === 'smack' && (
                <motion.div
                  initial={{ opacity: 0, rotateX: 90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: -90 }}
                  transition={{ duration: 0.4 }}
                >
                  <SmackHeader />
                </motion.div>
              )}
              {styleMagazine === 'engineer' && (
                <motion.div
                  initial={{ opacity: 0, rotateX: 90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: -90 }}
                  transition={{ duration: 0.4 }}
                >
                  <EngineerHeader />
                </motion.div>
              )}
              {styleMagazine === 'vague' && (
                <motion.div
                  initial={{ opacity: 0, rotateX: 90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: -90 }}
                  transition={{ duration: 0.4 }}
                >
                  <VagueHeader />
                </motion.div>
              )}
            </motion.div>

            <motion.div className='w-full' key={`buttons-${styleMagazine}`}>
              {styleMagazine === 'smack' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <SmackButtons />
                </motion.div>
              )}
              {styleMagazine === 'engineer' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <EngineerButtons />
                </motion.div>
              )}
              {styleMagazine === 'vague' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <VagueButtons />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div layout className='relative w-full flex-1'>
          <View className='absolute inset-0 flex items-center justify-center'>
            <Suspense fallback={null}>
              <Library position={[0, 0, 0]} />
              <Common
              />
            </Suspense>
          </View>
        </motion.div>

        <motion.div layout className='w-full md:hidden'>
          <AnimatePresence mode='wait'>
            {styleMagazine === 'smack' && (
              <motion.div
                key="smack-cta"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <SmackCTA />
              </motion.div>
            )}
            {styleMagazine === 'engineer' && (
              <motion.div
                key="engineer-cta"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <EngineerCTA />
              </motion.div>
            )}
            {styleMagazine === 'vague' && (
              <motion.div
                key="vague-cta"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <VagueCTA />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  )
}

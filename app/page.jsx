'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { useAtom } from 'jotai'
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
      <div
        className='relative flex min-h-[100dvh] w-full flex-col items-center'
        style={{
          backgroundColor: styleMagazine === 'smack' ? '#0E0504' : styleMagazine === 'vague' ? '#2C272F' : '#200B5F',
        }}
      >
        {/* TopBar for md and above */}
        <div className='hidden md:block w-full'>
          {styleMagazine === 'smack' && <SmackTopBar />}
          {styleMagazine === 'engineer' && <EngineerTopBar />}
          {styleMagazine === 'vague' && <VagueTopBar />}
        </div>

        {/* Original UI for below md */}
        <div className='md:hidden w-full'>
          <div className='w-full'>
            {styleMagazine === 'smack' && <SmackHeader />}
            {styleMagazine === 'engineer' && <EngineerHeader />}
            {styleMagazine === 'vague' && <VagueHeader />}
          </div>

          <div className='w-full'>
            {styleMagazine === 'smack' && <SmackButtons />}
            {styleMagazine === 'engineer' && <EngineerButtons />}
            {styleMagazine === 'vague' && <VagueButtons />}
          </div>
        </div>

        <div className='relative w-full flex-1'>
          <View className='absolute inset-0 flex items-center justify-center'>
            <Suspense fallback={null}>
              <Library position={[0, 0, 0]} />
              <Common
                color={styleMagazine === 'smack' ? '#0E0504' : styleMagazine === 'vague' ? '#2C272F' : '#200B5F'}
              />
            </Suspense>
          </View>
        </div>

        <div className='w-full md:hidden'>
          {styleMagazine === 'smack' && <SmackCTA />}
          {styleMagazine === 'engineer' && <EngineerCTA />}
          {styleMagazine === 'vague' && <VagueCTA />}
        </div>
      </div>
    </>
  )
}

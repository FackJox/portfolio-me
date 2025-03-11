import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { layoutAnimations } from '@/helpers/global/animation/layout'
import { contentsVisibleAtom } from '@/state/atoms/contents'
import { useAtom } from 'jotai'

export const SmackHeader = () => {
  return (
    <motion.div
      layoutId='header-container'
      className='w-full flex items-center justify-center pt-3 pb-2'
      {...layoutAnimations.headerContainer}
    >
      <motion.h1
        {...layoutAnimations.headerText}
        className='font-[YoungSerif] text-[#FABE7F] text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] text-center align-middle whitespace-nowrap'
      >
        JACK FOXCROFT
      </motion.h1>
    </motion.div>
  )
}

export const SmackButtons = () => {
  const [contentsVisible, setContentsVisible] = useAtom(contentsVisibleAtom)

  return (
    <div className='w-full flex items-center justify-center'>
      <div className='w-full mx-5 flex relative'>
        <motion.div layoutId='top-border' className='absolute top-0 w-full h-[2px] bg-[#FABE7F]' />
        <motion.div layoutId='bottom-border' className='absolute bottom-0 w-full h-[2px] bg-[#FABE7F]' />
        <motion.div className='flex-1' {...layoutAnimations.buttonsText}>
          <button
            className='w-full py-1.5 font-[lemon-regular] text-[#FABE7F] text-xl sm:text-2xl md:text-3xl tracking-[0.04em] text-center align-middle'
            onClick={() => setContentsVisible((prev) => !prev)}
          >
            EXPERIENCE
          </button>
        </motion.div>
        <div className='flex items-center flex-shrink-0'>
          <motion.div className='h-[50%] w-[1px] bg-[#F5E4F8] relative mx-4' {...layoutAnimations.buttonsDivider} />
        </div>
        <motion.div className='flex-1' {...layoutAnimations.buttonsText}>
          <button className='w-full py-1.5 font-[lemon-wide] text-[#F5E4F8] text-xl sm:text-2xl md:text-3xl tracking-[0.04em] text-center align-middle'>
            CONNECT
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export const SmackLabel = () => {
  return (
    <div className='w-full flex items-center justify-center'>
      <div className='w-full mx-5 relative'>
        <motion.div layoutId='cta-border' className='absolute top-0 w-full h-[2px] bg-[#FABE7F]' />
        <motion.div {...layoutAnimations.CTAtext}>
          <button className='w-full py-6 text-3xl sm:text-3xl md:text-3xl font-[lemon-wide] text-[#FABE7F]'>
            <span className='font-[lemon-regular]'>CREATI</span>
            <span className='font-[lemon-wide]'>VE</span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export const SmackTopBar = () => {
  const router = useRouter()

  return (
    <div className='w-full h-10 flex items-center justify-between pt-6 pb-6 pl-6 pr-8 relative'>
      <motion.div layoutId='topbar-border' className='absolute bottom-0 left-0 w-full h-[1px] bg-[#FABE7F]' />
      <motion.div className='flex-1 flex items-center justify-between' {...layoutAnimations.topBarText}>
        <h1
          className='font-[YoungSerif] text-[#FABE7F] text-3xl tracking-[-0.04em] whitespace-nowrap cursor-pointer'
          onClick={() => router.push('/')}
        >
          Jack Foxcroft
        </h1>
        <div className='flex items-center gap-8'>
          <button className='font-[lemon-regular] text-[#F5E4F8] text-3xl' onClick={() => router.push('/experience')}>
            EXPERIENCE
          </button>
        </div>
      </motion.div>
      <motion.div className='h-6 w-[1px] bg-[#F5E4F8] mx-8' {...layoutAnimations.topBarDivider} />
      <motion.div className='flex items-center' {...layoutAnimations.topBarText}>
        <button className='font-[lemon-wide] text-[#FABE7F] text-3xl'>CONNECT</button>
      </motion.div>
    </div>
  )
}

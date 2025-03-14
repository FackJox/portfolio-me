import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { layoutAnimations } from '@/helpers/magazines/animation/layout'
import { contentsVisibleAtom } from '@/state/atoms/contents'
import { useAtom } from 'jotai'

export const VagueHeader = () => {
  return (
    <motion.div
      layoutId='header-container'
      className='w-full flex items-center justify-center pt-4 pb-3'
      {...layoutAnimations.headerContainer}
    >
      <motion.h1
        {...layoutAnimations.headerText}
        className='font-[Vogue] text-[#F7F6F7] text-4xl sm:text-5xl md:text-6xl tracking-[-0.07em] text-center align-middle whitespace-nowrap'
      >
        JACK FOXCROFT
      </motion.h1>
    </motion.div>
  )
}

export const VagueButtons = () => {
  const [contentsVisible, setContentsVisible] = useAtom(contentsVisibleAtom)

  return (
    <div className='w-full flex items-center justify-center'>
      <div className='w-full mx-5 flex relative'>
        <motion.div layoutId='top-border' className='absolute top-0 w-full h-[1px] bg-[#FFFFFF]' />
        <motion.div layoutId='bottom-border' className='absolute bottom-0 w-full h-[1px] bg-[#FFFFFF]' />
        <motion.div className='flex-1' {...layoutAnimations.buttonsText}>
          <button
            className='w-full py-2 font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-xl sm:text-2xl md:text-2xl tracking-[-0.12em] text-center align-middle'
            onClick={() => setContentsVisible((prev) => !prev)}
          >
            EXPERIENCE
          </button>
        </motion.div>
        <div className='flex items-center flex-shrink-0'>
          <motion.div className='h-[50%] w-[1px] bg-[#FFFFFF] relative mx-4' {...layoutAnimations.buttonsDivider} />
        </div>
        <motion.div className='flex-1' {...layoutAnimations.buttonsText}>
          <button className='w-full py-2 text-[#F7F6F7] font-[HKGrotesk-Regular] text-xl sm:text-2xl md:text-2xl tracking-[-0.12em] text-center align-middle'>
            CONNECT
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export const VagueLabel = () => {
  return (
    <div className='w-full flex items-center justify-center'>
      <div className='w-full mx-5 relative'>
        <motion.div layoutId='cta-border' className='absolute top-0 w-full h-[1px] bg-[#FFFFFF]' />
        <motion.div {...layoutAnimations.CTAtext}>
          <button className='w-full py-6 text-xl sm:text-2xl md:text-2xl font-[HKGrotesk-Regular] tracking-[-0.12em] text-[#F7F6F7]'>
            ABOUT
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export const VagueTopBar = () => {
  const router = useRouter()

  return (
    <div className='w-full h-10 flex items-center justify-between pt-6 pb-6 pl-6 pr-8 relative'>
      <motion.div layoutId='topbar-border' className='absolute bottom-0 left-0 w-full h-[1px] bg-[#F7F6F7]' />
      <motion.div className='flex-1 flex items-center justify-between' {...layoutAnimations.topBarText}>
        <h1
          className='font-[Vogue] text-[#F7F6F7] text-[2.5rem] tracking-[-0.07em] whitespace-nowrap cursor-pointer'
          onClick={() => router.push('/')}
        >
          Jack Foxcroft
        </h1>
        <div className='flex items-center gap-8'>
          <button
            className='font-[HKGrotesk-Regular] text-[#F7F6F7] text-xl tracking-[-0.12em]'
            onClick={() => router.push('/experience')}
          >
            EXPERIENCE
          </button>
        </div>
      </motion.div>
      <motion.div className='h-6 w-[1px] bg-[#F7F6F7] mx-8' {...layoutAnimations.topBarDivider} />
      <motion.div className='flex items-center' {...layoutAnimations.topBarText}>
        <button className='font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-2xl tracking-[-0.12em]'>CONNECT</button>
      </motion.div>
    </div>
  )
}

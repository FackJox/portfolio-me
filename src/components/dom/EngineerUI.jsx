import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { layoutAnimations } from '@/helpers/animationConfigs'
import { contentsVisibleAtom } from '@/helpers/atoms'
import { useAtom } from 'jotai'

export const EngineerHeader = () => {
  return (
    <motion.div
      layoutId='header-container'
      className='w-full flex items-center justify-center pt-4 pb-3'
      {...layoutAnimations.headerContainer}
    >
      <motion.h1
        {...layoutAnimations.headerText}
        className='font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-4xl sm:text-5xl md:text-6xl tracking-[-0.13em] text-center align-middle whitespace-nowrap'
      >
        Jack Foxcroft
      </motion.h1>
    </motion.div>
  )
}

export const EngineerButtons = () => {
  const [contentsVisible, setContentsVisible] = useAtom(contentsVisibleAtom)

  return (
    <div className='w-full flex items-center justify-center'>
      <div className='w-full mx-5 flex relative'>
        <motion.div layoutId='top-border' className='absolute top-0 w-full h-[1px] bg-[#F7F6F7]' />
        <motion.div layoutId='bottom-border' className='absolute bottom-0 w-full h-[1px] bg-[#F7F6F7]' />
        <motion.div className='flex-1' {...layoutAnimations.buttonsText}>
          <button
            className='w-full py-2 font-[HKGrotesk-Bold] text-[#F4EEDC] text-xl sm:text-2xl md:text-2xl tracking-[-0.12em] text-center align-middle'
            onClick={() => setContentsVisible((prev) => !prev)}
          >
            EXPERIENCE
          </button>
        </motion.div>
        <div className='flex items-center flex-shrink-0'>
          <motion.div className='h-[50%] w-[1px] bg-[#F7F6F7] relative mx-4' {...layoutAnimations.buttonsDivider} />
        </div>
        <motion.div className='flex-1' {...layoutAnimations.buttonsText}>
          <button className='w-full py-2 text-[#FFB79C] font-[HKGrotesk-SemiBold] text-xl sm:text-2xl md:text-2xl tracking-[-0.12em] text-center align-middle'>
            CONNECT
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export const EngineerLabel = () => {
  return (
    <div className='w-full flex items-center justify-center'>
      <div className='w-full mx-5 relative'>
        <motion.div layoutId='cta-border' className='absolute top-0 w-full h-[1px] bg-[#F7F6F7]' />
        <motion.div {...layoutAnimations.CTAtext}>
          <button className='w-full py-6 text-xl sm:text-2xl md:text-3xl font-[HKGrotesk-Regular] tracking-[-0.12em] text-[#FFB79C]'>
            TECHNICAL
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export const EngineerTopBar = () => {
  const router = useRouter()

  return (
    <div className='w-full h-10 flex items-center justify-between pt-6 pb-6 pl-6 pr-8 relative'>
      <motion.div layoutId='topbar-border' className='absolute bottom-0 left-0 w-full h-[1px] bg-[#F7F6F7]' />
      <motion.div className='flex-1 flex items-center justify-between' {...layoutAnimations.topBarText}>
        <h1
          className='font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-3xl tracking-[-0.13em] whitespace-nowrap cursor-pointer'
          onClick={() => router.push('/')}
        >
          Jack Foxcroft
        </h1>
        <div className='flex items-center gap-8'>
          <button
            className='font-[HKGrotesk-SemiBold] text-[#FFB79C] text-l tracking-[-0.12em]'
            onClick={() => router.push('/experience')}
          >
            EXPERIENCE
          </button>
        </div>
      </motion.div>
      <motion.div className='h-[24px] w-[1px] bg-[#F7F6F7] mx-8' {...layoutAnimations.topBarDivider} />
      <motion.div className='flex items-center' {...layoutAnimations.topBarText}>
        <button className='font-[HKGrotesk-Bold] text-[#F4EEDC] text-xl tracking-[-0.12em]'>CONNECT</button>
      </motion.div>
    </div>
  )
}

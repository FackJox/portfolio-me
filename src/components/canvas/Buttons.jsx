import { Html } from '@react-three/drei'

export const VagueButton = () => {
  return (
    <Html transform scale={0.5}>
      <button className='flex-1 py-2 text-xs text-[#F7F6F7] font-[HKGrotesk-Regular] tracking-[-0.12em] text-center align-middle'>
        ABOUT
      </button>
    </Html>
  )
}

export const EngineerButton = () => {
  return (
    <Html transform scale={0.5}>
      <button className='flex-1 py-2 text-[#F7F6F7]  font-[HKGrotesk-SemiBold] text-xs tracking-[-0.12em] text-center align-middle'>
        TECHNICAL
      </button>
    </Html>
  )
}

export const SmackButton = () => {
  return (
    <Html transform scale={0.5}>
      <button className='flex-1 py-1.5 text-[#F7F6F7] text-sm tracking-[0.04em] text-center align-middle'>
        <span className='font-[lemon-regular]'>CREATI</span>
        <span className='font-[lemon-wide]'>VE</span>
      </button>
    </Html>
  )
}



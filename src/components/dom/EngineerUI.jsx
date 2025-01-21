export const EngineerHeader = () => {
  return (
    <div className='w-full flex items-center justify-center pt-4 pb-3 '>
      <h1 className='font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-4xl sm:text-5xl md:text-6xl tracking-[-0.13em] text-center align-middle whitespace-nowrap'>
        Jack Foxcroft
      </h1>
    </div>
  )
}

export const EngineerButtons = () => {
  return (
    <div className='w-full flex items-center justify-center '>
      <div className='w-full mx-5 flex border-t-[1px] border-b-[1px] border-[#F7F6F7]'>
        <button className='flex-1 py-2 font-[HKGrotesk-Bold] text-[#F4EEDC] text-xl sm:text-2xl md:text-2xl tracking-[-0.12em] text-center align-middle'>
          MENU
        </button>
        <div className='flex items-center flex-shrink-0'>
          <div className='h-[50%] w-[1px] bg-[#F7F6F7] relative mx-4'></div>
        </div>
        <button className='flex-1 py-2 text-[#FFB79C] font-[HKGrotesk-SemiBold] text-xl sm:text-2xl md:text-2xl tracking-[-0.12em] text-center align-middle'>
          CONNECT
        </button>
      </div>
    </div>
  )
}

export const EngineerLabel = () => {
  return (
    <div className='w-full flex items-center justify-center'>
      <div className='w-full mx-5'>
        <button className='w-full py-6 border-t-[1px] border-[#F7F6F7] text-xl sm:text-2xl md:text-3xl  font-[HKGrotesk-Regular] tracking-[-0.12em] text-[#FFB79C]'>
          TECHNICAL
        </button>
      </div>
    </div>
  )
}

export const EngineerTopBar = () => {
  return (
    <div className='w-full h-10 flex items-center justify-between pt-6 pb-6 pl-6 pr-8  border-b-[1px]'>
      <h1 className='font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-3xl tracking-[-0.13em] whitespace-nowrap'>
        Jack Foxcroft
      </h1>
      <div className='flex items-center gap-8'>
        <button className='font-[HKGrotesk-SemiBold] text-[#FFB79C] text-l tracking-[-0.12em]'>
          MENU
        </button>
        <div className='h-[24px] w-[1px] bg-[#F7F6F7]'></div>
        <button className='font-[HKGrotesk-SemiBold] text-[#FFB79C] text-l tracking-[-0.12em]'>
          TECHNICAL
        </button>
        <div className='h-[24px] w-[1px] bg-[#F7F6F7]'></div>
        <button className='font-[HKGrotesk-Bold] text-[#F4EEDC] text-xl tracking-[-0.12em]'>
          CONNECT
        </button>
      </div>
    </div>
  )
}
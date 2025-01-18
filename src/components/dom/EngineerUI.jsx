export const EngineerHeader = () => {
  return (
    <div className='w-full flex items-center justify-center mb-4 bg-[#200B5F]'>
      <h1 className='font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-[5.5rem] tracking-[-0.13em] text-center align-middle whitespace-nowrap pr-4'>
        Jack Foxcroft
      </h1>
    </div>
  )
}

export const EngineerButtons = () => {
  return (
    <div className='w-full flex items-center justify-center mt-7 mb-4 bg-[#200B5F] '>
      <div className='w-full max-w-[392px] flex border-t-[1px] md:max-w-[676px] border-b-[1px] border-[#F7F6F7]'>
        <button className='flex-1 py-2 font-[HKGrotesk-Bold]  text-[#F4EEDC] text-3xl md:text-2xl tracking-[-0.12em] text-center align-middle'>
          MENU
        </button>
        <div className='flex  items-center flex-shrink-0'>
          <div className='h-[50%] w-[1px] bg-[#F7F6F7] relative mx-4'></div>
        </div>
        <button className='flex-1 py-2 text-[#FFB79C] font-[HKGrotesk-SemiBold]  text-3xl md:text-2xl tracking-[-0.12em] text-center align-middle'>
          TECHNICAL
        </button>
      </div>
    </div>
  )
}

export const EngineerCTA = () => {
  return (
    
    <div className='fixed bottom-0 mb-20 w-full flex items-center justify-center'>
      <div className='w-full max-w-[392px] md:max-w-[676px]'>
        <button className='w-full py-5 border-t-[1px] border-b-[1px] border-[#F7F6F7] text-4xl bg-[#200B5F] font-[HKGrotesk-Regular] tracking-[-0.12em] text-[#FFB79C]'>
          CONNECT.
        </button>
      </div>
    </div>
  )
}

export const EngineerTopBar = () => {
  return (
    <div className='w-full h-10 flex items-center justify-between pl-6 pr-8 bg-[#200B5F] border-b-[1px]'>
      <h1 className='font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-[2.5rem] tracking-[-0.13em] whitespace-nowrap'>
        Jack Foxcroft
      </h1>
      <div className='flex items-center gap-8'>
        <button className='font-[HKGrotesk-Bold] text-[#F4EEDC] text-xl tracking-[-0.12em]'>
          MENU
        </button>
        <div className='h-[24px] w-[1px] bg-[#F7F6F7]'></div>
        <button className='font-[HKGrotesk-SemiBold] text-[#FFB79C] text-xl tracking-[-0.12em]'>
          TECHNICAL
        </button>
        <div className='h-[24px] w-[1px] bg-[#F7F6F7]'></div>
        <button className='font-[HKGrotesk-Regular] text-[#FFB79C] text-2xl tracking-[-0.12em]'>
          CONNECT
        </button>
      </div>
    </div>
  )
}
export const VagueHeader = () => {
  return (
    <div className='w-full flex items-center justify-center pt-6 pb-4 bg-[#2C272F] '>
      <h1 className='font-[Vogue] text-[#F7F6F7]  text-5xl sm:text-6xl md:text-7xl tracking-[-0.07em] text-center align-middle whitespace-nowrap '>
        JACK FOXCROFT
      </h1>
    </div>
  )
}

export const VagueButtons = () => {
  return (
    <div className='w-full flex items-center justify-center bg-[#2C272F] '>
      <div className='w-full max-w-[390px] flex border-t-[1px] border-b-[1px] border-[#FFFFFF]'>
        <button className='flex-1 py-2 font-[HKGrotesk-SemiBold]  text-[#F7F6F7] text-xl sm:text-2xl md:text-3xl  tracking-[-0.12em] text-center align-middle'>
          MENU
        </button>
        <div className='flex  items-center flex-shrink-0'>
          <div className='h-[50%] w-[1px] bg-[#FFFFFF] relative mx-4'></div>
        </div>
        <button className='flex-1 py-2 text-[#F7F6F7] font-[HKGrotesk-Regular]  text-xl sm:text-2xl md:text-3xl tracking-[-0.12em] text-center align-middle'>
          ABOUT
        </button>
      </div>
    </div>
  )
}

export const VagueCTA = () => {
  return (
    <div className='fixed bottom-0 w-full flex items-center justify-center'>
      <div className='w-full max-w-[390px]'>
        <button className='w-full py-5 border-t-[1px]  border-[#FFFFFF] text-2xl bg-[#2C272F] font-[HKGrotesk-Regular] tracking-[-0.12em] text-[#F7F6F7]'>
          CONNECT.
        </button>
      </div>
    </div>
  )
}

export const VagueTopBar = () => {
  return (
    <div className='w-full h-10 flex items-center justify-between pl-6 pr-8 bg-[#200B5F] border-b-[1px]'>
      <h1 className='font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-[2.5rem] tracking-[-0.13em] whitespace-nowrap'>
        Jack Foxcroft
      </h1>
      <div className='flex items-center gap-8'>
        <button className='font-[HKGrotesk-Bold] text-[#F4EEDC] text-xl tracking-[-0.12em]'>MENU</button>
        <div className='h-[24px] w-[1px] bg-[#F7F6F7]'></div>
        <button className='font-[HKGrotesk-SemiBold] text-[#FFB79C] text-xl tracking-[-0.12em]'>TECHNICAL</button>
        <div className='h-[24px] w-[1px] bg-[#F7F6F7]'></div>
        <button className='font-[HKGrotesk-Regular] text-[#FFB79C] text-2xl tracking-[-0.12em]'>CONNECT</button>
      </div>
    </div>
  )
}

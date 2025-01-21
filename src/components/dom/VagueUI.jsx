export const VagueHeader = () => {
  return (
    <div className='w-full flex items-center justify-center pt-4 pb-3 '>
      <h1 className='font-[Vogue] text-[#F7F6F7] text-4xl sm:text-5xl md:text-6xl tracking-[-0.07em] text-center align-middle whitespace-nowrap'>
        JACK FOXCROFT
      </h1>
    </div>
  )
}

export const VagueButtons = () => {
  return (
    <div className='w-full flex items-center justify-center '>
      <div className='w-full mx-5 flex border-t-[1px] border-b-[1px] border-[#FFFFFF]'>
        <button className='flex-1 py-2 font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-xl sm:text-2xl md:text-2xl tracking-[-0.12em] text-center align-middle'>
          MENU
        </button>
        <div className='flex items-center flex-shrink-0'>
          <div className='h-[50%] w-[1px] bg-[#FFFFFF] relative mx-4'></div>
        </div>
        <button className='flex-1 py-2 text-[#F7F6F7] font-[HKGrotesk-Regular] text-xl sm:text-2xl md:text-2xl tracking-[-0.12em] text-center align-middle'>
          CONNECT
        </button>
      </div>
    </div>
  )
}

export const VagueLabel = () => {
  return (
    <div className='w-full flex items-center justify-center'>
      <div className='w-full mx-5'>
        <button className='w-full py-6 border-t-[1px] border-[#FFFFFF] text-xl sm:text-2xl md:text-2xl  font-[HKGrotesk-Regular] tracking-[-0.12em] text-[#F7F6F7]'>
          ABOUT
        </button>
      </div>
    </div>
  )
}

export const VagueTopBar = () => {
  return (
    <div className='w-full h-10 flex items-center justify-between pt-6 pb-6  pl-6 pr-8 border-b-[1px]'>
      <h1 className='font-[Vogue] text-[#F7F6F7] text-[2.5rem] tracking-[-0.07em] whitespace-nowrap'>
        Jack Foxcroft
      </h1>
      <div className='flex items-center gap-8'>
        <button className='font-[HKGrotesk-Regular]  text-[#F7F6F7] text-xl tracking-[-0.12em]'>MENU</button>
        <div className='h-6 w-[1px] bg-[#F7F6F7]'></div>
        <button className='font-[HKGrotesk-SemiBold] text-[#F7F6F7] text-2xl tracking-[-0.12em]'>CONNECT</button>
      </div>
    </div>
  )
}

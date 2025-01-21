export const SmackHeader = () => {
  return (
    <div className='w-full flex items-center justify-center pt-3 pb-2 '>
      <h1 className='font-[YoungSerif] text-[#FABE7F] text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] text-center align-middle whitespace-nowrap'>
        JACK FOXCROFT
      </h1>
    </div>
  )
}

export const SmackButtons = () => {
  return (
    <div className='w-full flex items-center justify-center '>
      <div className='w-full mx-5 flex border-t-2 border-b-2 border-[#FABE7F]'>
        <button className='flex-1 py-1.5 font-[lemon-regular]  text-[#FABE7F] text-xl sm:text-2xl md:text-3xl tracking-[0.04em] text-center align-middle'>
          MENU
        </button>
        <div className='flex  items-center flex-shrink-0'>
          <div className='h-[50%] w-[1px] bg-[#F5E4F8] relative mx-4'></div>
        </div>
        <button className='flex-1 py-1.5 font-[lemon-wide] text-[#F5E4F8]  text-xl sm:text-2xl md:text-3xl tracking-[0.04em] text-center align-middle'>
          CONNECT
        </button>
      </div>
    </div>
  )
}

export const SmackLabel = () => {
  return (
    <div className='w-full flex items-center justify-center'>
      <div className='w-full mx-5'>
        <button className='w-full py-6 border-t-2 border-[#FABE7F] text-3xl sm:text-3xl md:text-3xl font-[lemon-wide] text-[#FABE7F]'>
          <span className='font-[lemon-regular]'>CREATI</span>
          <span className='font-[lemon-wide]'>VE</span>
        </button>
      </div>
    </div>
  )
}

export const SmackTopBar = () => {
  return (
    <div className='w-full h-10 flex items-center justify-between pt-6 pb-6 pl-6 pr-8  border-b-[1px] border-[#FABE7F]'>
      <h1 className='font-[YoungSerif] text-[#FABE7F] text-3xl tracking-[-0.04em] whitespace-nowrap'>
        Jack Foxcroft
      </h1>
      <div className='flex items-center gap-8'>
        <button className='font-[lemon-regular] text-[#F5E4F8] text-3xl '>
          MENU
        </button>
        <div className='h-6 w-[1px] bg-[#F5E4F8]'></div>
        <button className='flex items-center text-[#F5E4F8] text-3xl '>
          <span className='font-[lemon-regular]'>CREATI</span>
          <span className='font-[lemon-wide]'>VE</span>
        </button>
        <div className='h-6 w-[1px] bg-[#F5E4F8]'></div>
        <button className='font-[lemon-wide] text-[#FABE7F] text-3xl '>
          CONNECT
        </button>
      </div>
    </div>
  )
}

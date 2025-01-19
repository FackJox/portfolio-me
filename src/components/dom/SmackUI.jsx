export const SmackHeader = () => {
  return (
    <div className='w-full flex items-center justify-center pt-6 pb-4 bg-[#0E0504]'>
      <h1 className='font-[YoungSerif] text-[#FABE7F] text-4xl sm:text-5xl   tracking-[-0.04em] text-center align-middle whitespace-nowrap'>
        JACK FOXCROFT
      </h1>
    </div>
  )
}

export const SmackButtons = () => {
  return (
    <div className='w-full flex items-center justify-center mb-4 bg-[#0E0504]'>
      <div className='w-full max-w-72 sm:max-w-96 flex border-t-2 border-b-2 border-[#FABE7F]'>
        <button className='flex-1 px-4 py-2 md:py-3 font-[lemon-regular] bg-[#0E0504] text-[#FABE7F] text-3xl sm:text-4xl tracking-[0.04em] text-center align-middle'>
          MENU
        </button>
        <div className='flex bg-[#0E0504] items-center flex-shrink-0'>
          <div className='h-[50%] w-[1px] bg-[#F5E4F8] relative mx-4'></div>
        </div>
        <button className='flex-1 px-4 py-2 md:py-3 text-[#F5E4F8] bg-[#0E0504] text-3xl sm:text-4xl tracking-[0.04em] text-center align-middle'>
          <span className='font-[lemon-regular]'>CREATI</span>
          <span className='font-[lemon-wide]'>VE</span>
        </button>
      </div>
    </div>
  )
}

export const SmackCTA = () => {
  return (
    <div className='fixed bottom-0 w-full flex items-center justify-center'>
      <div className='w-full max-w-72 sm:max-w-96'>
        <button className='w-full p-2 bg-[#FABE7F] text-5xl font-[lemon-wide] text-[#0E0504]'>CONNECT</button>
      </div>
    </div>
  )
}


export const SmackTopBar = () => {
  return (
    <div className='w-full h-10 flex items-center justify-between pt-6 pb-6 pl-6 pr-8 bg-[#0E0504] border-b-[1px] border-[#FABE7F]'>
      <h1 className='font-[YoungSerif] text-[#FABE7F] text-[2.5rem] tracking-[-0.04em] whitespace-nowrap'>
        Jack Foxcroft
      </h1>
      <div className='flex items-center gap-8'>
        <button className='font-[lemon-regular] text-[#F5E4F8] text-4xl tracking-[-0.04em]'>
          MENU
        </button>
        <div className='h-6 w-[1px] bg-[#F5E4F8]'></div>
        <button className='flex items-center text-[#F5E4F8] text-4xl tracking-[-0.04em]'>
          <span className='font-[lemon-regular]'>CREATI</span>
          <span className='font-[lemon-wide]'>VE</span>
        </button>
        <div className='h-6 w-[1px] bg-[#F5E4F8]'></div>
        <button className='font-[lemon-wide] text-[#FABE7F] text-4xl tracking-[-0.04em]'>
          CONNECT
        </button>
      </div>
    </div>
  )
}

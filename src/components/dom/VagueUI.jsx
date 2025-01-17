export const VagueHeader = () => {
    return ( 
    <div className='w-full flex items-center justify-center pt-4 pb-2 bg-[#2C272F]'>
      <h1 className='font-[Vogue] text-[#F7F6F7] text-[4rem] tracking-[-0.08em] text-center align-middle whitespace-nowrap '>
        JACK FOXCROFT
      </h1>
    </div>
  )
}

export const VagueButtons = () => {
    return ( 
        <div className='w-full flex items-center justify-center mt-5 mb-4 bg-[#2C272F] '>
            <div className='w-full max-w-[362px] flex border-t-[1px] border-b-[1px] border-[#FFFFFF]'>
                <button 
                    className='flex-1 px-4 py-5 font-[HKGrotesk-SemiBold]  text-[#F7F6F7] text-3xl tracking-[-0.12em] text-center align-middle'
                >
                    MENU
                </button>
                <div className='flex  items-center flex-shrink-0'>
                    <div className='h-[50%] w-[1px] bg-[#FFFFFF] relative mx-4'></div>
                </div>
                <button 
                    className='flex-1 px-4 py-5 text-[#F7F6F7] font-[HKGrotesk-Regular]  text-3xl tracking-[-0.12em] text-center align-middle'
                >
                    ABOUT
                </button>
            </div>
        </div>
    )
}

  
export const VagueCTA = () => {
    return ( 
        <div className='fixed bottom-0 mb-8 w-full flex items-center justify-center'>
            <div className='w-full max-w-[362px]'>
                <button 
                    className='w-full py-5 border-t-[1px] border-b-[1px] border-[#FFFFFF] text-3xl bg-[#2C272F] font-[HKGrotesk-Regular] tracking-[-0.12em] text-[#F7F6F7]'
                >
                    CONNECT.
                </button>
            </div>
        </div>
    )
}
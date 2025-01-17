export const EngineerHeader = () => {
    return ( 
    <div className='w-full flex items-center justify-center mb-4'>
      <h1 className='font-[HKGrotesk-SemiBold] text-[#FFB79C] text-[5.5rem] tracking-[-0.13em] text-center align-middle whitespace-nowrap'>
        Jack Foxcroft
      </h1>
    </div>
  )
}

export const EngineerButtons = () => {
    return ( 
        <div className='w-full flex items-center justify-center mt-7 mb-4 bg-[#200B5F] '>
            <div className='w-full max-w-[380px] flex border-t-[1px] border-b-[1px] border-[#F7F6F7]'>
                <button 
                    className='flex-1 px-4 py-5 font-[HKGrotesk-Bold] bg-[#200B5F] text-[#F4EEDC] text-3xl tracking-[-0.12em] text-center align-middle'
                >
                    MENU
                </button>
                <div className='flex  items-center flex-shrink-0'>
                    <div className='h-[50%] w-[1px] bg-[#F7F6F7] relative mx-4'></div>
                </div>
                <button 
                    className='flex-1 px-4 py-5 text-[#FFB79C] font-[HKGrotesk-SemiBold] bg-[#200B5F] text-3xl tracking-[-0.12em] text-center align-middle'
                >
                    TECHNICAL
                </button>
            </div>
        </div>
    )
}

  
export const EngineerCTA = () => {
    return ( 
        <div className='fixed bottom-0 mb-8 w-full flex items-center justify-center'>
            <div className='w-full max-w-[380px]'>
                <button 
                    className='w-full py-5 border-t-[1px] border-b-[1px] border-[#F7F6F7] text-4xl bg-[#200B5F] font-[HKGrotesk-Regular] tracking-[-0.12em] text-[#FFB79C]'
                >
                    CONNECT.
                </button>
            </div>
        </div>
    )
}
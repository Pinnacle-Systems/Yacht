import React from 'react'

const CardWrapper = ({ name, children, borderColor = '#afafae' }) => {
    return (
        <div className='w-full h-full text-center border border-gray-200 bg-gray-200'>
            <div className={` text-center rounded-xs flex items-center justify-center h-[30px] border-2 border-[#E0E0E0] `}>
                <span className='text-[16px] font-normal '>{name}</span>
            </div>
            <div className='h-[80%] p-1  '>
                {children}
            </div>
        </div>
    )
}

export default CardWrapper
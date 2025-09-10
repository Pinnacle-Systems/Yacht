import React from 'react'

const Color = ({ val, valIndex }) => {
    return (
        <>
            <tr className='text-left'>
                <td className=' py-1 gridAlignLeft text-left capitalize text-xs'>
                    {val?.Color?.name.toUpperCase() || ""}
                </td>
            </tr>
        </>
    )
}

export default Color
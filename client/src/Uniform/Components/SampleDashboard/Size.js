import React from 'react'

const Size = ({ val, valIndex }) => {
    return (
        <>
            <tr className='text-left'>
                <td className=' py-1 gridAlignLeft text-left capitalize text-xs'>
                    {val?.Size?.name.toUpperCase() || ""}
                </td>
            </tr>
        </>
    )
}

export default Size
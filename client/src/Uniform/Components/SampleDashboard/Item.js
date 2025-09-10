import React from 'react'

const Item = ({ val, valIndex }) => {
    return (
        <>
            <tr className='text-left'>
                <td className=' py-1 gridAlignLeft text-left capitalize text-xs'>
                    {val?.Item?.name.toUpperCase() || ""}
                </td>
            </tr>
        </>
    )
}

export default Item
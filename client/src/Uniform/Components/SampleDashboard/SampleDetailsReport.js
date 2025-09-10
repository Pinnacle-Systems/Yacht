import React from 'react'

const SampleDetailsReport = ({ val, valIndex }) => {
    return (
        <>
            <tr className='text-left'>
                <td className=' py-1 gridAlignLeft text-left capitalize text-xs'>
                    {val?.ItemType?.name.toUpperCase() || ""}
                </td>


            </tr>
        </>
    )
}

export default SampleDetailsReport
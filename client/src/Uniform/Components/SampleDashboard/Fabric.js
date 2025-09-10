import React from 'react'

const Fabric = ({ val, valIndex }) => {
    return (
        <>
            <tr className='text-left'>
                <td className=' py-1 gridAlignLeft text-left capitalize text-xs'>
                    {val?.Fabric?.name.toUpperCase() || ""}
                </td>
            </tr>
        </>
    )
}

export default Fabric
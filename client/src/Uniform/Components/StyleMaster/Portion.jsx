import React from 'react'
import { DELETE, PLUS } from '../../../icons'

import { getCommonParams } from '../../../Utils/helper';

const Portion = ({ portionDetails, setPortionDetails, readonly }) => {
    const params = getCommonParams()


    function addRow() {
        setPortionDetails(prev => [...prev, { portionId: "" }])
    }
    function deleteRow(index) {
        setPortionDetails(prev => prev.filter((_, i) => i !== index))
    }
    function handleOnChange(index, field, value) {
        setPortionDetails(prev => {
            let newDetails = structuredClone(prev);
            newDetails[index][field] = value;
            return newDetails
        })
    }
    return (
        <div  >
            <table className="border border-gray-500 ">
                <thead className="border border-gray-500">
                    <tr>
                        <th className="border border-gray-500 w-24 text-xs p-0.5">Portion </th>
                        {!readonly &&
                            <th className="border border-gray-500 w-16 text-xs p-0.5">
                                <button type='button' className="text-green-700 text-xs " onClick={addRow} >
                                    {PLUS}
                                </button>
                            </th>
                        }
                    </tr>
                </thead>
                <tbody>
                    {/* {portionDetails.map((value, valueIndex) =>
                        <tr key={valueIndex}>
                            <td className="border border-gray-500 text-xs ">
                                <select
                                    disabled={readonly}
                                    id='dd'
                                    name="name" className='input-field border border-gray-500 md:col-span-2 col-span-1 rounded'
                                    value={value.portionId} onChange={(e) => { handleOnChange(valueIndex, "portionId", e.target.value); }} >
                                    <option value=""></option>
                                    {(portionData?.data ? portionData?.data : []).map((option, index) => <option key={index} value={option.id} >
                                        {option.name}
                                    </option>)}
                                </select>
                            </td>
                            {!readonly &&
                                <td className="border border-gray-500 text-xs text-center">
                                    <button
                                        type='button'
                                        onClick={() => {
                                            deleteRow(valueIndex)
                                        }}
                                        className='text-xs text-red-600 '>{DELETE}
                                    </button>
                                </td>
                            }
                        </tr>
                    )} */}
                </tbody>
            </table>
        </div>
    )
}

export default Portion

import React, { useEffect } from 'react'

import { faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useGetClassMasterQuery } from '../../../redux/uniformService/ClassMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';

const ClassWiseQty = ({ setClassGridOpen, params, readOnly, setCurrentSelectedIndex, currentIndex, setAdditionalImportData, additionalImportData }) => {

    const { data: classList } =
        useGetClassMasterQuery({});
    const { data: sizeList } =
        useGetSizeMasterQuery({ params });

    function handleClassQty(value, valIndex, field) {


        setAdditionalImportData(prev => {
            let newObj = structuredClone(prev)
            newObj[currentIndex]["classIds"][valIndex][field] = value
            // newObj[currentIndex]["qty"] = totalQty
            return newObj
        })

        // if (field == "qty") {
        //     totalQty = additionalImportData?.[currentIndex]?.["classIds"]?.reduce((old, current) => {
        //         return (parseFloat(old) + parseFloat(current?.qty ? current?.qty : 0))
        //     }, 0)
        // }


    }




    return (
        <div className=' h-[95%] overflow-y-auto'>
            {

                <div className='flex justify-around'>
                    <table className="border border-gray-500 w-3/4">
                        <thead className="border border-gray-500">
                            <tr className="">
                                <th className="border border-gray-500 text-sm p-1">S.No </th>
                                <th className="border border-gray-500 text-sm p-1">Class</th>
                                <th className="border border-gray-500 text-sm p-1">Size</th>
                                <th className="border border-gray-500 text-sm p-1">Qty</th>
                                <th className="border border-gray-500 text-sm p-1 w-20" >
                                    <button type='button' className="text-green-700" onClick={() => {
                                        setAdditionalImportData(prev => {
                                            let newPrev = structuredClone(prev);
                                            newPrev[currentIndex]["classIds"]?.push({
                                                classId: "",
                                                qty: "",
                                                sizeId: "",
                                            })
                                            return newPrev
                                        })
                                    }}
                                        disabled={readOnly}
                                    > {<FontAwesomeIcon icon={faUserPlus} />}
                                    </button>
                                </th>
                            </tr>

                        </thead>
                        <tbody>
                            {(additionalImportData[currentIndex]?.classIds || [])?.map((item, itemIndex) => (
                                <tr className="items-center" key={itemIndex}>
                                    <td className="border border-gray-500 text-xs text-center w-12">{itemIndex + 1}</td>
                                    <td className=" text-xs bg-gray-400" >
                                        <select
                                            readOnly={readOnly}
                                            onKeyDown={e => { if (e.key === "Delete") { handleClassQty("", itemIndex, "classId") } }}
                                            className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                            value={item.classId}
                                            onChange={(e) => handleClassQty(e.target.value, itemIndex, "classId")}
                                        >
                                            <option className='text-gray-600'>Select
                                            </option>
                                            {(classList?.data ? classList?.data : [])?.filter(i => i.active)?.map((uom) =>
                                                <option value={uom.id} key={uom.id}>
                                                    {uom.name}
                                                </option>
                                            )}

                                        </select>

                                    </td>
                                    <td className=" px-1 border border-gray-400">
                                        <select
                                            readOnly={readOnly}
                                            onKeyDown={e => { if (e.key === "Delete") { handleClassQty("", itemIndex, "sizeId") } }}
                                            className='text-left text-xs h-full w-full rounded py-2 px-2 table-data-input border border-gray-400'
                                            value={item.sizeId}
                                            onChange={(e) => handleClassQty(e.target.value, itemIndex, "sizeId")}
                                        >
                                            <option className='text-gray-600'>Select
                                            </option>
                                            {(sizeList?.data ? sizeList?.data : []).map((uom) =>
                                                <option value={uom.id} key={uom.id}>
                                                    {uom.name}
                                                </option>
                                            )}
                                        </select>
                                    </td>
                                    <td className="w-16 text-xs bg-gray-400" >
                                        <input className="text-left w-full rounded h-8 py-2 focus:outline-none px-2" type="text"
                                            value={item?.qty}
                                            onChange={e => { handleClassQty(e.target.value, itemIndex, "qty") }}
                                        />
                                    </td>
                                    <td className="border border-gray-500 p-1 text-xs text-center" >
                                        <div className='flex justify-around  w-full px-1'>

                                            <button
                                                type='button'
                                                disabled={readOnly}
                                                onClick={() => {
                                                    setAdditionalImportData(prev => {
                                                        let newPrev = structuredClone(prev);
                                                        newPrev[currentIndex]["classIds"] = newPrev[currentIndex]["classIds"].filter((_, i) => i !== itemIndex)
                                                        return newPrev
                                                    })
                                                }}
                                                className='text-md text-red-600 ml-1'>{<FontAwesomeIcon icon={faTrashCan} />}</button>

                                        </div>

                                    </td>

                                </tr>

                            ))}
                        </tbody>
                    </table>
                </div>
            }

            <div className='w-full grid justify-center mt-10'>
                <button onClick={() => {
                    setClassGridOpen(false)
                }}
                    className=' w-24 bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition text-center '>
                    Done
                </button>
            </div >
        </div>
    )
}

export default ClassWiseQty
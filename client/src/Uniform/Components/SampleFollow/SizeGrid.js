import React, { useEffect } from 'react'
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { DELETE } from '../../../icons';
import secureLocalStorage from 'react-secure-storage';

const SizeGrid = ({ sampleSizeGrid, setSampleSizeGrid, id, readOnly }) => {


    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )

    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )


    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const params = {
        branchId, companyId
    };

    const { data: colorList } =
        useGetColorMasterQuery({ params });
    const { data: sizeList } =
        useGetSizeMasterQuery({ params });
    useEffect(() => {
        if (id) return

        setSampleSizeGrid(prev => {
            if (prev.length >= 5) return prev
            let newArray = Array.from({ length: 5 - prev.length }, i => {
                return { sizeId: "", colorId: "" }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setSampleSizeGrid, id, sampleSizeGrid])

    function handleInputChange(value, index, field) {
        const newBlend = structuredClone(sampleSizeGrid);

        newBlend[index][field] = value;

        setSampleSizeGrid(newBlend);
    };


    function addNewRow() {
        setSampleSizeGrid(prev => [
            ...prev,
            { sizeId: "", colorId: "" }
        ]);
    }

    function deleteRow(index) {
        setSampleSizeGrid(prev => prev.filter((_, i) => i !== index))
    }
    return (
        <>

            <div className={` relative w-full overflow-y-auto py-1 h-full`}>
                <table className=" border border-gray-500 text-xs table-auto w-full">
                    <thead className='bg-blue-200 top-0 border-b border-gray-500'>
                        <tr className=''>
                            <th className="table-data  w-8 text-center p-0.5">S.no</th>
                            <th className="table-data w-9">Size<span className="text-red-500 p-5">*</span></th>
                            <th className="table-data">Color<span className="text-red-500 p-5">*</span></th>
                            {!readOnly
                                &&
                                <th className="table-data  w-16 p-0.5" onClick={addNewRow} >  <span className='text-2xl' >+</span></th>
                            }
                        </tr>
                    </thead>

                    <tbody className='overflow-y-auto h-full w-full'>{console.log(sampleSizeGrid, "sampleSizeGridsampleSizeGrid")}
                        {(sampleSizeGrid || []).map((item, index) =>

                            <tr key={index} className={`w-full table-row`}>
                                <td className="table-data w-7 text-left px-1 py-1">
                                    {index + 1}
                                </td>
                                <td className='table-data w-12'>

                                    <select
                                        readOnly={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                        value={item.sizeId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                    >
                                        <option className='text-gray-600'>
                                        </option>
                                        {(sizeList?.data ? sizeList?.data : []).map((uom) =>
                                            <option value={uom.id} key={uom.id}>
                                                {uom.name}
                                            </option>
                                        )}
                                    </select>
                                </td>

                                <td className='table-data w-20'>

                                    <select
                                        readOnly={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                        value={item.colorId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                    >
                                        <option className='text-gray-600'>
                                        </option>
                                        {(colorList?.data ? colorList?.data : []).map((uom) =>
                                            <option value={uom.id} key={uom.id}>
                                                {uom.name}
                                            </option>
                                        )}
                                    </select>
                                </td>

                                {!readOnly &&
                                    <td className="border border-gray-500 text-xs text-center">
                                        <button
                                            type='button'
                                            onClick={() => {
                                                deleteRow(index)
                                            }}
                                            className='text-xs text-red-600 '>{DELETE}
                                        </button>
                                    </td>
                                }
                            </tr>

                        )}

                    </tbody>

                </table>
            </div>


        </>
    )
}

export default SizeGrid


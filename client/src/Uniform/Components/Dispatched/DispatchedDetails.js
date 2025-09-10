import React from 'react';
import secureLocalStorage from 'react-secure-storage';
import { DELETE, PLUS } from '../../../icons';
import { toast } from 'react-toastify';
import { useGetPcsStockQuery } from '../../../redux/services/StockService';
import { findFromList } from '../../../Utils/helper';

const DispatchedDetails = ({ itemList, colorList, sizeList, id, readOnly, dispatchedDetails, setDispatchedDetails,
    itemId,
    setStockDetailsFillGrid, storeId, orderId }) => {


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(dispatchedDetails);
        newBlend[index][field] = value;
        setDispatchedDetails(newBlend);
    };


    const handleDeleteRow = (id) => {
        setDispatchedDetails(yarnBlend => yarnBlend.filter((row, index) => index !== parseInt(id)));
    };
    return (
        <fieldset disabled={readOnly} className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border
                            border-gray-600  max-h-[280px] overflow-auto'>
            <legend className='sub-heading'>Dispatched Details</legend>
            <div className={`relative w-full overflow-y-auto p-1`}>
                <table className="table-data border border-gray-500 text-xs table-auto w-full">
                    <thead className='bg-gray-300 border border-gray-500 top-0'>
                        <tr className='border border-gray-500'>
                            <th className="table-data w-2 text-center">S.no</th>
                            <th className="table-data w-48">Item</th>


                            <th className="table-data w-48">Colors</th>
                            <th className="table-data w-32">Size</th>

                            {/* <th className="table-data w-20">Stock Qty</th> */}
                            <th className="table-data w-20">Del. Qty</th>

                            {
                                !readOnly &&
                                <th className="table-data w-20"></th>
                            }


                            {/* {readOnly ?
                                "" :
                                <th className='w-20  bg-green-600 text-white'>
                                    <div onClick={() => {
                                        if (!storeId || !orderId) {
                                            return toast.info("Please Select Store,Order, & FromProcess...!")
                                        }
                                        setStockDetailsFillGrid(true)
                                    }}
                                        className='hover:cursor-pointer py-2 flex items-center justify-center bg-green-600 text-white'>
                                        {PLUS}
                                    </div>
                                </th>
                            } */}
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto table-data h-full w-full'>{console.log(dispatchedDetails, "dispatchedDetails")}
                        {(dispatchedDetails || [])?.map((row, index) => (
                            <tr key={index} className="w-full table-row">
                                <td className='table-data'>{index + 1}</td>
                                <td className='table-data '>

                                    {findFromList(row?.itemId, itemList?.data, "name")}
                                </td>

                                <td className='table-data '>

                                    {findFromList(row?.colorId, colorList?.data, "name")}
                                </td>
                                <td className='table-data'>

                                    {findFromList(row?.sizeId, sizeList?.data, "name")}
                                </td>

                                {/* <td className='table-data text-right'>

                                    {row?.qty}
                                </td> */}
                                <td className='table-data'>
                                    <input type="number"
                                        onFocus={(e) => e.target.select()}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.00", index, "delQty") } }}
                                        value={(!row.delQty) ? 0 : row.delQty}
                                        min={0}
                                        onChange={(e) => {
                                            if (parseFloat(e.target.value) > parseFloat(row?.qty)) {
                                                toast.info("Delivery Qty Cannot be more than Stock Qty", { position: "top-center" })
                                                return
                                            }
                                            handleInputChange(e.target.value, index, "delQty")
                                        }}
                                        className="text-right rounded py-1 w-full px-1 table-data-input"
                                        inputMode='decimal'
                                        onBlur={(e) =>
                                            handleInputChange(parseFloat(e.target.value).toFixed(2), index, "delQty")
                                        } />
                                </td>


                                {readOnly
                                    ?
                                    ""
                                    :
                                    <td className='table-data w-20'>
                                        <div tabIndex={-1} onClick={() => handleDeleteRow(index)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer'>
                                            {DELETE}
                                        </div>
                                    </td>
                                }
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </fieldset>
    )
}

export default DispatchedDetails
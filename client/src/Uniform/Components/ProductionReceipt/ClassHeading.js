import React, { useEffect, useState } from 'react'
import SizeArrayComponent from './SizeArrayComponent';

const ClassHeading = ({ findReadOnly, findReadOnlyAll, markRead, index, setProductionReceiptDetails,
    item, handleSelectAllChange, getSelectAll,
    productionReceiptDetails, isItemSelected, productionDeliveryDetailsFillData, setProductionDeliveryDetailsFillData, }) => {


    return (
        <>
            <tr className="items-center" key={index}>
                <td className='w-8 p-2 border border-gray-500'>
                    Mark All
                    <input disabled={markRead && findReadOnlyAll(item?.classId)} type="checkbox" className='w-full border border-gray-500' onChange={(e) => handleSelectAllChange(e.target.checked, item)}
                        checked={getSelectAll(item?.classId)}
                    />
                </td>
                <td className=" text-xs text-center bg-gray-400 border border-gray-500" colSpan={2}>
                    {item?.className}
                </td>
            </tr>

            {item?.sizeArray?.map((value, valueIndex) =>

                <SizeArrayComponent findReadOnly={findReadOnly} markRead={markRead} productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                    setProductionDeliveryDetailsFillData={setProductionDeliveryDetailsFillData} key={value?.sizeId} value={value} valueIndex={valueIndex} index={index} setProductionReceiptDetails={setProductionReceiptDetails}
                    classItem={item} classId={item?.classId} handleSelectAllChange={handleSelectAllChange} getSelectAll={getSelectAll}
                    productionReceiptDetails={productionReceiptDetails} isItemSelected={isItemSelected}
                />
            )}

        </>
    )
}

export default ClassHeading
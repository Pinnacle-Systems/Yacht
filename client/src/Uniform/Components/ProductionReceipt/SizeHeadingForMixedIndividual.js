import React, { useEffect, useState } from 'react'
import SizeArrayComponent from './SizeArrayComponent';
import ItemArrayComponent from './ItemArrayComponent';
import ItemArrayComponentForMixedIndividual from './ItemArrayComponentForMixedIndividual';

const SizeHeadingForMixedIndividual = ({ markReadIndividual, findReadOnly, findReadOnlyAll, classArray, index, setProductionReceiptDetails,
    item, handleSelectAllChange, getSelectAll,
    productionReceiptDetails, isItemSelected, productionDeliveryDetailsFillData, setProductionDeliveryDetailsFillData, }) => {


    return (
        <>
            <tr className="items-center" key={index}>
                <td className='w-8 p-2 border border-gray-500'>
                    Mark All
                    <input disabled={markReadIndividual && findReadOnlyAll(item?.sizeId)} type="checkbox" className='w-full border border-gray-500' onChange={(e) => handleSelectAllChange(e.target.checked, item)}
                        checked={getSelectAll(item?.sizeId)}
                    />
                </td>
                <td className=" text-xs text-center bg-gray-400 border border-gray-500" colSpan={5}>
                    {item?.sizeName}
                </td>
            </tr>

            {item?.itemArray?.filter(j => j.orderQty !== j.readyQty)?.map((value, valueIndex) =>

                <ItemArrayComponentForMixedIndividual findReadOnly={findReadOnly} markReadIndividual={markReadIndividual} classArray={classArray} productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                    setProductionDeliveryDetailsFillData={setProductionDeliveryDetailsFillData} key={value?.itemId} value={value} valueIndex={valueIndex} index={index} setProductionReceiptDetails={setProductionReceiptDetails}
                    classItem={item} sizeId={item?.sizeId} handleSelectAllChange={handleSelectAllChange} getSelectAll={getSelectAll}
                    productionReceiptDetails={productionReceiptDetails} isItemSelected={isItemSelected}
                />
            )}

        </>
    )
}

export default SizeHeadingForMixedIndividual
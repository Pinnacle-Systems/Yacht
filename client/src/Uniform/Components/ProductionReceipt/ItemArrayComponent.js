import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';



const ItemArrayComponent = ({ findReadOnly, markRead, value, valueIndex, index, setProductionReceiptDetails,
    classItem, sizeId,
    productionReceiptDetails, productionDeliveryDetailsFillData, setProductionDeliveryDetailsFillData, }) => {


    const handleInputChange = (value, index, sizeIndex, classItemData, itemId, field, readyQty) => {
        const newBlend = structuredClone(productionDeliveryDetailsFillData);

        if (field == "receivedQty") {
            if (value > readyQty) {
                toast.info("Inward Qty Cannot be more than Ready Qty", { position: 'top-center' })
                return
            }
        }

        newBlend[index]["itemArray"][sizeIndex][field] = value;
        setProductionDeliveryDetailsFillData(newBlend);
        const receiptBlend = structuredClone(productionReceiptDetails);
        let sizeItemIndex = receiptBlend.findIndex(val => val?.itemId == itemId)
        receiptBlend[sizeItemIndex][field] = value
        setProductionReceiptDetails(receiptBlend);
    };

    const addItem = (itemId, colorId, classItemData, val) => {
        console.log(val,"val")
        setProductionReceiptDetails(prev => {
            let newInwardDetails = structuredClone(prev);
            newInwardDetails.push({
                sizeId: classItemData?.sizeId,
                itemId: val?.itemId,
                box: 0,
                isPackingOver: true,
                colorId: val?.colorId,
                size: classItemData?.sizeName,
                productionConsumptionDetails: [{
                    colorId: val?.colorId, consumption: val?.receivedQty, itemId: val?.itemId,
                    sizeId: classItemData?.sizeId,
                }],
                receivedQty: val?.receivedQty,
                alreadyReceivedQty: val?.alreadyReceivedQty,
                readyQty: val?.readyQty,
                orderQty: val?.orderQty,
            })

            return newInwardDetails
        });

    }


    const isItemSelected = (itemId, colorId, classItemData) => {
        let foundIndex = productionReceiptDetails?.filter(j => j.sizeId == classItemData?.sizeId)?.findIndex(item => (parseInt(item.itemId) === parseInt(itemId) && parseInt(item.colorId) === parseInt(colorId)))
        return foundIndex !== -1
    }


    const deleteItem = (itemId, colorId, classItemdata) => {
        setProductionReceiptDetails(prev => {
            let obj = structuredClone(prev)
            let oldObj = obj?.filter(val => (parseInt(val.sizeId) !== parseInt(classItemdata?.sizeId)))
            let newObj = obj?.filter(val => (parseInt(val.sizeId) === parseInt(classItemdata?.sizeId)))
            newObj = newObj?.filter(val => !(parseInt(val?.itemId) === parseInt(itemId) && parseInt(val?.colorId) === parseInt(colorId)))

            obj = [...oldObj, ...newObj]
            return obj

        })
    }


    const handleChangeInwardProgramDetails = (itemId, colorId, classItemdata, sizeItem) => {
        if (isItemSelected(itemId, colorId, classItemdata)) {
            deleteItem(itemId, colorId, classItemdata)
        } else {
            const checkQty = (classItemdata?.itemArray?.[valueIndex]?.receivedQty > 0);
            // if (checkQty) {
            addItem(itemId, colorId, classItemdata, sizeItem)
            // }
            // else {
            //     toast.info("Please fill Inward Qty", { position: 'top-center' })
            //     return
            // }
        }
    }


    return (
        <>

            <tr className="items-center" >

                <td className="border border-gray-500 text-xs text-center h-7">
                    <input type='checkbox' disabled={markRead && findReadOnly(sizeId, value?.itemId)}
                        onChange={() => { handleChangeInwardProgramDetails(value?.itemId, value?.colorId, classItem, value) }}
                        checked={isItemSelected(value?.itemId, value?.colorId, classItem)} />
                </td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.itemName}</td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.colorName}</td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.orderQty || 0}</td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.alreadyReceivedQty || 0}</td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.readyQty || 0}</td>
                <td className="border border-gray-500 text-xs text-center h-7">
                    <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 px-1 w-full table-data-input"

                        value={(!value.receivedQty) ? 0 : value.receivedQty}

                        onChange={(e) => {

                            handleInputChange(e.target.value, index, valueIndex, classItem, value?.itemId, "receivedQty", value?.readyQty)
                        }}

                    />

                </td>

            </tr>
        </>
    )
}

export default ItemArrayComponent

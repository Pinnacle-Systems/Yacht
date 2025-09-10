import { subtract } from 'lodash';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';



const ItemArrayComponentForMixedIndividual = ({ findReadOnly, markReadIndividual, classArray, value, valueIndex, index, setProductionReceiptDetails,
    classItem, sizeId,
    productionReceiptDetails, productionDeliveryDetailsFillData, setProductionDeliveryDetailsFillData, }) => {


    const handleInputChange = (value, index, sizeIndex, classItemData, itemId, field, readyQty, balanceQty) => {
        const newBlend = structuredClone(productionDeliveryDetailsFillData);

        if (field == "receivedQty") {
            if (value > balanceQty) {
                toast.info("Inward Qty Cannot be more than Ready Qty", { position: 'top-center' })
                return
            }
        }



        newBlend[index]["itemArray"][sizeIndex][field] = value;
        setProductionDeliveryDetailsFillData(newBlend);
        const receiptBlend = structuredClone(productionReceiptDetails);
        let sizeItemIndex = receiptBlend.findIndex(val => parseInt(val?.itemId) == parseInt(itemId))
        receiptBlend[sizeItemIndex][field] = value
        setProductionReceiptDetails(receiptBlend);
    };


    function findBalanceQty(itemId, colorId, sizeId) {

        // let balanceQty = 0;
        let sizeArray = classArray?.flatMap(val => val.sizeArray)?.filter(j => parseInt(j.sizeId) == parseInt(sizeId))




        const balanceQty = sizeArray?.reduce((accumulation, currentValue) => {
            return (parseInt(accumulation) + parseInt(currentValue?.totalInwardQty ? currentValue?.totalInwardQty : 0))
        }, 0)

        // for (let i = 0; i < sizeArray?.length; i++) {
        //     let sizeObj = sizeArray[i]

        //     let femaleQty = sizeObj?.female?.filter(k => (parseInt(k.isfeMaleItemId) == parseInt(itemId) && parseInt(k.isFemaleColorId) == parseInt(colorId)))
        //     let maleQty = sizeObj?.male?.filter(j => (parseInt(j.isMaleItemId) === parseInt(itemId) && parseInt(j.isMaleColorId) === parseInt(colorId)))

        //     if ((maleQty?.length > 0) && (femaleQty?.length > 0)) {
        //         balanceQty = balanceQty + parseInt(sizeObj?.readyToInwardMaleSet + sizeObj?.readyToInwardFeMaleSet)
        //     }
        //     else if (maleQty?.length > 0) {
        //         balanceQty = balanceQty + parseInt(sizeObj?.readyToInwardMaleSet)
        //     }
        //     else if (femaleQty?.length > 0) {

        //         balanceQty = balanceQty + parseInt(sizeObj?.readyToInwardFeMaleSet)
        //     }
        //     else {
        //         continue
        //     }

        // }

        return parseInt(balanceQty)

    }

    const addItem = (itemId, colorId, classItemData, val) => {
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

                // receivedQty: parseInt(subtract(val.readyQty, findBalanceQty(val?.itemId, val?.colorId, classItemData?.sizeId)) || 0),
                receivedQty: val?.receivedQty ? val?.receivedQty : 0,
                readyQty: val?.readyQty,
                // balanceQty: val?.balanceQty,
                balanceQty: parseInt(subtract(val.readyQty, findBalanceQty(val?.itemId, val?.colorId, classItemData?.sizeId)) || 0),
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
            // const checkQty = (classItemdata?.itemArray?.[valueIndex]?.receivedQty > 0);
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
                    <input type='checkbox' disabled={markReadIndividual && findReadOnly(sizeId, value?.itemId)}
                        onChange={() => { handleChangeInwardProgramDetails(value?.itemId, value?.colorId, classItem, value) }}
                        checked={isItemSelected(value?.itemId, value?.colorId, classItem)} />
                </td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.itemName}</td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.colorName}</td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.orderQty || 0}</td>
                <td className="border border-gray-500 text-xs text-center h-7">{subtract(value?.readyQty, findBalanceQty(value?.itemId, value?.colorId, classItem?.sizeId)) || 0}</td>
                <td className="border border-gray-500 text-xs text-center h-7">
                    <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 px-1 w-full table-data-input"

                        value={(!value.receivedQty) ? 0 : value?.receivedQty}

                        onChange={(e) => {

                            handleInputChange(e.target.value, index, valueIndex, classItem, value?.itemId, "receivedQty", 0, value?.balanceQty)
                        }}

                    />

                </td>

            </tr>
        </>
    )
}

export default ItemArrayComponentForMixedIndividual

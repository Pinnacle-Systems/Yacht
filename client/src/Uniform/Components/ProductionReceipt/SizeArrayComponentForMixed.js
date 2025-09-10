import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { findFromList } from '../../../Utils/helper';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import secureLocalStorage from 'react-secure-storage';



const SizeArrayComponentForMixed = ({ id, findReadOnly, markRead, value, valueIndex, index, setProductionReceiptDetails,
    classItem, classId,
    productionReceiptDetails, productionDeliveryDetailsFillData, setProductionDeliveryDetailsFillData, }) => {


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };


    const { data: itemList } =
        useGetItemMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params });


    const handleInputChange = (value, index, sizeIndex, classItemData, sizeId, field, readyToInwardMaleSet, readyToInwardFeMaleSet, orderQtyForMale, orderQtyForFemale) => {
        const newBlend = structuredClone(productionDeliveryDetailsFillData);

        if (field == "maleInwardQty") {
            if (value > readyToInwardMaleSet) {
                toast.info("Inward Qty Cannot be more than Ready Qty", { position: 'top-center' })
                return
            }
        }
        else if (field == "femaleInwardQty") {
            if (value > readyToInwardFeMaleSet) {
                toast.info("Inward Qty Cannot be more than Ready Qty", { position: 'top-center' })
                return
            }
        }
        else if (field == "totalInwardQty") {
            if (value > parseInt(orderQtyForMale + orderQtyForFemale)) {
                toast.info("Inward Qty Cannot be more than Ready Qty", { position: 'top-center' })
                return
            }
        }
        newBlend[index]["sizeArray"][sizeIndex][field] = value;
        setProductionDeliveryDetailsFillData(newBlend);


        const receiptBlend = structuredClone(productionReceiptDetails);
        let sizeItemIndex = receiptBlend.findIndex(val => val?.classId == classItemData?.classId && val?.sizeId == sizeId)
        receiptBlend[sizeItemIndex][field] = value
        if (field == "femaleInwardQty" || field == "maleInwardQty") {
            receiptBlend[sizeItemIndex]["totalInwardQty"] = parseInt(receiptBlend[sizeItemIndex]["maleInwardQty"] + receiptBlend[sizeItemIndex]["femaleInwardQty"])
        }
        setProductionReceiptDetails(receiptBlend);



    };


    const addItem = (sizeId, classItemData, val) => {
        let maleItemData = [];
        let femaleItemData = [];

        setProductionReceiptDetails(prev => {
            let newInwardDetails = structuredClone(prev);
            // maleItemData = val?.male?.filter(j => j.readyQty > 0)?.map(i => {
            //     return {
            //         ...i, colorId: i?.isMaleColorId, consumption: 0, itemId: i?.isMaleItemId,
            //         sizeId: val?.sizeId,
            //     }
            // })

            // femaleItemData = val?.female?.filter(j => j.readyQty > 0)?.map(i => {
            //     return {
            //         ...i, colorId: i?.isFemaleColorId, consumption: 0, itemId: i?.isfeMaleItemId,
            //         sizeId: val?.sizeId,
            //     }
            // })

            // let consumptionData = [...maleItemData, ...femaleItemData]


            newInwardDetails.push({
                receivedQty: 0,
                classId: classItemData?.classId,
                sizeId: val?.sizeId,
                box: 0,
                maleSet: val?.male,
                femaleSet: val?.female,
                size: val?.size,
                isPackingOver: true,
                className: classItemData?.className,
                productionConsumptionDetails: [],
                maleInwardQty: val?.orderQtyForMale,
                orderQtyForMale: val?.orderQtyForMale,
                orderQtyForFemale: val?.orderQtyForFemale,
                femaleInwardQty: val?.orderQtyForFemale,
                readyToInwardFeMaleSet: val?.readyToInwardFeMaleSet,
                readyToInwardMaleSet: val?.readyToInwardMaleSet,
                totalInwardQty: parseInt((val?.orderQtyForMale ? val?.orderQtyForMale : 0) + (val?.orderQtyForFemale ? val?.orderQtyForFemale : 0))
            })

            return newInwardDetails
        });

    }


    const isItemSelected = (sizeId, classItemData, sizeItem) => {


        let foundIndex = productionReceiptDetails?.filter(j => j.classId == classItemData?.classId)?.findIndex(item => (parseInt(item.sizeId) === parseInt(sizeId)))
        return foundIndex !== -1
    }


    const deleteItem = (sizeId, classItemdata, sizeItem) => {

        setProductionReceiptDetails(prev => {

            let obj = structuredClone(prev)
            let oldObj = obj?.filter(val => (parseInt(val.classId) !== parseInt(classItemdata?.classId)))
            let newObj = obj?.filter(val => (parseInt(val.classId) === parseInt(classItemdata?.classId)))
            newObj = newObj?.filter(val => parseInt(val?.sizeId) !== parseInt(sizeId))

            obj = [...oldObj, ...newObj]
            return obj

        })
    }


    const handleChangeInwardProgramDetails = (sizeId, classItemdata, sizeItem) => {
        if (isItemSelected(sizeId, classItemdata, sizeItem)) {
            deleteItem(sizeId, classItemdata, sizeItem)
        } else {
            const checkQty = (classItemdata?.sizeArray?.[valueIndex]?.maleInwardQty > 0 || classItemdata?.sizeArray?.[valueIndex]?.femaleInwardQty > 0);
            if (checkQty) {
                addItem(sizeId, classItemdata, sizeItem)
            }
            else {
                toast.info("Please fill Inward Qty", { position: 'top-center' })
                return
            }
        }
    }


    function checkItemIsSame(sizeItem) {

        if (sizeItem?.male?.length !== sizeItem?.female?.length) return []
        let commonArray = [];
        for (let i = 0; i < sizeItem?.male?.length; i++) {
            let maleObj = sizeItem?.male[i]
            let newObj = sizeItem?.female?.find(val => (val.isfeMaleItemId == maleObj?.isMaleItemId && val?.isFemaleColorId == maleObj?.isMaleColorId))


            if (newObj != null || newObj != undefined) {
                let combinedObj = {
                    cuttingQty: parseInt(maleObj?.cuttingQty + newObj?.cuttingQty),
                    orderQty: parseInt(maleObj?.orderQty + newObj?.orderQty),
                    readyQty: parseInt(maleObj?.readyQty + newObj?.readyQty),
                    itemId: parseInt(newObj?.isfeMaleItemId),
                    colorId: parseInt(newObj?.isFemaleColorId)
                }
                commonArray.push(combinedObj)
            }
            else {
                continue
            }


        }
        if (commonArray?.length == sizeItem?.male?.length) {
            return commonArray
        }
        else {
            return []
        }
    }


    return (
        <>

            <tr className="items-center" >

                <td className="border border-gray-500 text-xs text-center h-7">
                    <input type='checkbox' disabled={markRead && findReadOnly(classId, value?.sizeId)}
                        onChange={() => { handleChangeInwardProgramDetails(value?.sizeId, classItem, value) }}
                        checked={isItemSelected(value?.sizeId, classItem)} />
                </td>

                {
                    (checkItemIsSame(value))?.length > 0 ?
                        <>
                            <td className="border border-gray-500 text-xs">

                                <div className="grid grid-cols-8">

                                    <div className=' break-words border-r-2 overflow-wrap col-span-2'>

                                        {
                                            value?.male?.map((val, valIndex) => (
                                                findFromList(val?.isMaleItemId, itemList?.data, "name")
                                            )).join(",")
                                        }
                                    </div>
                                    <div className='break-words  border-r-2 col-span-2'>
                                        {
                                            value?.male?.map((val, valIndex) => (
                                                findFromList(val?.isMaleColorId, colorList?.data, "name")
                                            )).join(",")
                                        }
                                    </div>
                                    <div className='  border-r-2 text-right '>
                                        {value?.size}
                                    </div>
                                    <div className=' border-r-2 text-right '>
                                        {parseInt(value?.orderQtyForMale + value?.orderQtyForFemale) || 0}
                                    </div>
                                    <div className='  border-r-2 text-right '>

                                        {parseInt(value?.readyToInwardMaleSet) || 0}
                                    </div>

                                    <div className='w-[60px] border-r-2'>
                                        <input
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 px-1 w-[55px] h-full  table-data-input"

                                            value={(!value.totalInwardQty) ? 0 : value.totalInwardQty}

                                            onChange={(e) => {

                                                handleInputChange(e.target.value, index, valueIndex, classItem, value?.sizeId, "totalInwardQty", null, null, value?.orderQtyForMale, value?.orderQtyForFemale)
                                            }}
                                        />
                                    </div>
                                </div>
                            </td>



                            <td className=" text-xs text-center border border-gray-500">


                            </td>

                        </>

                        :
                        <>
                            <td className=" text-xs text-center border border-gray-500">
                                <div className="grid grid-cols-8">

                                    <div className=' break-words border-r-2 overflow-wrap col-span-2'>

                                        {
                                            value?.male?.map((val, valIndex) => (
                                                findFromList(val?.isMaleItemId, itemList?.data, "name")
                                            )).join(",")
                                        }
                                    </div>
                                    <div className='break-words  border-r-2 col-span-2'>
                                        {
                                            value?.male?.map((val, valIndex) => (
                                                findFromList(val?.isMaleColorId, colorList?.data, "name")
                                            )).join(",")
                                        }
                                    </div>
                                    <div className='  border-r-2 text-right '>
                                        {value?.size}
                                    </div>
                                    <div className=' border-r-2 text-right '>
                                        {value?.orderQtyForMale}
                                    </div>
                                    <div className='  border-r-2 text-right '>
                                        {value?.readyToInwardMaleSet || 0}

                                    </div>

                                    <div className='w-[60px] border-r-2'>
                                        <input
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 px-1 w-[55px] h-full table-data-input"

                                            value={(!value.maleInwardQty) ? 0 : value.maleInwardQty}

                                            onChange={(e) => {

                                                handleInputChange(e.target.value, index, valueIndex, classItem, value?.sizeId, "maleInwardQty", value?.readyToInwardFeMaleSet, value?.readyToInwardMaleSet)
                                            }}

                                        />
                                    </div>
                                </div>

                            </td>




                            <td className=" text-xs text-center border border-gray-500">
                                <div className="grid grid-cols-8 w-full">
                                    <div className=' break-words border-r-2 col-span-2'>

                                        {
                                            value?.female?.map((val, valIndex) => (
                                                findFromList(val?.isfeMaleItemId, itemList?.data, "name")
                                            )).join(",")
                                        }
                                    </div>
                                    <div className='break-words  border-r-2 col-span-2'>
                                        {
                                            value?.female?.map((val, valIndex) => (
                                                findFromList(val?.isFemaleColorId, colorList?.data, "name")
                                            )).join(",")
                                        }
                                    </div>

                                    <div className='  border-r-2 text-right '>
                                        {value?.size}
                                    </div>

                                    <div className=' border-r-2 text-right '>
                                        {value?.orderQtyForFemale}
                                    </div>
                                    <div className=' border-r-2 text-right '>
                                        {value?.readyToInwardFeMaleSet}

                                    </div>
                                    <div className='w-[60px]  border-r-2 text-right '>
                                        <input
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 px-1 w-[55px] h-full table-data-input"

                                            value={(!value.femaleInwardQty) ? 0 : value.femaleInwardQty}

                                            onChange={(e) => {

                                                handleInputChange(e.target.value, index, valueIndex, classItem, value?.sizeId, "femaleInwardQty", value?.readyToInwardFeMaleSet, value?.readyToInwardMaleSet)
                                            }}

                                        />
                                    </div>
                                </div>

                            </td>























                            {/* <td className="border border-gray-500 text-xs text-center h-7">{value?.size}</td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.orderQtyForMale}</td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.readyToInwardMaleSet || 0}</td>
                <td className="border border-gray-500 text-xs text-center h-7">
                    <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 px-1 w-full table-data-input"

                        value={(!value.maleInwardQty) ? 0 : value.maleInwardQty}

                        onChange={(e) => {

                            handleInputChange(e.target.value, index, valueIndex, classItem, value?.sizeId, "maleInwardQty", value?.readyToInwardFeMaleSet, value?.readyToInwardMaleSet)
                        }}

                    />

                </td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.orderQtyForFemale}</td>
                <td className="border border-gray-500 text-xs text-center h-7">{value?.readyToInwardFeMaleSet || 0}</td>
                <td className="border border-gray-500 text-xs text-center h-7">
                    <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 px-1 w-full table-data-input"

                        value={(!value.femaleInwardQty) ? 0 : value.femaleInwardQty}

                        onChange={(e) => {

                            handleInputChange(e.target.value, index, valueIndex, classItem, value?.sizeId, "femaleInwardQty", value?.readyToInwardFeMaleSet, value?.readyToInwardMaleSet)
                        }}

                    />

                </td> */}
                        </>
                }

            </tr>
        </>
    )
}

export default SizeArrayComponentForMixed

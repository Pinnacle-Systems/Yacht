import React, { useEffect, useRef, useState } from 'react';
import { findFromList, getCommonParams, substract } from '../../../Utils/helper';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import ClassHeading from './ClassHeading';
import { toast } from 'react-toastify';
import ProductionReceiptForIndividual from './ProductionReceiptForIndividual';
import ClassHeadingMixed from './ClassHeadingMixed';
import ProductionReceiptForIndividualForMixed from './ProductionReceiptForIndividualForMixed';

const ProductionDeliveryDetailsFillGridForMixed = ({ boxQty, setBoxQty, markRead, setMarkRead, boxCount, boxQtyIndividual, setBoxQtyIndividual, markReadIndividual, setMarkReadIndividual, boxCountIndividual, packingCategory, packingType, orderDetails, id, productionDeliveryDetailsFillData, setProductionDeliveryDetailsFillData, isPacking,
    productionReceiptDetails, setProductionReceiptDetails, onDone, prevProcessId, isIroning, productionDeliveryDetailsFillDataForIndividual, setProductionDeliveryDetailsFillDataForIndividual }) => {



    const { branchId, companyId, finYearId, userId } = getCommonParams()
    const params = {
        companyId
    };

    const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching } =
        useGetColorMasterQuery({ params });

    const addItem = (item) => {
        let maleItemData = [];
        let femaleItemData = [];

        setProductionReceiptDetails(prev => {
            let newInwardDetails = structuredClone(prev);
            item?.sizeArray.forEach(element => {
                maleItemData = element?.male?.filter(j => j.readyQty > 0)?.map(i => {
                    return {
                        ...i, colorId: i?.isMaleColorId, consumption: 0, itemId: i?.isMaleItemId,
                        sizeId: element?.sizeId,
                    }
                })


                femaleItemData = element?.female?.filter(j => j.readyQty > 0)?.map(i => {
                    return {
                        ...i, colorId: i?.isFemaleColorId, consumption: 0, itemId: i?.isfeMaleItemId,
                        sizeId: element?.sizeId,
                    }
                })

                let consumptionData = [...maleItemData, ...femaleItemData]


                newInwardDetails.push({

                    receivedQty: 0,
                    classId: item?.classId,
                    sizeId: element?.sizeId,
                    box: 0,
                    maleSet: element?.male,
                    femaleSet: element?.female,
                    isPackingOver: true,
                    size: element?.size,
                    className: item?.className,
                    maleInwardQty: element?.orderQtyForMale,
                    femaleInwardQty: element?.orderQtyForFemale,
                    orderQtyForMale: element?.orderQtyForMale,
                    orderQtyForFemale: element?.orderQtyForFemale,
                    readyToInwardFeMaleSet: element?.readyToInwardFeMaleSet,
                    readyToInwardMaleSet: element?.readyToInwardMaleSet,
                    productionConsumptionDetails: consumptionData,
                    totalInwardQty: parseInt((element?.orderQtyForMale ? element?.orderQtyForMale : 0) + (element?.orderQtyForFemale ? element?.orderQtyForFemale : 0))

                })

            })

            return newInwardDetails
        });

    }


    useEffect(() => {
        if (id) return
        const totalQty = productionReceiptDetails?.filter(va => va.box === 0 && va?.classId !== "")?.reduce((accumulation, currentValue) => {
            return (parseFloat(accumulation) + parseFloat(currentValue?.receivedQty ? currentValue?.receivedQty : (currentValue?.maleInwardQty + currentValue?.femaleInwardQty)))
        }, 0)
        setBoxQty(totalQty);


    }, [productionReceiptDetails])

    const deleteItem = (val) => {
        setProductionReceiptDetails(prev => {
            return prev.filter(item => parseInt(item.classId) !== parseInt(val?.classId))
        })
    }

    const isItemSelected = (sizeId, classId) => {

        let obj = productionReceiptDetails.filter(item => parseInt(item.classId) === parseInt(classId))
        let foundIndex = obj?.findIndex(item => parseInt(item.sizeId) === parseInt(sizeId))
        return foundIndex !== -1

    }

    function getBoxItems() {
        boxCount.current += 1;
        updateBoxNumber();

        setMarkRead(true)
    }

    function updateBoxNumber() {
        let newReceiptDetails = productionReceiptDetails?.map((item, iIndex) => {
            return {
                ...item, box: item?.box ? item?.box : parseInt(boxCount.current)
            }
        })

        setProductionReceiptDetails(newReceiptDetails)
        setBoxQty(0);
    }


    function handleSelectAllChange(value, item) {

        const checkQty = item?.sizeArray?.every((item => item.maleInwardQty > 0 || item.femaleInwardQty > 0));

        if (value) {

            if (checkQty) {

                let obj = (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).find(val => val.classId == item.classId)
                addItem(obj)
            }
            else {
                toast.info("Please fill Inward Qty", { position: 'top-center' })
                return
            }

        } else {
            let obj = (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).find(val => val.classId == item.classId)
            deleteItem(obj)
        }

    }

    function getSelectAll(classId, item) {

        return (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : [])?.find(j => j.classId == classId)?.sizeArray?.every(item => isItemSelected(item?.sizeId, classId))
    }

    function findReadOnly(classdataId, sizedataId) {

        let findItemIndex = productionReceiptDetails?.findIndex(val => val?.classId == classdataId && val?.sizeId == sizedataId && val?.box !== 0)

        if (findItemIndex === -1) {
            return false
        }
        else {
            return true
        }

    }

    function findReadOnlyAll(classdataId) {

        let findItemIndex = productionReceiptDetails?.findIndex(val => val?.classId == classdataId && val?.box !== 0)

        if (findItemIndex === -1) {
            return false
        }
        else {
            return true
        }


    }

    return (
        <>{console.log(productionDeliveryDetailsFillData, "productionDeliveryDetailsFillData")}
            <div className={`h-[600px] overflow-auto`}>
                <div className='grid grid-cols-8 mb-2'>
                    <div className='col-span-3'>
                        <h1 className='text-center mx-auto font-bold'>Packing Mixed- Set/Classwise</h1>
                    </div>

                    <div>

                        Total Box Qty : {boxQty}
                    </div>

                    <div className='flex gap-x-5 col-span-3'>
                        <button className=' w-20 text-center font-bold bg-violet-500 text-gray-100 p-1 rounded-lg' onClick={() => getBoxItems()}>Box</button>
                        <span className='mt-1'>
                            NextBox :{boxCount.current + 1}
                        </span>

                    </div>
                    <div className=''>
                        <button className='  w-20 text-center font-bold bg-green-500 text-gray-100 p-1 rounded-lg' onClick={onDone}>DONE</button>
                    </div>
                </div>

                <table className=" text-xs table-fixed w-full m-auto">
                    <thead className='bg-gray-300 top-0'>
                        <tr>
                            <th className="border border-gray-500 text-sm p-1 w-16"></th>
                            <th className="border border-gray-500 text-sm w-1/2">
                                <div className="flex flex-col gap-y-1">
                                    <span className="border-b-4">
                                        Male
                                    </span>
                                    <div className="grid grid-cols-8 w-full">
                                        <span className="border-r-2 overflow-auto col-span-2">
                                            Item
                                        </span>
                                        <span className="border-r-2 overflow-auto col-span-2">
                                            Color
                                        </span>
                                        <span className="border-r-2 ">
                                            Size
                                        </span>
                                        <span className="border-r-2 ">
                                            O.Qty
                                        </span>
                                        <span className="border-r-2 ">
                                            R.To.In
                                        </span>
                                        <span className="border-r-2 ">
                                            In.Qty
                                        </span>
                                    </div>
                                </div>
                            </th>
                            <th className="border border-gray-500 text-sm w-1/2">
                                <div className="flex flex-col gap-y-1">
                                    <span className="border-b-4">
                                        FeMale
                                    </span>
                                    <div className="grid grid-cols-8 w-full">
                                        <span className="border-r-2  overflow-auto col-span-2">
                                            Item
                                        </span>
                                        <span className="border-r-2 overflow-auto col-span-2">
                                            Color
                                        </span>
                                        <span className="border-r-2 ">
                                            Size
                                        </span>
                                        <span className="border-r-2 ">
                                            O.Qty
                                        </span>
                                        <span className="border-r-2 ">
                                            R.To.In
                                        </span>
                                        <span className="border-r-2 ">
                                            In.Qty
                                        </span>
                                    </div>
                                </div>
                            </th>

                        </tr>
                    </thead>
                    <tbody>
                        {(productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).map((item, index) =>
                            <ClassHeadingMixed id={id} markRead={markRead} findReadOnly={findReadOnly} findReadOnlyAll={findReadOnlyAll} productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                                setProductionDeliveryDetailsFillData={setProductionDeliveryDetailsFillData} key={item?.classId} index={index} setProductionReceiptDetails={setProductionReceiptDetails}
                                item={item} handleSelectAllChange={handleSelectAllChange} getSelectAll={getSelectAll}
                                productionReceiptDetails={productionReceiptDetails} isItemSelected={isItemSelected}
                            />
                        )}
                    </tbody>
                </table>


                <div className='mt-10'>
                    <ProductionReceiptForIndividualForMixed
                        boxQtyIndividual={boxQtyIndividual}
                        setBoxQtyIndividual={setBoxQtyIndividual}
                        markReadIndividual={markReadIndividual}
                        setMarkReadIndividual={setMarkReadIndividual}
                        boxCount={boxCount}

                        classArray={productionDeliveryDetailsFillData}

                        packingCategory={packingCategory}
                        packingType={packingType}
                        orderDetails={orderDetails}
                        prevProcessId={prevProcessId}
                        isIroning={isIroning}
                        productionReceiptDetails={productionReceiptDetails}
                        setProductionReceiptDetails={setProductionReceiptDetails}
                        productionDeliveryDetailsFillData={productionDeliveryDetailsFillDataForIndividual}
                        setProductionDeliveryDetailsFillData={setProductionDeliveryDetailsFillDataForIndividual}
                        onDone={onDone}

                    />

                </div>


            </div>
        </>

    )
}

export default ProductionDeliveryDetailsFillGridForMixed
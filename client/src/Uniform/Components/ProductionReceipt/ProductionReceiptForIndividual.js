import React, { useEffect, useState } from 'react';
import { findFromList, getCommonParams, substract } from '../../../Utils/helper';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import ClassHeading from './ClassHeading';
import { toast } from 'react-toastify';
import SizeHeading from './SizeHeading';

const ProductionReceiptForIndividual = ({ boxQty, setBoxQty, markRead, setMarkRead, boxCount, packingCategory, packingType, orderDetails, id, productionDeliveryDetailsFillData, setProductionDeliveryDetailsFillData, isPacking,
    productionReceiptDetails, setProductionReceiptDetails, onDone }) => {
    // const [boxCount, setBoxCount] = useState(0);
    // const [boxQty, setBoxQty] = useState(0);
    const { branchId, companyId, finYearId, userId } = getCommonParams()
    const params = {
        companyId
    };

    const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching } =
        useGetColorMasterQuery({ params });

    const addItem = (item) => {

        setProductionReceiptDetails(prev => {
            let newInwardDetails = structuredClone(prev);
            item?.itemArray.forEach(element => {

                newInwardDetails.push({
                    receivedQty: element?.receivedQty,
                    alreadyReceivedQty: element?.alreadyReceivedQty,
                    sizeId: item?.sizeId,
                    itemId: element?.itemId,
                    colorId: element?.colorId,
                    box: 0,
                    size: item?.sizeName,
                    orderQty: element?.orderQty,
                    readyQty: element?.readyQty,
                    isPackingOver: true,
                    productionConsumptionDetails: [{
                        colorId: element?.colorId, consumption: element?.receivedQty, itemId: element?.itemId,
                        sizeId: element?.sizeId, isPackingOver: true,
                    }]

                })

            })

            return newInwardDetails
        });

    }


    useEffect(() => {
        if (id) return
        const totalQty = productionReceiptDetails?.filter(va => va.box === 0)?.reduce((accumulation, currentValue) => {
            return (parseFloat(accumulation) + parseFloat(currentValue?.receivedQty ? currentValue?.receivedQty : (currentValue?.maleInwardQty + currentValue?.femaleInwardQty)))
        }, 0)
        setBoxQty(totalQty);


    }, [productionReceiptDetails])


    const deleteItem = (val) => {
        setProductionReceiptDetails(prev => {
            return prev.filter(item => (parseInt(item.sizeId) !== parseInt(val?.sizeId)) && (parseInt(item.itemId) !== parseInt(val?.itemId)))
        })
    }

    const isItemSelected = (itemId, sizeId) => {

        let obj = productionReceiptDetails.filter(item => parseInt(item.sizeId) === parseInt(sizeId))
        let foundIndex = obj?.findIndex(item => parseInt(item.itemId) === parseInt(itemId))
        return foundIndex !== -1

    }


    function handleSelectAllChange(value, item) {

        const checkQty = item?.itemArray?.every((v => v.receivedQty > 0));

        if (value) {

            // if (checkQty) {

            let obj = (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).find(val => val.sizeId == item.sizeId)
            addItem(obj)
            // }
            // else {
            //     toast.info("Please fill Inward Qty", { position: 'top-center' })
            //     return
            // }

        } else {
            let obj = (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).find(val => val.sizeId == item.sizeId)
            deleteItem(obj)
        }



    }

    function getSelectAll(sizeId, item) {

        return (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : [])?.find(j => j.sizeId == sizeId)?.itemArray?.every(item => isItemSelected(item?.itemId, sizeId))
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

        setProductionReceiptDetails(newReceiptDetails);
        setBoxQty(0);
    }

    // function getBoxItems() {
    //     setBoxCount(prev => prev + 1)
    // }

    // useEffect(() => {
    //     let newReceiptDetails = productionReceiptDetails?.map((item, iIndex) => {
    //         return {
    //             ...item, box: item?.box ? item?.box : parseInt(boxCount)
    //         }
    //     })

    //     setProductionReceiptDetails(newReceiptDetails)
    // }, [boxCount])


    function findReadOnly(sizedataId, itemdataId) {

        let findItemIndex = productionReceiptDetails?.findIndex(val => val?.sizeId == sizedataId && val?.itemId == itemdataId && val?.box !== 0)

        if (findItemIndex === -1) {
            return false
        }
        else {
            return true
        }

    }

    function findReadOnlyAll(sizedataId) {

        let findItemIndex = productionReceiptDetails?.findIndex(val => val?.sizeId == sizedataId && val?.box !== 0)

        if (findItemIndex === -1) {
            return false
        }
        else {
            return true
        }


    }




    return (
        <>{console.log(productionDeliveryDetailsFillData, "productionDeliveryDetailsFillData")}
            <div className={`w-full h-[600px] overflow-auto`}>
                <div className='grid grid-cols-8 mb-2'>
                    <div className='col-span-3'>
                        <h1 className='text-center mx-auto font-bold'>Packing Individual- Individual/Sizewise</h1>
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
                            <th className="border border-gray-500 text-sm p-1 w-28">Item</th>
                            <th className="border border-gray-500 text-sm p-1 w-28">Color</th>
                            <th className="border border-gray-500 text-sm p-1 w-28">OrderQty</th>
                            <th className="border border-gray-500 text-sm p-1 w-28">Al.ReceivedQty</th>
                            <th className="border border-gray-500 text-sm p-1 w-28">ReadyQty</th>
                            <th className="border border-gray-500 text-sm p-1 w-28">ReceivedQty</th>

                        </tr>
                    </thead>
                    <tbody>
                        {(productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).map((item, index) =>
                            <SizeHeading markRead={markRead} findReadOnly={findReadOnly} findReadOnlyAll={findReadOnlyAll} productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                                setProductionDeliveryDetailsFillData={setProductionDeliveryDetailsFillData} key={item?.sizeId} index={index} setProductionReceiptDetails={setProductionReceiptDetails}
                                item={item} handleSelectAllChange={handleSelectAllChange} getSelectAll={getSelectAll}
                                productionReceiptDetails={productionReceiptDetails} isItemSelected={isItemSelected}
                            />
                        )}
                    </tbody>
                </table>
            </div>
        </>

    )
}

export default ProductionReceiptForIndividual
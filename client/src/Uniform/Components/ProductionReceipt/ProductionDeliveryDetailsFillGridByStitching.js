import React from 'react';
import { findFromList, getCommonParams, substract } from '../../../Utils/helper';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';

const ProductionDeliveryDetailsFillGridByStitching = ({ orderDetails, id, productionDeliveryDetailsFillData, setProductionDeliveryDetailsFillData, isPacking,
    productionReceiptDetails, setProductionReceiptDetails, onDone }) => {


    const { branchId, companyId, finYearId, userId } = getCommonParams()
    const params = {
        companyId
    };

    const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching } =
        useGetColorMasterQuery({ params });

    const addItem = (item) => {



        let orderItemPanelData = [];
        let malePanelProcess = orderDetails?.find(val => val.itemTypeId == item?.itemTypeId)?.orderDetailsSubGrid?.find(i => i.isMaleItemId == item?.itemId)?.malePanelProcess
        let femalePanelProcess = orderDetails?.find(val => val.itemTypeId == item?.itemTypeId)?.orderDetailsSubGrid?.find(i => i.isFemaleItemId == item?.itemId)?.feMalePanelProcess
        if (malePanelProcess?.length > 0) {
            orderItemPanelData = malePanelProcess?.map(i => {
                return {
                    ...i, panelId: i.panelId, colorId: i?.colorId, consumption: 0, itemId: item?.itemId, productionDeliveryDetailsId: item?.id, itemTypeId: item?.itemTypeId,
                    sizeId: item?.sizeId,
                }
            })
        }
        else {
            orderItemPanelData = femalePanelProcess?.map(i => {
                return {
                    ...i, panelId: i.panelId, colorId: i?.colorId, consumption: 0, itemId: item?.itemId, productionDeliveryDetailsId: item?.id, itemTypeId: item?.itemTypeId,
                    sizeId: item?.sizeId,
                }
            })
        }



        setProductionReceiptDetails(prev => {
            let newInwardDetails = structuredClone(prev);
            newInwardDetails.push({
                productionDeliveryDetailsId: item?.id,
                receivedQty: parseFloat(substract(item.cuttingQty, item?.alreadyReceivedQty ? item?.alreadyReceivedQty : 0)).toFixed(3) || 0,
                itemId: item?.itemId, itemTypeId: item?.itemTypeId,
                colorId: item?.colorId, sizeId: item?.sizeId, panelId: item?.panelId, processCost: item?.processcost,
                cuttingQty: item?.cuttingQty, readyQty: item?.readyQty, alreadyReceivedQty: item?.alreadyReceivedQty,
                productionConsumptionDetails: orderItemPanelData
                // productionConsumptionDetails: [{
                //     consumption: 0, itemId: item?.itemId, productionDeliveryDetailsId: item?.id, itemTypeId: item?.itemTypeId,
                //     colorId: "", sizeId: item?.sizeId, panelId: ""
                // }]
            })
            return newInwardDetails
        })
    }
    const deleteItem = (val) => {


        setProductionReceiptDetails(prev => {
            return prev.filter(item => (parseInt(item.itemId) !== parseInt(val?.itemId) && parseInt(item.sizeId) !== parseInt(val?.sizeId)))
        })
    }

    const isItemSelected = (val) => {

        let foundIndex = productionReceiptDetails.findIndex(item => (parseInt(item.itemId) === parseInt(val?.itemId) && parseInt(item.sizeId) === parseInt(val?.sizeId)))
        return foundIndex !== -1
    }

    function handleSelectAllChange(value) {
        if (value) {
            (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).forEach(item => addItem(item))
        } else {
            (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).forEach(item => deleteItem(item))
        }
    }

    function getSelectAll() {
        return (productionDeliveryDetailsFillData ? productionDeliveryDetailsFillData : []).every(item => isItemSelected(item))
    }

    const handleChangeInwardProgramDetails = (item, processCost) => {
        if (isItemSelected(item)) {
            deleteItem(item)
        } else {
            addItem(item, processCost)
        }
    }



    return (
        <>
            <div className={`w-full h-[500px] overflow-auto`}>
                <div className='flex justify-between mb-2'>
                    <h1 className='text-center mx-auto font-bold'>Production Inward Details Stitching Completed</h1>
                    <button className='text-center font-bold bg-green-500 text-gray-100 p-1 rounded-lg' onClick={onDone}>DONE</button>
                </div>
                <table className=" text-xs table-fixed w-full">
                    <thead className='bg-gray-300 top-0'>
                        <tr>
                            <th className='w-16 p-2'>
                                Mark All
                                <input type="checkbox" className='w-full' onChange={(e) => handleSelectAllChange(e.target.checked)}
                                    checked={getSelectAll()}
                                />
                            </th>
                            <th className="table-data w-10 text-center">S.no</th>
                            <th className="table-data w-48">Item</th>

                            <th className="table-data w-48">Colors</th>
                            <th className="table-data w-32">Size</th>
                            <th className="table-data w-20">Cut.Qty</th>

                            <th className="table-data  w-16">A. Inward Qty<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">ReadyToInward<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">BalanceQty<span className="text-red-500">*</span></th>
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>{console.log(productionDeliveryDetailsFillData, "productionDeliveryDetailsFillData")}

                        {productionDeliveryDetailsFillData?.map((row, index) => (
                            <tr key={index} className="w-full table-row" onClick={() => { handleChangeInwardProgramDetails(row, row.processCost) }} >
                                <td className="table-data flex justify-center ">
                                    <input type='checkbox' checked={isItemSelected(row)} />
                                </td>
                                <td className="table-data  ">
                                    {index + 1}
                                </td>
                                <td className='table-data'>
                                    {row?.itemName}
                                </td>
                                <td className='table-data'>
                                    {findFromList(row?.colorId, colorList?.data, "name")}
                                </td>
                                <td className='table-data'>
                                    {row?.sizeName}
                                </td>

                                <td className='table-data text-right'>
                                    {parseFloat(row?.cuttingQty).toFixed(3) || 0}
                                </td>
                                <td className='text-right table-data'>
                                    {row?.alreadyReceivedQty || 0}
                                </td>
                                <td className='text-right table-data'>
                                    {row?.readyQty || 0}

                                </td>
                                <td className='text-right table-data'>

                                    {substract(row.cuttingQty, row?.alreadyReceivedQty ? row?.alreadyReceivedQty : 0).toFixed(3) || 0}
                                </td>
                            </tr>
                        ))}
                        {Array.from({ length: 5 - productionDeliveryDetailsFillData?.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                <td className='table-data'>
                                </td>
                                {!isPacking &&
                                    <td className="table-data   "></td>
                                }
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                {/* <td className="table-data   "></td>
                                <td className="table-data   "></td> */}
                                <td className="table-data  "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </>

    )
}

export default ProductionDeliveryDetailsFillGridByStitching
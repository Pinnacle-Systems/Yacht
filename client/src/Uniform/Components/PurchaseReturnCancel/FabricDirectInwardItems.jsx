import React from 'react';
import FabricPoItem from './FabricPoItem';
import { toast } from 'react-toastify';
import { sumArray } from '../../../Utils/helper';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import FabricDirectItem from './FabricDirectItem';


const FabricDirectInwardItems = ({ inwardItems, setInwardItems, readOnly, removeItem, purchaseInwardId, params, storeId }) => {


    const { data: fabricList } =
        useGetFabricMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params } });


    const { data: uomList } =
        useGetUomQuery({ params });

    const { data: gaugeList } =
        useGetGaugeQuery({ params });

    const { data: designList } =
        useGetdesignQuery({ params });

    const { data: gsmList } =
        useGetgsmQuery({ params });

    const { data: loopLengthList } =
        useGetLoopLengthQuery({ params });

    const { data: diaList } =
        useGetDiaQuery({ params });

    function findStockQty(stockDatas) {
        let qty = stockDatas.reduce((total, current) => {
            return total + parseFloat(current?._sum?.qty)
        }, 0)
        return qty || 0
    }
    function findStockRolls(stockDatas) {
        let noOfRolls = stockDatas.reduce((total, current) => {
            return total + parseInt(current?._sum?.noOfRolls)
        }, 0)
        return noOfRolls || 0
    }


    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        const newBlend = structuredClone(inwardItems);
        newBlend[index][field] = value
        newBlend[index]["poNo"] = poItem?.DirectInwardOrReturn?.docId
        newBlend[index]["fabricId"] = poItem?.fabricId
        newBlend[index]["colorId"] = poItem?.colorId
        newBlend[index]["gaugeId"] = poItem?.gaugeId
        newBlend[index]["gsmId"] = poItem?.gsmId
        newBlend[index]["fDiaId"] = poItem?.fDiaId
        newBlend[index]["designId"] = poItem?.designId
        newBlend[index]["discountAmount"] = poItem?.discountAmount
        newBlend[index]["discountType"] = poItem?.discountType
        newBlend[index]["kDiaId"] = poItem?.kDiaId
        newBlend[index]["loopLengthId"] = poItem?.loopLengthId
        newBlend[index]["poId"] = poItem?.poId
        newBlend[index]["price"] = poItem?.price
        newBlend[index]["taxPercent"] = poItem?.tax
        newBlend[index]["uomId"] = poItem?.uomId
        newBlend[index]["poQty"] = poItem?.qty
        // newBlend[index]["cancelQty"] = poItem?.alreadyCancelData?._sum?.qty ? parseFloat(poItem.alreadyCancelData?._sum?.qty).toFixed(3) : "0.000";
        newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedQty ? parseFloat(poItem.alreadyInwardedQty).toFixed(3) : "0.000";
        newBlend[index]["alreadyInwardedRolls"] = poItem?.alreadyInwardedRolls ? parseInt(poItem.alreadyInwardedRolls) : "0";
        newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedQty ? parseFloat(poItem.alreadyReturnedQty).toFixed(3) : "0.000";
        newBlend[index]["alreadyReturnedRolls"] = poItem?.alreadyReturnedData?._sum?.noOfRolls ? parseInt(poItem.alreadyReturnedData._sum.noOfRolls) : "0";
        newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";
        newBlend[index]["stockQty"] = parseFloat(poItem?.stockQty).toFixed(3)
        newBlend[index]["stockRolls"] = parseInt(poItem?.stockRolls)

        // newBlend[index]["stockQty"] = parseFloat(findStockQty(poItem?.stockData)).toFixed(3)
        // newBlend[index]["stockRolls"] = parseInt(findStockRolls(poItem?.stockData))

        newBlend[index]["allowedReturnRolls"] = poItem?.allowedReturnRolls
        newBlend[index]["allowedReturnQty"] = parseFloat(poItem?.allowedReturnQty).toFixed(3)
        if (field === "qty") {
            if (parseFloat(balanceQty) < parseFloat(value)) {
                toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                return
            }
        }
        setInwardItems(newBlend);
    };

    function handleInputChangeLotNo(value, index, lotIndex, field, stockQty, allowedReturnQty) {


        const balanceQty = Math.min(stockQty, allowedReturnQty);

        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]["returnLotDetails"]) return inwardItems
            if (field == "qty") {
                if (parseFloat(balanceQty) < parseFloat(value)) {
                    toast.info("Return Qty Can not be more than balance Qty", { position: 'top-center' })
                    return newBlend
                }
            }
            newBlend[index]["returnLotDetails"][lotIndex][field] = value;
            if (field == "noOfRolls") {
                let totalValue = newBlend[index]["returnLotDetails"].reduce((accumulator, currentValue) => accumulator + parseInt(currentValue?.noOfRolls), 0);
                newBlend[index][field] = totalValue;
            }
            if (field == "qty") {
                let totalValue = parseFloat(newBlend[index]["returnLotDetails"].reduce((accumulator, currentValue) => accumulator + parseFloat(currentValue?.qty), 0)).toFixed(3);
                newBlend[index][field] = totalValue;
            }
            return newBlend
        });
    }
    function addNewLotNo(index) {
        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]) return inwardItems
            if (newBlend[index]["returnLotDetails"]) {
                newBlend[index]["returnLotDetails"] = [
                    ...newBlend[index]["returnLotDetails"],
                    { lotNo: "", qty: "0.000", noOfRolls: 0 }]
            } else {
                newBlend[index]["returnLotDetails"] = [{ lotNo: "", qty: "0.000", noOfRolls: 0 }]
            }
            return newBlend
        })
    }
    function removeLotNo(index, lotIndex) {
        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]["returnLotDetails"]) return inwardItems
            newBlend[index]["returnLotDetails"] = newBlend[index]["returnLotDetails"].filter((_, index) => index != lotIndex)
            return newBlend
        })
    }

    return (
        <>
            <div className={`relative w-full overflow-y-auto py-1`}>
                <table className="table-data text-xs table-auto border border-gray-500  w-full">
                    <thead className='bg-blue-200 border border-gray-500 top-0'>
                        <tr className='h-8'>
                            <th className='text-center w-8 table-data '>
                                S.no
                            </th>
                            <th className='text-center w-24 table-data'>
                                DI.no
                            </th>
                            <th className='w-24 table-data'>
                                Fabric Name
                            </th>
                            <th className='w-16 table-data'>
                                Color
                            </th>
                            <th className='w-16 table-data'>
                                Design
                            </th>
                            <th className='w-12 table-data'>
                                Gauge
                            </th>
                            <th className='w-12 table-data'>
                                LL
                            </th>
                            <th className='w-12 table-data'>
                                Gsm
                            </th>
                            <th className='w-12 table-data'>
                                K-Dia
                            </th>
                            <th className='w-12 table-data'>
                                F-Dia
                            </th>
                            <th className='w-12 table-data'>
                                Uom
                            </th>
                            {/* <th className='w-12 table-data'>
                                Stock Rolls
                            </th> */}
                            <th className='w-12 table-data'>
                                Stock qty
                            </th>
                            <th className='table-data'>
                                A. Inwarded Rolls
                            </th>
                            <th className='table-data'>
                                A. Inwarded qty
                            </th>
                            <th className="table-data w-14">
                                A. Return Rolls
                            </th>
                            <th className="table-data w-14">
                                A. Return Qty
                            </th>
                            {/* <th className='table-data'>
                                Allowed Return Rolls
                            </th> */}
                            <th className='table-data'>
                                Allowed Return Qty
                            </th>
                            <th className="table-data  w-10">Lot Det.<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">No. of Rolls<span className="text-red-500">*</span></th>
                            <th className='table-data w-16'>
                                Return Qty
                            </th>
                            <th className='w-12 table-data'>
                                Price
                            </th>
                            <th className='w-16 table-data'>
                                Gross
                            </th>
                            {!readOnly &&
                                <th className='table-data table-data w-12'>Delete</th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>
                        {inwardItems.map((item, index) => <FabricDirectItem
                            fabricList={fabricList} uomList={uomList} storeId={storeId}
                            colorList={colorList} gaugeList={gaugeList} designList={designList} gsmList={gsmList}
                            loopLengthList={loopLengthList}
                            diaList={diaList}
                            item={item} handleInputChangeLotNo={handleInputChangeLotNo} stockId={item.stockId} noOfRolls={item.noOfRolls} removeItem={removeItem} key={item.poItemsId}
                            qty={item.qty} poItemId={item.poItemsId} index={index} handleInputChange={handleInputChange} purchaseInwardId={purchaseInwardId} readOnly={readOnly} />)}
                        {Array.from({ length: 8 - inwardItems.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                <td className='table-data'>
                                </td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>


                                <td className="table-data   "></td>
                                <td className="table-data    "></td>
                                <td className="table-data    "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                {!readOnly &&
                                    <td className="table-data w-10"></td>
                                }
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default FabricDirectInwardItems
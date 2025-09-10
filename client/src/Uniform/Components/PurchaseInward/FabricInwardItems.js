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


const FabricInwardItems = ({ inwardItems, setInwardItems, readOnly, removeItem, purchaseInwardId, params }) => {


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




    const handleInputChange = (value, index, field, balanceQty, poItem = undefined) => {
        const newBlend = structuredClone(inwardItems);
        newBlend[index][field] = value
        // newBlend[index]["poNo"] = poItem?.Po?.docId
        // newBlend[index]["fabricId"] = poItem?.fabricId
        // newBlend[index]["colorId"] = poItem?.colorId
        // newBlend[index]["gaugeId"] = poItem?.gaugeId
        // newBlend[index]["gsmId"] = poItem?.gsmId
        // newBlend[index]["fDiaId"] = poItem?.fDiaId
        // newBlend[index]["designId"] = poItem?.designId
        // newBlend[index]["discountAmount"] = poItem?.discountAmount
        // newBlend[index]["discountType"] = poItem?.discountType
        // newBlend[index]["kDiaId"] = poItem?.kDiaId
        // newBlend[index]["loopLengthId"] = poItem?.loopLengthId
        // newBlend[index]["poId"] = poItem?.poId
        // newBlend[index]["price"] = poItem?.price
        // newBlend[index]["taxPercent"] = poItem?.tax
        // newBlend[index]["uomId"] = poItem?.uomId
        // newBlend[index]["poQty"] = poItem?.qty
        // newBlend[index]["cancelQty"] = poItem?.alreadyCancelData?._sum?.qty ? parseFloat(poItem.alreadyCancelData?._sum?.qty).toFixed(3) : "0.000";
        // newBlend[index]["alreadyInwardedQty"] = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
        // newBlend[index]["alreadyReturnedQty"] = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
        // newBlend[index]["balanceQty"] = poItem?.balanceQty ? parseFloat(poItem.balanceQty).toFixed(3) : "0.000";

        if (field === "qty") {
            if (parseFloat(balanceQty) < parseFloat(value)) {
                toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                return
            }
        }
        setInwardItems(newBlend);
    };

    function findBalanceQty(balanceQty) {

        let balanceNos = parseFloat(balanceQty) * parseFloat(0.10)
        balanceNos = Math.round(balanceNos)
        return parseInt(parseInt(balanceNos) + parseInt(balanceQty))
    }

    function handleInputChangeLotNo(value, index, lotIndex, field, balanceQty) {
        let allowedBalance = findBalanceQty(balanceQty)
        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]["inwardLotDetails"]) return inwardItems
            if (field == "qty") {
                if (parseFloat(allowedBalance) < parseFloat(value)) {
                    toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                    allowedBalance = 0
                    return newBlend
                }
            }
            newBlend[index]["inwardLotDetails"][lotIndex][field] = value;
            if (field == "noOfRolls") {
                let totalValue = newBlend[index]["inwardLotDetails"].reduce((accumulator, currentValue) => accumulator + parseInt(currentValue?.noOfRolls), 0);
                newBlend[index][field] = totalValue;
            }
            if (field == "qty") {

                let totalValue = parseFloat(newBlend[index]["inwardLotDetails"].reduce((accumulator, currentValue) => accumulator + parseFloat(currentValue?.qty), 0)).toFixed(3);
                newBlend[index][field] = totalValue;
            }
            return newBlend
        });
    }
    function addNewLotNo(index) {
        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]) return inwardItems
            if (newBlend[index]["inwardLotDetails"]) {
                newBlend[index]["inwardLotDetails"] = [
                    ...newBlend[index]["inwardLotDetails"],
                    { lotNo: "", qty: "0.000", noOfRolls: 0 }]
            } else {
                newBlend[index]["inwardLotDetails"] = [{ lotNo: "", qty: "0.000", noOfRolls: 0 }]
            }
            return newBlend
        })
    }
    function removeLotNo(index, lotIndex) {
        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            if (!newBlend[index]["inwardLotDetails"]) return inwardItems
            newBlend[index]["inwardLotDetails"] = newBlend[index]["inwardLotDetails"].filter((_, index) => index != lotIndex)
            return newBlend
        })
    }

    return (
        <>
            <div className={`relative w-full overflow-y-auto py-1 h-[90%]`}>
                <table className="table-data text-xs table-auto border border-gray-500  w-full">
                    <thead className='bg-gray-300 border border-gray-500 top-0'>
                        <tr className='h-8'>
                            <th className='text-center w-8 table-data '>
                                S.no
                            </th>
                            <th className='text-center w-20 table-data'>
                                Po.no
                            </th>
                            <th className='w-32 table-data'>
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
                            <th className="table-data w-10">Po. Qty</th>
                            <th className="table-data  w-10"> Can. Qty</th>
                            <th className="table-data  w-10"> A. In Qty</th>
                            <th className="table-data  w-10"> A. Return Qty</th>
                            <th className="table-data  w-10">Bal. Qty</th>
                            <th className="table-data  w-10">Lot Det.<span className="text-red-500">*</span></th>
                            <th className="table-data  w-10">No. Rolls</th>
                            <th className="table-data  w-10">In. Qty</th>
                            <th className="table-data  w-10">Po Price</th>
                            <th className="table-data  w-10">Gross</th>
                            {!readOnly &&
                                <th className='table-data table-data w-12'>Delete</th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>{console.log(inwardItems, "inwardItems")}
                        {(inwardItems || [])?.map((item, index) => <FabricPoItem fabricList={fabricList} uomList={uomList}
                            colorList={colorList} gaugeList={gaugeList} designList={designList} gsmList={gsmList}
                            loopLengthList={loopLengthList}
                            diaList={diaList}
                            removeLotNo={removeLotNo} addNewLotNo={addNewLotNo} handleInputChangeLotNo={handleInputChangeLotNo}
                            removeItem={removeItem} key={item.poItemsId}
                            item={item} index={index} handleInputChange={handleInputChange}
                            purchaseInwardId={purchaseInwardId} readOnly={readOnly} />)}
                        {Array.from({ length: 8 - inwardItems?.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                {Array.from({ length: 21 }).map(i =>
                                    <td className="table-data   "></td>
                                )}
                                {!readOnly &&
                                    <td className="table-data w-10"></td>
                                }
                            </tr>)
                        }
                    </tbody>
                </table>
            </div >
        </>
    )
}

export default FabricInwardItems
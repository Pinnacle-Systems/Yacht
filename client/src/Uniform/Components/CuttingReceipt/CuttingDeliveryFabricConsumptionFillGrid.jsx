import React from 'react';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUnitOfMeasurementMasterQuery } from '../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { findFromList, substract } from '../../../Utils/helper';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';

const CuttingDeliveryFabricConsumptionFillGrid = ({ id, cuttingReceiptFabricConsumptionFillData, setCuttingReceiptFabricConsumptionFillData, readOnly,
    cuttingReceiptFabricConsumptionDetails, setCuttingReceiptFabricConsumptionDetails, onDone }) => {
    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const addItem = (id, item) => {
        setCuttingReceiptFabricConsumptionDetails(prev => {
            let newInwardDetails = structuredClone(prev);
            newInwardDetails.push({
                cuttingDeliveryDetailsId: id, consumption: 0,
                lossDetails: [{ lossReasonId: "", lossQty: "" }],
                docId: item?.docId, colorId: item?.colorId,
                designId: item?.designId, gaugeId: item?.gaugeId, loopLengthId: item?.loopLengthId,
                gsmId: item?.gsmId, fDiaId: item?.fDiaId, kDiaId: item?.kDiaId, uomId: item?.uomId,
                delQty: item?.delQty, fabricId: item?.fabricId, alreadyUsedQty: item?.alreadyUsedQty
            })
            return newInwardDetails
        })
    }
    const deleteItem = (id) => {
        setCuttingReceiptFabricConsumptionDetails(prev => {
            return prev.filter(item => parseInt(item.cuttingDeliveryDetailsId) !== parseInt(id))
        })
    }


    const isItemSelected = (id) => {
        let foundIndex = cuttingReceiptFabricConsumptionDetails.findIndex(item => parseInt(item.cuttingDeliveryDetailsId) === parseInt(id))
        return foundIndex !== -1
    }

    const handleChangeInwardProgramDetails = (id, item) => {
        if (isItemSelected(id)) {
            deleteItem(id)
        } else {
            addItem(id, item)
        }
    }

    return (
        <>
            <div className={`w-full h-[95%] overflow-y-auto`}>
                <div className='flex justify-between mb-2'>
                    <h1 className='text-center mx-auto font-bold'>Cutting Delivery Items</h1>
                    <button className='text-center font-bold bg-blue-400 text-gray-100 p-1 rounded-lg' onClick={onDone}>DONE</button>
                </div>
                <table className=" text-xs table-fixed w-full">
                    <thead className='bg-blue-200 top-0'>
                        <tr>
                            <th className="table-data w-10"></th>
                            <th className="table-data w-10">S.no</th>
                            <th className="table-data  w-32">Doc Id<span className="text-red-500">*</span></th>
                            <th className="table-data  w-32">Fabric<span className="text-red-500">*</span></th>
                            <th className="table-data  w-32">Color<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">Design<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">Gauge<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">LL<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">GSM<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">K Dia<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">F Dia<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">UOM<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">Del. Qty<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">A. Used Qty<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">Bal. Qty<span className="text-red-500">*</span></th>
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>{console.log(cuttingReceiptFabricConsumptionFillData, "cuttingReceiptFabricConsumptionFillData")}
                        {cuttingReceiptFabricConsumptionFillData.filter((row) => substract(row.delQty, row?.alreadyUsedQty ? row?.alreadyUsedQty : 0) > 0).map((row, index) => {
                            return <tr key={index} className="w-full table-row" onClick={() => { handleChangeInwardProgramDetails(row.id, row) }} >
                                <td className="table-data  text-center p-0.5">
                                    <input type='checkbox' checked={isItemSelected(row.id)} />
                                </td>
                                <td className="table-data  ">
                                    {index + 1}
                                </td>
                                <td className='text-left px-1 table-data shadow-xl '>
                                    {row.docId}
                                </td>
                                <td className='text-left px-1 table-data shadow-xl'>
                                    {row.Fabric.name}
                                </td>
                                <td className='text-left  table-data shadow-xl'>
                                    {row.Color.name}
                                </td>
                                <td className='text-left px-1 table-data shadow-xl'>
                                    {row.Design.name}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {row.Gauge.name}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {row.LoopLength.name}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {row.Gsm.name}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {row.KDia.name}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {row.FDia.name}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {row.Uom.name}
                                </td>
                                <td className='table-data text-right'>
                                    {(row.delQty) ? row.delQty : 0}
                                </td>
                                <td className='text-right table-data'>
                                    {row.alreadyUsedQty}
                                </td>
                                <td className='text-right table-data'>
                                    {substract(row.delQty, row?.alreadyUsedQty ? row?.alreadyUsedQty : 0).toFixed(3)}
                                </td>
                            </tr>
                        }
                        )}
                        {Array.from({ length: 5 - cuttingReceiptFabricConsumptionFillData.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                                <td className='table-data'>
                                </td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data  "></td>
                                <td className="table-data    "></td>
                                <td className="table-data    "></td>
                                <td className="table-data    "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
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

export default CuttingDeliveryFabricConsumptionFillGrid
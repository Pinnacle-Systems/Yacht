import React, { useState } from 'react'

import Modal from '../../../UiComponents/Modal';
import LossReasonBreakup from './LossReasonBreakup';

import FabricConsumptionItem from './FabricConsumptionItem';
import { DELETE, PLUS } from '../../../icons';


const FabricConsumptionDetails = ({ id, cuttingOrderId, cuttingReceiptFabricConsumptionDetails,
    setCuttingReceiptFabricConsumptionDetails,
    cuttingReceiptFabricConsumptionFillData,
    readOnly, setFillGrid }) => {
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")

    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(cuttingReceiptFabricConsumptionDetails);
        newBlend[index][field] = value;
        setCuttingReceiptFabricConsumptionDetails(newBlend);
    };


    return (
        <>
            <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                <LossReasonBreakup setCurrentSelectedIndex={setCurrentSelectedIndex} currentIndex={currentSelectedIndex} readOnly={readOnly}
                    cuttingReceiptFabricConsumption={cuttingReceiptFabricConsumptionDetails}
                    cuttingReceiptFabricConsumptionFillData={cuttingReceiptFabricConsumptionFillData}
                    setCuttingReceiptFabricConsumption={setCuttingReceiptFabricConsumptionDetails} />
            </Modal>
            <div className={`relative w-full overflow-y-auto py-1 h-[200px] overflow-auto`}>
                <table className="border border-gray-500 text-xs table-auto w-full">
                    <thead className='bg-blue-200 top-0'>
                        <tr className='h-8'>
                            <th className=' table-data '>
                                S.no
                            </th>
                            <th className=' table-data w-28'>
                                Del Dc.no
                            </th>
                            <th className='table-data w-60'>
                                Fabric Name
                            </th>
                            <th className=' table-data w-20'>
                                Color
                            </th>
                            <th className='table-data w-20'>
                                Design
                            </th>
                            <th className='table-data w-20'>
                                Gauge
                            </th>
                            <th className='table-data w-12'>
                                LL
                            </th>
                            <th className='table-data w-12'>
                                Gsm
                            </th>
                            <th className='table-data w-12'>
                                K-Dia
                            </th>
                            <th className='table-data w-12'>
                                F-Dia
                            </th>
                            <th className='table-data w-12'>
                                Uom
                            </th>
                            <th className='table-data w-12'>
                                Del Qty
                            </th>
                            <th className='table-data'>
                                A.Cons.Qty
                            </th>
                            {/* <th className='table-data'>
                                A.Rtn.Qty
                            </th> */}
                            <th className="table-data w-16">
                                Bal Qty
                            </th>
                            <th className="table-data w-16">
                                Consumption Qty
                            </th>
                            <th className="table-data w-16">
                                Loss Qty
                            </th>
                            <th className="table-data w-20">Loss Reason</th>
                            {!readOnly &&
                                <th className="table-data  w-5 text-green-600" onClick={() => { setFillGrid(true) }}> {PLUS} </th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto border border-gray-600 h-full w-full'>{console.log(cuttingReceiptFabricConsumptionDetails, "cuttingReceiptFabricConsumptionDetails")}
                        {cuttingReceiptFabricConsumptionDetails.map((item, index) => (
                            <FabricConsumptionItem
                                cuttingReceiptFabricConsumptionDetails={cuttingReceiptFabricConsumptionDetails}
                                setCuttingReceiptFabricConsumptionDetails={setCuttingReceiptFabricConsumptionDetails}
                                cuttingReceiptFabricConsumptionFillData={cuttingReceiptFabricConsumptionFillData}
                                item={item} id={id} readOnly={readOnly} cuttingOrderId={cuttingOrderId} index={index}
                                setCurrentSelectedIndex={setCurrentSelectedIndex}
                                handleInputChange={handleInputChange} />
                        ))}
                        {Array.from({ length: 2 - cuttingReceiptFabricConsumptionDetails.length }).map(i =>
                            <tr className='w-full font-bold h-6 border-gray-400 border table-row'>
                                <td className='table-data'>
                                </td>
                                <td className="table-data"></td>
                                <td className="table-data"></td>
                                <td className="table-data"></td>
                                <td className="table-data"></td>
                                <td className="table-data"></td>
                                {/* <td className="table-data"></td> */}
                                <td className="table-data"></td>
                                <td className="table-data"></td>
                                <td className="table-data"></td>
                                <td className="table-data"></td>
                                <td className="table-data"></td>
                                <td className="table-data"></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>

                            </tr>)
                        }
                    </tbody>
                </table>
            </div >
        </>
    )
}

export default FabricConsumptionDetails
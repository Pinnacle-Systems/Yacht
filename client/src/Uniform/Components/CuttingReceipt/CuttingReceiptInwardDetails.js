import React from 'react'

import CuttingReceiptInwardDetailItem from './CuttingReceiptInwardDetailItem';
import { PLUS } from '../../../icons';

const CuttingReceiptInwardDetails = ({ id, readOnly, cuttingOrderId, cuttingReceiptInwardDetails, setCuttingReceiptInwardDetails, setFillGrid, cuttingReceiptInwardDetailsFillData }) => {

  return (
    <fieldset
      disabled={readOnly}
      className="frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border
                            border-gray-600 overflow-auto max-h-[180px]"
    >
      <legend className="sub-heading">Cutting Receipt Details</legend>
      <div className={`relative w-full overflow-y-auto p-1`}>
        <table className="table-data border border-gray-500 text-xs table-auto w-full">
          <thead className="bg-blue-200 border border-gray-500 top-0">
            <tr className="border border-gray-500">
              <th className="table-data w-2 text-center">S.no</th>
              <th className="table-data w-24">Item</th>
              <th className="table-data w-24">Color</th>
              <th className="table-data w-24">Panel</th>
              <th className="table-data w-24">PanelColor</th>
              <th className="table-data w-20">Size</th>
              {/* <th className="table-data w-20"> Uom</th> */}
              <th className="table-data w-20">Order Qty</th>
              <th className="table-data w-20">Cutting Qty</th>
              <th className="table-data w-20">Already Received Qty</th>
              <th className="table-data w-20">Bal To Rec Qty</th>
              {/* <th className="table-data w-20">Order Price</th> */}
              <th className="table-data w-20">Received Qty</th>
              {!readOnly &&
                <th className="table-data  w-5 text-green-600" onClick={() => { setFillGrid(true) }}> {PLUS} </th>
              }
            </tr>
          </thead>
          <tbody className="overflow-y-auto table-data h-full w-full">
            {cuttingReceiptInwardDetails.map((item, index) =>
              <CuttingReceiptInwardDetailItem readOnly={readOnly} cuttingReceiptInwardDetailsFillData={cuttingReceiptInwardDetailsFillData} item={item} index={index} cuttingOrderId={cuttingOrderId} cuttingReceiptInwardDetails={cuttingReceiptInwardDetails} setCuttingReceiptInwardDetails={setCuttingReceiptInwardDetails} />
            )
            }
            {Array.from({ length: 5 - cuttingReceiptInwardDetails.length }).map(i =>
              <tr key={i} className='w-full font-bold h-6 border-gray-400 border table-row'>
                <td className='table-data'> </td>
                {/* <td className="table-data   "></td> */}
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                {/* <td className="table-data   "></td> */}
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                {!readOnly &&
                  <td className="table-data   "></td>
                }
              </tr>)
            }
          </tbody>
        </table>
      </div>
    </fieldset>
  );
};

export default CuttingReceiptInwardDetails;

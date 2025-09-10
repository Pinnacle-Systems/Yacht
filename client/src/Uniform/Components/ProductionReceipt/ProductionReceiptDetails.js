import React, { useState } from 'react'

import ProductionReceiptDetailItem from './ProductionReceiptDetailItem';
import { PLUS } from '../../../icons';
import Modal from '../../../UiComponents/Modal';
import LossReasonBreakup from './LossReasonBreakup';

const ProductionReceiptDetails = ({ isIroning, id, readOnly,
  productionDeliveryId, productionReceiptDetails, setProductionReceiptDetails, setFillGrid, productionDeliveryDetailsFillData,
  isPacking, setProductionDeliveryDetailsFillGridByStitching, isStitching }) => {
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")



  return (
    <>
      <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
        <LossReasonBreakup setCurrentSelectedIndex={setCurrentSelectedIndex} currentIndex={currentSelectedIndex} readOnly={readOnly}
          productionReceiptDetails={productionReceiptDetails}
          productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
          setProductionReceiptDetails={setProductionReceiptDetails} />
      </Modal>
      <fieldset
        className="h-[330px] frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border
                            border-gray-600  "
      >
        <legend className="sub-heading">Production Receipt Details</legend>
        <div className={`relative w-full overflow-y-auto p-1 h-[320px] overflow-auto`}>
          <table className="table-data border border-gray-500 text-xs table-auto w-full">
            <thead className="bg-gray-300 border border-gray-500 top-0">
              <tr className="border border-gray-500">
                <th className="table-data w-2 text-center">S.no</th>

                <th className="table-data w-24">Item</th>
                {

                  (isStitching() || isIroning()) ?
                    <th className="table-data w-24">Color</th>
                    :

                    <>
                      <th className="table-data w-24">Panel</th>
                      <th className="table-data w-24">PanelColor</th>
                    </>


                }


                <th className="table-data w-16">Size</th>

                <th className="table-data w-16">{isStitching() ? "Cut.Qty" : "Del.Qty"}</th>
                <th className="table-data w-16">Already Received Qty</th>
                <th className="table-data w-16">Bal/R.To.Inward</th>
                <th className="table-data w-16">Received Qty</th>
                <th className="table-data w-16">Loss</th>
                <th className="table-data w-16">
                  Loss Qty
                </th>
                {!readOnly &&
                  <th className="table-data  w-5 text-green-600" onClick={() => {
                    if (isStitching()) {
                      setProductionDeliveryDetailsFillGridByStitching(true)
                    }
                    else {
                      setFillGrid(true)
                    }
                  }}> {PLUS} </th>
                }
              </tr>
            </thead>
            <tbody className="overflow-y-auto table-data h-full w-full">{console.log(productionReceiptDetails, "productionReceiptDetails")}
              {productionReceiptDetails.map((item, index) =>
                <ProductionReceiptDetailItem isStitching={isStitching} isIroning={isIroning} isPacking={isPacking} setCurrentSelectedIndex={setCurrentSelectedIndex} readOnly={readOnly} productionDeliveryDetailsFillData={productionDeliveryDetailsFillData} item={item} index={index} cuttingOrderId={productionDeliveryId} productionReceiptDetails={productionReceiptDetails} setProductionReceiptDetails={setProductionReceiptDetails} />
              )
              }
              {Array.from({ length: 5 - productionReceiptDetails.length }).map(i =>
                <tr key={i} className='w-full font-bold h-6 border-gray-400 border table-row overflow-y-auto'>
                  <td className='table-data'> </td>
                  {!isPacking &&
                    <td className="table-data   "></td>
                  }
                  <td className="table-data   "></td>
                  <td className="table-data   "></td>
                  <td className="table-data   "></td>
                  <td className="table-data   "></td>
                  {
                    !(isStitching() || !isIroning() || !isPacking()) &&
                    <>
                      <td className="table-data   "></td>

                    </>
                  }
                  <td className="table-data   "></td>
                  <td className="table-data   "></td>
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
      </fieldset >
    </>
  );
};

export default ProductionReceiptDetails;

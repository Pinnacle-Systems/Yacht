import React, { useEffect, useState } from 'react'

import ProductionReceiptDetailItem from './ProductionReceiptDetailItem';
import { PLUS } from '../../../icons';
import Modal from '../../../UiComponents/Modal';
import LossReasonBreakup from './LossReasonBreakup';
import ProductionReceiptDetailItemForPacking from './ProductionReceiptDetailItemForPacking';
import ProductionReceiptDetailItemForMixed from './ProductionReceiptDetailItemForMixed';

const ProductionReceiptDetailsForMixed = ({ groupData, setGroupData, packingCategory,
    packingType, isIroning, id, readOnly,
    productionDeliveryId, productionReceiptDetails, setProductionReceiptDetails, setFillGrid, productionDeliveryDetailsFillData,
    isPacking, setProductionDeliveryDetailsFillGridForPacking, isStitching }) => {
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")







    useEffect(() => {
        if (id) return
        if (productionReceiptDetails?.length == 0) return
        const groupBy = (array, key, productionKey, receiveKey) => {
            return array.reduce((result, item) => {
                const groupKey = item[key];
                if (!result[groupKey]) {
                    result[groupKey] = { box: groupKey, productionReceiptId: item[productionKey], receivedQty: item[receiveKey], items: [] };
                }
                result[groupKey].items.push(item);
                return result;
            }, {});
        };


        if (packingCategory == "CLASSWISE" && packingType == "MIXED") {

            setGroupData(Object.values(groupBy(productionReceiptDetails, "box", "productionReceiptId", "receivedQty")))
        }

    }, [productionReceiptDetails, id])


    useEffect(() => {
        if (productionReceiptDetails?.length == 0) return
        const groupBy = (array, key, productionKey, receiveKey) => {
            return array.reduce((result, item) => {
                const groupKey = item[key];
                if (!result[groupKey]) {
                    result[groupKey] = { box: groupKey, productionReceiptId: item[productionKey], receivedQty: item[receiveKey], items: [] };
                }
                result[groupKey].items.push(item);
                return result;
            }, {});
        };


        if (packingCategory == "CLASSWISE" && packingType == "MIXED") {

            setGroupData(Object.values(groupBy(productionReceiptDetails, "box", "productionReceiptId", "receivedQty")))
        }

    }, [productionReceiptDetails, id])



    return (
        <>
            {/* <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                <LossReasonBreakup setCurrentSelectedIndex={setCurrentSelectedIndex} currentIndex={currentSelectedIndex} readOnly={readOnly}
                    productionReceiptDetails={productionReceiptDetails}
                    productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                    setProductionReceiptDetails={setProductionReceiptDetails} />
            </Modal> */}
            <fieldset
                className="min-h-[330px] frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border
                            border-gray-600 overflow-auto "
            >
                <legend className="sub-heading">Production Receipt Details For Set</legend>
                <div className={`relative w-full overflow-y-auto p-1`}>
                    <table className="table-data border border-gray-500 text-xs table-auto w-full">
                        <thead className="bg-gray-300 border border-gray-500 top-0">
                            <tr className="border border-gray-500">
                                <th className="table-data w-2 text-center">S.no</th>
                                <th className="table-data w-20">Class/Item</th>
                                <th className="table-data w-20">Size</th>
                                {/* <th className="table-data w-24">MaleSet/</th>
                                <th className="table-data w-24">FemaleSet</th> */}
                                <th className="table-data w-24">TotalSet/Qty</th>
                                <th className="table-data w-24">Box</th>

                                {!readOnly &&
                                    <th className="table-data  w-5 text-green-600" onClick={() => {
                                        if (isPacking()) {
                                            setProductionDeliveryDetailsFillGridForPacking(true)
                                        }
                                        else {
                                            setFillGrid(true)
                                        }
                                    }}> {PLUS} </th>
                                }
                            </tr>
                        </thead>
                        <tbody className="overflow-y-auto table-data h-full w-full">
                            {
                                (packingCategory == "CLASSWISE" && packingType == "MIXED") &&

                                groupData?.map((item, index) => {
                                    return <ProductionReceiptDetailItemForMixed id={id} item={item} index={index} groupData={groupData} setGroupData={setGroupData} isStitching={isStitching} isIroning={isIroning} isPacking={isPacking}
                                        setCurrentSelectedIndex={setCurrentSelectedIndex} readOnly={readOnly}
                                        productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                                        cuttingOrderId={productionDeliveryId} productionReceiptDetails={productionReceiptDetails}
                                        setProductionReceiptDetails={setProductionReceiptDetails} />

                                })
                            }

                        </tbody>
                    </table>
                </div>
            </fieldset >
        </>
    );
};

export default ProductionReceiptDetailsForMixed;

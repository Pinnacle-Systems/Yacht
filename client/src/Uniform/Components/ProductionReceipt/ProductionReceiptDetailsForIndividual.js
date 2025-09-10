import React, { useEffect, useState } from 'react'

import ProductionReceiptDetailItem from './ProductionReceiptDetailItem';
import { PLUS } from '../../../icons';
import Modal from '../../../UiComponents/Modal';
import LossReasonBreakup from './LossReasonBreakup';
import ProductionReceiptDetailItemForPacking from './ProductionReceiptDetailItemForPacking';
import ProductionReceiptDetailItemForIndividual from './ProductionReceiptDetailItemForIndividual';

const ProductionReceiptDetailsForIndividual = ({ groupData, setGroupData, packingCategory,
    packingType, isIroning, id, readOnly,
    productionDeliveryId, productionReceiptDetails, setProductionReceiptDetails, setFillGrid, productionDeliveryDetailsFillData,
    isPacking, setProductionDeliveryDetailsFillGridForPacking, isStitching }) => {
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")



    useEffect(() => {
        if (productionReceiptDetails?.length == 0) return
        const groupBy = (array, key) => {
            return array.reduce((result, item) => {
                const groupKey = item[key];
                if (!result[groupKey]) {
                    result[groupKey] = { box: groupKey, items: [] };
                }
                result[groupKey].items.push(item);
                return result;
            }, {});
        };


        if (packingCategory == "SIZEWISE" && packingType == "INDIVIDUAL") {

            setGroupData(Object.values(groupBy(productionReceiptDetails, "box")))
        }

    }, [productionReceiptDetails])



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
                <legend className="sub-heading">Production Receipt For Individual Pack</legend>
                <div className={`relative w-full overflow-y-auto p-1`}>

                    <table className="table-data border border-gray-500 text-xs table-auto w-full">
                        <thead className="bg-gray-300 border border-gray-500 top-0">
                            <tr className="border border-gray-500">
                                <th className="table-data w-2 text-center">S.no</th>

                                <th className="table-data w-20">Size</th>
                                <th className="table-data w-20">Item</th>
                                <th className="table-data w-24">Color</th>
                                <th className="table-data w-24">ReceivedQty</th>

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
                        <tbody className="overflow-y-auto table-data h-full w-full">{console.log(groupData, "groupData")}
                            {
                                (packingCategory == "SIZEWISE" && packingType == "INDIVIDUAL") &&

                                groupData?.map((item, index) => {
                                    return <ProductionReceiptDetailItemForIndividual item={item} index={index} groupData={groupData} setGroupData={setGroupData} isStitching={isStitching} isIroning={isIroning} isPacking={isPacking}
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

export default ProductionReceiptDetailsForIndividual;

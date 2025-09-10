import React from 'react'
import { findFromList, substract } from '../../../Utils/helper'
import { toast } from 'react-toastify';
import { DELETE, VIEW } from '../../../icons';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';

import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import secureLocalStorage from 'react-secure-storage';
import { useGetPanelMasterQuery } from '../../../redux/uniformService/PanelMasterService';

const ProductionReceiptDetailItem = ({ isIroning, isStitching, item, index, id, productionReceiptDetails, setCurrentSelectedIndex, setProductionReceiptDetails, productionDeliveryDetailsFillData, readOnly, isPacking }) => {
    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(productionReceiptDetails);
        newBlend[index][field] = value;
        if (field == "receivedQty") {
            if (isStitching()) {
                newBlend[index]["productionConsumptionDetails"] = newBlend[index]["productionConsumptionDetails"]?.map(val => {
                    return {
                        ...val, consumption: value
                    }
                })
            }
            else {
                newBlend[index]["productionConsumptionDetails"][0]["consumption"] = value
            }
        }
        setProductionReceiptDetails(newBlend);
    };
    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const { data: itemList } =
        useGetItemMasterQuery({ params });

    const { data: panelList } =
        useGetPanelMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params });


    // const productionDeliveryItem = productionDeliveryDetailsFillData.find(i => parseInt(i.id) === parseInt(item.productionDeliveryDetailsId))
    // const delQty = productionDeliveryItem?.delQty
    // const alreadyReceivedQty = productionDeliveryItem?.alreadyReceivedQty ? productionDeliveryItem?.alreadyReceivedQty : 0;
    // const balQty = substract(delQty, alreadyReceivedQty);
    const totalLossQty = (item?.lossDetails ? item?.lossDetails : []).reduce((a, c) => a + parseFloat(c?.lossQty), 0)

    const deleteItem = () => {
        setProductionReceiptDetails(prev => {
            return prev.filter(i => parseInt(i.productionDeliveryDetailsId) !== parseInt(item.productionDeliveryDetailsId))
        })
    }
    return (
        <tr key={index} className='py-2 table-row'>
            <td className='table-data   '>
                {index + 1}
            </td>

            <td className='table-data'>
                {findFromList(item?.itemId, itemList?.data, "name")}
            </td>
            {


                (isStitching() || isIroning()) ?
                    <td className='table-data'>
                        {findFromList(item?.colorId, colorList?.data, "name")}
                    </td>
                    :
                    <>
                        <td className='table-data'>
                            {findFromList(item?.panelId, panelList?.data, "name")}
                        </td>
                        <td className='table-data'>
                            {findFromList(item?.panelColorId, colorList?.data, "name")}
                        </td>
                    </>
            }



            <td className='table-data text-right'>
                {findFromList(item?.sizeId, sizeList?.data, "name")}
            </td>
            {
                !(isStitching() || !isIroning() || !isPacking()) &&
                <td className='  table-data text-right px-1'>
                    {item?.processCost || 0}
                </td>
            }


            <td className='  table-data text-right px-1'>
                {isStitching() ? (item?.cuttingQty || 0) : (item?.delQty || 0)}
            </td>
            <td className='  table-data text-right px-1'>
                {item?.alreadyReceivedQty || 0}
            </td>
            <td className='  table-data text-right px-1'>
                {isStitching() ? substract(item?.readyQty, item?.alreadyReceivedQty) : substract(item?.delQty, item?.alreadyReceivedQty) || 0}
            </td>
            <td className='table-data'>
                <input
                    type="number"
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 px-1 w-full table-data-input"

                    value={(!item.receivedQty) ? 0 : item.receivedQty}

                    onChange={(e) => {
                        if (parseFloat(e.target.value) + totalLossQty > (isStitching() ? item?.readyQty : substract(item?.delQty, item?.alreadyReceivedQty))) {
                            toast.info("Inward Qty Cannot be more than ReadyToInward Qty", { position: 'top-center' })
                            return
                        }
                        handleInputChange(e.target.value, index, "receivedQty")
                    }}
                    onBlur={(e) =>
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "receivedQty")
                    }
                />
            </td>
            <td className='table-data text-center'>
                <button
                    className="text-center rounded py-1 w-12"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setCurrentSelectedIndex(index);
                        }
                    }}
                    onClick={() => {
                        setCurrentSelectedIndex(index)
                    }}>
                    {VIEW}
                </button>
            </td>
            <td className='  table-data text-right'>
                {totalLossQty?.toFixed(3)}
            </td>
            {!readOnly
                &&
                <td className='table-data '>
                    <button className='w-full' onClick={deleteItem}>
                        {DELETE}
                    </button>
                </td>
            }
        </tr>
    )
}

export default ProductionReceiptDetailItem
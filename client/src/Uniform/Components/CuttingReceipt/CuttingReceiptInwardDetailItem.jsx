import React from 'react'
import { findFromList, isBetweenRange, substract } from '../../../Utils/helper'
import { toast } from 'react-toastify';
import { DELETE } from '../../../icons';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetItemTypeMasterQuery } from '../../../redux/uniformService/ItemTypeMasterService';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import secureLocalStorage from 'react-secure-storage';
import { useGetPanelMasterQuery } from '../../../redux/uniformService/PanelMasterService';



const CuttingReceiptInwardDetailItem = ({ item, index, id, cuttingReceiptInwardDetails, setCuttingReceiptInwardDetails, cuttingReceiptInwardDetailsFillData, readOnly, cuttingOrderId }) => {
    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(cuttingReceiptInwardDetails);
        newBlend[index][field] = value;
        setCuttingReceiptInwardDetails(newBlend);
    };
    const cuttingDeliveryItem = cuttingReceiptInwardDetailsFillData.find(i => parseInt(i.id) === parseInt(item.cuttingOrderDetailsId))
    const orderQty = item?.orderQty
    const cuttingQty = item?.cuttingQty
    const alreadyReceivedQty = item?.alreadyReceivedQty ? item?.alreadyReceivedQty : 0;
    const balQty = substract(cuttingQty, alreadyReceivedQty);
    const deleteItem = () => {
        setCuttingReceiptInwardDetails(prev => {
            return prev.filter(i => parseInt(i.cuttingOrderDetailsId) !== parseInt(item.cuttingOrderDetailsId))
        })
    }
    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };


    const { data: fabricList } =
        useGetFabricMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params });

    const { data: itemTypeList } =
        useGetItemTypeMasterQuery({ params });
    const { data: itemList } =
        useGetItemMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });

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
    const { data: panelList } =
        useGetPanelMasterQuery({ params });

    function findBalanceQty(balanceQty) {
        let balanceNos = parseFloat(balanceQty) * parseFloat(0.10)
        balanceNos = Math.round(balanceNos)
        return parseInt(parseInt(balanceNos) + parseInt(balanceQty))
    }

    return (
        <tr key={index} className='py-2 table-row'>
            <td className='table-data   '>
                {index + 1}
            </td>
            <td className='table-data'>
                {findFromList(item?.itemId, itemList?.data, "name")}
            </td>
            <td className='table-data'>
                {findFromList(item?.colorId, colorList?.data, "name")}
            </td>
            <td className='table-data'>
                {findFromList(item?.panelId, panelList?.data, "name")}
            </td>
            <td className='table-data'>
                {findFromList(item?.panelColorId, colorList?.data, "name")}
            </td>
            <td className='table-data'>
                {findFromList(item?.sizeId, sizeList?.data, "name")}
            </td>
            {/* <td className='table-data'>
                {findFromList(item?.uomId, uomList?.data, "name")}
            </td> */}
            {/* <td className='  table-data text-left'>
                {cuttingDeliveryItem?.UOM?.name}
            </td> */}
            <td className='  table-data text-right px-1'>
                {item?.orderQty}
            </td>
            <td className='  table-data text-right px-1'>
                {item?.cuttingQty}
            </td>
            <td className='  table-data text-right px-1'>
                {item?.alreadyReceivedQty || 0}
            </td>
            <td className='  table-data text-right px-1'>
                {balQty || 0}
            </td>
            {/* <td className='  table-data text-right px-1'>
                {cuttingDeliveryItem?.cuttingPrice}
            </td> */}
            <td className='table-data'>
                <input
                    type="number"
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 px-1 w-full table-data-input"

                    value={(!item.receivedQty) ? 0 : item.receivedQty}

                    onChange={(e) => {
                        // if (e.target.value > balQty) {
                        if (e.target.value > findBalanceQty(balQty)) {
                            toast.info("Inward Qty Cannot be more than balance Qty", { position: 'top-center' })
                            return
                        }
                        handleInputChange(e.target.value, index, "receivedQty")
                    }}
                    onBlur={(e) =>
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "receivedQty")
                    }
                />
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

export default CuttingReceiptInwardDetailItem
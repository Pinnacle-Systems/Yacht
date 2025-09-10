import React from 'react'
import { findFromList, substract } from '../../../Utils/helper'
import { toast } from 'react-toastify';
import { DELETE, VIEW } from '../../../icons';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';

import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import secureLocalStorage from 'react-secure-storage';
import { useGetPanelMasterQuery } from '../../../redux/uniformService/PanelMasterService';
import { useGetClassMasterQuery } from '../../../redux/uniformService/ClassMasterService';

const ProductionReceiptDetailItemForMixed = ({ id, item, index, groupData, setGroupData, isIroning, isStitching, productionReceiptDetails, setCurrentSelectedIndex, setProductionReceiptDetails, productionDeliveryDetailsFillData, readOnly, isPacking }) => {
    // const handleInputChange = (value, index, field, classId) => {

    //     const groupBlend = structuredClone(groupData);

    //     groupBlend[index]["items"] = groupBlend[index]["items"]?.map(j => {
    //         return {
    //             ...j, box: value
    //         }
    //     })


    //     setGroupData(groupBlend);

    // };



    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const { data: classList } =
        useGetClassMasterQuery({ params });

    const { data: panelList } =
        useGetPanelMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });
    const { data: itemList } =
        useGetItemMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params });

    const totalLossQty = (item?.lossDetails ? item?.lossDetails : []).reduce((a, c) => a + parseFloat(c?.lossQty), 0)

    const deleteItem = (boxNo) => {
        setProductionReceiptDetails(prev => {
            return prev.filter(i => parseInt(i.box) !== parseInt(item.box))
        })
    }


    function getReceivedQty() {
        let received = (item?.items?.filter(
            (obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId)
        )?.reduce((accumulation, currentValue) => {
            return (parseFloat(accumulation) + (parseFloat(currentValue?.maleInwardQty ? currentValue?.maleInwardQty : 0)))
        }, 0) + item?.items?.filter(
            (obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId)
        )?.reduce((accumulation, currentValue) => {
            return (parseFloat(accumulation) + (parseFloat(currentValue?.femaleInwardQty ? currentValue?.femaleInwardQty : 0)))
        }, 0) || parseInt(item?.items?.filter(
            (obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId)
        )?.reduce((accumulation, currentValue) => {
            return (parseFloat(accumulation) + (parseFloat(currentValue?.receivedQty ? currentValue?.receivedQty : 0)))
        }, 0)))

        return parseInt(received)
    }


    return (
        <tr key={index} className='py-2 table-row'>{console.log(productionReceiptDetails, "productionreceipt")}
            <td className='table-data   '>
                {index + 1}
            </td>

            <td className='table-data'>
                {/* {findFromList(item?.classId, classList?.data, "name")} */}
                {
                    item?.items?.filter(
                        (obj, index, self) => index === self.findIndex((t) => t.classId === obj.classId)
                    )?.map((val, valIndex) => (
                        findFromList(val?.classId, classList?.data, "name")
                    )).join(",") || item?.items?.map((val, valIndex) => (
                        findFromList(val?.itemId, itemList?.data, "name")
                    )).join(",")
                }
            </td>



            <td className='table-data'>
                {
                    item?.items?.filter(
                        (obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId)
                    )?.map((val, valIndex) => (
                        findFromList(val?.sizeId, sizeList?.data, "name")
                    )).join(",")
                }

            </td>



            {/* <td className='  table-data text-right px-1'>



                {id ? 0 : item?.items?.reduce((accumulation, currentValue) => {
                    return (parseFloat(accumulation) + parseFloat(currentValue?.maleInwardQty ? currentValue?.maleInwardQty : 0))
                }, 0) || 0}
            </td>


            <td className='  table-data text-right px-1'>

                {id ? 0 : item?.items?.reduce((accumulation, currentValue) => {
                    return (parseFloat(accumulation) + parseFloat(currentValue?.femaleInwardQty ? currentValue?.femaleInwardQty : 0))
                }, 0) || 0}



            </td> */}
            <td className='  table-data text-right'>
                {id ? getReceivedQty(item) : (parseFloat(item?.items?.reduce((accumulation, currentValue) => {
                    return (parseFloat(accumulation) + parseFloat(currentValue?.maleInwardQty ? currentValue?.maleInwardQty : 0))
                }, 0) || 0) + parseFloat(item?.items?.reduce((accumulation, currentValue) => {
                    return (parseFloat(accumulation) + parseFloat(currentValue?.femaleInwardQty ? currentValue?.femaleInwardQty : 0))
                }, 0) || 0)) || item?.items?.reduce((accumulation, currentValue) => {
                    return (parseFloat(accumulation) + parseFloat(currentValue?.receivedQty ? currentValue?.receivedQty : 0))
                }, 0)}
            </td>

            <td className='table-data text-right px-1'>{item?.box}

            </td>


            {!readOnly
                &&
                <td className='table-data '>
                    <button className='w-full' onClick={() => deleteItem(item?.box)}>
                        {DELETE}
                    </button>
                </td>
            }
        </tr>
    )
}

export default ProductionReceiptDetailItemForMixed
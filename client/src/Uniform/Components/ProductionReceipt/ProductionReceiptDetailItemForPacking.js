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

const ProductionReceiptDetailItemForPacking = ({ item, index, groupData, setGroupData, isIroning, isStitching, id, productionReceiptDetails, setCurrentSelectedIndex, setProductionReceiptDetails, productionDeliveryDetailsFillData, readOnly, isPacking }) => {
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
    const { data: itemList } =
        useGetItemMasterQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params });

    const totalLossQty = (item?.lossDetails ? item?.lossDetails : []).reduce((a, c) => a + parseFloat(c?.lossQty), 0)

    const deleteItem = () => {
        // setProductionReceiptDetails(prev => {
        //     return prev.filter(i => parseInt(i.productionDeliveryDetailsId) !== parseInt(item.productionDeliveryDetailsId))
        // })
    }





    function getReceivedQty() {
        // let received = (item?.items?.filter(
        //     (obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId)
        // )?.reduce((accumulation, currentValue) => {
        //     return (parseFloat(accumulation) + (parseFloat(currentValue?.maleInwardQty ? currentValue?.maleInwardQty : 0)))
        // }, 0) + item?.items?.filter(
        //     (obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId)
        // )?.reduce((accumulation, currentValue) => {
        //     return (parseFloat(accumulation) + (parseFloat(currentValue?.femaleInwardQty ? currentValue?.femaleInwardQty : 0)))
        // }, 0))

        let received = (item?.items?.filter(
            (obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId)
        )?.reduce((accumulation, currentValue) => {
            return (parseFloat(accumulation) + (parseFloat(currentValue?.receivedQty ? currentValue?.receivedQty : 0)))
        }, 0))



        return parseInt(received)
    }


    function getItemId() {
        let male = item?.items?.flatMap(val => val.maleSet)?.map(j => {
            return {
                ...j, itemId: j?.isMaleItemId
            }
        })
        let female = item?.items?.flatMap(val => val.femaleSet)?.map(j => {
            return {
                ...j, itemId: j?.isfeMaleItemId
            }
        })



        let join = [...male, ...female]


        return join

    }




    return (
        <tr key={index} className='py-2 table-row'>{console.log(productionReceiptDetails, "productionreceipt")}
            <td className='table-data   '>
                {index + 1}
            </td>

            <td className='table-data'>

                {
                    item?.items?.filter(
                        (obj, index, self) => index === self.findIndex((t) => t.classId === obj.classId)
                    )?.map((val, valIndex) => (
                        findFromList(val?.classId, classList?.data, "name")
                    )).join(",")
                }
            </td>


            <td className='table-data'>{
                id ?
                    (item?.items?.filter(
                        (obj, index, self) => index === self.findIndex((t) => t.itemId === obj.itemId)
                    )?.map((val, valIndex) => (
                        findFromList(val?.itemId, itemList?.data, "name")
                    )).join(","))
                    :
                    (
                        (getItemId() || [])?.filter(
                            (obj, index, self) => index === self.findIndex((t) => t.itemId == obj.itemId)
                        )?.map((val, valIndex) => (
                            findFromList(val?.itemId, itemList?.data, "name")
                        )).join(","))
            }</td>
            <td className='table-data'>
                {
                    item?.items?.filter(
                        (obj, index, self) => index === self.findIndex((t) => t.sizeId == obj.sizeId)
                    )?.map((val, valIndex) => (
                        findFromList(val?.sizeId, sizeList?.data, "name")
                    )).join(",")
                }

            </td>

            {/* <td className='  table-data text-right px-1'>

                {item?.items?.reduce((accumulation, currentValue) => {
                    return (parseFloat(accumulation) + parseFloat(currentValue?.maleInwardQty ? currentValue?.maleInwardQty : 0))
                }, 0) || 0}
            </td>


            <td className='  table-data text-right px-1'>

                {item?.items?.reduce((accumulation, currentValue) => {
                    return (parseFloat(accumulation) + parseFloat(currentValue?.femaleInwardQty ? currentValue?.femaleInwardQty : 0))
                }, 0) || 0}



            </td> */}
            <td className='  table-data text-right'>

                {id ? getReceivedQty() : parseFloat(item?.items?.reduce((accumulation, currentValue) => {
                    return (parseFloat(accumulation) + parseFloat(currentValue?.totalInwardQty ? currentValue?.totalInwardQty : 0))
                }, 0) || 0)}
                {/* {id ? getReceivedQty() : (parseFloat(item?.items?.reduce((accumulation, currentValue) => {
                    return (parseFloat(accumulation) + parseFloat(currentValue?.maleInwardQty ? currentValue?.maleInwardQty : 0))
                }, 0) || 0) + parseFloat(item?.items?.reduce((accumulation, currentValue) => {
                    return (parseFloat(accumulation) + parseFloat(currentValue?.femaleInwardQty ? currentValue?.femaleInwardQty : 0))
                }, 0) || 0)) || 0} */}
            </td>

            <td className='table-data text-right px-1'>{item?.box}

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

export default ProductionReceiptDetailItemForPacking
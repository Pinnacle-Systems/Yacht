import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { findFromList, substract } from '../../../Utils/helper'

const FabricPoItem = ({ fabricList, uomList,
    colorList, gaugeList, designList, gsmList,
    loopLengthList, item,
    diaList, poItemId, index, handleInputChange, readOnly, qty, removeItem, purchaseInwardId }) => {
    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: poItemId, purchaseInwardId }, { skip: !poItemId })



    useEffect(() => {


        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (data?.data) {
            handleInputChange(poItem?.fabricId, index, "fabricId", 0, poItem);
        }
    }, [isFetching, isLoading, data, purchaseInwardId])





    if (isLoading || isFetching) return <Loader />
    // const poItem = data?.data
    // let poQty = parseFloat(poItem.qty).toFixed(3)
    // let alreadyCancelQty = poItem.alreadyCancelData?._sum.qty ? poItem.alreadyCancelData._sum.qty : "0.000";
    // let alreadyInwardedQty = poItem.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
    // let balanceQty = substract(substract(poQty, alreadyCancelQty), alreadyInwardedQty).toFixed(3)
    // let alreadyReturnedQty = poItem.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    // let alreadyCancelRolls = poItem.alreadyCancelData?._sum.noOfRolls ? poItem.alreadyCancelData._sum.noOfRolls : "0.000";
    // let alreadyInwardedRolls = poItem.alreadyInwardedData?._sum?.noOfRolls ? poItem.alreadyInwardedData._sum.noOfRolls : "0.000";

    // let alreadyReturnedRolls = poItem.alreadyReturnedData?._sum?.noOfRolls ? parseFloat(poItem.alreadyReturnedData._sum.noOfRolls).toFixed(3) : "0.000";

    return (
        <tr key={poItemId}>
            <td className='text-left px-1  table-data'>{index + 1}</td>
            <td className='text-left px-1 table-data'>{item?.poNo}</td>
            <td className='text-left px-1 table-data'>{findFromList(item.fabricId, fabricList?.data, "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.colorId, colorList?.data, "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.designId, designList?.data, "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.gaugeId, gaugeList?.data, "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.loopLengthId, loopLengthList?.data, "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.gsmId, gsmList?.data, "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.kDiaId, diaList?.data?.filter(val => val.kDia), "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.fDiaId, diaList?.data?.filter(val => val.fDia), "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.uomId, uomList?.data, "name")} </td>
            <td className='text-right px-1  table-data'>{item?.poQty || 0}</td>
            <td className='text-right   table-data'>{item?.alreadyCancelQty}</td>
            {/* <td className='text-right   table-data'>{item?.alreadyCancelRolls}</td> */}
            <td className='text-right   table-data'>{item?.alreadyInwardedQty}</td>
            <td className='text-right   table-data'>{item?.alreadyInwardedRolls}</td>
            <td className='text-right   table-data'>{item?.alreadyReturnedQty}</td>
            <td className='text-right   table-data'>{item?.alreadyReturnedRolls || 0}</td>
            <td className='text-right   table-data'>{item?.balanceQty}</td>

            <td className='text-left table-data'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1   w-full  table-data-input"
                    value={item?.qty}
                    disabled={readOnly}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "qty");
                            return
                        }
                        handleInputChange(event.target.value, index, "qty", item?.balanceQty, data?.data);
                    }}
                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "qty");
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", item?.balanceQty, data?.data)
                    }}
                />
            </td>
            <td className='text-right table-data'>{item.price}</td>

            {!readOnly &&
                <td className='table-data w-12'>
                    <div tabIndex={-1} onClick={() => removeItem(poItemId)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                        {DELETE}
                    </div>
                </td>
            }
        </tr>
    )
}

export default FabricPoItem

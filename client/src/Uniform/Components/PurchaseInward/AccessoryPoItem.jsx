import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { findFromList, substract } from '../../../Utils/helper'

const AccessoryPoItem = ({ uomList, sizeList, accessoryList, colorList, item, index, handleInputChange, readOnly, removeItem, purchaseInwardId }) => {
    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: item.poItemsId, purchaseInwardId }, { skip: !item.poItemsId })

    console.log(data, "data")

    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (data?.data) {
            handleInputChange(poItem?.accessoryId, index, "accessoryId", 0, poItem);


        }
    }, [isFetching, isLoading, data, purchaseInwardId])
    if (isLoading || isFetching) return <Loader />




    function findAccessoryName(accessoryId, accessoryArray, field) {

        let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

        if (field == "accessoryItem") {
            return accessoryObj?.accessoryItem?.name
        }
        else if ("accessoryGroup") {
            return accessoryObj?.accessoryItem?.AccessoryGroup?.name
        }

    }


    // const poItem = data.data
    // let poQty = parseFloat(poItem.qty).toFixed(3)
    // let cancelQty = poItem.alreadyCancelData?._sum.qty ? poItem.alreadyCancelData._sum.qty : "0.000";
    // let alreadyInwardedQty = poItem.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
    // let alreadyReturnedQty = poItem.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    // let balanceQty = substract(substract(poQty, cancelQty), substract(alreadyInwardedQty, alreadyReturnedQty)).toFixed(3)
    return (
        <tr key={item.poItemsId} className='table-row'>
            <td className='text-left   table-data'>{index + 1}</td>
            <td className='text-left px-1 table-data'>{item?.poNo}</td>
            <td className='text-left px-1 table-data'>{findFromList(item.accessoryId, accessoryList?.data, "aliasName")} </td>
            <td className='text-left   table-data'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryItem")}</td>
            <td className='text-left   table-data'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryGroup")}</td>
            <td className='text-left px-1 table-data'>{findFromList(item.colorId, colorList?.data, "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.sizeId, sizeList?.data, "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.uomId, uomList?.data, "name")} </td>
            <td className='text-right px-1  table-data'>{item?.poQty || 0}</td>
            <td className='text-right px-1  table-data'>{item?.cancelQty || 0}</td>
            <td className='text-right px-1  table-data'>{item?.alreadyInwardedQty || 0}</td>
            <td className='text-right px-1  table-data'>{item?.alreadyReturnedQty || 0}</td>
            <td className='text-right px-1  table-data'>{item?.balanceQty || 0}</td>

            <td className='   table-data text-right'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded   w-full py-1 table-data-input"
                    autoFocus={index === 0}
                    value={item.qty}
                    disabled={readOnly}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "qty");
                            return
                        }
                        handleInputChange(event.target.value, index, "qty", item?.balanceQty);
                    }}

                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "qty");
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", item?.balanceQty)
                    }}
                />
            </td>
            <td className='text-right  w-12 table-data'>{parseFloat(item?.price).toFixed(2)}</td>
            <td className='text-right   table-data'>{!item.qty ? "0.000" : (parseFloat(item?.price) * parseFloat(item.qty ? item.qty : "0.000")).toFixed(2)}</td>
            {!readOnly &&
                <td className='table-data w-12'>
                    <div tabIndex={-1} onClick={() => removeItem(item.poItemsId)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                        {DELETE}
                    </div>
                </td>
            }
        </tr>
    )
}

export default AccessoryPoItem

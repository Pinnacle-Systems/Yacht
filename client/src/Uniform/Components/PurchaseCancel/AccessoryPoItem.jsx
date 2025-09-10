import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { findFromList, substract } from '../../../Utils/helper'

const AccessoryPoItem = ({ uomList, sizeList, accessoryList, colorList, item, poItemId, index, handleInputChange, readOnly, qty, removeItem, purchaseInwardId }) => {
    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: poItemId, purchaseInwardId }, { skip: !poItemId })




    function findAccessoryName(accessoryId, accessoryArray, field) {

        let accessoryObj = accessoryArray?.find(item => parseInt(item.id) == accessoryId)

        if (field == "accessoryItem") {
            return accessoryObj?.accessoryItem?.name
        }
        else if ("accessoryGroup") {
            return accessoryObj?.accessoryItem?.AccessoryGroup?.name
        }

    }

    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (data?.data) {
            handleInputChange(poItem?.accessoryId, index, "accessoryId", 0, poItem);


        }
    }, [isFetching, isLoading, data, purchaseInwardId])

    if (isLoading || isFetching) return <Loader />

    return (
        <tr key={poItemId}>
            <td className='text-left   table-data'>{index + 1}</td>
            <td className='text-left px-1 table-data'>{item?.poNo}</td>
            <td className='text-left px-1 table-data'>{findFromList(item.accessoryId, accessoryList?.data, "aliasName")} </td>
            <td className='text-left   table-data'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryItem")}</td>
            <td className='text-left   table-data'>{findAccessoryName(item.accessoryId, accessoryList?.data, "accessoryGroup")}</td>
            <td className='text-left px-1 table-data'>{findFromList(item.colorId, colorList?.data, "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.sizeId, sizeList?.data, "name")} </td>
            <td className='text-left px-1 table-data'>{findFromList(item.uomId, uomList?.data, "name")} </td>
            <td className='text-right px-1  table-data'>{item?.poQty || 0}</td>
            <td className='text-right px-1  table-data'>{(item?.alreadyCancelQty ? item?.alreadyCancelQty : item?.cancelQty ? item?.cancelQty : 0)}</td>
            <td className='text-right px-1  table-data'>{item?.alreadyInwardedQty || 0}</td>
            <td className='text-right px-1  table-data'>{item?.alreadyReturnedQty || 0}</td>
            <td className='text-right px-1  table-data'>{item?.balanceQty}</td>

            <td className='table-data text-right w-16'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded   w-full py-1 table-data-input"
                    value={qty}
                    disabled={readOnly}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "qty", item?.balanceQty);
                            return
                        }
                        handleInputChange(event.target.value, index, "qty", item?.balanceQty);
                    }}
                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "qty", item?.balanceQty);
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", item?.balanceQty)
                    }}
                />
            </td>
            <td className='text-right  w-12 table-data'>{item?.price}</td>

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

export default AccessoryPoItem

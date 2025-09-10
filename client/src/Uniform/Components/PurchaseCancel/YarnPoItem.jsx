import React, { useEffect } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE } from '../../../icons'
import { substract } from '../../../Utils/helper'
import { toast } from "react-toastify"

const YarnPoItem = ({ poItemId, index, handleInputChange, readOnly, qty, noOfBags, removeItem, purchaseInwardId, weightPerBag }) => {
    const { data, isLoading, isFetching } = useGetPoItemByIdQuery({ id: poItemId, purchaseInwardId }, { skip: !poItemId })
    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        if (data?.data) {
            handleInputChange(parseFloat(data.data.weightPerBag).toFixed(3), index, "weightPerBag", 0)
        }
    }, [isFetching, isLoading, data, purchaseInwardId])
    if (isLoading || isFetching) return <Loader />

    const poItem = data.data

    let poQty = parseFloat(poItem.qty).toFixed(3)
    let poBags = parseFloat(poItem.noOfBags).toFixed(3)
    let alreadyCancelQty = poItem.alreadyCancelData?._sum.qty ? poItem.alreadyCancelData._sum.qty : "0.000";
    let alreadyInwardedQty = poItem.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";

    let alreadyReturnedQty = poItem.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    let alreadyCancelBags = poItem.alreadyCancelData?._sum.noOfBags ? poItem.alreadyCancelData._sum.noOfBags : "0.000";
    let alreadyInwardedBags = poItem.alreadyInwardedData?._sum?.noOfBags ? poItem.alreadyInwardedData._sum.noOfBags : "0.000";

    let alreadyReturnedBags = poItem.alreadyReturnedData?._sum?.noOfBags ? parseFloat(poItem.alreadyReturnedData._sum.noOfBags).toFixed(3) : "0.000";
    let balanceQty = substract(substract(poQty, alreadyCancelQty), alreadyInwardedQty)
    let balanceBags = substract(substract(poBags, alreadyCancelBags), alreadyInwardedBags)

    return (
        <tr key={poItemId}>
            <td className='text-left   table-data'>{index + 1}</td>
            <td className='text-left   table-data'>{poItem.Po.docId}</td>
            <td className='text-left  table-data'>{poItem.Yarn.aliasName}</td>
            <td className='text-left   table-data'>{poItem.Color.name}</td>
            <td className='text-left   table-data'>{poItem.Uom.name}</td>
            <td className='text-right  table-data'>{poQty}</td>
            <td className='text-right  table-data'>{poBags}</td>
            <td className='text-right  table-data'>{alreadyCancelQty}</td>
            <td className='text-right  table-data'>{alreadyCancelBags}</td>
            <td className='text-right  table-data'>{alreadyInwardedQty}</td>
            <td className='text-right  table-data'>{alreadyInwardedBags}</td>
            <td className='text-right  table-data'>{alreadyReturnedQty}</td>
            <td className='text-right  table-data'>{alreadyReturnedBags}</td>
            <td className='text-right  table-data'>{balanceQty}</td>
            <td className='text-right  table-data'>{balanceBags}</td>
            <td className='text-left w-16  table-data'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.key === "Delete") { handleInputChange("0", index, "noOfBags", balanceQty) }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1   w-full table-data-input"
                    value={noOfBags}
                    disabled={readOnly}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "noOfBags", balanceQty);
                            return
                        }
                        if (event.target.value > balanceBags) {
                            toast.info("Cancel Bags Cannot be More than Bal. Bags", { position: 'top-center' })
                            return
                        }
                        handleInputChange(event.target.value, index, "noOfBags", balanceBags);
                    }}
                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "noOfBags", balanceBags);
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "noOfBags", balanceBags)
                    }}
                />
            </td>
            {/* <td className='text-right w-16  table-data'>
                <input
                    onKeyDown={e => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        if (e.altKey) { e.preventDefault() }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1 w-full table-data-input"
                    value={weightPerBag}
                    disabled={readOnly}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "weightPerBag", balanceQty);
                            return
                        }
                        handleInputChange(event.target.value, index, "weightPerBag", balanceQty);
                    }}
                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "weightPerBag", balanceQty);
                            return
                        }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "weightPerBag", balanceQty)
                    }}
                />
            </td> */}
            <td className='text-left  w-16 table-data'>
                <input
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1 w-full table-data-input"
                    value={qty}
                    disabled={readOnly}
                    onKeyDown={(e) => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        // if (e.altKey) { e.preventDefault() }
                        // let value = e.target.value
                        // if (e.key === "altKey") {
                        //     let qty = parseInt(noOfBags) * parseFloat(weightPerBag)
                        //     let excessQty = parseInt(noOfBags) * 2
                        //     if ((substract(qty, excessQty)) > parseFloat(value)) {
                        //         toast.info("Deficient Qty Cannot be Less than 2kg Per Bag", { position: 'top-center' })
                        //         e.preventDefault()
                        //         return
                        //     }
                        // }
                    }}
                    onChange={(event) => {
                        if (event.target.value < 0) return
                        if (!event.target.value) {
                            handleInputChange(0, index, "qty", balanceQty);
                            return
                        }
                        if (event.target.value > balanceQty) {
                            toast.info("Cancel Qty Cannot be More than Bal. Qty", { position: 'top-center' })
                            return
                        }
                        handleInputChange(event.target.value, index, "qty", balanceQty);

                    }}
                    onBlur={(e) => {
                        if (!e.target.value) {
                            handleInputChange(0.000, index, "qty", balanceQty);
                            return
                        }
                        // let value = e.target.value
                        // let qty = parseInt(noOfBags) * parseFloat(weightPerBag)
                        // let excessQty = parseInt(noOfBags) * 2
                        // if ((substract(qty, excessQty)) > parseFloat(value)) {
                        //     toast.info("Deficient Qty Cannot be Less than 2kg Per Bag", { position: 'top-center' })
                        //     e.target.focus()
                        //     return
                        // }
                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", balanceQty)
                    }}
                />
            </td>

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

export default YarnPoItem

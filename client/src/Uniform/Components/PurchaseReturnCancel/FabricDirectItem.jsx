import React, { useEffect, useState } from 'react'
import { useGetPoItemByIdQuery } from '../../../redux/uniformService/PoServices'
import { Loader } from '../../../Basic/components'
import { DELETE, VIEW } from '../../../icons'
import { findFromList, substract, sumArray } from '../../../Utils/helper'
import Modal from '../../../UiComponents/Modal'
import { FabricLotGrid } from './LotGrid'
import { toast } from 'react-toastify'
import { useGetDirectItemByIdQuery } from '../../../redux/uniformService/DirectInwardOrReturnServices'

const FabricDirectItem = ({ fabricList, uomList,
    colorList, gaugeList, designList, gsmList,
    loopLengthList, storeId,
    diaList, index, handleInputChange, readOnly, removeItem, item, purchaseInwardId, handleInputChangeLotNo, addNewLotNo, removeLotNo }) => {
    const [lotGrid, setLotGrid] = useState(false)


    const { data, isLoading, isFetching } = useGetDirectItemByIdQuery({ id: item.poItemsId, purchaseInwardId, storeId: storeId }, { skip: !item.poItemsId })



    useEffect(() => {
        if (purchaseInwardId) return
        if (isLoading || isFetching) return
        const poItem = data?.data

        if (data?.data) {
            // handleInputChange([{ lotNo: "", qty: "0.000", noOfRolls: 0 }], index, "returnLotDetails", 0, poItem);
            handleInputChange(poItem?.alreadyInwardLotWiseData, index, "returnLotDetails", 0, poItem);

        }
    }, [isFetching, isLoading, data, purchaseInwardId])
    if (isLoading || isFetching) return <Loader />
    // const poItem = data?.data
    // let poQty = parseFloat(poItem?.qty || 0).toFixed(3)
    // let cancelQty = poItem?.alreadyCancelData?._sum.qty ? parseFloat(poItem.alreadyCancelData?._sum.qty).toFixed(3) : "0.000";
    // let alreadyInwardedQty = poItem?.alreadyInwardedData?._sum?.qty ? parseFloat(poItem.alreadyInwardedData._sum.qty).toFixed(3) : "0.000";
    // let alreadyReturnedQty = poItem?.alreadyReturnedData?._sum?.qty ? parseFloat(poItem.alreadyReturnedData._sum.qty).toFixed(3) : "0.000";
    // let balanceQty = substract(substract(poQty, cancelQty), substract(alreadyInwardedQty, alreadyReturnedQty)).toFixed(3)
    let lotNoArr = item?.returnLotDetails ? item.returnLotDetails.map(item => item.lotNo) : []
    let isLotNoUnique = new Set(lotNoArr).size === lotNoArr.length
    function onClose() {
        if (!isLotNoUnique) {
            toast.info("Lot No Should be Unique", { position: "top-center" })
            return
        }
        setLotGrid(false)
    }
    return (
        <>
            <Modal widthClass={"max-h-[600px] overflow-auto"} onClose={onClose} isOpen={lotGrid}>
                <FabricLotGrid value={item}
                    readOnly={readOnly}
                    onClose={onClose}
                    addNewLotNo={addNewLotNo}
                    removeLotNo={removeLotNo}
                    handleInputChangeLotNo={handleInputChangeLotNo}
                    index={index} returnLotDetails={item?.returnLotDetails ? item?.returnLotDetails : []} balanceQty={item?.balanceQty} />
            </Modal>
            <tr key={item.poItemId} className='table-row'>
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
                {/* <td className='text-right px-1  table-data'>{item?.stockRolls || 0}</td> */}
                <td className='text-right px-1  table-data'>{item?.stockQty || 0}</td>
                <td className='text-right px-1  table-data'>{item?.alreadyInwardedRolls || 0}</td>
                <td className='text-right px-1  table-data'>{item?.alreadyInwardedQty || 0}</td>

                <td className='text-right px-1  table-data'>{item?.alreadyReturnedRolls || 0}</td>
                <td className='text-right px-1  table-data'>{item?.alreadyReturnedQty || 0}</td>

                {/* <td className='text-right px-1  table-data'>{item?.allowedReturnRolls || 0}</td> */}
                <td className='text-right px-1  table-data'>{item?.allowedReturnQty || 0}</td>

                {/* <td className='text-right px-1  table-data'>{item?.cancelQty || 0}</td>
                <td className='text-right px-1  table-data'>{item?.alreadyInwardedQty || 0}</td>
                <td className='text-right px-1  table-data'>{item?.alreadyReturnedQty || 0}</td>
                <td className='text-right px-1  table-data'>{item?.balanceQty || 0}</td> */}




                <td className='text-center table-data'>
                    <button onClick={() => setLotGrid(true)} className='w-full'>
                        {VIEW}
                    </button>
                </td>
                <td className='text-right px-1  table-data'>
                    <input
                        type="number"
                        className="text-right rounded py-1  px-1 w-full table-data-input"
                        // value={sumArray(item?.lotDetails ? item?.lotDetails : [], "noOfRolls")}
                        value={item?.noOfRolls ? item?.noOfRolls : 0}
                        disabled={true}
                        onChange={(event) => {
                            if (event.target.value < 0) return
                            if (!event.target.value) {
                                handleInputChange(0, index, "noOfRolls");
                                return
                            }
                            handleInputChange(event.target.value, index, "noOfRolls", item?.balanceQty);
                        }}
                        onKeyDown={e => {
                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                            if (e.key === "Delete") { handleInputChange("0", index, "noOfRolls") }
                        }}
                        min={"0"}
                        onBlur={(e) => {
                            if (!e.target.value) {
                                handleInputChange(0.000, index, "noOfRolls", item?.balanceQty);
                                return
                            }
                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "noOfRolls", item?.balanceQty)
                        }}
                    />
                </td>
                <td className='text-left px-1  table-data'>
                    <input
                        type="number"
                        className="text-right rounded py-1  px-1 w-full table-data-input"
                        // value={sumArray(item?.lotDetails ? item?.lotDetails : [], "qty")}
                        value={item?.qty ? item?.qty : 0}
                        disabled={true}
                        onChange={(event) => {
                            if (event.target.value < 0) return
                            if (!event.target.value) {
                                handleInputChange(0, index, "qty");
                                return
                            }
                            handleInputChange(event.target.value, index, "qty", item?.balanceQty);
                        }}
                        onKeyDown={e => {
                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                        }}
                        min={"0"}
                        onBlur={(e) => {
                            if (!e.target.value) {
                                handleInputChange(0.000, index, "qty", item?.balanceQty);
                                return
                            }
                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty", item?.balanceQty)
                        }}
                    />
                </td>
                <td className='text-right px-1  table-data'>{parseFloat(item?.price).toFixed(2)}</td>
                <td className='text-right   table-data'>{(parseFloat(item?.price) * parseFloat(sumArray(item?.returnLotDetails ? item?.returnLotDetails : [], "qty"))).toFixed(2)}</td>
                {!readOnly &&
                    <td className='table-data w-12'>
                        <div tabIndex={-1} onClick={() => removeItem(item?.poItemsId)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                            {DELETE}
                        </div>
                    </td>
                }
            </tr>
        </>
    )
}

export default FabricDirectItem

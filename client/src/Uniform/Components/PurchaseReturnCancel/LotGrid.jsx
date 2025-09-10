import React from 'react'
import { PLUS } from '../../../icons';
import { Delete } from '../../../Buttons';
import { sumArray } from '../../../Utils/helper';
import { toast } from 'react-toastify';

export function YarnLotGrid({ isDirect, returnLotDetails, handleInputChangeLotNo, index, balanceQty, balanceBags, readOnly, addNewLotNo, removeLotNo, onClose }) {
    return (
        <table className='table-fixed w-[500px]'>
            <thead className='border text-sm'>
                <th className='table-data text-center'>Lot No</th>
                <th className='table-data  text-center'>No. Of Bags</th>
                <th className='table-data  text-center'>Wg/Per</th>
                <th className='table-data text-center'>Qty</th>
                {!readOnly &&
                    <th className='table-data text-center'>
                        <button className='text-green-500' onClick={() => { addNewLotNo(index, returnLotDetails[0] ? returnLotDetails[0].weightPerBag : "0.000") }} >{PLUS}</button>
                    </th>
                }
            </thead>
            <tbody>
                {returnLotDetails.map((item, lotIndex) =>
                    <tr className='table-row' key={lotIndex}>
                        <td className='text-center table-data'>
                            <input
                                autoFocus={index === 0}
                                onKeyDown={e => {
                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                    if (e.key === "Delete") { handleInputChangeLotNo("", index, lotIndex, "lotNo", balanceQty); }
                                }}
                                type="text"
                                className="text-right rounded py-1   w-full table-data-input"
                                value={item.lotNo}
                                disabled={true}
                                onChange={(event) => {
                                    handleInputChangeLotNo(event.target.value, index, lotIndex, "lotNo", balanceQty);
                                }}
                            />
                        </td>
                        <td className='text-center table-data'>
                            <input
                                onKeyDown={e => {
                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                    if (e.key === "Delete") { handleInputChangeLotNo(0, index, lotIndex, "noOfBags", balanceQty); }
                                }}
                                min={"0"}
                                type="number"
                                className="text-right rounded py-1   w-full table-data-input"
                                value={item.noOfBags}
                                disabled={readOnly}
                                onChange={(event) => {
                                    if (!event.target.value) {
                                        handleInputChangeLotNo(0, index, lotIndex, "noOfBags", balanceQty);
                                        return
                                    }
                                    let value = event.target.value;
                                    let totalBagsExcludeCurrent = sumArray(returnLotDetails.filter((_, index) => index !== lotIndex), "noOfBags")
                                    if (parseFloat(balanceBags) < (parseFloat(totalBagsExcludeCurrent) + parseFloat(value))) {
                                        toast.info("Inward Bags Can not be more than balance Bags", { position: 'top-center' })
                                        return
                                    }
                                    handleInputChangeLotNo(event.target.value, index, lotIndex, "noOfBags", balanceQty);
                                }}
                                onBlur={(e) => {
                                    if (!e.target.value) {
                                        handleInputChangeLotNo(0, index, lotIndex, "noOfBags", balanceQty)
                                        return
                                    }
                                    handleInputChangeLotNo(e.target.value, index, lotIndex, "noOfBags", balanceQty)
                                }}
                            />
                        </td>
                        <td className='text-center table-data'>
                            <input
                                onKeyDown={e => {
                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                    if (e.key === "Delete") { handleInputChangeLotNo(0, index, lotIndex, "weightPerBag", balanceQty); }
                                }}
                                min={"0"}
                                type="number"
                                className="text-right rounded py-1   w-full table-data-input"
                                value={item.weightPerBag}
                                disabled={readOnly}
                                onChange={(event) => {
                                    if (!event.target.value) {
                                        handleInputChangeLotNo(0, index, lotIndex, "weightPerBag", balanceQty);
                                        return
                                    }
                                    handleInputChangeLotNo(event.target.value, index, lotIndex, "weightPerBag", balanceQty);
                                }}
                                onBlur={(e) => {
                                    if (!e.target.value) {
                                        handleInputChangeLotNo(0, index, lotIndex, "weightPerBag", balanceQty)
                                        return
                                    }
                                    handleInputChangeLotNo(e.target.value, index, lotIndex, "weightPerBag", balanceQty)
                                }}
                            />
                        </td>
                        <td className='text-center table-data'>
                            <input
                                onKeyDown={e => {
                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                    if (e.key === "Delete") { handleInputChangeLotNo(0, index, lotIndex, "noOfBags", balanceQty); }
                                }}
                                min={"0"}
                                type="number"
                                className="text-right rounded py-1  w-full table-data-input"
                                value={item.qty}
                                disabled={readOnly}
                                onChange={(event) => {
                                    if (!event.target.value) {
                                        handleInputChangeLotNo(0, index, lotIndex, "qty", balanceQty);
                                        return
                                    }
                                    handleInputChangeLotNo(event.target.value, index, lotIndex, "qty", balanceQty);
                                }}
                                onBlur={(e) => {
                                    if (!e.target.value) {
                                        handleInputChangeLotNo(0, index, lotIndex, "qty", balanceQty)
                                        return
                                    }
                                    handleInputChangeLotNo(e.target.value, index, lotIndex, "qty", balanceQty)
                                }}
                            />
                        </td>
                        {!readOnly &&
                            <th className='table-data text-center'>
                                <Delete onClick={() => { removeLotNo(index, lotIndex) }} />
                            </th>
                        }
                    </tr>
                )}
                <tr className='table-row'>
                    <td>Total</td>
                    <td className='text-right'>{sumArray(returnLotDetails, "noOfBags")}</td>
                    <td></td>
                    <td className='text-right'>{(sumArray(returnLotDetails, "qty")).toFixed(3)}</td>
                    {!readOnly &&
                        <td></td>
                    }
                </tr>
                {isDirect
                    ?
                    <tr className='table-row'>
                        <td colSpan={3} ></td>
                        {!readOnly &&
                            <>
                                <td className='w-full'><button className='w-full bg-blue-500 text-white' onClick={onClose}>Done</button></td>
                            </>
                        }
                    </tr>
                    :
                    <tr className='table-row'>
                        <td>Balance</td>
                        <td className='text-right'>{balanceBags}</td>
                        <td></td>
                        <td className='text-right'>{balanceQty}</td>
                        {!readOnly &&
                            <>
                                <td className='w-full'><button className='w-full bg-blue-500 text-white' onClick={onClose}>Done</button></td>
                            </>
                        }
                    </tr>
                }
            </tbody>
        </table>
    )
}

export function FabricLotGrid({ value, returnLotDetails, handleInputChangeLotNo, index, readOnly, addNewLotNo, removeLotNo, onClose, balanceQty, isDirect }) {
    return (
        <table className='table-fixed w-[500px]'>
            <thead className='border text-sm'>
                <th className='table-data text-center'>Lot No</th>
                <th className='table-data text-center'>Inward Rolls</th>
                <th className='table-data text-center'>Inward Qty</th>
                <th className='table-data text-center'>Return Rolls</th>
                <th className='table-data text-center'>Return Qty</th>
                <th className='table-data text-center'>Stock Qty</th>

                <th className='table-data text-center'>Allowed Qty</th>

                <th className='table-data  text-center'>No. Of Rolls</th>
                <th className='table-data text-center'>Qty</th>
                {!readOnly &&
                    <th className='table-data text-center'>
                        <button className='text-green-500' onClick={() => { addNewLotNo(index) }} >{PLUS}</button>
                    </th>
                }
            </thead>
            <tbody>
                {returnLotDetails?.map((item, lotIndex) =>
                    <tr className='table-row' key={lotIndex}>
                        <td className='text-center table-data'>
                            <input
                                autoFocus={index === 0}
                                onKeyDown={e => {
                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                    if (e.key === "Delete") { handleInputChangeLotNo("", index, lotIndex, "lotNo", balanceQty); }
                                }}
                                type="text"
                                className="text-right rounded py-1   w-full table-data-input"
                                value={item.lotNo}
                                disabled={true}
                                onChange={(event) => {
                                    handleInputChangeLotNo(event.target.value, index, lotIndex, "lotNo", balanceQty);
                                }}
                            />
                        </td>
                        <td className='text-right px-1  table-data'>{item?.inwardNoOfRolls || 0}</td>
                        <td className='text-right px-1  table-data'>{item?.inwardQty || 0}</td>

                        <td className='text-right px-1  table-data'>{item?.alreadyReturnedRolls || 0}</td>
                        <td className='text-right px-1  table-data'>{item?.alreadyReturnedQty || 0}</td>
                        <td className='text-right px-1  table-data'>{item?.stockQty || 0}</td>


                        <td className='text-right px-1  table-data'>{item?.allowedReturnQty || 0}</td>

                        <td className='text-center table-data'>
                            <input
                                onKeyDown={e => {
                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                    if (e.key === "Delete") { handleInputChangeLotNo(0, index, lotIndex, "noOfRolls"); }
                                }}
                                min={"0"}
                                type="number"
                                className="text-right rounded py-1   w-full table-data-input"
                                value={item.noOfRolls}
                                disabled={readOnly}
                                onChange={(event) => {
                                    if (!event.target.value) {
                                        handleInputChangeLotNo(0, index, lotIndex, "noOfRolls");
                                        return
                                    }
                                    handleInputChangeLotNo(event.target.value, index, lotIndex, "noOfRolls");
                                }}
                            />
                        </td>
                        <td className='text-center table-data'>
                            <input
                                onKeyDown={e => {
                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                    if (e.key === "Delete") { handleInputChangeLotNo(0, index, lotIndex, "noOfBags", balanceQty); }
                                }}
                                min={"0"}
                                type="number"
                                className="text-right rounded py-1  w-full table-data-input"
                                value={item.qty}
                                disabled={readOnly}
                                onChange={(event) => {
                                    if (!event.target.value) {
                                        handleInputChangeLotNo(0, index, lotIndex, "qty", item?.stockQty, item?.allowedReturnQty);
                                        return
                                    }
                                    handleInputChangeLotNo(event.target.value, index, lotIndex, "qty", item?.stockQty, item?.allowedReturnQty);
                                }}
                                onBlur={(e) => {
                                    if (!e.target.value) {
                                        handleInputChangeLotNo(0, index, lotIndex, "qty", item?.stockQty, item?.allowedReturnQty)
                                        return
                                    }
                                    handleInputChangeLotNo(e.target.value, index, lotIndex, "qty", item?.stockQty, item?.allowedReturnQty)
                                }}
                            />
                        </td>
                        {!readOnly &&
                            <th className='table-data text-center'>
                                <Delete onClick={() => { removeLotNo(index, lotIndex) }} />
                            </th>
                        }
                    </tr>
                )}
                <tr className='table-row'>
                    <td colSpan={7}>Total</td>
                    <td className='text-right'>{sumArray(returnLotDetails, "noOfRolls") || 0}</td>
                    <td className='text-right'>{(sumArray(returnLotDetails, "qty")).toFixed(3) || 0}</td>
                    {!readOnly &&
                        <td></td>
                    }
                </tr>
                {isDirect
                    ?
                    <tr className='table-row'>
                        <td colSpan={3} ></td>
                        {!readOnly &&
                            <>
                                <td className='w-full'><button className='w-full bg-blue-500 text-white' onClick={onClose}>Done</button></td>
                            </>
                        }
                    </tr>
                    :
                    <tr className='table-row'>
                        {/* <td colSpan={2}>Balance Qty</td> */}
                        <td colSpan={9} className='pt-2'></td>
                        {/* <td className='w-full' colSpan={1}></td>
                        <td className='text-right'>{balanceQty}</td> */}
                        {!readOnly &&
                            <>
                                <td className='w-full pt-2'><button className='w-full p-1 bg-blue-500 text-white' onClick={onClose}>Done</button></td>
                            </>
                        }
                    </tr>
                }
            </tbody>
        </table >
    )
}


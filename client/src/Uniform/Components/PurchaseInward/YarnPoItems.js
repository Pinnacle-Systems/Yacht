import React, { useEffect, useState } from 'react';
import { DELETE, PLUS } from '../../../icons';
import { useGetYarnMasterQuery } from '../../../redux/uniformService/YarnMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';

import { toast } from "react-toastify"
import { Loader } from '../../../Basic/components';
import { VIEW } from '../../../icons';
import TaxDetailsFullTemplate from '../TaxDetailsCompleteTemplate';
import Modal from '../../../UiComponents/Modal';
import { priceWithTax, sumArray } from '../../../Utils/helper'
import { YarnLotGrid } from './LotGrid';

const YarnPoItems = ({ id, transType, poItems, setPoItems, readOnly, params, isSupplierOutside, taxTypeId, greyFilter }) => {
    const [currentSelectedLotGrid, setCurrentSelectedLotGrid] = useState(false)
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")
    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(poItems);
        newBlend[index][field] = value;
        if (field === "yarnId") {
            newBlend[index]["taxPercent"] = findYarnTax(value)
        }
        if (field !== "qty") {
            newBlend[index]["qty"] = (parseFloat(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])).toFixed(3)
        }
        setPoItems(newBlend);
    };


    useEffect(() => {
        if (poItems.length >= 12) return
        setPoItems(prev => {
            let newArray = Array.from({ length: 12 - prev.length }, i => {
                return {
                    yarnId: "", qty: "0.000", taxPercent: "0.000", colorId: "", uomId: "", price: "0.00", discountType: "Percentage",
                    discountValue: "0.00",
                    noOfBags: "0", weightPerBag: "0.000",
                    lotDetails: [{ lotNo: "", noOfBags: "0", weightPerBag: "0.000", qty: "0.000" }]
                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [transType, setPoItems, poItems])


    const addRow = () => {
        const newRow = {
            yarnId: "", qty: "", taxPercent: "0.000", colorId: "", uomId: "", price: "", discountType: "Percentage",
            discountValue: "0.00",
            lotDetails: [{ lotNo: "", noOfBags: "0", weightPerBag: "0.000", qty: "0.000" }]
        };
        setPoItems([...poItems, newRow]);
    };
    const handleDeleteRow = id => {
        setPoItems(yarnBlend => yarnBlend.filter((row, index) => index !== parseInt(id)));
    };

    const { data: yarnList } =
        useGetYarnMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined } });

    const { data: uomList } =
        useGetUomQuery({ params });

    function findYarnTax(id) {
        if (!yarnList) return 0
        let yarnItem = yarnList.data.find(item => parseInt(item.id) === parseInt(id))
        return yarnItem ? yarnItem.taxPercent : 0
    }


    if (!yarnList || !colorList || !uomList) return <Loader />

    function getTotals(field) {
        const total = poItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(sumArray(current.lotDetails, field))
        }, 0)
        return parseFloat(total)
    }

    function getGross() {
        const total = poItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(sumArray(current?.lotDetails ? current?.lotDetails : [], "qty")
                * current["price"])
        }, 0)
        return parseFloat(total)
    }

    function handleInputChangeLotNo(value, index, lotIndex, field, balanceQty) {
        setPoItems(poItems => {
            const newBlend = structuredClone(poItems);
            if (!newBlend[index]["lotDetails"]) return poItems
            newBlend[index]["lotDetails"][lotIndex][field] = value;
            let totalQtyExcludeCurrentIndex = sumArray(newBlend[index]["lotDetails"].filter((_, index) => index != lotIndex), "qty")
            if ((field === "weightPerBag" || field === "noOfBags") && newBlend[index]["lotDetails"][lotIndex]["noOfBags"] && newBlend[index]["lotDetails"][lotIndex]["weightPerBag"]) {
                let tempInwardQty = (parseFloat(newBlend[index]["lotDetails"][lotIndex]["noOfBags"]) * parseFloat(newBlend[index]["lotDetails"][lotIndex]["weightPerBag"])).toFixed(3)
                let currentOverAllQty = parseFloat(tempInwardQty) + parseFloat(totalQtyExcludeCurrentIndex)
                // if (parseFloat(balanceQty) < parseFloat(currentOverAllQty)) {
                //     toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                //     return poItems
                // }
                newBlend[index]["lotDetails"][lotIndex]["qty"] = tempInwardQty
            }
            if (field === "qty") {
                // let currentOverAllQty = parseFloat(value) + parseFloat(totalQtyExcludeCurrentIndex)
                // if (parseFloat(balanceQty) < parseFloat(currentOverAllQty)) {
                //     toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
                //     return poItems
                // }
                let qty = parseInt(newBlend[index]["lotDetails"][lotIndex]["noOfBags"]) * parseFloat(newBlend[index]["lotDetails"][lotIndex]["weightPerBag"])
                let excessQty = parseInt(newBlend[index]["lotDetails"][lotIndex]["noOfBags"]) * 2
                if ((qty + excessQty) < parseFloat(value)) {
                    toast.info("Excess Qty Cannot be More than 2kg Per Bag", { position: 'top-center' })
                    return poItems
                }
            }
            return newBlend
        });
    }
    function addNewLotNo(index, weightPerBag) {
        setPoItems(poItems => {
            const newBlend = structuredClone(poItems);
            if (!newBlend[index]) return poItems
            if (newBlend[index]["lotDetails"]) {
                newBlend[index]["lotDetails"] = [
                    ...newBlend[index]["lotDetails"],
                    { lotNo: "", qty: "0.000", noOfBags: 0, weightPerBag }]
            } else {
                newBlend[index]["lotDetails"] = [{ lotNo: "", qty: "0.000", noOfBags: 0, weightPerBag }]
            }
            return newBlend
        })
    }
    function removeLotNo(index, lotIndex) {
        setPoItems(poItems => {
            const newBlend = structuredClone(poItems);
            if (!newBlend[index]["lotDetails"]) return poItems
            newBlend[index]["lotDetails"] = newBlend[index]["lotDetails"].filter((_, index) => index != lotIndex)
            return newBlend
        })
    }
    let selectedRow = Number.isInteger(currentSelectedLotGrid) ? poItems[currentSelectedLotGrid] : ""
    let taxItems = poItems.map(item => {
        let newItem = structuredClone(item)
        newItem["qty"] = sumArray(newItem.lotDetails, "qty")
        return newItem
    })
    let lotNoArr = selectedRow?.lotDetails ? selectedRow.lotDetails.map(item => item.lotNo) : []
    let isLotNoUnique = new Set(lotNoArr).size == lotNoArr.length
    function onClose() {
        if (!isLotNoUnique) {
            toast.info("Lot No Should be Unique", { position: "top-center" })
            return
        }
        setCurrentSelectedLotGrid(false)
    }
    return (
        <>
            <Modal widthClass={"max-h-[600px] overflow-auto"} onClose={onClose} isOpen={Number.isInteger(currentSelectedLotGrid)}>
                <YarnLotGrid
                    isDirect
                    readOnly={readOnly}
                    onClose={onClose}
                    addNewLotNo={addNewLotNo}
                    removeLotNo={removeLotNo}
                    handleInputChangeLotNo={handleInputChangeLotNo}
                    index={currentSelectedLotGrid}
                    lotDetails={selectedRow?.lotDetails ? selectedRow?.lotDetails : []} />
            </Modal>
            <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                <TaxDetailsFullTemplate readOnly={readOnly} setCurrentSelectedIndex={setCurrentSelectedIndex}
                    taxTypeId={taxTypeId} currentIndex={currentSelectedIndex} poItems={taxItems}
                    handleInputChange={handleInputChange} isSupplierOutside={isSupplierOutside} />
            </Modal>
            <div className={` relative w-full overflow-y-auto py-1`}>
                <table className=" border border-gray-500 text-xs table-auto  w-full">
                    <thead className='bg-blue-200 top-0 border-b border-gray-500'>
                        <tr >
                            <th className="table-data  w-2 text-center">S.no</th>
                            <th className="table-data ">Items<span className="text-red-500">*</span></th>
                            <th className="table-data ">Colors<span className="text-red-500">*</span></th>
                            <th className="table-data  w-20">UOM<span className="text-red-500">*</span></th>
                            <th className="table-data  w-10">Lot Det.<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">No. of Bags<span className="text-red-500">*</span></th>
                            {/* <th className="table-data  w-16">Weight Per Bag<span className="text-red-500">*</span></th> */}
                            <th className="table-data  w-16">Quantity<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">Price<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">Price(with Tax)<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">Gross</th>
                            <th className="table-data  w-20">View Tax</th>
                            {readOnly ?
                                "" :
                                <th className='w-20  bg-green-600 text-white'>
                                    <div onClick={addRow}
                                        className='hover:cursor-pointer w-full h-full flex items-center justify-center'>
                                        {PLUS}
                                    </div>
                                </th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto h-full w-full'>
                        {poItems.map((row, index) => (

                            <tr key={index} className="w-full table-row">
                                <td className="table-data w-2 text-left px-1 py-1">
                                    {index + 1}
                                </td>

                                <td className='table-data'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "yarnId") } }}
                                        tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
                                        value={row.yarnId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "yarnId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "yarnId")
                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? yarnList.data : yarnList.data.filter(item => item.active)).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.aliasName}
                                            </option>)}
                                    </select>
                                </td>

                                <td className='table-data'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                        disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "colorId")
                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? colorList.data : colorList.data.filter(item => item.active)).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='table-data'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                        disabled={readOnly} className='text-left w-20 rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                        onBlur={(e) => {
                                            handleInputChange((e.target.value), index, "uomId")
                                        }
                                        }
                                    >

                                        <option hidden>
                                        </option>
                                        {(id ? uomList.data : uomList.data.filter(item => item.active)).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='text-center table-data'>
                                    <button onClick={() => setCurrentSelectedLotGrid(index)} className='w-full'>
                                        {VIEW}
                                    </button>
                                </td>
                                <td className='table-data'>
                                    <input
                                        onKeyDown={e => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0", index, "noOfBags") }
                                        }}
                                        min={"0"}
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 w-16 px-1 table-data-input"
                                        value={sumArray(row?.lotDetails ? row?.lotDetails : [], "noOfBags")}
                                        disabled={true}
                                        inputMode='decimal'
                                        onChange={(e) => {
                                            handleInputChange(e.target.value, index, "noOfBags")
                                        }
                                        }
                                        onBlur={(e) => {
                                            handleInputChange(parseFloat(e.target.value), index, "noOfBags")
                                        }
                                        }

                                    />
                                </td>
                                {/* <td className='table-data'>
                                        <input
                                            onKeyDown={e => {
                                                if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                if (e.key === "Delete") { handleInputChange("0", index, "weightPerBag") }
                                            }}
                                            min={"0"}
                                            type="number"
                                            onFocus={(e) => e.target.select()}
                                            className="text-right rounded py-1 w-16 px-1 table-data-input"
                                            value={(!row.weightPerBag) ? 0 : row.weightPerBag}
                                            disabled={readOnly}
                                            inputMode='decimal'
                                            onChange={(e) =>
                                                handleInputChange(e.target.value, index, "weightPerBag")
                                            }
                                            onBlur={(e) => {

                                                handleInputChange(parseFloat(e.target.value).toFixed(3), index, "weightPerBag")

                                            }
                                            }
                                        />
                                    </td> */}
                                <td className='table-data'>
                                    <input
                                        onKeyDown={e => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                        }}
                                        min={"0"}
                                        type="number"
                                        className="text-right rounded py-1 px-1 w-16 table-data-input"
                                        onFocus={(e) => e.target.select()}
                                        value={sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")}
                                        disabled={true}
                                        onChange={(e) =>
                                            handleInputChange(e.target.value, index, "qty")
                                        }
                                        onBlur={(e) => {
                                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty");
                                        }
                                        }
                                    />
                                </td>

                                <td className='table-data'>
                                    <input
                                        onKeyDown={e => {
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0.00", index, "price") }
                                        }}
                                        min={"0"}
                                        type="number"
                                        className="text-right rounded py-1 w-16 px-1 table-data-input"
                                        onFocus={(e) => e.target.select()}
                                        value={(!row.price) ? 0 : row.price}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            handleInputChange(e.target.value, index, "price")
                                        }
                                        onBlur={(e) => {
                                            handleInputChange(parseFloat(e.target.value).toFixed(2), index, "price");

                                        }
                                        }
                                    />
                                </td>
                                <td className='table-data text-right px-1'>
                                    {priceWithTax(row.price, row.taxPercent).toFixed(2)}
                                </td>
                                <td className='table-data'>
                                    <input
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 w-16 px-1 table-data-input"
                                        value={(!row.price || !row.price) ? 0 : (parseFloat(sumArray(row?.lotDetails ? row?.lotDetails : [], "qty")) * parseFloat(row.price)).toFixed(2)}
                                        disabled={true}
                                    />
                                </td>
                                <td className='table-data'>
                                    <button
                                        className="text-center rounded py-1 w-20"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                setCurrentSelectedIndex(index);
                                            }
                                        }}
                                        onClick={() => {
                                            if (!taxTypeId) return toast.info("Please select Tax Type", { position: "top-center" });
                                            setCurrentSelectedIndex(index)
                                        }}>
                                        {VIEW}
                                    </button>
                                </td>
                                {readOnly
                                    ?
                                    ""
                                    :
                                    <td className='table-data w-20'>
                                        <div tabIndex={-1} onClick={() => handleDeleteRow(index)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer'>
                                            {DELETE}
                                        </div>
                                    </td>
                                }
                            </tr>
                        ))}
                        <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>
                            <td className="table-data text-center w-10 font-bold" colSpan={4}>Total</td>
                            <td className="table-data  w-10"></td>
                            <td className="table-data text-right px-1 w-10">{getTotals("noOfBags").toFixed(3)}</td>
                            <td className="table-data text-right px-1 w-10">{getTotals("qty").toFixed(3)}</td>
                            <td className="table-data  w-10"></td>
                            <td className="table-data  w-10"></td>
                            <td className="table-data text-right px-1  w-10">{getGross().toFixed(2)} </td>
                            <td className="table-data   w-10"></td>
                            {!readOnly &&
                                <td className="table-data w-10"></td>
                            }
                        </tr>

                    </tbody>
                </table>

            </div>
        </>
    )
}

export default YarnPoItems
import React, { useEffect, useState } from 'react';
import { DELETE, PLUS } from '../../../icons';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import { toast } from "react-toastify"
import { Loader } from '../../../Basic/components';
import { VIEW } from '../../../icons';
import Modal from '../../../UiComponents/Modal';
// import TaxDetailsFullTemplate from '../TaxDetailsCompleteTemplate';
import { priceWithTax, sumArray } from '../../../Utils/helper';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import { FabricLotGrid } from './LotGrid';


const FabricPoItems = ({ id, transType, poItems, setPoItems, readOnly, params, isSupplierOutside, taxTypeId, greyFilter }) => {
    const [currentSelectedLotGrid, setCurrentSelectedLotGrid] = useState(false)
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")
    const handleInputChange = (value, index, field) => {

        const newBlend = structuredClone(poItems);
        newBlend[index][field] = value;
        if (field === "fabricId") {
            newBlend[index]["taxPercent"] = findYarnTax(value)
        }
        setPoItems(newBlend);
    };

    useEffect(() => {
        if (poItems.length >= 12) return
        setPoItems(prev => {
            let newArray = Array.from({ length: 12 - prev.length }, i => {
                return {
                    fabricId: "", qty: "0.000", noOfRolls: "0", colorId: "", taxPercent: "0.000", uomId: "", gaugeId: "", designId: "",
                    gsmId: "", loopLengthId: "", kDiaId: "", fDiaId: "", price: "", discountType: "Percentage", discountValue: "0.00",
                    returnLotDetails: [{ lotNo: "", noOfRolls: "0", qty: "0.000" }]
                };
            })
            return [...prev, ...newArray]
        }
        )
    }, [transType, setPoItems, poItems])


    function handleInputChangeLotNo(value, index, lotIndex, field) {
        setPoItems(poItems => {
            const newBlend = structuredClone(poItems);
            if (!newBlend[index]["returnLotDetails"]) return poItems
            newBlend[index]["returnLotDetails"][lotIndex][field] = value;

            if (field == "noOfRolls") {
                let totalValue = newBlend[index]["returnLotDetails"].reduce((accumulator, currentValue) => accumulator + parseInt(currentValue?.noOfRolls), 0);
                newBlend[index][field] = totalValue;
            }
            if (field == "qty") {
                let totalValue = parseFloat(newBlend[index]["returnLotDetails"].reduce((accumulator, currentValue) => accumulator + parseFloat(currentValue?.qty), 0)).toFixed(3);
                newBlend[index][field] = totalValue;
            }

            return newBlend
        });
    }

    const addRow = () => {
        const newRow = { fabricId: "", colorId: "", uomId: "", taxPercent: "0.000", gaugeId: "", designId: "", gsmId: "", loopLengthId: "", kDiaId: "", fDiaId: "", qty: "", price: "", noOfRolls: "", discountType: "Percentage", discountValue: "0.00", inwardreturnLotDetails: [{ lotNo: "", noOfRolls: "0", qty: "0.000" }] };
        setPoItems([...poItems, newRow]);
    };
    const handleDeleteRow = id => {
        setPoItems(yarnBlend => yarnBlend.filter((row, index) => index !== parseInt(id)));
    };

    const { data: fabricList } =
        useGetFabricMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined } });


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


    function findYarnTax(id) {
        if (!fabricList) return 0

        let yarnItem = fabricList.data.find(item => parseInt(item.id) === parseInt(id))
        return yarnItem?.taxPercent ? yarnItem.taxPercent : 0
    }

    function getTotals(field) {
        const total = poItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field] ? current[field] : 0)
        }, 0)
        return parseFloat(total)
    }

    function getGross(field1, field2) {
        const total = poItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field1] && current[field2] ? current[field1] * current[field2] : 0)
        }, 0)
        return parseFloat(total)
    }


    if (!fabricList || !colorList || !uomList || !gaugeList || !designList || !gsmList || !loopLengthList || !diaList) return <Loader />

    function addNewLotNo(index, weightPerBag) {
        setPoItems(poItems => {
            const newBlend = structuredClone(poItems);
            if (!newBlend[index]) return poItems
            if (newBlend[index]["returnLotDetails"]) {
                newBlend[index]["returnLotDetails"] = [
                    ...newBlend[index]["returnLotDetails"],
                    { lotNo: "", qty: "0.000", noOfRolls: 0, weightPerBag }]
            } else {
                newBlend[index]["returnLotDetails"] = [{ lotNo: "", qty: "0.000", noOfRolls: 0, weightPerBag }]
            }
            return newBlend
        })
    }
    function removeLotNo(index, lotIndex) {
        setPoItems(poItems => {
            const newBlend = structuredClone(poItems);
            if (!newBlend[index]["returnLotDetails"]) return poItems
            newBlend[index]["returnLotDetails"] = newBlend[index]["returnLotDetails"].filter((_, index) => index != lotIndex)
            return newBlend
        })
    }

    let selectedRow = Number.isInteger(currentSelectedLotGrid) ? poItems[currentSelectedLotGrid] : ""
    // let taxItems = poItems.map(item => {
    //     let newItem = structuredClone(item)
    //     newItem["qty"] = sumArray(newItem.returnLotDetails, "qty")
    //     return newItem
    // })

    let lotNoArr = selectedRow?.returnLotDetails ? selectedRow.returnLotDetails.map(item => item.lotNo) : []
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
            {
                poItems.length !== 0 ?
                    <>
                        <Modal widthClass={"max-h-[600px] overflow-auto"} onClose={onClose} isOpen={Number.isInteger(currentSelectedLotGrid)}>
                            <FabricLotGrid
                                isDirect
                                readOnly={readOnly}
                                onClose={onClose}
                                addNewLotNo={addNewLotNo}
                                removeLotNo={removeLotNo}
                                handleInputChangeLotNo={handleInputChangeLotNo}
                                index={currentSelectedLotGrid}
                                returnLotDetails={selectedRow?.returnLotDetails ? selectedRow?.returnLotDetails : []} />
                        </Modal>
                        {/* <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                            <TaxDetailsFullTemplate setCurrentSelectedIndex={setCurrentSelectedIndex} taxTypeId={taxTypeId}
                                currentIndex={currentSelectedIndex} poItems={taxItems} handleInputChange={handleInputChange}
                                isSupplierOutside={isSupplierOutside} readOnly={readOnly} />
                        </Modal> */}
                        <div className={`w-full`}>
                            <table className="border border-gray-500 text-xs table-fixed w-full">
                                <thead className='bg-gray-300 top-0 border border-gray-500'>
                                    <tr>
                                        <th className="table-data w-10 text-center">S.no</th>
                                        <th className="table-data ">Items<span className="text-red-500">*</span></th>
                                        <th className="table-data ">Colors<span className="text-red-500">*</span></th>
                                        <th className="table-data ">Design<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">Gauge<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">LL<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">GSM<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">K Dia<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">F Dia<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">UOM<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-10">Lot Det.<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">No. Of Rolls<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">Quantity<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">Price<span className="text-red-500">*</span></th>
                                        {/* <th className="table-data  w-16">Price(with Tax)<span className="text-red-500">*</span></th> */}
                                        <th className="table-data  w-16">Gross</th>
                                        <th className="table-data  w-16">Tax</th>

                                        {/* <th className="table-data  w-16">View Tax</th> */}
                                        {readOnly ?
                                            "" :
                                            <th className='w-20  bg-green-600 text-white'>
                                                <div onClick={addRow}
                                                    className='hover:cursor-pointer py-2 flex items-center justify-center bg-green-600 text-white'>
                                                    {PLUS}
                                                </div>
                                            </th>
                                        }
                                    </tr>
                                </thead>
                                <tbody className='overflow-y-auto  h-full w-full'>
                                    {poItems.map((row, index) => (
                                        <tr key={index} className="w-full table-row">
                                            <td className="table-data  text-left px-1">
                                                {index + 1}
                                            </td>
                                            <td className='table-data text-left px-1'>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "fabricId") } }}
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "fabricId")
                                                    }
                                                    }
                                                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.fabricId}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "fabricId")}>
                                                    <option hidden>
                                                    </option>
                                                    {(id ? fabricList.data : fabricList.data.filter(item => item.active)).map((blend) =>
                                                        <option value={blend.id} key={blend.id} >
                                                            {blend.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='table-data text-left px-1'>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                                    onBlur={(e) => {
                                                        handleInputChange(e.target.value, index, "colorId")
                                                    }}
                                                >
                                                    onBlur
                                                    <option hidden>
                                                    </option>
                                                    {(id ? colorList.data : colorList.data.filter(item => item.active)).map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='table-data text-left px-1'>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "designId") } }}
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "designId")

                                                    }
                                                    }
                                                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.designId}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "designId")}>
                                                    <option hidden>
                                                    </option>
                                                    {(id ? designList.data : designList.data.filter(item => item.active)).map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='table-data text-right px-1'>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "gaugeId") } }}
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "gaugeId")

                                                    }
                                                    }
                                                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.gaugeId}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "gaugeId")}>
                                                    <option hidden>
                                                    </option>
                                                    {(id ? gaugeList.data : gaugeList.data.filter(item => item.active)).map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='table-data text-right px-1'>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "loopLengthId") } }}
                                                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.loopLengthId}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "loopLengthId")}
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "loopLengthId")

                                                    }
                                                    }
                                                >
                                                    <option hidden>
                                                    </option>
                                                    {(id ? loopLengthList.data : loopLengthList.data.filter(item => item.active)).map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='table-data text-right px-1'>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "gsmId") } }}
                                                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.gsmId}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "gsmId")}
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "gsmId")

                                                    }
                                                    }
                                                >
                                                    <option hidden>
                                                    </option>
                                                    {(id ? gsmList.data : gsmList.data.filter(item => item.active)).map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='table-data text-right px-1'>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "kDiaId") } }}
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "kDiaId")

                                                    }
                                                    }
                                                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.kDiaId} onChange={(e) => handleInputChange(e.target.value, index, "kDiaId")}>
                                                    <option hidden>
                                                    </option>
                                                    {(id ? diaList.data : diaList.data.filter(item => item.active)?.filter(val => val.kDia)).map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='table-data text-right px-1'>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "fDiaId") } }}
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "fDiaId")

                                                    }
                                                    }
                                                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.fDiaId}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "fDiaId")}>
                                                    <option hidden>
                                                    </option>
                                                    {(id ? diaList.data : diaList.data.filter(item => item.active)?.filter(val => val.fDia)).map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='table-data text-left px-1'>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}


                                                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "uomId")

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
                                            <td className='table-data '>
                                                <input
                                                    type="number"
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                        if (e.key === "Delete") { handleInputChange("0.000", index, "noOfRolls") }
                                                    }}
                                                    min={"0"}
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                                    // value={sumArray(row?.returnLotDetails ? row?.returnLotDetails : [], "noOfRolls")}
                                                    value={row?.noOfRolls ? row?.noOfRolls : 0}
                                                    disabled={true}
                                                    onChange={(e) =>
                                                        handleInputChange(parseFloat(e.target.value), index, "noOfRolls")
                                                    }
                                                    onBlur={(e) => {

                                                        handleInputChange(parseFloat(e.target.value), index, "noOfRolls");


                                                    }
                                                    }
                                                />
                                            </td>
                                            <td className='table-data '>
                                                <input
                                                    type="number"
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                        if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                                    }}
                                                    min={"0"}
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                                    // value={sumArray(row?.returnLotDetails ? row?.returnLotDetails : [], "qty")}
                                                    value={row?.qty ? row?.qty : 0}

                                                    disabled={true}
                                                    onChange={(e) =>
                                                        handleInputChange(parseFloat(e.target.value), index, "qty")
                                                    }
                                                    onBlur={(e) => {
                                                        handleInputChange(parseFloat(e.target.value), index, "qty");
                                                    }
                                                    }
                                                />
                                            </td>
                                            <td className='table-data '>
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                        if (e.key === "Delete") { handleInputChange("0.00", index, "price") }
                                                    }}
                                                    min={"0"}
                                                    type="number"
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 px-1 w-16 table-data-input"
                                                    value={(!row.price) ? 0 : row.price}
                                                    disabled={readOnly}
                                                    onChange={(e) =>
                                                        handleInputChange(e.target.value, index, "price")
                                                    }
                                                    onBlur={(e) => {

                                                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "price");

                                                    }
                                                    }
                                                />
                                            </td>
                                            {/* <td className='table-data text-right px-1 '>
                                                {priceWithTax(row.price, row.taxPercent).toFixed(2)}
                                            </td> */}
                                            <td className='table-data '>
                                                <input
                                                    className="text-right  rounded py-1 px-1 w-16 table-data-input"
                                                    value={(!row.price || !row.price) ? 0 : (parseFloat(sumArray(row?.returnLotDetails ? row?.returnLotDetails : [], "qty")) * parseFloat(row.price)).toFixed(2)}
                                                    disabled={true}
                                                    onFocus={(e) => e.target.select()}
                                                />
                                            </td>
                                            <td className='table-data '>
                                                <input
                                                    type="number"
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                        if (e.key === "Delete") { handleInputChange("0", index, "taxPercent") }
                                                    }}
                                                    min={"0"}
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                                    value={(!row.taxPercent) ? 0 : row.taxPercent}
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.tax)}
                                                    onChange={(e) =>
                                                        handleInputChange(e.target.value, index, "taxPercent")
                                                    }
                                                    onBlur={(e) => {

                                                        handleInputChange(parseFloat(e.target.value), index, "taxPercent");


                                                    }
                                                    }
                                                />
                                            </td>
                                            {/* <td className='table-data text-right px-1 w-16 table-data-input'>
                                                <button
                                                    className="text-center rounded py-1 w-full"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            setCurrentSelectedIndex(index);
                                                        }
                                                    }}
                                                    onClick={() => {
                                                        if (!taxTypeId) return toast.info("Please select Tax Type", { position: "top-center" });
                                                        setCurrentSelectedIndex(index)
                                                    }
                                                    }
                                                >
                                                    {VIEW}
                                                </button>
                                            </td> */}
                                            {readOnly
                                                ?
                                                ""
                                                :
                                                <td className=''>
                                                    <div tabIndex={-1} onClick={() => handleDeleteRow(index)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                                                        {DELETE}
                                                    </div>
                                                </td>
                                            }
                                        </tr>
                                    ))}
                                    <tr className='bg-gray-300 w-full border border-gray-400 h-7 font-bold'>
                                        <td className="table-data text-center w-10 font-bold" colSpan={10}>Total</td>
                                        <td className="table-data  w-10"></td>
                                        <td className="table-data   w-10"></td>
                                        <td className="table-data text-right px-1 w-10">{getTotals("qty").toFixed(3)}</td>
                                        <td className="table-data   w-10"></td>
                                        <td className="table-data text-right px-1  w-10">{getGross("qty", "price").toFixed(2)} </td>
                                        <td className="table-data   w-10"></td>

                                        {!readOnly &&
                                            <td className="table-data w-10"></td>
                                        }
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                    :
                    <div></div>
            }
        </>
    )
}

export default FabricPoItems
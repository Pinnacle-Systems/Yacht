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
import TaxDetailsFullTemplate from '../TaxDetailsCompleteTemplate';
import { priceWithTax } from '../../../Utils/helper';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import { discountTypes } from '../../../Utils/DropdownData';


const FabricPoItems = ({ id, transType, poItems, setPoItems, readOnly, params, isSupplierOutside, taxTypeId, greyFilter }) => {
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
                return { fabricId: "", qty: "0.000", colorId: "", taxPercent: "0.000", uomId: "", gaugeId: "", designId: "", gsmId: "", loopLengthId: "", kDiaId: "", fDiaId: "", price: "", discountType: "Percentage", discountValue: "0.00" };
            })
            return [...prev, ...newArray]
        }
        )
    }, [transType, setPoItems, poItems])


    const addRow = () => {
        const newRow = { fabricId: "", qty: "", colorId: "", uomId: "", taxPercent: "0.000", gaugeId: "", designId: "", gsmId: "", loopLengthId: "", kDiaId: "", fDiaId: "", qty: "", price: "", discountType: "Percentage", discountValue: "0.00" };
        setPoItems([...poItems, newRow]);
    };
    const handleDeleteRow = id => {
        setPoItems(yarnBlend => yarnBlend.filter((row, index) => index !== parseInt(id)));
    };

    const { data: fabricList } =
        useGetFabricMasterQuery({ params });



    const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching } =
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

    function findIdInYarnBlend(id) {
        return poItems ? poItems.find(blend => parseInt(blend.fabricId) === parseInt(id)) : false
    }
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
            return accumulator + parseFloat(current[field1] || current[field2] ? current[field1] * current[field2] : 0)
        }, 0)
        return parseFloat(total)
    }



    function getTotalAmount(qty, price, tax, discountType, disAmount) {
        const total = poItems.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[qty] || current[price] ? findAmount(current[qty], current[price], current[tax], current[discountType], current[disAmount]) : 0)
        }, 0)
        return parseFloat(total)
    }


    const findAmount = (qty, price, tax, discountType, disAmount) => {
        let taxAmount = 0;
        let grossAmount = parseFloat((parseFloat(qty) * parseFloat(price)) || 0).toFixed(2);
        let dicountAmount = 0;

        if (tax !== "") {
            let percentage = parseFloat(tax) / 100

            taxAmount = parseFloat(parseFloat(grossAmount) * percentage).toFixed(2)
        }

        if (discountType == "Flat") {
            dicountAmount = parseFloat(disAmount).toFixed(2)
        }
        else if (discountType == "Percentage") {
            let percentage = parseFloat(disAmount) / 100
            dicountAmount = parseFloat(parseFloat(grossAmount) * percentage).toFixed(2)
        }


        return (((parseFloat(grossAmount || 0) + parseFloat(taxAmount || 0)) - parseFloat(dicountAmount || 0)) || 0)

    }


    if (!fabricList || !colorList || !uomList || !gaugeList || !designList || !gsmList || !loopLengthList || !diaList) return <Loader />



    return (
        <>
            {
                poItems.length !== 0 ?
                    <>
                        <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                            <TaxDetailsFullTemplate readOnly={readOnly} setCurrentSelectedIndex={setCurrentSelectedIndex} taxTypeId={taxTypeId} currentIndex={currentSelectedIndex} poItems={poItems} handleInputChange={handleInputChange} isSupplierOutside={isSupplierOutside} />
                        </Modal>
                        <div className={`w-full`}>
                            <table className="border border-gray-500 text-xs table-fixed w-full">
                                <thead className='bg-blue-200 top-0 border border-gray-500'>
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
                                        <th className="table-data  w-16">Quantity<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">Price<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">Gross</th>
                                        <th className="table-data  w-16">Tax</th>
                                        <th className="table-data  w-16">Dis.Type</th>
                                        <th className="table-data  w-16">Dis.Value</th>
                                        {/* <th className="table-data  w-16">Price(with Tax)<span className="text-red-500">*</span></th> */}
                                        <th className="table-data  w-16">Amount</th>
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
                                <tbody className='overflow-y-auto  h-full w-full'>{console.log(poItems, "poItems")}
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
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)} className='text-left w-full rounded py-1 table-data-input' value={row.fabricId}
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
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
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
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)} className='text-left w-full rounded py-1 table-data-input' value={row.designId}
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
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)} className='text-left w-full rounded py-1 table-data-input' value={row.gaugeId}
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
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)} className='text-left w-full rounded py-1 table-data-input' value={row.loopLengthId}
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
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)} className='text-left w-full rounded py-1 table-data-input' value={row.gsmId}
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
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)} className='text-left w-full rounded py-1 table-data-input' value={row.kDiaId} onChange={(e) => handleInputChange(e.target.value, index, "kDiaId")}>
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
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)} className='text-left w-full rounded py-1 table-data-input' value={row.fDiaId}
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


                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)} className='text-left w-full rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
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
                                                    value={(!row.qty) ? 0 : row.qty}
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)}
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
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)}
                                                    onChange={(e) =>
                                                        handleInputChange(e.target.value, index, "price")
                                                    }
                                                    onBlur={(e) => {

                                                        handleInputChange(parseFloat(e.target.value).toFixed(3), index, "price");

                                                    }
                                                    }
                                                />
                                            </td>

                                            <td className='table-data '>
                                                <input
                                                    className="text-right  rounded py-1 px-1 w-16 table-data-input"
                                                    value={(!row.qty || !row.price) ? 0 : (parseFloat(row.qty) * parseFloat(row.price))}
                                                    disabled={true}
                                                    onFocus={(e) => e.target.select()}
                                                />
                                            </td>


                                            <td className='table-data '>
                                                <input
                                                    type="number"
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                        if (e.key === "Delete") { handleInputChange("0", index, "tax") }
                                                    }}
                                                    min={"0"}
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                                    value={(!row.tax) ? 0 : row.tax}
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.tax)}
                                                    onChange={(e) =>
                                                        handleInputChange(e.target.value, index, "tax")
                                                    }
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "tax");


                                                    }
                                                    }
                                                />
                                            </td>
                                            <td className='table-data '>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "discountType") } }}


                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)}
                                                    className='text-left w-full rounded py-1 table-data-input'
                                                    value={row.discountType}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "discountType")}
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "discountType")

                                                    }
                                                    }
                                                >
                                                    <option hidden>
                                                    </option>
                                                    {(discountTypes || []).map((blend) =>
                                                        <option value={blend.value} key={blend.value}>
                                                            {blend.show}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='table-data '>
                                                <input
                                                    type="number"
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                        if (e.key === "Delete") { handleInputChange("0.000", index, "discountAmount") }
                                                    }}
                                                    min={"0"}
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                                    value={(!row.discountAmount) ? 0 : row.discountAmount}
                                                    disabled={readOnly || Boolean(row?.alreadyInwardedData?._sum?.qty)}
                                                    onChange={(e) =>
                                                        handleInputChange(e.target.value, index, "discountAmount")
                                                    }
                                                    onBlur={(e) => {

                                                        handleInputChange(e.target.value, index, "discountAmount");


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
                                                    // value={(!row.qty || !row.price) ? 0 : (parseFloat(row.qty) * parseFloat(row.price))}
                                                    value={findAmount(row.qty, row.price, row.tax, row.discountType, row.discountAmount)}
                                                    disabled={true}
                                                    onFocus={(e) => e.target.select()}
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
                                                    {(Boolean(row?.alreadyInwardedData?._sum?.qty)) ?
                                                        ""
                                                        :
                                                        <div tabIndex={-1} onClick={() => handleDeleteRow(index)}
                                                            className='flex justify-center px-2 py-1.5 items-center cursor-pointer'>
                                                            {DELETE}
                                                        </div>
                                                    }
                                                </td>
                                            }
                                        </tr>
                                    ))}
                                    <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>
                                        <td className="table-data text-center w-10 font-bold" colSpan={10}>Total</td>
                                        <td className="table-data text-right px-1 w-10">{getTotals("qty").toFixed(3)}</td>
                                        <td className="table-data  w-10"></td>
                                        <td className="table-data text-right px-1  w-10">{getGross("qty", "price").toFixed(2)} </td>
                                        <td className="table-data  w-10"></td>
                                        <td className="table-data  w-10"></td>
                                        <td className="table-data  w-10"></td>
                                        {/* <td className="table-data   w-10"></td> */}
                                        <td className="table-data text-right px-1  w-10">{getTotalAmount("qty", "price", "tax", "discountType", "discountAmount").toFixed(2)} </td>
                                        {/* <td className="table-data   w-10"></td> */}
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
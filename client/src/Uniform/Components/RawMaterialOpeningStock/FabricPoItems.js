import React, { useEffect } from 'react';
import { DELETE, PLUS } from '../../../icons';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import {  useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import { Loader } from '../../../Basic/components';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService';


const FabricPoItems = ({ id, transType, poItems, setPoItems, readOnly, params, greyFilter }) => {
    const handleInputChange = (value, index, field) => {
        console.log(field, index, value);
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
        const newRow = { fabricId: "", qty: "", colorId: "", uomId: "", taxPercent: "0.000", gaugeId: "", designId: "", gsmId: "", loopLengthId: "", kDiaId: "", fDiaId: "", price: "", discountType: "Percentage", discountValue: "0.00" };
        setPoItems([...poItems, newRow]);
    };
    const handleDeleteRow = id => {
        setPoItems(yarnBlend => yarnBlend.filter((_, index) => index !== parseInt(id)));
    };

    const { data: fabricList } =
        useGetFabricMasterQuery({ params });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined } });


    const { data: processList } = useGetProcessMasterQuery({ params: { ...params, isPcsStage: false } });


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
        console.log(id, "id")
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


    if (!fabricList || !colorList || !uomList || !gaugeList || !designList || !gsmList || !loopLengthList || !diaList) return <Loader />


    return (
        <>
            {
                poItems.length !== 0 ?
                    <>
                        <div className={`w-full`}>
                            <table className="border border-gray-500 text-xs table-fixed w-full">
                                <thead className='bg-blue-200 top-0 border border-gray-500'>
                                    <tr>
                                        <th className="table-data w-10 text-center">S.no</th>
                                        <th className="table-data ">Prev. Process<span className="text-red-500">*</span></th>
                                        <th className="table-data ">Items<span className="text-red-500">*</span></th>
                                        <th className="table-data ">Colors<span className="text-red-500">*</span></th>
                                        <th className="table-data ">Design<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">Gauge<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">LL<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">GSM<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">K Dia<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">F Dia<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">UOM<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">Lot No<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">No Of Rolls<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">Quantity<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">Price<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">Gross</th>
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
                                            <td className='table-data'>
                                                <select
                                                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "prevProcessId") } }}
                                                    tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
                                                    value={row.prevProcessId}
                                                    onChange={(e) => handleInputChange(e.target.value, index, "prevProcessId")}
                                                    onBlur={(e) => {
                                                        handleInputChange((e.target.value), index, "prevProcessId")
                                                    }
                                                    }
                                                >
                                                    <option value={""}>
                                                    </option>
                                                    {(id ? (processList?.data ? processList?.data : []) : (processList?.data ? processList?.data : []).filter(item => item.active)).map((blend) =>
                                                        <option value={blend.id} key={blend.id}>
                                                            {blend.name}
                                                        </option>)}
                                                </select>
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
                                                    {(id ? diaList.data : diaList.data.filter(item => item.active)).map((blend) =>
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
                                                    {(id ? diaList.data : diaList.data.filter(item => item.active)).map((blend) =>
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
                                            <td className='table-data'>
                                                <input
                                                    onKeyDown={e => {
                                                        if (e.key === "Delete") { handleInputChange("0", index, "lotNo") }
                                                    }}
                                                    min={"0"}
                                                    type="text"
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 w-16 px-1 table-data-input"
                                                    value={(!row.lotNo) ? 0 : row.lotNo}
                                                    disabled={readOnly}
                                                    inputMode='decimal'
                                                    onChange={(e) => {
                                                        handleInputChange(e.target.value, index, "lotNo")
                                                    }
                                                    }
                                                    onBlur={(e) => {
                                                        handleInputChange(parseFloat(e.target.value), index, "lotNo")
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
                                                    value={(!row.qty) ? 0 : row.qty}
                                                    disabled={readOnly}
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
                                                    type="number"
                                                    onKeyDown={e => {
                                                        if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                                        if (e.key === "Delete") { handleInputChange("0.000", index, "noOfRolls") }
                                                    }}
                                                    min={"0"}
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 px-1 w-full table-data-input"
                                                    value={(!row.noOfRolls) ? 0 : row.noOfRolls}
                                                    disabled={readOnly}
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
                                            <td className='table-data'>
                                                <input
                                                    type="number"
                                                    onFocus={(e) => e.target.select()}
                                                    className="text-right rounded py-1 w-16 px-1 table-data-input"
                                                    value={(!row.qty || !row.price) ? 0 : (parseFloat(row.qty) * parseFloat(row.price)).toFixed(2)}
                                                    disabled={true}
                                                />
                                            </td>
                                            {readOnly
                                                ?
                                                ""
                                                :
                                                <td className=''>
                                                    <div tabIndex={-1} onClick={() => handleDeleteRow(index)}
                                                        className='flex justify-center px-2 py-1.5 items-center cursor-pointer'>
                                                        {DELETE}
                                                    </div>
                                                </td>
                                            }
                                        </tr>
                                    ))}
                                    <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>
                                        <td className="table-data text-center w-10 font-bold" colSpan={11}>Total</td>
                                        <td className="table-data  w-10"></td>
                                        <td className="table-data text-right px-1 w-10">{getTotals("qty").toFixed(3)}</td>
                                        <td className="table-data text-right px-1 w-10">{getTotals("noOfRolls").toFixed(3)}</td>
                                        <td className="table-data  w-10"></td>
                                        <td className="table-data text-right px-1  w-10">{getGross("qty", "price").toFixed(2)} </td>
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
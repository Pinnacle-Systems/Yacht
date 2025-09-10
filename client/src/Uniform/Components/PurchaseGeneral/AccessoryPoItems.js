import React, { useEffect, useState } from 'react';
import { DELETE, PLUS } from '../../../icons';
import { useGetAccessoryMasterQuery } from '../../../redux/uniformService/AccessoryMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { toast } from "react-toastify"
import { Loader } from '../../../Basic/components';
import { VIEW } from '../../../icons';
import TaxDetailsFullTemplate from '../TaxDetailsCompleteTemplate';

import Modal from '../../../UiComponents/Modal';
import { priceWithTax } from '../../../Utils/helper';
import { discountTypes } from '../../../Utils/DropdownData';
import { useGetAccessoryGroupMasterQuery } from '../../../redux/uniformService/AccessoryGroupMasterServices';
import { useGetAccessoryItemMasterQuery } from '../../../redux/uniformService/AccessoryItemMasterServices';

const AccessoryPoItems = ({ id, poItems, setPoItems, readOnly, params, isSupplierOutside, taxTypeId }) => {

    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("")

    const handleInputChange = (value, index, field) => {

        const newBlend = structuredClone(poItems);
        newBlend[index][field] = value;
        if (field === "accessoryId") {
            newBlend[index]["taxPercent"] = findYarnTax(value)
        }
        setPoItems(newBlend);
    };

    useEffect(() => {
        if (poItems.length >= 12) return
        setPoItems(prev => {
            let newArray = Array.from({ length: 12 - prev.length }, i => {
                return { accessoryItemId: "", accessoryGroupId: "", accessoryId: "", qty: "", colorId: "", taxPercent: "0.000", sizeId: "", uomId: "", qty: "", price: "", discountType: "Percentage", discountValue: 0 }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setPoItems, poItems])

    const addRow = () => {
        const newRow = { accessoryItemId: "", accessoryGroupId: "", accessoryId: "", qty: "", colorId: "", taxPercent: "0.000", sizeId: "", uomId: "", qty: "", price: "", discountType: "Percentage", discountValue: 0 };
        setPoItems([...poItems, newRow]);
    };
    const handleDeleteRow = id => {
        setPoItems(yarnBlend => yarnBlend.filter((row, index) => index !== parseInt(id)));
    };

    const { data: accessoryGroupList } =
        useGetAccessoryGroupMasterQuery({ params })

    const { data: accessoryItemList } =
        useGetAccessoryItemMasterQuery({ params })

    const { data: accessoryList } =
        useGetAccessoryMasterQuery({ params })

    const { data: colorList } =
        useGetColorMasterQuery({ params });

    const { data: uomList } =
        useGetUomQuery({ params });

    const { data: sizeList } =
        useGetSizeMasterQuery({ params });

    function findAccessoryItemName(id) {
        if (!accessoryList) return 0
        let acc = accessoryList.data.find(item => parseInt(item.id) === parseInt(id))
        return acc ? acc.accessoryItem.name : null
    }

    function findAccessoryGroupName(id) {
        if (!accessoryList) return 0
        let acc = accessoryList.data.find(item => parseInt(item.id) === parseInt(id))
        return acc ? acc.accessoryItem.AccessoryGroup.name : null
    }

    function findYarnTax(id) {
        if (!accessoryList) return 0
        let yarnItem = accessoryList.data.find(item => parseInt(item.id) === parseInt(id))
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


    if (!accessoryList || !colorList || !uomList || !sizeList) return <Loader />

    return (
        <>

            <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                <TaxDetailsFullTemplate readOnly={readOnly} taxTypeId={taxTypeId} currentIndex={currentSelectedIndex} poItems={poItems} handleInputChange={handleInputChange} isSupplierOutside={isSupplierOutside} />
            </Modal>
            <div className={` relative w-full overflow-y-auto p-3`}>
                <table className=" border border-gray-500 text-xs table-auto w-full">
                    <thead className='bg-blue-200 top-0 border border-gray-500'>
                        <tr>
                            <th className="table-data  w-2 text-center">S.no</th>


                            <th className="table-data  w-36">Accessory Group</th>
                            <th className="table-data  w-36">Accessory Item</th>
                            <th className="table-data ">Accessory Name<span className="text-red-500">*</span></th>
                            <th className="table-data ">Colors<span className="text-red-500">*</span></th>
                            <th className="table-data  w-20">Size<span className="text-red-500">*</span></th>
                            <th className="table-data  w-20">UOM<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">Quantity<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">Price<span className="text-red-500">*</span></th>
                            <th className="table-data  w-16">Gross</th>
                            <th className="table-data  w-16">Tax</th>
                            <th className="table-data  w-16">Dis.Type</th>
                            <th className="table-data  w-16">Dis.Value</th>

                            <th className="table-data  w-16">Amount</th>
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
                                <td className="table-data  w-2 text-left px-1">
                                    {index + 1}
                                </td>
                                <td className=' border border-gray-500'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryGroupId") } }}
                                        disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.accessoryGroupId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryGroupId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryGroupId")

                                        }
                                        }
                                    >
                                        <option hidden>{console.log(accessoryGroupList, "accessoryGroupList")}
                                        </option>
                                        {(id ? (accessoryGroupList?.data || []) : accessoryGroupList?.data.filter(item => item.active) || []).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className=' border border-gray-500'>{console.log(accessoryItemList, "accessoryItemList")}
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryItemId") } }}
                                        disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.accessoryItemId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryItemId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryItemId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? (accessoryItemList?.data || []) : accessoryItemList?.data?.filter(item => item.active && item?.accessoryGroupId == row?.accessoryGroupId) || []).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className=' border border-gray-500'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryId") } }}
                                        disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.accessoryId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "accessoryId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "accessoryId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {/* handleInputChange(e.target.value, index, "accessoryItemId") */}
                                        {(id ? (accessoryList.data || []) : accessoryList.data.filter(item => item.active && item?.accessoryItemId == row?.accessoryItemId) || []).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.aliasName}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                {/* <td className='table-data'>
                                    <input
                                        type="text-left px-1"
                                        onFocus={(e) => e.target.select()}
                                        className="text-center rounded w-36 py-1 table-data-input"
                                        value={findAccessoryItemName(row.accessoryId)}
                                        disabled={true}

                                    />
                                </td>
                                <td className='table-data'>
                                    <input
                                        type="text"
                                        onFocus={(e) => e.target.select()}
                                        className="text-center rounded w-36 py-1 table-data-input"
                                        value={findAccessoryGroupName(row.accessoryId)}
                                        disabled={true}
                                    />
                                </td> */}
                                <td className='table-data'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                        disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "colorId")

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
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                        disabled={readOnly} className='text-left w-20 rounded py-1 table-data-input' value={row.sizeId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                        onBlur={(e) => {

                                            handleInputChange(e.target.value, index, "sizeId")

                                        }
                                        }
                                    >
                                        <option hidden>
                                        </option>
                                        {(id ? sizeList.data : sizeList.data.filter(item => item.active)).map((blend) =>
                                            <option value={blend.id} key={blend.id}>
                                                {blend.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className='table-data'>
                                    <select
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                                        disabled={readOnly} className='text-left w-20 rounded py-1 table-data-input' value={row.uomId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
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
                                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                            if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
                                        }}
                                        min={"0"}
                                        type="number"
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-16 table-data-input"
                                        value={(!row.qty) ? 0 : row.qty}
                                        disabled={readOnly}
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
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-16 table-data-input"
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

                                {readOnly
                                    ?
                                    ""
                                    :
                                    <td className=''>
                                        {(row?.alreadyInwardedData?._sum?.qty) ?
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
                            <td className="table-data text-center w-10 font-bold" colSpan={7}>Total</td>
                            <td className="table-data text-right px-1 w-10">{getTotals("qty").toFixed(3)}</td>
                            <td className="table-data  w-10"></td>

                            <td className="table-data text-right px-1  w-10">{getGross("qty", "price").toFixed(2)} </td>
                            <td className="table-data   w-10"></td>
                            <td className="table-data   w-10"></td>
                            <td className="table-data   w-10"></td>
                            <td className="table-data text-right px-1  w-10">{getTotalAmount("qty", "price", "tax", "discountType", "discountAmount").toFixed(2)} </td>
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

export default AccessoryPoItems
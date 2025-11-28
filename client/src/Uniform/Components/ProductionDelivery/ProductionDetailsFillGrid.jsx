import React, { useEffect, useState } from 'react'
import { findFromList } from '../../../Utils/helper';

const ProductionDetailsFillGrid = ({ productionEntryItems, setProductionEntryItems, setFillGrid, styleData, styleItemList, fabricList, colorList, portionList, processList }) => {
    const [localProductionEntryItems, setLocalProductionEntryItems] = useState([]);
    const isRowEmpty = (row) =>
        !row.styleId &&
        !row.styleItemId &&
        !row.fabricId &&
        !row.colorId &&
        !row.portionId &&
        !row.orderQty &&
        !row.issueQty &&
        !row.remarks;

    function handleDone() {
        setProductionEntryItems((prev) => {
            let updated = [...prev];

            // 1️⃣ Find ALL empty rows first
            const emptyRowIndices = updated.reduce((indices, row, index) => {
                if (isRowEmpty(row)) {
                    indices.push(index);
                }
                return indices;
            }, []);

            console.log("Empty row indices:", emptyRowIndices);

            // 2️⃣ Fill empty rows with our items
            localProductionEntryItems.forEach((item, i) => {
                const newRow = {
                    ...item,
                    styleItemId: item.styleItemId ?? "",
                    fabricId: item.fabricId ?? "",
                    colorId: item.colorId ?? "",
                    portionId: item.portionId ?? "",
                    styleId: item.styleId ?? "",
                    stkQty: item.stkQty ?? ""
                };

                // If we have an empty row at this position, use it
                if (i < emptyRowIndices.length) {
                    updated[emptyRowIndices[i]] = newRow;
                }
                // Otherwise, append to the end
                else {
                    updated.push(newRow);
                }
            });

            return updated;
        });

        setFillGrid(false);
    }



    function handleCancel() {
        setLocalProductionEntryItems([]);
        setFillGrid(false);
    }

    // if (!data?.data || isFetching || isLoading) return <Loader />

    function addItem(item) {
        setLocalProductionEntryItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems.push(item);
            newItems = newItems?.map(j => { return { ...j, delQty: j.qty } })
            return newItems
        });
    }


    function removeItem(removeItem) {
        setLocalProductionEntryItems(localInwardItems => {
            return localInwardItems.filter(item =>
                !(removeItem.itemId === item.itemId
                    &&
                    removeItem.prevProcessId === item.prevProcessId
                    &&
                    removeItem.sizeId === item.sizeId
                    &&
                    removeItem.colorId === item.colorId
                )
            )
        });
    }

    function isItemChecked(checkItem) {
        let item = localProductionEntryItems.find(item =>
            checkItem.itemId === item.itemId
            &&
            checkItem.prevProcessId === item.prevProcessId
            &&
            checkItem.sizeId === item.sizeId
            &&
            checkItem.colorId === item.colorId
        )
        if (!item) return false
        return true
    }


    function handleCheckBoxChange(value, item) {
        if (value) {
            addItem(item)
        } else {
            removeItem(item)
        }
    }

    function handleSelectAllChange(value) {
        if (value) {
            (styleData ? styleData : []).forEach(item => addItem(item))
        } else {
            (styleData ? styleData : []).forEach(item => removeItem(item))
        }
    }

    function getSelectAll() {
        return (styleData ? styleData : []).every(item => isItemChecked(item))
    }


    return (
        <div
            className="bg-black/30 backdrop-blur-sm flex items-center justify-center "
        >
            <div className="w-[1000px] bg-white  shadow-2xl overflow-hidden">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-2 flex justify-between items-center">
                    <h2 className="text-sm font-semibold tracking-wide">Stock Items</h2>
                    {/* <button
                        className="px-3 py-1 bg-white/20 border border-white/30 text-white rounded-md hover:bg-white/30 transition"
                        onClick={handleDone}
                    >
                        Done
                    </button> */}
                </div>

                {/* TABLE CONTENT */}
                <div className="overflow-auto h-[350px]">
                    <table className="w-full text-xs border border-gray-200">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr className='border border-gray-200'>
                                <th className="px-2 py-1 w-10">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-medium mb-[2px]">Select</span>
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer"
                                            onChange={(e) => handleSelectAllChange(e.target.checked)}
                                            checked={getSelectAll()}
                                        />
                                    </div>
                                </th>
                                <th className="p-2 ">S.No</th>
                                <th className="p-2 ">Style</th>
                                <th className="p-2 ">Fabric</th>
                                <th className="p-2 ">Color</th>
                                <th className="p-2 ">Portion</th>
                                <th className="p-2 ">Prev Process</th>
                                <th className="p-2 ">Stock Qty</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(styleData || []).map((item, index) => (
                                <tr
                                    key={index}
                                    className={`border-b hover:bg-gray-50 cursor-pointer ${isItemChecked(item) ? "bg-gray-50" : ""
                                        }`}
                                    onClick={() =>
                                        handleCheckBoxChange(!isItemChecked(item), item)
                                    }
                                >
                                    <td className="text-center py-2">
                                        <input
                                            type="checkbox"
                                            className="cursor-pointer"
                                            checked={isItemChecked(item)}
                                        />
                                    </td>

                                    <td className="text-center">{index + 1}</td>
                                    <td className="text-center">{findFromList(item.styleItemId, styleItemList?.data, "name")}</td>
                                    <td className="text-center">{findFromList(item.fabricId, fabricList?.data, "name")}</td>
                                    <td className="text-center">{findFromList(item.colorId, colorList?.data, "name")}</td>
                                    <td className="text-center">{findFromList(item.portionId, portionList?.data, "name")}</td>
                                    <td className="text-center">{findFromList(item.prevProcessId, processList?.data, "name")}</td>
                                    <td className="text-center pr-2">{item.stkQty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div className="flex justify-end p-3 bg-gray-50">
                    <button
                        className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        onClick={handleDone}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );

}

export default ProductionDetailsFillGrid;
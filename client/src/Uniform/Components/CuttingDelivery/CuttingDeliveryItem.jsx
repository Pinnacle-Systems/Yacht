import {
    useGetStyleMasterQuery,
    useLazyGetStyleCodeDetailQuery,
} from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useLazyGetSizeTemplateByIdQuery } from "../../../redux/uniformService/SizeTemplateMasterServices";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { findFromList } from "../../../Utils/helper";
import { IMAGE_UPLOAD_URL } from "../../../Constants";
import secureLocalStorage from "react-secure-storage";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { VIEW } from "../../../icons";
import { useGetPortionMasterQuery } from "../../../redux/uniformService/PortionMasterService";

export default function CuttingDeliveryItem({
    cuttingDeliveryItems,
    setCuttingDeliveryItems,
    params,
    readOnly,
    id,
}) {
    const [contextMenu, setContextMenu] = useState(null);
    const { data: sizeList } = useGetSizeMasterQuery({ params });
    const { data: colorList } = useGetColorMasterQuery({ params });
    const { data: fabricList } = useGetFabricMasterQuery({ params });
    const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
    const { data: portionList } = useGetPortionMasterQuery({ params });

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    );

    const addRow = () => {
        const newRow = {
            styleNo: "",
            styleItemId: "",
            fabricId: "",
            colorId: "",
            styleId: "",
            sizeId: "",
            fabWidth: "",
            fabMeter: "",
            portionId: "",
            orderQty: "",
            issueQty: "",
            remarks: "",
            selected: false,
        };
        setCuttingDeliveryItems([...cuttingDeliveryItems, newRow]);
    };

    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(cuttingDeliveryItems);
        newBlend[index][field] = value;
        setCuttingDeliveryItems(newBlend);
        console.log("index", index);
    };

    const deleteRow = (id) => {
        setCuttingDeliveryItems((currentRows) => {
            if (currentRows.length > 1) {
                return currentRows.filter((row, index) => index !== parseInt(id));
            }
            return currentRows;
        });
    };

    const deleteSelectedRows = () => {
        setCuttingDeliveryItems((rows) => rows.filter((r) => !r.selected));
        setContextMenu(null);
    };

    const handleDeleteAllRows = () => {
        setCuttingDeliveryItems((prevRows) => {
            if (prevRows.length <= 1) return prevRows;
            return [prevRows[0]];
        });
    };

    const handleRightClick = (event, rowIndex = 0, type) => {
        event.preventDefault();
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            rowId: rowIndex,
            type,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    useEffect(() => {
        if (cuttingDeliveryItems) {
            setCuttingDeliveryItems((prev) => {
                const filledRows = prev.length;

                if (filledRows < 6) {
                    // add empty rows until total becomes 6
                    return [
                        ...prev,
                        ...Array.from({ length: 6 - filledRows }, () => ({
                            styleNo: "",
                            styleItemId: "",
                            fabricId: "",
                            colorId: "",
                            fabWidth: "",
                            fabMeter: "",
                            portionId: "",
                            sizeId: "",
                            orderQty: "",
                            remarks: "",
                            selected: false,
                            issueQty: "",
                        })),
                    ];
                }
                return prev; // if already >= 6, just keep as it is
            });
        } else {
            // if null/undefined, initialize with 6 empty rows
            setCuttingDeliveryItems(
                Array.from({ length: 6 }, () => ({
                    styleNo: "",
                    styleItemId: "",
                    fabricId: "",
                    colorId: "",
                    fabWidth: "",
                    fabMeter: "",
                    portionId: "",
                    sizeId: "",
                    orderQty: "",
                    remarks: "",
                    selected: false,
                    issueQty: "",
                }))
            );
        }
    }, [cuttingDeliveryItems, setCuttingDeliveryItems]);

    return (
        <>
            <div className="border border-slate-200  bg-white rounded-md shadow-sm max-h-[450px] px-2 overflow-auto overflow-x-auto w-full">
                <div className="flex justify-between items-center mb-2 m-2">
                    <h2 className="font-medium text-slate-700">Cutting Delivery Items</h2>
                </div>
                <div className={`w-full max-h-[300px]  overflow-y-auto  my-1`}>
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px]`}
                                >
                                    S.No
                                </th>
                                <th
                                    className={`w-48 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Style
                                </th>
                                <th
                                    className={`w-44 px-4 py-2 text-center font-medium text-[13px]`}
                                >
                                    Fabric
                                </th>
                                {/* <th
                  className={`w-12 px-4 py-2 text-center  font-medium text-[13px]`}
                >
                  Img
                </th>{" "} */}
                                <th
                                    className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Color
                                </th>

                                <th
                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Width
                                </th>
                                <th
                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Meter
                                </th>
                                <th
                                    className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Portion
                                </th>
                                <th
                                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Size
                                </th>
                                <th
                                    className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                                >
                                    Plan Qty
                                </th>
                                <th
                                    className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                                >
                                    Production Qty
                                </th>
                                <th
                                    className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                                >
                                    Consumtion
                                </th>
                                <th
                                    className={`w-48 px-1 py-2 text-center font-medium text-[13px] `}
                                >
                                    Remarks
                                </th>
                                <th className="w-20 px-1 py-1 justify-center font-medium text-[13px]">
                                    <tr className="flex items-center justify-center">Select</tr>
                                    <tr className="flex items-center justify-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={
                                                cuttingDeliveryItems.length > 0 &&
                                                cuttingDeliveryItems.every((row) => row.selected)
                                            }
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setCuttingDeliveryItems((prev) =>
                                                    prev.map((row) => ({ ...row, selected: checked }))
                                                );
                                            }}
                                            onContextMenu={(e) => {
                                                if (!readOnly) {
                                                    handleRightClick(e, "notes");
                                                }
                                            }}
                                            tabIndex={-1}
                                            onFocus={(e) => e.target.blur()}
                                            disabled={readOnly}
                                        />
                                    </tr>
                                </th>
                                <th
                                    className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                                ></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(cuttingDeliveryItems ? cuttingDeliveryItems : [])?.map(
                                (row, index) => (
                                    <tr
                                        className="border border-blue-gray-200 cursor-pointer "
                                        key={index}
                                    >
                                        <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                                            {index + 1}
                                        </td>
                                        <td className="py-0.5 border border-gray-300 text-[11px] ">
                                            <select
                                                onKeyDown={(e) => {
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "styleItemId");
                                                    }
                                                }}
                                                tabIndex={"0"}
                                                disabled={true}
                                                className="text-left w-full rounded py-1 table-data-input"
                                                value={row.styleItemId}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e.target.value,
                                                        index,
                                                        "styleItemId"
                                                    )
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(
                                                        e.target.value,
                                                        index,
                                                        "styleItemId"
                                                    );
                                                }}
                                            >
                                                <option></option>
                                                {(id
                                                    ? styleItemList?.data
                                                    : styleItemList?.data?.filter((item) => item.active)
                                                )?.map((blend) => (
                                                    <option value={blend.id} key={blend.id}>
                                                        {blend?.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-0.5 border border-gray-300 text-[11px] ">
                                            <select
                                                onKeyDown={(e) => {
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "fabricId");
                                                    }
                                                }}
                                                tabIndex={"0"}
                                                disabled={true}
                                                className="text-left w-full rounded py-1 table-data-input"
                                                value={row.fabricId}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "fabricId")
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(e.target.value, index, "fabricId");
                                                }}
                                            >
                                                <option></option>
                                                {(id
                                                    ? fabricList?.data
                                                    : fabricList?.data?.filter((item) => item.active)
                                                )?.map((blend) => (
                                                    <option value={blend.id} key={blend.id}>
                                                        {blend?.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-0.5 border border-gray-300 text-[11px]">
                                            <select
                                                onKeyDown={(e) => {
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "colorId");
                                                    }
                                                }}
                                                tabIndex={"0"}
                                                disabled={true}
                                                className="text-left w-full rounded py-1 table-data-input"
                                                value={row.colorId}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "colorId")
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(e.target.value, index, "colorId");
                                                }}
                                            >
                                                <option></option>
                                                {(id
                                                    ? colorList?.data
                                                    : colorList?.data?.filter((item) => item.active)
                                                )?.map((blend) => (
                                                    <option value={blend.id} key={blend.id}>
                                                        {blend?.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                            <input
                                                onKeyDown={(e) => {
                                                    if (e.code === "Minus" || e.code === "NumpadSubtract")
                                                        e.preventDefault();
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "fabWidth");
                                                    }
                                                }}
                                                min={"0"}
                                                type="number"
                                                className="text-right rounded py-1 px-1 w-full table-data-input"
                                                onFocus={(e) => e.target.select()}
                                                value={row?.fabWidth}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "fabWidth")
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(e.target.value, index, "fabWidth");
                                                }}
                                                disabled={true}
                                            />
                                        </td>
                                        <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                            <input
                                                onKeyDown={(e) => {
                                                    if (e.code === "Minus" || e.code === "NumpadSubtract")
                                                        e.preventDefault();
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "fabMeter");
                                                    }
                                                }}
                                                min={"0"}
                                                type="number"
                                                className="text-right rounded py-1 px-1 w-full table-data-input"
                                                onFocus={(e) => e.target.select()}
                                                value={row?.fabMeter}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "fabMeter")
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(e.target.value, index, "fabMeter");
                                                }}
                                                disabled={true}
                                            />
                                        </td>
                                        <td className="py-0.5 border border-gray-300 text-[11px]">
                                            <select
                                                onKeyDown={(e) => {
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "portionId");
                                                    }
                                                }}
                                                tabIndex={"0"}
                                                disabled={true}
                                                className="text-left w-full rounded py-1 table-data-input"
                                                value={row.portionId}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "portionId")
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(e.target.value, index, "portionId");
                                                }}
                                            >
                                                <option></option>
                                                {(id
                                                    ? portionList?.data
                                                    : portionList?.data?.filter((item) => item.active)
                                                )?.map((blend) => (
                                                    <option value={blend.id} key={blend.id}>
                                                        {blend?.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="py-0.5 border border-gray-300 text-[11px]">
                                            <select
                                                onKeyDown={(e) => {
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "sizeId");
                                                    }
                                                }}
                                                tabIndex={"0"}
                                                disabled={true}
                                                className="text-left w-full rounded py-1 table-data-input"
                                                value={row.sizeId}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "sizeId")
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(e.target.value, index, "sizeId");
                                                }}
                                            >
                                                <option></option>
                                                {(id
                                                    ? sizeList?.data
                                                    : sizeList?.data?.filter((item) => item.active)
                                                )?.map((blend) => (
                                                    <option value={blend.id} key={blend.id}>
                                                        {blend?.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                            <input
                                                onKeyDown={(e) => {
                                                    if (e.code === "Minus" || e.code === "NumpadSubtract")
                                                        e.preventDefault();
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "orderQty");
                                                    }
                                                }}
                                                min={"0"}
                                                type="number"
                                                className="text-right rounded py-1 px-1 w-full table-data-input"
                                                onFocus={(e) => e.target.select()}
                                                value={row?.orderQty}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "orderQty")
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(e.target.value, index, "orderQty");
                                                }}
                                                disabled={true}
                                            />
                                        </td>
                                        <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                            <input
                                                id={`issueQty-input-${index}`}
                                                onKeyDown={(e) => {
                                                    if (e.code === "Minus" || e.code === "NumpadSubtract")
                                                        e.preventDefault();
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "issueQty");
                                                    }
                                                }}
                                                min={"0"}
                                                type="number"
                                                className="text-right rounded py-1 px-1 w-full table-data-input"
                                                onFocus={(e) => e.target.select()}
                                                value={row?.issueQty}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "issueQty")
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(e.target.value, index, "issueQty");
                                                }}
                                                disabled={readOnly}
                                            />
                                        </td>
                                        <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 px-1 text-right">
                                            {row.fabWidth && row.issueQty
                                                ? (row.fabMeter / row.issueQty).toFixed(2)
                                                : ""}
                                        </td>
                                        <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                            <input
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const nextQtyInput = document.querySelector(
                                                            `#issueQty-input-${index + 1}`
                                                        );
                                                        if (nextQtyInput) {
                                                            nextQtyInput.focus();
                                                        }
                                                    }
                                                    if (e.key === "Delete") {
                                                        handleInputChange("", index, "remarks");
                                                    }
                                                }}
                                                type="string"
                                                className="text-left rounded py-1 px-1 w-full table-data-input"
                                                onFocus={(e) => e.target.select()}
                                                value={row?.remarks}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.value, index, "remarks")
                                                }
                                                onBlur={(e) => {
                                                    handleInputChange(e.target.value, index, "remarks");
                                                }}
                                                disabled={readOnly}
                                            />
                                        </td>
                                        <td className="border-blue-gray-200 text-[11px]  border border-gray-300 py-0.5 text-right">
                                            <input
                                                type="checkbox"
                                                checked={row.selected || false}
                                                disabled={readOnly}
                                                onChange={(e) =>
                                                    handleInputChange(e.target.checked, index, "selected")
                                                }
                                                className="justify-center flex items-center mx-auto w-full"
                                                onContextMenu={(e) => {
                                                    if (!readOnly) {
                                                        handleRightClick(e, index, "notes");
                                                    }
                                                }}
                                            />
                                        </td>

                                        <td className="w-2 border border-gray-300">
                                            <input
                                                className="w-full "
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addRow();
                                                    }
                                                }}
                                                disabled={readOnly}
                                            />
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50 h-7 font-medium text-gray-800">
                                <td
                                    className="text-right px-4 border border-gray-300 font-medium text-[13px] py-0.5"
                                    colSpan={8}
                                >
                                    Total
                                </td>
                                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                                    {cuttingDeliveryItems.reduce(
                                        (sum, row) => sum + (Number(row.orderQty) || 0),
                                        0
                                    )}
                                </td>
                                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                                    {cuttingDeliveryItems.reduce(
                                        (sum, row) => sum + (Number(row.issueQty) || 0),
                                        0
                                    )}
                                </td>
                                <td className="border border-gray-300" colSpan={4}></td>
                            </tr>
                        </tfoot>
                    </table>
                    {contextMenu && (
                        <div
                            style={{
                                position: "absolute",
                                top: `${contextMenu.mouseY}px`,
                                left: `${contextMenu.mouseX}px`,
                                boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                                padding: "8px",
                                borderRadius: "4px",
                                zIndex: 1000,
                            }}
                            className="bg-gray-100"
                            onMouseLeave={handleCloseContextMenu}
                        >
                            <div className="flex flex-col gap-1">
                                <button
                                    className=" text-black text-[12px] text-left rounded px-1"
                                    onClick={() => {
                                        deleteSelectedRows();
                                        handleCloseContextMenu();
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

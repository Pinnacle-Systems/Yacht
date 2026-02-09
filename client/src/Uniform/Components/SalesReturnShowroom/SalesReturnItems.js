import { useEffect, useMemo, useState } from "react";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useLazyGetStyleDetailQuery } from "../../../redux/services/StockService";
import { toast } from "react-toastify";
import FxSelect from "../../../Inputs";

export default function SalesReturnItems({
  salesReturnItems,
  setSalesReturnItems,
  params,
  readOnly,
  id,
  sizeList,
  styleItemList,
  colorList,
  uomList,
}) {
  const [barcodeNo, setbarcodeNo] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [getStyleDetail] = useLazyGetStyleDetailQuery();
  const [focusedRowIndex, setFocusedRowIndex] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");
  const [pendingStyleRows, setPendingStyleRows] = useState([]);
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [colorId, setColorId] = useState("");
  const [uniqueColorIds, setUniqueColorIds] = useState([]);
  const addRow = () => {
    const newRow = {
      barcode: "",
      styleId: "",
      sizeId: "",
      returnQty: "",
      remarks: "",
      barcodeNo: "",
      styleItemId: "",
      colorId: "",
      selected: false,
    };
    setSalesReturnItems([...salesReturnItems, newRow]);
  };

  const deleteRow = (id) => {
    setSalesReturnItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== Number(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setSalesReturnItems((prevRows) => {
      if (prevRows.length <= 1) return prevRows;
      return [prevRows[0]];
    });
  };

  const deleteSelectedRows = () => {
    setSalesReturnItems((rows) =>
      rows.filter((r) => !(r.selected && (r.returnQty ?? 0) === 0)),
    );
    setContextMenu(null);
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
    if (salesReturnItems) {
      setSalesReturnItems((prev) => {
        const count = prev.length;

        if (count < 3) {
          return [
            ...prev,
            ...Array.from({ length: 3 - count }, () => ({
              barcode: "",
              styleId: "",
              sizeId: "",
              returnQty: "",
              remarks: "",
              barcodeNo: "",
              styleItemId: "",
              colorId: "",
              selected: false,
            })),
          ];
        }

        return prev; // keep as-is if already >= 6
      });
    } else {
      setSalesReturnItems(
        Array.from({ length: 3 }, () => ({
          barcode: "",
          styleId: "",
          sizeId: "",
          returnQty: "",
          remarks: "",
          barcodeNo: "",
          styleItemId: "",
          colorId: "",
          selected: false,
        })),
      );
    }
  }, [salesReturnItems, setSalesReturnItems]);

  const handleInputChange = async (value, index, field) => {
    if (field === "returnQty") {
      const row = salesReturnItems[index];
      const balanceQty = row?.stkQty || 0;

    }
    setSalesReturnItems((prev) => {
      const newItems = structuredClone(prev);
      newItems[index][field] = value;
      return newItems;
    });
  };

  const fillRows = (rowsToFill) => {
    setSalesReturnItems((prev) => {
      const updated = [...prev];

      let startIndex = updated.findIndex(
        (row) => !row.styleId && !row.sizeId && !row.barcodeNo && !row.barcode,
      );

      if (startIndex === -1) startIndex = updated.length;

      rowsToFill.forEach((row, i) => {
        if (startIndex + i < updated.length) {
          updated[startIndex + i] = row;
        } else {
          updated.push(row);
        }
      });

      while (updated.length < 3) {
        updated.push({
          barcodeNo: "",
          styleId: "",
          sizeId: "",
          returnQty: "",
          remarks: "",
          barcode: "",
          styleItemId: "",
          colorId: "",
          selected: false,
        });
      }

      return updated;
    });
  };

  const handleAddRow = async () => {
    const isFirstTime = salesReturnItems.every(
      (row) => !row.returnQty && !row.rate && !row.styleId && !row.styleItemId,
    );

    if (!isFirstTime) {
      const hasEmpty = salesReturnItems.some((row) => {
        const hasStyle =
          row.styleItemId !== "" &&
          row.styleItemId !== null &&
          row.styleItemId !== undefined;

        return hasStyle && !row.returnQty;
      });

      if (hasEmpty) {
        toast.info("Please fill all required fields...!", {
          position: "top-center",
        });
        return;
      }
    }
    try {
      const { data: styleData } = await getStyleDetail({
        params: {
          barcodeNo: barcodeNo,
        },
      });
      if (styleData?.statusCode === 1) {
        toast.info(styleData.message, {
          position: "top-center",
          autoClose: 2000,
        });
      }
      const styleRows = styleData?.data;
      if (!styleRows) return;
      const colorIds = [
        ...new Set(styleRows.map((row) => row.colorId).filter(Boolean)),
      ];
      setUniqueColorIds(colorIds);
      if (
        colorIds.length < 1 ||
        colorIds.length === 1 ||
        colorIds.length === null
      ) {
        fillRows(styleRows);
      } else if (colorIds.length > 1) {
        setPendingStyleRows(styleRows);
        setShowColorPopup(true);
      }
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };

  return (
    <>
      <div className="border border-slate-200 px-2 bg-white rounded-md shadow-sm max-h-[450px] overflow-auto overflow-x-auto w-full">
        <div className="flex items-center gap-4 sticky top-0 bg-white z-30 mt-2">
          <ReusableInput
            label="Style No"
            value={barcodeNo}
            setValue={setbarcodeNo}
            type={"text"}
            required={true}
            readOnly={readOnly}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                handleAddRow();
              }
            }}
          />
        </div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">Return Item Details</h2>
        </div>
        <div className={`w-full  max-h-[300px] overflow-y-auto  my-1`}>
          <table className=" border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 text-center font-medium text-[13px]">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        salesReturnItems.length > 0 &&
                        salesReturnItems
                          .filter((row) => (row.returnQty ?? 0) === 0)
                          .every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSalesReturnItems((prev) =>
                          prev.map((row) =>
                            (row.returnQty ?? 0) > 0
                              ? row
                              : { ...row, selected: checked },
                          ),
                        );
                      }}
                      onContextMenu={(e) => {
                        if (!readOnly) {
                          handleRightClick(e, "notes");
                        }
                      }}
                      disabled={readOnly}
                      tabIndex={-1}
                    />
                  </div>
                </th>

                <th
                  className={`w-12 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  S.No
                </th>
                <th
                  className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Barcode
                </th>
                <th
                  className={`w-64 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style Item
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Size
                </th>
                <th
                  className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Color
                </th>
                <th
                  className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Unit
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                 Return Qty
                </th>
                <th
                  className={`w-16 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(salesReturnItems ? salesReturnItems : [])?.map((row, index) => (
                <tr
                  className="border border-blue-gray-200 cursor-pointer "
                  key={index}
                >
                  <td className="border-blue-gray-200 text-[11px]  border border-gray-300 py-0.5 text-right">
                    <input
                      type="checkbox"
                      checked={row.selected || false}
                      disabled={readOnly || (row.returnQty ?? 0) > 0}
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
                  <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                    {index + 1}
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-left">
                    <input
                      onKeyDown={(e) => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract")
                          e.preventDefault();
                        if (e.key === "Delete") {
                          handleInputChange("", index, "barcodeNo");
                        }
                      }}
                      className="text-left rounded py-1 px-1 w-full"
                      onFocus={(e) => e.target.select()}
                      value={row?.barcodeNo}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "barcodeNo")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "barcodeNo");
                      }}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px] ">
                    <FxSelect
                      value={row.styleItemId}
                      onChange={(val) =>
                        handleInputChange(val, index, "styleItemId")
                      }
                      options={(styleItemList?.data || [])
                        .filter((item) => item.active)
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={readOnly || (row.usedQty ?? 0) > 0}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.styleItemId, index, "styleItemId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "styleItemId");
                        }
                      }}
                    />
                  </td>

                  <td className="py-0.5 border border-gray-300 text-[11px]">
                    <FxSelect
                      value={row.sizeId}
                      onChange={(val) =>
                        handleInputChange(val, index, "sizeId")
                      }
                      options={(sizeList?.data || [])
                        .filter((item) => item.active)
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={readOnly || (row.usedQty ?? 0) > 0}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.sizeId, index, "sizeId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "sizeId");
                        }
                      }}
                    />
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px]">
                    <FxSelect
                      value={row.colorId}
                      onChange={(val) =>
                        handleInputChange(val, index, "colorId")
                      }
                      options={(colorList?.data || [])
                        .filter((item) => item.active)
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={readOnly || (row.usedQty ?? 0) > 0}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.colorId, index, "colorId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "colorId");
                        }
                      }}
                      inputId={`qty-input-${index}`}
                    />
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px]">
                    <FxSelect
                      value={row.uomId}
                      onChange={(val) => handleInputChange(val, index, "uomId")}
                      options={(uomList?.data || [])
                        .filter((item) => item.active)
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={readOnly || (row.usedQty ?? 0) > 0}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.uomId, index, "uomId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "uomId");
                        }
                      }}
                      inputId={`qty-input-${index}`}
                    />
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                    <input
                      onKeyDown={(e) => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract")
                          e.preventDefault();
                        if (e.key === "Delete") {
                          handleInputChange("", index, "returnQty");
                        }
                      }}
                      min={"0"}
                      type="number"
                      className="text-right rounded py-1 px-1 w-full"
                      onFocus={(e) => e.target.select()}
                      value={row?.returnQty}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "returnQty")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "returnQty");
                      }}
                      disabled={readOnly}
                    />
                  </td>
                  <td className="w-2 border border-gray-300">
                    <input
                      className="w-full"
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
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 h-7 font-medium text-gray-800">
                <td
                  className="text-right px-4 border border-gray-300 font-medium text-[13px] py-0.5"
                  colSpan={7}
                >
                  Total 
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {(Array.isArray(salesReturnItems) ? salesReturnItems : []).reduce(
                    (sum, row) => sum + (Number(row.returnQty) || 0),
                    0,
                  )}
                </td>
                <td className="border border-gray-300" colSpan={1}></td>
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
                    // deleteRow(contextMenu.rowId);
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

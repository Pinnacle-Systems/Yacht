import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { adjTypeData } from "../../../Utils/DropdownData";
import { useLazyGetBarcodeDetailQuery } from "../../../redux/uniformService/StockAdjustmentService";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { FaPlus } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useLazyGetStyleDetailQuery } from "../../../redux/services/StockService";

export default function AdjustItems({
  stockAdjustmentItems,
  setStockAdjustmentItems,
  params,
  readOnly,
  id,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [styleNo, setStyleNo] = useState("");

  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({ params });
  const [getStyleDetail] = useLazyGetStyleDetailQuery();

  const [
    triggerGetBarcodeDetail,
    { data: barcodeData, isFetching, isLoading },
  ] = useLazyGetBarcodeDetailQuery();

  const addRow = () => {
    const newRow = {
      barcode: "",
      styleId: "",
      sizeId: "",
      stkQty: "",
      adjType: "",
      adjQty: "",
      remarks: "",
      styleNo: "",
      fabricId: "",
    };
    setStockAdjustmentItems([...stockAdjustmentItems, newRow]);
  };

  const deleteRow = (id) => {
    setStockAdjustmentItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== Number(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setStockAdjustmentItems((prevRows) => {
      if (prevRows.length <= 1) return prevRows;
      return [prevRows[0]];
    });
  };

  const handleRightClick = (event, rowIndex, type) => {
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

  // useEffect(() => {
  //   if (!stockAdjustmentItems || stockAdjustmentItems.length === 0) {
  //     setStockAdjustmentItems(
  //       Array.from({ length: 6 }, () => ({
  //         barcode: "",
  //         styleId: "",
  //         sizeId: "",
  //         stkQty: "",
  //         adjType: "",
  //         adjQty: "",
  //         remarks: "",
  //       }))
  //     );
  //   }
  // }, [stockAdjustmentItems, setStockAdjustmentItems]);

  // const handleInputChange = (value, index, field) => {
  //   const newBlend = structuredClone(stockAdjustmentItems);
  //   newBlend[index][field] = value;
  //   setStockAdjustmentItems(newBlend);
  // };

  // const handleBarcodeApiCall = async (index, row) => {
  //   try {
  //     const response = await triggerGetBarcodeDetail({
  //       params: {
  //         barcode: row.barcode,
  //         styleId: row.styleId,
  //         sizeId: row.sizeId,
  //       },
  //     }).unwrap();

  //     if (response?.data?.length > 0) {
  //       const item = response.data[0];
  //       setStockAdjustmentItems((prev) =>
  //         prev.map((r, i) =>
  //           i === index
  //             ? {
  //                 ...r,
  //                 barcode: item.barCode,
  //                 styleId: item.styleId,
  //                 sizeId: item.sizeId,
  //                 stkQty: response.totalQty,
  //               }
  //             : r
  //         )
  //       );
  //     }
  //   } catch (err) {
  //     console.error("Error fetching barcode details:", err);
  //   }
  // };

  useEffect(() => {
    if (stockAdjustmentItems) {
      setStockAdjustmentItems((prev) => {
        const count = prev.length;

        if (count < 6) {
          return [
            ...prev,
            ...Array.from({ length: 6 - count }, () => ({
              barcode: "",
              styleId: "",
              sizeId: "",
              stkQty: "",
              adjType: "",
              adjQty: "",
              remarks: "",
              styleNo: "",
              fabricId: "",
            })),
          ];
        }

        return prev; // keep as-is if already >= 6
      });
    } else {
      setStockAdjustmentItems(
        Array.from({ length: 6 }, () => ({
          barcode: "",
          styleId: "",
          sizeId: "",
          stkQty: "",
          adjType: "",
          adjQty: "",
          remarks: "",
          styleNo: "",
          fabricId: "",
        }))
      );
    }
  }, [stockAdjustmentItems, setStockAdjustmentItems]);

  const handleInputChange = async (value, index, field) => {
    setStockAdjustmentItems((prev) => {
      const newItems = structuredClone(prev);
      newItems[index][field] = value;
      return newItems;
    });

    // Trigger API call only for barcode, styleId, or sizeId
    if (["barcode", "styleId", "sizeId"].includes(field)) {
      const row = structuredClone(stockAdjustmentItems[index]);
      row[field] = value; // use updated value
      // Only call API if at least barcode or (style+size) is filled
      if (row.barcode || (row.styleId && row.sizeId)) {
        try {
          const response = await triggerGetBarcodeDetail({
            params: {
              barcode: row.barcode,
              styleId: row.styleId,
              sizeId: row.sizeId,
            },
          }).unwrap();
          // if (response?.statusCode === 1) {
          //   // No record found → reset the row
          //   setStockAdjustmentItems((prev) =>
          //     prev.map((r, i) =>
          //       i === index
          //         ? {
          //             barcode: "",
          //             styleId: "",
          //             sizeId: "",
          //             stkQty: "",
          //             adjType: "",
          //             adjQty: "",
          //             remarks: "",
          //           }
          //         : r
          //     )
          //   );
          //   return; // stop here
          // }
          if (response?.data?.length > 0) {
            const item = response.data[0];
            setStockAdjustmentItems((prev) =>
              prev.map((r, i) =>
                i === index
                  ? {
                      ...r,
                      barcode: item.barCode,
                      styleId: item.styleId,
                      sizeId: item.sizeId,
                      stkQty: response.totalQty,
                      styleNo: item.styleNo,
                      fabricId: item.fabricId,
                    }
                  : r
              )
            );
          } else {
            setStockAdjustmentItems((prev) =>
              prev.map((r, i) =>
                i === index
                  ? {
                      styleId: "",
                      sizeId: "",
                      stkQty: "",
                      adjType: "",
                      adjQty: "",
                      remarks: "",
                      styleNo: "",
                      fabricId: "",
                    }
                  : r
              )
            );
          }
        } catch (err) {
          console.error("Error fetching barcode details:", err);
        }
      }
    }
  };

  const handleAddRow = async () => {
    try {
      const { data: styleData } = await getStyleDetail({
        params: {
          styleNo: styleNo,
        },
      });
      const styleRows = styleData?.data;
      if (!styleRows) return;

      setStockAdjustmentItems((prev) => {
        const updated = [...prev];
        // Find first empty slot index
        let startIndex = updated.findIndex(
          (row) =>
            !row.styleId &&
            !row.sizeId &&
            !row.styleNo &&
            !row.fabricId &&
            !row.barcode
        );
        if (startIndex === -1) startIndex = updated.length;

        // Fill in sizeRows starting at first empty slot
        styleRows.forEach((row, i) => {
          if (startIndex + i < updated.length) {
            updated[startIndex + i] = row;
          } else {
            updated.push(row); // append if no empty slot
          }
        });

        // Ensure at least 6 rows
        while (updated.length < 6) {
          updated.push({
            styleNo: "",
            fabricId: "",
            styleId: "",
            sizeId: "",
            qty: "",
            remarks: "",
            stkQty: "",
            barcode: "",
          });
        }

        return updated;
      });
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };

  return (
    <>
      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[350px] overflow-auto">
        <div className="flex items-center gap-4">
          <ReusableInput
            label="Style / Barcode No"
            value={styleNo}
            setValue={setStyleNo}
            type={"text"}
            required={true}
            readOnly={readOnly}
          />
          <button
            className="hover:bg-green-700 h-6 mt-3 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-xs"
            onClick={() => {
              handleAddRow();
            }}
          >
            <FaPlus /> Add
          </button>
        </div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">Adjustment Details</h2>
        </div>
        <div className={`w-full overflow-y-auto py-1 relative`}>
          <table className="w-auto border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th
                  className={`w-12 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  S.No
                </th>
                <th
                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Barcode No
                </th>
                <th
                  className={`w-28 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style No
                </th>
                <th
                  className={`w-64 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style
                </th>
                <th
                  className={`w-40 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  Fabric
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Size
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Stock Qty
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Adj Type
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Adj Qty
                </th>
                <th
                  className={`w-48 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Remarks
                </th>
                <th
                  className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                ></th>
              </tr>
            </thead>
            <tbody>
              {(stockAdjustmentItems ? stockAdjustmentItems : [])?.map(
                (row, index) => (
                  <tr
                    className="border border-blue-gray-200 cursor-pointer "
                    key={index}
                  >
                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                      {index + 1}
                    </td>

                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "barcode");
                          }
                        }}
                        type="string"
                        className="text-left rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={row?.barcode}
                        disabled={true}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "barcode")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "barcode");
                        }}
                      />
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "styleNo");
                          }
                        }}
                        type="string"
                        className="text-left rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={row?.styleNo}
                        disabled={true}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "styleNo")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "styleNo");
                        }}
                      />
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                      <select
                        // disabled={readOnly || !!row.barcode}
                        disabled={true}
                        className="text-left w-full rounded py-1 table-data-input"
                        value={row.styleId}
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "styleId");
                          }
                        }}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "styleId")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "styleId");
                        }}
                      >
                        <option></option>
                        {(id
                          ? styleList?.data
                          : styleList?.data?.filter((item) => item.active)
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
                        // disabled={readOnly || !!row.barcode}
                        disabled={true}
                        className="text-left w-full rounded py-1 table-data-input"
                        value={row.sizeId}
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "sizeId");
                          }
                        }}
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
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        value={row?.stkQty}
                        disabled={true}
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "stkQty");
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "stkQty")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "stkQty");
                        }}
                      />
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px]">
                      <select
                        tabIndex={"0"}
                        disabled={readOnly}
                        className={`text-left w-full rounded py-1 table-data-input 
    ${row.adjType === "PLUS" ? "text-green-600" : ""}
    ${row.adjType === "MINUS" ? "text-red-600" : ""}
  `}
                        value={row.adjType}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "adjType")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "adjType");
                        }}
                        onFocus={(e) => e.target.onselect()}
                      >
                        <option></option>
                        {adjTypeData?.map((blend) => (
                          <option value={blend.value} key={blend.value}>
                            {blend?.show}
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
                            handleInputChange("", index, "adjQty");
                          }
                        }}
                        min={"0"}
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={row?.adjQty}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "adjQty")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "adjQty");
                        }}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "remarks");
                          }
                        }}
                        disabled={readOnly}
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
                      />
                    </td>
                    <td className="w-2 border border-gray-300">
                      <input
                        onContextMenu={(e) => {
                          if (!readOnly) {
                            handleRightClick(e, index, "notes");
                          }
                        }}
                        disabled={readOnly}
                        className="w-full "
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addRow();
                          }
                        }}
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        {contextMenu && (
          <div
            style={{
              position: "absolute",
              top: `${contextMenu.mouseY - 50}px`,
              left: `${contextMenu.mouseX + 20}px`,
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
                  deleteRow(contextMenu.rowId);
                  handleCloseContextMenu();
                }}
              >
                Delete
              </button>
              <button
                className=" text-black text-[12px] text-left rounded px-1"
                onClick={() => {
                  handleDeleteAllRows();
                  handleCloseContextMenu();
                }}
              >
                Delete All
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

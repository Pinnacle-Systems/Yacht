import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useLazyGetBarcodeDetailQuery } from "../../../redux/uniformService/StockAdjustmentService";
import Swal from "sweetalert2";

export default function BillItems({
  salesEntryItems,
  setSalesEntryItems,
  params,
  readOnly,
  id,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });

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
      qty: "",
      remarks: "",
    };
    setSalesEntryItems([...salesEntryItems, newRow]);
  };

  const deleteRow = (id) => {
    setSalesEntryItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== Number(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setSalesEntryItems((prevRows) => {
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

  useEffect(() => {
    if (salesEntryItems) {
      setSalesEntryItems((prev) => {
        const count = prev.length;

        if (count < 6) {
          return [
            ...prev,
            ...Array.from({ length: 6 - count }, () => ({
              barcode: "",
              styleId: "",
              sizeId: "",
              stkQty: "",
              qty: "",
              remarks: "",
            })),
          ];
        }

        return prev; // keep as-is if already >= 6
      });
    } else {
      setSalesEntryItems(
        Array.from({ length: 6 }, () => ({
          barcode: "",
          styleId: "",
          sizeId: "",
          stkQty: "",
          qty: "",
          remarks: "",
        }))
      );
    }
  }, [salesEntryItems, setSalesEntryItems]);

  const handleInputChange = async (value, index, field) => {
    if (field === "qty") {
      const row = salesEntryItems[index];
      const balanceQty = row?.stkQty || 0;

      if (parseFloat(balanceQty) < parseFloat(value)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Sales Qty cannot be more than Stock Qty!",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    setSalesEntryItems((prev) => {
      const newItems = structuredClone(prev);
      newItems[index][field] = value;
      return newItems;
    });

    // Trigger API call only for barcode, styleId, or sizeId
    if (["barcode", "styleId", "sizeId"].includes(field)) {
      const row = structuredClone(salesEntryItems[index]);
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
          if (response?.data?.length > 0) {
            const item = response.data[0];
            setSalesEntryItems((prev) =>
              prev.map((r, i) =>
                i === index
                  ? {
                      ...r,
                      barcode: item.barCode,
                      styleId: item.styleId,
                      sizeId: item.sizeId,
                      stkQty: response.totalQty,
                    }
                  : r
              )
            );
          } else {
            setSalesEntryItems((prev) =>
              prev.map((r, i) =>
                i === index
                  ? {
                      styleId: "",
                      sizeId: "",
                      qty: "",
                      remarks: "",
                      stkQty: "",
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

  // const handleInputChange = async (value, index, field) => {
  //   if (field === "qty") {
  //     const row = salesEntryItems[index];
  //     const balanceQty = row?.stkQty || 0;

  //     if (parseFloat(balanceQty) < parseFloat(value)) {
  //       Swal.fire({
  //         icon: "warning",
  //         title: "Invalid Quantity",
  //         text: "Sales Qty cannot be more than Stock Qty!",
  //         confirmButtonText: "OK",
  //       });
  //       return;
  //     }
  //   }

  //   setSalesEntryItems((prev) => {
  //     const newItems = structuredClone(prev);
  //     newItems[index][field] = value;
  //     return newItems;
  //   });

  //   // Only trigger API if search field changes
  //   if (field === "barcode") {
  //     const row = structuredClone(salesEntryItems[index]);
  //     row.barcode = value;

  //     if (row.search) {
  //       try {
  //         const response = await triggerGetBarcodeDetail({
  //           params: { search: row.search }, // 👈 only one param now
  //         }).unwrap();

  //         if (response?.data?.length > 0) {
  //           const item = response.data[0];
  //           setSalesEntryItems((prev) =>
  //             prev.map((r, i) =>
  //               i === index
  //                 ? {
  //                     ...r,
  //                     barcode: item.barCode,
  //                     styleId: item.styleId,
  //                     sizeId: item.sizeId,
  //                     stkQty: response.totalQty,
  //                   }
  //                 : r
  //             )
  //           );
  //         } else {
  //           setSalesEntryItems((prev) =>
  //             prev.map((r, i) =>
  //               i === index
  //                 ? {
  //                     search: "",
  //                     qty: "",
  //                     remarks: "",
  //                     stkQty: "",
  //                   }
  //                 : r
  //             )
  //           );
  //         }
  //       } catch (err) {
  //         console.error("Error fetching stock details:", err);
  //       }
  //     }
  //   }
  // };

  return (
    <>
      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[300px] overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">Sales Item Details</h2>
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
                  className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Barcode No
                </th>
                <th
                  className={`w-64 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style
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
                  Qty
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
              {(salesEntryItems ? salesEntryItems : [])?.map((row, index) => (
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
                      disabled={readOnly}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "barcode")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "barcode");
                      }}
                    />
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px] ">
                    <select
                      disabled={readOnly}
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
                  <td className="py-0.5 border border-gray-300 text-[11px]">
                    <select
                      disabled={readOnly}
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
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                    <input
                      type="number"
                      className="text-right rounded py-1 px-1 w-full table-data-input"
                      value={row?.qty}
                      disabled={readOnly}
                      onKeyDown={(e) => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract")
                          e.preventDefault();
                        if (e.key === "Delete") {
                          handleInputChange("", index, "qty");
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "qty")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "qty");
                      }}
                    />
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                    <input
                      onKeyDown={(e) => {
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
                  <td className="w-2 border border-gray-300">
                    <input
                      onContextMenu={(e) => {
                        if (!readOnly) {
                          handleRightClick(e, index, "notes");
                        }
                      }}
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
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-medium text-gray-800">
                <td
                  className="text-right px-4 border border-gray-300 font-medium text-[13px] py-0.5"
                  colSpan={5}
                >
                  Total Qty
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {salesEntryItems.reduce(
                    (sum, row) => sum + (Number(row.qty) || 0),
                    0
                  )}
                </td>
                <td className="border border-gray-300" colSpan={2}></td>
              </tr>
            </tfoot>
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

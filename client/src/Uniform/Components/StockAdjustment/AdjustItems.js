import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { adjTypeData } from "../../../Utils/DropdownData";

export default function AdjustItems({
  stockAdjustItems,
  setStockAdjustItems,
  params,
  readOnly,
  id,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });

  const addRow = () => {
    const newRow = {
      barcode: "",
      styleId: "",
      sizeId: "",
      stkQty: "",
      adjType: "",
      adjQty: "",
      newQty: "",
      remarks: "",
    };
    setStockAdjustItems([...stockAdjustItems, newRow]);
  };

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(stockAdjustItems);
    newBlend[index][field] = value;
    setStockAdjustItems(newBlend);
  };

  const deleteRow = (id) => {
    setStockAdjustItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setStockAdjustItems((prevRows) => {
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
    if (!stockAdjustItems || stockAdjustItems.length === 0) {
      setStockAdjustItems(
        Array.from({ length: 6 }, () => ({
          styleId: "",
          sizeId: "",
          qty: "",
          remarks: "",
        }))
      );
    }
  }, [stockAdjustItems, setStockAdjustItems]);

  return (
    <>
      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[350px] overflow-auto">
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
                  className={`w-64 px-4 py-2 text-center font-medium text-[13px] `}
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
                  Adj Type
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Adj Qty
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  New Qty
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
              {(stockAdjustItems ? stockAdjustItems : [])?.map((row, index) => (
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
                      disabled={true}
                      className="text-left w-full rounded py-1 table-data-input"
                      value={row.styleId}
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
                      disabled={true}
                      className="text-left w-full rounded py-1 table-data-input"
                      value={row.sizeId}
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
                    />
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px]">
                    <select
                      tabIndex={"0"}
                      disabled={readOnly}
                      className="text-left w-full rounded py-1 table-data-input"
                      value={row.adjType}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "adjType")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "adjType");
                      }}
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
                    />
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                    <input
                      type="number"
                      className="text-right rounded py-1 px-1 w-full table-data-input"
                      value={row?.newQty}
                      disabled={true}
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
                    />
                  </td>
                </tr>
              ))}
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

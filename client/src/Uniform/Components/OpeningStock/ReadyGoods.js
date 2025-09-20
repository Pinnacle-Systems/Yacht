import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";

export default function ReadyGoods({
  openingStockItems,
  setOpeningStockItems,
  params,
  readOnly,
  id,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });

  const addRow = () => {
    const newRow = {
      styleId: "",
      sizeId: "",
      qty: "",
    };
    setOpeningStockItems([...openingStockItems, newRow]);
  };

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(openingStockItems);
    newBlend[index][field] = value;
    setOpeningStockItems(newBlend);
  };

  const deleteRow = (id) => {
    setOpeningStockItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setOpeningStockItems((prevRows) => {
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
    if (!openingStockItems || openingStockItems.length === 0) {
      setOpeningStockItems([{ styleId: "", sizeId: "", qty: "" }]);
    }
  }, [openingStockItems, setOpeningStockItems]);

  return (
    <>
      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
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
                  className={`w-96 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style
                </th>
                <th
                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Size
                </th>
                <th
                  className={`w-32 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Quantity
                </th>
                <th
                  className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                ></th>
              </tr>
            </thead>
            <tbody>
              {(openingStockItems ? openingStockItems : [])?.map(
                (row, index) => (
                  <tr className="border border-blue-gray-200 cursor-pointer ">
                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                      {index + 1}
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                      <select
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "styleId");
                          }
                        }}
                        tabIndex={"0"}
                        disabled={readOnly}
                        className="text-left w-full rounded py-1 table-data-input"
                        value={row.styleId}
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
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "sizeId");
                          }
                        }}
                        tabIndex={"0"}
                        disabled={readOnly}
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
                            handleInputChange("0.000", index, "qty");
                          }
                        }}
                        min={"0"}
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={row?.qty}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "qty")
                        }
                        onBlur={(e) => {
                          handleInputChange(
                            parseFloat(e.target.value).toFixed(2),
                            index,
                            "qty"
                          );
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

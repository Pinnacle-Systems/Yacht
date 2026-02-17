import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FxSelect from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import SalesBillItemsSelection from "./SalesBillItemsSelection";
import Swal from "sweetalert2";
import { findFromList } from "../../../Utils/helper";

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
  tempItems,
  setTempItems,
  billNo,
  styleList,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [fillGrid, setFillGrid] = useState(false);
  const addRow = () => {
    const newRow = {
      barcodeId: "",
      styleId: "",
      sizeId: "",
      returnQty: "",
      barcodeNo: "",
      styleItemId: "",
      colorId: "",
      selected: false,
    };
    setSalesReturnItems([...salesReturnItems, newRow]);
  };

  const deleteSelectedRows = () => {
    setSalesReturnItems((rows) => rows.filter((r) => !r.selected));
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

        if (count < 4) {
          return [
            ...prev,
            ...Array.from({ length: 4 - count }, () => ({
              barcodeId: "",
              styleId: "",
              sizeId: "",
              returnQty: "",
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
        Array.from({ length: 4 }, () => ({
          barcodeId: "",
          styleId: "",
          sizeId: "",
          returnQty: "",
          barcodeNo: "",
          styleItemId: "",
          colorId: "",
          selected: false,
        })),
      );
    }
  }, [salesReturnItems, setSalesReturnItems]);

  const handleInputChange = async (value, index, field) => {
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
        (row) =>
          !row.styleId && !row.sizeId && !row.barcodeNo && !row.barcodeId,
      );

      if (startIndex === -1) startIndex = updated.length;

      rowsToFill.forEach((row, i) => {
        if (startIndex + i < updated.length) {
          updated[startIndex + i] = row;
        } else {
          updated.push(row);
        }
      });

      while (updated.length < 4) {
        updated.push({
          barcodeNo: "",
          styleId: "",
          sizeId: "",
          returnQty: "",
          barcodeId: "",
          styleItemId: "",
          colorId: "",
          selected: false,
        });
      }

      return updated;
    });
  };

  return (
    <>
      <Modal
        isOpen={fillGrid}
        onClose={() => setFillGrid(false)}
        widthClass={"w-[90%] h-[80%]"}
      >
        <SalesBillItemsSelection
          setFillGrid={setFillGrid}
          salesReturnItems={salesReturnItems}
          setSalesReturnItems={setSalesReturnItems}
          tempItems={tempItems}
          setTempItems={setTempItems}
          onClose={() => setFillGrid(false)}
        />
      </Modal>
      <div className="border border-slate-200 px-2 bg-white rounded-md shadow-sm max-h-[450px] overflow-auto overflow-x-auto w-full">
        <div className="flex items-center mt-1">
          <h2 className="font-medium text-slate-700">List of Items</h2>
          {!id && (
            <button
              className={`font-bold text-slate-700 bord ml-[780px] text-sm bg-blue-500 rounded rounded-md text-white px-2
              `}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!billNo) {
                    Swal.fire({
                      icon: "warning",
                      title: ` Choose Bill No`,
                      showConfirmButton: false,
                      timer: 2000,
                    });
                  } else {
                    e.preventDefault();
                    setFillGrid(true);
                  }
                }
              }}
              onClick={() => {
                if (!billNo) {
                  Swal.fire({
                    icon: "warning",
                    title: ` Choose Bill No`,
                    showConfirmButton: false,
                    timer: 2000,
                  });
                } else {
                  setFillGrid(true);
                }
              }}
              // disabled={id}
            >
              Fill Items
            </button>
          )}
        </div>
        <div
          className={`w-full  min-h-[190px] max-h-[190px] overflow-y-auto  mt-1 mb-2`}
        >
          <table className=" border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 text-center font-medium text-[13px]">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        salesReturnItems.length > 0 &&
                        salesReturnItems.every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSalesReturnItems((prev) =>
                          prev.map((row) => ({ ...row, selected: checked })),
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
                  className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style No
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
                      disabled={true}
                    />
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px] ">
                    <input
                      className="text-left rounded py-1 px-1 w-full  select-none"
                      disabled={true}
                      value={
                        findFromList(row.styleId, styleList?.data, "sku") || ""
                      }
                    />
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px] ">
                    <input
                      className="text-left rounded py-1 px-1 w-full  select-none"
                      disabled={true}
                      value={
                        findFromList(
                          row.styleItemId,
                          styleItemList?.data,
                          "name",
                        ) || ""
                      }
                    />
                  </td>

                  <td className="py-0.5 border border-gray-300 text-[11px]">
                    <input
                      className="text-left rounded py-1 px-1 w-full select-none"
                      readOnly
                      value={
                        findFromList(row.sizeId, sizeList?.data, "name") || ""
                      }
                      disabled={true}
                    />
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px]">
                    <input
                      className="text-left rounded py-1 px-1 w-full select-none"
                      readOnly
                      value={
                        findFromList(row.colorId, colorList?.data, "name") || ""
                      }
                      disabled={true}
                    />
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px]">
                    <input
                      className="text-left rounded py-1 px-1 w-full   select-none"
                      readOnly
                      value={
                        findFromList(row.uomId, uomList?.data, "name") || ""
                      }
                      disabled={true}
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
                      disabled={true}
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
                  colSpan={8}
                >
                  Total
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {(Array.isArray(salesReturnItems)
                    ? salesReturnItems
                    : []
                  ).reduce((sum, row) => sum + (Number(row.returnQty) || 0), 0)}
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

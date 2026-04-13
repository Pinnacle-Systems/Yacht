import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import PurchaseBillItemsSelection from "./PurchaseBillItemsSelection";
import { findFromList } from "../../../Utils/helper";
import { useLazyGetSRBarcodeDetailQuery } from "../../../redux/uniformService/ShowroomStockService";
import { flushSync } from "react-dom";

export default function PurchaseReturnItems({
  purchaseReturnItems,
  setPurchaseReturnItems,
  params,
  readOnly,
  id,
  sizeList,
  styleItemList,
  colorList,
  uomList,
  supplierId,
  invNo,
  branchId,
  tempItems,
  setTempItems,
  styleList,
  isHo,
  partyList,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [fillGrid, setFillGrid] = useState(false);
  const inputRefs = useRef([]);
  const scanningRef = useRef(false);
  const [getBarcodeDetails, { data: barcodeData }] =
    useLazyGetSRBarcodeDetailQuery();

  const addRow = () => {
    const newRow = {
      styleId: "",
      sizeId: "",
      stkQty: "",
      remarks: "",
      styleItemId: "",
      colorId: "",
      selected: false,
      barcodeNo: "",
      uomId: "",
      returnQty: "",
      barcodeId: "",
      billNo: "",
      supplierId: "",
    };
    setPurchaseReturnItems([...purchaseReturnItems, newRow]);
  };
  const handleInputChange = async (value, index, field) => {
    if (field === "returnQty") {
      const row = purchaseReturnItems[index];
      const balanceQty = row?.stkQty || 0;

      if (parseFloat(balanceQty) < parseFloat(value)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Return Qty cannot be more than Stock Qty!",
          confirmButtonText: "OK",
        });
        setPurchaseReturnItems((prev) => {
          const newItems = structuredClone(prev);
          newItems[index].returnQty = ""; // or null
          return newItems;
        });
        return;
      }
    }
    const newBlend = structuredClone(purchaseReturnItems);
    newBlend[index][field] = value;
    setPurchaseReturnItems(newBlend);
  };

  const deleteSelectedRows = () => {
    setPurchaseReturnItems((rows) => rows.filter((r) => !r.selected));
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
    if (purchaseReturnItems) {
      setPurchaseReturnItems((prev) => {
        const filledRows = prev.length;

        if (filledRows < 5) {
          // add empty rows until total becomes 6
          return [
            ...prev,
            ...Array.from({ length: 5 - filledRows }, () => ({
              styleId: "",
              sizeId: "",
              stkQty: "",
              remarks: "",
              styleItemId: "",
              colorId: "",
              selected: false,
              barcodeNo: "",
              barcodeId: "",
              uomId: "",
              returnQty: "",
              selected: false,
              billNo: "",
              supplierId: "",
            })),
          ];
        }
        return prev; // if already >= 6, just keep as it is
      });
    } else {
      // if null/undefined, initialize with 6 empty rows
      setPurchaseReturnItems(
        Array.from({ length: 5 }, () => ({
          styleId: "",
          sizeId: "",
          stkQty: "",
          remarks: "",
          styleItemId: "",
          colorId: "",
          selected: false,
          barcodeNo: "",
          barcodeId: "",
          uomId: "",
          returnQty: "",
          selected: false,
          billNo: "",
          supplierId: "",
        })),
      );
    }
  }, [purchaseReturnItems, setPurchaseReturnItems]);

  const handleBarcodeEnter = async (index) => {
      if (scanningRef.current) return; // 🚫 prevent double trigger
    scanningRef.current = true;
    const row = purchaseReturnItems[index];

    try {
      const response = await getBarcodeDetails({
        params: { barcodeNo: row.barcodeNo, branchId: branchId },
      }).unwrap();

      if (response.statusCode !== 0) {
        Swal.fire({
          icon: "warning",
          title: "Not Found",
          text: response?.message || "Failed to fetch barcode details",
        });
        flushSync(() => {
          setPurchaseReturnItems((prev) => {
            const updated = [...prev];
            updated[index] = {
              barcodeNo: "",
              styleItemId: null,
              styleId: "",
              sizeId: null,
              colorId: null,
              uomId: null,
              barcodeId: "",
              selected: false,
              billNo: "",
              supplierId: "",
              returnQty: "",
            };
            return updated;
          });
        });
        return; // ✅ stop execution after error
      }

      const data = response.data;
      const duplicate = purchaseReturnItems.some(
        (item, i) => item.barcodeId === data.barcodeId && i !== index,
      );

      if (duplicate.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate",
          text: "The Barcode Number is Already Exist, Cannot add!.",
        });
        flushSync(() => {
          setPurchaseReturnItems((prev) => {
            // ✅ fixed: was purchaseReturnItems() instead of setPurchaseReturnItems()
            const updated = [...prev];
            updated[index] = {
              barcodeNo: "",
              styleItemId: null,
              styleId: "",
              sizeId: null,
              colorId: null,
              uomId: null,
              barcodeId: "",
              selected: false,
              billNo: "",
              supplierId: "",
              returnQty: "",
            };
            return updated;
          });
        });
        return; // ✅ stop execution after duplicate
      }

      // ✅ flushSync forces DOM update BEFORE focus
      flushSync(() => {
        setPurchaseReturnItems((prev) => {
          const updated = [...prev];
          const isLastRow = index === prev.length - 1;

          updated[index] = {
            ...updated[index],
            styleItemId: data.styleItemId,
            sizeId: data.sizeId,
            colorId: data.colorId,
            uomId: data.uomId,
            barcodeNo: data.barcodeNo,
            barcodeId: data.barcodeId,
            styleId: data.styleId,
            returnQty: data.qty,
            stkQty: data?.qty,
            billNo: data?.billNo,
            supplierId: data?.supplierId,
          };

          if (isLastRow) {
            updated.push({
              styleId: "",
              sizeId: "",
              qty: "",
              styleItemId: "",
              colorId: "",
              selected: false,
              barcodeNo: "",
              barcodeId: "",
              uomId: "",
              billNo: "",
              supplierId: "",
              returnQty: "",
            });
          }

          return updated;
        });
      });

      // ✅ DOM is guaranteed updated — no setTimeout needed
      // const nextInput = document.querySelector(`#barcodeNo-input-${index + 1}`);
      // nextInput?.focus();
      setTimeout(() => {
        const nextInput = document.getElementById(
          `barcodeNo-input-${index + 1}`,
        );
        nextInput?.focus();
      }, 0);
    } catch (error) {
      console.error("Barcode fetch failed:", error);
    } finally {
      scanningRef.current = false; // ✅ release lock
    }
  };

  return (
    <>
      <Modal
        isOpen={fillGrid}
        onClose={() => setFillGrid(false)}
        widthClass={"w-[90%] h-[85%]"}
      >
        <PurchaseBillItemsSelection
          setFillGrid={setFillGrid}
          supplierId={supplierId}
          purchaseReturnItems={purchaseReturnItems}
          setPurchaseReturnItems={setPurchaseReturnItems}
          tempItems={tempItems}
          setTempItems={setTempItems}
          branchId={branchId}
          invNo={invNo}
          onClose={() => setFillGrid(false)}
        />
      </Modal>
      <div className="border border-slate-200  bg-white rounded-md shadow-sm max-h-[400px] px-2 overflow-auto">
        <div className="flex items-center mt-1">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
          {!id && !isHo && (
            <button
              className="font-bold  bord ml-[1027px] text-sm bg-blue-500 rounded-md text-white px-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setFillGrid(true);
                }
              }}
              onClick={() => {
                if (!supplierId || !invNo) {
                  Swal.fire({
                    icon: "warning",
                    title: ` Choose Supplier and Inv No`,
                    showConfirmButton: false,
                    timer: 2000,
                  });
                } else {
                  setFillGrid(true);
                }
              }}
              disabled={id}
              readOnly={id}
            >
              Fill Items
            </button>
          )}
        </div>
        <div
          className={`w-full max-h-[230px] min-h-[230px] overflow-y-auto  mb-2 mt-1`}
        >
          <table className=" border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 text-center font-medium text-[13px]">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        purchaseReturnItems.length > 0 &&
                        purchaseReturnItems.every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPurchaseReturnItems((prev) =>
                          prev.map((row) => ({
                            ...row,
                            selected: checked,
                          })),
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
                  className={`w-40 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Barcode
                </th>
                {isHo && (
                  <>
                    <th
                      className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                    >
                      Bill No
                    </th>
                    <th
                      className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                    >
                      Supplier
                    </th>
                  </>
                )}
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
                  className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Unit
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Stock Qty
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Return Qty
                </th>
                <th
                  className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(purchaseReturnItems ? purchaseReturnItems : [])?.map(
                (row, index) => (
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
                        id={`barcodeNo-input-${index}`}
                        ref={(el) => (inputRefs.current[index] = el)}
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete" || e.key === "") {
                            setPurchaseReturnItems((prev) => {
                              const newBlend = [...prev];
                              newBlend[index] = {
                                barcodeId: "",
                                styleId: "",
                                sizeId: "",
                                returnQty: "",
                                barcodeNo: "",
                                styleItemId: "",
                                colorId: "",
                                selected: false,
                                uomId: "",
                                stkQty: "",
                                billNo: "",
                                supplierId: "",
                              };
                              return newBlend;
                            });
                          }
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBarcodeEnter(index);
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
                          if (!e.target.value) {
                            // only reset if user manually cleared, not scanner flow
                            setPurchaseReturnItems((prev) => {
                              const newBlend = [...prev];
                              newBlend[index] = {
                                ...newBlend[index],
                                barcodeNo: "",
                              };
                              return newBlend;
                            });
                          }
                        }}
                        disabled={id || !isHo || row?.billNo}
                      />
                    </td>
                    {isHo && (
                      <>
                        <td className="py-0.5 border border-gray-300 text-[11px] ">
                          <input
                            className="text-left rounded py-1 px-1 w-full  select-none"
                            disabled={true}
                            value={row.billNo}
                          />
                        </td>
                        <td className="py-0.5 border border-gray-300 text-[11px] ">
                          <input
                            className="text-left rounded py-1 px-1 w-full  select-none"
                            disabled={true}
                            value={
                              findFromList(
                                row.supplierId,
                                partyList?.data,
                                "name",
                              ) || ""
                            }
                          />
                        </td>
                      </>
                    )}
                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                      <input
                        className="text-left rounded py-1 px-1 w-full  select-none"
                        disabled={true}
                        value={
                          findFromList(row.styleId, styleList?.data, "sku") ||
                          ""
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
                          findFromList(row.colorId, colorList?.data, "name") ||
                          ""
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
                            handleInputChange("", index, "stkQty");
                          }
                        }}
                        min={"0"}
                        type="number"
                        className="text-right rounded py-1 px-1 w-full"
                        onFocus={(e) => e.target.select()}
                        value={row?.stkQty}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "stkQty")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "stkQty");
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
                            handleInputChange("", index, "returnQty");
                          }
                          if (e.key === "Enter") {
                            e.preventDefault(); // prevent form submit or line break
                            e.stopPropagation();
                            const nextQtyInput = document.querySelector(
                              `#returnQty-input-${index + 1}`,
                            );
                            if (nextQtyInput) {
                              nextQtyInput.focus();
                            }
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
                        id={`returnQty-input-${index}`}
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
                ),
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 h-7 font-medium text-gray-800">
                <td
                  className="text-right px-4 border border-gray-300 font-medium text-[13px] py-0.5"
                  colSpan={isHo ? 11 : 9}
                >
                  Total Qty
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {(Array.isArray(purchaseReturnItems)
                    ? purchaseReturnItems
                    : []
                  ).reduce((sum, row) => sum + (Number(row.returnQty) || 0), 0)}
                </td>
                <td className="border border-gray-300" colSpan={1}></td>
              </tr>
            </tfoot>
          </table>
        </div>
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
    </>
  );
}

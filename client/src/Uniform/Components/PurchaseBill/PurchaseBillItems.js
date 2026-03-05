import { useLazyGetStyleMasterByIdQuery } from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FxSelect from "../../../Inputs";
import Swal from "sweetalert2";
import { VIEW } from "../../../icons";
import Modal from "../../../UiComponents/Modal";
import { findFromList } from "../../../Utils/helper";
import { useLazyGetProdBarcodeDetailQuery } from "../../../redux/services/PurchaseBillService";
import TaxDetailsFullTemplate from "./TaxDetailsFullTemplate";
export default function PurchaseBillItems({
  purchaseBillItems,
  setPurchaseBillItems,
  params,
  readOnly,
  id,
  sizeList,
  styleList,
  styleItemList,
  colorList,
  uomList,
  taxTemplateId,
  dcNo,
  isAdmin,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);

  const addRow = () => {
    const newRow = {
      styleId: "",
      sizeId: "",
      qty: "",
      styleItemId: "",
      colorId: "",
      barcodeId: "",
      selected: false,
      barcodeNo: "",
      uomId: "",
      rate: "",
      netAmount: 0,
      discountType: "Percentage",
      discountValue: "",
    };
    setPurchaseBillItems([...purchaseBillItems, newRow]);
  };
  const [getProductionBarcode, { data: barcodeData }] =
    useLazyGetProdBarcodeDetailQuery();
  const handleInputChange = async (value, index, field) => {
    const newBlend = structuredClone(purchaseBillItems);
    newBlend[index][field] = value;
    setPurchaseBillItems(newBlend);
  };

  const deleteSelectedRows = () => {
    setPurchaseBillItems((rows) =>
      rows.filter((r) => !(r.selected && (r.usedQty ?? 0) === 0)),
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
    if (purchaseBillItems) {
      setPurchaseBillItems((prev) => {
        const filledRows = prev.length;

        if (filledRows < 3) {
          // add empty rows until total becomes 6
          return [
            ...prev,
            ...Array.from({ length: 3 - filledRows }, () => ({
              styleId: "",
              sizeId: "",
              qty: "",
              styleItemId: "",
              colorId: "",
              selected: false,
              barcodeNo: "",
              barcodeId: "",
              uomId: "",
              rate: "",
              selected: false,
              netAmount: 0,
              discountType: "Percentage",
              discountValue: "",
            })),
          ];
        }
        return prev; // if already >= 6, just keep as it is
      });
    } else {
      // if null/undefined, initialize with 6 empty rows
      setPurchaseBillItems(
        Array.from({ length: 3 }, () => ({
          styleId: "",
          sizeId: "",
          qty: "",
          styleItemId: "",
          colorId: "",
          selected: false,
          barcodeNo: "",
          barcodeId: "",
          uomId: "",
          rate: "",
          selected: false,
          netAmount: 0,
          discountType: "Percentage",
          discountValue: "",
        })),
      );
    }
  }, [purchaseBillItems, setPurchaseBillItems]);

  useEffect(() => {
    // Recalculate net amount for all rows whenever dependent fields change
    const updatedRows = purchaseBillItems.map((row) => {
      const rate = parseFloat(row.rate) || 0;
      const qty = parseFloat(row.qty) || 0;
      const taxPercent = parseFloat(row.taxPercent) || 0;
      const discountValue = parseFloat(row.discountValue) || 0;
      const discountType = row.discountType;

      const gross = rate * qty;

      let discountAmount = 0;
      if (discountType) {
        if (discountType === "Flat") {
          discountAmount = discountValue;
        } else {
          discountAmount = (gross * discountValue) / 100;
        }
      }

      const taxable = gross - discountAmount;
      const sgst = (taxable * (taxPercent / 2)) / 100;
      const cgst = (taxable * (taxPercent / 2)) / 100;

      const net = taxable;

      return {
        ...row,
        netAmount: Math.round(net),
        taxable: taxable,
      };
    });

    // Only update if net amounts actually changed
    const needsUpdate = updatedRows.some(
      (row, index) =>
        row.netAmount !== (purchaseBillItems[index]?.netAmount || 0),
    );

    if (needsUpdate) {
      setPurchaseBillItems(updatedRows);
    }
  }, [purchaseBillItems]);

  const handleBarcodeEnter = async (index, row) => {
    try {
      const response = await getProductionBarcode({
        params: { barcodeNo: row.barcodeNo, isAdmin: isAdmin },
      }).unwrap();

      if (response.statusCode !== 0) {
        Swal.fire({
          icon: "warning",
          title: "Not Found",
          text: response?.message || "Failed to fetch barcode details",
        });
        return;
      }

      const data = response.data;

      setPurchaseBillItems((prev) => {
        const updated = [...prev];
        const isLastRow = index === prev.length - 1;

        updated[index] = {
          ...updated[index],
          styleItemId: data.styleItemId,
          sizeId: data.sizeId,
          colorId: data.colorId,
          uomId: data.uomId,
          barcodeNo: data.barcodeNo,
          qty: data.qty,
          rate: data.rate,
          barcodeId: data.id,
          styleId: data.styleId,
          taxPercent: data.taxPercent,
        };

        // Add new row if last
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
            rate: "",
            netAmount: 0,
            discountType: "Percentage",
            discountValue: "",
          });
        }

        return updated;
      });

      // Focus next row
      setTimeout(() => {
        const nextInput = document.querySelector(
          `#barcodeNo-input-${index + 1}`,
        );
        nextInput?.focus();
      }, 0);
    } catch (error) {
      console.error("Barcode fetch failed:", error);
    }
  };

  return (
    <>
      <Modal
        isOpen={Number.isInteger(currentSelectedIndex)}
        onClose={() => setCurrentSelectedIndex("")}
      >
        <TaxDetailsFullTemplate
          readOnly={readOnly}
          taxTypeId={taxTemplateId}
          currentIndex={currentSelectedIndex}
          setCurrentSelectedIndex={setCurrentSelectedIndex}
          purchaseBillItems={purchaseBillItems}
          handleInputChange={handleInputChange}
          id={id}
        />
      </Modal>
      <div className="border border-slate-200  bg-white rounded-md shadow-sm max-h-[450px] px-2 overflow-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
        </div>
        <div
          className={`w-full max-h-[150px] min-h-[150px]   overflow-y-auto  mb-2 mt-1`}
        >
          <table className=" border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 text-center font-medium text-[13px]">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        purchaseBillItems.length > 0 &&
                        purchaseBillItems
                          .filter((row) => (row.usedQty ?? 0) === 0)
                          .every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPurchaseBillItems((prev) =>
                          prev.map((row) =>
                            (row.usedQty ?? 0) > 0
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
                  className={`w-10 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  S.No
                </th>
                <th
                  className={`w-28 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Barcode
                </th>
                {/* <th
                  className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style No
                </th> */}
                <th
                  className={`w-64 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style Item
                </th>
                <th
                  className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Size
                </th>
                <th
                  className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Color
                </th>
                <th
                  className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Unit
                </th>
                <th
                  className={`w-16 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Qty
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Rate
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Gross Amt
                </th>
                <th
                  className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Disc Type
                </th>
                <th
                  className={`w-16 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Disc
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Net Amt
                </th>
                <th
                  className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Tax Details
                </th>
                <th
                  className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(purchaseBillItems ? purchaseBillItems : [])?.map(
                (row, index) => (
                  <tr
                    className="border border-blue-gray-200 cursor-pointer "
                    key={index}
                  >
                    <td className="border-blue-gray-200 text-[11px]  border border-gray-300 py-0.5 text-right">
                      <input
                        type="checkbox"
                        checked={row.selected || false}
                        disabled={readOnly || (row.usedQty ?? 0) > 0}
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
                        onKeyDown={async (e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete" || e.key === "") {
                            setPurchaseBillItems((prev) => {
                              const newBlend = [...prev];
                              newBlend[index] = {
                                barcodeNo: "",
                                styleItemId: null,
                                sizeId: null,
                                colorId: null,
                                uomId: null,
                                qty: "",
                                rate: "",
                                amount: "",
                                discount: "",
                                taxPercent: "",
                                barcodeId: "",
                              };
                              return newBlend;
                            });
                          }
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBarcodeEnter(index, row); // ✅ single function call
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
                          if (e.target.value === "") {
                            setPurchaseBillItems((prev) => {
                              const newBlend = [...prev];
                              newBlend[index] = {
                                barcodeNo: "",
                                styleItemId: null,
                                sizeId: null,
                                colorId: null,
                                uomId: null,
                                qty: "",
                                rate: "",
                                amount: "",
                                discount: "",
                                taxPercent: "",
                              };
                              return newBlend;
                            });
                          }
                        }}
                        disabled={true}
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
                        // onKeyDown={(e) => {
                        //   if (e.code === "Minus" || e.code === "NumpadSubtract")
                        //     e.preventDefault();
                        //   if (e.key === "Delete") {
                        //     handleInputChange("", index, "qty");
                        //   }
                        // }}
                        min={"0"}
                        type="number"
                        className="text-right rounded py-1 px-1 w-full select-none"
                        // onFocus={(e) => e.target.select()}
                        value={row?.qty}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "qty")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "qty");
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
                            handleInputChange("", index, "rate");
                          }
                        }}
                        min={"0"}
                        type="number"
                        className="text-right rounded py-1 px-1 w-full select-none"
                        onFocus={(e) => e.target.select()}
                        value={row?.rate}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "rate")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "rate");
                        }}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px]">
                      <input
                        type="number"
                        onFocus={(e) => e.target.select()}
                        className="text-right rounded py-1 px-1 w-full"
                        value={
                          !row.qty || !row.rate
                            ? 0.0
                            : (
                                parseFloat(row.qty) * parseFloat(row.rate)
                              ).toFixed(2)
                        }
                        disabled={true}
                      />
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <select
                        className="text-left rounded py-1 px-1 w-full table-data-input"
                        value={row?.discountType || ""}
                        disabled={readOnly}
                        onChange={(e) => {
                          if (e.target.value === "") {
                            handleInputChange("", index, "discountValue");
                          }
                          handleInputChange(
                            e.target.value,
                            index,
                            "discountType",
                          );
                        }}
                      >
                        <option value="">Select</option>
                        <option value="Flat">Flat</option>
                        <option value="Percentage">Perc</option>
                      </select>
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        value={row?.discountValue}
                        disabled={readOnly || row.discountType === ""}
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "discountValue");
                          }
                        }}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            index,
                            "discountValue",
                          )
                        }
                        onBlur={(e) => {
                          handleInputChange(
                            e.target.value,
                            index,
                            "discountValue",
                          );
                        }}
                      />
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px]">
                      <input
                        type="number"
                        className="text-right rounded py-1 px-1 w-full"
                        value={
                          row?.netAmount !== undefined &&
                          row?.netAmount !== null
                            ? Number(row.netAmount).toFixed(2)
                            : "0"
                        }
                        disabled
                      />
                    </td>
                    <td className=" py-0.5 border border-gray-300 text-[11px] justify-center">
                      <button
                        disabled={!row?.styleItemId}
                        className="text-center rounded py-1 w-20"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setCurrentSelectedIndex(index);
                          }
                        }}
                        onClick={() => {
                          if (!taxTemplateId)
                            return toast.info("Please select Tax Type", {
                              position: "top-center",
                            });
                          setCurrentSelectedIndex(index);
                        }}
                      >
                        {VIEW}
                      </button>
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
                  colSpan={7}
                >
                  Total Qty
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {(Array.isArray(purchaseBillItems)
                    ? purchaseBillItems
                    : []
                  ).reduce((sum, row) => sum + (Number(row.qty) || 0), 0)}
                </td>
                <td className="border border-gray-300" colSpan={1}></td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {(Array.isArray(purchaseBillItems) ? purchaseBillItems : [])
                    .reduce((sum, row) => {
                      const qty = parseFloat(row.qty) || 0;
                      const rate = parseFloat(row.rate) || 0;
                      return sum + qty * rate;
                    }, 0)
                    .toFixed(2)}
                </td>
                <td className="border border-gray-300" colSpan={2}></td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {purchaseBillItems
                    ?.reduce(
                      (sum, row) => sum + (Number(row.netAmount) || 0),
                      0,
                    )
                    .toFixed(2)}
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
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useLazyGetStyleDetailQuery } from "../../../redux/services/StockService";
import { toast } from "react-toastify";
import Modal from "../../../UiComponents/Modal";
import { VIEW } from "../../../icons";
import FxSelect, { DropdownNew } from "../../../Inputs";
import TaxDetailsFullTemplate from "./TaxDetailsFullTemplate";
import { useLazyGetSRBarcodeDetailQuery } from "../../../redux/uniformService/ShowroomStockService";
import { findFromList } from "../../../Utils/helper";

export default function SalesBillItems({
  salesBillItems,
  setSalesBillItems,
  params,
  readOnly,
  id,
  taxTemplateId,
  sizeList,
  styleItemList,
  colorList,
  uomList,
  styleList,
  branchId
}) {
  const [barcodeNo, setbarcodeNo] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [getStyleDetail] = useLazyGetStyleDetailQuery();
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");
  const [pendingStyleRows, setPendingStyleRows] = useState([]);
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [colorId, setColorId] = useState("");
  const [uniqueColorIds, setUniqueColorIds] = useState([]);
  const [getBarcodeDetails, { data: barcodeData }] =
    useLazyGetSRBarcodeDetailQuery();
  const addRow = () => {
    const newRow = {
      barcodeNo: "",
      barcodeId: "",
      styleId: "",
      sizeId: "",
      qty: "",
      rate: "",
      taxPercent: "",
      discountType: "Percentage",
      discountValue: "",
      amount: "",
      styleItemId: "",
      colorId: "",
      selected: false,
      netAmount: 0,
    };
    setSalesBillItems([...salesBillItems, newRow]);
  };

  const deleteSelectedRows = () => {
    setSalesBillItems((rows) =>
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
    if (salesBillItems) {
      setSalesBillItems((prev) => {
        const count = prev.length;

        if (count < 5) {
          return [
            ...prev,
            ...Array.from({ length: 5 - count }, () => ({
              styleId: "",
              sizeId: "",
              qty: "",
              barcodeNo: "",
              barcodeId: "",
              rate: "",
              taxPercent: "",
              discountType: "Percentage",
              discountValue: "",
              amount: "",
              styleItemId: "",
              colorId: "",
              selected: false,
            })),
          ];
        }

        return prev; // keep as-is if already >= 6
      });
    } else {
      setSalesBillItems(
        Array.from({ length: 5 }, () => ({
          barcodeId: "",
          styleId: "",
          sizeId: "",
          qty: "",
          barcodeNo: "",
          rate: "",
          taxPercent: "",
          discountType: "Percentage",
          discountValue: "",
          amount: "",
          styleItemId: "",
          colorId: "",
          selected: false,
        })),
      );
    }
  }, [salesBillItems, setSalesBillItems]);

  const handleInputChange = async (value, index, field) => {
    if (field === "qty") {
      const row = salesBillItems[index];
      const balanceQty = row?.stkQty || 0;
    }
    setSalesBillItems((prev) => {
      const newItems = structuredClone(prev);
      newItems[index][field] = value;
      // if (["qty", "rate", "discountValue"].includes(field)) {
      //   const qty = parseFloat(newItems[index].qty) || 0;
      //   const rate = parseFloat(newItems[index].rate) || 0;
      //   const discountValue = parseFloat(newItems[index].discountValue) || 0;

      //   const grossAmount = qty * rate;
      //   const netAmount = grossAmount - discountValue;

      //   newItems[index].amount = netAmount.toFixed(2);
      // }
      return newItems;
    });
  };

  const fillRows = (rowsToFill) => {
    setSalesBillItems((prev) => {
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

      while (updated.length < 5) {
        updated.push({
          barcodeNo: "",
          styleId: "",
          sizeId: "",
          qty: "",
          barcodeId: "",
          rate: "",
          taxPercent: "",
          discountType: "Percentage",
          discountValue: "",
          styleItemId: "",
          colorId: "",
          selected: false,
          netAmount: 0,
        });
      }

      return updated;
    });
  };

  const handleAddRow = async () => {
    const isFirstTime = salesBillItems.every(
      (row) => !row.qty && !row.rate && !row.styleId && !row.styleItemId,
    );

    if (!isFirstTime) {
      const hasEmpty = salesBillItems.some((row) => {
        const hasStyle =
          row.styleItemId !== "" &&
          row.styleItemId !== null &&
          row.styleItemId !== undefined;

        return hasStyle && !row.qty;
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

  useEffect(() => {
    // Recalculate net amount for all rows whenever dependent fields change
    const updatedRows = salesBillItems.map((row) => {
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
      (row, index) => row.netAmount !== (salesBillItems[index]?.netAmount || 0),
    );

    if (needsUpdate) {
      setSalesBillItems(updatedRows);
    }
  }, [salesBillItems]);

  const handleBarcodeEnter = async (index, row) => {
    try {
      const response = await getBarcodeDetails({
        params: { barcodeNo: row.barcodeNo , branchId : branchId},
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

      setSalesBillItems((prev) => {
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
          barcodeId: data.barcodeId,
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
          salesBillItems={salesBillItems}
          handleInputChange={handleInputChange}
        />
      </Modal>
      <Modal
        isOpen={showColorPopup}
        onClose={() => setShowColorPopup(false)}
        widthClass={"w-[220px]"}
      >
        <p className="text-md font-medium">Select Color</p>
        <div className="w-40 my-4">
          <DropdownNew
            name="Color"
            dataList={
              colorList?.data?.filter(
                (item) =>
                  Array.isArray(uniqueColorIds) &&
                  uniqueColorIds.includes(item.id),
              ) || []
            }
            value={colorId}
            setValue={(value) => {
              setColorId(value);
            }}
            required={false}
            clear={true}
            autoFocus={true}
          />
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="bg-green-700 text-white px-2 text-md rounded hover:bg-green-800"
            onClick={() => {
              const filtered = pendingStyleRows.filter(
                (row) => row.colorId === colorId,
              );
              fillRows(filtered);
              setShowColorPopup(false);
              setColorId("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const filtered = pendingStyleRows.filter(
                  (row) => row.colorId === colorId,
                );
                fillRows(filtered);
                setShowColorPopup(false);
                setColorId("");
              }
            }}
          >
            Add
          </button>
        </div>
      </Modal>
      <div className="border border-slate-200 px-2 bg-white rounded-md shadow-sm max-h-[450px] overflow-auto overflow-x-auto w-full">
        <div className="flex items-center gap-4 sticky top-0 bg-white z-30">
          {/* <ReusableInput
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
          /> */}
        </div>
        <div className="flex justify-between items-center">
          <h2 className="font-medium text-slate-700">List of Items</h2>
        </div>
        <div
          className={`w-full  max-h-[204px] min-h-[204px]  overflow-y-auto  mb-2 mt-1`}
        >
          <table className=" border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 text-center font-medium text-[13px]">
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        salesBillItems.length > 0 &&
                        salesBillItems
                          .filter((row) => (row.usedQty ?? 0) === 0)
                          .every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSalesBillItems((prev) =>
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
                  className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
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
                  className={`w-16 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(salesBillItems ? salesBillItems : [])?.map((row, index) => (
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
                          setSalesBillItems((prev) => {
                            const newBlend = [...prev];
                            newBlend[index] = {
                              barcodeNo: "",
                              styleItemId: null,
                              styleId: "",
                              sizeId: null,
                              colorId: null,
                              uomId: null,
                              qty: "",
                              rate: "",
                              amount: "",
                              discountType: "",
                              discountValue: "",
                              taxPercent: "",
                              barcodeId: "",
                              selected: false,
                            };
                            return newBlend;
                          });
                        }
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBarcodeEnter(index, row);
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
                          setSalesBillItems((prev) => {
                            const newBlend = [...prev];
                            newBlend[index] = {
                              barcodeNo: "",
                              styleItemId: null,
                              styleId: "",
                              sizeId: null,
                              colorId: null,
                              uomId: null,
                              qty: "",
                              rate: "",
                              amount: "",
                              discountType: "",
                              discountValue: "",
                              taxPercent: "",
                              barcodeId: "",
                              selected: false,
                            };
                            return newBlend;
                          });
                        }
                      }}
                      disabled={readOnly || row.styleItemId}
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
                          handleInputChange("", index, "qty");
                        }
                      }}
                      min={"0"}
                      type="number"
                      className="text-right rounded py-1 px-1 w-full"
                      onFocus={(e) => e.target.select()}
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
                      className="text-right rounded py-1 px-1 w-full "
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
                      <option value="Percentage">Percent</option>
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
                        row?.netAmount !== undefined && row?.netAmount !== null
                          ? Number(row.netAmount).toFixed(2)
                          : "0"
                      }
                      disabled
                    />
                  </td>
                  <td className=" py-0.5 border border-gray-300 text-[11px] text-right">
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
              ))}
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
                  {(Array.isArray(salesBillItems) ? salesBillItems : []).reduce(
                    (sum, row) => sum + (Number(row.qty) || 0),
                    0,
                  )}
                </td>
                <td className="border border-gray-300" colSpan={1}></td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {(Array.isArray(salesBillItems) ? salesBillItems : [])
                    .reduce((sum, row) => {
                      const qty = parseFloat(row.qty) || 0;
                      const rate = parseFloat(row.rate) || 0;
                      return sum + qty * rate;
                    }, 0)
                    .toFixed(2)}
                </td>
                <td className="border border-gray-300" colSpan={2}></td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {salesBillItems
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

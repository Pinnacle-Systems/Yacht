import {
  useGetStyleMasterQuery,
  useLazyGetStyleCodeDetailQuery,
} from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useLazyGetSizeTemplateByIdQuery } from "../../../redux/uniformService/SizeTemplateMasterServices";
import { findFromList } from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { toast } from "react-toastify";
import FxSelect from "../../../Inputs";
import Swal from "sweetalert2";
import { VIEW } from "../../../icons";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import Modal from "../../../UiComponents/Modal";
export default function PurchaseBillItems({
  purchaseBillItems,
  setPurchaseBillItems,
  params,
  readOnly,
  id,
  sizeList,
  styleItemList,
  colorList,
  uomList,
  taxTemplateId,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [styleNo, setStyleNo] = useState("");
  const [getStyleCodeDetail] = useLazyGetStyleCodeDetailQuery();
  const [styleTemplateDetail] = useLazyGetSizeTemplateByIdQuery();
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(null);

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId",
  );

  const addRow = () => {
    const newRow = {
      styleId: "",
      sizeId: "",
      qty: "",
      remarks: "",
      styleItemId: "",
      colorId: "",
      selected: false,
      barcodeNo: "",
      uomId: "",
      rate: "",
    };
    setPurchaseBillItems([...purchaseBillItems, newRow]);
  };

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(purchaseBillItems);
    newBlend[index][field] = value;
    setPurchaseBillItems(newBlend);
  };

  const deleteRow = (id) => {
    setPurchaseBillItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const deleteSelectedRows = () => {
    setPurchaseBillItems((rows) =>
      rows.filter((r) => !(r.selected && (r.stockQty ?? 0) === 0)),
    );
    setContextMenu(null);
  };

  const handleDeleteAllRows = () => {
    setPurchaseBillItems((prevRows) => {
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
              remarks: "",
              styleItemId: "",
              colorId: "",
              selected: false,
              barcodeNo: "",
              uomId: "",
              rate: "",
              selected: false,
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
          remarks: "",
          styleItemId: "",
          colorId: "",
          selected: false,
          barcodeNo: "",
          uomId: "",
          rate: "",
          selected: false,
        })),
      );
    }
  }, [purchaseBillItems, setPurchaseBillItems]);

  const handleAddRow = async () => {
    const isFirstTime = purchaseBillItems.every((row) => !row.styleNo);

    if (!isFirstTime) {
      // const hasEmpty = PurchaseBillItems.some((row) => !row.qty);
      const hasEmpty = purchaseBillItems.some((row) => {
        const hasStyle =
          row.styleNo !== "" &&
          row.styleNo !== null &&
          row.styleNo !== undefined;

        return hasStyle && (!row.styleItemId || !row.qty);
      });
      if (hasEmpty) {
        toast.info("Please fill all required fields...!", {
          position: "top-center",
        });
        return;
      }
    }
    try {
      const { data: styleData } = await getStyleCodeDetail({
        params: {
          styleNo: styleNo,
          companyId,
        },
      });
      const style = styleData?.data && Object.values(styleData.data)[0];
      if (!style) return;

      const sizeTemplateId = style.sizeTemplateId;
      let sizeRows = [];

      if (sizeTemplateId) {
        const { data: sizeData } = await styleTemplateDetail(sizeTemplateId);

        if (sizeData?.data?.SizeTemplateList?.length) {
          sizeRows = sizeData.data.SizeTemplateList.map((s) => ({
            styleNo: style.sku || "",
            fabricId: style.fabricId || "",
            styleId: style.id || "",
            sizeId: s.sizeId,
            qty: "",
            remarks: "",
            colorId: "",
            styleItemId: style.styleItemId || "",
            price: style.price || "",
            selected: false,
          }));
        }
      }
      setPurchaseBillItems((prev) => {
        const updated = [...prev];

        // Find first empty slot index
        let startIndex = updated.findIndex(
          (row) => !row.styleId && !row.sizeId && !row.styleNo && !row.fabricId,
        );
        if (startIndex === -1) startIndex = updated.length;

        // Fill in sizeRows starting at first empty slot
        sizeRows.forEach((row, i) => {
          if (startIndex + i < updated.length) {
            updated[startIndex + i] = row;
          } else {
            updated.push(row); // append if no empty slot
          }
        });

        // Ensure at least 6 rows
        while (updated.length < 3) {
          updated.push({
            styleNo: "",
            fabricId: "",
            styleId: "",
            sizeId: "",
            qty: "",
            remarks: "",
            styleItemId: "",
            colorId: "",
            selected: false,
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
        <div className="flex items-center gap-4  sticky top-0 bg-white z-30 mt-2">
          <ReusableInput
            label="Style No"
            value={styleNo}
            setValue={setStyleNo}
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
          <h2 className="font-medium text-slate-700">List Of Items</h2>
        </div>
        <div className={`w-full max-h-[200px]  overflow-y-auto  my-1`}>
          <table className=" border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
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
                  Amount
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
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
                        type="number"
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
                          handleInputChange(
                            row.styleItemId,
                            index,
                            "styleItemId",
                          )
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
                        onChange={(val) =>
                          handleInputChange(val, index, "uomId")
                        }
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
                            handleInputChange("", index, "qty");
                          }
                          // if (e.key === "Enter") {
                          //   e.preventDefault(); // prevent form submit or line break
                          //   e.stopPropagation();
                          //   const nextQtyInput = document.querySelector(
                          //     `#styleId-input-${index + 1}`,
                          //   );
                          //   if (nextQtyInput) {
                          //     nextQtyInput.focus();
                          //   }
                          // }
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
                          // const minQty = row.minQty || 0;
                          // if (parseFloat(minQty) > parseFloat(e.target.value)) {
                          //   e.target.value = "";
                          //   Swal.fire({
                          //     icon: "warning",
                          //     title: "Invalid Qty",
                          //     text: `Inward Qty cannot be Less than Min Qty! - ${minQty}`,
                          //     confirmButtonText: "OK",
                          //   });
                          //   return;
                          // }
                          handleInputChange(e.target.value, index, "qty");
                        }}
                        disabled={readOnly}
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
                        onContextMenu={(e) => {
                          if (!readOnly) {
                            handleRightClick(e, index, "");
                          }
                        }}
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
                  colSpan={6}
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
                  deleteRow(contextMenu.rowId);
                  deleteSelectedRows();
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

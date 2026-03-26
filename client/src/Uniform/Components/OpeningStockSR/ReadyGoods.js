import {
  useGetStyleMasterQuery,
  useLazyGetStyleCodeDetailQuery,
} from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useLazyGetSizeTemplateByIdQuery } from "../../../redux/uniformService/SizeTemplateMasterServices";
import secureLocalStorage from "react-secure-storage";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { toast } from "react-toastify";
import FxSelect from "../../../Inputs";
import { findFromList } from "../../../Utils/helper";

export default function ReadyGoods({
  openingStockItems,
  setOpeningStockItems,
  params,
  readOnly,
  id,
  styleList,
  sizeList,
  colorList,
  uomList,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [styleNo, setStyleNo] = useState("");
  const [getStyleCodeDetail] = useLazyGetStyleCodeDetailQuery();
  const [styleTemplateDetail] = useLazyGetSizeTemplateByIdQuery();
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });

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
      uomId: "",
      styleNo: "",
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

  const deleteSelectedRows = () => {
    setOpeningStockItems((rows) =>
      rows.filter((r) => !(r.selected && (r.stockQty ?? 0) === 0)),
    );
    setContextMenu(null);
  };

  const handleDeleteAllRows = () => {
    setOpeningStockItems((prevRows) => {
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
    if (openingStockItems) {
      setOpeningStockItems((prev) => {
        const filledRows = prev.length;

        if (filledRows < 5) {
          // add empty rows until total becomes 6
          return [
            ...prev,
            ...Array.from({ length: 5 - filledRows }, () => ({
              styleId: "",
              sizeId: "",
              qty: "",
              remarks: "",
              styleItemId: "",
              colorId: "",
              selected: false,
              uomId: "",
              styleNo: "",
            })),
          ];
        }
        return prev; // if already >= 6, just keep as it is
      });
    } else {
      // if null/undefined, initialize with 6 empty rows
      setOpeningStockItems(
        Array.from({ length: 5 }, () => ({
          styleId: "",
          sizeId: "",
          qty: "",
          remarks: "",
          styleItemId: "",
          colorId: "",
          selected: false,
          uomId: "",
          styleNo: "",
        })),
      );
    }
  }, [openingStockItems, setOpeningStockItems]);

  const handleAddRow = async () => {
    const isFirstTime = openingStockItems.every((row) => !row.styleId);

    if (!isFirstTime) {
      // const hasEmpty = openingStockItems.some((row) => !row.qty);
      const hasEmpty = openingStockItems.some((row) => {
        const hasStyle =
          row.styleId !== "" &&
          row.styleId !== null &&
          row.styleId !== undefined;

        return hasStyle && !row.qty;
      });
      if (hasEmpty) {
        toast.info("Please fill all required fields...!", {
          position: "top-center",
          autoClose: 2000,
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
            styleId: style.id || "",
            sizeId: s.sizeId,
            qty: "",
            remarks: "",
            colorId: "",
            styleItemId: style.styleItemId || "",
            selected: false,
            uomId: style.uomId || "",
            styleNo: style.sku,
          }));
        }
      }
      setOpeningStockItems((prev) => {
        const updated = [...prev];

        // Find first empty slot index
        let startIndex = updated.findIndex(
          (row) => !row.styleId && !row.sizeId && !row.styleId,
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
        while (updated.length < 5) {
          updated.push({
            styleId: "",
            sizeId: "",
            qty: "",
            remarks: "",
            styleItemId: "",
            colorId: "",
            selected: false,
            uomId: "",
            styleNo: "",
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
        <div className="flex justify-between items-center mb-1">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
        </div>
        <div
          className={`w-full max-h-[230px] min-h-[230px] overflow-y-auto mb-2`}
        >
          <table className=" border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 justify-center font-medium text-[13px]">
                  {/* <tr className="flex items-center justify-center">Select</tr> */}
                  <tr className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        openingStockItems.length > 0 &&
                        openingStockItems
                          .filter((row) => (row.usedQty ?? 0) === 0)
                          .every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setOpeningStockItems((prev) =>
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
                      tabIndex={-1}
                      disabled={readOnly}
                    />
                  </tr>
                </th>
                <th
                  className={`w-12 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  S.No
                </th>
                <th
                  className={`w-24 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  Style No
                </th>{" "}
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
                  className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Unit
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
              {(openingStockItems ? openingStockItems : [])?.map(
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
                      <FxSelect
                        value={row.colorId}
                        onChange={(val) =>
                          handleInputChange(val, index, "colorId")
                        }
                        options={(colorList?.data || [])
                          .filter((item) => (id ? true : item.active))
                          .map((item) => ({
                            label: item.name,
                            value: item.id,
                          }))}
                        readOnly={readOnly || row.id}
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
                        disabled={readOnly}
                      />
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px]">
                      <FxSelect
                        value={row.uomId}
                        onChange={(val) =>
                          handleInputChange(val, index, "uomId")
                        }
                        options={(uomList?.data || [])
                          .filter((item) => (id ? true : item.active))
                          .map((item) => ({
                            label: item.name,
                            value: item.id,
                          }))}
                        readOnly={readOnly || row.id}
                        placeholder=""
                        onBlur={() =>
                          handleInputChange(row.uomId, index, "uomId")
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "uomId");
                          }
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
                            handleInputChange("", index, "qty");
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
                          handleInputChange(e.target.value, index, "qty");
                        }}
                        disabled={readOnly || (row.usedQty ?? 0) > 0}
                      />
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault(); // prevent form submit or line break
                            e.stopPropagation();
                            const nextQtyInput = document.querySelector(
                              `#qty-input-${index + 1}`,
                            );
                            if (nextQtyInput) {
                              nextQtyInput.focus();
                            }
                          }
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
                ),
              )}
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
                  {openingStockItems.reduce(
                    (sum, row) => sum + (Number(row.qty) || 0),
                    0,
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

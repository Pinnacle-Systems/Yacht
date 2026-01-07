import {
  useGetStyleMasterQuery,
  useLazyGetStyleCodeDetailQuery,
} from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useLazyGetSizeTemplateByIdQuery } from "../../../redux/uniformService/SizeTemplateMasterServices";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { findFromList } from "../../../Utils/helper";
import { IMAGE_UPLOAD_URL } from "../../../Constants";
import secureLocalStorage from "react-secure-storage";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { VIEW } from "../../../icons";
import { toast } from "react-toastify";
import FxSelect from "../../../Inputs";
import Swal from "sweetalert2";

export default function ReadyGoods({
  readyGoods,
  setReadyGoods,
  params,
  readOnly,
  id,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [styleNo, setStyleNo] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [getStyleCodeDetail] = useLazyGetStyleCodeDetailQuery();
  const [styleTemplateDetail] = useLazyGetSizeTemplateByIdQuery();
  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  const addRow = () => {
    const newRow = {
      styleNo: "",
      fabricId: "",
      styleId: "",
      sizeId: "",
      qty: "",
      remarks: "",
      styleItemId: "",
      colorId: "",
      selected: false,
    };
    setReadyGoods([...readyGoods, newRow]);
  };

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(readyGoods);
    newBlend[index][field] = value;
    setReadyGoods(newBlend);
  };

  const deleteRow = (id) => {
    setReadyGoods((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const deleteSelectedRows = () => {
    setReadyGoods((rows) =>
      rows.filter((r) => !(r.selected && (r.stockQty ?? 0) === 0))
    );
    setContextMenu(null);
  };

  const handleDeleteAllRows = () => {
    setReadyGoods((prevRows) => {
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
    if (readyGoods) {
      setReadyGoods((prev) => {
        const filledRows = prev.length;

        if (filledRows < 6) {
          // add empty rows until total becomes 6
          return [
            ...prev,
            ...Array.from({ length: 6 - filledRows }, () => ({
              styleNo: "",
              fabricId: "",
              styleId: "",
              sizeId: "",
              qty: "",
              remarks: "",
              styleItemId: "",
              colorId: "",
              selected: false,
            })),
          ];
        }
        return prev; // if already >= 6, just keep as it is
      });
    } else {
      // if null/undefined, initialize with 6 empty rows
      setReadyGoods(
        Array.from({ length: 6 }, () => ({
          styleNo: "",
          fabricId: "",
          styleId: "",
          sizeId: "",
          qty: "",
          remarks: "",
          styleItemId: "",
          colorId: "",
          selected: false,
        }))
      );
    }
  }, [readyGoods, setReadyGoods]);

  const handleAddRow = async () => {
    const isFirstTime = readyGoods.every((row) => !row.styleNo);

    if (!isFirstTime) {
      // const hasEmpty = readyGoods.some((row) => !row.qty);
      const hasEmpty = readyGoods.some((row) => {
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
      setReadyGoods((prev) => {
        const updated = [...prev];

        // Find first empty slot index
        let startIndex = updated.findIndex(
          (row) => !row.styleId && !row.sizeId && !row.styleNo && !row.fabricId
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
        while (updated.length < 6) {
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

  function imageFormatter(styleId) {
    const fileName = findFromList(styleId, styleList?.data, "img");
    if (!fileName) return "/no-image.png"; // fallback image if missing
    return `${IMAGE_UPLOAD_URL}${fileName}`;
  }

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
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
        </div>
        <div className={`w-full max-h-[200px]  overflow-y-auto  my-1`}>
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 justify-center font-medium text-[13px]">
                  {/* <tr className="flex items-center justify-center">Select</tr> */}
                  <tr className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        readyGoods.length > 0 &&
                        readyGoods
                          .filter((row) => (row.usedQty ?? 0) === 0)
                          .every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setReadyGoods((prev) =>
                          prev.map((row) =>
                            (row.usedQty ?? 0) > 0
                              ? row
                              : { ...row, selected: checked }
                          )
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
                  Style
                </th>
                <th
                  className={`w-12 px-4 py-2 text-center  font-medium text-[13px]`}
                >
                  Img
                </th>
                <th
                  className={`w-48 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  Fabric
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
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Qty
                </th>
                <th
                  className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                ></th>
              </tr>
            </thead>
            <tbody>
              {(readyGoods ? readyGoods : [])?.map((row, index) => (
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
                    <FxSelect
                      inputId={`styleId-input-${index}`}
                      value={row.styleId}
                      onChange={(val) =>
                        handleInputChange(val, index, "styleId")
                      }
                      options={(styleList?.data || [])
                        .filter((item) => item.active)
                        .map((item) => ({
                          label: item.sku,
                          value: item.id,
                        }))}
                      readOnly={readOnly || (row.usedQty ?? 0) > 0}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.styleId, index, "styleId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "styleId");
                        }
                      }}
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
                        handleInputChange(row.styleItemId, index, "styleItemId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "styleItemId");
                        }
                      }}
                    />
                  </td>
                  <td className="border border-gray-300 py-0.5 text-center">
                    {row?.styleId ? (
                      <button
                        className="text-xs"
                        onClick={() => {
                          setPreviewImage(imageFormatter(row?.styleId));
                        }}
                      >
                        {VIEW}
                      </button>
                    ) : (
                      <span className="text-xs pl-1"></span>
                    )}
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px] ">
                    <FxSelect
                      value={row.fabricId}
                      onChange={(val) =>
                        handleInputChange(val, index, "fabricId")
                      }
                      options={(fabricList?.data || [])
                        .filter((item) => item.active)
                        .map((item) => ({
                          label: item.name,
                          value: item.id,
                        }))}
                      readOnly={readOnly || (row.usedQty ?? 0) > 0}
                      placeholder=""
                      onBlur={() =>
                        handleInputChange(row.fabricId, index, "fabricId")
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "fabricId");
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
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                    <input
                      onKeyDown={(e) => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract")
                          e.preventDefault();
                        if (e.key === "Delete") {
                          handleInputChange("", index, "qty");
                        }
                        if (e.key === "Enter") {
                          e.preventDefault(); // prevent form submit or line break
                          e.stopPropagation();
                          const nextQtyInput = document.querySelector(
                            `#styleId-input-${index + 1}`
                          );
                          if (nextQtyInput) {
                            nextQtyInput.focus();
                          }
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
                        const minQty = row.minQty || 0;
                        if (parseFloat(minQty) > parseFloat(e.target.value)) {
                          e.target.value = "";
                          Swal.fire({
                            icon: "warning",
                            title: "Invalid Qty",
                            text: `Inward Qty cannot be Less than Min Qty! - ${minQty}`,
                            confirmButtonText: "OK",
                          });
                          return;
                        }
                        handleInputChange(e.target.value, index, "qty");
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
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 h-7 font-medium text-gray-800">
                <td
                  className="text-right px-4 border border-gray-300 font-medium text-[13px] py-0.5"
                  colSpan={8}
                >
                  Total Qty
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {(Array.isArray(readyGoods) ? readyGoods : []).reduce(
                    (sum, row) => sum + (Number(row.qty) || 0),
                    0
                  )}
                </td>
                <td className="border border-gray-300" colSpan={1}></td>
              </tr>
            </tfoot>
          </table>
          {previewImage && (
            <div
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
              onMouseEnter={() => setPreviewImage(previewImage)}
              onMouseLeave={() => setPreviewImage(null)}
            >
              <div className="relative z-50 ">
                <button
                  className="absolute top-[-10px] right-[-10px] bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-white shadow-md hover:bg-red-700 transition"
                  onClick={() => setPreviewImage(null)}
                >
                  ×
                </button>

                <img
                  src={previewImage}
                  alt="No Image...."
                  className="max-h-[80vh] max-w-[80vw] rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}
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

import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useLazyGetSizeTemplateByIdQuery } from "../../../redux/uniformService/SizeTemplateMasterServices";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";
import { findFromList } from "../../../Utils/helper";
import { IMAGE_UPLOAD_URL } from "../../../Constants";
import { VIEW } from "../../../icons";
import { useLazyGetProductionDetailQuery } from "../../../redux/uniformService/ProductionStockServices";
import { DropdownNew } from "../../../Inputs";
import Swal from "sweetalert2";
import { useGetPurchaseInwardEntryQuery } from "../../../redux/uniformService/PurchaseInwardEntry";
import { useGetPortionMasterQuery } from "../../../redux/uniformService/PortionMasterService";

export default function StockInwardItems({
  stockInwardItems,
  setStockInwardItems,
  params,
  readOnly,
  id,
  branchId,
  styleList,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [styleTemplateDetail] = useLazyGetSizeTemplateByIdQuery();

  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetPurchaseInwardEntryQuery({
    params,
  });
  const { data: portionList } = useGetPortionMasterQuery({ params });

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
      stkQty: "",
    };
    setStockInwardItems([...stockInwardItems, newRow]);
  };

  const handleInputChange = (value, index, field) => {
    if (field === "qty") {
      const row = stockInwardItems[index];
      const stkQty = row.stkQty || 0;
      if (parseFloat(stkQty) < parseFloat(value)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Inward Qty cannot be more than Stock Qty!",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    const newBlend = structuredClone(stockInwardItems);
    newBlend[index][field] = value;
    setStockInwardItems(newBlend);
  };

  const deleteRow = (id) => {
    setStockInwardItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const deleteSelectedRows = () => {
    setStockInwardItems((rows) =>
      rows.filter((r) => !(r.selected && (r.usedQty ?? 0) === 0))
    );
    setContextMenu(null);
  };

  const handleDeleteAllRows = () => {
    setStockInwardItems((prevRows) => {
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
    if (stockInwardItems) {
      setStockInwardItems((prev) => {
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
              stkQty: "",
            })),
          ];
        }
        return prev; // if already >= 6, just keep as it is
      });
    } else {
      // if null/undefined, initialize with 6 empty rows
      setStockInwardItems(
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
          stkQty: "",
        }))
      );
    }
  }, [stockInwardItems, setStockInwardItems]);

  // function imageFormatter(styleId) {
  //   const fileName = findFromList(styleId, styleList?.data, "img");
  //   if (!fileName) return "/no-image.png"; // fallback image if missing
  //   return `${IMAGE_UPLOAD_URL}${fileName}`;
  // }

  function imageFormatter(styleId, portionId) {
    const fabricItems = allData?.data?.flatMap(
      (item) => item.fabricInwardItems || []
    );
    const item = fabricItems.find(
      (f) => f.styleId === styleId && f.portionId === portionId
    );
    const fileName = item?.filePath;
    if (!fileName) return "/no-image.png"; // fallback image if missing
    return `${IMAGE_UPLOAD_URL}${fileName}`;
  }

  return (
    <>
      <div className="border border-slate-200  bg-white rounded-md shadow-sm max-h-[450px] px-2 overflow-auto">
        <div className="flex items-center gap-4 w-40 sticky top-0 bg-white z-30 mt-2"></div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
        </div>
        <div className={`w-full max-h-[300px]  overflow-y-auto  my-1`}>
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 justify-center font-medium text-[13px]">
                  {/* <tr className="flex items-center justify-center">Select</tr> */}
                  <tr className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        stockInwardItems.length > 0 &&
                        stockInwardItems
                          .filter((row) => (row.usedQty ?? 0) === 0)
                          .every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setStockInwardItems((prev) =>
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
                      onFocus={(e) => e.target.blur()}
                    />
                  </tr>
                </th>
                <th
                  className={`w-12 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  S.No
                </th>
                {/* <th
                  className={`w-20 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  Style No
                </th>{" "} */}
                <th
                  className={`w-48 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style
                </th>
                <th
                  className={`w-40 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  Fabric
                </th>
                <th
                  className={`w-12 px-4 py-2 text-center  font-medium text-[13px]`}
                >
                  Img
                </th>
                <th
                  className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Color
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Portion
                </th>
                <th
                  className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Size
                </th>
                <th
                  className={`w-16 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Stk Qty
                </th>
                <th
                  className={`w-16 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Qty
                </th>
                <th
                  className={`w-48 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Remarks
                </th>
                <th
                  className={`w-14 px-3 py-2 text-center font-medium text-[13px] `}
                ></th>
              </tr>
            </thead>
            <tbody>
              {(stockInwardItems ? stockInwardItems : [])?.map((row, index) => (
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
                  {/* <td className="py-0.5 border border-gray-300 text-[11px] ">
                    <select
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "styleId");
                        }
                      }}
                      tabIndex={"0"}
                      disabled={true}
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
                          {blend?.sku}
                        </option>
                      ))}
                    </select>
                  </td> */}
                  <td className="py-0.5 border border-gray-300 text-[11px] ">
                    <select
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "styleItemId");
                        }
                      }}
                      tabIndex={"0"}
                      disabled={true}
                      className="text-left w-full rounded py-1 table-data-input"
                      value={row.styleItemId}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "styleItemId")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "styleItemId");
                      }}
                    >
                      <option></option>
                      {(id
                        ? styleItemList?.data
                        : styleItemList?.data?.filter((item) => item.active)
                      )?.map((blend) => (
                        <option value={blend.id} key={blend.id}>
                          {blend?.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px] ">
                    <select
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "fabricId");
                        }
                      }}
                      tabIndex={"0"}
                      disabled={true}
                      className="text-left w-full rounded py-1 table-data-input"
                      value={row.fabricId}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "fabricId")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "fabricId");
                      }}
                    >
                      <option></option>
                      {(id
                        ? fabricList?.data
                        : fabricList?.data?.filter((item) => item.active)
                      )?.map((blend) => (
                        <option value={blend.id} key={blend.id}>
                          {blend?.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-300 py-0.5 text-center">
                    {row?.styleId ? (
                      <button
                        className="text-xs"
                        onClick={() => {
                          setPreviewImage(
                            imageFormatter(row?.styleId, row.portionId)
                          );
                        }}
                      >
                        {VIEW}
                      </button>
                    ) : (
                      <span className="text-xs pl-1"></span>
                    )}
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px]">
                    <select
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "colorId");
                        }
                      }}
                      tabIndex={"0"}
                      disabled={true}
                      className="text-left w-full rounded py-1 table-data-input"
                      value={row.colorId}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "colorId")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "colorId");
                      }}
                    >
                      <option></option>
                      {(id
                        ? colorList?.data
                        : colorList?.data?.filter((item) => item.active)
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
                          handleInputChange("", index, "portionId");
                        }
                      }}
                      tabIndex={"0"}
                      disabled={true}
                      className="text-left w-full rounded py-1 table-data-input"
                      value={row.portionId}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "portionId")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "portionId");
                      }}
                    >
                      <option></option>
                      {(id
                        ? portionList?.data
                        : portionList?.data?.filter((item) => item.active)
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
                      disabled={true}
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
                          handleInputChange("", index, "stkQty");
                        }
                      }}
                      min={"0"}
                      type="number"
                      className="text-right rounded py-1 px-1 w-full table-data-input"
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
                      id={`qty-input-${index}`}
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
                      disabled={readOnly}
                    />
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                    <input
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault(); // prevent form submit or line break
                          e.stopPropagation();
                          const nextQtyInput = document.querySelector(
                            `#qty-input-${index + 1}`
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
                      // onContextMenu={(e) => {
                      //   if (!readOnly) {
                      //     handleRightClick(e, index, "notes");
                      //   }
                      // }}
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
                  colSpan={9}
                >
                  Total Qty
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {stockInwardItems.reduce(
                    (sum, row) => sum + (Number(row.qty) || 0),
                    0
                  )}
                </td>
                <td className="border border-gray-300" colSpan={2}></td>
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
                  alt="Preview"
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

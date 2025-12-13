import {
  useGetStyleMasterQuery,
  useLazyGetStyleCodeDetailQuery,
} from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useRef, useState } from "react";
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
import { useGetPortionMasterQuery } from "../../../redux/uniformService/PortionMasterService";
import Swal from "sweetalert2";
import { useGetEmployeeQuery } from "../../../redux/services/EmployeeMasterService";
import { useGetPurchaseInwardEntryQuery } from "../../../redux/uniformService/PurchaseInwardEntry";

export default function ProductionDeliveryItem({
  productionEntryItems,
  setProductionEntryItems,
  params,
  readOnly,
  id,
  sizeTemplateId,
  styleTemplateDetail,
}) {
  const [sizeColumns, setSizeColumns] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: portionList } = useGetPortionMasterQuery({ params });
  const { data: employeeList } = useGetEmployeeQuery({ params });
  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetPurchaseInwardEntryQuery({
    params,
  });
  const firstLoad = useRef(true);
  const [previewImage, setPreviewImage] = useState(null);

  const addRow = () => {
    const newRow = {
      styleNo: "",
      styleItemId: "",
      fabricId: "",
      colorId: "",
      styleId: "",
      sizeId: "",
      portionId: "",
      orderQty: "",
      issueQty: "",
      remarks: "",
      selected: false,
      prevProcessId: "",
      sizeId: "",
    };
    setProductionEntryItems([...productionEntryItems, newRow]);
  };

  const handleInputChange = (value, index, field) => {
    if (field === "issueQty") {
      const row = productionEntryItems[index];
      const balanceQty = row?.stkQty || 0;

      if (parseFloat(balanceQty) < parseFloat(value)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Production Qty cannot be more than Stock Qty!",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    const newBlend = structuredClone(productionEntryItems);
    newBlend[index][field] = value;
    setProductionEntryItems(newBlend);
    console.log("index", index);
  };

  const deleteRow = (id) => {
    setProductionEntryItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const deleteSelectedRows = () => {
    setProductionEntryItems((rows) =>
      rows.filter((r) => !(r.selected && (r.usedQty ?? 0) === 0))
    );
    setContextMenu(null);
  };

  const handleDeleteAllRows = () => {
    setProductionEntryItems((prevRows) => {
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

  // const getSizeTemplate = async () => {
  //   // const style = styleList?.data.find((item) => item.id === styleId);
  //   // const sizeTemplateId = style?.sizeTemplateId;

  //   if (!sizeTemplateId) return;

  //   const { data: sizeData } = await styleTemplateDetail(sizeTemplateId);

  //   if (!sizeData?.data?.SizeTemplateList?.length) return;

  //   const columns = sizeData.data.SizeTemplateList.map((s) => ({
  //     sizeId: s.sizeId,
  //     sizeName: s.Size?.name,
  //   }));

  //   // if (id) {
  //   //     // 🔥 Delay only when editing
  //   //     setTimeout(() => {
  //   //         setSizeColumns(columns);
  //   //     }, 500); // adjust delay if needed
  //   // } else {
  //   // Create mode → immediate
  //   setSizeColumns(columns);
  //   // }
  // };

  // useEffect(() => {
  //   if (!sizeTemplateId) return;
  //   getSizeTemplate();
  // }, [sizeTemplateId]);

  // const initSizeDetails = (row) => {
  //   if (row.pcsSizeDetails && row.pcsSizeDetails.length > 0) {
  //     // already initialized (edit mode)
  //     return row.pcsSizeDetails;
  //   }

  //   // create sizeDetails (create mode)
  //   return sizeColumns.map((col) => ({
  //     sizeId: col.sizeId,
  //     qty: "",
  //   }));
  // };

  // useEffect(() => {
  //   if (sizeColumns.length === 0 || productionEntryItems.length === 0) return;

  //   setProductionEntryItems((prev) => {
  //     let changed = false;

  //     const updated = prev.map((row) => {
  //       if (!row.pcsSizeDetails || row.pcsSizeDetails.length === 0) {
  //         changed = true;
  //         return {
  //           ...row,
  //           pcsSizeDetails: initSizeDetails(row),
  //         };
  //       }
  //       return row;
  //     });

  //     return changed ? updated : prev; // prevent unnecessary rerender
  //   });
  // }, [sizeColumns]);

  useEffect(() => {
    if (productionEntryItems) {
      setProductionEntryItems((prev) => {
        const filledRows = prev.length;

        if (filledRows < 5) {
          // add empty rows until total becomes 6
          return [
            ...prev,
            ...Array.from({ length: 6 - filledRows }, () => ({
              styleNo: "",
              styleItemId: "",
              fabricId: "",
              colorId: "",
              portionId: "",
              sizeId: "",
              orderQty: "",
              remarks: "",
              selected: false,
              issueQty: "",
              prevProcessId: "",
              styleId: "",
              stkQty: "",
            })),
          ];
        }
        return prev; // if already >= 6, just keep as it is
      });
    } else {
      // if null/undefined, initialize with 6 empty rows
      setProductionEntryItems(
        Array.from({ length: 6 }, () => ({
          styleNo: "",
          styleItemId: "",
          fabricId: "",
          colorId: "",
          portionId: "",
          sizeId: "",
          orderQty: "",
          remarks: "",
          selected: false,
          issueQty: "",
          prevProcessId: "",
          styleId: "",
          stkQty: "",
        }))
      );
    }
  }, [productionEntryItems, setProductionEntryItems]);

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
      <div className="border border-slate-200  bg-white rounded-md shadow-sm max-h-[450px] px-2 overflow-auto overflow-x-auto w-full">
        <div className="flex justify-between items-center mb-2 m-2">
          <h2 className="font-medium text-slate-700">Production Items</h2>
        </div>
        <div className={`w-full max-h-[300px]  overflow-y-auto  my-1`}>
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 justify-center font-medium text-[13px]">
                  <tr className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        productionEntryItems.length > 0 &&
                        productionEntryItems
                          .filter((row) => (row.usedQty ?? 0) === 0)
                          .every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setProductionEntryItems((prev) =>
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
                      onFocus={(e) => e.target.blur()}
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
                  className={`w-48 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style
                </th>
                <th
                  className={`w-44 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  Fabric
                </th>
                <th
                  className={`w-11 px-2 py-2 text-center  font-medium text-[13px]`}
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
                  className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Stock Qty
                </th>
                <th
                  className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Production Qty
                </th>
                <th
                  className={`w-36 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Employee
                </th>
                <th
                  className={`w-40 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Remarks
                </th>

                <th
                  className={`w-10 px-3 py-2 text-center font-medium text-[13px] `}
                ></th>
              </tr>
            </thead>
            <tbody>
              {(productionEntryItems ? productionEntryItems : [])?.map(
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
                      <select
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "styleItemId");
                          }
                        }}
                        tabIndex={"0"}
                        disabled={id}
                        className="text-left w-full rounded py-1 table-data-input"
                        value={row.styleItemId}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            index,
                            "styleItemId"
                          )
                        }
                        onBlur={(e) => {
                          handleInputChange(
                            e.target.value,
                            index,
                            "styleItemId"
                          );
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
                        disabled={id}
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
                        disabled={id}
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
                        disabled={id}
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
                        disabled={id}
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
                    {/* {sizeColumns.map((col) => {
                      // find matching size entry
                      const sizeItem = row.pcsSizeDetails?.find(
                        (s) => s.sizeId === col.sizeId
                      ) || { sizeId: col.sizeId, qty: "" };

                      return (
                        <td
                          key={col.sizeId}
                          className="py-0.5 border border-gray-300 text-[11px]"
                        >
                          <input
                            type="number"
                            disabled={readOnly}
                            className="text-right rounded py-1 px-1 w-full table-data-input"
                            value={sizeItem.qty}
                            onChange={(e) => {
                              const qty = e.target.value;
                              setProductionEntryItems((prev) => {
                                const updated = [...prev];
                                const rowData = { ...updated[index] };

                                rowData.pcsSizeDetails =
                                  rowData?.pcsSizeDetails?.map((s) =>
                                    s.sizeId === col.sizeId ? { ...s, qty } : s
                                  ) || initSizeDetails(rowData);
                                // const details = rowData?.pcsSizeDetails || [];
                                rowData.issueQty =
                                  rowData?.pcsSizeDetails.reduce(
                                    (total, item) =>
                                      total + Number(item.qty || 0),
                                    0
                                  );

                                updated[index] = rowData;
                                return updated;
                              });
                            }}
                            onFocus={(e) => e.target.select()}
                            min={"0"}
                            onKeyDown={(e) => {
                              if (
                                e.code === "Minus" ||
                                e.code === "NumpadSubtract"
                              )
                                e.preventDefault();
                            }}
                          />
                        </td>
                      );
                    })} */}

                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        id={`issueQty-input-${index}`}
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "issueQty");
                          }
                        }}
                        min={"0"}
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.focus()}
                        value={row?.issueQty}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "issueQty")
                        }
                        onBlur={(e) => {
                          const minQty = row.minQty || 0;
                          if (parseFloat(minQty) > parseFloat(e.target.value)) {
                            e.target.value = "";
                            Swal.fire({
                              icon: "warning",
                              title: "Invalid Qty",
                              text: `Production Qty cannot be Less than Min Qty! - ${minQty}`,
                              confirmButtonText: "OK",
                            });
                            return;
                          }
                          handleInputChange(e.target.value, index, "issueQty");
                        }}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px]">
                      <select
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "employeeId");
                          }
                        }}
                        tabIndex={"0"}
                        disabled={readOnly}
                        className="text-left w-full rounded py-1 table-data-input"
                        value={row.employeeId}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "employeeId")
                        }
                        onBlur={(e) => {
                          handleInputChange(
                            e.target.value,
                            index,
                            "employeeId"
                          );
                        }}
                      >
                        <option></option>
                        {employeeList?.data?.map((blend) => (
                          <option value={blend.id} key={blend.id}>
                            {blend?.firstName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            const nextQtyInput = document.querySelector(
                              `#issueQty-input-${index + 1}`
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
                )
              )}
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
                  {productionEntryItems.reduce(
                    (sum, row) => sum + (Number(row.stkQty) || 0),
                    0
                  )}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {productionEntryItems.reduce(
                    (sum, row) => sum + (Number(row.issueQty) || 0),
                    0
                  )}
                </td>
                <td className="border border-gray-300" colSpan={3}></td>
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
      </div>
    </>
  );
}

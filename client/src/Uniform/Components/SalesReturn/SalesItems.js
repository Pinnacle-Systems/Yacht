import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useLazyGetBarcodeDetailQuery } from "../../../redux/uniformService/StockAdjustmentService";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useLazyGetStyleDetailQuery } from "../../../redux/services/StockService";
import { findFromList } from "../../../Utils/helper";
import { IMAGE_UPLOAD_URL } from "../../../Constants";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { toast } from "react-toastify";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { VIEW } from "../../../icons";
import Swal from "sweetalert2";
import { useLazyGetSalesInvStyleDetailQuery } from "../../../redux/uniformService/SalesEntryService";
import Modal from "../../../UiComponents/Modal";
import { DropdownNew } from "../../../Inputs";

export default function SalesItems({
  salesReturnItems,
  setSalesReturnItems,
  params,
  readOnly,
  id,
  storeId,
  branchId,
  customerId,
  invNo,
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [styleNo, setStyleNo] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const [pendingStyleRows, setPendingStyleRows] = useState([]);
  const [showColorPopup, setShowColorPopup] = useState(false);
  const [colorId, setColorId] = useState("");
  const [uniqueColorIds, setUniqueColorIds] = useState([]);

  const [getStyleDetail] = useLazyGetSalesInvStyleDetailQuery();

  const [
    triggerGetBarcodeDetail,
    { data: barcodeData, isFetching, isLoading },
  ] = useLazyGetBarcodeDetailQuery();

  const addRow = () => {
    const newRow = {
      barcode: "",
      styleId: "",
      sizeId: "",
      stkQty: "",
      returnQty: "",
      remarks: "",
      styleNo: "",
      fabricId: "",
      styleItemId: "",
      colorId: "",
      selected: false,
    };
    setSalesReturnItems([...salesReturnItems, newRow]);
  };

  const deleteRow = (id) => {
    setSalesReturnItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== Number(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setSalesReturnItems((prevRows) => {
      if (prevRows.length <= 1) return prevRows;
      return [prevRows[0]];
    });
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

        if (count < 6) {
          return [
            ...prev,
            ...Array.from({ length: 6 - count }, () => ({
              barcode: "",
              styleId: "",
              sizeId: "",
              stkQty: "",
              returnQty: "",
              remarks: "",
              styleNo: "",
              fabricId: "",
              styleItemId: "",
              colorId: "",
              selected: false,
              qty: "",
            })),
          ];
        }

        return prev; // keep as-is if already >= 6
      });
    } else {
      setSalesReturnItems(
        Array.from({ length: 6 }, () => ({
          barcode: "",
          styleId: "",
          sizeId: "",
          stkQty: "",
          returnQty: "",
          remarks: "",
          styleNo: "",
          fabricId: "",
          styleItemId: "",
          colorId: "",
          selected: false,
          qty: "",
        }))
      );
    }
  }, [salesReturnItems, setSalesReturnItems]);

  const handleInputChange = async (value, index, field) => {
    if (field === "returnQty") {
      const row = salesReturnItems[index];
      const balanceQty = row?.qty || 0;

      if (parseFloat(balanceQty) < parseFloat(value)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Return Qty cannot be more than Sales Qty!",
          confirmButtonText: "OK",
        });
        setSalesReturnItems((prev) => {
          const newItems = structuredClone(prev);
          newItems[index].returnQty = ""; // or null
          return newItems;
        });
        return;
      }
    }
    setSalesReturnItems((prev) => {
      const newItems = structuredClone(prev);
      newItems[index][field] = value;
      return newItems;
    });

    // Trigger API call only for barcode, styleId, or sizeId
    if (["barcode", "styleId", "sizeId"].includes(field)) {
      const row = structuredClone(salesReturnItems[index]);
      row[field] = value; // use updated value
      // Only call API if at least barcode or (style+size) is filled
      if (row.barcode || (row.styleId && row.sizeId)) {
        try {
          const response = await triggerGetBarcodeDetail({
            params: {
              barcode: row.barcode,
              styleId: row.styleId,
              sizeId: row.sizeId,
            },
          }).unwrap();

          if (response?.data?.length > 0) {
            const item = response.data[0];
            setSalesReturnItems((prev) =>
              prev.map((r, i) =>
                i === index
                  ? {
                      ...r,
                      barcode: item.barCode,
                      styleId: item.styleId,
                      sizeId: item.sizeId,
                      stkQty: response.totalQty,
                      styleNo: item.styleNo,
                      fabricId: item.fabricId,
                    }
                  : r
              )
            );
          } else {
            setSalesReturnItems((prev) =>
              prev.map((r, i) =>
                i === index
                  ? {
                      styleId: "",
                      sizeId: "",
                      stkQty: "",
                      returnQty: "",
                      remarks: "",
                      styleNo: "",
                      fabricId: "",
                      styleItemId: "",
                      colorId: "",
                      selected: false,
                      qty: "",
                    }
                  : r
              )
            );
          }
        } catch (err) {
          console.error("Error fetching barcode details:", err);
        }
      }
    }
  };

  const fillRows = (rowsToFill) => {
    setSalesReturnItems((prev) => {
      const updated = [...prev];

      let startIndex = updated.findIndex(
        (row) =>
          !row.styleId &&
          !row.sizeId &&
          !row.styleNo &&
          !row.fabricId &&
          !row.barcode
      );
      if (startIndex === -1) startIndex = updated.length;

      rowsToFill.forEach((row, i) => {
        if (startIndex + i < updated.length) {
          updated[startIndex + i] = row;
        } else {
          updated.push(row);
        }
      });

      while (updated.length < 6) {
        updated.push({
          styleNo: "",
          fabricId: "",
          styleId: "",
          sizeId: "",
          qty: "",
          remarks: "",
          stkQty: "",
          barcode: "",
          styleItemId: "",
          colorId: "",
          selected: false,
        });
      }

      return updated;
    });
  };

  const handleAddRow = async () => {
    if (!validateData()) {
      toast.info("Please Choose Required Fields...!", {
        position: "top-center",
        autoClose: 2000,
      });
    } else {
      const isFirstTime = salesReturnItems.every(
        (row) => !row.sizeId && !row.styleId && !row.fabricId
      );
      if (!isFirstTime) {
        // const hasEmpty = salesReturnItems.some((row) => !row.returnQty);
        const hasEmpty = salesReturnItems.some((row) => {
          const hasStyle =
            row.styleNo !== "" &&
            row.styleNo !== null &&
            row.styleNo !== undefined;

          return hasStyle && !row.returnQty;
        });
        if (hasEmpty) {
          toast.info("Please fill all required fields...Before Adding!", {
            position: "top-center",
            autoClose: 2000,
          });
          return;
        }
      }
      try {
        const { data: styleData } = await getStyleDetail({
          params: {
            styleNo: styleNo,
            storeId,
            branchId,
            invNo: invNo,
          },
        });
        if (styleData.statusCode === 1) {
          toast.info(styleData.message, {
            position: "top-center",
            autoClose: 2000,
          });
          return;
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
    }
  };

  function imageFormatter(styleId) {
    const fileName = findFromList(styleId, styleList?.data, "img");
    if (!fileName) return "/no-image.png"; // fallback image if missing
    return `${IMAGE_UPLOAD_URL}${fileName}`;
  }

  const validateData = () => {
    if (storeId && invNo) {
      return true;
    }
    return false;
  };

  return (
    <>
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
                  uniqueColorIds.includes(item.id)
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
                (row) => row.colorId === colorId
              );
              fillRows(filtered);
              setShowColorPopup(false);
              setColorId("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const filtered = pendingStyleRows.filter(
                  (row) => row.colorId === colorId
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
      <div className="border border-slate-200 px-2 bg-white rounded-md shadow-sm max-h-[450px] overflow-auto">
        <div className="flex items-center gap-4 sticky top-0 bg-white z-30 mt-2">
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
          <h2 className="font-medium text-slate-700">Return Details</h2>
        </div>
        <div className={`w-full max-h-[300px] overflow-y-auto  my-1`}>
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 justify-center font-medium text-[13px]">
                  <tr className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        salesReturnItems.length > 0 &&
                        salesReturnItems.every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSalesReturnItems((prev) =>
                          prev.map((row) => ({ ...row, selected: checked }))
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
                  className={`w-12 px-2 py-2 text-center font-medium text-[13px]`}
                >
                  S.No
                </th>
                <th
                  className={`w-20 px-2 py-2 text-center font-medium text-[13px] `}
                >
                  Style No
                </th>
                <th
                  className={`w-60 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style
                </th>
                <th
                  className={`w-12 px-1 py-2 text-center  font-medium text-[13px]`}
                >
                  Img
                </th>{" "}
                <th
                  className={`w-48 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  Fabric
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
                  className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Sales Qty
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Return Qty
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
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                    <input
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "styleNo");
                        }
                      }}
                      type="string"
                      className="text-left rounded py-1 px-1 w-full table-data-input"
                      onFocus={(e) => e.target.select()}
                      value={row?.styleNo}
                      disabled={true}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "styleNo")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "styleNo");
                      }}
                    />
                  </td>
                  <td className="py-0.5 border border-gray-300 text-[11px] ">
                    <select
                      // disabled={readOnly || !!row.barcode}
                      disabled={true}
                      className="text-left w-full rounded py-1 table-data-input"
                      value={row.styleItemId}
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "styleItemId");
                        }
                      }}
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
                  <td className="py-0.5 border border-gray-300 text-[11px]">
                    <select
                      // disabled={readOnly || !!row.barcode}
                      disabled={true}
                      className="text-left w-full rounded py-1 table-data-input"
                      value={row.sizeId}
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "sizeId");
                        }
                      }}
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
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                    <input
                      type="number"
                      className="text-right rounded py-1 px-1 w-full table-data-input"
                      value={row?.qty}
                      disabled={true}
                      onKeyDown={(e) => {
                        if (e.code === "Minus" || e.code === "NumpadSubtract")
                          e.preventDefault();
                        if (e.key === "Delete") {
                          handleInputChange("", index, "qty");
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "qty")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "qty");
                      }}
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
                      className="text-right rounded py-1 px-1 w-full table-data-input"
                      onFocus={(e) => e.target.focus()}
                      value={row?.returnQty}
                      onChange={(e) =>
                        handleInputChange(e.target.value, index, "returnQty")
                      }
                      onBlur={(e) => {
                        handleInputChange(e.target.value, index, "returnQty");
                      }}
                      disabled={readOnly}
                      id={`qty-${index}`}
                    />
                  </td>
                  <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                    <input
                      onKeyDown={(e) => {
                        if (e.key === "Delete") {
                          handleInputChange("", index, "remarks");
                        }
                        if (e.key === "Enter") {
                          e.preventDefault(); // prevent form submit or line break
                          e.stopPropagation();
                          const nextSelect = document.querySelector(
                            `#qty-${index + 1}`
                          );
                          if (nextSelect) {
                            nextSelect.focus();
                            // Optional: visually show focus (since select.open() is not allowed)
                            setTimeout(
                              () => (nextSelect.style.outline = ""),
                              800
                            );
                          }
                        }
                      }}
                      disabled={readOnly}
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
                    />
                  </td>

                  <td className="w-2 border border-gray-300">
                    <input
                      // onContextMenu={(e) => {
                      //   if (!readOnly) {
                      //     handleRightClick(e, index, "notes");
                      //   }
                      // }}
                      disabled={readOnly}
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
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 h-7 font-medium text-gray-800">
                <td
                  className="text-right px-4 border border-gray-300 font-medium text-[13px] py-0.5"
                  colSpan={9}
                >
                  Total
                </td>
                {/* <td
                  className="text-right px-4 border border-gray-300 font-medium text-[13px] py-0.5"
                  colSpan={7}
                >
                  Total Qty
                </td> */}
                <td className="text-right border border-gray-300 px-1 font-medium text-[12px] py-0.5">
                  {salesReturnItems.reduce(
                    (sum, row) => sum + (Number(row.returnQty) || 0),
                    0
                  )}
                </td>
                {/* <td className="border border-gray-300"></td> */}
                {/* <td className="border border-gray-300"></td> */}
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

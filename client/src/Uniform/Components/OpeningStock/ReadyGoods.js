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

export default function ReadyGoods({
  openingStockItems,
  setOpeningStockItems,
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
    setOpeningStockItems((rows) => rows.filter((r) => !r.selected));
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
      setOpeningStockItems(
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
  }, [openingStockItems, setOpeningStockItems]);

  // const handleAddRow = async () => {
  //   try {
  //     const { data: styleData } = await getStyleCodeDetail({ params });
  //     const style = styleData?.data?.[0]; // since response has "0" key
  //     if (!style) return;
  //     const sizeTemplateId = style.sizeTemplateId;
  //     let sizeRows = [];
  //     if (sizeTemplateId) {
  //       const { data: sizeData } = await styleTemplateDetail(sizeTemplateId);

  //       if (sizeData?.SizeTemplateList?.length) {
  //         sizeRows = sizeData.SizeTemplateList.map((s) => ({
  //           styleNo: styleNo,
  //           fabricId: style.fabricId || "",
  //           styleId: style.id || "",
  //           sizeId: s.sizeId,
  //           qty: "",
  //           remarks: "",
  //         }));
  //       }
  //     }
  //     const totalRows = [
  //       ...sizeRows,
  //       ...Array.from({ length: Math.max(0, 6 - sizeRows.length) }, () => ({
  //         styleNo: "",
  //         fabricId: "",
  //         styleId: "",
  //         sizeId: "",
  //         qty: "",
  //         remarks: "",
  //       })),
  //     ];

  //     // 4. Update state
  //     setOpeningStockItems(totalRows);

  //     console.log("Opening Stock Items set:", totalRows);
  //   } catch (error) {
  //     console.error("Error adding row:", error);
  //   }
  // };
  const handleAddRow = async () => {
    const isFirstTime = openingStockItems.every((row) => !row.qty);

    if (!isFirstTime) {
      // const hasEmpty = openingStockItems.some((row) => !row.qty);
      const hasEmpty = openingStockItems.some((row) => {
        const hasStyle =
          row.styleNo !== "" &&
          row.styleNo !== null &&
          row.styleNo !== undefined;

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
      setOpeningStockItems((prev) => {
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
          {/* <button
            className="hover:bg-green-700 h-6 mt-3 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-xs"
            onClick={() => {
              handleAddRow();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddRow();
              }
            }}
          >
            <FaPlus /> Add
          </button> */}
        </div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
        </div>
        <div className={`w-full max-h-[300px]  overflow-y-auto  my-1`}>
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
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
                  className={`w-48 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Remarks
                </th>
                <th className="w-20 px-1 py-1 justify-center font-medium text-[13px]">
                  <tr className="flex items-center justify-center">Select</tr>
                  <tr className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        openingStockItems.length > 0 &&
                        openingStockItems.every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setOpeningStockItems((prev) =>
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
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "styleNo")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "styleNo");
                        }}
                        disabled={true}
                      />
                    </td>
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
                    <td className="border border-gray-300 py-0.5 text-center">
                      {row?.styleId ? (
                        // <img
                        //   style={{
                        //     height: "35px",
                        //     width: "35px",
                        //     objectFit: "cover",
                        //     borderRadius: "2px",
                        //     margin: "auto",
                        //     cursor: "pointer",
                        //   }}
                        //   src={imageFormatter(row?.styleId)}
                        //   onClick={() =>
                        //     setPreviewImage(imageFormatter(row?.styleId))
                        //   }
                        // />
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
                    <td className="py-0.5 border border-gray-300 text-[11px]">
                      <select
                        id={`qty-input-${index}`}
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "colorId");
                          }
                        }}
                        tabIndex={"0"}
                        disabled={readOnly}
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
                )
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
                  {openingStockItems.reduce(
                    (sum, row) => sum + (Number(row.qty) || 0),
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
              {/* <button
                className=" text-black text-[12px] text-left rounded px-1"
                onClick={() => {
                  handleDeleteAllRows();
                  handleCloseContextMenu();
                }}
              >
                Delete All
              </button> */}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

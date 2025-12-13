import { useEffect, useState } from "react";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import {
  useGetStyleMasterQuery,
  useLazyGetStyleMasterByIdQuery,
} from "../../../redux/uniformService/StyleMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import secureLocalStorage from "react-secure-storage";
import { IMAGE_UPLOAD_URL } from "../../../Constants";
import { findFromList, renameFile } from "../../../Utils/helper";
import { CLOSE_ICON, VIEW } from "../../../icons";
import { getImageUrlPath } from "../../../helper";
import { useGetPortionMasterQuery } from "../../../redux/uniformService/PortionMasterService";
import FxSelect from "../../../Inputs";
import Swal from "sweetalert2";

const FabricInwardItems = ({
  id,
  transType,
  fabricInwardItems,
  setFabricInwardItems,
  readOnly,
  params,
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [styleNo, setStyleNo] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({ params });
  const { data: portionList } = useGetPortionMasterQuery({ params });
  const [triggerGetStyle, { data: styleData }] =
    useLazyGetStyleMasterByIdQuery();
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  const addRow = () => {
    const newRow = {
      styleNo: "",
      fabricId: "",
      styleId: "",
      styleItemId: "",
      colorId: "",
      qty: "",
      fabWidth: "",
      fabMeter: "",
      noOfPcs: "",
      filePath: "",
      selected: false,
      portionId: "",
    };
    setFabricInwardItems([...fabricInwardItems, newRow]);
  };

  const handleInputChange = async (value, index, field) => {
    // clone first
    const newRows = structuredClone(fabricInwardItems);

    if (field === "styleId") {
      // 1️⃣ update immediately
      newRows[index].styleId = value;
      setFabricInwardItems([...newRows]); // 🔥 maintain UI instantly

      try {
        // 2️⃣ fetch style data
        const response = await triggerGetStyle(value).unwrap();

        // 3️⃣ update fabricId
        newRows[index].fabricId = response?.data?.fabricId;

        // 4️⃣ update again after API fetch
        setFabricInwardItems([...newRows]);
      } catch (e) {
        console.error("Style fetch failed", e);
      }

      return; // stop here
    }

    // normal fields
    newRows[index][field] = value;
    setFabricInwardItems([...newRows]);
  };
  const deleteRow = (id) => {
    setFabricInwardItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setFabricInwardItems((prevRows) => {
      if (prevRows.length <= 1) return prevRows;
      return [prevRows[0]];
    });
  };

  const handleRightClick = (event, rowIndex, type) => {
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
    if (fabricInwardItems) {
      setFabricInwardItems((prev) => {
        const filledRows = prev.length;

        if (filledRows < 4) {
          // add empty rows until total becomes 6
          return [
            ...prev,
            ...Array.from({ length: 4 - filledRows }, () => ({
              styleNo: "",
              fabricId: "",
              styleId: "",
              styleItemId: "",
              colorId: "",
              fabWidth: "",
              fabMeter: "",
              noOfPcs: "",
              filePath: "",
              selected: false,
              portionId: "",
            })),
          ];
        }
        return prev; // if already >= 6, just keep as it is
      });
    } else {
      setFabricInwardItems(
        Array.from({ length: 4 }, () => ({
          styleNo: "",
          fabricId: "",
          styleId: "",
          styleItemId: "",
          colorId: "",
          fabWidth: "",
          fabMeter: "",
          noOfPcs: "",
          filePath: "",
          selected: false,
          portionId: "",
        }))
      );
    }
  }, [fabricInwardItems, setFabricInwardItems]);

  const deleteSelectedRows = () => {
    setFabricInwardItems((rows) =>
      rows.filter((r) => !(r.selected && (r.stockQty ?? 0) === 0))
    );
    setContextMenu(null);
  };

  return (
    <>
      <div className="border border-slate-200 px-2 bg-white rounded-md shadow-sm max-h-[450px] overflow-auto  w-full">
        <div className="flex justify-between items-center my-2">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
        </div>
        <div
          className={`w-full min-h-[200px] max-h-[250px] overflow-y-auto  my-2`}
        >
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-1 py-1 justify-center font-medium text-[13px]">
                  {/* <tr className="flex items-center justify-center">Select</tr> */}
                  <tr className="flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        fabricInwardItems.length > 0 &&
                        fabricInwardItems
                          .filter((row) => (row.stockQty ?? 0) === 0)
                          .every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFabricInwardItems((prev) =>
                          prev.map((row) =>
                            (row.stockQty ?? 0) > 0
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
                  className={`w-20 px-2 py-2 text-center font-medium text-[13px]`}
                >
                  Style No
                </th>
                {/* <th
                  className={`w-48 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style
                </th> */}
                <th
                  className={`w-48 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  Fabric
                </th>
                <th
                  className={`w-52 px-4 py-2 text-center  font-medium text-[13px]`}
                >
                  Img
                </th>{" "}
                <th
                  className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Color
                </th>
                <th
                  className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Portion
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Width
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Meter
                </th>
                <th
                  className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  No of Rolls
                </th>
                <th
                  className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                ></th>
              </tr>
            </thead>
            <tbody>
              {(fabricInwardItems ? fabricInwardItems : [])?.map(
                (row, index) => (
                  <tr
                    className="border border-blue-gray-200 cursor-pointer "
                    key={index}
                  >
                    <td className="border-blue-gray-200 text-[11px]  border border-gray-300 py-0.5 text-right">
                      <input
                        type="checkbox"
                        checked={row.selected || false}
                        disabled={readOnly || (row.stockQty ?? 0) > 0}
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
                      {/* <select
                        id={`styleId-input-${index}`}
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "styleId");
                          }
                        }}
                        tabIndex={"0"}
                        disabled={readOnly}
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
                      </select> */}
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
                        readOnly={readOnly || (row.stockQty ?? 0) > 0}
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

                    {/* <td className="py-0.5 border border-gray-300 text-[11px] ">
                      <select
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "styleItemId");
                          }
                        }}
                        tabIndex={"0"}
                        disabled={readOnly}
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
                    </td> */}
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
                        readOnly={readOnly || (row.stockQty ?? 0) > 0}
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
                    <td className=" py-0.5 px-3 border border-gray-300 overflow-x-auto">
                      <div className="flex gap-x-4 flex items-center">
                        {!readOnly && !row.filePath && (
                          <input
                            title=" "
                            type="file"
                            className="text-left w-full rounded h-full text-xs"
                            onChange={(e) =>
                              // console.log(e.target.files[0],"filePath");
                              e.target.files[0]
                                ? handleInputChange(
                                    renameFile(e.target.files[0]),
                                    index,
                                    "filePath"
                                  )
                                : () => {}
                            }
                          />
                        )}
                        {row.filePath && (
                          <>
                            <span className="text-xs">
                              {row?.filePath?.name || row?.filePath}
                            </span>
                            <button
                              className="text-xs"
                              onClick={() => {
                                if (row.filePath instanceof File) {
                                  setPreviewImage(
                                    URL.createObjectURL(row.filePath)
                                  );
                                } else {
                                  setPreviewImage(
                                    getImageUrlPath(row.filePath)
                                  );
                                }
                              }}
                            >
                              {VIEW}
                            </button>
                            {!readOnly && (
                              <button
                                className="text-xs"
                                onClick={() => {
                                  handleInputChange("", index, "filePath");
                                  console.log("filePath", row.filePath);
                                }}
                              >
                                {CLOSE_ICON}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px] ">
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
                        readOnly={readOnly || (row.stockQty ?? 0) > 0}
                        placeholder=""
                        onBlur={() =>
                          handleInputChange(row.colorId, index, "colorId")
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "colorId");
                          }
                        }}
                      />
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px]">
                      <FxSelect
                        value={row.portionId}
                        onChange={(val) =>
                          handleInputChange(val, index, "portionId")
                        }
                        options={(portionList?.data || [])
                          .filter((item) => item.active)
                          .map((item) => ({
                            label: item.name,
                            value: item.id,
                          }))}
                        readOnly={readOnly || (row.stockQty ?? 0) > 0}
                        placeholder=""
                        onBlur={() =>
                          handleInputChange(row.portionId, index, "portionId")
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "portionId");
                          }
                        }}
                      />
                    </td>

                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "fabWidth");
                          }
                        }}
                        min={"0"}
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={row?.fabWidth}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "fabWidth")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "fabWidth");
                        }}
                        disabled={readOnly || (row.stockQty ?? 0) > 0}
                      />
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "fabMeter");
                          }
                        }}
                        min={"0"}
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={row?.fabMeter}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "fabMeter")
                        }
                        onBlur={(e) => {
                          const minQty = row.minQty || 0;
                          if (parseFloat(minQty) > parseFloat(e.target.value)) {
                            e.target.value = "";
                            Swal.fire({
                              icon: "warning",
                              title: "Invalid Meter",
                              text: `Inward Meter cannot be Less than Min Meter! - ${minQty}`,
                              confirmButtonText: "OK",
                            });
                            return;
                          }
                          handleInputChange(e.target.value, index, "fabMeter");
                        }}
                        disabled={readOnly}
                      />
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
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
                          if (e.key === "Delete") {
                            handleInputChange("", index, "noOfPcs");
                          }
                        }}
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={row?.noOfPcs}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "noOfPcs")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "noOfPcs");
                        }}
                        disabled={readOnly}
                      />
                    </td>

                    <td className="w-2 border border-gray-300">
                      <input
                        // onContextMenu={(e) => {
                        //   if (!readOnly) {
                        //     handleRightClick(e, index, "");
                        //   }
                        // }}
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
                  {fabricInwardItems.reduce(
                    (sum, row) => sum + (Number(row.fabMeter) || 0),
                    0
                  )}
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {fabricInwardItems.reduce(
                    (sum, row) => sum + (Number(row.noOfPcs) || 0),
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
              position: "fixed",
              top: `${contextMenu.mouseY - 20}px`,
              left: `${contextMenu.mouseX + 20}px`,
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
};

export default FabricInwardItems;

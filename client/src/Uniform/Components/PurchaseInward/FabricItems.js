import { useEffect, useState } from "react";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import secureLocalStorage from "react-secure-storage";
import { IMAGE_UPLOAD_URL } from "../../../Constants";
import { findFromList } from "../../../Utils/helper";

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
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });

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
    };
    setFabricInwardItems([...fabricInwardItems, newRow]);
  };

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(fabricInwardItems);
    newBlend[index][field] = value;
    setFabricInwardItems(newBlend);
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

        if (filledRows < 6) {
          // add empty rows until total becomes 6
          return [
            ...prev,
            ...Array.from({ length: 6 - filledRows }, () => ({
              styleNo: "",
              fabricId: "",
              styleId: "",
              styleItemId: "",
              colorId: "",
              fabWidth: "",
              fabMeter: "",
              noOfPcs: "",
            })),
          ];
        }
        return prev; // if already >= 6, just keep as it is
      });
    } else {
      setFabricInwardItems(
        Array.from({ length: 6 }, () => ({
          styleNo: "",
          fabricId: "",
          styleId: "",
          styleItemId: "",
          colorId: "",
          fabWidth: "",
          fabMeter: "",
          noOfPcs: "",
        }))
      );
    }
  }, [fabricInwardItems, setFabricInwardItems]);

  function imageFormatter(styleId) {
    const fileName = findFromList(styleId, styleList?.data, "img");
    if (!fileName) return "/no-image.png";
    return `${IMAGE_UPLOAD_URL}${fileName}`;
  }

  return (
    <>
      <div className="border border-slate-200 px-2 bg-white rounded-md shadow-sm max-h-[450px] overflow-auto  w-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">List Of Items</h2>
        </div>
        <div className={`w-full max-h-[300px] overflow-y-auto  my-1`}>
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
                </th>
                <th
                  className={`w-64 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style
                </th>
                <th
                  className={`w-64 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  Fabric
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center  font-medium text-[13px]`}
                >
                  Img
                </th>{" "}
                <th
                  className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Color
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
                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                      {index + 1}
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        id={`style-input-${index}`}
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
                        disabled={readOnly}
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
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                      <select
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "fabricId");
                          }
                        }}
                        tabIndex={"0"}
                        disabled={readOnly}
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
                    <td className="border border-gray-300 py-1 h-10">
                      {row?.styleId ? (
                        <img
                          style={{
                            height: "35px",
                            width: "35px",
                            objectFit: "cover",
                            borderRadius: "2px",
                            margin: "auto",
                            cursor: "pointer",
                          }}
                          src={imageFormatter(row?.styleId)}
                          onClick={() =>
                            setPreviewImage(imageFormatter(row?.styleId))
                          }
                        />
                      ) : (
                        <span className="text-xs pl-1 text-gray-500">No Image</span>
                      )}
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
                        disabled={readOnly}
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
                          handleInputChange(e.target.value, index, "fabMeter");
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
                              `#style-input-${index + 1}`
                            );
                            if (nextQtyInput) {
                              nextQtyInput.focus();
                            }
                          }
                          if (e.key === "Delete") {
                            handleInputChange("", index, "noOfPcs");
                          }
                        }}
                        type="string"
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
                )
              )}
            </tbody>
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
                  deleteRow(contextMenu.rowId);
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
};

export default FabricInwardItems;

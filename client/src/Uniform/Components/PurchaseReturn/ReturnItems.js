import { useEffect, useState } from "react";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetPortionMasterQuery } from "../../../redux/uniformService/PortionMasterService";
import secureLocalStorage from "react-secure-storage";
import { IMAGE_UPLOAD_URL } from "../../../Constants";
import { findFromList } from "../../../Utils/helper";
import { useGetAccessoryMasterQuery } from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetAccessoryGroupMasterQuery } from "../../../redux/uniformService/AccessoryGroupMasterServices";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices";
import Swal from "sweetalert2";
import { VIEW } from "../../../icons";
import { useGetPurchaseInwardEntryQuery } from "../../../redux/uniformService/PurchaseInwardEntry";

const ReturnItems = ({
  id,
  returnType,
  purchaseReturnItems,
  setPurchaseReturnItems,
  readOnly,
  params,
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [styleNo, setStyleNo] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: accessoryList } = useGetAccessoryMasterQuery({ params });
  const { data: accessoryGroupList } = useGetAccessoryGroupMasterQuery({
    params,
  });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({ params });
  const { data: portionList } = useGetPortionMasterQuery({ params });
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const { data: styleList } = useGetStyleMasterQuery({ params });
  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetPurchaseInwardEntryQuery({
    params,
  });
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
      accessoryId: "",
      accessoryGroupId: "",
      sizeId: "",
      uomId: "",
      qty: "",
      selected: false,
      returnFabMeter: "",
      returnQty: "",
      portionId: "",
    };
    setPurchaseReturnItems([...purchaseReturnItems, newRow]);
  };

  const handleInputChange = (value, index, field) => {
    if (field === "returnFabMeter") {
      const row = purchaseReturnItems[index];
      const balanceQty = row?.fabMeter || 0;

      if (parseFloat(balanceQty) < parseFloat(value)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Return Meter cannot be more than Stock Meter!",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    if (field === "returnQty") {
      const row = purchaseReturnItems[index];
      const balanceQty = row?.qty || 0;

      if (parseFloat(balanceQty) < parseFloat(value)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Return Qty cannot be more than Stock Qty!",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    const newBlend = structuredClone(purchaseReturnItems);
    newBlend[index][field] = value;
    setPurchaseReturnItems(newBlend);
  };

  const deleteRow = (id) => {
    setPurchaseReturnItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setPurchaseReturnItems((prevRows) => {
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
    if (purchaseReturnItems) {
      setPurchaseReturnItems((prev) => {
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
              qty: "",
              fabWidth: "",
              fabMeter: "",
              noOfPcs: "",
              accessoryId: "",
              accessoryGroupId: "",
              sizeId: "",
              uomId: "",
              qty: "",
              selected: false,
              returnFabMeter: "",
              returnQty: "",
              portionId: "",
            })),
          ];
        }
        return prev; // if already >= 6, just keep as it is
      });
    } else {
      setPurchaseReturnItems(
        Array.from({ length: 4 }, () => ({
          styleNo: "",
          fabricId: "",
          styleId: "",
          styleItemId: "",
          colorId: "",
          qty: "",
          fabWidth: "",
          fabMeter: "",
          noOfPcs: "",
          accessoryId: "",
          accessoryGroupId: "",
          sizeId: "",
          uomId: "",
          qty: "",
          selected: false,
          returnFabMeter: "",
          returnQty: "",
          portionId: "",
        }))
      );
    }
  }, [purchaseReturnItems, setPurchaseReturnItems]);

  const deleteSelectedRows = () => {
    setPurchaseReturnItems((rows) => rows.filter((r) => !r.selected));
    setContextMenu(null);
  };

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
                        purchaseReturnItems.length > 0 &&
                        purchaseReturnItems.every((row) => row.selected)
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPurchaseReturnItems((prev) =>
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
                {(returnType === "Fabric" || returnType === "Accessory") && (
                  <th
                    className={`w-12 px-4 py-2 text-center font-medium text-[13px]`}
                  >
                    S.No
                  </th>
                )}
                {returnType === "Fabric" && (
                  <th
                    className={`w-16 px-2 py-2 text-center font-medium text-[13px]`}
                  >
                    Style No
                  </th>
                )}
                {/* {returnType === "Fabric" && (
                  <th
                    className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Style
                  </th>
                )} */}
                {returnType === "Fabric" && (
                  <th
                    className={`w-44 px-4 py-2 text-center font-medium text-[13px]`}
                  >
                    Fabric
                  </th>
                )}
                {returnType === "Fabric" && (
                  <th
                    className={`w-10 px-2 py-2 text-center  font-medium text-[13px]`}
                  >
                    Img
                  </th>
                )}
                {returnType === "Accessory" && (
                  <th
                    className={`w-48 px-4 py-2 text-center font-medium text-[13px]`}
                  >
                    Accessory Name
                  </th>
                )}
                {returnType === "Accessory" && (
                  <th
                    className={`w-48 px-4 py-2 text-center font-medium text-[13px]`}
                  >
                    Accessory Group Name
                  </th>
                )}
                {(returnType === "Fabric" || returnType === "Accessory") && (
                  <th
                    className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Color
                  </th>
                )}
                {returnType === "Fabric" && (
                  <th
                    className={`w-14 px-1 py-2 text-center font-medium text-[13px] `}
                  >
                    Portion
                  </th>
                )}
                {returnType === "Fabric" && (
                  <th
                    className={`w-14 px-1 py-2 text-center font-medium text-[13px] `}
                  >
                    Width
                  </th>
                )}
                {returnType === "Fabric" && (
                  <th
                    className={`w-16 px-1 py-2 text-center font-medium text-[13px] `}
                  >
                    Stk Meter
                  </th>
                )}
                {returnType === "Fabric" && (
                  <th
                    className={`w-24 px-1 py-2 text-center font-medium text-[13px] `}
                  >
                    No of Rolls
                  </th>
                )}
                {returnType === "Fabric" && (
                  <th
                    className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                  >
                    Return Meter
                  </th>
                )}

                {returnType === "Accessory" && (
                  <th
                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Size
                  </th>
                )}
                {returnType === "Accessory" && (
                  <th
                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Uom
                  </th>
                )}
                {returnType === "Accessory" && (
                  <th
                    className={`w-16 px-1 py-2 text-center font-medium text-[13px] `}
                  >
                    Quantity
                  </th>
                )}
                {returnType === "Accessory" && (
                  <th
                    className={`w-16 px-1 py-2 text-center font-medium text-[13px] `}
                  >
                    Return Qty
                  </th>
                )}

                <th
                  className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                ></th>
              </tr>
            </thead>
            <tbody>
              {(purchaseReturnItems ? purchaseReturnItems : [])?.map(
                (row, index) => (
                  <tr
                    className="border border-blue-gray-200 cursor-pointer "
                    key={index}
                  >
                    {(returnType === "Fabric" ||
                      returnType === "Accessory") && (
                      <td className="border-blue-gray-200 text-[11px]  border border-gray-300 py-0.5 text-right">
                        <input
                          type="checkbox"
                          checked={row.selected || false}
                          disabled={readOnly}
                          onChange={(e) =>
                            handleInputChange(
                              e.target.checked,
                              index,
                              "selected"
                            )
                          }
                          className="justify-center flex items-center mx-auto w-full"
                          onContextMenu={(e) => {
                            if (!readOnly) {
                              handleRightClick(e, index, "notes");
                            }
                          }}
                        />
                      </td>
                    )}
                    {(returnType === "Fabric" ||
                      returnType === "Accessory") && (
                      <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                        {index + 1}
                      </td>
                    )}
                    {returnType === "Fabric" && (
                      <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                        {/* <input
                          id={`styleNo-input-${index}`}
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
                          disabled={id}
                        /> */}
                        <select
                          id={`styleId-input-${index}`}
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
                      </td>
                    )}
                    {/* {returnType === "Fabric" && (
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
                    )} */}
                    {returnType === "Fabric" && (
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
                            handleInputChange(
                              e.target.value,
                              index,
                              "fabricId"
                            );
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
                    )}
                    {returnType === "Fabric" && (
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
                    )}
                    {returnType === "Accessory" && (
                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <select
                          id={`accessory-input-${index}`}
                          onKeyDown={(e) => {
                            if (e.key === "Delete") {
                              handleInputChange("", index, "accessoryId");
                            }
                          }}
                          tabIndex={"0"}
                          disabled={true}
                          className="text-left w-full rounded py-1 table-data-input"
                          value={row.accessoryId}
                          onFocus={(e) => e.target.focus()}
                          onChange={(e) =>
                            handleInputChange(
                              e.target.value,
                              index,
                              "accessoryId"
                            )
                          }
                          onBlur={(e) => {
                            handleInputChange(
                              e.target.value,
                              index,
                              "accessoryId"
                            );
                          }}
                        >
                          <option></option>
                          {(id
                            ? accessoryList?.data
                            : accessoryList?.data?.filter((item) => item.active)
                          )?.map((blend) => (
                            <option value={blend.id} key={blend.id}>
                              {blend?.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {returnType === "Accessory" && (
                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <select
                          onKeyDown={(e) => {
                            if (e.key === "Delete") {
                              handleInputChange("", index, "accessoryGroupId");
                            }
                          }}
                          tabIndex={"0"}
                          disabled={true}
                          className="text-left w-full rounded py-1 table-data-input"
                          value={row.accessoryGroupId}
                          onChange={(e) =>
                            handleInputChange(
                              e.target.value,
                              index,
                              "accessoryGroupId"
                            )
                          }
                          onBlur={(e) => {
                            handleInputChange(
                              e.target.value,
                              index,
                              "accessoryGroupId"
                            );
                          }}
                        >
                          <option></option>
                          {(id
                            ? accessoryGroupList?.data
                            : accessoryGroupList?.data?.filter(
                                (item) => item.active
                              )
                          )?.map((blend) => (
                            <option value={blend.id} key={blend.id}>
                              {blend?.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {returnType === "Fabric" && (
                      <td className="py-0.5 border border-gray-300 text-[11px]">
                        <select
                          id={`qty-input-${index}`}
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
                    )}
                    {(returnType === "Fabric" ||
                      returnType === "Accessory") && (
                      <td className="py-0.5 border border-gray-300 text-[11px]">
                        <select
                          id={`qty-input-${index}`}
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
                            handleInputChange(
                              e.target.value,
                              index,
                              "portionId"
                            )
                          }
                          onBlur={(e) => {
                            handleInputChange(
                              e.target.value,
                              index,
                              "portionId"
                            );
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
                    )}
                    {returnType === "Fabric" && (
                      <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                        <input
                          onKeyDown={(e) => {
                            if (
                              e.code === "Minus" ||
                              e.code === "NumpadSubtract"
                            )
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
                            handleInputChange(
                              e.target.value,
                              index,
                              "fabWidth"
                            );
                          }}
                          disabled={true}
                        />
                      </td>
                    )}
                    {returnType === "Fabric" && (
                      <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                        <input
                          onKeyDown={(e) => {
                            if (
                              e.code === "Minus" ||
                              e.code === "NumpadSubtract"
                            )
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
                            handleInputChange(
                              e.target.value,
                              index,
                              "fabMeter"
                            );
                          }}
                          disabled={true}
                        />
                      </td>
                    )}
                    {returnType === "Fabric" && (
                      <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                        <input
                          id={`noOfPcs-input-${index}`}
                          onKeyDown={(e) => {
                            if (
                              e.code === "Minus" ||
                              e.code === "NumpadSubtract"
                            )
                              e.preventDefault();
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
                          readOnly={readOnly}
                          disabled={readOnly}
                        />
                      </td>
                    )}
                    {returnType === "Fabric" && (
                      <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                        <input
                          onKeyDown={(e) => {
                            if (
                              e.code === "Minus" ||
                              e.code === "NumpadSubtract"
                            )
                              e.preventDefault();
                            if (e.key === "Delete") {
                              handleInputChange("", index, "returnFabMeter");
                            }
                            if (e.key === "Enter") {
                              e.preventDefault(); // prevent form submit or line break
                              e.stopPropagation();
                              const nextQtyInput = document.querySelector(
                                `#noOfPcs-input-${index + 1}`
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
                          value={row?.returnFabMeter}
                          onChange={(e) =>
                            handleInputChange(
                              e.target.value,
                              index,
                              "returnFabMeter"
                            )
                          }
                          onBlur={(e) => {
                            handleInputChange(
                              e.target.value,
                              index,
                              "returnFabMeter"
                            );
                          }}
                          disabled={readOnly}
                          readOnly={readOnly}
                        />
                      </td>
                    )}
                    {returnType === "Accessory" && (
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
                    )}
                    {returnType === "Accessory" && (
                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <select
                          onKeyDown={(e) => {
                            if (e.key === "Delete") {
                              handleInputChange("", index, "uomId");
                            }
                          }}
                          tabIndex={"0"}
                          disabled={true}
                          className="text-left w-full rounded py-1 table-data-input"
                          value={row.uomId}
                          onChange={(e) =>
                            handleInputChange(e.target.value, index, "uomId")
                          }
                          onBlur={(e) => {
                            handleInputChange(e.target.value, index, "uomId");
                          }}
                        >
                          <option></option>
                          {(id
                            ? uomList?.data
                            : uomList?.data?.filter((item) => item.active)
                          )?.map((blend) => (
                            <option value={blend.id} key={blend.id}>
                              {blend?.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {returnType === "Accessory" && (
                      <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                        <input
                          onKeyDown={(e) => {
                            if (e.key === "Delete") {
                              handleInputChange("", index, "qty");
                            }
                          }}
                          type="string"
                          className="text-left rounded py-1 px-1 w-full table-data-input"
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
                    )}
                    {returnType === "Accessory" && (
                      <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                        <input
                          id={`returnQty-input-${index}`}
                          onKeyDown={(e) => {
                            if (
                              e.code === "Minus" ||
                              e.code === "NumpadSubtract"
                            )
                              e.preventDefault();
                            if (e.key === "Enter") {
                              e.preventDefault(); // prevent form submit or line break
                              e.stopPropagation();
                              const nextQtyInput = document.querySelector(
                                `#returnQty-input-${index + 1}`
                              );
                              if (nextQtyInput) {
                                nextQtyInput.focus();
                              }
                            }
                            if (e.key === "Delete") {
                              handleInputChange("", index, "returnQty");
                            }
                          }}
                          type="number"
                          className="text-right rounded py-1 px-1 w-full table-data-input"
                          onFocus={(e) => e.target.select()}
                          value={row?.returnQty}
                          onChange={(e) =>
                            handleInputChange(
                              e.target.value,
                              index,
                              "returnQty"
                            )
                          }
                          onBlur={(e) => {
                            handleInputChange(
                              e.target.value,
                              index,
                              "returnQty"
                            );
                          }}
                          disabled={readOnly}
                        />
                      </td>
                    )}

                    {(returnType === "Fabric" ||
                      returnType === "Accessory") && (
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
                    )}
                  </tr>
                )
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 h-7 font-medium text-gray-800">
                <td
                  className="text-right px-4 border border-gray-300 font-medium text-[13px] py-0.5"
                  colSpan={returnType === "Fabric" ? 10 : 8}
                >
                  Total
                </td>
                <td className="text-right border border-gray-300 px-1 font-medium text-[13px] py-0.5">
                  {returnType === "Fabric"
                    ? purchaseReturnItems.reduce(
                        (sum, row) => sum + (Number(row.returnFabMeter) || 0),
                        0
                      )
                    : purchaseReturnItems.reduce(
                        (sum, row) => sum + (Number(row.returnQty) || 0),
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

export default ReturnItems;

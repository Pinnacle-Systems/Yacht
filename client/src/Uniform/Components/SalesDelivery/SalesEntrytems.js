import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useEffect, useState } from "react";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useLazyGetBarcodeDetailQuery } from "../../../redux/uniformService/StockAdjustmentService";
import Swal from "sweetalert2";
import { ReusableInput } from "../../../Utils/CommonInput";
import { FaPlus } from "react-icons/fa";
import { useLazyGetStyleDetailQuery } from "../../../redux/services/StockService";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { findFromList } from "../../../Utils/helper";
import { IMAGE_UPLOAD_URL } from "../../../Constants";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { toast } from "react-toastify";
import Modal from "../../../UiComponents/Modal";
import TaxDetailsFullTemplate from "../TaxDetailsCompleteTemplate";
import { VIEW } from "../../../icons";

export default function BillItems({
  salesEntryItems,
  setSalesEntryItems,
  params,
  readOnly,
  id,
  storeId,
  branchId,
  taxTemplateId,
}) {
  const [styleNo, setStyleNo] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [getStyleDetail] = useLazyGetStyleDetailQuery();
  const [focusedRowIndex, setFocusedRowIndex] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");

  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });

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
      qty: "",
      remarks: "",
      styleNo: "",
      fabricId: "",
      price: "",
      taxPercent: "",
      discountType: "",
      discountValue: "",
      amount: "",
      styleItemId: "",
    };
    setSalesEntryItems([...salesEntryItems, newRow]);
  };

  const deleteRow = (id) => {
    setSalesEntryItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== Number(id));
      }
      return currentRows;
    });
  };

  const handleDeleteAllRows = () => {
    setSalesEntryItems((prevRows) => {
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
    if (salesEntryItems) {
      setSalesEntryItems((prev) => {
        const count = prev.length;

        if (count < 5) {
          return [
            ...prev,
            ...Array.from({ length: 5 - count }, () => ({
              barcode: "",
              styleId: "",
              sizeId: "",
              stkQty: "",
              qty: "",
              remarks: "",
              styleNo: "",
              fabricId: "",
              price: "",
              taxPercent: "",
              discountType: "",
              discountValue: "",
              amount: "",
              styleItemId: "",
            })),
          ];
        }

        return prev; // keep as-is if already >= 6
      });
    } else {
      setSalesEntryItems(
        Array.from({ length: 5 }, () => ({
          barcode: "",
          styleId: "",
          sizeId: "",
          stkQty: "",
          qty: "",
          remarks: "",
          styleNo: "",
          fabricId: "",
          price: "",
          taxPercent: "",
          discountType: "",
          discountValue: "",
          amount: "",
          styleItemId: "",
        }))
      );
    }
  }, [salesEntryItems, setSalesEntryItems]);

  const handleInputChange = async (value, index, field) => {
    if (field === "qty") {
      const row = salesEntryItems[index];
      const balanceQty = row?.stkQty || 0;

      if (parseFloat(balanceQty) < parseFloat(value)) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Sales Qty cannot be more than Stock Qty!",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    setSalesEntryItems((prev) => {
      const newItems = structuredClone(prev);
      newItems[index][field] = value;
      // if (["qty", "price", "discountValue"].includes(field)) {
      //   const qty = parseFloat(newItems[index].qty) || 0;
      //   const price = parseFloat(newItems[index].price) || 0;
      //   const discountValue = parseFloat(newItems[index].discountValue) || 0;

      //   const grossAmount = qty * price;
      //   const netAmount = grossAmount - discountValue;

      //   newItems[index].amount = netAmount.toFixed(2);
      // }
      return newItems;
    });
  };

  const calculateNetAmount = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    const taxPercent = parseFloat(item.taxPercent) || 0;
    const discountValue = parseFloat(item.discountValue) || 0;
    const discountType = item.discountType || "";

    // Gross amount
    const grossAmount = qty * price;

    // GST Subtracted
    const amountAfterGST = grossAmount - (grossAmount * taxPercent) / 100;

    // Apply Discount
    let discountAmt = 0;
    if (discountType === "Flat") discountAmt = discountValue;
    else if (discountType === "Percent")
      discountAmt = (amountAfterGST * discountValue) / 100;

    // Final net amount
    const netAmount = amountAfterGST - discountAmt;

    return netAmount.toFixed(2);
  };

  const validateData = () => {
    if (storeId) {
      return true;
    }
    return false;
  };

  const handleAddRow = async () => {
    if (!validateData()) {
      toast.info("Please Choose Store...!", {
        position: "top-center",
      });
    } else {
      try {
        const { data: styleData } = await getStyleDetail({
          params: {
            styleNo: styleNo,
            storeId,
            branchId,
          },
        });
        const styleRows = styleData?.data;
        if (!styleRows) return;

        setSalesEntryItems((prev) => {
          const updated = [...prev];
          // Find first empty slot index
          let startIndex = updated.findIndex(
            (row) =>
              !row.styleId &&
              !row.sizeId &&
              !row.styleNo &&
              !row.fabricId &&
              !row.barcode
          );
          if (startIndex === -1) startIndex = updated.length;

          // Fill in sizeRows starting at first empty slot
          styleRows.forEach((row, i) => {
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
              stkQty: "",
              barcode: "",
              price: "",
              taxPercent: "",
              discountType: "",
              discountValue: "",
              styleItemId: "",
            });
          }

          return updated;
        });
      } catch (error) {
        console.error("Error adding row:", error);
      }
    }
  };

  // const handleInputChange = async (value, index, field) => {
  //   if (field === "qty") {
  //     const row = salesEntryItems[index];
  //     const balanceQty = row?.stkQty || 0;

  //     if (parseFloat(balanceQty) < parseFloat(value)) {
  //       Swal.fire({
  //         icon: "warning",
  //         title: "Invalid Quantity",
  //         text: "Sales Qty cannot be more than Stock Qty!",
  //         confirmButtonText: "OK",
  //       });
  //       return;
  //     }
  //   }

  //   setSalesEntryItems((prev) => {
  //     const newItems = structuredClone(prev);
  //     newItems[index][field] = value;
  //     return newItems;
  //   });

  //   // Only trigger API if search field changes
  //   if (field === "barcode") {
  //     const row = structuredClone(salesEntryItems[index]);
  //     row.barcode = value;

  //     if (row.search) {
  //       try {
  //         const response = await triggerGetBarcodeDetail({
  //           params: { search: row.search }, // 👈 only one param now
  //         }).unwrap();

  //         if (response?.data?.length > 0) {
  //           const item = response.data[0];
  //           setSalesEntryItems((prev) =>
  //             prev.map((r, i) =>
  //               i === index
  //                 ? {
  //                     ...r,
  //                     barcode: item.barCode,
  //                     styleId: item.styleId,
  //                     sizeId: item.sizeId,
  //                     stkQty: response.totalQty,
  //                   }
  //                 : r
  //             )
  //           );
  //         } else {
  //           setSalesEntryItems((prev) =>
  //             prev.map((r, i) =>
  //               i === index
  //                 ? {
  //                     search: "",
  //                     qty: "",
  //                     remarks: "",
  //                     stkQty: "",
  //                   }
  //                 : r
  //             )
  //           );
  //         }
  //       } catch (err) {
  //         console.error("Error fetching stock details:", err);
  //       }
  //     }
  //   }
  // };
  function imageFormatter(styleId) {
    const fileName = findFromList(styleId, styleList?.data, "img");
    if (!fileName) return "/no-image.png"; // fallback image if missing
    return `${IMAGE_UPLOAD_URL}${fileName}`;
  }

  return (
    <>
      <Modal
        isOpen={Number.isInteger(currentSelectedIndex)}
        onClose={() => setCurrentSelectedIndex("")}
      >
        <TaxDetailsFullTemplate
          readOnly={readOnly}
          setCurrentSelectedIndex={setCurrentSelectedIndex}
          taxTypeId={taxTemplateId}
          currentIndex={currentSelectedIndex}
          salesEntryItems={salesEntryItems}
          handleInputChange={handleInputChange}
        />
      </Modal>
      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[300px] overflow-auto">
        <div className="flex items-center gap-4">
          <ReusableInput
            label="Style / Barcode No"
            value={styleNo}
            setValue={setStyleNo}
            type={"text"}
            required={true}
            readOnly={readOnly}
          />
          <button
            className="hover:bg-green-700 h-6 mt-3 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-1 rounded-md flex items-center gap-2 text-xs"
            onClick={() => {
              handleAddRow();
            }}
          >
            <FaPlus /> Add
          </button>
        </div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-slate-700">Sales Item Details</h2>
        </div>
        <div className={`w-full   py-1`}>
          <table className="overflow-x-scroll border-collapse table-fixed">
            <thead className="bg-gray-200 text-gray-800">
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
                  className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Barcode No
                </th>
                <th
                  className={`w-56 px-4 py-2 text-center font-medium text-[13px] `}
                >
                  Style
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center  font-medium text-[13px]`}
                >
                  Img
                </th>{" "}
                <th
                  className={`w-44 px-4 py-2 text-center font-medium text-[13px]`}
                >
                  Fabric
                </th>
                <th
                  className={`w-20 px-4 py-2 text-center font-medium text-[13px] `}
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
                  Qty
                </th>
                <th
                  className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Price
                </th>
                <th
                  className={`w-20 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Tax %
                </th>
                <th
                  className={`w-28 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Disc Type
                </th>
                <th
                  className={`w-28 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Discount
                </th>
                <th
                  className={`w-28 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Gross Amt
                </th>
                <th
                  className={`w-28 px-1 py-2 text-center font-medium text-[13px] `}
                >
                  Net Amt
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
              {(salesEntryItems ? salesEntryItems : [])?.map((row, index) => (
                <>
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
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "barcode");
                          }
                        }}
                        type="string"
                        className="text-left rounded py-1 px-1 w-full table-data-input"
                        onFocus={(e) => e.target.select()}
                        value={row?.barcode}
                        disabled={true}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "barcode")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "barcode");
                        }}
                      />
                    </td>
                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                      <select
                        disabled={true}
                        className="text-left w-full rounded py-1 table-data-input"
                        value={row.styleItemId}
                        onKeyDown={(e) => {
                          if (e.key === "Delete") {
                            handleInputChange("", index, "styleItemId");
                          }
                        }}
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
                          // alt="style"
                          // onError={(e) => (e.target.src = "/no-image.png")} // fallback if not found
                          onMouseEnter={() =>
                            setPreviewImage(imageFormatter(row?.styleId))
                          }
                          onMouseLeave={() => setPreviewImage(null)}
                        />
                      ) : (
                        <></>
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
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        value={row?.stkQty}
                        disabled={true}
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "stkQty");
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "stkQty")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "stkQty");
                        }}
                      />
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        value={row?.qty}
                        disabled={readOnly}
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
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        value={
                          focusedRowIndex === index
                            ? row?.price ?? "" // show raw value while editing
                            : row?.price
                            ? Number(row.price).toFixed(2) // format nicely otherwise
                            : ""
                        }
                        disabled={readOnly}
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "price");
                          }
                        }}
                        onFocus={(e) => {
                          setFocusedRowIndex(index);
                          e.target.select();
                        }}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "price")
                        }
                        onBlur={(e) => {
                          handleInputChange(e.target.value, index, "price");
                          setFocusedRowIndex(null);
                        }}
                      />
                    </td>

                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        value={row?.taxPercent}
                        disabled={readOnly}
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "taxPercent");
                          }
                        }}
                        onFocus={(e) => {
                          setFocusedRowIndex(index);
                          e.target.select();
                        }}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "taxPercent")
                        }
                        onBlur={(e) => {
                          handleInputChange(
                            e.target.value,
                            index,
                            "taxPercent"
                          );
                          setFocusedRowIndex(null);
                        }}
                      />
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <select
                        className="text-left rounded py-1 px-1 w-full table-data-input"
                        value={row?.discountType || ""}
                        disabled={readOnly}
                        onFocus={() => setFocusedRowIndex(index)}
                        onBlur={() => setFocusedRowIndex(null)}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            index,
                            "discountType"
                          )
                        }
                      >
                        <option value="">Select</option>
                        <option value="Flat">Flat</option>
                        <option value="Percent">Percent</option>
                      </select>
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        value={row?.discountValue}
                        disabled={readOnly}
                        onKeyDown={(e) => {
                          if (e.code === "Minus" || e.code === "NumpadSubtract")
                            e.preventDefault();
                          if (e.key === "Delete") {
                            handleInputChange("", index, "discountValue");
                          }
                        }}
                        onFocus={(e) => {
                          setFocusedRowIndex(index);
                          e.target.select();
                        }}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            index,
                            "discountValue"
                          )
                        }
                        onBlur={(e) => {
                          handleInputChange(
                            e.target.value,
                            index,
                            "discountValue"
                          );
                          setFocusedRowIndex(null);
                        }}
                      />
                    </td>

                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        value={(
                          parseFloat(row.qty || 0) * parseFloat(row.price || 0)
                        ).toFixed(2)}
                        disabled={true}
                        onFocus={(e) => e.target.select()}
                      />
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        type="number"
                        className="text-right rounded py-1 px-1 w-full table-data-input"
                        value={calculateNetAmount(row)}
                        disabled={true}
                        onFocus={(e) => e.target.select()}
                      />
                    </td>
                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                      <input
                        onKeyDown={(e) => {
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
                        onContextMenu={(e) => {
                          if (!readOnly) {
                            handleRightClick(e, index, "notes");
                          }
                        }}
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
                  {contextMenu && (
                    <div
                      style={{
                        position: "fixed",
                        top: `${contextMenu.mouseY - 50}px`,
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
                </>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 h-7 font-medium text-gray-800">
                <td
                  className="text-right px-4 border border-gray-300 font-medium text-[13px] py-0.5"
                  colSpan={8}
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
                  {salesEntryItems.reduce(
                    (sum, row) => sum + (Number(row.qty) || 0),
                    0
                  )}
                </td>
                {/* <td className="border border-gray-300"></td> */}
                {/* <td className="border border-gray-300"></td> */}
                <td
                  className="text-right border border-gray-300 px-1 font-medium text-[12px] py-0.5"
                  colSpan={6}
                >
                  {salesEntryItems
                    .reduce(
                      (sum, row) => sum + parseFloat(calculateNetAmount(row)),
                      0
                    )
                    .toFixed(2)}
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
      </div>
    </>
  );
}

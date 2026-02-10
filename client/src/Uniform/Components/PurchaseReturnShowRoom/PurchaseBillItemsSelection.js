import React, { useCallback, useEffect, useState } from "react";
import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import { useGetPurBillItemsQuery } from "../../../redux/services/PurchaseBillService";

const PurchaseBillItemsSelection = ({
  purchaseReturnItems = [],
  setPurchaseReturnItems,
  tempItems,
  setTempItems,
  onClose,
  setFillGrid,
  branchId,
  supplierId,
  invNo,
}) => {
  const [localpurchaseReturnItems, setLocalpurchaseReturnItems] = useState([]);
  function addItem(id, obj) {
    setPurchaseReturnItems((prevItems) => {
      let newItems = structuredClone(prevItems);
      const index = newItems?.findIndex((v) => v?.styleItemId === "");

      if (index !== -1) {
        newItems[index] = obj;
      } else {
        newItems.push(obj);
      }

      return newItems;
    });
  }

  const EMPTY_ROW = {
    styleId: "",
    sizeId: "",
    stkQty: "",
    remarks: "",
    styleItemId: "",
    colorId: "",
    selected: false,
    barcodeNo: "",
    uomId: "",
    returnQty: "",
  };

  function removeItem(id) {
    setPurchaseReturnItems((prev) => {
      // 1️⃣ Remove the item
      let updated = prev.filter((item) => String(item.id) !== String(id));

      // 2️⃣ Ensure minimum 3 rows
      while (updated.length < 3) {
        updated.push({
          ...EMPTY_ROW,
        });
      }

      return updated;
    });
  }

  function handleChangee(id, obj) {
    if (isItemAddedd(id)) {
      removeItem(id);
    } else {
      addItem(id, obj);
    }
  }
  function isItemAddedd(id) {
    return (
      (purchaseReturnItems || [])?.findIndex(
        (item) => parseInt(item?.id) === parseInt(id),
      ) !== -1
    );
  }

  function handleSelectAllChange(value, purchaseReturnItems) {
    if (value) {
      purchaseReturnItems?.forEach((item) => addItem(item.id, item));
    } else {
      purchaseReturnItems?.forEach((item) => removeItem(item.id));
    }
  }

  function getSelectAll(purchaseReturnItems) {
    return purchaseReturnItems?.every((item) => isItemAddedd(item.id));
  }

  const {
    data: purBillItemsData,
    isLoading: isPurBillItemsLoading,
    isFetching: isPurBillItemsFetching,
  } = useGetPurBillItemsQuery({
    params: {
      branchId,
      supplierId,
      invNo,
      pagination: true,
    },
  });

  const syncFormWithDb = useCallback(
    (data) => {
      setTempItems(data);
    },
    [supplierId],
  );

  useEffect(() => {
    if (purBillItemsData?.data) {
      syncFormWithDb(purBillItemsData?.data);
    }
  }, [
    isPurBillItemsFetching,
    isPurBillItemsLoading,
    syncFormWithDb,
    purBillItemsData,
  ]);

  return (
    <div className="h-full flex flex-col bg-[#f1f1f0]">
      {/* HEADER */}
      <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3">
        <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
          Purchase Bill Items
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                   border border-green-600 flex items-center gap-1 text-xs"
        >
          Done
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-3">
        <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <div className="relative w-full max-h-[420px] overflow-y-auto py-1">
              <table className="w-full border-collapse table-fixed">
                <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1 w-10 border border-gray-300">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-medium mb-[2px]">
                          Select
                        </span>
                        <input
                          type="checkbox"
                          className="cursor-pointer"
                          onChange={(e) =>
                            handleSelectAllChange(
                              e.target.checked,
                              tempItems ? tempItems : [],
                            )
                          }
                          checked={getSelectAll(tempItems ? tempItems : [])}
                        />
                      </div>
                    </th>

                    <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">
                      S No
                    </th>

                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-28">
                      Bill No
                    </th>

                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-28">
                      Bill Date
                    </th>

                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-32">
                      Barcode
                    </th>

                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-56">
                      Style Item
                    </th>

                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-20">
                      Size
                    </th>

                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-24">
                      Color
                    </th>

                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-20 text-right">
                      Inward Qty
                    </th>

                    <th className="px-1 py-1.5 border border-gray-300 text-xs w-20 text-right">
                      Stock Qty
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tempItems?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-4 text-center text-gray-500"
                      >
                        No data found
                      </td>
                    </tr>
                  ) : (
                    tempItems.map((item, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        } border-b cursor-pointer hover:bg-gray-50`}
                        onClick={() => handleChangee(item?.id, item)}
                      >
                        <td className="text-center py-2 border border-gray-300">
                          <input
                                  type="checkbox"
                                  className="cursor-pointer"
                                  checked={isItemAddedd(item.id, item)}
                                  readOnly
                                />
                        </td>

                        <td className="text-center border border-gray-300 text-[11px]">
                          {index + 1}
                        </td>

                        <td className="border border-gray-300 text-[11px] px-2 py-1.5">
                          {item?.PurchaseBill?.docId}
                        </td>

                        <td className="border border-gray-300 text-[11px] px-2 py-1.5">
                          {getDateFromDateTimeToDisplay(
                            item?.PurchaseBill?.docDate,
                          )}
                        </td>

                        <td className="border border-gray-300 text-[11px] px-2 py-1.5">
                          {item?.barcodeNo}
                        </td>

                        <td className="border border-gray-300 text-[11px] px-2 py-1.5">
                          {item?.StyleItem?.name}
                        </td>

                        <td className="border border-gray-300 text-[11px] px-2 py-1.5">
                          {item?.Size?.name}
                        </td>

                        <td className="border border-gray-300 text-[11px] px-2 py-1.5">
                          {item?.Color?.name}
                        </td>

                        <td className="border border-gray-300 text-[11px] px-2 py-1.5 text-right">
                          {item?.qty}
                        </td>

                        <td className="border border-gray-300 text-[11px] px-2 py-1.5 text-right">
                          {item?.stkQty}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBillItemsSelection;

import React, { useEffect, useState } from "react";
import {
  getDateFromDateTimeToDisplay,
} from "../../../Utils/helper";
import { useGetPurBillItemsQuery } from "../../../redux/services/PurchaseBillService";

const PurchaseBillItemsSelection = ({
  purchaseReturnItems,
  setPurchaseReturnItems,
  setFillGrid,
  branchId,
  supplierId,
  invNo,
}) => {
  const [localpurchaseReturnItems, setLocalpurchaseReturnItems] = useState([]);
  const [searchDocId, setSearchDocId] = useState("");
  const [searchDocDate, setSearchDocDate] = useState("");
  const [searchSupplier, setSearchSupplier] = useState("");
  const [dataPerPage, setDataPerPage] = useState("10");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const searchFields = {
    searchDocId,
    searchDocDate,
    searchSupplier,
  };

  useEffect(() => {
    setCurrentPageNumber(1);
  }, [searchDocId, searchDocDate, searchSupplier]);

  const {
    data: purBillItemsData,
    isLoading: isPurBillItemsLoading,
    isFetching: isPurBillItemsFetching,
  } = useGetPurBillItemsQuery({
    params: {
      branchId,
      supplierId,
      invNo,
      ...searchFields,
      pagination: true,
      dataPerPage,
      pageNumber: currentPageNumber,
    },
  });
  const isRowEmpty = (row) =>
    !row.styleItemId && !row.uomId && !row.stkQty;

  const purBillItems = purBillItemsData?.data || [];

  function handleDone() {
    setPurchaseReturnItems((prev) => {
      let updated = [...prev];

      // 1️⃣ Find ALL empty rows first
      const emptyRowIndices = updated.reduce((indices, row, index) => {
        if (isRowEmpty(row)) {
          indices.push(index);
        }
        return indices;
      }, []);

      // 2️⃣ Fill empty rows with our items
      localpurchaseReturnItems.forEach((item, i) => {
        const newRow = {
          ...item,
          styleItemId: item.styleItemId ?? "",
          uomId: item.uomId ?? "",
          stkQty: item.stkQty ?? "",
          purchaseBillId: item.purchaseBillId ?? "",
        };

        // If we have an empty row at this position, use it
        if (i < emptyRowIndices.length) {
          updated[emptyRowIndices[i]] = newRow;
        }
        // Otherwise, append to the end
        else {
          updated.push(newRow);
        }
      });

      return updated;
    });

    setFillGrid(false);
  }

  function handleCancel() {
    setLocalpurchaseReturnItems([]);
    setFillGrid(false);
  }

  // if (!data?.data || isFetching || isLoading) return <Loader />

  function addItem(item) {
    setLocalpurchaseReturnItems((localpurchaseReturnItems) => {
      let newItems = structuredClone(localpurchaseReturnItems);
      newItems.push(item);
      // newItems = newItems?.map(j => { return { ...j, delQty: j.qty } })
      return newItems;
    });
  }

  function removeItem(removeItem) {
    setLocalpurchaseReturnItems((localpurchaseReturnItems) => {
      return localpurchaseReturnItems.filter(
        (item) =>
          !(
            removeItem.styleItemId === item.styleItemId &&
            removeItem.uomId === item.uomId &&
            removeItem.stkQty === item.stkQty
          ),
      );
    });
  }

  function isItemChecked(checkItem) {
    let item = localpurchaseReturnItems.find(
      (item) =>
        checkItem.styleItemId === item.styleItemId &&
        checkItem.uomId === item.uomId &&
        checkItem.stkQty === item.stkQty,
    );
    if (!item) return false;
    return true;
  }

  function handleCheckBoxChange(value, item) {
    if (value) {
      addItem(item);
    } else {
      removeItem(item);
    }
  }

  function handleSelectAllChange(value) {
    if (value) {
      (purBillItems ? purBillItems : []).forEach((item) => addItem(item));
    } else {
      (purBillItems ? purBillItems : []).forEach((item) => removeItem(item));
    }
  }

  function getSelectAll() {
    return (purBillItems ? purBillItems : []).every((item) =>
      isItemChecked(item),
    );
  }

  return (
    <div className="bg-black/30 backdrop-blur-sm flex items-center justify-center ">
      <div className="w-full bg-white  shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-2 flex justify-between items-center">
          <h2 className="text-sm font-semibold tracking-wide">
            Purchase Bill Items
          </h2>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-auto h-[450px]">
          <table className="w-full text-xs border border-gray-200">
            <thead className="bg-gray-200 text-gray-800">
              <tr>
                <th className="px-2 py-1 w-10 border border-gray-300">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-medium mb-[2px]">
                      Select
                    </span>
                    <input
                      type="checkbox"
                      className="cursor-pointer"
                      onChange={(e) => handleSelectAllChange(e.target.checked)}
                      checked={getSelectAll()}
                    />
                  </div>
                </th>
                <th className="border border-gray-300 px-2 py-1 text-center text-xs w-11">
                  S No
                </th>
                {/* <th className="px-4 py-1.5 border border-gray-300 text-center text-xs w-36">Po Type</th> */}
                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-32">
                  <label>Bill No</label>
                  {/* <input
                    type="text"
                    className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                    placeholder="Search"
                    onFocus={(e) => e.target.select()}
                    value={searchDocId}
                    onChange={(e) => {
                      setSearchDocId(e.target.value);
                    }}
                  /> */}
                </th>
                <th className="px-1 py-1.5 border border-gray-300 text-center text-xs w-32">
                  <label> Bill Date</label>
                  {/* <input
                    type="text"
                    className="text-black h-6 focus:outline-none border  border-gray-400 rounded-lg w-full"
                    placeholder="Search"
                    value={searchDocDate}
                    onChange={(e) => {
                      setSearchDocDate(e.target.value);
                    }}
                    onFocus={(e) => {
                      e.target.select();
                    }}
                  /> */}
                </th>
                <th className="px-1 py-1.5 border border-gray-300 text-xs text-gray-800  w-40">
                  <label>Barcode No</label>
                </th>
                <th className="px-1 py-1.5 border border-gray-300 text-xs text-gray-800  w-64">
                  <label>Style Item</label>
                </th>
                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-28">
                  <label>Size</label>
                </th>
                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-20">
                  <label>Color</label>
                </th>

                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-20">
                  <label>Inward Qty</label>
                </th>
                <th className="px-1 py-1.5 border border-gray-300 text-xs  w-20">
                  <label>Stock Qty</label>
                </th>
              </tr>
            </thead>

            <tbody>
              {purBillItems?.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                (purBillItems || []).map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b hover:bg-gray-50 cursor-pointer ${
                      isItemChecked(item) ? "bg-gray-50" : ""
                    }`}
                    onClick={() =>
                      handleCheckBoxChange(!isItemChecked(item), item)
                    }
                  >
                    <td className="text-center py-2 border border-gray-300">
                      <input
                        type="checkbox"
                        className="cursor-pointer"
                        checked={isItemChecked(item)}
                      />
                    </td>

                    <td className="text-center border border-gray-300">
                      {index + 1}
                    </td>
                    <td className=" border border-gray-300 text-[11px] py-1.5 px-2">
                      {item?.PurchaseBill?.docId}
                    </td>
                    <td className=" border border-gray-300 px-2 py-1 text-left text-xs">
                      {getDateFromDateTimeToDisplay(
                        item?.PurchaseBill?.docDate,
                      )}
                    </td>
                    <td className=" border border-gray-300 text-[11px]  py-1.5 px-2">
                      {item?.barcodeNo}
                    </td>
                    <td className=" border border-gray-300 text-[11px]  py-1.5 px-2">
                      {item?.StyleItem?.name}
                    </td>
                    <td className=" border border-gray-300 text-[11px]  py-1.5 px-2">
                      {item?.Size?.name}
                    </td>
                    <td className=" border border-gray-300 text-[11px]  py-1.5 px-2">
                      {item?.Color?.name}
                    </td>
                    <td className=" border border-gray-300 text-[11px] text-right  py-1.5 px-2">
                      {item?.qty}
                    </td>
                    <td className=" border border-gray-300 text-[11px] text-right  py-1.5 px-2">
                      {item?.stkQty}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end p-3 bg-gray-50">
          <button
            className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            onClick={handleDone}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBillItemsSelection;

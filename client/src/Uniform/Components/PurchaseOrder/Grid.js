import { findFromList } from "../../../Utils/helper";
import { toast } from "react-toastify";
import { toWords } from "number-to-words";
import { useEffect, useState } from "react";


const Grid = ({
  value,
  index,
  id,
  styledata,
  orderDetails,
  setOrderDetails,
  isOrderChange,
  readOnly,
}) => {
  
  

  // const subGrid = value?.orderDetailsSubGrid || value?.poSubGrid || [];

  
  
   const gridToShow = value?.poSubGrid ? value?.poSubGrid : value?.orderDetailsSubGrid;

  const grandTotal = gridToShow.reduce((acc, subItem) => {
    const price =
      parseFloat(subItem?.priceFob || 0) + parseFloat(subItem?.surCharges || 0);
    const qty = parseFloat(subItem?.quantity || 0);
    return acc + price * qty;
  }, 0);
  const grandTotalFixed = grandTotal.toFixed(2); 
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const amountInWords = capitalize(toWords(Math.floor(grandTotal))) + " Dollars only";

  function deleteRow(rowIndex, subRowIndex) {
    if (readOnly) return toast.error("Turn on Edit Mode...");

    setOrderDetails((prev) => {
      const updated = structuredClone(prev);

      if (id) {
        updated[rowIndex]?.poSubGrid?.splice(subRowIndex, 1);

        if (!updated[rowIndex]?.poSubGrid?.length) {
          updated.splice(rowIndex, 1);
        }
      } else {
        updated[rowIndex]?.orderDetailsSubGrid?.splice(subRowIndex, 1);

        if (!updated[rowIndex]?.orderDetailsSubGrid?.length) {
          updated.splice(rowIndex, 1);
        }
      }

      return updated;
    });
  }


 

  return (
    <>
      <tr className="border border-blue-gray-200">
        <td className="border border-gray-300 text-[11px] text-center p-0.5">
          {index + 1}
        </td>
        <td
          colSpan={9}
          className="border border-gray-300 text-[11px] text-center p-0.5 "
        >
          <select className="text-left w-full rounded py-1 h-full">
            {<option>{value?.fabCode}</option>}
          </select>
        </td>
      </tr>
      {/* (id ? value?.poSubGrid : value?.orderDetailsSubGrid) */}
      {gridToShow?.map((item, subIndex) => (
        <tr key={subIndex}>
          <td
            colSpan={2}
            className="border border-gray-300 text-[12px] text-center p-0.5"
          >
            {item.fabType}
          </td>
          <td className="border border-gray-300 text-[12px] text-center p-0.5">
            {item?.fiberContent}
          </td>
          <td className="border border-gray-300 text-[12px] text-right p-0.5">
            {item?.weightGSM}
          </td>
          <td className="border border-gray-300 text-[12px] text-right p-0.5">
            {item?.widthFinished}
          </td>
          <td className="border border-gray-200 p-1 text-center text-xs">
            {item?.color?.name || "-"}
          </td>
          <td className="border border-gray-300 text-[12px] text-right p-0.5">
            $ {item?.priceFob}
          </td>
          <td className="border border-gray-300 text-[12px] text-right p-0.5">
            $ {item?.surCharges}
          </td>
          

          <td className="border border-gray-200 p-1 text-center text-xs">
            {item?.UnitOfMeasurement?.name || "-"}
          </td>
          <td className="border border-gray-200 p-1">
            <input
              className=" rounded px-1 ml-2 w-16 py-0.5 focus:outline-none text-xs text-right"
              value={item?.quantity?.toFixed(3)}
            />
          </td>
          <td className="border border-gray-200 p-1 text-right text-xs">
            $
            {(() => {
              const qty = parseFloat(item?.quantity || 0);
              const price =
                parseFloat(item?.priceFob || 0) +
                parseFloat(item?.surCharges || 0);
              const total = qty * price;
              return isNaN(total) ? "-" : total.toFixed(2);
            })()}
          </td>
          <td className="text-center border">
            <button
              type="button"
              title="Delete Row"
              onClick={() => {
                deleteRow(index, subIndex);
                console.log(index, subIndex, "index, subIndex");
              }}
              className="text-red-600 hover:text-red-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 inline-block"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </td>
        </tr>
      ))}

      <tr>
        <td
          colSpan={9}
          className="text-right font-semibold text-sm border border-gray-300 px-2 py-1"
        >
          Grand Total
        </td>
        <td className="text-right font-bold text-sm border border-gray-300 px-1 py-1"></td>
        <td   colSpan={2} className="text-center font-bold text-sm border border-gray-300 px-1 py-1">
          $ {grandTotalFixed}
        </td>

        {/* <td className="border border-gray-300"></td> */}
      </tr>
      <tr>
        <td
          colSpan={7}
          className="text-right font-semibold text-sm border border-gray-300 px-2 py-1"
        >
          Total Amount In Words :
        </td>
        <td colSpan={5} className="text-left font-semibold text-sm border border-gray-300 px-2 py-1">
          {amountInWords}
        </td>
      </tr>
    </>
  );
};

export default Grid;

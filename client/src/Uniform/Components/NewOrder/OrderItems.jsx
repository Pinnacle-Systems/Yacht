import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { getCommonParams } from "../../../Utils/helper";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../../../UiComponents/Modal";

import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { ReusableDropdown, ReusableInput } from "./CommonInput";
import { TiPlus } from "react-icons/ti";
import React from "react";
import SubGrid from "./SubGrid";

export default function OrderItems({
  readOnly,
  itemHeading,
  singleuomData,
  setOrderDetails,
  orderDetails,
  id,
  styleData,
  singleData,
  setStyleId,
  styleId,
  colorData,
  singleStyleData,
  index,
  item,
  uomData,
}) {
  const { branchId, userId, companyId, finYearId } = getCommonParams();
  const [tableDataView, setTableDataView] = useState(false);
  const [currentItem, setCurrentItem] = useState();
  const [currentIndex, setCurrentIndex] = useState("");
  const [gridEditableIndex, setGridEditableIndex] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const params = {
    branchId,
    userId,
    finYearId,
  };
  const { data: supplierList } = useGetPartyQuery({ params: { ...params } });

  function handleInputChange(value, index, field, subIndex) {
    console.log(value, " : value");

    setOrderDetails((orderDetails) => {
      const newPrev = structuredClone(orderDetails);

      let orderDetailsSubGrid = "orderDetailsSubGrid";

      if (field === "styleSheetId") {
        let item = styleData?.find((item) => item.id === parseInt(value));
        newPrev[index][field] = value;
        newPrev[index].fabCode = item?.fabCode || "";
        if (!Array.isArray(newPrev[index].orderDetailsSubGrid)) {
          newPrev[index].orderDetailsSubGrid = [];
        }
        console.log("New prev: ", newPrev);

        newPrev[index].orderDetailsSubGrid = [
          {
            fabType: item?.fabType,
            fiberContent: item?.fiberContent,
            weightGSM: item?.weightGSM,
            widthFinished: item?.widthFinished,
            // priceFob: item?.priceFob,
            priceFob: 0,
            surCharges: 0,
            colorId: null,
            uomId: null,
            quantity: 0,
          },
        ];
      }
      console.log(
        newPrev[index].orderDetailsSubGrid,
        "newPrev[index][orderDetailsSubGrid]"
      );

      // if (field === "color" || field === "qty") {
      //     newPrev[index][orderDetailsSubGrid][subIndex][field] = value
      // }
      if (field === "quantity") {
        const parsedQty = parseFloat(value);
        newPrev[index][orderDetailsSubGrid][subIndex][field] = isNaN(parsedQty)
          ? 0
          : parsedQty;
      } else if (field === "priceFob") {
        const parsedQty = parseFloat(value);
        newPrev[index][orderDetailsSubGrid][subIndex][field] = isNaN(parsedQty)
          ? 0
          : parsedQty;
      } else if (field === "surCharges") {
        const parsedQty = parseFloat(value);
        newPrev[index][orderDetailsSubGrid][subIndex][field] = isNaN(parsedQty)
          ? 0
          : parsedQty;
      } else if (field === "colorId") {
        newPrev[index][orderDetailsSubGrid][subIndex][field] = value;
      } else if (field === "uomId") {
        newPrev[index][orderDetailsSubGrid][subIndex][field] = value;
      }

      return newPrev;
    });
  }
  function deleteSubRow(rowIndex, subRowIndex) {
    if (readOnly) return toast.error("Turn on Edit Mode...");

    setOrderDetails((prev) => {
      // const updated = [...prev];
      const updated = structuredClone(prev);
      updated[rowIndex].orderDetailsSubGrid.splice(subRowIndex, 1);

      if (updated[rowIndex].orderDetailsSubGrid.length === 0) {
        updated.splice(rowIndex, 1);
      }

      return updated;
    });
    console.log("orderDetails saved", orderDetails);
  }

  

  function deleteRow(index) {
    if (readOnly) return toast.info("Turn on Edit Mode...!!!");
    setOrderDetails((prev) => prev.filter((_, i) => i !== index));
  }

  function handleEdit(index) {
    setGridEditableIndex(index);
  }

  function handleView(index) {
    setCurrentIndex(index);
    setTableDataView(true);
  }

  function addRowBelow(index) {
    if (readOnly) return toast.error("Turn on Edit Mode...");

    setOrderDetails((prev) => {
      const current = prev[index];
      const newRow = {
        ...current,
        color: "",
        quantity: "",
        isClone: true,
      };
      const updated = [...prev];
      updated.splice(index + 1, 0, newRow);
      return updated;
    });
  }

  return (
    <>
      <tr className="border border-blue-gray-200 ">
        <td className="border border-gray-300 text-[11px] text-center p-0.5">
          {index + 1}
        </td>
        <td
          colSpan={9}
          className="border border-gray-300 text-[11px] text-center p-0.5 "
        >
          <select
            disabled={readOnly}
            onKeyDown={(e) => {
              if (e.key === "Delete") {
                handleInputChange("", index, "styleSheetId", item);
              }
            }}
            className="text-left w-full rounded py-1 text-[12px] h-full"
            value={item?.styleSheetId || ""}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              handleInputChange(value, index, "styleSheetId");
            }}
          >
            <option value="" disabled hidden>
              Select Fab Code
            </option>
            {styleData?.map((style) => (
              <option value={style?.id} key={style.id}>
                {style.fabCode}
              </option>
            ))}
          </select>
        </td>
        <td>{/* <input type="text" className="w-1/2" /> */}</td>
        <td className="border border-gray-300 text-[11px] text-center p-0.5 flex items-center justify-center">
          {/* <span className="m-3 cursor-pointer" onClick={() => addRowBelow(index)}>
                                                    <TiPlus />
                                                </span> */}
          {item.fabCode ? (
            <span
              className="m-3 cursor-pointer"
              onClick={() => {
                setOrderDetails((prev) => {
                  const newPrev = structuredClone(prev);

                  const itemData =
                    newPrev[index]?.orderDetailsSubGrid?.[0] || {};

                  if (!Array.isArray(newPrev[index].orderDetailsSubGrid)) {
                    newPrev[index].orderDetailsSubGrid = [];
                  }

                  newPrev[index].orderDetailsSubGrid.push({
                    fabType: itemData?.fabType,
                    fiberContent: itemData?.fiberContent,
                    weightGSM: itemData?.weightGSM,
                    widthFinished: itemData?.widthFinished,
                    // priceFob: itemData?.priceFob,
                    priceFob: 0,
                    surCharges: 0,
                    colorId: null,
                    uomId: null,
                    quantity: 0,
                  });

                  return newPrev;
                });
              }}
            >
              <TiPlus className="text-green-600 hover:text-green-800" />
            </span>
          ) : (
            <span
              className="m-3 text-gray-400 cursor-not-allowed"
              title="Select Fab Code first"
            >
              <TiPlus />
            </span>
          )}
        </td>
      </tr>

      {item?.orderDetailsSubGrid?.map((value, valueIndex) => {
        return (
          <SubGrid
            key={valueIndex}
            item={value}
            valueIndex={valueIndex}
            orderDetails={orderDetails}
            setOrderDetails={setOrderDetails}
            // styleId={styleId}
            // setStyleId={setStyleId}
            readOnly={readOnly}
            styleData={styleData?.data || []}
            colorData={colorData}
            singleData={singleData}
            singleStyleData={singleStyleData}
            handleInputChange={handleInputChange}
            index={index}
            deleteSubRow={deleteSubRow}
            uomData={uomData}
            singleuomData={singleuomData}
          />
        );
      })}

      {/* ➕ Grand Total Row */}
      <tr>
        <td
          colSpan={9}
          className="text-right font-semibold text-sm border border-gray-300 px-2 py-1"
        >
          Grand Total
        </td>
        <td className="text-right font-bold text-sm border border-gray-300 px-1 py-1"></td>
        <td
          colSpan={2}
          className="text-center font-bold text-sm border border-gray-300 px-1 py-1"
        >
          ${" "}
          {(() => {
            const grandTotal = (item?.orderDetailsSubGrid || []).reduce(
              (acc, subItem) => {
                const price =
                  parseFloat(subItem?.priceFob || 0) +
                  parseFloat(subItem?.surCharges);
                const qty = parseFloat(subItem?.quantity || 0);
                return acc + price * qty;
              },
              0
            );
            return grandTotal.toFixed(2);
          })()}
        </td>
        {/* <td className="border border-gray-300"></td> */}
      </tr>
    </>
  );
}

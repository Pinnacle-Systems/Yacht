import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { getCommonParams } from "../../../Utils/helper";
import { useState } from "react";
import toast from "react-hot-toast";

import { TiPlus } from "react-icons/ti";
import React from "react";
import SubGrid from "./SubGrid";

export default function Grid({
  readOnly,

  sampleEntryGrid,
  setSampleEntryGrid,

  styleData,

  singleStyleData,
  index,
  item,
}) {
  const { branchId, userId, companyId, finYearId } = getCommonParams();

  const params = {
    branchId,
    userId,
    finYearId,
  };

  function handleInputChange(value, index, field, subIndex) {
    console.log(value, " : value");

    setSampleEntryGrid((sampleEntryGrid) => {
      const newPrev = structuredClone(sampleEntryGrid);

      let sampleEntrySubGrid = "sampleEntrySubGrid";

      if (field === "styleSheetId") {
        let item = styleData?.find((item) => item.id === parseInt(value));
        newPrev[index][field] = value;
        newPrev[index].fabCode = item?.fabCode || "";
        if (!Array.isArray(newPrev[index].sampleEntrySubGrid)) {
          newPrev[index].sampleEntrySubGrid = [];
        }
        console.log("New prev: ", newPrev);

        newPrev[index].sampleEntrySubGrid = [
          {
            fabType: item?.fabType,
            fiberContent: item?.fiberContent,
            weightGSM: item?.weightGSM,
            widthFinished: item?.widthFinished,

            smsMoq: item?.smsMoq,
            smsMcq: item?.smsMcq,

            smsLeadTime: item?.smsLeadTime,
            fabricImage: item?.fabricImage,
          },
        ];
      }
      console.log(
        newPrev[index].sampleEntrySubGrid,
        "newPrev[index][sampleEntrySubGrid]"
      );

      return newPrev;
    });
  }
  function deleteSubRow(rowIndex, subRowIndex) {
    if (readOnly) return toast.error("Turn on Edit Mode...");

    setSampleEntryGrid((prev) => {
      const updated = structuredClone(prev);
      updated[rowIndex].sampleEntrySubGrid.splice(subRowIndex, 1);

      if (updated[rowIndex].sampleEntrySubGrid.length === 0) {
        updated.splice(rowIndex, 1);
      }

      return updated;
    });
    console.log("orderDetails saved", sampleEntryGrid);
  }

  function deleteRow(index) {
    if (readOnly) return toast.info("Turn on Edit Mode...!!!");
    setSampleEntryGrid((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      <tr className="border border-blue-gray-200 ">
        <td className="border border-gray-300 text-[11px] text-center p-0.5">
          {index + 1}
        </td>
        <td className="border border-gray-300 text-[11px] text-center p-0.5 ">
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

        {item?.sampleEntrySubGrid?.map((value, valueIndex) => {
          return (
            <SubGrid
              key={valueIndex}
              item={value}
              valueIndex={valueIndex}
              sampleEntryGrid={sampleEntryGrid}
              setSampleEntryGrid={setSampleEntryGrid}
              // styleId={styleId}
              // setStyleId={setStyleId}
              readOnly={readOnly}
              styleData={styleData?.data || []}
              singleStyleData={singleStyleData}
              handleInputChange={handleInputChange}
              index={index}
              deleteSubRow={deleteSubRow}
              deleteRow={deleteRow}
            />
          );
        })}
      </tr>
    </>
  );
}

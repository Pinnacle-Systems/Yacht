import React, { useEffect, useState } from "react";

import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";
import { ReusableInput } from "./CommonInput";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import secureLocalStorage from "react-secure-storage";

const SubGrid = ({
  readOnly,
  item,
  handleInputChange,
  colorData,
  valueIndex,
  index,
  deleteSubRow,
  uomData,
  singleuomData,
}) => {
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");
  const [panelGridOpen, setPanelGridOpen] = useState(false);
  const [arrayName, setArrayName] = useState("");

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  const params = {
    companyId,
  };

  return (
    <>
      <tr>
        <td
          colSpan={2}
          className="border border-gray-300 text-[12px] text-center p-0.5"
        >
          {item?.fabType}
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
        <td className="border border-gray-200 p-1">
       
          <select
            className="rounded px-1 py-0.5 text-xs bg-white w-[140px] focus:outline-none"
            value={item?.colorId}
            disabled={readOnly}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              handleInputChange(value, index, "colorId", valueIndex);
            }}
          >
            <option value="">Select Color</option>
            {colorData?.map((val) => (
              <option key={val.id} value={String(val.id)}>
                {val.name}
              </option>
            ))}
          </select>
        </td>
        <td className="border border-gray-300  text-[12px] text-right p-0.5">
            <span className="text-xs">$</span>
          {/* $ {item?.priceFob} */}
           <input
            className=" rounded w-16 py-0.5  text-xs focus:outline-none text-right"
            type="number"
            step="0.01"
            min="0" 
             value= {item?.priceFob || ""}   
             
            disabled={readOnly}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              const val = e.target.value;

              handleInputChange(
                val === "" ? "" : val,
                index,
                "priceFob",
                valueIndex
              );
            }}
            onBlur={(e) => {
              const formatted =
                e.target.value === "" ? "" : Number(e.target.value).toFixed(2);
              e.target.value = formatted;
              handleInputChange(formatted, index, "priceFob", valueIndex);
            }}
            placeHolder="0.00"
          />
          
        </td>
         <td className="border  border-gray-300 text-[12px] text-right p-0.5">
          <span className="text-xs">$</span>
         <input
            className=" rounded w-12 py-0.5 text-xs focus:outline-none text-right"
            type="number"
            step="0.01"
            min="0" 
            $ value={item?.surCharges || ""}        
            disabled={readOnly}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              const val = e.target.value;

              handleInputChange(
                val === "" ? "" : val,
                index,
                "surCharges",
                valueIndex
              );
            }}
            onBlur={(e) => {
              const formatted =
                e.target.value === "" ? "" : Number(e.target.value).toFixed(2);
              e.target.value = formatted;
              handleInputChange(formatted, index, "surCharges", valueIndex);
            }}
            placeHolder="0.00"
          />
        </td>
        
        <td className="border border-gray-200 p-1">
          {/* <select
                        // className={`w-full border rounded px-1 py-0.5 text-xs bg-white 
                        //                          ${!item?.fabCode ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "cursor-pointer"}`}
                        className=' full rounded  px-1 py-0.5 text-xs bg-white w-20 focus:outline-none'
                        value={item?.uomName || ""}
                        // disabled={!item?.fabCode}
                        disabled={readOnly}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleInputChange(value, index, "uomName", valueIndex)
                        }}
                    >
                        <option value="">UOM</option>
                        {uomData?.data?.map(val => (
                            <option key={val.id} value={val.name}>
                                {val.name}
                            </option>
                        ))}
                    </select> */}
          <select
            className="rounded px-1 py-0.5 text-xs bg-white w-20 focus:outline-none"
            value={item?.uomId}
            disabled={readOnly}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              handleInputChange(value, index, "uomId", valueIndex);
            }}
          >
            <option value="">UOM</option>
            {uomData?.data?.map((val) => (
              <option key={val.id} value={String(val.id)}>
                {val.name}
              </option>
            ))}
          </select>
        </td>
        <td className="border  border-gray-200 p-1 ">
          <input
            className=" rounded px-1 ml-2 w-16 py-0.5 text-xs focus:outline-none text-right"
            type="number"
            step="0.01"
            min="0"
            value={item?.quantity || ""}
            // value={item?.quantity ? item.quantity.toFixed(3) : ""}

           

            
            disabled={readOnly}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
              const val = e.target.value;

              handleInputChange(
                val === "" ? "" : val,
                index,
                "quantity",
                valueIndex
              );
            }}
            onBlur={(e) => {
              const formatted =
                e.target.value === "" ? "" : Number(e.target.value).toFixed(3);
              e.target.value = formatted;
              handleInputChange(formatted, index, "quantity", valueIndex);
            }}
            placeHolder="0.00"
          />
        </td>

        <td className="border border-gray-200 p-1  text-xs text-right">
        $  {(() => {
            const qty = parseFloat(item?.quantity || 0) ;
            const price = parseFloat(item?.priceFob || 0) + parseFloat(item?.surCharges || 0);
            const total = qty * price;
            return isNaN(total) ? "-" : total.toFixed(2);
          })()}
        </td>

        <td className="text-center border">
          <button
            type="button"
            title="Delete Row"
            onClick={() => deleteSubRow(index, valueIndex)}
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
    </>
  );
};

export default SubGrid;

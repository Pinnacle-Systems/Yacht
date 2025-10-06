import StockReport from "./StockReport";
import ParameterButton from "../../../ReusableComponents/ParameterButton";
import { REFRESH_ICON } from "../../../icons";
import { useState } from "react";

export default function Form() {
  const [parameter, setParameter] = useState(false);

  return (
    <div className="p-1 bg-[#F1F1F0] h-[85%]">
      <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800"> Stock Report</h1>
        </div>
        <div className="flex gap-x-5">
          <ParameterButton onClick={() => setParameter(true)} />
          <button className="flex gap-2 items-center mr-2">
            Refresh {REFRESH_ICON}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden  ">
        <StockReport
          itemsPerPage={10}
          parameter={parameter}
          setParameter={setParameter}
        />
      </div>
    </div>
  );
}

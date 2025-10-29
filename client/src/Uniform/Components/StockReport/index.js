import StockReport from "./StockReport";
import ParameterButton from "../../../ReusableComponents/ParameterButton";
import { REFRESH_ICON } from "../../../icons";
import { useRef, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import Modal from "../../../UiComponents/Modal";
import PDF from "./PrintFormat/PDF";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import secureLocalStorage from "react-secure-storage";

export default function Form() {
  const [parameter, setParameter] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [allData, setAllData] = useState(null);

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  );
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const params = {
    branchId,
    companyId,
  };
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const stockReportRef = useRef();
  return (
    <div className="p-1 bg-[#F1F1F0] h-[85%]">
      <Modal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PDF
            allData={allData?.data}
            sizeList={sizeList?.data}
            fabricList={fabricList?.data}
            styleItemList={styleItemList?.data}
          />
        </PDFViewer>
      </Modal>
      <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800"> Stock Report</h1>
        </div>
        <div className="flex gap-x-5">
          <button
            className="bg-slate-600 text-white px-3 h-6 mt-1 rounded-md hover:bg-slate-700 flex items-center text-xs"
            // disabled={!id}
            onClick={() => {
              setPdfOpen(true);
              console.log("allData", allData);
            }}
          >
            <FiPrinter className="w-4 h-4 mr-2" />
            Print
          </button>
          <ParameterButton onClick={() => setParameter(true)} />
          <button
            className="flex gap-2 items-center mr-2"
            onClick={() => stockReportRef.current?.refetch()}
          >
            Refresh {REFRESH_ICON}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden  ">
        <StockReport
          ref={stockReportRef}
          itemsPerPage={10}
          parameter={parameter}
          setParameter={setParameter}
          onDataLoaded={setAllData}
        />
      </div>
    </div>
  );
}

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
import ExcelJS from "exceljs";
import {
  findFromList,
  getDateFromDateTimeToDisplay,
} from "../../../Utils/helper";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import SummaryReport from "./SummaryReport";
import { formatCamelCase } from "../../../Utils/helper";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";

export default function Form() {
  const [parameter, setParameter] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [allData, setAllData] = useState(null);

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId",
  );
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId",
  );
  const params = {
    branchId,
    companyId,
  };
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const stockReportRef = useRef();
  const { data: singleDataBranch } = useGetBranchByIdQuery(branchId);

  const DownloadExcel = async (allData) => {
    const dataArray = allData?.data || [];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Stock Report");

    // Title
    sheet.mergeCells("A1:I1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Stock Report";
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Header row
    const headerRow = [
      "S.No",
      "Date",
      "Style No",
      "Style Name",
      "Fabric Name",
      "Colour",
      "Size",
      "Process",
      "Qty",
    ];
    sheet.addRow(headerRow);

    // Header styling
    sheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEFEFEF" },
      };
    });

    // Data rows
    dataArray.forEach((item, index) => {
      sheet.addRow([
        index + 1,
        getDateFromDateTimeToDisplay(item.createdAt),
        item?.styleNo || "",
        findFromList(item?.styleItemId, styleItemList?.data, "name") || "",
        findFromList(item?.fabricId, fabricList?.data, "name") || "",
        findFromList(item?.colorId, colorList?.data, "name") || "",
        findFromList(item?.sizeId, sizeList?.data, "name") || "",
        formatCamelCase(item?.inOrOut),
        item?.qty || 0,
      ]);
    });

    // Add total row
    const totalQty = dataArray.reduce(
      (sum, item) => sum + (Number(item?.qty) || 0),
      0,
    );
    const totalRow = sheet.addRow([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Total",
      totalQty,
    ]);
    totalRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "right" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Adjust column widths
    sheet.columns = [
      { key: "sno", width: 8, alignment: { horizontal: "center" } },
      { key: "date", width: 15 },
      { key: "styleNo", width: 15 },
      { key: "styleName", width: 25 },
      { key: "fabricName", width: 25 },
      { key: "color", width: 18 },
      { key: "size", width: 12 },
      { key: "process", width: 25 },
      { key: "qty", width: 10 },
    ];
    sheet.getColumn(1).eachCell((cell) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Borders & alignment for all rows
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = {
          horizontal: cell.alignment?.horizontal || "left",
          vertical: "middle",
          wrapText: true,
        };
      });
    });

    // Export workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "StockSummary.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-1 bg-[#F1F1F0] h-[85%]">
      <Modal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PDF
            allData={allData || []}
            sizeList={sizeList}
            fabricList={fabricList}
            styleItemList={styleItemList}
            colorList={colorList}
            singleDataBranch={singleDataBranch}
          />
        </PDFViewer>
      </Modal>
      <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Stock Summary Report
          </h1>
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
          <button
            className="bg-green-700 text-white px-3 h-6 mt-1 rounded-md hover:bg-green-800 flex items-center text-sm"
            onClick={() => DownloadExcel(allData)}
          >
            <FiPrinter className="w-4 h-4 mr-2" />
            Excel
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
        <SummaryReport
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

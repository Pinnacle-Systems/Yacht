import StockReport from "./StockReport";
import ParameterButton from "../../../ReusableComponents/ParameterButton";
import { useRef, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import Modal from "../../../UiComponents/Modal";
import PDF from "./PrintFormat/PDF";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import secureLocalStorage from "react-secure-storage";
import ExcelJS from "exceljs";
import { findFromList } from "../../../Utils/helper";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";

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
  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });

  const DownloadExcel = async (allData) => {
    const dataArray = allData?.data || [];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Stock Report");

    // Title
    sheet.mergeCells("A1:G1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Stock Report";
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Header row
    const headerRow = [
      "S.No",
      "Barcode",
      "Style No",
      "Style Name",
      "Colour Name",
      "Size",
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
        item?.barcodeNo || "",
        findFromList(item?.styleId, styleList?.data, "sku") || "",
        findFromList(item?.styleItemId, styleItemList?.data, "name") || "",
        findFromList(item?.colorId, colorList?.data, "name") || "",
        findFromList(item?.sizeId, sizeList?.data, "name") || "",

        item?.qty || 0,
      ]);
    });

    // Add total row
    const totalQty = dataArray.reduce(
      (sum, item) => sum + (Number(item?.qty) || 0),
      0,
    );
    const totalRow = sheet.addRow(["", "", "", "", "", "Total", totalQty]);
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
      { key: "sno", width: 8 },
      { key: "barcodeNo", width: 25 },
      { key: "styleNo", width: 15 },
      { key: "styleName", width: 25 },
      { key: "colourName", width: 25 },
      { key: "size", width: 12 },
      { key: "qty", width: 10 },
    ];

    // Borders & alignment for all rows
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", wrapText: true };
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
    a.download = "StockReport.xlsx";
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
            styleItemList={styleItemList}
            colorList={colorList}
            styleList={styleList}
          />
        </PDFViewer>
      </Modal>
      <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
             Stock Report
          </h1>
        </div>
        <div className="flex gap-x-5">
          <button
            className="bg-slate-600 text-white px-3 h-6 mt-1 rounded-md hover:bg-slate-700 flex items-center text-xs"
            // disabled={!id}
            onClick={() => {
              setPdfOpen(true);
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
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden  ">
        <StockReport
          itemsPerPage={10}
          parameter={parameter}
          setParameter={setParameter}
          onDataLoaded={setAllData}
          styleList={styleList}
          styleItemList={styleItemList}
          colorList={colorList}
          sizeList={sizeList}
        />
      </div>
    </div>
  );
}

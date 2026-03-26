import ParameterButton from "../../../ReusableComponents/ParameterButton";
import { REFRESH_ICON } from "../../../icons";
import { useRef, useState } from "react";
import { FiPrinter } from "react-icons/fi";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import Modal from "../../../UiComponents/Modal";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import secureLocalStorage from "react-secure-storage";
import ExcelJS from "exceljs";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import MaterialStockReport from "./MaterialStockReport";
import PDF from "./PrintFormat/PDF";
import { useGetPortionMasterQuery } from "../../../redux/uniformService/PortionMasterService";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { findFromList } from "../../../Utils/helper";
import { useGetAccessoryMasterQuery } from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetAccessoryGroupMasterQuery } from "../../../redux/uniformService/AccessoryGroupMasterServices";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";

export default function Form() {
  const [parameter, setParameter] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [allData, setAllData] = useState(null);
  const [stockType, setStockType] = useState("");

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
  const { data: portionList } = useGetPortionMasterQuery({ params });
  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: accessoryList } = useGetAccessoryMasterQuery({ params });
  const { data: accessoryGroupList } = useGetAccessoryGroupMasterQuery({
    params,
  });
  const { data: singleDataBranch } = useGetBranchByIdQuery(branchId, {
    skip: !branchId,
  });
  const stockReportRef = useRef();

  const DownloadExcel = async (allData, stockType) => {
    const dataArray = allData?.data || [];

    const isFabric = stockType === "Fabric";

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Material Stock Report");

    /* =========================
     TITLE
  ========================== */
    const lastColumn = isFabric ? "F" : "F";
    sheet.mergeCells(`A1:${lastColumn}1`);
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Material Stock Report";
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    /* =========================
     HEADERS
  ========================== */
    const fabricHeaders = [
      "S.No",
      "Style No",
      "Fabric Name",
      "Colour Name",
      "Portion Name",
      "Meter",
    ];

    const accessoryHeaders = [
      "S.No",
      "Accessory Name",
      "Accessory Group",
      "Colour Name",
      "Size",
      "Quantity",
    ];

    const headers = isFabric ? fabricHeaders : accessoryHeaders;
    sheet.addRow(headers);

    /* Header styling */
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

    /* =========================
     DATA ROWS
  ========================== */
    dataArray.forEach((item, index) => {
      if (isFabric) {
        sheet.addRow([
          index + 1,
          findFromList(item?.styleId, styleList?.data, "sku") || "",
          findFromList(item?.fabricId, fabricList?.data, "name") || "",
          findFromList(item?.colorId, colorList?.data, "name") || "",
          findFromList(item?.portionId, portionList?.data, "name") || "",
          item?.fabMeter || 0,
        ]);
      } else {
        sheet.addRow([
          index + 1,
          findFromList(item?.accessoryId, accessoryList?.data, "name") || "",
          findFromList(
            item?.accessoryGroupId,
            accessoryGroupList?.data,
            "name",
          ) || "",
          findFromList(item?.colorId, colorList?.data, "name") || "",
          findFromList(item?.sizeId, sizeList?.data, "name") || "",
          item?.stkQty || 0,
        ]);
      }
    });

    /* =========================
     TOTAL ROW
  ========================== */
    const totalValue = dataArray.reduce((sum, item) => {
      return (
        sum +
        (isFabric ? Number(item?.fabMeter) || 0 : Number(item?.stkQty) || 0)
      );
    }, 0);

    const totalRow = sheet.addRow(["", "", "", "", "Total", totalValue]);

    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "right" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    /* =========================
     COLUMN WIDTHS
  ========================== */
    sheet.columns = isFabric
      ? [
          { width: 8 },
          { width: 15 },
          { width: 25 },
          { width: 25 },
          { width: 25 },
          { width: 12 },
        ]
      : [
          { width: 8 },
          { width: 25 },
          { width: 30 },
          { width: 20 },
          { width: 15 },
          { width: 12 },
        ];

    /* =========================
     BORDERS & ALIGNMENT
  ========================== */
    sheet.eachRow((row) => {
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

    /* =========================
     EXPORT
  ========================== */
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MaterialStockReport_${stockType}.xlsx`;
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
            portionList={portionList}
            colorList={colorList}
            styleList={styleList}
            accessoryList={accessoryList}
            accessoryGroupList={accessoryGroupList}
            stockType={stockType}
            singleDataBranch={singleDataBranch}
          />
        </PDFViewer>
      </Modal>
      <div className="flex flex-col sm:flex-row justify-between bg-white py-1 px-1 items-start sm:items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Material Stock Report
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
            onClick={() => DownloadExcel(allData, stockType)}
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
        <MaterialStockReport
          ref={stockReportRef}
          itemsPerPage={10}
          parameter={parameter}
          setParameter={setParameter}
          onDataLoaded={setAllData}
          setStockType={setStockType}
        />
      </div>
    </div>
  );
}

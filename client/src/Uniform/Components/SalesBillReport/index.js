import { useGetSalesBillReportQuery } from "../../../redux/services/SalesBillService";
import { useState } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  getDateFromDateTimeToDisplay,
  getTimeFromDateTime,
} from "../../../Utils/helper";
import { Loader } from "../../../Basic/components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { FiPrinter } from "react-icons/fi";
import ExcelJS from "exceljs";
import { EMPTY_ICON } from "../../../icons";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import PDF from "./PDF";
import tw from "../../../Utils/tailwind-react-pdf";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";

export default function Form() {
  const today = new Date().toISOString().split("T")[0];
  const [dataPerPage, setDataPerPage] = useState(10);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [viewType, setViewType] = useState("Normal");
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId",
  );
  const finyearId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentFinYear",
  );
  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetSalesBillReportQuery({
    params: {
      branchId,
      pagination: true,
      dataPerPage,
      finyearId,
      pageNumber: currentPageNumber,
      fromDate,
      toDate,
    },
  });
  const {
    data: singleData,
  } = useGetBranchByIdQuery(branchId);

  const isLoadingIndicator = isLoading || isFetching;
  const allDataDetail = allData?.data || [];
  const totalPages = Math?.ceil(allData?.length / dataPerPage);
  const indexOfLastItem = currentPage * dataPerPage;
  const indexOfFirstItem = indexOfLastItem - dataPerPage;
  const currentItems = (allDataDetail || []).slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setCurrentPageNumber(newPage); // ensures API fetches that page
    }
  };
  const Pagination = () => {
    return (
      <div className="h-10 w-full flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200 ">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {(currentPage - 1) * dataPerPage + 1} to{" "}
          {Math.min(currentPage * dataPerPage, allData?.totalCount || 0)} of{" "}
          {allData?.totalCount || 0} entries
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-6">
            {/* Normal */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="viewType"
                value="Normal"
                checked={viewType === "Normal"}
                onChange={(e) => setViewType(e.target.value)}
                className="accent-blue-600"
              />
              <span className="font-medium">Normal View</span>
            </label>

            {/* Detail */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="viewType"
                value="Detail"
                checked={viewType === "Detail"}
                onChange={(e) => setViewType(e.target.value)}
                className="accent-blue-600"
              />
              <span className="font-medium">Detail View</span>
            </label>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaChevronLeft className="inline" />
            </button>

            {Array?.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNum
                      ? "bg-indigo-800 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-3 py-1">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-indigo-800 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaChevronRight className="inline" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DownloadExcel = async (allData) => {
    const dataArray = allData?.data || [];

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales Bill Report");

    /* =========================
     ROW 1 → TITLE
  ========================== */
    sheet.mergeCells("A1:H1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Sales Bill Report";
    titleCell.font = { bold: true, size: 15 };
    titleCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    sheet.getRow(1).height = 24;

    /* =========================
     ROW 2 → PARAMETERS
  ========================== */
    sheet.mergeCells("A2:H2");
    const paramCell = sheet.getCell("A2");
    paramCell.value = `From Date : ${fromDate}     To Date : ${toDate}`;
    paramCell.font = { bold: true, size: 11 };
    paramCell.alignment = {
      horizontal: "left",
      vertical: "middle",
      indent: 1,
    };
    sheet.getRow(2).height = 18;

    /* =========================
     ROW 4 → HEADER
  ========================== */
    const headerRow = [
      "S No",
      "Sales No",
      "Sales Date",
      "Customer",
      "Cash Amt",
      "Card Amt",
      "UPI Amt",
      "Net Amt",
    ];

    sheet.addRow(headerRow);

    const header = sheet.getRow(3);
    header.height = 22;

    header.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        horizontal: "center", // HEADER CENTER ONLY
        vertical: "middle",
        wrapText: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEFEFEF" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    /* =========================
     DATA ROWS
  ========================== */
    dataArray.forEach((item, index) => {
      const netAmount =
        Number(item?.cashAmount || 0) +
        Number(item?.cardAmount || 0) +
        Number(item?.upiAmount || 0);

      const row = sheet.addRow([
        index + 1,
        item?.docId || "",
        item?.docDate ? getDateFromDateTimeToDisplay(item.docDate) : "",
        item?.customerName || "",
        Number(item?.cashAmount || 0),
        Number(item?.cardAmount || 0),
        Number(item?.upiAmount || 0),
        netAmount,
      ]);

      row.height = 20;
    });

    /* =========================
     TOTAL ROW
  ========================== */
    const totalRow = sheet.addRow([
      "",
      "",
      "",
      "Total",
      Number(allData?.totalCashAmount || 0),
      Number(allData?.totalCardAmount || 0),
      Number(allData?.totalUpiAmount || 0),
      Number(allData?.totalNetAmount || 0),
    ]);

    totalRow.height = 22;

    /* =========================
     COLUMN WIDTHS
  ========================== */
    sheet.columns = [
      { width: 8 },
      { width: 20 },
      { width: 18 },
      { width: 25 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 18 },
    ];

    /* =========================
     GLOBAL STYLING
  ========================== */
    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        // Border for all cells
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Skip Title, Parameter, Empty, Header
        if (rowNumber <= 3) return;

        // Amount columns right aligned
        if (colNumber >= 5) {
          cell.alignment = {
            horizontal: "right",
            vertical: "middle",
            indent: 1,
          };
          cell.numFmt = "0.00";
        } else {
          // Other data left aligned
          cell.alignment = {
            horizontal: "left",
            vertical: "middle",
            indent: 1,
          };
        }

        // Total row styling
        if (rowNumber === sheet.rowCount) {
          cell.font = { bold: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDDEBF7" },
          };
        }
      });
    });

    /* =========================
     FREEZE HEADER
  ========================== */
    sheet.views = [
      {
        state: "frozen",
        ySplit: 3,
      },
    ];

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
    a.download = "SalesBillReport.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const allItems = allDataDetail?.flatMap((item) => item.salesItem || []);

  const totalQty = allItems?.reduce(
    (sum, item) => sum + (item.qty || item.exchangeQty || 0),
    0,
  );

  return (
    <>
      <Modal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PDF allData={allData || []} singleData={singleData} />
        </PDFViewer>
      </Modal>
      <div className="py-1 bg-[#F1F1F0] h-[85%]">
        <div className="flex flex-col sm:flex-row justify-between bg-white  px-1  items-center mb-2 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">
            Sales Bill Report
          </h1>
          <div className="flex gap-5 font-medium text-lg items-center mt-1">
            <div className="flex gap-3 items-center">
              <button
                className="bg-red-600 text-white px-3 h-6  rounded-md hover:bg-red-700 flex items-center text-xs"
                onClick={() => {
                  setPdfOpen(true);
                }}
              >
                <FiPrinter className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                className="bg-green-700 text-white px-3 h-6  rounded-md hover:bg-green-800 flex items-center text-sm"
                onClick={() => DownloadExcel(allData)}
              >
                <FiPrinter className="w-4 h-4 mr-2" />
                Excel
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-2 items-center">
                <label>From Date</label>
                <ReusableInput
                  value={fromDate}
                  setValue={setFromDate}
                  type={"date"}
                />
              </div>
              <div className="flex gap-2 items-center">
                <label>To Date</label>
                <ReusableInput
                  value={toDate}
                  setValue={setToDate}
                  type={"date"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col w-full h-[93%] overflow-auto">
            <div className="h-full rounded-lg bg-[#F1F1F0] shadow-sm">
              <div className="h-[420px]">
                {currentItems.length > 0 ? (
                  <table className="">
                    <thead className="bg-gray-200 text-gray-800 ">
                      <tr className="">
                        <th className=" px-1 py-1.5  font-medium text-[13px]  text-gray-900  text-center  w-12">
                          <div className="">S No</div>
                        </th>

                        <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-36">
                          <div>Sales No</div>
                        </th>
                        <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-28">
                          <div>Sales Date</div>
                        </th>
                        <th className="w-24  px-3   font-medium text-[13px] text-gray-900  text-center ">
                          <div>Time</div>
                        </th>
                        <th className="w-64  px-3   font-medium text-[13px] text-gray-900  text-center ">
                          <div>Customer</div>
                        </th>
                        {viewType === "Normal" && (
                          <>
                            <th className="w-28  px-3   font-medium text-[13px] text-gray-900  text-center ">
                              <div>Cash Amt</div>
                            </th>
                            <th className="w-28  px-3   font-medium text-[13px] text-gray-900  text-center ">
                              <div>Card Amt</div>
                            </th>
                            <th className="w-28  px-3   font-medium text-[13px] text-gray-900  text-center ">
                              <div>UPI Amt</div>
                            </th>
                            <th className="w-40  px-3   font-medium text-[13px] text-gray-900  text-center ">
                              <div>Net Amt</div>
                            </th>
                          </>
                        )}
                        {viewType === "Detail" && (
                          <>
                            <th className="w-32  px-3   font-medium text-[13px] text-gray-900  text-center ">
                              <div>Barcode</div>
                            </th>
                            <th className="w-64  px-3   font-medium text-[13px] text-gray-900  text-center ">
                              <div>Item Name</div>
                            </th>
                            <th className="w-20  px-3   font-medium text-[13px] text-gray-900  text-center ">
                              <div>Size</div>
                            </th>
                            <th className="w-20  px-3   font-medium text-[13px] text-gray-900  text-center ">
                              <div>Unit</div>
                            </th>
                            <th className="w-20  px-3   font-medium text-[13px] text-gray-900  text-center ">
                              <div>Qty</div>
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    {isLoadingIndicator ? (
                      <tbody>
                        <tr>
                          <td>
                            <Loader />
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody className="border-2">
                        {currentItems.map((dataObj, index) => {
                          const salesItems = dataObj?.salesItem || [];

                          // 🔹 NORMAL VIEW (unchanged)
                          if (viewType === "Normal") {
                            return (
                              <tr
                                key={dataObj.id}
                                className={`hover:bg-gray-50 border-b border-gray-200 text-[12px] ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                } ${
                                  dataObj?.salesType === "Exchange"
                                    ? "text-red-500 font-semibold"
                                    : "text-black"
                                }`}
                              >
                                <td className="text-center">{index + 1}</td>
                                <td className="py-1.5 px-4">{dataObj.docId}</td>
                                <td className="py-1.5 px-4">
                                  {dataObj?.docDate
                                    ? getDateFromDateTimeToDisplay(
                                        dataObj.docDate,
                                      )
                                    : ""}
                                </td>
                                <td className="py-1.5 px-4">
                                  {dataObj?.createdAt
                                    ? getTimeFromDateTime(dataObj.createdAt)
                                    : ""}
                                </td>
                                <td className="py-1.5 px-4">
                                  {dataObj?.customerName} - {dataObj?.mobileNo}
                                </td>

                                <td className="py-1.5 text-right px-10">
                                  {Number(dataObj?.cashAmount || 0).toFixed(2)}
                                </td>
                                <td className="py-1.5 text-right px-10">
                                  {Number(dataObj?.cardAmount || 0).toFixed(2)}
                                </td>
                                <td className="py-1.5 text-right px-10">
                                  {Number(dataObj?.upiAmount || 0).toFixed(2)}
                                </td>
                                <td className="py-1.5 text-right px-10">
                                  {(
                                    Number(dataObj?.cashAmount || 0) +
                                    Number(dataObj?.cardAmount || 0) +
                                    Number(dataObj?.upiAmount || 0)
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            );
                          }

                          // 🔹 DETAIL VIEW
                          return salesItems.map((item, itemIndex) => (
                            <tr
                              key={`${dataObj.id}-${itemIndex}`}
                              className={`hover:bg-gray-50 border-b border-gray-200 text-[12px] ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-100"
                              } ${
                                dataObj?.salesType === "Exchange"
                                  ? "text-red-500 font-semibold"
                                  : "text-black"
                              }`}
                            >
                              {/* Show Bill Data Only First Item Row */}
                              <td className="text-center">
                                {itemIndex === 0 ? index + 1 : ""}
                              </td>

                              <td className="py-1.5 px-4">
                                {itemIndex === 0 ? dataObj.docId : ""}
                              </td>

                              <td className="py-1.5 px-4">
                                {itemIndex === 0
                                  ? getDateFromDateTimeToDisplay(
                                      dataObj.docDate,
                                    )
                                  : ""}
                              </td>

                              <td className="py-1.5 px-4">
                                {itemIndex === 0
                                  ? getTimeFromDateTime(dataObj.createdAt)
                                  : ""}
                              </td>

                              <td className="py-1.5 px-4">
                                {itemIndex === 0
                                  ? `${dataObj.customerName} - ${dataObj.mobileNo}`
                                  : ""}
                              </td>
                              <td className="py-1.5 px-4 ">
                                {item?.barcodeNo}
                              </td>
                              {/* 🔹 Item Columns */}
                              <td className="py-1.5 px-4 ">
                                {item?.StyleItem?.name}
                              </td>
                              <td className="py-1.5 px-4 text-center">
                                {item?.Size?.name}
                              </td>
                              <td className="py-1.5 px-4 text-center">
                                {item?.Uom?.name}
                              </td>
                              <td className="py-1.5 px-4 text-right">
                                {dataObj?.salesType === "General"
                                  ? item?.qty
                                  : item?.exchangeQty}
                              </td>
                            </tr>
                          ));
                        })}
                      </tbody>
                    )}
                    <tfoot className="border-2">
                      <tr className="bg-gray-100 font-medium text-[14px]  text-gray-900 border-b   border-gray-200">
                        <td
                          colSpan={viewType === "Normal" ? 5 : 9}
                          className="text-right py-1.5 px-1"
                        >
                          Total
                        </td>
                        {viewType === "Normal" && (
                          <>
                            <td className="py-1.5 px-10 text-right">
                              {Number(allData?.totalCashAmount).toFixed(2)}
                            </td>
                            <td className="py-1.5 px-10 text-right">
                              {Number(allData?.totalCardAmount).toFixed(2)}
                            </td>
                            <td className="py-1.5 px-10 text-right">
                              {Number(allData?.totalUpiAmount).toFixed(2)}
                            </td>
                            <td className="py-1.5 px-10 text-right">
                              {Number(allData?.totalNetAmount).toFixed(2)}
                            </td>
                          </>
                        )}
                        {viewType === "Detail" && (
                          <td className="py-1.5 px-4 text-right">
                            {totalQty}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <div className="flex justify-center items-center text-gray-500  text-3xl py-32">
                    <p>{EMPTY_ICON} No Data Found...! </p>
                  </div>
                )}
              </div>
              <div className="">
                <Pagination />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

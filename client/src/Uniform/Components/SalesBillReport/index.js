import { useGetSalesBillReportQuery } from "../../../redux/services/SalesBillService";
import { useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import { Loader } from "../../../Basic/components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";

export default function Form() {
  const today = new Date().toISOString().split("T")[0];
  const [dataPerPage, setDataPerPage] = useState("10");
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
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

  const isLoadingIndicator = isLoading || isFetching;

  const totalPages = Math?.ceil(allData?.totalCount / dataPerPage);

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
    );
  };

  return (
    <>
      <div className="p-1 bg-[#F1F1F0] h-[85%]">
        <div className="flex flex-col sm:flex-row justify-between bg-white  px-1  items-center mb-4 gap-x-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">
            Sales Bill Report
          </h1>
          <div className="flex gap-4 font-medium text-lg items-center mt-1">
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

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col w-full h-[93%] overflow-auto">
            <div className="h-full rounded-lg bg-[#F1F1F0] shadow-sm">
              <div className="h-[420px]">
                <table className="">
                  <thead className="bg-gray-200 text-gray-800 ">
                    <tr className="">
                      <th className=" px-1 py-1.5  font-medium text-[13px]  text-gray-900  text-center  w-12">
                        <div className="">S No</div>
                      </th>

                      <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-40">
                        <div>Bill No</div>
                      </th>
                      <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-40">
                        <div>Bill Date</div>
                      </th>
                      {/* <th className="w-48  px-3   font-medium text-[13px] text-gray-900  text-center ">
                    <div>Payment Type</div>
                  </th> */}
                      <th className="w-48  px-3   font-medium text-[13px] text-gray-900  text-center ">
                        <div>Customer</div>
                      </th>
                      <th className="w-48  px-3   font-medium text-[13px] text-gray-900  text-center ">
                        <div>Cash Amt</div>
                      </th>
                      <th className="w-48  px-3   font-medium text-[13px] text-gray-900  text-center ">
                        <div>Card Amt</div>
                      </th>
                      <th className="w-48  px-3   font-medium text-[13px] text-gray-900  text-center ">
                        <div>UPI Amt</div>
                      </th>
                      <th className="w-48  px-3   font-medium text-[13px] text-gray-900  text-center ">
                        <div>Net Amt</div>
                      </th>
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
                      {(allData?.data ? allData?.data : []).map(
                        (dataObj, index) => (
                          <tr
                            tabIndex={0}
                            key={dataObj.id}
                            className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-100"
                            }`}
                          >
                            <td className="text-center ">{index + 1}</td>

                            <td className="py-1.5 text-left px-4">
                              {dataObj.docId}{" "}
                            </td>

                            <td className="py-1.5 text-left px-4">
                              {dataObj?.docDate
                                ? getDateFromDateTimeToDisplay(dataObj.docDate)
                                : ""}
                            </td>
                            {/* <td className="py-1.5 text-left px-4">
                          {" "}
                          {dataObj?.paymentType}
                        </td> */}

                            <td className="py-1.5 text-left px-4">
                              {" "}
                              {dataObj?.customerName}
                            </td>
                            <td className="py-1.5 text-right px-10">
                              {" "}
                              {dataObj?.cashAmount
                                ? Number(dataObj?.cashAmount).toFixed(2)
                                : "-"}
                            </td>
                            <td className="py-1.5 text-right px-10">
                              {" "}
                              {dataObj?.cardAmount
                                ? Number(dataObj?.cardAmount).toFixed(2)
                                : "-"}
                            </td>
                            <td className="py-1.5 text-right px-10">
                              {" "}
                              {dataObj?.upiAmount
                                ? Number(dataObj?.upiAmount).toFixed(2)
                                : "-"}
                            </td>
                            <td className="py-1.5 text-right px-10">
                              {" "}
                              {(
                                Number(dataObj?.cashAmount) +
                                Number(dataObj?.cardAmount) +
                                Number(dataObj?.upiAmount)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  )}
                  <tfoot className="border-2">
                    <tr className="bg-gray-100 font-medium text-[14px]  text-gray-900 border-b   border-gray-200">
                      <td colSpan={4} className="text-right py-1.5">
                        Total
                      </td>
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
                    </tr>
                  </tfoot>
                </table>
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

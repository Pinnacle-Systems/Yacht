import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  getDateFromDateTimeToDisplay,
  reactPaginateIndexToPageNumber,
} from "../../../Utils/helper";
import { Loader } from "../../../Basic/components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useGetStockInwardQuery } from "../../../redux/uniformService/StockInwardService";

const StockInwardReport = ({
  onClick,
  onView,
  itemsPerPage = 10,
  onEdit,
  onDelete,
  rowActions = true,
}) => {
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  );

  const [dataPerPage, setDataPerPage] = useState("10");
  const [serachDocNo, setSerachDocNo] = useState("");
  const [searchDocDate, setSearchDocDate] = useState("");
  const [searchStore, setSearchStore] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchStyleNo, setSearchStyleNo] = useState("");

  const handleOnclick = (e) => {
    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
  };

  const searchFields = {
    serachDocNo,
    searchDocDate,
    searchStore,
    searchStyleNo,
  };

  useEffect(() => {
    setCurrentPageNumber(1);
  }, [serachDocNo, searchDocDate, searchStore, searchStyleNo]);

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const finyearId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentFinYear"
  );
  const params = {
    branchId,
    companyId,
  };

  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetStockInwardQuery({
    params: {
      branchId,
      ...searchFields,
      pagination: true,
      dataPerPage,
      pageNumber: currentPageNumber,
      finyearId,
    },
  });

  useEffect(() => {
    if (allData?.totalCount) {
      setTotalCount(allData?.totalCount);
    }
  }, [allData, isLoading, isFetching]);

  const isLoadingIndicator = isLoading || isFetching;

  const totalPages = Math?.ceil(allData?.data?.length / itemsPerPage);
  const indexOfLastItem = currentPage * parseInt(10);
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allData?.data?.slice(indexOfFirstItem, indexOfLastItem);

  console.log(indexOfLastItem, "indexOfLastItem");

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  const Pagination = () => {
    return (
      <div className="h-10 w-full flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200 ">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, allData?.data?.length)} of{" "}
          {allData?.length} entries
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
    <div className="flex flex-col w-full h-[93%] overflow-auto">
      <>
        <div className="h-[100%] rounded-lg bg-[#F1F1F0] shadow-sm">
          <div className="h-[420px]">
            <table className="">
              <thead className="bg-gray-200 text-gray-800 ">
                <tr className="">
                  <th className=" px-1 py-1.5  font-medium text-[13px]  text-gray-900  text-center  w-12">
                    <div className="">S No</div>
                  </th>

                  <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-32">
                    <div>Doc No</div>
                  </th>
                  <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-32">
                    <div>Doc Date</div>
                  </th>
                  <th className="w-96  px-3   font-medium text-[13px] text-gray-900  text-center ">
                    <div>Location</div>
                  </th>
                  <th className="w-48  px-3   font-medium text-[13px] text-gray-900  text-center ">
                    <div>Style No</div>
                  </th>
                  <th className="w-14   px-3  font-medium text-[13px]  text-gray-900  text-center ">
                    <div>Actions</div>
                  </th>
                </tr>
                <tr className="">
                  <th className=" px-1  font-medium text-[13px] justify-end  text-gray-900  text-center  w-12">
                    <div className="h-3"></div>
                  </th>
                  <th className=" px-1 font-medium text-[13px] border  text-gray-900  text-center w-32">
                    <input
                      type="text"
                      className="text-black h-5   w-full  px-1 focus:outline-none border  border-gray-400 rounded-md"
                      placeholder="Search"
                      value={serachDocNo}
                      onChange={(e) => {
                        setSerachDocNo(e.target.value);
                      }}
                    />
                  </th>
                  <th className="  px-1 font-medium text-[13px]  text-gray-900  text-center w-32">
                    <input
                      type="text"
                      className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                      placeholder="Search"
                      value={searchDocDate}
                      onChange={(e) => {
                        setSearchDocDate(e.target.value);
                      }}
                    />
                  </th>
                  <th className="w-96  px-1 font-medium text-[13px]  text-gray-900  text-center ">
                    <input
                      type="text"
                      className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                      placeholder="Search"
                      value={searchStore}
                      onChange={(e) => {
                        setSearchStore(e.target.value);
                      }}
                    />
                  </th>
                  <th className="w-48  px-1 font-medium text-[13px]  text-gray-900  text-center ">
                    <input
                      type="text"
                      className="text-black h-5   w-full   px-1 focus:outline-none border  border-gray-400 rounded-md"
                      placeholder="Search"
                      value={searchStyleNo}
                      onChange={(e) => {
                        setSearchStyleNo(e.target.value);
                      }}
                    />
                  </th>
                  <th className="w-14  px-1  font-medium text-[13px]  text-gray-900  text-center "></th>
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

                        <td className="py-1.5 text-center">{dataObj.docId} </td>

                        <td className="py-1.5 text-center">
                          {dataObj?.docDate
                            ? getDateFromDateTimeToDisplay(dataObj.docDate)
                            : ""}
                        </td>
                        <td className="py-1.5 text-center">
                          {" "}
                          {dataObj?.Store?.storeName}
                        </td>
                        <td className="py-1.5 text-left px-4">
                          {" "}
                          {dataObj?.Style?.sku}
                        </td>
                        {rowActions && (
                          <td className=" w-[30px] border-gray-200 gap-1 px-2   h-8 justify-end">
                            <div className="flex">
                              {onView && (
                                <button
                                  className="text-blue-600  flex items-center   px-1  bg-blue-50 rounded"
                                  onClick={() => onView(dataObj.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              )}
                              {onEdit && (
                                <button
                                  className="text-green-600 gap-1 px-1   bg-green-50 rounded"
                                  onClick={() => onEdit(dataObj.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  className=" text-red-800 flex items-center gap-1 px-1  bg-red-50 rounded"
                                  onClick={() => onDelete(dataObj.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
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
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              )}
            </table>
          </div>
          <div className="">
            <Pagination />
          </div>
        </div>
      </>
    </div>
  );
};

export default StockInwardReport;

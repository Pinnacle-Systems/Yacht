import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  findFromList,
  getDateFromDateTimeToDisplay,
  reactPaginateIndexToPageNumber,
} from "../../../Utils/helper";
import { Loader } from "../../../Basic/components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  useGetStockQuery,
  useGetStockSummaryQuery,
} from "../../../redux/services/StockService";
import Modal from "../../../UiComponents/Modal";
import Parameter from "./Parameter";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { EMPTY_ICON } from "../../../icons";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { sum } from "lodash";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";

const StockReport = forwardRef(
  (
    {
      onClick,
      onView,
      itemsPerPage = 10,
      onEdit,
      onDelete,
      rowActions = true,
      parameter,
      setParameter,
      onDataLoaded,
    },
    ref
  ) => {
    const branchId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentBranchId"
    );

    const [dataPerPage, setDataPerPage] = useState("10");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [storeId, setStoreId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [styleId, setStyleId] = useState("");
    const [sizeId, setSizeId] = useState("");
    const [fabricId, setFabricId] = useState("");
    const [styleItemId, setStyleItemId] = useState("");
    const [colorId, setColorId] = useState("");
    const handleOnclick = (e) => {
      setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    };

    const companyId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    );
    const finYearId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentFinYear"
    );
    const params = {
      branchId,
      companyId,
      finYearId,
    };

    const { data: styleList } = useGetStyleMasterQuery({ params });
    const { data: sizeList } = useGetSizeMasterQuery({ params });
    const { data: fabricList } = useGetFabricMasterQuery({ params });
    const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
    const { data: colorList } = useGetColorMasterQuery({ params });

    const {
      data: allData,
      isFetching,
      isLoading,
      refetch,
    } = useGetStockSummaryQuery(
      {
        params: {
          branchId,
          storeId,
          pagination: true,
          dataPerPage,
          pageNumber: currentPageNumber,
          styleId,
          sizeId,
          fabricId,
          styleItemId,
          colorId,
          fromDate,
          toDate,
          finYearId,
        },
      },
      {
        skip: !(branchId && storeId),
      }
    );

    useEffect(() => {
      if (allData && onDataLoaded) {
        onDataLoaded(allData);
      }
    }, [allData, onDataLoaded]);

    const allDataDetail = allData?.data;

    useImperativeHandle(ref, () => ({
      refetch,
    }));

    useEffect(() => {
      if (allData?.totalCount) {
        setTotalCount(allData?.totalCount);
      }
    }, [allData, isLoading, isFetching]);

    const isLoadingIndicator = isLoading || isFetching;

    const totalPages = Math?.ceil(allDataDetail?.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = (allDataDetail || []).slice(
      indexOfFirstItem,
      indexOfLastItem
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
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, allData?.totalCount || 0)} of{" "}
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

    function formatCamelCase(str) {
      if (!str) return "";
      return str
        .replace(/([a-z])([A-Z])/g, "$1 $2") // insert space before capital letters
        .toUpperCase();
    }

    return (
      <>
        <Modal
          isOpen={parameter}
          onClose={() => {
            setCurrentPage(1);
            setParameter(false);
          }}
        >
          <Parameter
            locationId={locationId}
            setLocationId={setLocationId}
            storeId={storeId}
            setStoreId={setStoreId}
            styleId={styleId}
            setStyleId={setStyleId}
            setSizeId={setSizeId}
            sizeId={sizeId}
            fabricId={fabricId}
            setFabricId={setFabricId}
            styleItemId={styleItemId}
            setStyleItemId={setStyleItemId}
            colorId={colorId}
            setColorId={setColorId}
            fromDate={fromDate}
            toDate={toDate}
            setFromDate={setFromDate}
            setToDate={setToDate}
            onClose={() => {
              setCurrentPage(1);
              setParameter(false);
            }}
          />
        </Modal>
        <div className="flex flex-col w-full h-[93%] overflow-auto">
          <>
            <div className="h-full rounded-lg bg-[#F1F1F0] shadow-sm">
              <div className="h-[420px]">
                {currentItems.length > 0 ? (
                  <table className="">
                    <thead className="bg-gray-200 text-gray-800 ">
                      <tr className="">
                        <th className=" px-1 py-1.5  font-medium text-[13px]  text-gray-900  text-center  w-12">
                          <div className="">S No</div>
                        </th>
                        <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-24">
                          <div>Date</div>
                        </th>
                        <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-24">
                          <div>Style No</div>
                        </th>
                        <th className="w-48  px-3   font-medium text-[13px] text-gray-900  text-center">
                          <div>Style</div>
                        </th>
                        <th className="w-48  px-3   font-medium text-[13px] text-gray-900  text-center ">
                          <div>Fabric</div>
                        </th>
                        <th className="w-48  px-3   font-medium text-[13px] text-gray-900  text-center ">
                          <div>Color</div>
                        </th>
                        <th className="w-20  px-3   font-medium text-[13px] text-gray-900  text-center ">
                          <div>Size</div>
                        </th>
                        <th className="w-40  px-3   font-medium text-[13px] text-gray-900  text-center ">
                          <div>Process</div>
                        </th>
                        <th className="w-24  px-3   font-medium text-[13px] text-gray-900  text-center ">
                          <div>Qty</div>
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
                        {currentItems.map((dataObj, index) => (
                          <tr
                            tabIndex={0}
                            key={dataObj.id}
                            className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-100"
                            }`}
                          >
                            <td className="text-center h-8">{index + 1}</td>
                            <td className="py-1.5 text-center">
                              {dataObj?.createdAt
                                ? getDateFromDateTimeToDisplay(
                                    dataObj.createdAt
                                  )
                                : ""}
                            </td>
                            <td className="py-1.5 text-center">
                              {dataObj.styleNo}{" "}
                            </td>

                            {/* <td className="py-1.5 text-center">
                              {dataObj?.barcode}
                            </td> */}
                            <td className="py-1.5 text-center">
                              {findFromList(
                                dataObj?.styleItemId,
                                styleItemList?.data,
                                "name"
                              )}
                            </td>
                            <td className="py-1.5 text-center">
                              {findFromList(
                                dataObj?.fabricId,
                                fabricList?.data,
                                "name"
                              )}
                            </td>
                            <td className="py-1.5 text-center">
                              {findFromList(
                                dataObj?.colorId,
                                colorList?.data,
                                "name"
                              )}
                            </td>
                            <td className="py-1.5 text-center">
                              {findFromList(
                                dataObj?.sizeId,
                                sizeList?.data,
                                "name"
                              )}
                            </td>
                            <td className="py-1.5 text-center">
                              {formatCamelCase(dataObj?.inOrOut)}
                            </td>
                            <td
                              className={`py-1.5 text-center font-semibold ${
                                dataObj?.qty < 0
                                  ? "text-red-600"
                                  : dataObj?.qty > 0
                                  ? "text-green-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {dataObj?.qty < 0
                                ? `- ${Math.abs(dataObj.qty)}`
                                : dataObj?.qty > 0
                                ? `+ ${dataObj.qty}`
                                : dataObj?.qty}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                    <tfoot className="border-2">
                      <tr className="bg-gray-100 font-medium text-[14px]  text-gray-900 border-b   border-gray-200">
                        <td colSpan={8} className="text-right py-1.5">
                          Total
                        </td>
                        <td className="py-1.5 text-center">
                          {allData?.totalQty}
                        </td>
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
          </>
        </div>
      </>
    );
  }
);

export default StockReport;

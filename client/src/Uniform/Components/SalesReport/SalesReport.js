import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  findFromList,
  getDateFromDateTimeToDisplay,
  reactPaginateIndexToPageNumber,
} from "../../../Utils/helper";
import { Loader } from "../../../Basic/components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Modal from "../../../UiComponents/Modal";
import Parameter from "./Parameter";
import { EMPTY_ICON } from "../../../icons";
import { useGetStockQuery } from "../../../redux/services/StockService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetSalesReportQuery, useLazyGetSalesEntryByIdQuery } from "../../../redux/uniformService/SalesEntryService";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
const SalesReport = forwardRef(
  (
    { onClick, itemsPerPage = 10, parameter, setParameter, onDataLoaded },
    ref
  ) => {
    const branchId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentBranchId"
    );

    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [id, setId] = useState("");
    const [readOnly, setReadOnly] = useState(false);
    const [storeId, setStoreId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [customerId, setCustomerId] = useState("");
    const handleOnclick = (e) => {
      setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    };

    const companyId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    );
    const params = {
      branchId,
      companyId,
    };
    const {
      data: allData,
      isFetching,
      isLoading,
      refetch,
    } = useGetSalesReportQuery(
      {
        params: {
          branchId,
          storeId,
          customerId,
          fromDate,
          toDate,
        },
      },
      {
        skip: !(branchId && storeId),
      }
    );
    const { data: customerList } = useGetPartyQuery({
      params: { companyId },
    });

    const allDataDetail = allData?.data;

    useEffect(() => {
      if (allData?.totalCount) {
        setTotalCount(allData?.totalCount);
      }
    }, [allData, isLoading, isFetching]);

    const isLoadingIndicator = isLoading || isFetching;

    useImperativeHandle(ref, () => ({
      refetch,
    }));
    const dispatch = useDispatch();
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

    const calculateNetAmount = (item) => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.price) || 0;
      const taxPercent = parseFloat(item.taxPercent) || 0;
      const discountValue = parseFloat(item.discountValue) || 0;
      const discountType = item.discountType || "";

      // Gross amount
      const grossAmount = qty * price;

      // GST Subtracted
      const amountAfterGST = grossAmount - (grossAmount * taxPercent) / 100;

      // Apply Discount
      let discountAmt = 0;
      if (discountType === "Flat") discountAmt = discountValue;
      else if (discountType === "Percent")
        discountAmt = (amountAfterGST * discountValue) / 100;

      // Final net amount
      const netAmount = amountAfterGST - discountAmt;

      return netAmount;
    };

    const totalQty = currentItems?.reduce((grandTotal, dataObj) => {
      const itemQty = dataObj?.SalesEntryItems?.reduce(
        (total, item) => total + item?.qty,
        0
      );
      return grandTotal + itemQty;
    }, 0);

    const totalNetAmt = currentItems?.reduce((grandAmount, dataObj) => {
      const itemAmt = dataObj?.SalesEntryItems?.reduce(
        (total, item) => total + calculateNetAmount(item),
        0
      );
      return grandAmount + itemAmt;
    }, 0);

    useEffect(() => {
      if (allData && onDataLoaded) {
        onDataLoaded(allData);
      }
    }, [allData, onDataLoaded]);

    const handleView = (orderId) => {
      dispatch(push({ name: "SALES DELIVERY" })); // or exact tab name
    };

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
            customerId={customerId}
            setCustomerId={setCustomerId}
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
                        <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-40">
                          <div>Sales Delivery Date</div>
                        </th>
                        <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-40">
                          <div>Sales Delivery No</div>
                        </th>
                        <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-56">
                          <div>Customer</div>
                        </th>
                        <th className="w-32  px-3   font-medium text-[13px] text-gray-900  text-center ">
                          <div>Sales Qty</div>
                        </th>
                        <th className="w-36  px-3   font-medium text-[13px] text-gray-900  text-center ">
                          <div>Sales Amount</div>
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
                              {dataObj?.docDate
                                ? getDateFromDateTimeToDisplay(dataObj.docDate)
                                : ""}
                            </td>
                            <td
                              className="py-1.5 text-center cursor-pointer cursor-underline"
                              onClick={() => handleView(dataObj?.id)}
                            >
                              {dataObj?.docId ? dataObj?.docId : ""}
                            </td>
                            <td className="py-1.5 text-center">
                              {findFromList(
                                dataObj?.customerId,
                                customerList?.data,
                                "name"
                              )}
                            </td>
                            <td className="py-1.5 text-center">
                              {dataObj?.SalesEntryItems?.reduce(
                                (total, item) => total + item?.qty,
                                0
                              )}
                            </td>
                            <td className="py-1.5 text-center">
                              {dataObj?.SalesEntryItems?.reduce(
                                (total, item) =>
                                  total + calculateNetAmount(item),
                                0
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                    <tfoot className="border-2">
                      <tr className="bg-gray-100 font-medium text-[14px]  text-gray-900 border-b   border-gray-200">
                        <td colSpan={4} className="text-right py-1.5">
                          Total
                        </td>
                        <td className="py-1.5 text-center">{totalQty}</td>
                        <td className="py-1.5 text-center">
                          {totalNetAmt.toFixed(2)}
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

export default SalesReport;

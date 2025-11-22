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
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { EMPTY_ICON } from "../../../icons";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetMaterialStockQuery } from "../../../redux/services/MaterialStockService";
import { useGetAccessoryMasterQuery } from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetAccessoryGroupMasterQuery } from "../../../redux/uniformService/AccessoryGroupMasterServices";

const MaterialStockReport = forwardRef(
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
    const [serachDocNo, setSerachDocNo] = useState("");
    const [searchDocDate, setSearchDocDate] = useState("");
    const [searchStore, setSearchStore] = useState("");
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
    const [itemType, setItemType] = useState("");
    const handleOnclick = (e) => {
      setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    };

    const searchFields = {
      serachDocNo,
      searchDocDate,
      searchStore,
    };

    useEffect(() => {
      setCurrentPageNumber(1);
    }, [serachDocNo, searchDocDate, searchStore]);

    const companyId = secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    );
    const params = {
      branchId,
      companyId,
    };

    const { data: styleList } = useGetStyleMasterQuery({ params });
    const { data: sizeList } = useGetSizeMasterQuery({ params });
    const { data: fabricList } = useGetFabricMasterQuery({ params });
    const { data: styleItemList } = useGetStyleItemMasterQuery({ params });
    const { data: colorList } = useGetColorMasterQuery({ params });
    const { data: accessoryList } = useGetAccessoryMasterQuery({ params });
    const { data: accessoryGroupList } = useGetAccessoryGroupMasterQuery({
      params,
    });

    const {
      data: allData,
      isFetching,
      isLoading,
      refetch,
    } = useGetMaterialStockQuery(
      {
        params: {
          branchId,
          storeId,
          ...searchFields,
          pagination: true,
          dataPerPage,
          pageNumber: currentPageNumber,
          styleId,
          sizeId,
          fabricId,
          styleItemId,
          colorId,
          itemType,
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
            itemType={itemType}
            setItemType={setItemType}
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
                    {itemType === "Fabric" && (
                      <thead className="bg-gray-200 text-gray-800 ">
                        <tr className="">
                          <th className=" px-1 py-1.5  font-medium text-[13px]  text-gray-900  text-center  w-12">
                            <div className="">S No</div>
                          </th>

                          <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-32">
                            <div>Style No</div>
                          </th>
                          <th className="w-72  px-3   font-medium text-[13px] text-gray-900  text-center ">
                            <div>Style</div>
                          </th>
                          <th className="w-52  px-3   font-medium text-[13px] text-gray-900  text-center ">
                            <div>Fabric</div>
                          </th>
                          <th className="w-52  px-3   font-medium text-[13px] text-gray-900  text-center ">
                            <div>Color</div>
                          </th>
                          {/* <th className="w-28  px-3   font-medium text-[13px] text-gray-900  text-center ">
                            <div>Size</div>
                          </th> */}
                          <th className="w-28  px-3   font-medium text-[13px] text-gray-900  text-center ">
                            <div>Meter</div>
                          </th>
                        </tr>
                      </thead>
                    )}
                    {itemType === "Accessory" && (
                      <thead className="bg-gray-200 text-gray-800 ">
                        <tr className="">
                          <th className=" px-1 py-1.5  font-medium text-[13px]  text-gray-900  text-center  w-12">
                            <div className="">S No</div>
                          </th>

                          <th className=" px-3  font-medium text-[13px]  text-gray-900  text-center w-32">
                            <div>Accessory Name</div>
                          </th>
                          <th className="w-72  px-3   font-medium text-[13px] text-gray-900  text-center ">
                            <div>Accessory Group Name</div>
                          </th>
                          <th className="w-52  px-3   font-medium text-[13px] text-gray-900  text-center ">
                            <div>Color</div>
                          </th>
                          <th className="w-28  px-3   font-medium text-[13px] text-gray-900  text-center ">
                            <div>Size</div>
                          </th>
                          <th className="w-28  px-3   font-medium text-[13px] text-gray-900  text-center ">
                            <div>Quantity</div>
                          </th>
                        </tr>
                      </thead>
                    )}
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
                          if (itemType === "Fabric") {
                            return (
                              <tr
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    onClick(dataObj.id);
                                  }
                                }}
                                tabIndex={0}
                                key={dataObj.id}
                                className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                }`}
                                onClick={() => onClick(dataObj.id)}
                              >
                                <td className="text-center h-8">{index + 1}</td>

                                <td className="py-1.5 text-center">
                                  {dataObj.styleNo}
                                </td>

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
                                  {dataObj?.fabMeter}
                                </td>
                              </tr>
                            );
                          }

                          if (itemType === "Accessory") {
                            return (
                              <tr
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    onClick(dataObj.id);
                                  }
                                }}
                                tabIndex={0}
                                key={dataObj.id}
                                className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${
                                  index % 2 === 0 ? "bg-white" : "bg-gray-100"
                                }`}
                                onClick={() => onClick(dataObj.id)}
                              >
                                <td className="text-center h-8">{index + 1}</td>

                                <td className="py-1.5 text-center">
                                  {findFromList(
                                    dataObj?.accessoryId,
                                    accessoryList?.data,
                                    "name"
                                  )}
                                </td>

                                <td className="py-1.5 text-center">
                                  {findFromList(
                                    dataObj?.accessoryGroupId,
                                    accessoryGroupList?.data,
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
                                  {dataObj?.stkQty}
                                </td>
                              </tr>
                            );
                          }

                          return null; // safe fallback
                        })}
                      </tbody>
                    )}
                    {itemType === "Fabric" && (
                      <tfoot className="border-2">
                        <tr className="bg-gray-100 font-medium text-[14px]  text-gray-900 border-b   border-gray-200">
                          <td colSpan={5} className="text-right py-1.5">
                            Total
                          </td>
                          <td className="py-1.5 text-center">
                            {allData?.totalMeter}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                    {itemType === "Accessory" && (
                      <tfoot className="border-2">
                        <tr className="bg-gray-100 font-medium text-[14px]  text-gray-900 border-b   border-gray-200">
                          <td colSpan={5} className="text-right py-1.5">
                            Total
                          </td>
                          <td className="py-1.5 text-center">
                            {allData?.totalQty}
                          </td>
                        </tr>
                      </tfoot>
                    )}
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

export default MaterialStockReport;

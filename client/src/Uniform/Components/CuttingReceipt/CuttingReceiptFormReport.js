import React from 'react'
import { useEffect, useState } from "react";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService"
import moment from "moment/moment";
import { EMPTY_ICON } from "../../../icons";
import { Loader } from "../../../Basic/components";
import { findFromList, getCommonParams, getDateFromDateTime, getDateFromDateTimeToDisplay } from "../../../Utils/helper";

import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetAccessoryMasterQuery } from "../../../redux/uniformService/AccessoryMasterServices";
import { showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import {
  useGetPoQuery
} from "../../../redux/uniformService/PoServices"
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import { useGetCuttingReceiptQuery } from '../../../redux/uniformService/CuttingReceiptServices';
import { useGetCuttingOrderQuery } from '../../../redux/uniformService/CuttingOrderService';
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";

const CuttingReceiptFormReport = ({
  heading = "Cutting Delivery",
  onClick,
  data
}) => {
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )
  const [searchDocId, setSearchDocId] = useState("");
  const [searchDelDate, setSearchDelDate] = useState("");
  const [searchStyle, setSearchStyle] = useState("");
  const [searchCuttingOrderDocId, setSearchCuttingOrderDocId] = useState("");
  const [supplier, setSupplier] = useState("");
  const [dataPerPage, setDataPerPage] = useState("10");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const handleOnclick = (e) => {
    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
  }
  const searchFields = { searchDocId, searchDelDate, searchSupplierAliasName: supplier, searchCuttingOrderDocId, searchStyle }

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )
  const { finYearId } = getCommonParams()

  const params = {
    branchId, companyId
  };

  const { data: allData, isLoading, isFetching } = useGetCuttingReceiptQuery({ params: { branchId, finYearId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber } });


  const {
    data: styleList,
    isLoading: isStyleLoading,
    isFetching: isStyleFetching,
  } = useGetItemMasterQuery({ params });
  const { data: cuttingOrderList, isLoading: isCuttingOrderLoading, isFetching: isCuttingOrderFetching } = useGetCuttingOrderQuery({ params: { branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber } });

  const { data: supplierList, isLoading: isSupplierLoading, isFetching: isSupplierFetching } =
    useGetPartyQuery({ params: { ...params } });

  useEffect(() => {
    if (allData?.totalCount) {
      setTotalCount(allData?.totalCount)
    }
  }, [allData, isLoading, isFetching])

  if (!supplierList || !styleList || !allData || !cuttingOrderList) {
    return (
      <tr>
        <td>
          <Loader />
        </td>
      </tr>
    );
  }



  return (
    <div className="flex flex-col w-full h-[95%] overflow-auto">{console.log(allData, "allllll")}
      <div className="md:flex md:items-center md:justify-between page-heading p-1">
        <div className="heading text-center md:mx-10">{heading}</div>
        <div className=" sub-heading justify-center md:justify-start items-center">
          <label className="text-white text-sm rounded-md m-1  border-none">Show Entries</label>
          <select value={dataPerPage}
            onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded mr-9'>
            {showEntries.map((option) => <option value={option.value} >{option.show}</option>)}
          </select>
        </div>
      </div>
      <>
        <div
          className="h-[500px] overflow-auto"
        >
          <table className="table-fixed text-center w-full">
            <thead className="border-2 table-header">
              <tr className='h-2'>
                <th
                  className="border-2  top-0 stick-bg w-10"
                >
                  S. no.
                </th>
                <th
                  className="border-2  top-0 stick-bg flex flex-col"
                >
                  <label>Del. No</label><input
                    type="text"
                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchDocId}
                    onChange={(e) => {
                      setSearchDocId(e.target.value);
                    }}
                  />
                </th>
                <th
                  className="border-2  top-0 stick-bg"
                >
                  <label>Del. Date</label><input
                    type="text"
                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchDelDate}
                    onChange={(e) => {
                      setSearchDelDate(e.target.value);
                    }}
                  />
                </th>
                <th

                  className="border-2  top-0 stick-bg flex flex-col"
                >
                  <label>Supplier</label><input
                    type="text"
                    className="text-black  h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={supplier}
                    onChange={(e) => {
                      setSupplier(e.target.value);
                    }}
                  />
                </th>
                <th
                  className="border-2  top-0 stick-bg"
                >
                  <label>Cutting Order</label><input
                    type="text"
                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchCuttingOrderDocId}
                    onChange={(e) => {
                      setSearchCuttingOrderDocId(e.target.value);
                    }}
                  />
                </th>
                {/* <th className="border-2  top-0 stick-bg">
                  <label>Style Order</label><input
                    type="text"
                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                    placeholder="Search"
                    value={searchStyle}
                    onChange={(e) => {
                      setSearchStyle(e.target.value);
                    }}
                  />
                </th> */}

              </tr>
            </thead>

            <tbody className="border-2">
              {allData.data.map((dataObj, index) => (
                <tr
                  key={dataObj.id}
                  className="border-2 table-row cursor-pointer"
                  onClick={() => onClick(dataObj.id)}>
                  <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                  <td className='py-1'> {dataObj.docId}</td>
                  <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.createdAt)} </td>
                  <td className='py-1'>{findFromList(dataObj.supplierId, supplierList.data, "aliasName")}</td>
                  <td className='py-1'>{dataObj?.CuttingOrder?.docId}</td>
                  {/* <td className='py-1'>{dataObj?.CuttingOrder?.Style?.name}</td> */}
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </>
      <ReactPaginate
        previousLabel={"<"}
        nextLabel={">"}
        breakLabel={"..."}
        breakClassName={"break-me"}
        forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
        pageCount={Math.ceil(totalCount / dataPerPage)}
        marginPagesDisplayed={1}
        onPageChange={handleOnclick}
        containerClassName={"flex justify-center m-2 gap-5 items-center"}
        pageClassName={"border custom-circle text-center"}
        disabledClassName={"p-1 bg-gray-200"}
        previousLinkClassName={"border p-1 text-center"}
        nextLinkClassName={"border p-1"}
        activeClassName={"bg-blue-900 text-white px-2"} />
    </div>
  )
}

export default CuttingReceiptFormReport
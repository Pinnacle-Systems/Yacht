import React from 'react'
import { useEffect, useState, useRef, useCallback } from "react";
import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService"
import { Loader } from "../../../Basic/components";
import { findFromList, getCommonParams, getDateFromDateTime, getDateFromDateTimeToDisplay } from "../../../Utils/helper";

import secureLocalStorage from 'react-secure-storage';

import { showEntries } from '../../../Utils/DropdownData';
import { LongDropdownInput, DisabledInput, DropdownInput, DateInput } from "../../../Inputs";
import ReactPaginate from 'react-paginate';
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import { useGetPurchaseCancelQuery } from '../../../redux/uniformService/PurchaseCancelServices';






const PurchaseInwardFormReport = ({
  heading,
  tableWidth = "50%",
  loading,
  searchValue,
  setSearchValue,
  onClick,
  data
}) => {

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )
  const params = {
    branchId, companyId
  };
  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });
  const [dcNo, setDcNo] = useState("");

  const [supplier, setSupplier] = useState("");


  const [dataPerPage, setDataPerPage] = useState("10");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [searchDcDate, setSearchDcDate] = useState("");
  const [searchPoType, setSearchPoType] = useState("");



  const searchFields = { searchDocId: dcNo, searchPoDate: searchDcDate, searchSupplierAliasName: supplier, searchPoType }

  const handleOnclick = (e) => {
    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
  }
  const { finYearId } = getCommonParams()

  const { data: allData, isLoading, isFetching } = useGetPurchaseCancelQuery({ params: { branchId, ...searchFields, finYearId, inwardOrReturn: "PurchaseCancel", pagination: true, dataPerPage, pageNumber: currentPageNumber } });

  useEffect(() => {
    if (allData?.totalCount) {
      setTotalCount(allData?.totalCount)
    }
  }, [allData, isLoading, isFetching])
  if (!supplierList || !allData) {
    return <tr>
      <td>
        <Loader />
      </td>
    </tr>
  }
  return (
    <div className="flex flex-col w-full h-[95%] overflow-auto">
      <div className="md:flex md:items-center md:justify-between page-heading p-2">
        <div className="heading text-center md:mx-10">{heading}</div>
        <div className="flex sub-heading justify-center md:justify-start items-center">
          <label className="text-white text-sm rounded-md m-1  border-none">Show Entries</label>
          <select value={dataPerPage}
            onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded'>
            {showEntries.map((option) => <option value={option.value} >{option.show}</option>)}
          </select>

        </div>
      </div>

      <div
        className="h-[500px] overflow-auto "
      // style={{ width: tableWidth }}
      >
        <table className="table-auto text-center w-full ">
          <thead className="border-2 table-header">
            <tr>
              <th
                className="border-2  top-0 stick-bg w-10">
                S. no.
              </th>
              <th

                className="border-2  top-0 stick-bg"
              >
                <label>Dc.No</label><input
                  type="text"
                  className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                  placeholder="Search"
                  value={dcNo}
                  onChange={(e) => {
                    setDcNo(e.target.value);
                  }}
                />
              </th>
              <th
                className="border-2  top-0 stick-bg"
              >
                <label>Dc.Date</label><input
                  type="text"
                  className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                  placeholder="Search"
                  value={searchDcDate}
                  onChange={(e) => {
                    setSearchDcDate(e.target.value);
                  }}
                />
              </th>
              <th

                className="border-2  top-0 stick-bg"
              >
                <label>Supplier</label><input
                  type="text"
                  className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
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
                <label>Po Type</label><input
                  type="text"
                  className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                  placeholder="Search"
                  value={searchPoType}
                  onChange={(e) => {
                    setSearchPoType(e.target.value);
                  }}
                />
              </th>
              {/* <th className="border-2  top-0 stick-bg">

                        <label>Inward. Date</label><input
                          type="text"
                          className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                          placeholder="Search"
                          value={searchInwardDate}
                          onChange={(e) => {
                            setSearchInwardDate(e.target.value);
                          }}
                        />
                      </th> */}

            </tr>
          </thead>
          <tbody className="border-2">
            {allData.data.map((dataObj, index) => (
              <tr
                key={index}
                className="border-2 table-row "
                onClick={() => onClick(dataObj.id)}>
                <td className='py-1'>{(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                <td className='py-1'>{dataObj.docId} </td>
                <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.createdAt)} </td>
                <td className='py-1'>{dataObj.supplier.name}</td>
                <td className='py-1'>{dataObj.poType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        pageClassName={"border custom-circle text-center "}
        disabledClassName={"p-1 bg-gray-200"}
        previousLinkClassName={"border p-1 text-center"}
        nextLinkClassName={"border p-1"}
        activeClassName={"bg-blue-900 text-white px-2 "} />
    </div>
  )
}

export default PurchaseInwardFormReport
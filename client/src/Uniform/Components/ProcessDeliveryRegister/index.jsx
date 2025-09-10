import React, { Fragment, useRef } from 'react'
import { useEffect, useState } from "react";
import { Loader } from "../../../Basic/components";
import { getDateFromDateTimeToDisplay, getItemFullNameFromShortCode, substract } from "../../../Utils/helper";
import { showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import YarnPoItemSelection from './YarnPoItemSelection';
import FabricPoItemSelection from './FabricPoItemSelection';
import { useGetPartyQuery } from '../../../redux/ErpServices/PartyMasterServices';
import parameterIcon from "../../../assets/icons8-filter.gif"
import Modal from '../../../UiComponents/Modal';
import Parameter from './Parameter';
import { exportFileToCsv } from "../../../Utils/excelHelper"
import { ExcelButton } from '../../../Buttons';
import { useGetProcessDeliveryQuery, useGetProcessDeliveryByIdQuery } from '../../../redux/ErpServices/ProcessDeliveryServices';


const ProcessDeliveryRegister = () => {
  const [partyId, setPartyId] = useState("");
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [parameter, setParameter] = useState(false);

  const [excelData, setExcelData] = useState([]);


  const [filterParties, setFilterParties] = useState([])
  const [filterPoTypes, setFilterPoTypes] = useState([])
  const [filterProcess, setFilterProcess] = useState([])

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )
  const [poNo, setPoNo] = useState("");
  const [searchPoDate, setPoDate] = useState("");
  const [searchDueDate, setDueDate] = useState("");
  const [searchPoType, setSearchPoType] = useState("");
  const [supplier, setSupplier] = useState("");
  const [dataPerPage, setDataPerPage] = useState("10");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  const [currentSelectedProcessDetail, setCurrentSelectedProcessDetail] = useState("");

  const [currentDownloadProcessDetailItem, setCurrentDownloadProcessDetailItem] = useState("");



  const handleOnclick = (e) => {
    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
  }
  const searchFields = { searchDocId: poNo, searchPoDate, searchSupplierAliasName: supplier, searchPoType, searchDueDate }

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )

  const { data: supplierList, isLoading: isSupplierLoading, isFetching: isSupplierFetching } =
    useGetPartyQuery({ params: { companyId, active: true } });


  const { data: paginatedData, isLoading, isFetching } = useGetProcessDeliveryQuery({
    params: {
      branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber, supplierId: partyId, startDate, endDate,
      filterParties: filterParties.map(item => item.value),
      filterPoTypes: filterPoTypes.map(item => item.value),
      filterProcess: filterProcess.map(item => item.value),
    }
  });

  const { data: allData, isLoading: isAllDataLoading, isFetching: isAllDataFetching } = useGetProcessDeliveryQuery({
    params: {
      branchId, ...searchFields,
      supplierId: partyId, startDate, endDate,
      filterParties: filterParties.map(item => item.value),
      filterPoTypes: filterPoTypes.map(item => item.value),
      filterProcess: filterProcess.map(item => item.value),
    }
  })
  useEffect(() => {
    setCurrentPageNumber(1);
  }, [filterParties, filterPoTypes, partyId, startDate, endDate, filterProcess])
  useEffect(() => {
    if (paginatedData?.totalCount) {
      setTotalCount(paginatedData?.totalCount)
    } else {
      setTotalCount(0)
    }
  }, [paginatedData, isLoading, isFetching])

  useEffect(() => {
    setCurrentPageNumber(1)
  }, [dataPerPage, poNo, searchPoDate, supplier, searchPoType, searchDueDate])

  const allSuppliers = supplierList ? supplierList.data : []

  const tableRef = useRef(null);

  const { data: processDeliveryDetails } = useGetProcessDeliveryByIdQuery({ id: currentSelectedProcessDetail, params: { includeProcess: true } }, { skip: !currentSelectedProcessDetail });

  useEffect(() => {
    if (!processDeliveryDetails?.data || !currentDownloadProcessDetailItem) return
    let excelPoItems = processDeliveryDetails.data.ProcessDeliveryProgramDetails.map(programItem => {
      let programQty = parseFloat(programItem.qty).toFixed(3)
      let balanceQty = substract(programQty, programItem.alreadyInwardedQty).toFixed(3)
      let balBillQty = substract(programItem.alreadyInwardedQty, programItem.alreadyBillQty);
      balBillQty = balBillQty > 0 ? balBillQty : 0
      const programType = getItemFullNameFromShortCode(processDeliveryDetails.data.Process.io)
      let newItem = {}
      if (programType === "GreyYarn" || programType === "DyedYarn") {
        newItem["Item"] = programItem.Yarn.aliasName;
      } else if (programType === "GreyFabric" || programType === "DyedFabric") {
        newItem["Item"] = programItem.Fabric.aliasName;
        newItem["Design"] = programItem.Design.name;
        newItem["Gauge"] = programItem.Gauge.name;
        newItem["K-Dia"] = programItem.KDia.name;
        newItem["F-Dia"] = programItem.FDia.name;
      }
      newItem["Uom"] = programItem.Uom.name
      newItem["Color"] = programItem.Color.name
      newItem["Program Qty"] = programQty;
      newItem["Inward Qty"] = programItem.alreadyInwardedQty;
      newItem["Balance Qty"] = balanceQty;
      newItem["Bill Qty"] = programItem?.alreadyBillQty;
      newItem["Bal. Bill Qty"] = balBillQty;
      return newItem
    })
    exportFileToCsv([{ "Program No": processDeliveryDetails.data.docId, "Supplier": processDeliveryDetails?.data?.supplier?.aliasName }, ...excelPoItems,], `${processDeliveryDetails.data.docId}`);
    setCurrentDownloadProcessDetailItem("");
  }, [processDeliveryDetails, currentDownloadProcessDetailItem])

  useEffect(() => {
    if (allData?.data) {
      setExcelData(allData.data.map(item => {
        let newItem = {};
        newItem["Doc Id"] = item?.docId;
        newItem["Doc. Date"] = getDateFromDateTimeToDisplay(item?.createdAt);
        newItem["Supplier"] = item?.supplier?.aliasName;
        newItem["Process"] = item?.Process?.name;
        newItem["Due Date"] = getDateFromDateTimeToDisplay(item?.dueDate);
        newItem["Program Qty"] = item?.programQty ? item?.programQty : 0;
        return newItem
      }))
    }
  }, [allData, isAllDataLoading, isAllDataFetching])

  if (isLoading || isFetching || isSupplierFetching || isSupplierLoading || isAllDataFetching || isAllDataLoading) return <Loader />

  const isLoadingIndicator = isLoading || isFetching
  const programItemType = processDeliveryDetails?.data?.Process?.io ? getItemFullNameFromShortCode(processDeliveryDetails?.data?.Process?.io.split("_")[1]) : ""
  const rawMaterialType = processDeliveryDetails?.data?.Process?.io ? getItemFullNameFromShortCode(processDeliveryDetails?.data?.Process?.io.split("_")[0]) : ""
  return (
    <>
      <Modal isOpen={parameter} widthClass={"bg-gray-200"} onClose={() => { setParameter(false) }} >
        <Parameter onClose={() => { setParameter(false) }} startDate={startDate} setStartDate={setStartDate} allSuppliers={allSuppliers} endDate={endDate} setEndDate={setEndDate}
          filterPoTypes={filterPoTypes} setFilterPoTypes={setFilterPoTypes}
          filterParties={filterParties} setFilterParties={setFilterParties}
          partyId={partyId} setPartyId={setPartyId}
          filterProcess={filterProcess} setFilterProcess={setFilterProcess}
        />
      </Modal>
      <div className="flex flex-col w-full h-[95%] overflow-auto">
        <div className="flex items-center justify-between w-full page-heading p-1 text-black">
          <div className="heading text-center whitespace-nowrap">Process Register</div>
          <span className='flex gap-4'>
            <ExcelButton onClick={() => exportFileToCsv(excelData, "Process Register")} width={40} />
            <button className='w-7 h-8' onClick={() => setParameter(true)}>
              <img src={parameterIcon} alt='parameter' />
            </button>
            <div className=" sub-heading justify-center md:justify-start items-center w-72 flex">
              <p className="text-white text-sm rounded-md m-1  border-none">Show Entries</p>
              <select value={dataPerPage}
                onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded mr-9'>
                {showEntries.map((option, index) => <option key={index} value={option.value} >{option.show}</option>)}
              </select>
            </div>
          </span>
        </div>
        <>
          <div
            className="h-[500px] overflow-auto"
          >
            <table ref={tableRef} id="table-to-xls" className="table-fixed text-center w-full">
              <thead className=" table-header">
                <tr className='h-2'>
                  <th
                    className="  top-0 stick-bg w-10">
                    S. no.
                  </th>
                  <th
                    className="  top-0 stick-bg table-data "
                  >
                    <label>Doc. Id</label>
                  </th>
                  <th
                    className="  top-0 stick-bg table-data"
                  >
                    <label>Doc. Date</label>
                  </th>
                  <th

                    className=" table-data top-0 stick-bg "
                  >
                    <label>Supplier</label>
                  </th>
                  <th
                    className="  top-0 stick-bg table-data "
                  >
                    <label>Process</label>
                  </th>
                  <th className="  top-0 stick-bg table-data">
                    <label>Due Date</label>
                  </th>
                  <th className="  top-0 stick-bg table-data">
                    Qty
                  </th>
                  <th className=" top-0 stick-bg table-data w-10">
                  </th>
                </tr>
              </thead>
              {isLoadingIndicator ?
                <tbody>
                  <tr>
                    <td>
                      <Loader />
                    </td>
                  </tr>
                </tbody>
                :
                <tbody className="">
                  {paginatedData.data.map((dataObj, index) => (
                    <Fragment key={index}>
                      <tr
                        className={` table-row ${(currentSelectedProcessDetail === dataObj.id) ? "border-2 border-black" : ""}`}
                        onClick={() => {
                          if (currentSelectedProcessDetail === dataObj.id) {
                            setCurrentSelectedProcessDetail("")
                          } else {
                            setCurrentSelectedProcessDetail(dataObj.id)
                          }
                        }}>
                        <td className='py-1 '> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                        <td className='py-1 text-left'> {dataObj.docId}</td>
                        <td className='py-1 text-left'>{getDateFromDateTimeToDisplay(dataObj.createdAt)} </td>
                        <td className='py-1 text-left'>{dataObj?.supplier?.aliasName}</td>
                        <td className='py-1 text-left'>{dataObj?.Process?.name}</td>
                        <td className='py-1 text-left'>{getDateFromDateTimeToDisplay(dataObj.dueDate)}</td>
                        <td className='py-1 text-right'>{(dataObj?.programQty ? dataObj?.programQty : 0).toFixed(3)}</td>
                        <td className='py-1 text-center w-8'>
                          <ExcelButton onClick={(e) => {
                            e.stopPropagation();
                            setCurrentDownloadProcessDetailItem(dataObj.id);
                          }} width={18} />
                        </td>
                      </tr>
                      {((currentSelectedProcessDetail === dataObj.id))
                        &&
                        <tr className={""}>
                          <td colSpan={8}>
                            {(programItemType === "GreyYarn") || (programItemType === "DyedYarn") ?
                              <YarnPoItemSelection id={dataObj.id} rawMaterialType={rawMaterialType} dataObj={dataObj} />
                              :
                              <>
                                {(programItemType === "GreyFabric") || (programItemType === "DyedFabric") ?
                                  <FabricPoItemSelection id={dataObj.id} rawMaterialType={rawMaterialType} dataObj={dataObj} />
                                  :
                                  <></>
                                }
                              </>
                            }
                          </td>
                        </tr>
                      }
                    </Fragment>
                  ))}
                </tbody>
              }
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
    </>
  )
}

export default ProcessDeliveryRegister
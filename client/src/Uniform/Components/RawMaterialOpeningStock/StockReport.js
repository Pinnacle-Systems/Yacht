import React from 'react'
import { useEffect, useState } from "react";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService"
import { Loader } from "../../../Basic/components";
import { findFromList, getCommonParams, getDateFromDateTimeToDisplay } from "../../../Utils/helper";
import { showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import {
  useGetRawMaterialOpeningStockQuery
} from "../../../redux/uniformService/RawMaterialOpeningStockServices"
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import { DateInput, DropdownInput } from '../../../Inputs';
import { poTypes } from '../../../Utils/DropdownData';
import { dropDownListObject } from '../../../Utils/contructObject';
import { useGetBranchQuery } from '../../../redux/services/BranchMasterService';
import { useGetLocationMasterQuery } from '../../../redux/uniformService/LocationMasterServices';
import moment from 'moment';
import AccessoryPoItems from './AccessoryPoItems';
import FabricStockFormReport from './FabricStockFormReport';
import AccessoryStockFormReport from './AccessoryStockFormreport';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';


const StockReport = ({

  onClick,id
  
}) => {
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

  const [rawMaterialType, setRawMaterialType] = useState("");
    const [storeId, setStoreId] = useState("")
    const [locationId, setLocationId] = useState('');
  const [searchValue, setSearchValue] = useState("");
  const [endDate, setEndDate] = useState(null)

  const handleOnclick = (e) => {
    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
  }
  const searchFields = { searchDocId: poNo, searchPoDate, searchSupplierAliasName: supplier, searchPoType, searchDueDate }

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )


  
  const { finYearId } = getCommonParams()

  const params = {
    branchId, companyId
  };
  
  const { data: allData, isLoading, isFetching } = useGetRawMaterialOpeningStockQuery(
    { params: { branchId, ...searchFields, 
        pagination: true, dataPerPage,
         pageNumber: currentPageNumber, finYearId,
         endDate: moment(endDate).format('YYYY-MM-DD'),
         stock:true,rawMaterialType,storeId
        } });
       console.log(endDate,"endDate")

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const { data: locationData } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });
  const storeOptions = locationData ?
  locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
  [];

  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });

  useEffect(() => {
    if (allData?.totalCount) {
      setTotalCount(allData?.totalCount)
    }
  }, [allData, isLoading, isFetching])


  const isLoadingIndicator = isLoading || isFetching

  console.log(rawMaterialType,"rawMaterialType")


  return (
    <div className="flex flex-col w-full h-[95%] overflow-auto" >
    <div className="md:flex md:items-center  page-heading p-1">
      <div className="heading text-center md:mx-10">STOCK ITEMS</div>
      <div className='w-[150px] '>
                   <DropdownInput name=" Material Type"
                                        options={poTypes}
                                        value={rawMaterialType} setValue={setRawMaterialType}   />
        </div>
        <div className='w-[150px]'>
              <DropdownInput name="Location"
                                      options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
                                      value={locationId}
                                      setValue={(value) => { setLocationId(value); setStoreId("") }}
                                     />  

        </div>
        <div className='w-[200px]'>
            <DropdownInput name="Store"
                            options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
                            value={storeId} setValue={setStoreId} />
                     
        </div>
        <div>
        <DateInput  className='w-[150px]'
                            name="Date"
                            value={endDate}
                            setValue={setEndDate}
                            dateFormat="dd-MM-yyyy"
                            position={"bottom"}
                        />
        </div>
    
                 
{/* 
      <div className=" sub-heading justify-center md:justify-start items-center">
        <label className="text-white text-sm rounded-md m-1  border-none">Show Entries</label>
        <select value={dataPerPage}
          onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-[100px] border border-gray-500 rounded mr-9'>
          {showEntries.map((option) => <option value={option.value} >{option.show}</option>)}
        </select>
      </div> */}
      <div>
        <ReactHTMLTableToExcel
                            id="test-table-xls-button"
                            className="download-table-xls-button text-white bg-blue-400 p-2 text-xs "
                            table="table-to-xls"
                            filename="tablexls"
                            sheet="tablexls"
                            buttonText='Download to excel'
                        >

        </ReactHTMLTableToExcel>
        </div>

    </div>
    <>
      <div
        className="h-[500px] overflow-auto"
       >
          { (rawMaterialType === "DyedFabric")
                            ?
                        <FabricStockFormReport allData={endDate ? allData : []}  rawMaterialType={rawMaterialType}
                         currentPageNumber={currentPageNumber}  totalCount={totalCount}
                          dataPerPage={dataPerPage} setCurrentPageNumber={setCurrentPageNumber}/>
                           :
                           <AccessoryStockFormReport
                           allData={endDate ? allData : []}  rawMaterialType={rawMaterialType}
                           />
                              
                                
                              
                         
}
      </div>
    </>
    {/* <ReactPaginate
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
      activeClassName={"bg-blue-900 text-white px-2"} /> */}
  </div>
  )
}

export default StockReport
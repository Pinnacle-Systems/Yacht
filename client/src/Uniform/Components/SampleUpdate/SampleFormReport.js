import React from 'react'
import { useEffect, useState } from "react";
import { TablePagination } from '@mui/material';
import { Loader } from "../../../Basic/components";
import { showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import { findFromList, getDateFromDateTimeToDisplay, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';


import { useGetPurchaseBillQuery } from '../../../redux/services/PurchaseBillService';
import { useGetSampleQuery } from '../../../redux/uniformService/SampleService';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { CLOSE_ICON, TICK_ICON } from '../../../icons';


const SampleFormReport = ({
    onClick,
}) => {
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const [searchDocId, setSearchDocId] = useState("");
    const [searchBillDate, setSearchBillDate] = useState("");

    const [searchFabricId, setSearchFabricId] = useState("");
    const [searchStyleId, setSearchStyleId] = useState("");
    const [searchValidDate, setSearchValidDate] = useState("");
    const [searchSchool, setSearchSchool] = useState("");
    const [searchContact, setSearchContact] = useState("")
    const [searchContactName, setSearchContactName] = useState("");
    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [searchSupplierDcDate, setSearchSupplierDcDate] = useState("")
    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }
    const searchFields = { searchSchool, searchContact, searchContactName, searchDocId, searchBillDate, searchValidDate }

    useEffect(() => { setCurrentPageNumber(1) }, [dataPerPage, searchSchool, searchContact, searchContactName])

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const params = {
        branchId, companyId
    };




    const { data: allData, isLoading, isFetching } = useGetSampleQuery({ params: { branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber } });

    const { data: partyList, isLoading: isPartyLoading, isFetching: isPartyFetching } =
        useGetPartyQuery({ params: { ...params } });

    useEffect(() => {
        if (allData?.totalCount) {
            setTotalCount(allData?.totalCount)
        }
    }, [allData, isLoading, isFetching])

    useEffect(() => {
        let registrationFormReportComponent = document.getElementById("registrationFormReport");
        registrationFormReportComponent.addEventListener('keydown', function (ev) {
            var focusableElementsString = '[tabindex="0"]';
            let ol = document.querySelectorAll(focusableElementsString);
            if (ev.key === "ArrowDown") {
                for (let i = 0; i < ol.length; i++) {
                    if (ol[i] === ev.target) {
                        let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
                        o.focus(); break;
                    }
                }
                ev.preventDefault();
            } else if (ev.key === "ArrowUp") {
                for (let i = 0; i < ol.length; i++) {
                    if (ol[i] === ev.target) {
                        let o = ol[i - 1];
                        o.focus(); break;
                    }
                }
                ev.preventDefault();
            }
        });
        return () => {
            registrationFormReportComponent.removeEventListener('keydown', () => { });
        };
    }, []);

    const isLoadingIndicator = isLoading || isFetching || isPartyLoading || isPartyFetching
    const handleChange = (event, value) => {
        setCurrentPageNumber(value);
    };
    const handleChangeRowsPerPage = (event) => {
        setDataPerPage(parseInt(event.target.value, 10));
        setCurrentPageNumber(0);
    };

    return (
        <div id='registrationFormReport' className="flex flex-col w-full h-[95%] overflow-auto">
            <div className="md:flex md:items-center md:justify-between page-heading p-1">
                <div className="heading text-center md:mx-10">Sample Form Report </div>
                <div className=" sub-heading justify-center md:justify-start items-center">
                    <label className="text-white text-sm rounded-md m-1  border-none">Show Entries</label>
                    <select value={dataPerPage}
                        onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded mr-9'>
                        {showEntries.map((option, index) => <option key={index} value={option.value} >{option.show}</option>)}
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
                                    <div>DocId</div><input
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
                                    <div>Sample. Date</div><input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchBillDate}
                                        onChange={(e) => {
                                            setSearchBillDate(e.target.value);
                                        }}
                                    />
                                </th>
                                <th

                                    className="border-2  top-0 stick-bg flex flex-col"
                                >
                                    <div>School</div><input
                                        type="text"
                                        className="text-black  h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchSchool}
                                        onChange={(e) => {
                                            setSearchSchool(e.target.value);
                                        }}
                                    />
                                </th>
                                <th

                                    className="border-2  top-0 stick-bg flex-col"
                                >
                                    <div>ContactName</div><input
                                        type="text"
                                        className="text-black  h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchContactName}
                                        onChange={(e) => {
                                            setSearchContactName(e.target.value);
                                        }}
                                    />
                                </th>
                                <th

                                    className="border-2  top-0 stick-bg flex flex-col"
                                >
                                    <div>Contact</div><input
                                        type="text"
                                        className="text-black  h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchContact}
                                        onChange={(e) => {
                                            setSearchContact(e.target.value);
                                        }}
                                    />
                                </th>
                                {/* <th
                                    className="border-2  top-0 stick-bg"
                                >
                                    <div>FabricName</div><input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchFabricId}
                                        onChange={(e) => {
                                            setSearchFabricId(e.target.value);
                                        }}
                                    />
                                </th>

                                <th
                                    className="border-2  top-0 stick-bg"
                                >
                                    <div>Style</div><input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchStyleId}
                                        onChange={(e) => {
                                            setSearchStyleId(e.target.value);
                                        }}
                                    />
                                </th> */}
                                <th
                                    className="border-2  top-0 stick-bg"
                                >
                                    <div>ValidDate</div><input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchValidDate}
                                        onChange={(e) => {
                                            setSearchValidDate(e.target.value);
                                        }}
                                    />
                                </th>

                                <th
                                    className="border-2  top-0 stick-bg"
                                >
                                    <div>IsCompleted</div>
                                </th>


                            </tr>
                        </thead>

                        <tbody className="border-2">
                            {(allData?.data ? allData?.data : []).map((dataObj, index) => (
                                <tr
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            onClick(dataObj.id);
                                        }
                                    }}
                                    tabIndex={0}
                                    key={dataObj.id}
                                    className="border-2 table-row cursor-pointer"
                                    onClick={() => onClick(dataObj.id)}>
                                    <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                                    <td className='py-1'> {dataObj.docId}</td>
                                    <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.createdAt)} </td>
                                    <td className='py-1'>{dataObj.Party?.name}</td>
                                    <td className='py-1'>{dataObj.Party?.contactPersonName || dataObj?.contactPersonName}</td>
                                    <td className='py-1'>{dataObj.Party?.contactMobile || dataObj?.phone}</td>
                                    {/* <td className='py-1'>{dataObj.Fabric?.name}</td>
                                    <td className='py-1'>{dataObj.Style?.name}</td> */}
                                    <td className='py-1'>{getDateFromDateTimeToDisplay(dataObj.validDate)}</td>
                                    <td className='py-1'>{dataObj?.sampleSubmitBy ? <span className='bg-green-500 text-white p-0.5'>{TICK_ICON} </span> : <span className='bg-red-500 text-white px-1 py-0.5'>{CLOSE_ICON} </span>}</td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </>
            <TablePagination
                component="div"
                count={totalCount}
                page={currentPageNumber - 1}
                onPageChange={(e, value) => { handleChange(e, value + 1) }}
                rowsPerPage={dataPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            // previousLabel={"<"}
            // nextLabel={">"}
            // breakLabel={"..."}
            // forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
            // pageCount={Math.ceil(totalCount / dataPerPage)}
            // marginPagesDisplayed={1}
            // onPageChange={handleOnclick}
            // containerClassName="flex space-x-2 py-2"
            // pageClassName="border border-gray-300 rounded px-3 py-1 bg-sky-800 hover:bg-blue-700 transition duration-200"
            // breakClassName="border border-gray-300 rounded px-3 py-1 text-gray-500 bg-gray-50"
            // disabledClassName="p-1 bg-gray-200 text-gray-500 cursor-not-allowed"
            // previousLinkClassName="border border-gray-300 rounded px-3 py-1 bg-white hover:bg-blue-700 transition duration-200"
            // nextLinkClassName="border border-gray-300 rounded px-3 py-1 bg-white hover:bg-blue-700 transition duration-200"
            // activeClassName="bg-blue-500 text-white border border-blue-500 rounded px-3 py-1"
            />
        </div>
    )
}

export default SampleFormReport
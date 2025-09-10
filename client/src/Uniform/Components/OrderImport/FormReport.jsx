import React from 'react'

import { useEffect, useState } from "react";
import { Loader } from "../../../Basic/components";
import { getCommonParams } from "../../../Utils/helper";
import { showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import {
    useGetOrderImportQuery
} from "../../../redux/services/OrderImportService"
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import { TablePagination } from '@mui/material';

const FormReport = ({
    heading,
    onClick,
}) => {
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const [searchDocId, setSearchDocId] = useState("");
    const [searchDocDate, setSearchDocDate] = useState("");
    const [searchPhaseName, setSearchPhaseName] = useState("");
    const [searchProjectName, setSearchProjectName] = useState("");
    const [supplier, setSupplier] = useState("");
    const [order, setOrder] = useState("");

    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }
    const searchFields = { searchDocId, searchDocDate, searchSupplierName: supplier, searchOrderId: order }

    const { finYearId } = getCommonParams()

    const { data: allData, isLoading, isFetching } = useGetOrderImportQuery({ params: { branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber, finYearId } });


    useEffect(() => {
        if (allData?.totalCount) {
            setTotalCount(allData?.totalCount)
        }
    }, [allData, isLoading, isFetching])
    const handleChange = (event, value) => {
        setCurrentPageNumber(value);
    };
    const handleChangeRowsPerPage = (event) => {
        setDataPerPage(parseInt(event.target.value, 10));
        setCurrentPageNumber(0);
    };

    const isLoadingIndicator = isLoading || isFetching


    return (
        <div className="flex flex-col w-full h-[95%] overflow-auto" >
            <div className="md:flex md:items-center md:justify-between page-heading p-1">
                <div className="heading text-center md:mx-10">{heading}</div>
                <div className=" sub-heading justify-center md:justify-start items-center">
                    <label className="text-gray-700 text-sm rounded-md m-1  border-none">Show Entries</label>
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
                                    className="border-2  top-0 stick-bg w-10">
                                    S. no.
                                </th>
                                <th
                                    className="border-2  top-0 stick-bg"
                                >
                                    <label>Doc Id</label><input
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
                                    <label>Doc. Date</label><input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={searchDocDate}
                                        onChange={(e) => {
                                            setSearchDocDate(e.target.value);
                                        }}
                                    />
                                </th>
                                {/* <th
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
                                    <label>Order</label><input
                                        type="text"
                                        className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                        placeholder="Search"
                                        value={order}
                                        onChange={(e) => {
                                            setOrder(e.target.value);
                                        }}
                                    />
                                </th> */}

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
                            <tbody className="border-2">
                                {allData.data.map((dataObj, index) => (
                                    <tr
                                        key={dataObj.id}
                                        className="border-2 table-row "
                                        onClick={() => onClick(dataObj.id)}>
                                        <td className='py-1'> {(index + 1) + (dataPerPage * (currentPageNumber - 1))}</td>
                                        <td className='py-1'> {dataObj.docId}</td>
                                        <td className='py-1'>{dataObj?.docDate} </td>
                                        {/* <td className='py-1'>{dataObj?.Party?.name}</td>

                                        <td className="py-1">{dataObj?.Order?.docId}</td> */}

                                    </tr>
                                ))}
                            </tbody>
                        }
                    </table>
                </div>
            </>
            <TablePagination
                component="div"
                count={totalCount}
                page={currentPageNumber}
                onPageChange={handleChange}
                rowsPerPage={dataPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </div>
    )
}

export default FormReport
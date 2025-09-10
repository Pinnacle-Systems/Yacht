
import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";
import {
    useGetPartyQuery,
    useGetPartyByIdQuery,
} from "../../../redux/services/PartyMasterService";

import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { EMPTY_ICON } from "../../../icons";
import { Loader } from "../../../Basic/components";
import { findFromList, getDateFromDateTime } from "../../../Utils/helper";

import secureLocalStorage from "react-secure-storage";
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import { useGetCuttingOrderQuery } from '../../../redux/uniformService/CuttingOrderService'


import { showEntries } from "../../../Utils/DropdownData";

const CuttingOrderFormReport = ({
    setFillGrid, setCuttingOrderId, styleId, supplierId, isCuttingDeliveryFilter, isCuttingReceiptFilter
}) => {



    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    );
    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    );
    const params = {
        branchId,
        companyId,
    };




    const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
    // const allSuppliers = supplierList ? supplierList.data : [];


    const {
        data: styleList,
        isLoading: isStyleLoading,
        isFetching: isStyleFetching,
    } = useGetStyleMasterQuery({ params });

    const [searchDocId, setSearchDocId] = useState("");
    const [searchDocDate, setSearchDocDate] = useState("");
    const [searchStyle, setSearchStyle] = useState("");
    const [supplier, setSupplier] = useState("");


    const [id, setId] = useState("");

    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }
    const searchFields = { searchDocId, searchDocDate, searchSupplierAliasName: supplier, searchStyle }
    const { data: allData, isLoading, isFetching } = useGetCuttingOrderQuery({
        params: {
            branchId, ...searchFields, pagination: true, dataPerPage,
            pageNumber: currentPageNumber, supplierId, isCuttingDeliveryFilter, isCuttingReceiptFilter
        }
    });


    useEffect(() => {
        if (allData?.totalCount) {
            setTotalCount(allData?.totalCount)
        }
    }, [allData, isLoading, isFetching])
    if (!supplierList || !styleList || !allData) {
        return (
            <tr>
                <td>
                    <Loader />
                </td>
            </tr>
        );
    }
    return (
        <div className="flex flex-col w-full h-[95%] overflow-auto">
            <div className="md:flex md:items-center md:justify-between page-heading p-2">
                <div className="heading text-center md:mx-10">Cutting Order Items</div>
                <div className="flex sub-heading justify-center md:justify-start items-center">
                    <label className="text-white text-sm rounded-md m-1  border-none">
                        Show Entries
                    </label>
                    <select
                        value={dataPerPage}
                        onChange={(e) => setDataPerPage(e.target.value)}
                        className="h-6 w-40 border border-gray-500 rounded"
                    >
                        {showEntries.map((option) => (
                            <option value={option.value}>{option.show}</option>
                        ))}
                    </select>


                </div>
            </div>

            <div
                className="h-[500px] overflow-auto "

            >


                <table className="table-fixed text-center w-full">
                    <thead className="border-2 table-header ">
                        <tr className='h-2'>
                            <th className="border-2  top-0 stick-bg ">
                                <label>Doc.Id</label>
                                <input
                                    type="text"
                                    className="text-black h-6 focus:outline-none border md:ml-3  border-gray-400 rounded-lg"
                                    placeholder="Search"
                                    value={searchDocId}
                                    onChange={(e) => {
                                        setSearchDocId(e.target.value);
                                    }}
                                />
                            </th>
                            <th className="border-2  top-0 stick-bg ">
                                <label>Doc.Date</label>
                                <input
                                    type="text"
                                    className="text-black h-6 focus:outline-none border md:ml-3  border-gray-400 rounded-lg"
                                    placeholder="Search"
                                    value={searchDocDate}
                                    onChange={(e) => {
                                        setSearchDocDate(e.target.value);
                                    }}
                                />
                            </th>
                            {/* <th className="border-2  top-0 stick-bg ">
                                <label>Style</label>
                                <input
                                    type="text"
                                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                    placeholder="Search"
                                    value={searchStyle}
                                    onChange={(e) => {
                                        setSearchStyle(e.target.value);
                                    }}
                                />
                            </th> */}
                            <th className="border-2  top-0 stick-bg ">
                                <label>Supplier</label>
                                <input
                                    type="text"
                                    className="text-black h-6 focus:outline-none border md:ml-3 border-gray-400 rounded-lg"
                                    placeholder="Search"
                                    value={supplier}
                                    onChange={(e) => {
                                        setSupplier(e.target.value);
                                    }}
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="border-2">
                        {allData?.data?.map((dataObj, index) => (
                            <tr
                                key={index}
                                className="border-2 table-row "
                                onClick={() => { setCuttingOrderId(dataObj.id); setFillGrid(false); }}
                            >
                                <td className="py-1"> {dataObj.docId}</td>
                                <td className="py-1">
                                    {getDateFromDateTime(dataObj.createdAt)}{" "}
                                </td>
                                {/* <td className="py-1">
                                    {findFromList(
                                        dataObj.styleId,
                                        styleList.data,
                                        "name"
                                    )}
                                </td> */}

                                <td className="py-1">
                                    {findFromList(
                                        dataObj.partyId,
                                        supplierList.data,
                                        "aliasName"
                                    )}
                                </td>
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
                pageClassName={"border custom-circle text-center"}
                disabledClassName={"p-1 bg-gray-200"}
                previousLinkClassName={"border p-1 text-center"}
                nextLinkClassName={"border p-1"}
                activeClassName={"bg-blue-900 text-white px-2"} />
        </div>
    );
};

export default CuttingOrderFormReport;

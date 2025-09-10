import React, { useState } from 'react'
// import Loader from '../Loader';

import { Power, Table } from 'lucide-react';
import { FaTableList } from "react-icons/fa6";
import { RiPlayListAddLine } from "react-icons/ri";
import moment from 'moment';
import Loader from '../../../Components/Loader';
import { findFromList } from '../../../Utils/helper';
import "./LocationTable.css"


const ACTIVE = (
    //  <div className='flex items-center rounded-full  w-50 justify-center py-1 text-[#16A34A]'>
    //    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>

    //      Active 
    //     <div >
    //     <ToggleButton name="Status" value={true} />
    // </div> 


    //    <button
    //   className={`w-16 h-6 p-1 rounded-pill transition-all duration-300 bg-green-500 py-1 shadow-inner`}
    // >
    //   <div
    //     className={`w-4 h-4 bg-white rounded-pill shadow transform transition-all translate-x-10 -translate-y-0 relative flex items-center`}
    //   >
    //     <span className='absolute -left-8.5 text-[10px] text-white'>Active</span></div>
    // </button>

    //     <span
    //     className={`px-2   text-white rounded-circle d-inline transition-all bg-green-500 shadow-inner shadow-green-600 my-1`}
    //   >

    //    <Power />


    //   </span>

    <div className='bg-white p-0.5 ml-3 d-inline-block rounded-circle border-2 border-green-500 shadow-inner shadow-gray-300 my-1 text-gray-500'>
        <Power size={10} />
    </div>

    //</div> 

    // <button className="btn btn-success button btn-sm disabled">ACTIVE</button>
);
const INACTIVE = (
    // <div className='flex items-center rounded-full  w-50 justify-center py-1 text-[#cc0404] '>
    //     <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>

    //     Inactive
    // </div>


    //     <button
    //     className={`w-[69px] h-6 p-1 rounded-pill transition-all duration-300  bg-[#D73B2C] py-1 shadow-inner`}
    //   >
    //     <div
    //       className={`w-4 h-4 bg-white rounded-pill shadow transform transition-all translate-x-0 -translate-y-0 relative flex items-center`}
    //     ><span className='absolute text-[10px] left-4.5 text-white'>Inactive</span></div>
    //   </button>


    // <span
    // className={`px-2 py-0.5 text-white rounded-pill text-[10px] transition-all bg-red-500 my-1`}
    // >
    //  Inactive
    // </span>


    <div className='bg-white p-0.5 ml-3 d-inline-block rounded-circle border-2 border-red-500 text-gray-500 my-1'>
        <Power size={10} />
    </div>


    // <div>
    //     <ToggleButton name="Status" value={false} />
    // </div>
    // <button className="rounded-md text-white bg-red-500 border p-1 disabled">INACTIVE</button>
);
const EXPIRED = (
    <button className="rounded-md text-white bg-gray-500 border p-1 disabled">EXPIRED</button>
);
const ACTIVE_PLAN = (
    <button className="rounded-md text-white bg-blue-600 border p-1 disabled">ACTIVE</button>
);

const Mastertable = ({
    tableHeaders,
    tableDataNames,
    setId,
    data,
    loading,
    searchValue,
    setSearchValue,
    setOpenTable,
    header,
    setForm,
    onDataClick,
    branchList
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Calculate total pages
    const totalPages = Math.ceil(data?.length / rowsPerPage);

    // Get current page data
    const currentData = data?.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    return (
        <div className="row w-full mx-auto">
            <div className="text-xs col-12 px-0 bg-light bg-opacity-15 rounded-lg border shadow-md">

                <div className="flex justify-between mx-3 items-center py-1">
                    <div className='text-normal flex items-center text-gray-600'>
                        {/* <FaTableList size={20} /> */}
                        {/* <Table size={20}/> */}
                        <RiPlayListAddLine size={20} className=' mr-0.5'/>
                         &nbsp; <div className='my-0'>
                        <div className=' text-[13px] text-black my-0'>{header}</div>
                        {/* <div  className=' text-[9px]'>List of employees</div> */}
                        </div>
                        </div>
                    <div className="flex items-center">
                        <input
                            type="text"
                            className="text-sm bg-gray-100 focus:outline-none border border-gray-300 w-full rounded-md px-2 py-1 text-normal"
                            id="id"
                            placeholder="Search"
                            value={searchValue}
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                            }}
                        />
                        <div className="flex items-center  ml-3">
                            <label className=" text-gray-700 text-normal text-nowrap mr-1">select rows:</label>
                            <select
                                className="ml-2 p-1 border text-normal bg-gray-100 border-gray-300 py-1.5 rounded-md"
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Reset to first page when changing rows per page
                                }}
                            >
                                {[10, 15, 20].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>


                {loading ? (
                    <Loader />
                ) : (
                    <>
                        {data.length === 0 ? (
                            <div className="flex-1 flex justify-center bg-white  text-gray-800 items-center text-xl py-3">
                                <p>No Data Found...! </p>
                            </div>
                        ) : <>
                            <div className=" bg-white overflow-auto custom-scrollbar border-y border-gray-300 h-[65vh]">
                                <table className="min-w-full  text-normal striped-table ">
                                    <thead>
                                        <tr className="bg-blue-gray-100 text-gray-700 text-[12px] border-b border-blue-gray-200 ">
                                            {tableHeaders.map((head, index) => (
                                                <th key={index} className={`py-2.5 ${head==="S.NO"?"ps-[18px]":"px-4"} text-left  border-r bg-gray-200`}>
                                                    {head}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="text-blue-gray-900 ">
                                    {data?.map((location, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-blue-gray-200 cursor-pointer h-[30px]" 
                                        onClick={() => onDataClick(location.id)}>
                                            <td className={`h-[30px]  border-r border-blue-gray-200 text-[11px]  ${data === "location.regNo" ? "font-semibold" : "font-normal"} ${(data === "location.active ? ACTIVE : INACTIVE")&& (header==="Employees list") ? "ps-[65px]" : `${data === "location.active ? ACTIVE : INACTIVE"?"ps-[35px]":"px-4"}`} `}>
                                                {index+1}
                                            </td>
                                            <td className={`h-[30px]  border-r border-blue-gray-200 text-[11px]  ${data === "location.regNo" ? "font-semibold" : "font-normal"} ${(data === "location.active ? ACTIVE : INACTIVE")&& (header==="Employees list") ? "ps-[65px]" : `${data === "location.active ? ACTIVE : INACTIVE"?"ps-[35px]":"px-4"}`} `} >
                                                {findFromList(location.locationId, branchList?.data, "branchName")}
                                            </td>
                                            <td className={`h-[30px] border-r border-blue-gray-200 text-[11px]  ${data === "location.regNo" ? "font-semibold" : "font-normal"} ${(data === "dataObj.active ? ACTIVE : INACTIVE")&& (header==="Employees list") ? "ps-[65px]" : `${data === "location.active ? ACTIVE : INACTIVE"?"ps-[35px]":"px-4"}`} `}>
                                                {location.storeName}
                                            </td >
                                            <td className={`h-[30px]  border-r border-blue-gray-200 text-[11px]  ${data === "location.regNo" ? "font-semibold" : "font-normal"} ${(data === "location.active ? ACTIVE : INACTIVE")&& (header==="Employees list") ? "ps-[65px]" : `${data === "location.active ? ACTIVE : INACTIVE"?"ps-[35px]":"px-4"}`} `}>
                                                {(location.active) ? ACTIVE : INACTIVE }
                                            </td>
                                            <td>
                                            </td>
                                            <td>
                                            </td>
                                            <td>
                                            </td>
                                            <td>
                                            </td>
                                            <td>
                                            </td>
                                            <td>
                                            </td>
                                            <td>
                                            </td>
                                            <td>
                                            </td>
                                            <td>
                                            </td>
                                            <td>
                                            </td>
                                            <td>
                                            </td>
                                    </tr>
                                ))}
                                    </tbody>

                                </table>
                            </div>
                            {/* Pagination Controls */}
                            <div className="flex justify-center items-center mt-2  my-2 text-normal font-semibold">
                                <button
                                    className={`text-xs text-stone-900 rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"}`}
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    &lt;&nbsp;
                                </button>

                                <span className="text-gray-700">
                                    {currentPage} / {totalPages}
                                </span>

                                <button
                                    className={`text-xs text-stone-900 rounded ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"}`}
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    &nbsp;&gt;
                                </button>
                            </div></>}</>




                )}

            </div>
        </div>
    );
}

export default Mastertable

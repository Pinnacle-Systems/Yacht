import React, { useState } from 'react'
import Loader from '../Loader';
import "./grid.css";
// import { ToggleButton } from '../Uis';
import { Power, Table } from 'lucide-react';
import { FaTableList } from "react-icons/fa6";
import { RiPlayListAddLine } from "react-icons/ri";


const ACTIVE = (

    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
        <Power size={10} />
    </div>



);
const INACTIVE = (



    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
        <Power size={10} />
    </div>



);
const EXPIRED = (
    <button className="rounded-md text-white bg-gray-500 border p-1 disabled">EXPIRED</button>
);
const ACTIVE_PLAN = (
    <button className="rounded-md text-white bg-blue-600 border p-1 disabled">ACTIVE</button>
);

export default function Form(
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
    onDataClick
){
   

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    const totalPages = Math.ceil(data?.length / rowsPerPage);


    const currentData = data?.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    return (
        <div className="row w-full mx-auto">
            <div className="text-xs col-12 px-0 bg-light bg-opacity-15 rounded-lg border shadow-md">

                <div className="flex justify-between mx-3 items-center py-1">
                    <div className='text-normal flex items-center text-gray-600'>
                        {/* <FaTableList size={20} /> */}
                        {/* <Table size={20}/> */}
                        <RiPlayListAddLine size={20} className=' mr-0.5' />
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
                        {data?.length === 0 ? (
                            <div className="flex-1 flex justify-center bg-white  text-gray-800 items-center text-xl py-3">
                                <p>No Data Found...! </p>
                            </div>
                        ) :
                         <>
                            <div className=" bg-white overflow-auto custom-scrollbar border-y border-gray-300 h-[65vh]">
                                <table className="min-w-full  text-normal striped-table">
                                    <thead>
                                        <tr className="bg-blue-gray-100 text-gray-700 text-[12px]  border-blue-gray-200 ">
                                            {tableHeaders?.map((head, index) => (
                                                <th key={index} className={`py-2.5 ${head === "S.NO" ? "ps-[18px]" : "px-4"} text-left  border-r bg-gray-200`}>
                                                    {head}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="text-blue-gray-900 ">
                                        {currentData?.map((dataObj, index) => (
                                            // <tr key={index} className="border-b border-blue-gray-200 cursor-pointer even:bg-gray-100 odd:bg-white " >
                                            <tr key={index} className="border-b border-blue-gray-200 cursor-pointer  " >
                                                {tableDataNames?.map((data, idx) => (

                                                    <td key={idx} className={`h-[30px]   border-blue-gray-200 text-[11px] 
                                                         ${data === "dataObj.regNo" ? "font-semibold" : "font-normal"}
                                                          ${(data === "dataObj.active ? ACTIVE : INACTIVE") &&
                                                            (header === "Employees list") ? "ps-[65px]" :
                                                            `${data === "dataObj.active ? ACTIVE : INACTIVE" ? "ps-[35px]" : "px-4"}`} `}
                                                        onClick={() => { onDataClick(dataObj.id) }}
                                                    >
                                                        {eval(data)}

                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
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
                            
                            </div>
                            </>
                            }
                            </>
                )}

            </div>
        </div>
    );
}


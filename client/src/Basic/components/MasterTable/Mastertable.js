import React, { useState } from "react";
import Loader from "../Loader";
import "./Master.css";
import { Power, Table } from "lucide-react";
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
  <button className="rounded-md text-white bg-gray-500 border p-1 disabled">
    EXPIRED
  </button>
);
const ACTIVE_PLAN = (
  <button className="rounded-md text-white bg-blue-600 border p-1 disabled">
    ACTIVE
  </button>
);

const Mastertable = ({
  tableHeaders,
  tableDataNames,
  setId,
  data,
  loading,
  searchValue,
  setSearchValue,
  rowActions = true,
  header,
  setForm,
  onDataClick,
  setReadOnly,
  deleteData,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(data?.length / rowsPerPage);

  const currentData = data?.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  return (
    <div className="row w-full mx-auto">
      <div className="text-xs col-12 px-0 bg-[f1f1f0] bg-opacity-15 rounded-lg border shadow-md">
        <div className="flex justify-between mx-3 items-center py-1">
          <div className="text-normal flex items-center text-gray-600">
            <RiPlayListAddLine size={20} className=" mr-0.5" />
            &nbsp;{" "}
            <div className="my-0">
              <div className=" text-[13px] text-black my-0">{header}</div>
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
              <label className=" text-gray-700 text-normal text-nowrap mr-1">
                select rows:
              </label>
              <select
                className="ml-2 p-1 border text-normal bg-gray-100 border-gray-300 py-1.5 rounded-md"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
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
            ) : (
              <>
                <div className=" bg-white overflow-auto custom-scrollbar border-y border-gray-300 h-[65vh]">
                  {currentData?.length > 0 && (
                    <table className="min-w-full text-normal border-collapse text-[12px]">
                      <thead className="bg-gray-200 text-gray-800">
                        <tr>
                          {tableHeaders
                            ?.filter((heading) => heading !== " ")
                            ?.map((column, index) => (
                              <th
                                key={index}
                                className={`px-4 py-2 text-left font-medium border-white/50 ${
                                  index === 0 ? "w-[40px]" : "" // Add fixed width for first column (S.No)
                                } ${
                                  index < tableHeaders.length - 1
                                    ? "border-r"
                                    : ""
                                }`}
                              >
                                {column}
                              </th>
                            ))}
                          <th className="px-4 py-2 text-left font-medium border-white/50">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {currentData.map((dataObj, index) => (
                          <tr
                            key={index}
                            className={`hover:bg-gray-50 transition-colors border-b border-gray-200 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-100"
                            } cursor-pointer`}
                          >
                            {tableDataNames
                              ?.filter((data) => data !== " ")
                              ?.map((data, idx) => (
                                <td
                                  key={idx}
                                  className={`h-[32px] text-[12px] border-r border-gray-200 px-4 ${
                                    idx === 0 ? "w-[40px]" : "" // Add fixed width for first column (S.No)
                                  }`}
                                  onClick={() => {
                                    onDataClick(dataObj?.id);
                                    setReadOnly(true);
                                  }}
                                >
                                  {eval(data)}
                                </td>
                              ))}

                            <td className="px-2 py-1 w-[40px] border-gray-200 border h-8">
                              <div className="flex gap-2">
                                {/* View */}
                                <button
                                  onClick={() => {
                                    onDataClick(dataObj?.id);
                                    setReadOnly(true);
                                  }}
                                  className="text-blue-800 flex items-center gap-1 px-2 mx-2 py-1.5 bg-blue-50 rounded"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-xs"></span>
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => {
                                    onDataClick(dataObj?.id);
                                    setReadOnly(false);
                                  }}
                                  className="text-green-800 flex items-center gap-1 mx-2 px-2 py-1.5 bg-green-50 rounded"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>{" "}
                                  <span className="text-xs"></span>
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => {
                                    onDataClick(dataObj?.id);
                                    deleteData();
                                  }}
                                  className="text-red-800 flex items-center gap-1 mx-2 px-2 py-1.5 bg-red-50 rounded"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>{" "}
                                  <span className="text-xs"></span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-center items-center mt-2  my-2 text-normal font-semibold">
                  <button
                    className={`text-xs text-stone-900 rounded ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-400"
                    }`}
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    &lt;&nbsp;
                  </button>

                  <span className="text-gray-700">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    className={`text-xs text-stone-900 rounded ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-400"
                    }`}
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    &nbsp;&gt;
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Mastertable;
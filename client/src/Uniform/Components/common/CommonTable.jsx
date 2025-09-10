// import { useState, useEffect } from 'react';
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import { useDeleteStyleSheetMutation } from '../../../redux/services/StyleSheet';

// const CommonTable = ({
//   columns,
//   data,
//   itemsPerPage = 10,
//   onDataClick,

//   setReadOnly,
//   emptyStateMessage = 'No data available',
//   setReport,
//   deleteData,
//   handleDelete,
//   rowActions = true,
//   id,
//   setId
// }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   // const totalPages = Math.ceil(data.length / itemsPerPage);
//   const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   const Pagination = () => {
//     if (totalPages <= 1) return null;

//     return (
//       <div className="flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200">
//         <div className="text-sm text-gray-600 mb-2 sm:mb-0">
//           {/* Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data.length)} of {data.length} entries */}
//           Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data?.length || 0)} of {data?.length || 0} entries
//         </div>
//         <div className="flex gap-1">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className={`px-3 py-1 rounded-md ${currentPage === 1
//               ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//               : 'bg-white text-gray-600 hover:bg-gray-100'
//               }`}
//           >
//             <FaChevronLeft className="inline" />
//           </button>

//           {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//             let pageNum;
//             if (totalPages <= 5) {
//               pageNum = i + 1;
//             } else if (currentPage <= 3) {
//               pageNum = i + 1;
//             } else if (currentPage >= totalPages - 2) {
//               pageNum = totalPages - 4 + i;
//             } else {
//               pageNum = currentPage - 2 + i;
//             }

//             return (
//               <button
//                 key={pageNum}
//                 onClick={() => handlePageChange(pageNum)}
//                 className={`px-3 py-1 rounded-md ${currentPage === pageNum
//                   ? 'bg-indigo-800 text-white'
//                   : 'bg-white text-gray-600 hover:bg-gray-100'
//                   }`}
//               >
//                 {pageNum}
//               </button>
//             );
//           })}

//           {totalPages > 5 && currentPage < totalPages - 2 && (
//             <span className="px-3 py-1">...</span>
//           )}

//           {totalPages > 5 && currentPage < totalPages - 2 && (
//             <button
//               onClick={() => handlePageChange(totalPages)}
//               className={`px-3 py-1 rounded-md ${currentPage === totalPages
//                 ? 'bg-indigo-800 text-white'
//                 : 'bg-white text-gray-600 hover:bg-gray-100'
//                 }`}
//             >
//               {totalPages}
//             </button>
//           )}

//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className={`px-3 py-1 rounded-md ${currentPage === totalPages
//               ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//               : 'bg-white text-gray-600 hover:bg-gray-100'
//               }`}
//           >
//             <FaChevronRight className="inline" />
//           </button>
//         </div>
//       </div>
//     );
//   };
//   useEffect(() => {
//     console.log("readOnly state changed:", Boolean(setReadOnly));
//   }, [setReadOnly]);


//   return (
//     <div className="bg-[#F1F1F0] rounded-xl shadow-sm overflow-hidden">
//       <table className=" border-collapse">
//         <thead className="bg-gray-200 text-gray-800">

//           <tr>
//             {columns.map((column, index) => (
//               <th
//                 key={index}
//                 className={` ${column.className ? column.className : ""} py-2  font-medium   ${column.header !== "" ? 'border-r border-white/50' : ''} text-[13px]`}
//               >
//                 {column.header}
//               </th>
//             ))}
//             {rowActions && (
//               <th className="px-4 py-2 text-center font-medium text-[13px] justify-end">Actions</th>
//             )}
//           </tr>
//         </thead>
//         <tbody>
//           {(currentItems?.length || 0) === 0 ? (
//             <tr>
//               <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-4 py-4 text-center text-gray-500">
//                 {emptyStateMessage}
//               </td>
//             </tr>
//           ) : (
//             currentItems.map((item, index) => (
//               <tr
//                 key={item.id}
//                 className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
//                   }`}
//               >
//                 {columns.map((column, colIndex) => (
//                   <td
//                     key={colIndex}
//                     className={` ${column.className ? column.className : ""} h-8 `}
//                   >
//                     {/* {column.accessor(item)} */}
//                     {/* {column.accessor(item, index + indexOfFirstItem)} */}
//                     {String(column.accessor(item, index + indexOfFirstItem)).trim()}
//                   </td>
//                 ))}
//                 {rowActions && (
//                   <td className="w-[40px] border-gray-200 border-l  h-8 justify-end">
//                     <div className="flex">
//                       <button
//                         className="text-blue-600  flex items-center  px-2  bg-blue-50 rounded"

//                         onClick={() => {
//                           // setId(item?.id)
//                           onDataClick(item?.id);
//                           setReport(true)
//                           setReadOnly(true);
//                           console.log("Id setted", item?.id)
//                         }}
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-4" viewBox="0 0 20 20" fill="currentColor">
//                           <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//                           <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
//                         </svg>
//                         {/* <span className="text-xs">view</span> */}
//                       </button>

//                       <button
//                         className="text-green-600  px-2  bg-green-50 rounded"

//                         onClick={() => {
//                           onDataClick(item?.id);
//                           setReport(true)
//                           setReadOnly(false)
//                         }}
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-4" viewBox="0 0 20 20" fill="currentColor">
//                           <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                         </svg>
//                         {/* <span className="text-xs">edit</span> */}
//                       </button>

//                       <button
//                         className="text-red-800 flex items-center gap-1 mx-2  bg-red-50 rounded"

//                         onClick={() => {
//                           handleDelete?.(item?.id);
//                           console.log("delete click", item?.id)
//                         }}
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-4" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                         </svg>
//                         {/* <span className="text-xs">delete</span> */}
//                       </button>
//                     </div>
//                   </td>
//                 )}
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//       <Pagination />
//     </div>
//   );
// };

// export default CommonTable;
import { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CommonTable = ({
  columns,
  data,
  itemsPerPage = 10,
  onDataClick,
  setReadOnly,
  emptyStateMessage = 'No data available',
  setReport,
  handleDelete,
  rowActions = true,
  setPoReport
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data?.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center p-2 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, data?.length || 0)} of {data?.length || 0} entries
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <FaChevronLeft className="inline" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded-md ${currentPage === pageNum
                  ? 'bg-indigo-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="px-3 py-1">...</span>
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages
                  ? 'bg-indigo-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
          >
            <FaChevronRight className="inline" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#F1F1F0] rounded-xl shadow-sm overflow-hidden">
      <table className="border-collapse w-full">
        <thead className="bg-gray-200 text-gray-800">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`${column.className || ""} py-2 font-medium ${column.header !== "" ? 'border-r border-white/50' : ''
                  } text-[13px]`}
              >
                {column.header}
              </th>
            ))}
            {rowActions && (
              <th className="px-4 py-2 text-center font-medium text-[13px]">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {(currentItems?.length || 0) === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (rowActions ? 1 : 0)}
                className="px-4 py-4 text-center text-gray-500"
              >
                {emptyStateMessage}
              </td>
            </tr>
          ) : (
            currentItems.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 transition-colors border-b border-gray-200 text-[12px] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                  }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`${column.className || ""} h-8`}
                  >
                    {String(column.accessor(item, index + indexOfFirstItem)).trim()}
                  </td>
                ))}
                {rowActions && (
                  <td className="w-[40px] border-gray-200 border-l h-8">
                    <div className="flex">
                      {/* View */}
                      <button
                        className="text-blue-600 flex items-center px-2 bg-blue-50 rounded"
                        onClick={() => {
                          onDataClick(item.id);
                          setReport?.(true);
                          setPoReport?.(true)
                          setReadOnly(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Edit */}
                      <button
                        className="text-green-600 px-2 bg-green-50 rounded"
                        onClick={() => {
                          onDataClick(item.id);
                          setReport?.(true);
                          setPoReport?.(true)
                          setReadOnly(false);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        className="text-red-800 flex items-center mx-2 bg-red-50 rounded"
                        onClick={() => handleDelete?.(item.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <Pagination />
    </div>
  );
};

export default CommonTable;

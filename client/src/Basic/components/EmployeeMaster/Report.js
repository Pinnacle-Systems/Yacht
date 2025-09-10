import React, { useState} from 'react';
import ReactPaginate from 'react-paginate';
import { AddNewButton } from '../../../Buttons';
import { EMPTY_ICON } from '../../../icons';
import ProfileCard from '../ProfileCard';
import { DATA_PER_PAGE, INITIAL_PAGE_NUMBER } from '../../../Constants';
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import Loader from "../Loader"
import secureLocalStorage from "react-secure-storage";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

export default function EmployeeReport({employees, loading, onClick, searchValue, setSearchValue, onNew}){

  const [branchPrefix, setBranchPrefix] = useState("");
  const [branchSequence, setBranchSequence] = useState("");

  const [totalCount, setTotalCount] = useState(0);
  const [currentPageNumber, setCurrentPageNumber] = useState(INITIAL_PAGE_NUMBER);
  const handleOnclick = (e) => {
    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
  }
  return (
    <>
      <div className='flex flex-col w-full h-[98%] frame'>
        <div className='md:flex md:items-center md:justify-between page-heading'>
          <div className='heading text-center md:mx-10'>Employee Master </div>
          <div className='flex sub-heading justify-center md:justify-start items-center'>
            <input type="text" className='text-black h-6 focus:outline-none border md:ml-3' placeholder='Search' value={searchValue} onChange={(e)=>setSearchValue(e.target.value)} />
            <AddNewButton onClick={onNew} />
          </div>
        </div>
        {loading ?
          <Loader />
          :
          <>
            {employees.length === 0
              ?
              <div className='flex-1 flex justify-center text-blue-900 items-center text-3xl'><p>{EMPTY_ICON} Employee Master Empty...! </p></div>
              :
              <>
                <div className='flex-1 items-center overflow-auto' style={{ width: "100%" }}>
                  <div className='grid md:grid-cols-6 p-2 gap-2' >
                    {employees.map((employee) =>
                      <ProfileCard key={employee.id} regNo={employee.regNo} name={employee.name} image={employee.imageBase64}
                        employeeCategory={employee?.EmployeeCategory?.name} mobile={employee.mobile} active={employee.active}
                        onClick={()=>onClick(employee.id)} />)}
                  </div>
                </div>
                <ReactPaginate
                  previousLabel={"<"}
                  nextLabel={">"}
                  breakLabel={"..."}
                  breakClassName={"break-me"}
                  forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
                  pageCount={Math.ceil(totalCount / DATA_PER_PAGE)}
                  marginPagesDisplayed={1}
                  onPageChange={handleOnclick}
                  containerClassName={"flex justify-center m-2 gap-5 items-center"}
                  pageClassName={"border custom-circle text-center"}
                  disabledClassName={"p-1 bg-gray-200"}
                  previousLinkClassName={"border p-1 text-center"}
                  nextLinkClassName={"border p-1"}
                  activeClassName={"bg-blue-900 text-white px-2"} />
              </>
            }
          </>
        }
      </div>
    </>
  )
}

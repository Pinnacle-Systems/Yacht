import React, { useState } from 'react';
import { formatDate, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import { push } from '../../../redux/features/opentabs';
import { useDispatch } from 'react-redux';
import { GreenBadge, RedBadge, WEB_LINK } from '../../../icons';
import { PAYMENT_PAGE_NAME } from '../../../Constants';
import ReactPaginate from 'react-paginate';
import { showEntries } from '../../../Utils/DropdownData';
import moment from 'moment';
import SampleDetailsReport from './SampleDetailsReport';
import Item from './Item';
import Size from './Size';
import Color from './Color';
import Pattern from './Pattern';
import Cutting from './Cutting';
import Printing from './Printing';
import Embroiding from './Embroiding';
import Stitching from './Stitching';
import IroningAndPacking from './IroningAndPacking';
import Modal from "../../../UiComponents/Modal";
import ViewImage from './ViewImage';
import Fabric from './Fabric';
import { TablePagination } from '@mui/material';


const SampleTable = ({ isCompletedOnly, isWipOnly, currentPageNumber, setCurrentPageNumber,userData, totalCount, dataPerPage, setDataPerPage, sampleData, searchSchool, setSearchSchool, setSearchContact, searchContact, searchContactName, setSearchContactName }) => {
    const [isStyleImageOpen, setIsStyleImageOpen] = useState(false);


    const [currentImage, setCurrentImage] = useState("");

    const dispatch = useDispatch();
   
    const handleChange = (event, value) => {
        setCurrentPageNumber(value);
      };
      const handleChangeRowsPerPage = (event) => {
        setDataPerPage(parseInt(event.target.value, 10));
        setCurrentPageNumber(0);
      };
    return (
        <div className="h-full mt-2">
            <Modal isOpen={isStyleImageOpen} onClose={() => setIsStyleImageOpen(false)} widthClass={"px-2 h-[55%] w-[35%]"}>
                <ViewImage picture={currentImage} />
            </Modal>
            <div className="md:flex md:items-center md:justify-between page-heading p-1">
                <div className="heading text-center md:mx-10">{isCompletedOnly ? "Completed Samples" : isWipOnly ? "WorkInProgress Samples" : "Total Samples"}</div>
                <div className='flex gap-2 text-xs'>
                    <div className=" sub-heading justify-center md:justify-start items-center">
                        <label className="text-white text-sm rounded-md m-1  border-none">Show Entries</label>
                        <select value={dataPerPage}
                            onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded mr-9'>
                            {showEntries.map((option, index) => <option key={index} value={option.value} >{option.show}</option>)}
                        </select>
                    </div>
                    {/* <input type="date" className='rounded  text-black' value={filterDate} onChange={handleChange} /> */}
                    {/* <button className='rounded px-2 bg-white text-black' onClick={handleAll}>Clear</button> */}
                </div>
            </div>
            <div className='h-full overflow-auto'>
                <table className="border border-gray-400 w-full table-auto">
                    <thead className="block md:table-header-group rounded-lg sticky bg-yellow-400 top-0">
                        <tr className="border border-gray-400 text-sm uppercase md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto md:relative">
                            <th className=" p-1 w-8 text-black font-bold md:border md:border-gray-400 bg-gray-300 text-black tracking-wider block md:table-cell">S.No</th>
                            <th className=" p-1 text-black font-bold md:border md:border-gray-400 bg-gray-300 text-black tracking-wider block md:table-cell">
                                <div className='grid justify-center items-center '>
                                    <span>
                                        School Name
                                    </span>
                                    <input className='w-full m-1 focus:outline-none rounded-md border h-7' value={searchSchool} onChange={(e) => { setSearchSchool(e.target.value) }} />
                                </div>
                            </th>
                            <th className=" p-1 text-black font-bold md:border md:border-gray-400 bg-gray-300 text-black tracking-wider block md:table-cell">

                                Fabric

                            </th>
                            <th className=" p-1 text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">


                                ItemType



                            </th>
                            <th className=" p-2 text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">


                                Item



                            </th>
                            <th className="p-1 text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">


                                Size



                            </th>
                            <th className=" p-1 text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">


                                Color



                            </th>

                            <th className="  p-2 text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">


                                Pattern



                            </th>
                            <th className=" text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">


                                Cutting



                            </th>
                            <th className=" text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">


                                Printing



                            </th>
                            <th className=" text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">


                                Embroiding



                            </th>
                            <th className=" text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">


                                Stitching



                            </th>
                            <th className=" text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">


                                Iron/Pack



                            </th>

                            {/* <th className=" p-2 text-black font-bold md:border md:border-gray-400 block md:table-cell">
                                <div className='grid justify-center items-center '>
                                    <span>
                                        Contact Person Name
                                    </span>
                                    <input className='w-full m-1 focus:outline-none rounded-md border h-7' value={searchContactName} onChange={(e) => { setSearchContactName(e.target.value) }} />
                                </div>





                            </th>
                            <th className=" p-2 text-black font-bold md:border md:border-gray-400 block md:table-cell">
                                <div className='grid justify-center items-center '>
                                    <span>
                                        Contact
                                    </span>
                                    <input className='w-full m-1 focus:outline-none rounded-md border h-7' value={searchContact} onChange={(e) => { setSearchContact(e.target.value) }} />
                                </div>


                            </th> */}
                            <th className=" p-1 text-black font-bold  bg-gray-300 text-black tracking-wider md:border md:border-gray-400 block md:table-cell w-20">Del.Date</th>


                            <th className="p-1 text-black font-bold md:border bg-gray-300 text-black tracking-wider md:border-gray-400 block md:table-cell">GoTo</th>

                        </tr>
                    </thead>
                    <tbody className="">
                        {sampleData.map((row, index) => (
                            <tr key={index} className={`bg-white border border-black md:border-none block md:table-row ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                <td className="p-1 md:border md:border-gray-400 text-left block md:table-cell">{index + 1}</td>

                                <td className="p-1 md:border md:border-gray-400 text-left block md:table-cell text-xs">{row?.Party?.name.toUpperCase() || ""}</td>
                                <td className="p-1 md:border md:border-gray-400 text-left block md:table-cell text-xs">
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <Fabric key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </td>


                                <td className='p-1 md:border md:border-gray-400 text-left block md:table-cell text-xs'>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <SampleDetailsReport key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>


                                </td>
                                <td className='p-1 md:border md:border-gray-400 text-left block md:table-cell text-xs'>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <Item key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>


                                </td>
                                <td className='p-2 md:border md:border-gray-400 text-left block md:table-cell '>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <Size key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>


                                </td>
                                <td className='p-1 md:border md:border-gray-400 text-left block md:table-cell '>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <Color key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>


                                </td>
                                <td className='p-1 md:border md:border-gray-400 text-left block md:table-cell W-16'>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <Pattern userData = {userData} key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </td>



                                <td className='p-1 md:border md:border-gray-400 text-center block md:table-cell W-16'>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <Cutting userData = {userData} key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>


                                </td>
                                <td className='p-1 md:border md:border-gray-400 text-left block md:table-cell W-16'>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <Printing userData = {userData} setCurrentImage={setCurrentImage} setIsStyleImageOpen={setIsStyleImageOpen} key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>


                                </td>
                                <td className='p-1 md:border md:border-gray-400 text-left block md:table-cell W-16'>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <Embroiding userData = {userData} setCurrentImage={setCurrentImage} setIsStyleImageOpen={setIsStyleImageOpen} key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>


                                </td>
                                {/* <td className='p-2 md:border md:border-gray-400 text-left block md:table-cell '>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <Cutting key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>


                                </td> */}
                                <td className='p-1 md:border md:border-gray-400 text-left block md:table-cell W-16'>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <Stitching userData = {userData} key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>


                                </td>
                                <td className='p-1 md:border md:border-gray-400 text-center block md:table-cell W-16'>
                                    <table className=' text-center w-full'>
                                        <tbody>
                                            {
                                                row?.sampleDetails?.map((val, valIndex) =>
                                                    <IroningAndPacking userData = {userData} setCurrentImage={setCurrentImage} setIsStyleImageOpen={setIsStyleImageOpen} key={valIndex} val={val} valIndex={valIndex} />
                                                )
                                            }
                                        </tbody>
                                    </table>


                                </td>




                                {/* <td className="p-2 md:border md:border-gray-400 text-left block md:table-cell ">{row?.Style?.name || ""}</td>
                                <td className="p-2 md:border md:border-gray-400 text-left block md:table-cell">{row?.contactPersonName}</td>
                                <td className="p-2 md:border md:border-gray-400 text-left block md:table-cell">{row?.phone}</td> */}
                                <td className="p-1 md:border md:border-gray-400 text-left block md:table-cell text-xs">{moment(row?.validDate).format("DD-MM-YYYY")}</td>

                                <td className="p-1 md:border md:border-gray-400 text-left block md:table-cell w-16">
                                    <div className='flex justify-center items-center'>
                                        <button className="text-xs font-medium underline text-blue-500" onClick={() => {
                                            dispatch(push({ name: "SAMPLE UPDATE", projectId: row?.id, projectForm: true }));
                                            dispatch({
                                                type: `sampleUpdate/invalidateTags`,
                                                payload: ['SampleUpdate'],
                                            });
                                        }} >
                                            {WEB_LINK}
                                        </button>
                                    </div>
                                </td>
                              
                            </tr>
                            
                        ))}
                         <tr className="d-flex">
    <td colSpan={15} className=" bg-white border-t border-gray-300">
      <div className="flex justify-end w-full">
        <div className="text-right">
        
         <TablePagination
           component="div"
           count={totalCount}
           page={currentPageNumber - 1}
           onPageChange={(e,value)=>{handleChange(e,value + 1)}}
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
      </div>
    </td>
  </tr>
         

                    </tbody>
                </table>
             


            </div>
 

        </div>
    );
};

export default SampleTable;

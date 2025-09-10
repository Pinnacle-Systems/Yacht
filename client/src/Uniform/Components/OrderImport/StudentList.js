import React from 'react'
import { useEffect, useState } from "react";
import { Loader } from "../../../Basic/components";
import { findFromList, getCommonParams } from "../../../Utils/helper";
import { genderList, showEntries } from '../../../Utils/DropdownData';
import secureLocalStorage from 'react-secure-storage';
import {
    useGetOrderImportQuery
} from "../../../redux/services/OrderImportService"
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import { TablePagination } from '@mui/material';
import { MultiSelect } from 'react-multi-select-component';
import { multiSelectOption } from '../../../Utils/contructObject';
import { useGetClassMasterQuery } from '../../../redux/uniformService/ClassMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetItemTypeMasterQuery } from '../../../redux/uniformService/ItemTypeMasterService';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { VIEW } from '../../../icons';
import ClassWiseQty from './ClassWiseQty';
import Modal from '../../../UiComponents/Modal';

const StudentList = ({
    heading,
    onClick,
    value, setAdditionalImportData, additionalImportData, allData, readOnly
}) => {

    const [searchDocId, setSearchDocId] = useState("");
    const [searchDocDate, setSearchDocDate] = useState("");
    const [searchPhaseName, setSearchPhaseName] = useState("");
    const [searchProjectName, setSearchProjectName] = useState("");
    const [supplier, setSupplier] = useState("");
    const [order, setOrder] = useState("");
    const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");
    const [classGridOpen, setClassGridOpen] = useState(false)
    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const handleOnclick = (e) => {
        setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
    }
    const searchFields = { searchDocId, searchDocDate, searchSupplierName: supplier, searchOrderId: order }

    function handleInputChange(value, index, field) {

        setAdditionalImportData(prev => {
            let newObj = structuredClone(prev)
            newObj[index][field] = value;
            return newObj
        })
    };

    function deleteRow(index) {
        setAdditionalImportData(prev => prev.filter((_, i) => i !== index))
    }



    const { data: classList } =
        useGetClassMasterQuery({});

    const handleChange = (event, value) => {
        setCurrentPageNumber(value);
    };
    const handleChangeRowsPerPage = (event) => {
        setDataPerPage(parseInt(event.target.value, 10));
        setCurrentPageNumber(0);
    };

    const { branchId, companyId, finYearId, userId } = getCommonParams()

    const params = {
        branchId, userId, finYearId
    };
    const { data: colorList } =
        useGetColorMasterQuery({ params });
    const { data: sizeList } =
        useGetSizeMasterQuery({ params });
    const { data: itemList } =
        useGetItemMasterQuery({ params });
    const { data: itemTypeList } =
        useGetItemTypeMasterQuery({ params });
    const { data: fabricList } =
        useGetFabricMasterQuery({ params: { ...params, active: true } });


    function findTotalQty(index) {
        let totalQty = 0;
        totalQty = additionalImportData?.[index]?.["classIds"]?.reduce((old, current) => {
            return (parseFloat(old) + parseFloat(current?.qty ? current?.qty : 0))
        }, 0)
        return parseFloat(totalQty)
    }





    return (
        // <div className="flex flex-col w-full min-h-[350px] overflow-y-auto" >

        <>
            <Modal isOpen={classGridOpen} onClose={() => setClassGridOpen(false)} widthClass={"px-2 h-[80%] w-[50%]"}>
                <ClassWiseQty params={params}
                    setClassGridOpen={setClassGridOpen}
                    readOnly={readOnly}
                    setCurrentSelectedIndex={setCurrentSelectedIndex}
                    currentIndex={currentSelectedIndex}
                    setAdditionalImportData={setAdditionalImportData}
                    additionalImportData={additionalImportData}
                />
            </Modal>


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
                                Item Type
                            </th>
                            <th
                                className="border-2  top-0 stick-bg"
                            >
                                Item
                            </th>

                            <th
                                className="border-2  top-0 stick-bg w-12"
                            >
                                Class
                            </th>
                            <th
                                className="border-2  top-0 stick-bg"
                            >
                                Gender
                            </th>
                            <th
                                className="border-2  top-0 stick-bg"
                            >
                                Color
                            </th>
                            {/* <th
                                className="border-2  top-0 stick-bg"
                            >
                                Bottom Color
                            </th>
                            <th
                                className="border-2  top-0 stick-bg"
                            >
                                Size
                            </th>
                            <th
                                className="border-2  top-0 stick-bg"
                            >
                                Bottom Size
                            </th> */}
                            <th
                                className="border-2  top-0 stick-bg w-20"
                            >
                                Qty
                            </th>
                            <th className="border border-gray-500 text-sm p-1 w-16">
                                <button type='button' className="text-green-700" onClick={() => {
                                    setAdditionalImportData(prev => {
                                        let newPrev = structuredClone(prev);
                                        newPrev.push({
                                            itemTypeId: "",
                                            itemId: "",
                                            colorId: "",
                                            botttomColorId: "",
                                            sizeId: "",
                                            bottomSizeId: "",
                                            gender: "",
                                            qty: "",
                                            classIds: [
                                                {

                                                    qty: "",
                                                    classId: "",
                                                    sizeId: "",

                                                }
                                            ]
                                        })
                                        return newPrev
                                    })
                                }}
                                    disabled={readOnly}
                                > {<FontAwesomeIcon icon={faUserPlus} />}
                                </button>
                            </th>
                        </tr>
                    </thead>


                    <tbody className="border-2">{console.log(additionalImportData, "additionalImportData")}
                        {additionalImportData?.map((item, index) => (

                            <tr
                                key={item.id}
                                className="border-2 table-row "
                            >
                                <td
                                    className="border-2  top-0 stick-bg"
                                >
                                    {index + 1}
                                </td>
                                <td className="py-0.5 px-1 border border-gray-400">
                                    <select
                                        readOnly={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "itemTypeId") } }}
                                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                        value={item.itemTypeId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "itemTypeId")}
                                    >
                                        <option className='text-gray-600'>Select
                                        </option>
                                        {(itemTypeList?.data ? itemTypeList?.data : []).map((uom) =>
                                            <option value={uom.id} key={uom.id}>
                                                {uom.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className="py-0.5 px-1 border border-gray-400">
                                    <select
                                        readOnly={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "itemId") } }}
                                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                        value={item.itemId || ""}
                                        onChange={(e) => handleInputChange(e.target.value, index, "itemId")}
                                    >
                                        <option className='text-gray-600'>Select
                                        </option>
                                        {(itemList?.data ? itemList?.data : [])?.filter(val => parseInt(val.itemTypeId) === parseInt(item.itemTypeId))?.map((uom) =>
                                            <option value={uom.id} key={uom.id}>
                                                {uom.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className=" text-xs text-center border border-gray-500 break-words whitespace-normal max-w-xs">

                                    <button
                                        className="text-center rounded px-1"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                setCurrentSelectedIndex(index);
                                            }
                                        }}
                                        onClick={() => {
                                            setCurrentSelectedIndex(index);
                                            setClassGridOpen(true)
                                        }
                                        }
                                    >
                                        {VIEW}
                                    </button>
                                    {/* <MultiSelect
                                        className={`text-left w-full rounded  table-data-input`}
                                        options={multiSelectOption((classList?.data || []), 'name', 'id')}
                                        value={(item?.classIds || [])?.map((val) => ({ value: val?.classId, label: findFromList(val.classId, (classList?.data || []), "name") }))}
                                        onChange={(value) => { handleInputChange(value.map(i => ({ classId: i.value })), index, "classIds") }}
                                        labelledBy="Select"
                                    /> */}
                                </td>
                                <td className="py-0.5 px-1 border border-gray-400">
                                    <select
                                        readOnly={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "gender") } }}
                                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                        value={item.gender || ""}
                                        onChange={(e) => handleInputChange(e.target.value, index, "gender")}
                                    >
                                        <option className='text-gray-600'>Select
                                        </option>
                                        {(genderList ? genderList : []).map((uom) =>
                                            <option value={uom.value} key={uom.value}>
                                                {uom.show}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                <td className="py-0.5 px-1 border border-gray-400">
                                    <select
                                        readOnly={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                        value={item.colorId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                                    >
                                        <option className='text-gray-600'>Select
                                        </option>
                                        {(colorList?.data ? colorList?.data : []).map((uom) =>
                                            <option value={uom.id} key={uom.id}>
                                                {uom.name}
                                            </option>
                                        )}
                                    </select>
                                </td>
                                {/* <td className="py-0.5 px-1 border border-gray-400">
                                    <select
                                        readOnly={readOnly}
                                      
                                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                        value={item.bottomColorId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "bottomColorId")}
                                    >
                                        <option className='text-gray-600'>Select
                                        </option>
                                        {(colorList?.data ? colorList?.data : []).map((uom) =>
                                            <option value={uom.id} key={uom.id}>
                                                {uom.name}
                                            </option>
                                        )}
                                    </select>
                                </td> */}

                                {/* <td className="py-0.5 px-1 border border-gray-400">
                                    <select
                                        readOnly={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                        value={item.sizeId}
                                        onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                                    >
                                        <option className='text-gray-600'>Select
                                        </option>
                                        {(sizeList?.data ? sizeList?.data : []).map((uom) =>
                                            <option value={uom.id} key={uom.id}>
                                                {uom.name}
                                            </option>
                                        )}
                                    </select>
                                </td> */}
                                {/* <td className="py-0.5 px-1 border border-gray-400">
                                    <select
                                        readOnly={readOnly}
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "bottomSizeId") } }}
                                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                                        value={item.bottomSizeId || ""}
                                        onChange={(e) => handleInputChange(e.target.value, index, "bottomSizeId")}
                                    >
                                        <option className='text-gray-600'>Select
                                        </option>
                                        {(sizeList?.data ? sizeList?.data : []).map((uom) =>
                                            <option value={uom.id} key={uom.id}>
                                                {uom.name}
                                            </option>
                                        )}
                                    </select>
                                </td> */}
                                <td className="py-0.5 px-1 border border-gray-400">
                                    <input className="text-left w-full rounded h-8 py-2 focus:outline-none px-2" type="text"
                                        value={item.qty ? item?.qty : findTotalQty(index)}
                                        // onChange={(e) =>
                                        //     handleInputChange(e.target.value, index, "qty")
                                        // }
                                        // onBlur={(e) => {

                                        //     handleInputChange(e.target.value, index, "qty")
                                        // }
                                        // }
                                        readOnly={true} disabled={readOnly}
                                    />
                                </td>
                                <td className="py-0.5 px-1 w-12 border border-gray-400">
                                    <button
                                        type='button' tabIndex={-1}
                                        disabled={readOnly}
                                        onClick={() => {
                                            setAdditionalImportData(prev => {
                                                let newPrev = structuredClone(prev);
                                                newPrev = newPrev.filter((_, i) => i !== index)
                                                return newPrev
                                            })
                                        }}
                                        className='text-md text-red-600 ml-1'>{<FontAwesomeIcon icon={faTrashCan} />}</button>

                                </td>

                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </>

    )
}


{/* <TablePagination
                component="div"
                count={totalCount}
                page={currentPageNumber}
                onPageChange={handleChange}
                rowsPerPage={dataPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            /> */}
// </div >

export default StudentList
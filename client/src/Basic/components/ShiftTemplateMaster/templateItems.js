import { useCallback, useEffect, useRef, useState } from "react";
import { DropdownInput, TextInput } from "../../../Inputs";
import Modal from "../../../UiComponents/Modal";
import { getCommonParams } from "../../../Utils/helper";
import { useGetCompanyQuery } from "../../../redux/services/CompanyMasterService";
import { useGetShiftCommonTemplateQuery } from "../../../redux/services/ShiftCommonTemplate.service";
import { useGetshiftMasterQuery } from "../../../redux/services/ShiftMasterService";
import {
  useAddShiftTemplateMasterMutation,
  useDeleteShiftTemplateMasterMutation,
  useGetShiftTemplateMasterByIdQuery,
  useGetShiftTemplateMasterQuery,
  useUpdateShiftTemplateMasterMutation,
} from "../../../redux/services/ShiftTemplateMaster";
import { common, commonNew, ShowShiftData } from "../../../Utils/DropdownData";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";
import { Check, Eye } from "lucide-react";
import { DELETE, PLUS } from "../../../icons";
import { HiPlus, HiTrash } from "react-icons/hi";
import { FaFileAlt } from "react-icons/fa";
import { FiSave } from "react-icons/fi";
import moment from "moment";

const TemplateItems = ({
  saveData,
  setForm,
  ShitCommonData,
  shiftData,
  readOnly,
  ShiftTemplateItems,
  setShiftTemplateItems,
  id,
  shiftId,
  setShiftId,
  setDate,
  date,
  companyCode,
  setCompanyCode,
  docId,
  setDocId,
  categoryId,
  setCategoryId,
  childRecord,
  onClose,
  onNew,
  setReadOnly,
  setId,
  refetch,
}) => {
  const [modal, setModal] = useState(false);
  const [secondModal, setSecondModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [errors, setErrors] = useState({});
  const handleRightClick = (event, rowIndex, type) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(ShiftTemplateItems);
    newBlend[index][field] = value;

    setShiftTemplateItems(newBlend);
  };

  const addNewRow = () => {
    const newRow = { templateId: "" };
    setShiftTemplateItems([...ShiftTemplateItems, newRow]);
  };
  const selectRef = useRef(null);
  const handleDeleteRow = (id) => {
    setShiftTemplateItems((yarnBlend) => {
      if (yarnBlend.length <= 1) {
        return yarnBlend;
      }
      return yarnBlend.filter((_, index) => index !== parseInt(id));
    });
  };
  const handleDeleteAllRows = () => {
    setShiftTemplateItems((prevRows) => {
      if (prevRows.length <= 1) return prevRows;
      return [prevRows[0]];
    });
  };

  return (
    <>
      <div className="w-full bg-gray-100 mx-auto rounded-md shadow-md px-2 py-1">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Shift Template </h1>
          <div className="flex gap-2">
            {readOnly && (
              <button
                type="button"
                onClick={() => {
                  setReadOnly(false);
                }}
                className="px-3 py-1 text-green-600 hover:bg-green-600 hover:text-white border border-green-600 text-xs rounded"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setForm(false);
                setId("");
              }}
              className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
            >
              Back
            </button>

            {!readOnly && (
              <button
                type="button"
                onClick={saveData}
                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs"
              >
                {id ? "Update" : "Save"}
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3  h-[580px] ">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
              <h2 className="font-medium text-slate-700 mb-2">Basic Details</h2>
              <div className="grid grid-cols-6 gap-4">
                {/* <TextInput
                  name="Company Code"
                  type="text"
                  value={companyCode}
                  setValue={setCompanyCode}
                  required={true}
                  // readOnly={readOnly}
                  disabled={true}
                /> */}
                <div className="">
                  <TextInput
                    name="Doc Id"
                    type="text"
                    value={docId}
                    // setValue={setDocId}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                  />
                </div>
                {console.log(docId, "docIdreceived")}

                <div className="">
                  <DropdownInput
                    name="Category"
                    type="text"
                    options={ShowShiftData}
                    value={categoryId}
                    setValue={setCategoryId}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className={`w-full   p-2 overflow-x-auto bg-white`}
            // tabIndex={0} // Make it focusable
            // onKeyDown={(e) => {
            //   if (e.key === "Enter") {
            //     e.preventDefault(); // Prevent default Enter behavior
            //     addNewRow();
            //   }
            // }}
          >
            <table className="w-full border-collapse table-fixed ">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  <th
                    className={`w-[4px] px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    S.No
                  </th>
                  <th
                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Applied On
                  </th>
                  <th
                    className={`w-28 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Shift Common Template
                  </th>
                  <th
                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Shift
                  </th>

                  <th
                    className={`w-8 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    From
                  </th>

                  <th className={`w-8  item-center font-medium text-[13px] `}>
                    To
                  </th>
                  <th
                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Next Day
                  </th>
                  <th
                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Tolerance
                  </th>
                  <th
                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Break
                  </th>
                  <th
                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Out Next Day
                  </th>
                  <th
                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Shift Hrs
                  </th>
                  <th
                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    OT Hrs
                  </th>
                  {/* <th
                    className={`w-72  item-center font-medium text-[13px] `}
                  ></th> */}
                </tr>
              </thead>
              <tbody>
                {ShiftTemplateItems?.map((item, index) => (
                  <tr key={index} className=" w-full table-row ">
                    <td className="border border-gray-300  w-[4px] text-center px-1">
                      {index + 1}
                    </td>

                    <td className=" border border-gray-300 text-[11px] py-0.5 item-center">
                      <input
                        type="date"
                        value={
                          item?.date
                            ? new Date(item.date).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "date")
                        }
                        className="bg-transparent"
                      />
                    </td>
                    <td className=" border border-gray-300 text-[11px] py-0.5 item-center">
                      <select
                        // onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryGroupId") } }}
                        disabled={readOnly}
                        className="text-left w-full focus:outline-none rounded py-1 bg-transparent"
                        value={item.templateId}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "templateId")
                        }
                      >
                        <option>Select Shift Common Template</option>
                        {(id
                          ? ShitCommonData?.data || []
                          : ShitCommonData?.data.filter(
                              (item) => item.active
                            ) || []
                        ).map((blend) => (
                          <option value={blend.id} key={blend.id}>
                            {blend.employeeCategory?.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="  border border-gray-300 text-[11px] py-0.5 item-center">
                      <select
                        disabled={readOnly}
                        className="text-left focus:outline-none w-full rounded py-1 bg-transparent"
                        value={item.shiftId}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "shiftId")
                        }
                      >
                        <option>Select Shift</option>
                        {(id
                          ? shiftData?.data || []
                          : shiftData?.data.filter((item) => item.active) || []
                        ).map((blend) => (
                          <option value={blend.id} key={blend.id}>
                            {blend?.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="  border border-gray-300 text-[11px] py-0.5 item-center">
                      <input
                        type="text"
                        value={
                          shiftData?.data?.find((i) => i.id == item?.shiftId)
                            ?.from
                        }
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "shiftFrom")
                        }
                        className="w-full bg-transparent text-center  focus:outline-none focus:border-transparent"
                        disabled={true}
                      />
                    </td>
                    <td className="  border border-gray-300 text-[11px] py-0.5 item-center">
                      <input
                        type="text"
                        value={
                          shiftData?.data?.find((i) => i.id == item?.shiftId)
                            ?.to
                        }
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "shiftTo")
                        }
                        className="w-full bg-transparent text-center  focus:outline-none focus:border-transparent"
                        disabled={true}
                      />
                    </td>
                    {/* In Next Day */}
                    <td className="border border-gray-300 text-[11px] py-0.5 item-center">
                      <select
                        disabled={readOnly}
                        className="text-left w-full bg-transparent focus:outline-none rounded py-1"
                        value={item.inNextDay}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "inNextDay")
                        }
                      >
                        <option>Select</option>
                        {commonNew.map((blend) => (
                          <option value={blend.value} key={blend.value}>
                            {blend?.show}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300  text-center">
                      <button
                        className="text-blue-600 text-center   bg-blue-50 rounded"
                        onClick={() => setModal(true)}
                        title="Open"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="text-center border border-gray-300">
                      <button
                        className="text-blue-600 text-center   bg-blue-50 rounded"
                        onClick={() => setSecondModal(true)}
                        title="Open"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                    {modal === true && (
                      <Modal
                        isOpen={modal}
                        form={modal}
                        widthClass={"w-[50%]  h-[45%]"}
                        onClose={() => {
                          setModal(false);
                          setErrors({});
                        }}
                      >
                        <div className="h-full flex flex-col bg-gray-100">
                          <div className="border-b py-2 px-2 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                            <div className="flex items-center">
                              <h2 className="text-lg  py-0.5 font-semibold  text-gray-800">
                                Tolerance
                              </h2>
                            </div>
                          </div>

                          <div className="flex-1 overflow-auto p-3">
                            <div className="grid grid-cols-1  gap-3  h-full">
                              <div className="lg:col-span- space-y-3">
                                <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                                  <div className="space-y-4 ">
                                    <div className="flex gap-y-6  gap-x-6">
                                      {/* Tolerance Before Start */}
                                      <div className="mb-3">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                          Tolerance Before Start
                                        </label>
                                        <input
                                          min="0"
                                          type="text"
                                          value={item?.toleranceInBeforeStart}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "toleranceInBeforeStart"
                                            )
                                          }
                                          className="w-[120px] px-3 py-1 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm"
                                          disabled={readOnly}
                                        />
                                      </div>

                                      {/* Tolerance After End */}
                                      <div className="mb-3 ">
                                        <label className="block text-xs  font-bold text-slate-700 mb-1">
                                          Tolerance After Start
                                        </label>
                                        <input
                                          min="0"
                                          type="text"
                                          value={item?.toleranceInAfterEnd}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "toleranceInAfterEnd"
                                            )
                                          }
                                          className="w-[120px] px-3 py-1  text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm"
                                          disabled={readOnly}
                                        />
                                      </div>

                                      {/* Tolerance Before Start (Out) */}
                                      <div className="mb-3 ">
                                        <label className="block text-xs  font-bold text-slate-700 mb-1">
                                          Tolerance Before End
                                        </label>
                                        <input
                                          min="0"
                                          type="text"
                                          value={item?.toleranceOutBeforeStart}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "toleranceOutBeforeStart"
                                            )
                                          }
                                          className="w-[120px] px-3 py-1 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm"
                                          disabled={readOnly}
                                        />
                                      </div>

                                      {/* Tolerance After End (Out) */}
                                      <div className="mb-3">
                                        <label className="block text-xs  font-bold text-slate-700 mb-1">
                                          Tolerance After End
                                        </label>
                                        <input
                                          min="0"
                                          type="text"
                                          value={item?.toleranceOutAfterEnd}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "toleranceOutAfterEnd"
                                            )
                                          }
                                          className=" w-[120px] px-3 py-1  text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm"
                                          disabled={readOnly}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Modal>
                    )}

                    {secondModal && (
                      <Modal
                        isOpen={secondModal}
                        form={secondModal}
                        widthClass={"w-[50%] h-[55%]"} // Adjust width/height if needed
                        onClose={() => {
                          setSecondModal(false);
                          setErrors({});
                        }}
                      >
                        <div className="h-full flex flex-col bg-gray-100">
                          {/* Header */}
                          <div className="border-b py-2 px-2 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                            <div className="flex items-center">
                              <h2 className="text-lg py-0.5 font-semibold text-gray-800">
                                Break
                              </h2>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="flex-1 overflow-auto p-3">
                            <div className="grid grid-cols-1 gap-3 h-full">
                              <div className="space-y-3">
                                <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                                  <div className="space-y-4">
                                    <div className="flex flex-wrap gap-y-6 gap-x-10">
                                      {/* First Break Out */}
                                      <div className="mb-3 w-24">
                                        <label className="block text-xs font-bold  text-slate-700 mb-1">
                                          First Break Out
                                        </label>
                                        <input
                                          min="0"
                                          type="text"
                                          value={item?.fbOut}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "fbOut"
                                            )
                                          }
                                          className="w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm"
                                          disabled={readOnly}
                                        />
                                      </div>

                                      {/* First Break In */}
                                      <div className="mb-3 w-24">
                                        <label className="block text-xs font-bold  text-slate-700 mb-1">
                                          First Break In
                                        </label>
                                        <input
                                          min="0"
                                          type="text"
                                          value={item?.fbIn}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "fbIn"
                                            )
                                          }
                                          className="w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm"
                                          disabled={readOnly}
                                        />
                                      </div>

                                      {/* Lunch B.ST */}
                                      <div className="mb-3 w-24">
                                        <label className="block text-xs font-bold  text-slate-700 mb-1">
                                          Lunch Start
                                        </label>
                                        <input
                                          min="0"
                                          type="text"
                                          value={item?.lunchBst}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "lunchBst"
                                            )
                                          }
                                          className="w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm"
                                          disabled={readOnly}
                                        />
                                      </div>

                                      {/* LB.SNDay */}
                                      <div className="mb-3 w-24">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                          LB.SNDay
                                        </label>
                                        <select
                                          disabled={readOnly}
                                          className="w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm"
                                          value={item?.lBSNDay}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "lBSNDay"
                                            )
                                          }
                                        >
                                          <option>Select</option>
                                          {commonNew.map((blend) => (
                                            <option
                                              value={blend.value}
                                              key={blend.value}
                                            >
                                              {blend?.show}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* Lunch B.ET */}
                                      <div className="mb-3 w-24">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                          Lunch End
                                        </label>
                                        <input
                                          min="0"
                                          type="text"
                                          value={item?.lunchBET}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "lunchBET"
                                            )
                                          }
                                          className="w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm"
                                          disabled={readOnly}
                                        />
                                      </div>

                                      {/* LB.ENDay */}
                                      <div className="mb-3 w-24">
                                        <label className="block text-xs font-bold  text-slate-700 mb-1">
                                          LB.ENDay
                                        </label>
                                        <select
                                          disabled={readOnly}
                                          className="w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm"
                                          value={item?.lBEnday}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "lBEnday"
                                            )
                                          }
                                        >
                                          <option>Select</option>
                                          {commonNew.map((blend) => (
                                            <option
                                              value={blend.value}
                                              key={blend.value}
                                            >
                                              {blend?.show}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* Second Break Out */}
                                      <div className="mb-3 w-[100px]">
                                        <label className="block text-xs font-bold -ml-1 text-slate-700 mb-1">
                                          Second Break Out
                                        </label>
                                        <input
                                          min="0"
                                          type="text"
                                          value={item?.sbOut}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "sbOut"
                                            )
                                          }
                                          className="w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm"
                                          disabled={readOnly}
                                        />
                                      </div>

                                      {/* Second Break In */}
                                      <div className="mb-3 w-24">
                                        <label className="block text-xs font-bold  text-slate-700 mb-1">
                                          Second Break In
                                        </label>
                                        <input
                                          min="0"
                                          type="text"
                                          value={item?.sbIn}
                                          onFocus={(e) => e.target.select()}
                                          onChange={(e) =>
                                            handleInputChange(
                                              e.target.value,
                                              index,
                                              "sbIn"
                                            )
                                          }
                                          className="w-full px-3 py-1 text-xs border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                      transition-all duration-150 shadow-sm"
                                          disabled={readOnly}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Modal>
                    )}

                    {/* Out Next Day */}
                    <td className="border border-gray-300 text-[11px] py-0.5 item-center">
                      <select
                        disabled={readOnly}
                        className="text-left w-full bg-transparent focus:outline-none rounded py-1 "
                        value={item.outNxtDay}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "outNxtDay")
                        }
                      >
                        <option>Select</option>
                        {commonNew.map((blend) => (
                          <option value={blend.value} key={blend.value}>
                            {blend?.show}
                          </option>
                        ))}
                      </select>
                    </td>
                    {/* Shift Time Hrs */}
                    <td className="border border-gray-300 text-[11px] py-0.5 item-center ">
                      <input
                        min={"0"}
                        type="text"
                        value={item?.shiftTimeHrs}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            index,
                            "shiftTimeHrs"
                          )
                        }
                        className="w-full bg-transparent   focus:outline-none focus:border-transparent text-right pr-2"
                        disabled={readOnly}
                      />
                    </td>
                    {/* OT Hrs */}
                    <td className="border border-gray-300 text-[11px] py-0.5 item-center">
                      <input
                        min={"0"}
                        type="text"
                        value={item?.otHrs}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "otHrs")
                        }
                        className="w-full bg-transparent   focus:outline-none focus:border-transparent text-right pr-2"
                        disabled={readOnly}
                        onContextMenu={(e) => {
                          if (!readOnly) {
                            handleRightClick(e, index, "shiftTimeHrs");
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addNewRow();
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
          </div>
        </div>

        {contextMenu && (
          <div
            style={{
              position: "absolute",
              top: `${contextMenu.mouseY - 50}px`,
              left: `${contextMenu.mouseX - 30}px`,

              // background: "gray",
              boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
              padding: "8px",
              borderRadius: "4px",
              zIndex: 1000,
            }}
            className="bg-gray-100"
            onMouseLeave={handleCloseContextMenu} // Close when the mouse leaves
          >
            <div className="flex flex-col gap-1">
              <button
                className=" text-black text-[12px] text-left rounded px-1"
                onClick={() => {
                  handleDeleteRow(contextMenu.rowId);
                  handleCloseContextMenu();
                }}
              >
                Delete{" "}
              </button>
              <button
                className=" text-black text-[12px] text-left rounded px-1"
                onClick={() => {
                  handleDeleteAllRows();
                  handleCloseContextMenu();
                }}
              >
                Delete All
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TemplateItems;

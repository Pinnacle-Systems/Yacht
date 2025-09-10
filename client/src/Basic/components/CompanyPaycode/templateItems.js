import { useCallback, useEffect, useRef, useState } from "react";
import { DateInput, DropdownInput, TextInput } from "../../../Inputs";
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
import { common, commonNew, pickFrom, ShowShiftData } from "../../../Utils/DropdownData";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";
import { Eye } from "lucide-react";
import { DELETE, PLUS } from "../../../icons";
import { HiPlus, HiTrash } from "react-icons/hi";
import { FaFileAlt } from "react-icons/fa";
import { FiSave } from "react-icons/fi";

const TemplateItems = ({
  saveData,
  setForm,
  ShitCommonData,
  shiftData,
  readOnly,
  payDetails,
  setPayDetails,
  id,
  setDate,
  date,
  payComponent,
  setPayComponentId,
  payComponentId,
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
  const [errors, setErrors] = useState({});
  const [contextMenu, setContextMenu] = useState(null);
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
    const newBlend = structuredClone(payDetails);
    newBlend[index][field] = value;

    setPayDetails(newBlend);
  };

  const addNewRow = () => {
    const newRow = { templateId: "" };
    setPayDetails([...payDetails, newRow]);
  };
  const selectRef = useRef(null);
  const handleDeleteRow = (id) => {
    setPayDetails((yarnBlend) => {
      if (yarnBlend.length <= 1) {
        return yarnBlend;
      }
      return yarnBlend.filter((_, index) => index !== parseInt(id));
    });
  };
  const handleDeleteAllRows = () => {
    setPayDetails((prevRows) => {
      if (prevRows.length <= 1) return prevRows;
      return [prevRows[0]];
    });
  };
  console.log(payComponent, "payComponent");

  return (
    <>
      <div className="w-full bg-gray-100 mx-auto rounded-md shadow-md px-2 py-1">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Company Paycode </h1>
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

                <div className="w-[120px]">
                  <DateInput
                    name="Date"
                    value={date}
                    setValue={setDate}
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
                    className={`w-[8px] px-2 text-center font-medium text-[13px] `}
                  >
                    S.No
                  </th>
                  <th
                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Pay Code
                  </th>
                  <th
                    className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    Pay Description
                  </th>
                  <th
                    className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                  >
                    PayCode Type
                  </th>

                  <th className={`w-8  item-center font-medium text-[13px] `}>
                    Apply LOP
                  </th>
                  <th className={`w-8 item-center font-medium text-[13px] `}>
                    PF Applicable
                  </th>
                  <th className={`w-8 item-center font-medium text-[13px] `}>
                    ESI Applicable
                  </th>
                  <th className={`w-8 item-center font-medium text-[13px] `}>
                    Pick From
                  </th>
                </tr>
              </thead>
              <tbody>
                {payDetails?.map((item, index) => (
                  <tr className=" w-full table-row">
                    <td className="border border-gray-300  text-center px-1">
                      {index + 1}
                    </td>

                    <td className=" border border-gray-300 text-[11px] py-0.5 px-1 item-center">
                      <select
                        // onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "accessoryGroupId") } }}
                        disabled={readOnly}
                        className="text-left w-full focus:outline-none rounded py-1 "
                        value={item?.payComponentId}
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            index,
                            "payComponentId"
                          )
                        }
                      >
                        <option>Select Pay Code</option>
                        {(payComponent?.data || []).map((blend) => (
                          <option value={blend.id} key={blend.id}>
                            {blend?.payCode}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className=" border border-gray-300 text-[11px] py-0.5 item-center">
                      <input
                        type="text"
                        value={
                          payComponent?.data?.find(
                            (i) => i.id == item?.payComponentId
                          )?.payDescription
                        }
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            index,
                            "payDescription"
                          )
                        }
                        className="w-full bg-transparent text-left pl-2 focus:outline-none focus:border-transparent"
                        disabled={true}
                      />
                    </td>

                    <td className="  border border-gray-300 text-[11px] py-0.5 item-center">
                      <input
                        type="text"
                        value={
                          payComponent?.data?.find(
                            (i) => i.id == item?.payComponentId
                          )?.earningsType
                        }
                        onChange={(e) =>
                          handleInputChange(
                            e.target.value,
                            index,
                            "earningsType"
                          )
                        }
                        className="w-full bg-transparent  text-left pl-2  focus:outline-none focus:border-transparent"
                        disabled={true}
                      />
                    </td>
                    <td className="  border border-gray-300 text-[11px] py-0.5 item-center">
                      <select
                        disabled={readOnly}
                        className="text-left w-full bg-transparent focus:outline-none rounded py-1"
                        value={item?.lop}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "lop")
                        }
                      >
                        <option>Select</option>
                        {common.map((blend) => (
                          <option value={blend.value} key={blend.value}>
                            {blend?.show}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="  border border-gray-300 text-[11px] py-0.5 item-center">
                      <select
                        disabled={readOnly}
                        className="text-left w-full bg-transparent focus:outline-none rounded py-1"
                        value={item?.pf}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "pf")
                        }
                      >
                        <option>Select</option>
                        {common.map((blend) => (
                          <option value={blend.value} key={blend.value}>
                            {blend?.show}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="  border border-gray-300 text-[11px] py-0.5 item-center">
                      <select
                        disabled={readOnly}
                        className="text-left w-full bg-transparent focus:outline-none rounded py-1"
                        value={item?.esi}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "esi")
                        }
                      >
                        <option>Select</option>
                        {common.map((blend) => (
                          <option value={blend.value} key={blend.value}>
                            {blend?.show}
                          </option>
                        ))}
                      </select>
                    </td>
                     <td className="  border border-gray-300 text-[11px] py-0.5 item-center">
                      <select
                        disabled={readOnly}
                        className="text-left w-full bg-transparent focus:outline-none rounded py-1"
                        value={item?.pickFrom}
                        onChange={(e) =>
                          handleInputChange(e.target.value, index, "pickFrom")
                        }
                          onContextMenu={(e) => {
                          if (!readOnly) {
                            handleRightClick(e, index, "pickFrom");
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addNewRow();
                          }
                        }}
                        
                      >
                        <option>Select</option>
                        {pickFrom.map((blend) => (
                          <option value={blend.value} key={blend.value}>
                            {blend?.show}
                          </option>
                        ))}
                      </select>
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
              left: `${contextMenu.mouseX + 20}px`,

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

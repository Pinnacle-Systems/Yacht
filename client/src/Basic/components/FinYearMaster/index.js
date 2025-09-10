import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetFinYearQuery,
  useGetFinYearByIdQuery,
  useAddFinYearMutation,
  useUpdateFinYearMutation,
  useDeleteFinYearMutation,
} from "../../../redux/services/FinYearMasterService";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import {
  DateInput,
  CheckBox,
  DisabledInput,
  ToggleButton,
  ReusableTable,
  TextInput,
} from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import { getYearShortCode } from "../../../Utils/helper";

import Mastertable from "../MasterTable/Mastertable";
import MastersForm from "../MastersForm/MastersForm";
import { statusDropdown } from "../../../Utils/DropdownData";
import moment from "moment";

import { Check, Power } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import { ReusableInput } from "../../../Uniform/Components/styleesheet/CommonInput";
import Swal from "sweetalert2";

const MODEL = "Fin Year Master";

export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [active, setActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [code, setCode] = useState("");
  const childRecord = useRef(0);
  const [errors, setErrors] = useState({});
    const designationRef = useRef(null);
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetFinYearQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetFinYearByIdQuery(id, { skip: !id });

  const [addData] = useAddFinYearMutation();
  const [updateData] = useUpdateFinYearMutation();
  const [removeData] = useDeleteFinYearMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) {
        // setReadOnly(true);
        setTo(data?.to ? moment.utc(data.to).format("YYYY-MM-DD") : "");
        setFrom(data?.from ? moment.utc(data.from).format("YYYY-MM-DD") : "");
        setActive(data?.active);
        setCode(data?.code);
      }
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    from,
    to,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    id,
    code,
  };

  const validateData = (data) => {
    if (data.from && data.to) {
      return true;
    }
    return false;
  };
     useEffect(() => {
       if (form && !readOnly && designationRef.current) {
         designationRef.current.focus();
       }
     }, [form, readOnly]);
  const validateOneActiveFinYear = (active) => {
    if (Boolean(active)) {
      return !allData.data.some((finYear) =>
        id === finYear.id ? false : Boolean(finYear.active)
      );
    }
    return true;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id);
      syncFormWithDb(undefined);
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
        draggable: true,
        timer: 1000,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      setForm(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };

  const saveData = () => {
    if (!validateOneActiveFinYear(data.active)) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: "Only one Fin year can be active",
      });
      return;
    }
    if (!validateData(data)) {
         Swal.fire({
           icon: "error",
           title: "Submission error",
           text: "Please fill all required fields...!",
         });
         return;
       }
    
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  const deleteData = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          Swal.fire({
            icon: "error",
            title: "Submission error",
            text: deldata.data?.message || "Something went wrong!",
          });
          return;
        }
        setId("");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          timer: 1000,
        });
        setForm(false);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setTo("");
    setFrom("");
    setCode("");
    setActive(true)
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = [
    "S.NO",
    "From",
    "To",
    "Status",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
  ];
  const tableDataNames = [
    "index+1",
    "dataObj.from",
    "dataObj.to",
    "dataObj.active ? ACTIVE : INACTIVE",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
  ];
  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
    console.log("view");
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
    console.log("Edit");
  };

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
  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: " text-gray-900 w-12  text-center",
    },

    {
      header: "From",
      accessor: (item) =>
        item.from ? new Date(item.from).toISOString().split("T")[0] : "",
      //   cellClass: () => "font-medium  text-gray-900",
      className: " text-gray-900 text-center uppercase w-28",
    },
    {
      header: "To",
      accessor: (item) =>
        item.to ? new Date(item.to).toISOString().split("T")[0] : "",
      //   cellClass: () => "font-medium text-gray-900",
      className: " text-gray-900 text-center uppercase w-28",
    },
    {
      header: "Code",
      accessor: (item) => item.code,
      //   cellClass: () => "font-medium text-gray-900",
      className: " text-gray-900 text-center uppercase w-28",
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: " text-gray-900 text-center uppercase w-28",
    },
  ];
  return (
    <div onKeyDown={handleKeyDown} className="p-1 ">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h1 className="text-2xl font-bold text-gray-800">Fin Year Master</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setForm(true);
              onNew();
              setId("");
            }}
            className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Fin Year
          </button>
        </div>
      </div>
      {/* <div className="w-full flex items-start">
        <Mastertable
          header={"Fin Year list"}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onDataClick={onDataClick}
          // setOpenTable={setOpenTable}
          tableHeaders={tableHeaders}
          tableDataNames={tableDataNames}
          data={allData?.data}
          loading={isLoading || isFetching}
        />
      </div> */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>
      {console.log(readOnly, "con")}
      {form === true && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[40%] h-[50%]"}
          onClose={() => {
            setForm(false);
            setErrors({});
            setId("");
          }}
        >
          <div className="h-full flex flex-col bg-gray-100">
            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg  py-0.5 font-semibold  text-gray-800">
                  Fin year Master
                </h2>
              </div>
              <div className="flex gap-2">
                <div>
                  {readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setReadOnly(false);
                      }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Edit
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={saveData}
                      className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {id ? "Update" : "Save"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1  gap-3  h-full">
                <div className="lg:col-span- space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                    <div className="space-y-2">
                      <div className="flex gap-x-6">
                        <div className="w-32">
                          <DateInput
                            name="From"
                            value={from}
                            setValue={setFrom}
                            required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                             ref={designationRef}
                          />

                          {errors.name && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.name}
                            </span>
                          )}
                        </div>

                        <div className="">
                          <DateInput
                            name="To"
                            value={to}
                            setValue={setTo}
                            required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-bold text-slate-700 ">
                            Short Code
                            <input
                              name="code"
                              className={`w-full px-3 font-normal  py-1 mt-1 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm 
           ${
             readOnly || childRecord.current > 0
               ? "bg-gray-100 text-gray-500 cursor-not-allowed"
               : "bg-white hover:border-gray-400"
           }
          
          `}
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              readOnly={readOnly || childRecord.current > 0}
                              disabled={childRecord.current > 0}
                            />
                          </label>
                        </div>
                      </div>

                      <div className=" pt-5">
                        <ToggleButton
                          name="Status"
                          options={statusDropdown}
                          value={active}
                          setActive={setActive}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* </MastersForm> */}
        </Modal>
      )}
    </div>
  );
}

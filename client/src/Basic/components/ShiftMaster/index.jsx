import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import { useGetDepartmentQuery } from "../../../redux/services/DepartmentMasterService";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import {
  TextInput,
  CheckBox,
  ToggleButton,
  ReusableTable,
  TextAreaInput,
} from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from "../MastersForm/MastersForm";
import { statusDropdown } from "../../../Utils/DropdownData";
import {
  useAdddesignMutation,
  useGetdesignByIdQuery,
  useGetdesignQuery,
  useUpdatedesignMutation,
} from "../../../redux/uniformService/DesignMasterServices";

import { useGetCompanyQuery } from "../../../redux/services/CompanyMasterService";
import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";
import {
  useAddshiftMasterMutation,
  useDeleteshiftMasterMutation,
  useGetshiftMasterByIdQuery,
  useGetshiftMasterQuery,
  useUpdateshiftMasterMutation,
} from "../../../redux/services/ShiftMasterService";
import { getCommonParams } from "../../../Utils/helper";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";

const ShiftMaster = () => {
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [docId, setDocId] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const shiftRef = useRef(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const MODEL = "DESIGNATION";
  console.log(form, "form");
   const dispatch = useDispatch();
 
  const params = getCommonParams();

  console.log(params, "params");

  const { branchId } = params;

  const { data: company } = useGetCompanyQuery({ params });
  const [companyName, setCompanyName] = useState(company?.data[0]?.name);
  const [companyCode, setCompanyCode] = useState(company?.data[0]?.code);
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetshiftMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetshiftMasterByIdQuery(id, { skip: !id });

  // useEffect(() => {
  //   if (company?.data?.length > 0) {
  //     setCompanyName(company.data[0].name);
  //     setCompanyCode(company.data[0].code);
  //   }
  // }, [company]);
  useEffect(() => {
    if (form && !readOnly && shiftRef.current) {
      shiftRef.current.focus();
    }
  }, [form, readOnly]);

  const [addData] = useAddshiftMasterMutation();
  const [updateData] = useUpdateshiftMasterMutation();
  const [removeData] = useDeleteshiftMasterMutation();
  
  const syncFormWithDb = useCallback(
    (data) => {
    
      
        setName(data?.name || "");
        setDocId(data?.docId || "");
        setDescription(data?.description || "");
        setActive(id ? data?.active ?? false : true);
        setFrom(data?.from || "");
        setTo(data?.to || "");
        childRecord.current = data?.childRecord ? data?.childRecord : 0;
      
    },
    [id, company]
  );
console.log(docId,'doc');

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    description,
    docId,
    from,
    to,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    id,
    branchId,
  };

  const validateData = (data) => {
    if (data?.name && data?.to && data?.from) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id);
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
             title: "Child record Exists",
             text: deldata.data?.message || "Data cannot be deleted!",
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
         setForm(false);
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
    setName("");
    setReadOnly(false);
    setForm(true);
    setActive(true);
    setFrom("");
    setTo("");
    setSearchValue("");
    setCompanyName(company.data[0].name);
    setCompanyCode(company.data[0].code);
  };
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
  const getNextDocId = useCallback(() => {
    if (id) return;
    if (allData?.nextDocId) {
      setDocId(allData?.nextDocId);
    }
  }, [allData, id]);

  useEffect(getNextDocId, [getNextDocId]);
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
      className: "text-gray-900 w-12  text-center",
    },

    {
      header: "Shift Name",
      accessor: (item) => item?.name,
      //   cellClass: () => " text-gray-900",
      className: "text-gray-900 text-center uppercase w-72",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "text-gray-900",
      className: "text-gray-900 text-center uppercase w-16",
    },
  ];
  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  return (
    <div>
      <div onKeyDown={handleKeyDown} className="p-1">
        <div className="w-full flex bg-white p-1 justify-between  items-center">
          <h1 className="text-2xl font-bold text-gray-800">Shift Master</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setForm(true);
                onNew();
              }}
              className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
            >
              + Add New Shift Template
            </button>
          </div>
        </div>

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
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[40%]  h-[65%]"}
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
                    Shift Master
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
                      <div className="space-y-4">
                        <div className="flex gap-x-6">
                          {/* <TextInput
                          name="Company Code"
                          type="text"
                          value={companyCode}
                          setValue={setCompanyCode}
                          required={true}
                          // readOnly={readOnly}
                          disabled={true}
                        /> */}

                          <div className="w-42">
                            <TextInput
                              name="Shift Code"
                              type="text"
                              value={docId}
                              // setValue={setDocId}
                              required={true}
                              readOnly={readOnly}
                              disabled={
                                childRecord.current > 0 ? true : undefined
                              }
                            />
                          </div>

                          <TextInput
                            name="Shift Name"
                            type="text"
                            value={name}
                            setValue={setName}
                            required={true}
                            readOnly={readOnly}
                            disabled={
                              childRecord.current > 0 ? true : undefined
                            }
                            ref={shiftRef}
                          />
                        </div>

                        <div className="flex gap-x-6">
                          <div className="w-42">
                            <TextInput
                              name="From"
                              type="text"
                              value={from}
                              setValue={setFrom}
                              required={true}
                              readOnly={readOnly}
                              disabled={
                                childRecord.current > 0 ? true : undefined
                              }
                            />
                          </div>

                          <TextInput
                            name="To"
                            type="text"
                            value={to}
                            setValue={setTo}
                            required={true}
                            readOnly={readOnly}
                            disabled={
                              childRecord.current > 0 ? true : undefined
                            }
                          />
                        </div>
                        <div className="mt-5">
                          <ToggleButton
                            name="Status"
                            options={statusDropdown}
                            value={active}
                            setActive={setActive}
                            required={true}
                            readOnly={readOnly}
                          />
                        </div>
                        {/* <input type="time"/> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ShiftMaster;

import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";

import { toast } from "react-toastify";
import {
  TextInput,
  ToggleButton,
  ReusableTable,
  TextAreaInput,
} from "../../../Inputs";

import { statusDropdown } from "../../../Utils/DropdownData";

import { useGetCompanyQuery } from "../../../redux/services/CompanyMasterService";
import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";

import { getCommonParams } from "../../../Utils/helper";
import {
  useAddShiftCommonTemplateMutation,
  useDeleteShiftCommonTemplateMutation,
  useGetShiftCommonTemplateByIdQuery,
  useGetShiftCommonTemplateQuery,
  useUpdateShiftCommonTemplateMutation,
} from "../../../redux/services/ShiftCommonTemplate.service";
import { useGetPartyCategoryMasterQuery } from "../../../redux/services/PartyCategoryServices";
import { useGetEmployeeCategoryQuery } from "../../../redux/services/EmployeeCategoryMasterService";
import Swal from "sweetalert2";

const ShiftCommonTemplateMaster = () => {
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");

  const [docId, setDocId] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [employeeCategoryId, setEmployeeCategoryId] = useState("");
  const params = getCommonParams();

  const { branchId } = params;

  const { data: company } = useGetCompanyQuery({ params });
  const [companyName, setCompanyName] = useState(company?.data[0].name);
  const [companyCode, setCompanyCode] = useState(company?.data[0].code);
  const { data: allData } = useGetShiftCommonTemplateQuery({
    params,
    searchParams: searchValue,
  });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetShiftCommonTemplateByIdQuery(id, { skip: !id });

  const { data: employeeCategory } = useGetEmployeeCategoryQuery({ params });

  // useEffect(() => {
  //   if (company?.data?.length > 0) {
  //     setCompanyName(company.data[0].name);
  //     setCompanyCode(company.data[0].code);
  //   }
  // }, [company]);

  const [addData] = useAddShiftCommonTemplateMutation();
  const [updateData] = useUpdateShiftCommonTemplateMutation();
  const [removeData] = useDeleteShiftCommonTemplateMutation();
  
  const syncFormWithDb = useCallback(
    (data) => {
      

        setDocId(data?.docId || "");

        setEmployeeCategoryId(data?.employeeCategoryId || "");
        setActive(id ? data?.active ?? false : true);
        childRecord.current = data?.childRecord ? data?.childRecord : 0;
      
    },
    [id, company]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  console.log(singleData?.data, "singleData?.data");

  const data = {
    docId,
    employeeCategoryId,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    id,
    branchId,
    
  };

  const validateData = (data) => {
    if (data.employeeCategoryId) {
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
const getNextDocId = useCallback(() => {
    if (id) return;
    if (allData?.nextDocId) {
      setDocId(allData?.nextDocId);
    }
  }, [allData, id]);

  useEffect(getNextDocId, [getNextDocId]);
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
    setActive(true)
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
      header: "Common Template Name",
      accessor: (item) => item?.employeeCategory.name,
      //   cellClass: () => "  text-gray-900",
      className: " text-gray-900 text-center uppercase w-72",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => " text-gray-900",
      className: " text-gray-900 text-center uppercase w-36",
    },
  ];
  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  return (
    <div>
      <div onKeyDown={handleKeyDown} className="p-1 ">
        <div className="w-full flex bg-white p-1 justify-between  items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Shift Common Template Master
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setForm(true);
                onNew();
              }}
              className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
            >
              + Add New Shift Common Template
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
            widthClass={"w-[45%]  h-[50%]"}
            onClose={() => {
              setForm(false);
              setErrors({});
              setId("");
              setEmployeeCategoryId('')
            }}
          >
            <div className="h-full flex flex-col bg-gray-100">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    Shift Common Template Master
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
                      <div className="space-y-4 ">
                        <div className="flex gap-x-6">
                          <div className="w-42">
                            <TextInput
                              name="Shift Common Template Code"
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

                          <div className="w-44">
                            <label className="block font-semibold text-xs text-black mb-1">
                              Choose Template <span className="text-red-500">*</span>
                            </label>
                            <select
                              className={`w-full px-2 h-[28px] text-[12px] border border-slate-300 rounded-md 
  focus:border-indigo-300 focus:outline-none transition-all duration-200
  hover:border-slate-400
  ${
    readOnly || childRecord.current > 0
      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
      : "bg-white hover:border-gray-400"
  }`}
                              value={employeeCategoryId}
                              onChange={(e) => {
                                setEmployeeCategoryId(e.target.value);
                              }}
                              disabled={readOnly || childRecord.current > 0 ? true : undefined}
                            >
                              <option value="">Select Category</option>


                              {employeeCategory?.data?.map((doc) => (
                                <option value={doc?.id} key={doc.id}>
                                  {doc.name}
                                </option>
                              ))}
                            </select>
                          </div>
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

export default ShiftCommonTemplateMaster;

import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetEmployeeCategoryQuery,
  useGetEmployeeCategoryByIdQuery,
  useAddEmployeeCategoryMutation,
  useUpdateEmployeeCategoryMutation,
  useDeleteEmployeeCategoryMutation,
} from "../../../redux/services/EmployeeCategoryMasterService";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import {
  TextInput,
  CheckBox,
  ToggleButton,
  ReusableTable,
} from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from "../MastersForm/MastersForm";
import { statusDropdown } from "../../../Utils/DropdownData";
import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";
import Swal from "sweetalert2";
const MODEL = "Employee Category Master";
export default function Form() {
  const [form, setForm] = useState(false);

  //  const [openTable,setOpenTable] = useState(false);
   const employeeRef = useRef(null);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});

  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentBranchId"
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetEmployeeCategoryQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetEmployeeCategoryByIdQuery(id, { skip: !id });

  const [addData] = useAddEmployeeCategoryMutation();
  const [updateData] = useUpdateEmployeeCategoryMutation();
  const [removeData] = useDeleteEmployeeCategoryMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      setName(data?.name || "");
      setCode(data?.code || "");
      setActive(id ? data?.active ?? false : true);
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    code,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    id,
  };
  useEffect(() => {
       if (form && !readOnly && employeeRef.current) {
         employeeRef.current.focus();
       }
     }, [form, readOnly]);
  const validateData = (data) => {
    if (data.name && data.code) {
      return true;
    }
    return false;
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
        const deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          Swal.fire({
            icon: "error",
            title: "Submission error",
            text: deldata.data?.message || "Something went wrong!",
          });
          setForm(false);
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
    setName("");
    setCode("");
    setId("");
    setActive(true);
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
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
      header: "Category Name",
      accessor: (item) => item?.name,
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
  const tableHeaders = [
    "S.NO",
    "Code",
    "Name",
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
    "dataObj.code",
    "dataObj.name",
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
  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Employee Category Master
        </h1>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Employee Category
          </button>
        </div>
      </div>

      {/* <Mastertable
          header={"Employee Category list"}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onDataClick={onDataClick}
          // setOpenTable={setOpenTable}
          tableHeaders={tableHeaders}
          tableDataNames={tableDataNames}
          data={allData?.data}
          loading={isLoading || isFetching}
        /> */}
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
      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[40%] h-[45%]"}
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
                    Employee Category
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
                        <div className="">
                          <div className="flex flex-wrap">
                            <div className="mb-3 w-[48%]">
                              <TextInput
                                name="Category Name"
                                type="text"
                                value={name}
                                setValue={setName}
                                required={true}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                ref={employeeRef}
                              />
                            </div>

                            <div className="mb-3 w-[20%] ml-6">
                              <TextInput
                                name="Code"
                                type="text"
                                value={code}
                                setValue={setCode}
                                required={true}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                              />
                            </div>
                          </div>
                          <div className="mb-3">
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
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

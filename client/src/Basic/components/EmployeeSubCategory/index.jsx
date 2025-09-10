import { useCallback, useEffect, useRef, useState } from "react";
import { useGetEmployeeCategoryQuery } from "../../../redux/services/EmployeeCategoryMasterService";
import { getCommonParams } from "../../../Utils/helper";
import { useGetCompanyQuery } from "../../../redux/services/CompanyMasterService";
import {
  useAddemployeeSubCategoryMutation,
  useDeleteemployeeSubCategoryMutation,
  useGetemployeeSubCategoryByIdQuery,
  useGetemployeeSubCategoryQuery,
  useUpdateemployeeSubCategoryMutation,
} from "../../../redux/services/EmployeeSubCategoryservice";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";
import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";
import { TextInput, ToggleButton, ReusableTable } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import Swal from "sweetalert2";
const EmployeeSubCategory = () => {
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");

  const [gradeName, setGradeName] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [employeeCategoryId, setEmployeeCategoryId] = useState("");
  const params = getCommonParams();
     const employeeRef = useRef(null);

  const { branchId } = params;

  const { data: company } = useGetCompanyQuery({ params });
  const [companyName, setCompanyName] = useState(company?.data[0].name);
  const [companyCode, setCompanyCode] = useState(company?.data[0].code);
  const { data: allData } = useGetemployeeSubCategoryQuery({
    params,
    searchParams: searchValue,
  });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetemployeeSubCategoryByIdQuery(id, { skip: !id });

  const { data: employeeCategory } = useGetEmployeeCategoryQuery({ params });

  const [addData] = useAddemployeeSubCategoryMutation();
  const [updateData] = useUpdateemployeeSubCategoryMutation();
  const [removeData] = useDeleteemployeeSubCategoryMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      setGradeName(data?.gradeName || "");
      setEmployeeCategoryId(data?.employeeCategoryId || "");
      setActive(id ? data?.active ?? false : true);
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    gradeName,
    employeeCategoryId,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    id,
    branchId,
  };

  const validateData = (data) => {
    if (data?.gradeName && data?.employeeCategoryId) {
      return true;
    }
    return false;
  }; 
    useEffect(() => {
         if (form && !readOnly && employeeRef.current) {
           employeeRef.current.focus();
         }
       }, [form, readOnly]);

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
        const deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          toast.error(deldata?.message);
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
    setId("");
    setEmployeeCategoryId("");
    setGradeName("");
    setReadOnly(false);
    setActive(true);
    setForm(true);
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
      header: "Employee Category Name",
      accessor: (item) => item?.employeeCategory?.name,
      //   cellClass: () => "  text-gray-900",
      className: " text-gray-900 text-center uppercase w-72",
    },
    {
      header: "Grade Name",
      accessor: (item) => item?.gradeName,
      //   cellClass: () => "  text-gray-900",
      className: " text-gray-900 text-center uppercase w-44",
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
            Employee Sub Category Master
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setForm(true);
                onNew();
              }}
              className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
            >
              + Add New Employee Sub Category
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
            widthClass={"w-[40%]  h-[45%]"}
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
                    Employee Sub Category Master
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
                        <div className="flex gap-x-8">
                          <div className="w-44">
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Employee Category{" "}
                              <span className="text-red-500">*</span>{" "}
                            </label>
                            <select
                              ref={employeeRef}
                              className={`w-full px-2 h-[27px] text-[12px] border border-slate-300 rounded-md 
  focus:border-indigo-300 focus:outline-none transition-all duration-200
  hover:border-slate-400
  ${
    readOnly
      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
      : "bg-white hover:border-gray-400"
  }`}
                              value={employeeCategoryId}
                              onChange={(e) => {
                                setEmployeeCategoryId(Number(e.target.value));
                              }}
                              disabled={readOnly}
                            >
                              <option value="">Select Category</option>

                              {console.log(employeeCategory?.data, "dropdown")}

                              {employeeCategory?.data?.map((doc) => (
                                <option value={doc?.id} key={doc.id}>
                                  {doc.name}
                                </option>
                              ))}
                            
                            </select>
                          </div>

                          <div className="w-42">
                            <TextInput
                              name="Grade Name"
                              type="text"
                              value={gradeName}
                              setValue={setGradeName}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
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

export default EmployeeSubCategory;

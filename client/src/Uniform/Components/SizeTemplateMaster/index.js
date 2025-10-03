import React, { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import toast from "react-hot-toast";
import {
  MultiSelectDropdown,
  ReusableTable,
  TextInput,
  ToggleButton,
} from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import { multiSelectOption } from "../../../Utils/contructObject";
import { findFromList } from "../../../Utils/helper";
import Swal from "sweetalert2";
import {
  useAddSizeTemplateMutation,
  useDeleteSizeTemplateMutation,
  useGetSizeTemplateByIdQuery,
  useGetSizeTemplateQuery,
  useUpdateSizeTemplateMutation,
} from "../../../redux/uniformService/SizeTemplateMasterServices";
import Modal from "../../../UiComponents/Modal";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { Check, Power } from "lucide-react";

const MODEL = "Size Template Master";
export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [sizeTemplateList, setSizeTemplateList] = useState([]);
  const [active, setActive] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [errors, setErrors] = useState({});

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetSizeTemplateQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSizeTemplateByIdQuery(id, { skip: !id });
  const {
    data: sizeList,
    isLoading: isSizeLoading,
    isFetching: isSizeFetching,
  } = useGetSizeMasterQuery({ params, searchParams: searchValue });

  const [addData] = useAddSizeTemplateMutation();
  const [updateData] = useUpdateSizeTemplateMutation();
  const [removeData] = useDeleteSizeTemplateMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setReadOnly(false);
        setName("");
        setSizeTemplateList([]);
        setActive(id ? data?.active : true);
      } else {
        setReadOnly(true);
        setName(data?.name || "");
        setSizeTemplateList(
          data?.SizeTemplateList
            ? data.SizeTemplateList.map((item) => {
                return {
                  label: findFromList(
                    item.sizeId,
                    sizeList ? sizeList.data : [],
                    "name"
                  ),
                  value: item.sizeId,
                };
              })
            : []
        );
        setActive(id ? data?.active ?? false : true);
      }
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id,
    name,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    sizeTemplateList: sizeTemplateList.map((item) => item.value),
  };

  const validateData = (data) => {
    if (data.name) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id);
      setForm(false);

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

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
    setReadOnly(false);
  };

  const sizeOptions = sizeList
    ? multiSelectOption(
        sizeList.data.filter((item) => !item.isAccessory),
        "name",
        "id"
      )
    : [];
  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };

  const handleEdit = (orderId) => {
    setId(orderId);
    setForm(true);
    setReadOnly(false);
  };

  const handleDelete = async (orderId) => {
    if (orderId) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(orderId).unwrap();
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

  console.log(allData, "allData");
  console.log(allData?.data, "allData Data");

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
      accessor: (item, index) => parseInt(index) + parseInt(1),
      className: "font-medium text-gray-900 w-[10px] py-1",
    },

    {
      header: "Size Template Name",
      accessor: (item) => item.name,
      className: "font-medium text-gray-900  w-[150px]  py-1  px-2",
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
    },
  ];

  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white justify-between p-1 items-center">
        <h5 className="text-2xl font-bold font-segoe text-gray-800">
          Size Template Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border font-segoe  text-sm border-green-600 text-green-600 hover:bg-green-700 hover:text-white px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Size Template
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data || []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          itemsPerPage={10}
        />
      </div>

      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[40%] max-w-6xl h-[60%]"}
          onClose={() => {
            setForm(false);
            setErrors({});
          }}
        >
          <div className="h-full flex flex-col bg-[f1f1f0] ">
            <div className="border-b py-2 px-4 mx-3  mt-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2 ">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Size Template"
                      : "Size Template Master "
                    : "Add New Size Template"}
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
                    <fieldset className="rounded mt-2">
                      <div className="w-[50%]">
                        <TextInput
                          name="Size Template Name"
                          type="text"
                          value={name}
                          setValue={setName}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                      </div>
                      <div className=" w-[50%] mt-5">
                        <MultiSelectDropdown
                          name="Size"
                          selected={sizeTemplateList}
                          setSelected={setSizeTemplateList}
                          options={sizeOptions}
                          readOnly={readOnly}
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
                    </fieldset>
                    `
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

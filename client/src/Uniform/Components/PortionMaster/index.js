import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import { Check, Power } from "lucide-react";
import { toast } from "react-toastify";
import {
  TextInput,
  CheckBox,
  ReusableTable,
  ToggleButton,
} from "../../../Inputs";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import { statusDropdown } from "../../../Utils/DropdownData";
import { useAddPortionMasterMutation, useDeletePortionMasterMutation, useGetPortionMasterByIdQuery, useGetPortionMasterQuery, useUpdatePortionMasterMutation } from "../../../redux/uniformService/PortionMasterService";
const MODEL = "Portion Master";

export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetPortionMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPortionMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddPortionMasterMutation();
  const [updateData] = useUpdatePortionMasterMutation();
  const [removeData] = useDeletePortionMasterMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setReadOnly(false);
        setName("");
        setActive(id ? data?.active : true);
      } else {
        setName(data?.name || "");
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
  };

  const validateData = (data) => {
    if (data.name) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
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
      console.log("handle");
    }
  };

  const saveData = () => {
    let foundItem;
          if (id) {
            foundItem = allData?.data
              ?.filter((i) => i.id !== id)
              ?.some((item) => item.name?.trim().toLowerCase() === name?.trim().toLowerCase());
          } else {
            foundItem = allData?.data?.some(
              (item) => item.name?.trim().toLowerCase() === name?.trim().toLowerCase()
            );
          }
        
          if (foundItem) {
            Swal.fire({
              text: "The Colour Name already exists.",
              icon: "warning",
              timer: 1500,
              showConfirmButton: false,
            });
            return false;
          }
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "success",
        timer: 1000,
      });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  const handleDelete = async (id) => {
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
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
    setReadOnly(false);
  };

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
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
      accessor: (item, index) => parseInt(index) + parseInt(1),
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
    },
    {
      header: "Portion Name",
      accessor: (item) => item.name,
      className: "font-medium text-gray-900  w-[250px]  py-1  px-2",
      search: "Portion Name",
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
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-xl font-bold font-segoe text-gray-800 ">
          Portion Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border font-segoe border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-Portions duration-200 flex items-center gap-2"
          >
            + Add New Portion
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
          widthClass={"w-[450px] max-w-6xl h-[350px]"}
          onClose={() => {
            setForm(false);
          }}
        >
          <div className="h-full flex flex-col bg-gray-100">
            <div className="border-b py-2 px-4 mt-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Portion  Master"
                      : "Portion  Master"
                    : "Add New Portion"}
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
                    <div className="">
                      <div className="flex justify-between">
                        <div>
                          <div className="mb-5 ">
                            <TextInput
                              name="Portion"
                              type="text"
                              value={name}
                              setValue={setName}
                              required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-5">
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
  );
}

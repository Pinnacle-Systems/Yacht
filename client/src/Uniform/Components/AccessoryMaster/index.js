import { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";

import {
  TextInput,
  DropdownInput,
  ToggleButton,
  ReusableTable,
} from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useDispatch } from "react-redux";
import { statusDropdown } from "../../../Utils/DropdownData";
import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";
import Swal from "sweetalert2";
import {
  useAddAccessoryMasterMutation,
  useDeleteAccessoryMasterMutation,
  useGetAccessoryMasterByIdQuery,
  useGetAccessoryMasterQuery,
  useUpdateAccessoryMasterMutation,
} from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetAccessoryGroupMasterQuery } from "../../../redux/uniformService/AccessoryGroupMasterServices";
const MODEL = "Accessory Master";

export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [aliasName, setAliasName] = useState("");
  const [hsn, setHsn] = useState("");
  const [active, setActive] = useState(true);
  const [accessoryGroupId, setAccessoryGroupId] = useState("");

  const [searchValue, setSearchValue] = useState("");
  const [errors, setErrors] = useState({});

  const childRecord = useRef(0);
  const dispatch = useDispatch();
  const nameRef = useRef(null);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetAccessoryMasterQuery({ params, searchParams: searchValue });

  const { data: accessoryGroupList } = useGetAccessoryGroupMasterQuery({
    params,
    searchParams: searchValue,
  });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetAccessoryMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddAccessoryMasterMutation();
  const [updateData] = useUpdateAccessoryMasterMutation();
  const [removeData] = useDeleteAccessoryMasterMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      setName(data?.name || "");
      setHsn(data?.hsn || "");
      setActive(id ? data?.active ?? false : true);
      setAccessoryGroupId(data?.accessoryGroupId || "");
      setAliasName(data?.aliasName || "");
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    hsn,
    active,
    aliasName,
    accessoryGroupId,
    id,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  useEffect(() => {
    if (form && !readOnly && nameRef.current) {
      nameRef.current.focus();
    }
  }, [form, readOnly]);
  const validateData = (data) => {
    if (data.name && data.accessoryGroupId) {
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
      console.log("handle");
    }
  };

  const saveData = () => {
    console.log("Accseessory  Clicked")
    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id !== id)
        ?.some(
          (item) =>
            item.name?.trim().toLowerCase() === name?.trim().toLowerCase()
        );
    } else {
      foundItem = allData?.data?.some(
        (item) => item.name?.trim().toLowerCase() === name?.trim().toLowerCase()
      );
    }

    if (foundItem) {
      Swal.fire({
        text: "The Accessory Name already exists.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
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
        const deldata = await removeData(id).unwrap();
        if (deldata?.statushsn == 1) {
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
    let charhsn = String.fromCharhsn(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charhsn === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setActive(true);
    setName("");
    setHsn("");
    setAliasName("");
    setAccessoryGroupId("");
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
      header: "Accessory Name",
      accessor: (item) => item?.name,
      className: " text-gray-900 text-left pl-2 uppercase w-72",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      className: "text-gray-900 text-center uppercase w-16",
    },
  ];

  return (
    <>
      <div onKeyDown={handleKeyDown} className="p-1">
        <div className="w-full flex bg-white p-1 justify-between  items-center">
          <h5 className="text-2xl font-bold text-gray-800">Accessory Master</h5>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setForm(true);
                onNew();
              }}
              className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
            >
              + Add New Accessory
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
        <div>
          {form === true && (
            <Modal
              isOpen={form}
              form={form}
              widthClass={"w-[650px] h-[55%]"}
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
                      Accessory Master
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
                            <div className="flex flex-wrap w-full ">
                              <div className="mb-3 w-60">
                                <TextInput
                                  name="Accessory Name"
                                  type="text"
                                  value={name}
                                  setValue={setName}
                                  required={true}
                                  readOnly={readOnly}
                                  disabled={
                                    childRecord.current > 0 ? true : undefined
                                  }
                                  ref={nameRef}
                                />
                              </div>
                              <div className="mb-3 w-60 ml-6">
                                <TextInput
                                  name="Alias Name"
                                  type="text"
                                  value={aliasName}
                                  setValue={setAliasName}
                                  readOnly={readOnly}
                                  disabled={
                                    childRecord.current > 0 ? true : undefined
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex flex-wrap w-full">
                              <div className="mb-3 w-60">
                                <DropdownInput
                                  name="Accessory Group"
                                  options={dropDownListObject(
                                    id
                                      ? accessoryGroupList?.data
                                      : accessoryGroupList?.data?.filter(
                                          (item) => item.active
                                        ),
                                    "name",
                                    "id"
                                  )}
                                  value={accessoryGroupId}
                                  setValue={setAccessoryGroupId}
                                  required={true}
                                  readOnly={readOnly}
                                  disabled={
                                    childRecord.current > 0 ? true : undefined
                                  }
                                />
                              </div>
                              <div className="w-60 ml-6">
                                <TextInput
                                  name="HSN Code"
                                  type="text"
                                  value={hsn}
                                  setValue={setHsn}
                                  readOnly={readOnly}
                                  disabled={
                                    childRecord.current > 0 ? true : undefined
                                  }
                                />
                              </div>
                            </div>

                            <div>
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
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
}

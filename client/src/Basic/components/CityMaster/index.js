import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetCityQuery,
  useGetCityByIdQuery,
  useAddCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} from "../../../redux/services/CityMasterService";
import { useGetStateQuery } from "../../../redux/services/StateMasterService";

import { toast } from "react-toastify";
import {
  TextInput,
  DropdownInput,
  DisabledInput,
  ToggleButton,
  ReusableTable,
} from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useDispatch } from "react-redux";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from "../MastersForm/MastersForm";
import { statusDropdown } from "../../../Utils/DropdownData";
import { push } from "../../../redux/features/opentabs";
import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";
import Swal from "sweetalert2";
const MODEL = "City Master";

export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [state, setState] = useState("");

  const [searchValue, setSearchValue] = useState("");
  const [errors, setErrors] = useState({});

  const childRecord = useRef(0);
  const dispatch = useDispatch();
   const cityNameRef = useRef(null);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const {
    data: stateList,
    isLoading: isStateLoading,
    isFetching: isStateFetching,
  } = useGetStateQuery({ params });
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetCityQuery({ params, searchParams: searchValue });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetCityByIdQuery(id, { skip: !id });

  const [addData] = useAddCityMutation();
  const [updateData] = useUpdateCityMutation();
  const [removeData] = useDeleteCityMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      setName(data?.name || "");
      setCode(data?.code || "");
      setActive(id ? data?.active ?? false : true);
      setState(data?.stateId || "");
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
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
    state,
    id,
  };
  useEffect(() => {
    if (form && !readOnly && cityNameRef.current) {
      cityNameRef.current.focus();
    }
  }, [form, readOnly]);
  const validateData = (data) => {
    if (data.name && data.state) {
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
      dispatch({
        type: `StateMaster/invalidateTags`,
        payload: ["State"],
      });
    } catch (error) {
      console.log("handle");
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
          // toast.error(deldata?.message);
          setForm(false);
          return;
        }
        setId("");
        dispatch({
          type: `StateMaster/invalidateTags`,
          payload: ["State"],
        });
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          timer: 1000,
        });
        setForm(false);
      } catch (error) {
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          timer: 1000,
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
    setActive(true);
    setName("");
    setCode("");
    setState("");
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
      header: "City Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: " text-gray-900 text-left pl-2 uppercase w-72",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "text-gray-900 text-center uppercase w-16",
    },
  ];
  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = [
    "S.NO",
    "City Name",
    "Code",
    "State",
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
    "dataObj.state.name",
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

  function countryFromState() {
    return state
      ? stateList?.data?.find((item) => item?.id === parseInt(state)).country
          ?.name
      : "";
  }

  return (
    <>
      <div onKeyDown={handleKeyDown} className="p-1">
        <div className="w-full flex bg-white p-1 justify-between  items-center">
          <h5 className="text-2xl font-bold text-gray-800">City Master</h5>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setForm(true);
                onNew();
              }}
              className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
            >
              + Add New City
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
              widthClass={"w-[45%] h-[55%]"}
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
                      
                          City Master
                        
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
                                  name="City Name"
                                  type="text"
                                  value={name}
                                  setValue={setName}
                                  required={true}
                                  readOnly={readOnly}
                                  disabled={
                                    childRecord.current > 0 ? true : undefined
                                  }
                                   ref={cityNameRef}
                                />
                              </div>
                              <div className="mb-3 w-[150px] ml-6">
                                <TextInput
                                  name="Code"
                                  type="text"
                                  value={code}
                                  setValue={setCode}
                                  // required={true}
                                  readOnly={readOnly}
                                  disabled={
                                    childRecord.current > 0 ? true : undefined
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex flex-wrap w-full justify-between">
                              <div className="mb-3 w-[48%]">
                                <DropdownInput
                                  name="State"
                                  options={dropDownListObject(
                                    id
                                      ? stateList?.data
                                      : stateList?.data?.filter(
                                          (item) => item.active
                                        ),
                                    "name",
                                    "id"
                                  )}
                                  value={state}
                                  setValue={setState}
                                  required={true}
                                  readOnly={readOnly}
                                  disabled={
                                    childRecord.current > 0 ? true : undefined
                                  }
                                  // disabled={true}
                                />
                              </div>
                              <div className="w-[48%]">
                                <TextInput
                                  name="Country"
                                  width={"w-[150px]"}
                                  type="text"
                                  value={countryFromState()}
                                  readOnly={readOnly}
                                  disabled={
                                    childRecord.current > 0 ? true : undefined
                                  }
                                  // disabled={true}
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
                              {/* <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} /> */}
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

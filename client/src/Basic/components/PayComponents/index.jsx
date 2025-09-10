import { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";

import {
  TextInput,
  ReusableTable,
  TextArea,
  DropdownInput,
} from "../../../Inputs";

import { common, earningsTypes } from "../../../Utils/DropdownData";

import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";
import Swal from "sweetalert2";
import { getCommonParams } from "../../../Utils/helper";
import {
  useAddPayComponentMutation,
  useDeletePayComponentMutation,
  useGetPayComponentByIdQuery,
  useGetPayComponentQuery,
  useUpdatePayComponentMutation,
} from "../../../redux/services/PayComponentsService";

const PayComponents = () => {
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");

  const [payCode, setPayCode] = useState("");
  const [payDescription, setPayDescription] = useState("");
  const [earningsType, setEarningsType] = useState();
  const [taxable, setTaxable] = useState();
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const payCodeRef = useRef(null);
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const param = getCommonParams();

  const { branchId } = param;
  const { data: allData } = useGetPayComponentQuery({
    params,
    searchParams: searchValue,
  });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPayComponentByIdQuery(id, { skip: !id });

  const [addData] = useAddPayComponentMutation();
  const [updateData] = useUpdatePayComponentMutation();
  const [removeData] = useDeletePayComponentMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      setPayCode(data?.payCode || "");
      setPayDescription(data?.payDescription);
      setTaxable(data?.taxable);
      setEarningsType(data?.earningsType);
      setNotes(data?.notes);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    id,
    payCode,
    payDescription,
    earningsType,
    taxable,
    branchId,
    notes,
  };
  useEffect(() => {
    if (form && !readOnly && payCodeRef.current) {
      payCodeRef.current.focus();
    }
  }, [form, readOnly]);
  const validateData = (data) => {
    if (data?.payCode && data?.payDescription) {
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
        const deldata = await removeData(id).unwrap();
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
    setPayCode("");
    setPayDescription("");
    setEarningsType("");
    setTaxable("");
    setNotes("");
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
      className: " text-gray-900 w-12 text-center",
    },

    {
      header: "Pay Code",
      accessor: (item) => item?.payCode,
      //   cellClass: () => "  text-gray-900",
      className: " text-gray-900  text-left pl-2 uppercase w-44",
    },
  ];

  return (
    <>
      <div>
        <div onKeyDown={handleKeyDown} className="p-1 ">
          <div className="w-full flex bg-white p-1 justify-between  items-center">
            <h1 className="text-2xl font-bold text-gray-800">Pay Component</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setForm(true);
                  onNew();
                }}
                className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
              >
                + Add Pay Component
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
                    <h2 className="text-lg py-0.5 font-semibold  text-gray-800">
                      Pay Component
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
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                    <div className="space-y-4 ">
                      <div className="flex gap-x-6">
                        <div className="w-[198px]">
                          <TextInput
                            name="Pay Component"
                            type="text"
                            value={payDescription}
                            setValue={setPayDescription}
                            required={true}
                            readOnly={readOnly}
                            ref={payCodeRef}
                            disabled={childRecord.current > 0}
                          />
                        </div>
                        <div className="w-[120px]">
                          <TextInput
                            name="Pay Code"
                            type="text"
                            value={payCode}
                            setValue={setPayCode}
                            required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                          />{" "}
                        </div>
                      </div>
                      <div className="flex gap-x-6">
                        <DropdownInput
                          name="Earnings / Deductions"
                          value={earningsType}
                          setValue={setEarningsType}
                          // required={true}
                          options={earningsTypes}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          // onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                        <DropdownInput
                          name="Taxable"
                          value={taxable}
                          setValue={setTaxable}
                          // required={true}
                          options={common}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          // onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>{" "}
                    </div>
                    <div className="w-72 ">
                      <TextArea
                        name="Notes"
                        type="text"
                        value={notes}
                        setValue={setNotes}
                        // required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />
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
};

export default PayComponents;

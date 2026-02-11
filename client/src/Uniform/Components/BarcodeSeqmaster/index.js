import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import { ToggleButton, ReusableTable, TextInput } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import { Check, Power } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import Swal from "sweetalert2";
import {
  useAddBarcodeSeqMutation,
  useDeleteBarcodeSeqMutation,
  useGetBarcodeSeqByIdQuery,
  useGetBarcodeSeqQuery,
  useUpdateBarcodeSeqMutation,
} from "../../../redux/uniformService/BarcodeSeqMasterServices";
import { set } from "lodash";

const MODEL = "Barcode Seq Master";

export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [prefix, setPrefix] = useState("");
  const [code, setCode] = useState("");
  const [digits, setDigits] = useState("");
  const [seqStart, setSeqStart] = useState(1);
  const [barcodeNo, setBarcodeNo] = useState("");
  const [active, setActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [startWith, setStartWith] = useState();
  const designationRef = useRef(null);
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetBarcodeSeqQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetBarcodeSeqByIdQuery(id, { skip: !id });

  const [addData] = useAddBarcodeSeqMutation();
  const [updateData] = useUpdateBarcodeSeqMutation();
  const [removeData] = useDeleteBarcodeSeqMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) {
        setActive(data?.active);
        setCode(data?.code);
        setDigits(data?.digits);
        setSeqStart(data?.seqStart);
        setBarcodeNo(data?.barcode);
        setPrefix(data?.prefix);
        childRecord.current = data?.childRecord ? data?.childRecord : 0;
      }
    },
    [id],
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  useEffect(() => {
    setStartWith(digits ? String(seqStart).padStart(digits, "0") : "");
    setBarcodeNo(`${prefix}${code}${startWith}`);
  }, [
    setPrefix,
    setCode,
    setDigits,
    setSeqStart,
    setStartWith,
    startWith,
    setBarcodeNo,
    prefix,
    code,
    digits,
    seqStart,
  ]);

  const data = {
    prefix,
    digits,
    seqStart,
    barcodeNo,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId",
    ),
    id,
    code,
  };

  const validateData = (data) => {
    if (
      !data.prefix ||
      typeof data.prefix !== "string" ||
      data.prefix.trim().length < 2
    ) {
      return Swal.fire({
        icon: "error",
        title: "Validation error",
        text: "Prefix must be a string and at least 2 characters long.",
      });
    }
    if (data.prefix.length > 3) {
      return Swal.fire({
        icon: "error",
        title: "Validation error",
        text: "Prefix  should be at Maximum 4 character .",
      });
    }
    if (data.code > 99) {
      return Swal.fire({
        icon: "error",
        title: "Validation error",
        text: "Code should be Two Digits .",
      });
    }
    if (data.digits > 9) {
      return Swal.fire({
        icon: "error",
        title: "Validation error",
        text: "Digits should be Maximum 9 .",
      });
    }
    if (
      data.prefix &&
      data.digits &&
      data.seqStart &&
      data.code &&
      data.seqStart
    ) {
      return true;
    }
    return false;
  };
  useEffect(() => {
    if (form && !readOnly && designationRef.current) {
      designationRef.current.focus();
    }
  }, [form, readOnly]);
  const validateOneActiveBarcode = (active) => {
    if (Boolean(active)) {
      return !allData.data.some((barcode) =>
        id === barcode.id ? false : Boolean(barcode.active),
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
    // if (!validateOneActiveBarcode(data.active)) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Submission error",
    //     text: "Only one Barcode can be active",
    //   });
    //   return;
    // }
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
    setPrefix("");
    setCode("");
    setSeqStart("");
    setBarcodeNo("");
    setDigits("");
    setActive(true);
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
      accessor: (item, index) => index + 1,
      className: " text-gray-900 w-12  text-center",
    },

    {
      header: "Barcode No",
      accessor: (item) => item.barcode,
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
        <h1 className="text-xl font-bold text-gray-800">Barcode Seq Master</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setForm(true);
              onNew();
              setId("");
            }}
            className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Barcode Seq
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
          widthClass={"w-[37%] h-[60%]"}
          onClose={() => {
            setForm(false);
            setId("");
          }}
        >
          <div className="h-full flex flex-col bg-gray-100">
            <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg  py-0.5 font-semibold  text-gray-800">
                  Barcode Seq Master
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
                        <div className="w-24">
                          <TextInput
                            name="Prefix"
                            value={prefix}
                            setValue={setPrefix}
                            required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            ref={designationRef}
                          />
                        </div>

                        <div className="w-24">
                          <TextInput
                            name="Code"
                            value={code}
                            setValue={setCode}
                            required={true}
                            readOnly={readOnly}
                            type="number"
                            disabled={childRecord.current > 0}
                          />
                        </div>

                        <div className="w-24">
                          <TextInput
                            name="Digits"
                            value={digits}
                            setValue={setDigits}
                            required={true}
                            readOnly={readOnly}
                            type="number"
                            disabled={childRecord.current > 0}
                          />
                        </div>
                      </div>
                      <div className="flex gap-x-6">
                        <div className="w-24">
                          <TextInput
                            name="Seq Start"
                            value={seqStart}
                            setValue={setSeqStart}
                            readOnly={readOnly}
                            required={true}
                            disabled={childRecord.current > 0}
                          />
                        </div>
                        <div className="w-24">
                          <TextInput
                            name="Start with"
                            value={startWith}
                            setValue={setStartWith}
                            readOnly={true}
                            disabled={childRecord.current > 0}
                          />
                        </div>

                        <div className="w-32">
                          <TextInput
                            name="Barcode No"
                            value={barcodeNo}
                            setValue={setBarcodeNo}
                            readOnly={true}
                            disabled={childRecord.current > 0}
                          />
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

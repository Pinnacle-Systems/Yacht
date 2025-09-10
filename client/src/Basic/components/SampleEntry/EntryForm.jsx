import React, { useCallback, useEffect, useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import {
  ReusableDropdown,
  ReusableInput,
} from "../../../Uniform/Components/NewOrder/CommonInput";
import moment from "moment";
import {
  useGetStyleSheetByIdQuery,
  useGetStyleSheetQuery,
} from "../../../redux/services/StyleSheet";
import { getCommonParams } from "../../../Utils/helper";
import { useGetSampleEntryByIdQuery } from "../../../redux/services/sampleEntryService";
import { toast } from "react-toastify";
import { HiOutlineRefresh, HiPlus } from "react-icons/hi";
import Grid from "./Grid";
import Modal from "../../../UiComponents/Modal";
import PartyInfo from "../../../Uniform/Components/PurchaseOrder/PartyInfo";
import { getImageUrlPath } from "../../../Constants";
import Swal from "sweetalert2";
import {
  useAddSampleEntryMutation,
 
  useUpdateSampleEntryMutation,
} from "../../../redux/services/sampleEntryService";
import { FiPrinter, FiSave } from "react-icons/fi";

const EntryForm = ({ setReport, setId, readOnly, id, partyData }) => {
  const today = new Date();
  const [date, setDate] = useState(moment.utc(today).format("YYYY-MM-DD"));
  const [submitter, setSubmitter] = useState("");
  const [submittingTo, setSubmittingTo] = useState("Mill Supplier Factory");
  const [supplierId, setSupplierId] = useState("");
  const [sampleEntryGrid, setSampleEntryGrid] = useState([]);
  const [styleId, setStyleId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [supplierName, setSupplierName] = useState("");
  const [supplierMobile, setSupplierMobile] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

  const [attachments, setAttachments] = useState([
    { date: today, filePath: "", log: "" },
  ]);

  const { branchId } = getCommonParams();

  const params = {
    branchId,
  };

  const {
    data: singleData,
  
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSampleEntryByIdQuery(id, { skip: !id });

  const { data: styleData } = useGetStyleSheetQuery({ params });

  const { data: singleStyleData } = useGetStyleSheetByIdQuery(styleId, {
    skip: !styleId,
  });
  const syncFormWithDb = useCallback((data) => {
    if (id) {
      setDate(data?.date ? data.date.split("T")[0] : "");
      setSubmitter(data?.submitter);
      setSubmittingTo(data?.submittingTo);
      setSupplierId(data?.supplierId);
      const mappedGrid = (data?.sampleEntryGrid || [])?.map((item) => ({
        fabCode: item?.fabCode || item?.styleSheet?.fabCode || "",
        styleSheetId: item?.styleSheet?.id || null,
        styleSheet: item?.styleSheet || null,
        sampleEntrySubGrid: (item?.sampleEntrySubGrid || [])?.map(
          (subItem) => ({
            fabType: subItem?.fabType || "",
            fiberContent: subItem?.fiberContent || "",
            weightGSM: subItem?.weightGSM || "",
            widthFinished: subItem?.widthFinished || "",
            smsMoq: subItem?.smsMoq || "",
            smsMcq: subItem?.smsMcq || "",
            smsLeadTime: subItem?.smsLeadTime || "",
            fabricImage: subItem?.fabricImage || "",
          })
        ),
      }));
      setSampleEntryGrid(mappedGrid);
    }
  }, [id]);

  useEffect(() => {
    if (id && singleData) {
      syncFormWithDb(singleData?.data);
      setAttachments(singleData.data?.attachments);
      console.log(singleData?.data, "refetched");
    }
  }, [id,syncFormWithDb, singleData]);

 

  const [addData] = useAddSampleEntryMutation();
  const [updateData] = useUpdateSampleEntryMutation();
  

  console.log(styleData, "singleStyleData");

  // const { data: partyData } = useGetPartyQuery({ params });

  useEffect(() => {
    if (sampleEntryGrid?.length >= 1) return;
    setSampleEntryGrid([
      {
        fabCode: "",
        styleSheetId: null,
        sampleEntrySubGrid: [],
      },
    ]);
  }, []);

  function addNewRow() {
    if (readOnly) return toast.info("Turn on Edit Mode...!!!");
    setSampleEntryGrid((prev) => [
      ...prev,

      {
        Sno: "",
        fabCode: "",
        fabType: "",
        fiberContent: "",
        weightGSM: "",
        widthFinished: "",
        smsMoq: "",
        smsMcq: "",
        smsLeadTime: "",
        fabricImage: "",
      },
    ]);
  }
  const handlePartyChange = (selectedId, field) => {
    const selectedParty = partyData?.data?.find(
      (p) => p.id === Number(selectedId)
    );

    if (field === "supplier") {
      setSupplierId(selectedParty.id);
      setSupplierName(selectedParty.name);
      setSupplierAddress(selectedParty.address);
      setSupplierMobile(selectedParty.mobileNumber);
    }
  };
  useEffect(() => {
    if (supplierId) {
      handlePartyChange(supplierId, "supplier");
    }
  }, [supplierId, setSupplierId]);

  const data = {
    date,
    submitter,
    submittingTo,
    supplierId,
    supplierName,
    supplierAddress,
    supplierMobile,
    sampleEntryGrid,
    attachments,
  };

  useEffect(() => {
    if (attachments?.length >= 1) return;

    setAttachments((prev) => [
      ...(prev || []),
      { date: today, filePath: "", log: "" },
    ]);
  }, [attachments]);

  const resetForm = () => {
  setSubmitter("");
  setSubmittingTo("Mill Supplier Factory");
  setSupplierId("");
  setSampleEntryGrid([]);
  setStyleId("");
  
  setSupplierName("");
  setSupplierMobile("");
  setSupplierAddress("");
  setAttachments([{ date: today, filePath: "", log: "" }]);
};


  const handleSubmitCustom = async (callback, data, text) => {
    try {
      const formData = new FormData();

      for (let key in data) {
        if (key === "attachments") {
          formData.append(
            key,
            JSON.stringify(
              data[key].map((i) => ({
                ...i,
                filePath:
                  i.filePath instanceof File ? i.filePath.name : i.filePath,
              }))
            )
          );
          data[key].forEach((option) => {
            if (option?.filePath instanceof File) {
              formData.append("fabricImage", option.filePath);

              data.file = option?.filePath;
              console.log(data.file, "data.file");
            }
          });
        } else if (key === "sampleEntryGrid") {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }

      if (returnData.statusCode === 1) {
        console.log(returnData.message);

        return;
      }
      setId("");
      setReport(false);
      resetForm()

      Swal.fire({
        icon: "success",
        title: `${text || "Updated"} Successfully`,

        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.log("handle");
      console.log("erroe", error);

      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };

  const saveData = () => {
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };
  
    

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        widthClass={"w-[50%] h-[50%]"}
      >
        <PartyInfo
          type={modalType}
          supplierName={supplierName}
          supplierAddress={supplierAddress}
          supplierMobile={supplierMobile}
        />
      </Modal>
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Sample Entry</h1>
          <button
            onClick={() => {
              setReport(false);
              setId("");
            }}
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>
        <div className="gap-2">
          {/* Basic Information Card */}
          <div className="border border-slate-200  p-2 pl-3 bg-white rounded-md shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium text-slate-700 text-base">
                Basic Details
              </h2>
            </div>

            <div className="flex gap-x-8">
              <div className="w-28">
                <ReusableInput
                  label="Date"
                  type="date"
                  placeholder="Select date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="[&>input]:py-1.5"
                />
              </div>
              <div className="w-44">
                <ReusableInput
                  label="Submitter"
                  type="text"
                  placeholder="Enter Submitter"
                  value={submitter}
                  onChange={(e) => setSubmitter(e.target.value)}
                />
              </div>
              <div className="w-44">
                <ReusableInput
                  label="Submiting to"
                  type="text"
                  value={submittingTo}
                  onChange={(e) => setSubmittingTo(e.target.value)}
                />
              </div>
              <div className="w-72">
                <ReusableDropdown
                  options={partyData?.data?.filter(
                    (cl) => cl.isSupplier === true
                  )}
                  value={supplierId}
                  setValue={(val) => {
                    setSupplierId(val);
                    console.log("val", val);
                  }}
                  // disabled={readOnly}
                  nameField={"name"}
                  className="[&>input]:py-1.5"
                  label="Supplier"
                />
              </div>
              <button
                className="text-blue-600 mt-2  -ml-4  rounded"
                onClick={() => {
                  setModalType("supplier");
                  setModalOpen(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-2">
            <div className="border border-slate-200 p-2  bg-white rounded-md shadow-sm max overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium text-slate-700">List Of Items</h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      addNewRow();
                    }}
                    disabled={readOnly}
                    className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                  >
                    <HiPlus className="w-3 h-3 mr-1" />
                    Add Item
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full border-collapse table-fixed">
                  <thead className="bg-gray-200 width-full text-gray-800">
                    <tr>
                      <th className="w-6 px-4 py-2 text-center font-medium text-[12px]">
                        S.No
                      </th>
                      <th className="w-32 px-4 py-2 text-center font-medium text-[12px]">
                        Fabric Code
                      </th>
                      <th className="w-12 px-4 py-2 text-center font-medium text-[12px]">
                        Fabrictype
                      </th>
                      <th className="w-40 px-4 py-2 text-center font-medium text-[12px]">
                        Fiber Content
                      </th>
                      <th className="w-12 px-4 py-2 text-center font-medium text-[12px]">
                        GSM
                      </th>
                      <th className="w-8 px-3 py-2 text-center font-medium text-[12px]">
                        Width
                      </th>
                      <th className="w-12 px-3 py-2 text-center font-medium text-[12px]">
                        MOQ
                      </th>
                      <th className="w-12 px-3 py-2 text-center font-medium text-[12px]">
                        MCQ
                      </th>
                      <th className="w-12 px-3 py-2 text-center font-medium text-[12px]">
                        Lead Time
                      </th>
                      <th className="w-12 px-3 py-2 text-center font-medium text-[12px]">
                        Image
                      </th>

                      <th className="w-8 px-3 py-2 text-center font-medium text-[12px]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {console.log(sampleEntryGrid, "sampleEntryGrid")}
                    {sampleEntryGrid?.map((item, index) => {
                      return (
                        <Grid
                          key={index}
                          index={index}
                          item={item}
                          sampleEntryGrid={sampleEntryGrid}
                          setSampleEntryGrid={setSampleEntryGrid}
                          styleId={styleId}
                          setStyleId={setStyleId}
                          styleData={styleData?.data || []}
                          singleStyleData={singleStyleData}
                          id={id}
                          readOnly={readOnly}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={saveData}
              className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm"
            >
              <FiSave className="w-4 h-4 mr-2" />
              {id ? "Update" : "Save"}
            </button>
            <button className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
              <HiOutlineRefresh className="w-4 h-4 mr-2" />
              {id ? "Update & Next" : "Save & Next"}
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EntryForm;

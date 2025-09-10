import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import {
  DropdownInput,
  TextArea,
  DisabledInput,
  TextInput,
  DateInput,
  CheckBox,
} from "../../../Inputs";
import {
  useAddSampleMutation,
  useDeleteSampleMutation,
  useGetSampleByIdQuery,
  useGetSampleQuery,
  useUpdateSampleMutation,
} from "../../../redux/uniformService/SampleService";
import moment from "moment";
import { getDateFromDateTime } from "../../../Utils/helper";
import FormSample from "./FormSample";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { dropDownListObject } from "../../../Utils/contructObject";
import {
  useGetPartyByIdQuery,
  useGetPartyQuery,
} from "../../../redux/services/PartyMasterService";
import SampleFormReport from "./SampleFormReport";
import Modal from "../../../UiComponents/Modal";
import PartyLogoUpload from "./PartyLogoUpload";
import StyleImages from "./StyleImages";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import { useSelector } from "react-redux";
import SizeGrid from "./SizeGrid";
import PartySearchComponent from "../../../Utils/PartySearchComponent";
import { PLUS } from "../../../icons";
import SampleDetailsForm from "./SampleDetailsForm";
import useInvalidateTags from "../../../CustomHooks/useInvalidateTags";
import ViewImage from "./ViewImage";
import PrintFormat from "../../PrintFormat-Sample";
import { useGetUserQuery } from "../../../redux/services/UsersMasterService";

const MODEL = "Sample Register";

export default function Form({ }) {
  const [active, setActive] = useState(true);
  const today = new Date();
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState();
  const [form, setForm] = useState(false);
  const [formReport, setFormReport] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [docId, setDocId] = useState("");
  const [sizeId, setSizeId] = useState();
  const [validDate, setValidDate] = useState();
  const [colorId, setColorId] = useState();
  const [styleId, setStyleId] = useState();
  const [merchandId, setMerchandId] = useState();
  const [fabricId, setFabricId] = useState();
  const [partyId, setPartyId] = useState();
  const [phone, setPhone] = useState();
  const [address, setAddress] = useState();
  const [contactPersonName, setContactPersonName] = useState("");
  const [isPartyLogoOpen, setIsPartyLogoOpen] = useState(false);
  const [logo, setLogo] = useState("");
  const [styleImages, setStyleImages] = useState([]);
  const [isStyleImageOpen, setIsStyleImageOpen] = useState(false);
  const [sampleSizeGrid, setSampleSizeGrid] = useState([]);
  const [currentImage, setCurrentImage] = useState("");
  const childRecord = useRef(0);
  const [sampleDetails, setSampleDetails] = useState([]);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  );
  const openTabs = useSelector((state) => state.openTabs);

  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  );

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  const params = {
    branchId,
  };

  const { data: partyList } = useGetPartyQuery({ params });
  const {
    data: singleSupplier,
    isLoading: isSingleSupplierLoading,
    isFetching: isSingleSupplierFetching,
  } = useGetPartyByIdQuery(partyId, { skip: !partyId });
  const { data: branch } = useGetBranchByIdQuery(branchId, { skip: !branchId });

  const { data: colorList } = useGetColorMasterQuery({ params });
  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: fabricList } = useGetFabricMasterQuery({
    params: { ...params, active: true },
  });
  const { data: sizeList } = useGetSizeMasterQuery({ params });
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetSampleQuery({ params, searchParams: searchValue });
  const { data: userRole } = useGetUserQuery({ params });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSampleByIdQuery(id, { skip: !id });

  const [addData] = useAddSampleMutation();
  const [updateData] = useUpdateSampleMutation();
  const [removeData] = useDeleteSampleMutation();

  useEffect(() => {
    setLogo(singleSupplier?.data?.logo);
  }, [
    partyId,
    setLogo,
    singleData,
    isSingleFetching,
    isSingleLoading,
    singleSupplier,
    isSingleSupplierLoading,
    isSingleSupplierFetching,
  ]);

  const getNextDocId = useCallback(() => {
    if (id || isLoading || isFetching) return;
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId);
    }
  }, [allData, isLoading, isFetching, id]);

  useEffect(getNextDocId, [getNextDocId]);

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setMerchandId(data?.userId ? data?.userId : "");
      // setStyleId(data?.styleId ? data?.styleId : "");
      setPartyId(data?.partyId ? data?.partyId : "");
      setContactPersonName(
        data?.contactPersonName ? data?.contactPersonName : ""
      );
      setPhone(data?.phone ? data?.phone : "");
      setAddress(data?.address ? data?.address : "");
      setValidDate(
        data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : ""
      );
      setActive(id ? (data?.active ? data.active : false) : true);
      setDate(
        data?.createdAt
          ? moment.utc(data.createdAt).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      setSampleDetails(data?.sampleDetails ? data?.sampleDetails : []);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id,
    styleId,
    merchandId,
    active,
    userId,
    sampleDetails: sampleDetails?.filter((val) => val.itemId !== ""),
    fabricId,
    branchId,
    partyId,
    phone,
    contactPersonName,
    address,
    validDate,
    companyId,
  };

  const validateData = (data) => {
    if (!partyId || !phone || !contactPersonName || !address) {
      return false;
    }
    return true;
  };



  const [invalidateTagsDispatch] = useInvalidateTags();

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key === "sampleDetails") {
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
              formData.append("images", option.filePath);
            }
          });
        } else {
          formData.append(key, data[key]);
        }
      }

      let returnData;
      if (text == "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }
      if (returnData.statusCode === 0) {
        setId(returnData?.data?.id);
        syncFormWithDb(undefined);
        toast.success(text + "Successfully");
      } else {
        toast.error(returnData?.message);
      }
      invalidateTagsDispatch();
    } catch (error) {
      console.log("handle", error);
    }
  };

  const saveData = () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
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

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let returnData = await removeData(id).unwrap();
        if (returnData.statusCode === 0) {
          setId("");
          syncFormWithDb(undefined);
          toast.success("Deleted Successfully");
        } else {
          toast.error(returnData?.message);
        }
      } catch (error) {
        toast.error("something went wrong");
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
  const handlePrint = () => {
    setPrintModalOpen(true);
  };

  function openPrint(value) {
    if (value) {
      handlePrint();
    } else {
      onNew();
    }
  }

  function resetNew(data) {

    setFabricId(data?.fabricId ? data?.fabricId : "");
    setSampleDetails(data?.sampleDetails ? data?.sampleDetails : []);

    setPartyId(data?.partyId ? data?.partyId : "");
    setContactPersonName(
      data?.contactPersonName ? data?.contactPersonName : ""
    );
    setPhone(data?.phone ? data?.phone : "");
    setAddress(data?.address ? data?.address : "");
    setValidDate(
      data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : ""
    );
    setActive(id ? (data?.active ? data.active : false) : true);
    setDate(
      data?.createdAt
        ? moment.utc(data.createdAt).format("YYYY-MM-DD")
        : moment.utc(today).format("YYYY-MM-DD")
    );
    childRecord.current = data?.childRecord ? data?.childRecord : 0;
  }

  const onNew = () => {
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId);
    }
    setId("");
    setForm(true);
    setReadOnly(false);
    setSearchValue("");
    resetNew(undefined);
  };

  useEffect(() => {
    if (id) return;
    if (
      !singleSupplier?.data ||
      isSingleSupplierLoading ||
      isSingleSupplierFetching
    )
      return;
    if (!partyId) return;
    setPhone(
      singleSupplier?.data?.contactMobile
        ? singleSupplier?.data.contactMobile
        : ""
    );

    setContactPersonName(
      singleSupplier?.data?.contactPersonName
        ? singleSupplier?.data.contactPersonName
        : ""
    );
    setAddress(
      singleSupplier?.data?.address ? singleSupplier?.data.address : ""
    );
  }, [
    setPhone,
    setContactPersonName,
    partyId,
    singleSupplier,
    isSingleSupplierLoading,
    isSingleSupplierFetching,
  ]);

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  function addNewSampleDetails() {
    setSampleDetails((prev) => [
      ...prev,
      { itemId: "", sizeId: "", fabricId: "", colorId: "", filePath: "" },
    ]);
  }

  useEffect(() => {
    if (id) return;
    setSampleDetails((prev) => {
      if (prev.length >= 5) return prev;
      let newArray = Array.from({ length: 5 - prev.length }, (i) => {
        return {
          itemTypeId: "",
          itemId: "",
          fabricId: "",
          sizeId: "",
          colorId: "",
          filePath: "",
        };
      });
      return [...prev, ...newArray];
    });
  }, [setSampleDetails, id, sampleDetails]);


  return (
    <div
      onKeyDown={handleKeyDown}
      className=" md:items-start md:justify-items-center grid h-full bg-theme"
    >
      <Modal
        isOpen={formReport}
        onClose={() => setFormReport(false)}
        widthClass={"px-2 h-[90%] w-[90%]"}
      >
        <SampleFormReport
          onClick={(id) => {
            setId(id);
            setFormReport(false);
          }}
        />
      </Modal>
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PrintFormat
            data={id ? singleData?.data : "Null"}
            party={id ? singleSupplier?.data : "Null"}
            singleData={id ? singleData?.data?.sampleDetails : "Null"}
            date={id ? singleData?.data?.selectedDate : date}
            id={id}
            docId={docId ? docId : ""}
            branch={branch ? branch?.data : ""}
          />
        </PDFViewer>
      </Modal>
      <Modal
        isOpen={isStyleImageOpen}
        onClose={() => setIsStyleImageOpen(false)}
        widthClass={"px-2 h-[55%] w-[35%]"}
      >
        <ViewImage picture={currentImage} />
      </Modal>
      <Modal
        isOpen={isPartyLogoOpen}
        onClose={() => setIsPartyLogoOpen(false)}
        widthClass={"px-2 h-[55%] w-[35%] "}
      >
        <PartyLogoUpload
          logo={logo}
          setLogo={setLogo}
          partyId={partyId}
          setIsPartyLogoOpen={setIsPartyLogoOpen}
        />
      </Modal>
      <div className="flex flex-col frame w-full  h-full">
        <FormHeader
          onNew={onNew}
          openReport={() => setFormReport(true)}
          model={MODEL}
          onPrint={id ? handlePrint : null}
          saveData={saveData}
          setReadOnly={setReadOnly}
          deleteData={deleteData}
        />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
          <div className="col-span-4 grid md:grid-cols-1 border overflow-auto">
            <div className="mr-1 md:ml-2">
              <fieldset className="frame my-1">
                <legend className="sub-heading">Sample Info</legend>

                <div className="grid grid-cols-5 w-[100%]">
                  <DisabledInput name={"DocId."} value={`${docId}`} />
                  <DisabledInput
                    name="Doc. 
                           Date"
                    value={date}
                    type={"Date"}
                    required={true}
                    readOnly={readOnly}
                  />
                  <PartySearchComponent
                    setPartyId={setPartyId}
                    partyId={partyId}
                    name="School Name"
                    readOnly={readOnly}
                    id={id}
                  />
                  <DropdownInput
                    name="Merchandiser"
                    options={dropDownListObject(
                      userRole?.data?.filter(
                        (item) => item.role?.name === "MERCHANDISER"
                      ) || [],
                      "username",
                      "id"
                    )}
                    value={merchandId}
                    setValue={setMerchandId}
                    readOnly={readOnly}
                    required={true}
                  />

                  {/* <DropdownInput name="School Name" options={dropDownListObject((partyList?.data ? partyList?.data : []), "name", "id")} value={partyId} setValue={(value) => { setPartyId(value); }} readOnly={readOnly} required={true} /> */}
                  <TextInput
                    name="Phone No"
                    type="text"
                    value={phone}
                    setValue={setPhone}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                  />
                  <TextInput
                    name="Con.Person.Name"
                    type="text"
                    value={contactPersonName}
                    setValue={setContactPersonName}
                    readOnly={readOnly}
                    required={true}
                    disabled={childRecord.current > 0}
                  />
                  <TextInput
                    name="Address"
                    type="text"
                    value={address}
                    setValue={setAddress}
                    readOnly={readOnly}
                    required={true}
                    disabled={childRecord.current > 0}
                  />
                  {/* <DropdownInput name="Color" options={dropDownListObject((colorList?.data ? colorList?.data : []), "name", "id")} value={colorId} setValue={(value) => { setColorId(value); }} readOnly={readOnly} required={true} /> */}

                  {/* <DropdownInput name="Fabric" options={dropDownListObject((fabricList?.data ? fabricList?.data : []), "name", "id")} value={fabricId} setValue={(value) => { setFabricId(value); }} readOnly={readOnly} required={true} /> */}
                  {/* <DropdownInput
                    name="Style"
                    options={dropDownListObject(
                      styleList?.data ? styleList?.data : [],
                      "name",
                      "id"
                    )}
                    value={styleId}
                    setValue={(value) => {
                      setStyleId(value);
                    }}
                    readOnly={readOnly}
                    required={true}
                  /> */}
                  {/* <DropdownInput name="Size" options={dropDownListObject((sizeList?.data ? sizeList?.data : []), "name", "id")} value={sizeId} setValue={(value) => { setSizeId(value); }} readOnly={readOnly} required={true} /> */}
                  <DateInput
                    name="Delivery.Date"
                    value={validDate}
                    setValue={setValidDate}
                    readOnly={readOnly}
                  />

                  {id && (
                    <button
                      className="bg-blue-400 rounded-md m-2 text-xs ml-2 w-24 p-2"
                      onClick={() => {
                        setIsPartyLogoOpen(true);
                      }}
                    >
                      School Logo
                    </button>
                  )}
                  <CheckBox name="Active" value={active} setValue={setActive} />
                </div>
              </fieldset>

              <div className="w-full grid grid-cols-1 mt-2  px-5">
                <div className="grid grid-cols-1 gap-4 p-1">
                  <table className="border border-gray-300 text-sm table-auto w-full">
                    <thead className="bg-gray-400 border border-gray-400">
                      <tr>
                        <th className="py-1 px-1 w-10 text-left border border-gray-400">
                          S.No
                        </th>
                        <th className="py-1 px-1 w-32 text-left border border-gray-400">
                          ItemType
                        </th>

                        <th className="py-1 px-1 w-32 text-left border border-gray-400">
                          Item
                        </th>
                        <th className="py-1 px-1 w-32 text-left border border-gray-400">
                          Fabric
                        </th>
                        <th className="py-1 px-1 w-32 text-left border border-gray-400">
                          Size
                        </th>
                        <th className="py-1 px-1 w-36 text-left border border-gray-400">
                          Color
                        </th>
                        <th className="py-1 px-1 text-left border border-gray-400">
                          Comments
                        </th>
                        <th className="py-1 px-1 text-left w-24 border border-gray-400">
                          Image
                        </th>

                        <th className="py-1 px-1 w-10 text-center">
                          <button
                            onClick={addNewSampleDetails}
                            className="text-green-800 hover:text-green-900 transition duration-150"
                          >
                            {PLUS}
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="overflow-y-auto">
                      {(sampleDetails ? sampleDetails : []).map(
                        (item, index) => (
                          <SampleDetailsForm
                            key={index}
                            setCurrentImage={setCurrentImage}
                            setIsStyleImageOpen={setIsStyleImageOpen}
                            sampleFollowId={id}
                            item={item}
                            index={index}
                            readOnly={false}
                            setSampleDetails={setSampleDetails}
                            sampleDetails={sampleDetails}
                          />
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* <div className='grid grid-cols-4'>
                                <div className='col-span-2'>
                                    <fieldset className='frame my-1 p-2'>
                                        <legend className='sub-heading'>Size Info</legend>
                                        <SizeGrid sampleSizeGrid={sampleSizeGrid} setSampleSizeGrid={setSampleSizeGrid} id={id} readOnly={readOnly} />
                                    </fieldset>
                                </div>
                                <div className='col-span-2'>
                                    {
                                        id &&

                                        <fieldset className='frame my-1 p-2 w-full'>
                                            <legend className='sub-heading'>Sample Image Info</legend>
                                            <StyleImages id={id} styleImages={styleImages} setStyleImages={setStyleImages} setIsStyleImageOpen={setIsStyleImageOpen} />


                                        </fieldset>
                                    }
                                </div>



                            </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
import { useGetCurrencyMasterQuery } from "../../../redux/services/CurrencyMasterServices";

import { findFromList } from "../../../Utils/helper";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";
import Swal from "sweetalert2";
import { push } from "../../../redux/features/opentabs";
import { setOpenPartyModal } from "../../../redux/features/openModel";
import { toast } from "react-toastify";
import {
  Check,
  LayoutGrid,
  Loader,
  Paperclip,
  Plus,
  Table,
} from "lucide-react";
import {
  DropdownInput,
  Modal,
  MultiSelectDropdown,
  ReusableTable,
  TextArea,
  TextInput,
  ToggleButton,
} from "../../../Inputs";
import {
  dropDownListMergedObject,
  dropDownListObject,
  multiSelectOption,
} from "../../../Utils/contructObject";
import { FaInfoCircle, FaPlus } from "react-icons/fa";

import { statusDropdown } from "../../../Utils/DropdownData";
import AddBranch from "./AddBranch";
import {
  useAddPartyNewMutation,
  useDeletePartyNewMutation,
  useGetPartyNewByIdQuery,
  useGetPartyNewQuery,
  useUpdatePartyNewMutation,
} from "../../../redux/services/PartyMasterNewService";

const MODEL = "Party Master";

export default function Form({ partyId, onCloseForm, openModelForAddress }) {
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [panNo, setPanNo] = useState("");
  const [name, setName] = useState("");
  const [aliasName, setAliasName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tinNo, setTinNo] = useState("");
  const [cstNo, setCstNo] = useState("");
  const [cinNo, setCinNo] = useState("");
  const [faxNo, setFaxNo] = useState("");
  const [website, setWebsite] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [cityId, setCityId] = useState("");
  const [pincode, setPincode] = useState("");
  const [igst, setIgst] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [costCode, setCostCode] = useState("");
  const [isGy, setIsGy] = useState(false);
  const [isDy, setIsDy] = useState(false);
  const [isAcc, setIsAcc] = useState(false);
  const [payTermDay, setPayTermDay] = useState("0");
  const [processDetails, setProcessDetails] = useState([]);
  const [cstDate, setCstDate] = useState("");
  const [mail, setMail] = useState("");
  const [kycEmail, setKycEmail] = useState("");
  const [accessoryItemList, setAccessoryItemList] = useState([]);
  const [accessoryGroup, setAccessoryGroup] = useState(false);
  const [accessoryGroupPrev, setAccessoryGroupPrev] = useState(false);
  const [priceTemplateId, setPriceTemplateId] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [active, setActive] = useState(true);
  const [isSupplier, setSupplier] = useState(false);
  const [isClient, setClient] = useState();
  const [itemsPopup, setItemsPopup] = useState(false);
  const [backUpItemsList, setBackUpItemsList] = useState([]);
  const [shippingAddress, setShippingAddress] = useState([]);
  const [contactDetails, setContactDetails] = useState([]);

  const [contactPersonNumber, setContactPersonNumber] = useState("");
  const [alterContactNumber, setAlterContactNumber] = useState("");

  const [msmeNo, setMsmeNo] = useState("");

  const [formReport, setFormReport] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const [contactPersonName, setContactPersonName] = useState("");

  const [certificate, setCertificate] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState({});
  const [partyCode, setPartyCode] = useState("");
  const [landMark, setlandMark] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [contact, setContact] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranchName, setBankBranchName] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const [branchModelOpen, setBranchModelOpen] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchContact, setBranchContact] = useState("");
  const [branchContactPerson, setBranchcontactPerson] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [openingHours, setopeningHours] = useState("");
  const [branchWebsite, setBranchWebsite] = useState("");
  const [branchAliasName, setBranchAliasName] = useState("");
  const [branchActive, setBranchActive] = useState(true);
  const [branchCity, setBranchCity] = useState("");
  const [branchLandMark, setBranchLandMark] = useState("");
  const [branchPincode, setBranchPincode] = useState("");
  const [branchContactDesignation, setBranchcontactDesignation] = useState("");
  const [branchContactDepartment, setBranchcontactDepartment] = useState("");
  const [branchContactPersonContact, setBranchContactPersonContact] =
    useState("");
  const [branchContactPersonAlterContact, setBranchContactPersonAlterContact] =
    useState("");
  const [branchBankname, setBranchBankName] = useState("");
  const [branchBankBranchName, setBranchBankBranchName] = useState("");
  const [branchAccountNumber, setBranchAccountNumber] = useState("");
  const [branchIfscCode, setBranchIfscCode] = useState("");
  const [branchForm, setBranchForm] = useState(true);
  const [partyBranch, setPartyBranch] = useState([]);
  const [rawMaterial, setRawMaterial] = useState(false);
  const [material, setMaterial] = useState("");
  const [materialActive, setMaterialActive] = useState(true);
  const [materialId, setMaterialId] = useState("");
  const [branchType, setBranchType] = useState("");
  const [branchInfo, setBranchInfo] = useState([]);
  const [selected, setSelected] = useState([]);
  const [materialForm, setMaterialForm] = useState(false);
  const [view, setView] = useState("all");
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isContactPerson, setIsContactPerson] = useState(false);
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [contactId, setContactId] = useState("");
  const [contactPersonEmail, setContactPersonEmail] = useState("");
  const [tooltipVisibleForMaterial, setTooltipVisibleForMaterial] =
    useState("");
  const [branchAlterContact, setBranchAlterContact] = useState("");
  const [branchContactPersonEmail, setBranchContactPersonEmail] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  // const [readOnly, setReadOnly] = useState(false)
  // const [id, setId] = useState("");
  const [showImageTooltip, setShowImageTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [payTermId,setPayTermId] = useState("")

  const branchState = {
    branchModelOpen,
    setBranchModelOpen,
    branchName,
    setBranchName,

    branchAddress,
    setBranchAddress,
    branchContact,
    setBranchContact,
    branchContactPerson,
    setBranchcontactPerson,
    branchEmail,
    setBranchEmail,
    openingHours,
    setopeningHours,
    branchWebsite,
    setBranchWebsite,
    branchAlterContact,
    setBranchAlterContact,
    branchContactPersonEmail,
    setBranchContactPersonEmail,
    branchContactPersonContact,
    setBranchContactPersonContact,
    branchContactPersonAlterContact,
    setBranchContactPersonAlterContact,

    branchAliasName,
    setBranchAliasName,
    branchCode,
    setBranchCode,
    branchActive,
    setBranchActive,
    branchCity,
    setBranchCity,
    branchLandMark,
    setBranchLandMark,
    branchPincode,
    setBranchPincode,
    branchContactDesignation,
    setBranchcontactDesignation,
    branchContactDepartment,
    setBranchcontactDepartment,
    branchBankname,
    setBranchBankName,
    branchBankBranchName,
    setBranchBankBranchName,
    branchAccountNumber,
    setBranchAccountNumber,
    branchIfscCode,
    setBranchIfscCode,
    branchType,
    setBranchType,
  };

  const childRecord = useRef(0);
  const dispatch = useDispatch();
  const [country, setCountry] = useState("");

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  let accessoryItemsMasterList;

  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  );
  const params = {
    companyId,
  };
  const { data: cityList } = useGetCityQuery({ params });

  const { data: payTermList } = useGetPaytermMasterQuery({ params });

  const { data: currencyList } = useGetCurrencyMasterQuery({ params });

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetPartyNewQuery({ params, searchParams: searchValue });
  // const openPartyModal = useSelector((state) => state.party.openPartyModal);
  let openPartyModal;
  // const lastTapName = useSelector((state) => state.party.lastTab);
  let lastTapName;

  const activeTab = useSelector(
    (state) => state.openTabs.tabs.find((tab) => tab.active).name
  );

  useEffect(() => {
    if (openPartyModal) {
      setId("");
      setForm(true);
    }
  }, [openPartyModal]);

  console.log(currencyList, "currency");
  const {
    data: singleData,
    refetch,

    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPartyNewByIdQuery(id, { skip: !id });

  const [addData] = useAddPartyNewMutation();
  const [updateData] = useUpdatePartyNewMutation();
  const [removeData] = useDeletePartyNewMutation();
  // const [removeBranchData] = useDeletePartyBranchMutation();

  let filterParty;

  if (view == "Customer") {
    filterParty = allData?.data?.filter((item) => item.isClient);
  }
  if (view === "Supplier") {
    filterParty = allData?.data?.filter((item) => item.isSupplier);
  }
  if (view == "all") {
    filterParty = allData?.data;
  }

  console.log(selected, "selected");

  const syncFormWithDb = useCallback(
    (data) => {
      // if (id || partyId) {
      //   if (openModelForAddress || partyId) {
      //     setReadOnly(  );
      //   }
      //   else {
      //     setReadOnly(true);
      //   }
      // } else {
      //   setReadOnly(false);
      // }]
      let contactdetails = data?.PartyContactDetails?.[0];
      console.log(contactDetails, "contactDetails");
      if (materialId) {
        setMaterial();
      }
      setPanNo(data?.panNo || "");
      setName(data?.name || "");
      setAliasName(data?.aliasName || "");
      setPartyCode(data?.partyCode || "")
      console.log(data?.partyCode,"data?.partyCode");
      
      setImage(data?.image || "");
      setDisplayName(data?.displayName || "");
      setAddress(data?.address || "");
      setTinNo(data?.tinNo || "");
      setCstNo(data?.cstNo || "");
      setIsGy(data?.isGy || false);
      setIsDy(data?.isDy || false);
      setIsAcc(data?.isAcc || false);
      setCinNo(data?.cinNo || "");
      setFaxNo(data?.faxNo || "");
      setCinNo(data?.cinNo || "");
      setContactPersonName(data?.contactPersonName || "");
      setGstNo(data?.gstNo || "");
      setCostCode(data?.costCode || "");
      // setCstDate(
      //   data?.cstDate ? moment.utc(data?.cstDate).format("YYYY-MM-DD") : ""
      // );
      setPayTermId(data?.payTermId || null);
      setCode(data?.code || "");
      setPincode(data?.pincode || "");
      setWebsite(data?.website || "");
      setEmail(data?.email || "");
      setCityId(data?.cityId || "");
      setActive(id ? data?.active : true);

      setAccessoryGroup(data?.accessoryGroup || false);
      setAccessoryItemList(
        data?.PartyOnAccessoryItems
          ? data.PartyOnAccessoryItems.map((item) =>
              parseInt(item.accessoryItemId)
            )
          : []
      );
      setPriceTemplateId(data?.priceTemplateId || "");
      setShippingAddress(data?.ShippingAddress ? data?.ShippingAddress : []);
      setContactDetails(data?.ContactDetails ? data.ContactDetails : "");
      setContactPersonName(
        data?.contactPersonName
          ? data?.contactPersonName
          : undefined
      );
      setContactPersonEmail(
        data?.email ? data?.email : undefined
      );
      setContactPersonNumber(
        data?.contactPersonNumber
          ? data?.contactPersonNumber
          : undefined
      );
      setAlterContactNumber(
        data?.alterContactNumber
          ? data?.alterContactNumber
          : undefined
      );
      setContactId(contactdetails?.id ? contactdetails?.id : undefined);
      setDesignation(
        data?.designation ? data?.designation : undefined
      );
      setDepartment(
        data?.department ? data?.department : undefined
      );
      setSupplier(data?.isSupplier || false);
      setClient(data?.isClient || false);
      setBranchAddress(data?.branchAddress ? data?.branchAddress : "");
      setBranchEmail(data?.branchEmail ? data?.branchEmail : "");
      setBranchContact(data?.branchContact ? data?.branchContact : "");
      setBranchName(data?.branchName ? data?.branchName : "");
      setBranchCode(data?.branchCode ? data?.branchCode : "");
      setBranchInfo(data?.partyBranch ? data?.partyBranch : []);
      setBankName(data?.bankName ? data?.bankName : "");
      setBankBranchName(data?.branchName ? data?.branchName : "");
      setAccountNumber(data?.accountNumber ? data?.accountNumber : "");
      setIfscCode(data?.ifscCode ? data?.ifscCode : "");
      setlandMark(data?.landMark ? data?.landMark : "");
      setPartyCode(data?.partyCode ? data?.partyCode : "");
      setMsmeNo(data?.msmeNo ? data?.msmeNo : "");
      setContact(data?.contact ? data?.contact : "");
      setAlterContactNumber(
        data?.alterContactNumber ? data?.alterContactNumber : ""
      );
      setCurrencyId(data?.currencyId ? data?.currencyId : "");
      setPayTermId(data?.payTermId ? data?.payTermId : "");
      setProcessDetails(
        data?.PartyOnProcess
          ? data.PartyOnProcess.map((item) => {
              return {
                value: parseInt(item.processId),
                label: findFromList(item.processId, processList.data, "name"),
              };
            })
          : []
      );
      // setSelected(data?.PartyMaterials ? data?.PartyMaterials  : []  )
      setSelected(
        data?.PartyMaterials
          ? data.PartyMaterials.map((item) => ({
              label: item.name,
              value: item.value,
              id: item.id,
            }))
          : []
      );
    },

    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id,
    userId,
    isClient,
    isSupplier,
    name,
    aliasName,
    partyCode,
    active,
    displayName,

    address,
    landMark,
    cityId,
    pincode,
    email,
    contact,

    contactPersonName,
    designation,
    department,
    contactPersonEmail,
    contactPersonNumber,
    alterContactNumber,
    currencyId,
    payTermId ,
    panNo,
    gstNo,
    msmeNo,
    cinNo,
    bankName,
    bankBranchName,
    accountNumber,
    ifscCode,
    companyId,
    // accessoryGroup,
    // shippingAddress,
    // contactDetails,
    // accessoryItemList,
    // processDetails: processDetails
    //   ? processDetails.map((item) => item.value)
    //   : undefined,

    // branchInfo : branchInfo?.filter(item  => item.branchName !== "") ,

    // partyMaterials: selected,
    // material,
    // materialActive,
    // rawMaterial,

    // branchStateValues: {
    //   branchName,
    //   branchAddress,
    //   branchContact,
    //   branchContactPerson,
    //   branchEmail,
    //   openingHours,
    //   branchWebsite,

    //   branchAliasName,
    //   branchCode,
    //   branchActive,
    //   branchCity,
    //   branchLandMark,
    //   branchPincode,
    //   branchContactDesignation,
    //   branchContactDepartment,
    //   branchBankname,
    //   branchBankBranchName,
    //   branchAccountNumber,
    //   branchIfscCode,
    // },
  };

  // const [sendKycEmail, { isLoadingMail }] = useSendKycEmailMutation();
  const {
    data: processList,
    isLoading: isProcessLoading,
    isFetching: isProcessFetching,
  } = useGetProcessMasterQuery({ params });

  const validateData = (data) => {
    if (data.name) {
      return true;
    }

    return false;
  };

  console.log(attachments, "attachments");

  const handleSubmitCustom = async (callback, data, text, exit = false) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key === "attachments") {
          formData.append(
            key,
            JSON.stringify(
              data[key].map((i) => ({
                ...i,
                filePath: i.filePath instanceof File ? i.fil : i.filePath,
              }))
            )
          );
          data[key].forEach((option) => {
            if (option?.filePath instanceof File) {
              formData.append("file", option.filePath);
            }
          });
        }
      }
      console.log(formData, "formData");
      data.attachmentsFormData = formData;

      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        try {
          returnData = await callback(data).unwrap();
          Swal.fire({
            icon: "success",
            title: `${text || "Saved"} Successfully`,
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (error) {
          console.error("Submission error:", error);
          Swal.fire({
            icon: "error",
            title: "Submission error",
            text: error.data?.message || "Something went wrong!",
          });
        }
      }

      dispatch({
        type: `accessoryItemMaster/invalidateTags`,
        payload: ["AccessoryItemMaster"],
      });
      dispatch({
        type: `CityMaster/invalidateTags`,
        payload: ["City/State Name"],
      });
      dispatch({
        type: `CurrencyMaster/invalidateTags`,
        payload: ["Currency"],
      });

      setId(returnData?.data?.id);
      onNew();
      setForm(false);
      setStep(1);
      if (exit) {
        // setForm(false);
      }
      // if (exit) {
      //   if (openPartyModal === true && lastTapName) {
      //     dispatch(push({ name: lastTapName }));
      //   }

      //   dispatch(setOpenPartyModal(false));
      // }
      //  setForm(false);
      //  setRawMaterial(false)
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };

  // const handleSendEmail = async () => {
  //   if (!kycEmail) {
  //     alert("Please enter an email address.");
  //     return;
  //   }

  //   try {
  //     const response = await sendKycEmail({ to: kycEmail });

  //     if (response?.data) {
  //       alert("Email sent successfully!");
  //       setKycEmail("");
  //     } else {
  //       alert("Failed to send email. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("An error occurred while sending the email.");
  //   }
  // };

  useEffect(() => {
    if (itemsPopup) {
      setBackUpItemsList(accessoryItemList);
    }
  }, [itemsPopup]);
  useEffect(() => {
    if (accessoryGroup) {
      if (accessoryItemsMasterList) {
        setAccessoryItemList(
          accessoryItemsMasterList.data.map((item) => parseInt(item.id))
        );
      }
    }
  }, [accessoryGroup, accessoryItemsMasterList]);

  const SaveBranch = () => {
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
      // setRawMaterial(false)
    } else {
      handleSubmitCustom(addData, data, "Added");
      // setRawMaterial(false)
    }
  };

  const saveData = () => {
    if (isSupplier) {
      console.log(selected.length <= 0, "condiion");
      if (selected.length <= 0) {
        Swal.fire({
          icon: "error",
          title: `Select One Material...!`,
          showConfirmButton: false,
          timer: 3000,
        });
        return false;
      }
    }
    if (!validateData(data)) {
      Swal.fire({
        icon: "warning",
        title: `Please fill all required fields...!`,
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      console.log("hit");
      handleSubmitCustom(addData, data, "Added");
    }
  };
  const saveExitData = () => {
    if (!validateData(data)) {
      toast.error("Please fill all required fields...!", {
        position: "top-center",
      });
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", true);
    } else {
      handleSubmitCustom(addData, data, "Added", true);
    }
  };

  const deleteData = async (id) => {
    console.log(id);

    if (!window.confirm("Are you sure to delete...?")) {
      return;
    }
    try {
      let deldata = await removeData(id).unwrap();
      if (deldata?.statusCode == 1) {
        toast.error(deldata?.message);
        return;
      }
      dispatch({
        type: `accessoryItemMaster/invalidateTags`,
        payload: ["AccessoryItemMaster"],
      });
      setId("");
      dispatch({
        type: `CityMaster/invalidateTags`,
        payload: ["City/State Name"],
      });
      dispatch({
        type: `CurrencyMaster/invalidateTags`,
        payload: ["Currency"],
      });
      syncFormWithDb(undefined);
      Swal.fire({
        icon: "success",
        title: `Deleted Successfully`,
        showConfirmButton: false,
        timer: 2000,
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

  const deletePartyBranchData = async (partyBranchId) => {
    if (partyBranchId) {
      console.log(!window.confirm("Are you sure to delete...?"), "window");
      // if (window.confirm("Are you sure to delete...?")) {
      //       try {
      //       let deldata = await removeBranchData(partyBranchId).unwrap();
      //       if (deldata?.statusCode == 1) {
      //         toast.error(deldata?.message);
      //         return;
      //       }
      //       toast.success("Deleted Successfully");
      //     } catch (error) {
      //       toast.error("something went wrong");
      //     }
      // }
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
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setId("");
    syncFormWithDb(undefined);
  };

  function handleInputbranch(value, index, field) {
    console.log(value, "value");
    const newBlend = structuredClone(branchInfo);
    if (field === "branchType") {
      let condition = branchInfo?.map((item) => item.branchType !== "1");
      console.log(condition, "condition", branchInfo);
      if (condition) {
        newBlend[index][field] = value;
      }
    } else {
      newBlend[index][field] = value;
    }
    setBranchInfo(newBlend);
  }

  function deleteBranch(index, id) {
    if (readOnly) return toast.info("Turn on Edit Mode...!!!");
    if (id) {
      setBranchInfo((prev) =>
        prev?.filter((v, i) => parseInt(v?.id) !== parseInt(id))
      );
      deletePartyBranchData(id);
    } else {
      setBranchInfo((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function addNewBranch() {
    setPartyBranch((prev) => [
      ...prev,
      {
        branchName: "",
        branchCode: "",
        branchEmail: "",
        branchContact: "",
        branchAddress: "",
      },
    ]);
  }

  function removeItem(index) {
    setContactDetails((contactDetails) => {
      return contactDetails.filter((_, i) => parseInt(i) !== parseInt(index));
    });
  }

  console.log("loaded");

  const [step, setStep] = useState(1);

  const openKYCInNewTab = () => {
    window.open("/kyc-form", "_blank");
  };

  useEffect(() => {
    if (!partyId) return;
    if (partyId == "new") {
      onNew();
    } else {
      setId(partyId);
    }
    setForm(true);
    if (openModelForAddress) {
      setIsAddressExpanded(true);
    }
  }, [partyId, openModelForAddress]);

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
        await removeData(orderId);
        setId("");
        onNew();
        Swal.fire({
          icon: "success",
          title: `Deleted Successfully`,
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
      }
    }
  };

  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },

    {
      header: "Name",
      accessor: (item) => item.name,
      cellClass: () => "font-medium text-gray-900",
      className: "text-gray-800 uppercase w-72",
    },
    {
      header: "Address",
      accessor: (item) => item.address,
      cellClass: () => "font-medium text-gray-900",
      className: "text-gray-800 uppercase w-72",
    },
    {
      header: "",
      accessor: (item) => item.nonme,
      cellClass: () => "font-medium text-gray-900",
      className: "text-gray-800 uppercase w-[60%]",
    },
  ];

  const handleChange = (type) => {
    setSupplier(type == "supplier");
    setClient(type == "client");
  };
  const handleFun = () => {
    console.log("Hit");
    console.log(branchForm, "bg");

    setBranchForm(false);
    console.log(branchForm, "branch");
  };
  const options = allData?.materialData;

  const handleCheckboxChange = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  if (isLoading || isFetching) return <Loader />;
  console.log(singleData, "singleData");

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="w-full  mx-auto rounded-md shadow-lg px-2 py-1 overflow-y-auto mt-1">
        <div className="w-full flex justify-between mb-2 items-center px-0.5">
          <h1 className="text-xl font-bold text-gray-800">
            Customer/Supplier Master{" "}
          </h1>
          <div className="flex items-center gap-4 text-md">
            <button
              onClick={() => {
                setForm(true);
                onNew();
              }}
              className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={12} />
              <span className=" ">Add New Customer/Supplier</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("all")}
                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                  view === "all"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Table size={16} />
                All
              </button>
              <button
                onClick={() => setView("Customer")}
                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                  view === "Customer"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Table size={16} />
                Customer
              </button>
              <button
                onClick={() => setView("Supplier")}
                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                  view === "Supplier"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <LayoutGrid size={16} />
                Supplier
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <Mastertable
                    // header={'Party list'}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    onDataClick={onDataClick}
                    tableHeaders={tableHeaders}
                    tableDataNames={tableDataNames}
                    data={allData?.data}
                    loading={
                        isLoading || isFetching
                    }
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                /> */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3 w-">
        <ReusableTable
          columns={columns}
          data={filterParty || []}
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
          widthClass={"w-[90%] h-[95%]"}
          onClose={() => {
            setForm(false);
            setErrors({});
          }}
        >
          <Modal
            isOpen={branchModelOpen}
            form={form}
            widthClass={` ${
              branchForm ? "w-[60%] h-[80%]" : "w-[90%] h-[90%]"
            } `}
            setBranchModelOpen={setBranchModelOpen}
            onClose={() => {
              setBranchModelOpen(false);
              refetch();
            }}
          >
            <AddBranch
              singleData={singleData}
              partyId={id}
              branchEmail={branchEmail}
              setBranchEmail={setBranchEmail}
              setBranchAddress={setBranchAddress}
              branchName={branchName}
              setBranchName={setBranchName}
              branchCode={branchCode}
              setBranchCode={setBranchCode}
              branchAddress={branchAddress}
              branchContact={branchContact}
              setBranchContact={setBranchContact}
              branchContactPerson={branchContactPerson}
              setBranchcontactPerson={setBranchcontactPerson}
              branchWebsite={branchWebsite}
              setBranchWebsite={setBranchWebsite}
              openingHours={openingHours}
              setopeningHours={setopeningHours}
              onNew={onNew}
              branchType={branchType}
              handleFun={handleFun}
              setPartyId={setId}
              childRecord={childRecord}
              saveData={saveData}
              saveExitData={saveExitData}
              setReadOnly={setReadOnly}
              deleteData={deleteData}
              readOnly={readOnly}
              onCloseForm={onCloseForm}
              handleChange={handleChange}
              contactDetails={contactDetails}
              setContactDetails={setContactDetails}
              shippingAddress={shippingAddress}
              setForm={setForm}
              onClose={() => {
                setBranchModelOpen(false);
              }}
              branchForm={branchForm}
              setBranchForm={setBranchForm}
              removeItem={removeItem}
              setBranchInfo={setBranchInfo}
              branchInfo={branchInfo}
              partyBranch={partyBranch}
              setPartyBranch={setPartyBranch}
              setBranchModelOpen={setBranchModelOpen}
              name={name}
              setBranchType={setBranchType}
              handleInputbranch={handleInputbranch}
              deleteBranch={deleteBranch}
              cityList={cityList}
              branchState={branchState}
              refetch={refetch}
            />
          </Modal>

          {/* <Modal
                    isOpen={rawMaterial}
                    widthClass={`${"w-[50%] h-[70%]"}`}
                    setRawmeterial={setRawMaterial}
                    onClose={() => {
                      setRawMaterial(false)
                      setMaterialForm(false)
                      }}
                      allData ={allData}
             
              >
                  <RawMaterial    
                      addData={addData} 
                      updateData={updateData}
                      SaveBranch={SaveBranch}
                      material={material}
                      setMaterial={setMaterial}
                      setMaterialActive={setMaterialActive}
                      materialActive = {materialActive}  
                      allData={allData}
                      setMaterialForm={setMaterialForm}
                      materialForm={materialForm}
                      setMaterialId={setMaterialId}
                      materialId={materialId}

                  />
              </Modal> */}
          {/* <Modal
                    isOpen={isContactPerson}
                    widthClass={`${ branchForm ?   "w-[33%] h-[71%]"  : "w-[60%] h-[68%]"  }`}
                    setIsContactPerson={setIsContactPerson}
                    onClose={() => {
                      setIsContactPerson(false)
                      // setMaterialForm(false)
                      }}
                      allData ={allData}
             
              >
                  <ContactPersonDetails    
                     partyData={singleData?.data}   partyId={id} contactNumber={contactNumber} setContactNumber={setContactNumber} 
                     contactPersonName={contactPersonName}  setContactPersonName={setContactPersonName}  designation={designation}
                     setDesignation={setDesignation} setDepartment={setDepartment}   department={department}
                      setIsContactPerson={setIsContactPerson}  setContactPersonEmail={setContactPersonEmail}  contactPersonEmail={contactPersonEmail}
                       branchForm={branchForm}   refetch={refetch} syncFormWithDb ={syncFormWithDb} alterContactNumber={alterContactNumber}
                      setAlterContactNumber={setAlterContactNumber}
                       setBranchForm={setBranchForm}
                        onClose={() => {
                        setIsContactPerson(false) 
                      }}

                  />
              </Modal> */}
          <Modal
            isOpen={formReport}
            onClose={() => setFormReport(false)}
            widthClass={"p-3 h-[70%] w-[70%]"}
          >
            {/* <ArtDesignReport
          // userRole={userRole}
          setFormReport={setFormReport}
          tableWidth="100%"
          formReport={formReport}
          setAttachments={setAttachments}
          attachments={attachments}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        /> */}
          </Modal>

          <div className="h-full flex flex-col bg-[f1f1f0] ">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3 ">
              <div className="flex items-center gap-2">
                <h2 className="text-md font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Customer/Supplier"
                      : "Customer/Supplier Master"
                    : "Add New Customer/Supplier"}
                </h2>
              </div>

              <div className="flex gap-2">
                <div className="  ">
                  <button
                    onClick={() => {
                      if (name) {
                        setBranchModelOpen(true);
                        setBranchForm(false);
                      } else {
                        Swal.fire({
                          icon: "warning",
                          title: `Enter ${
                            isSupplier ? "Supplier Details" : "Customer Details"
                          } `,
                          showConfirmButton: false,
                          timer: 2000,
                        });
                      }
                    }}
                    readOnly={readOnly}
                    className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Branch
                  </button>
                </div>
                <div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={saveData}
                      className="px-2 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-4 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Basic Details
                    </h3>
                    <div className="grid grid-cols-2">
                      <div className="flex flex-row items-center gap-2 mt-2 mb-2">
                        <div className="flex items-center gap-2 ">
                          <input
                            type="radio"
                            name="type"
                            checked={isClient}
                            onChange={() => handleChange("client")}
                            readOnly={readOnly}
                          />
                          <label className="block text-xs font-bold text-gray-600 mt-1">
                            Customer
                          </label>
                        </div>
                        <div className="flex flex-row gap-2">
                          <input
                            type="radio"
                            name="type"
                            checked={isSupplier}
                            onChange={() => handleChange("supplier")}
                            readOnly={readOnly}
                          />
                          <label className="block text-xs font-bold text-gray-600 mt-1">
                            Supplier
                          </label>
                        </div>
                        <div className="col-span-4 flex flex-row">
                          {isSupplier && (
                            <div className="w-48">
                              <MultiSelectDropdown
                                // name={"Material List"}
                                options={multiSelectOption(
                                  allData ? allData?.materialData : [],
                                  "name",
                                  "id"
                                )}
                                labelName="name"
                                setSelected={setSelected}
                                selected={selected}
                              />
                            </div>
                          )}

                          {isSupplier && (
                            <div className="mt-3 px-3 relative inline-block">
                              {/* Button */}
                              <button
                                className="w-7 h-6 border border-green-500 rounded-md mt-2
                hover:bg-green-500 text-green-600 hover:text-white
                transition-colors flex items-center justify-center"
                                onClick={() => setRawMaterial(true)}
                                onMouseEnter={() =>
                                  setTooltipVisibleForMaterial(true)
                                }
                                onMouseLeave={() =>
                                  setTooltipVisibleForMaterial(false)
                                }
                              >
                                <FaPlus className="text-sm w-3 h-4" />
                              </button>

                              {/* Tooltip (shown below and right-aligned to button) */}
                              {tooltipVisibleForMaterial && (
                                <div className="absolute left-full top-0 ml-2 mt-1 w-56 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg z-10">
                                  <div className="flex items-start">
                                    <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                    <span>Click to add a new Material</span>
                                  </div>
                                  {/* Tooltip arrow */}
                                  <div className="absolute top-2 -left-1 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <TextArea
                          name={isSupplier ? "Supplier Name" : "Customer Name"}
                          type="text"
                          value={name}
                          inputClass="h-8"
                          setValue={setName}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onBlur={(e) => {
                            if (aliasName) return;
                            setAliasName(e.target.value);
                          }}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="col-span-2">
                        <TextArea
                          name="Alias Name"
                          type="text"
                          inputClass="h-8"
                          value={aliasName}
                          setValue={setAliasName}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="col-span-1">
                        <TextInput
                          name="Party Code"
                          type="text"
                          value={partyCode}
                          setValue={setPartyCode}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>
                      {/* <div className="col-span-1">
                          <DateInput
                                name="Date of Registration"
                                
                                value={partyCode}
        
                                setValue={setPartyCode}
                                readOnly={readOnly}
                                disabled={childRecord.current > 0}
                                className="focus:ring-2 focus:ring-blue-100 w-10"
                              />
                      </div> */}
                      <div className="mt-5 ml-3">
                        <ToggleButton
                          name="Status"
                          options={statusDropdown}
                          value={active}
                          setActive={setActive}
                          required={true}
                          readOnly={readOnly}
                          className="bg-gray-100 p-1 rounded-lg"
                          activeClass="bg-[#f1f1f0] shadow-sm text-blue-600"
                          inactiveClass="text-gray-500"
                        />
                      </div>

                      <div className="mt-5 ml-3"></div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Address Details
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <TextArea
                            name="Address"
                            inputClass="h-10"
                            value={address}
                            setValue={setAddress}
                            required={true}
                            readOnly={readOnly}
                            d
                            isabled={childRecord.current > 0}
                          />
                        </div>
                        <TextInput
                          name="Land Mark"
                          type="text"
                          value={landMark}
                          setValue={setlandMark}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <DropdownInput
                          name="City/State Name"
                          options={dropDownListMergedObject(
                            id
                              ? cityList?.data
                              : cityList?.data?.filter((item) => item.active),
                            "name",
                            "id"
                          )}
                          country={country}
                          masterName="CITY MASTER"
                          lastTab={activeTab}
                          value={cityId}
                          setValue={(val)=> setCityId(parseInt(val) || 0 )}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />

                        <div className="col-span-2 flex flex-row gap-3">
                          <div className="w-24">
                            <TextInput
                              name="Pincode"
                              type="text"
                              value={pincode}
                              required={true}
                             setValue={(val) => setPincode(parseInt(val) || 0)}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100 w-10"
                            />
                          </div>
                          <div className="w-64">
                            <TextInput
                              name={"Email"}
                              type="text"
                              value={email}
                              setValue={setEmail}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100 w-10"
                            />
                            <div></div>
                          </div>
                        </div>
                        <div>
                          <TextInput
                            name={"Contact Number"}
                            type="number"
                            value={contact}
                            setValue={(val) => setContact(parseInt(val) || 0)}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Contact Details
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 flex flex-row gap-4 mt-2">
                          <div className="w-96">
                            <TextInput
                              name="Contact Person Name"
                              type="text"
                              value={contactPersonName}
                              setValue={setContactPersonName}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100 w-10"
                            />
                          </div>
                          <div className="relative inline-block">
                            <button
                              className="w-7 h-6 border border-green-500 rounded-md mt-6
                                            hover:bg-green-500 text-green-600 hover:text-white
                                            transition-colors flex items-center justify-center"
                              disabled={readOnly}
                              onClick={() => {
                                // openAddModal();
                                // setIsDropdownOpen(false);
                                // setEditingItem("new");
                                // setOpenModel(true);
                                setBranchForm(false);
                                setIsContactPerson(true);
                              }}
                              onMouseEnter={() => setTooltipVisible(true)}
                              onMouseLeave={() => setTooltipVisible(false)}
                              aria-label="Add supplier"
                            >
                              <FaPlus className="text-sm" />
                            </button>

                            {tooltipVisible && (
                              <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                                <div className="flex items-start">
                                  <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                  <span>Click to add a new Contact Person</span>
                                </div>
                                <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <TextInput
                          name="Designation"
                          type="text"
                          value={designation}
                          setValue={setDesignation}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <TextInput
                          name="Department"
                          type="text"
                          value={department}
                          setValue={setDepartment}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <div className="col-span-2">
                          <TextInput
                            name="Email"
                            type="text"
                            value={contactPersonEmail}
                            setValue={setContactPersonEmail}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                        <div className="col-span-1">
                          <TextInput
                            name="Contact Number"
                            type="number"
                            value={contactPersonNumber}
                            setValue={(val) => setContactPersonNumber(parseInt(val) || 0)}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                        <div className="col-span-1">
                          <TextInput
                            name="Alternative Contact Number"
                            type="number"
                            value={alterContactNumber}
                            setValue={(val) => setAlterContactNumber(parseInt(val) || 0)}
                            // readOnly={readOnly}
                            // disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Business Details
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <DropdownInput
                          name="Currency"
                          options={dropDownListObject(
                            id
                              ? currencyList?.data ?? []
                              : currencyList?.data?.filter(
                                  (item) => item.active
                                ) ?? [],
                            "name",
                            "id"
                          )}
                          lastTab={activeTab}
                          masterName="CURRENCY MASTER"
                          value={currencyId}
                          setValue={parseInt(setCurrencyId)}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />

                        <DropdownInput
                          name="PayTerm"
                          options={dropDownListObject(
                            id
                              ? payTermList?.data
                              : payTermList?.data?.filter(
                                  (item) => item.active
                                ),
                            "name",
                            "id"
                          )}
                          value={payTermId}
                          setValue={parseInt(setPayTermId)}
                          // required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                        <TextInput
                          name="Pan No"
                          type="pan_no"
                          value={panNo}
                          setValue={setPanNo}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                        <TextInput
                          name="GST No"
                          type="text"
                          value={gstNo}
                          setValue={setGstNo}
                          readOnly={readOnly}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                        <TextInput
                          name="MSME CERTFICATE  No"
                          type="text"
                          value={msmeNo}
                          setValue={setMsmeNo}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                        <TextInput
                          name="CIN No"
                          type="text"
                          value={cinNo}
                          setValue={setCinNo}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Bank Details
                    </h3>
                    <div className="space-y-2">
                      <TextInput
                        name="Bank Name"
                        type="text"
                        value={bankName}
                        setValue={setBankName}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <TextInput
                          name="Branch Name"
                          type="text"
                          value={bankBranchName}
                          setValue={setBankBranchName}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <TextInput
                          name="Account Number"
                          type="text"
                          value={accountNumber}
                          setValue={(val) => setAccountNumber(parseInt(val))}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <TextInput
                          name="IFSC CODE"
                          type="text"
                          value={ifscCode}
                          setValue={setIfscCode}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[240px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Attachments
                    </h3>
                    <div className="space-y-2">
                      <div className="flex pt-4">
                        <button
                          className="relative w-20 h-7 bg-gray-800    text-white rounded-md shadow-md hover:shadow-xl hover:scale-105 
        transform transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center"
                          onClick={() => setFormReport(true)}
                        >
                          <span className="absolute inset-0 bg-white opacity-10 rounded-md"></span>
                          <Paperclip className="relative z-10 w-5 h-5" />
                        </button>
                      </div>
                      {/* <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-slate-700">
                        Fabric Image Upload
                      </h3>
                      <div
                        className="relative"
                        onMouseEnter={() => setShowImageTooltip(true)}
                        onMouseLeave={() => setShowImageTooltip(false)}
                      >
                        <FaQuestionCircle className="text-slate-400 text-sm cursor-help" />
                        {showImageTooltip && (
                          <div className="absolute z-10 left-full ml-2 w-48 bg-slate-800 text-white text-xs rounded p-2 shadow-lg">
                            Upload high-quality fabric images (max 5MB)
                            <div className="absolute -left-1 top-2 w-2.5 h-2.5 bg-slate-800 transform rotate-45"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Fabric preview"
                            className="h-48 object-contain mb-2 cursor-pointer"
                            onClick={() => setShowModal(true)}
                            disabled={readOnly}
                          />
                          <button
                            // onClick={handleRemoveImage}
                            className="text-xs text-red-600 hover:text-red-800"
                            disabled={readOnly}
                          >
                            Remove Image
                          </button>
                        </>
                      ) : (
                        <>
                          <FaUpload className="text-slate-400 text-2xl mb-2" />
                          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded transition-colors">
                            Choose File
                            <input
                              type="file"
                              className="hidden"
                              name="fabricImage"
                              accept="image/*"
                              // onChange={handleImageUpload}
                              disabled={readOnly}
                              // ref={fileInputRef}
                            />
                          </label>
                          <p className="text-xs text-slate-500 mt-1">
                            JPEG, PNG (max 5MB)
                          </p>
                        </>
                      )}
                    </div>

                    {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-white p-4 rounded shadow-lg max-w-full max-h-full">
                          <img
                            src={imagePreview}
                            disabled={readOnly}
                            alt="Full preview"
                            className="max-h-[80vh] max-w-[90vw] object-contain"
                          />
                          <button
                            onClick={() => setShowModal(false)}
                            className="block mt-4 mx-auto text-sm text-blue-600 hover:text-blue-800"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div> */}
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

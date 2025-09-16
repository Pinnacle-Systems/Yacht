import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  useGetPartyQuery,
  useGetPartyByIdQuery,
} from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
// import { useGetTaxTemplateQuery } from '../../../redux/ErpServices/TaxTemplateServices';
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import {
  LongDropdownInput,
  DisabledInput,
  DropdownInput,
  DateInput,
  TextInput,
} from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
// import { poTypes, } from '../../../Utils/DropdownData';
import YarnPoItems from "./YarnPoItems";
import FabricPoItems from "./FabricPoItems";
import AccessoryPoItems from "./AccessoryPoItems";
import Consolidation from "../Consolidation";
import PoItemsSelection from "./PoItemsSelection";
import AccessoryInwardItems from "./AccessoryInwardItems";
import FabricInwardItems from "./FabricInwardItems";
import moment from "moment";
// import PoSummary from "./PoSummary";
import Modal from "../../../UiComponents/Modal";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import PurchaseOrderFormReport from "./PurchaseOrderFormReport";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { Loader } from "../../../Basic/components";
import {
  useAddDirectInwardOrReturnMutation,
  useDeleteDirectInwardOrReturnMutation,
  useGetDirectInwardOrReturnByIdQuery,
  useGetDirectInwardOrReturnQuery,
  useUpdateDirectInwardOrReturnMutation,
} from "../../../redux/uniformService/DirectInwardOrReturnServices";
import {
  getCommonParams,
  isGridDatasValid,
  sumArray,
} from "../../../Utils/helper";
import { directOrPo, poTypes } from "../../../Utils/DropdownData";
import PurchaseInwardForm from "./PurchaseInwardForm";

const MODEL = "Purchase Inward / Direct Inward";

export default function Form() {
  const [readOnly, setReadOnly] = useState(false);
  const [directInwardReturnItems, setDirectInwardReturnItems] = useState([]);
  const [docId, setDocId] = useState("");
  const [id, setId] = useState("");
  const [date, setDate] = useState();
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [dcDate, setDcDate] = useState("");

  const [transType, setTransType] = useState("DyedFabric");
  const [poInwardOrDirectInward, setPoInwardOrDirectInward] =
    useState("DirectInward");
  const [supplierId, setSupplierId] = useState("");

  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);

  const [locationId, setLocationId] = useState("");

  const [storeId, setStoreId] = useState("");

  const [dcNo, setDcNo] = useState("");

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [vehicleNo, setVehicleNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [inwardItemSelection, setInwardItemSelection] = useState(false);

  const childRecord = useRef(0);
  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const branchIdFromApi = useRef(branchId);
  const params = {
    branchId,
    companyId,
  };

  const { data: supplierList } = useGetPartyQuery({ params: { ...params } });

  // const { data: taxTypeList } =
  //   useGetTaxTemplateQuery({ params: { ...params } });

  const { data: supplierDetails } = useGetPartyByIdQuery(supplierId, {
    skip: !supplierId,
  });

  const { data: payTermList } = useGetPaytermMasterQuery({
    params: { ...params },
  });

  // const { data: allData, isLoading, isFetching } = useGetDirectInwardOrReturnQuery({ params: { branchId, poInwardOrDirectInward, finYearId } });

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  // const getNextDocId = useCallback(() => {
  //   if (isLoading || isFetching) return
  //   if (id) return
  //   if (allData?.nextDocId) {
  //     setDocId(allData.nextDocId)
  //   }
  // }, [allData, isLoading, isFetching, id])

  // useEffect(getNextDocId, [getNextDocId])

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetDirectInwardOrReturnByIdQuery(id, { skip: !id });

  const [addData] = useAddDirectInwardOrReturnMutation();
  const [updateData] = useUpdateDirectInwardOrReturnMutation();
  const [removeData] = useDeleteDirectInwardOrReturnMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      if (id) {
        setReadOnly(true);
      } else {
        setReadOnly(false);
      }
      setTransType(data?.poType ? data.poType : "DyedFabric");
      setPoInwardOrDirectInward(
        data?.poInwardOrDirectInward
          ? data?.poInwardOrDirectInward
          : "DirectInward"
      );
      setDate(
        data?.createdAt
          ? moment.utc(data.createdAt).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      setDirectInwardReturnItems(data?.directItems ? data.directItems : []);
      if (data?.docId) {
        setDocId(data?.docId);
      }
      if (data?.date) setDate(data?.date);
      // setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
      setPayTermId(data?.payTermId ? data?.payTermId : "");
      setSupplierId(data?.supplierId ? data?.supplierId : "");
      setDcDate(
        data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : ""
      );
      setDcNo(data?.dcNo ? data.dcNo : "");
      setLocationId(data?.Store ? data.Store.locationId : "");
      setStoreId(data?.storeId ? data.storeId : "");
      setVehicleNo(data?.vehicleNo ? data?.vehicleNo : "");
      setSpecialInstructions(
        data?.specialInstructions ? data?.specialInstructions : ""
      );
      setRemarks(data?.remarks ? data?.remarks : "");
      if (data?.branchId) {
        branchIdFromApi.current = data?.branchId;
      }
    },
    [id]
  );

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    poType: transType,
    poInwardOrDirectInward,
    supplierId,
    dcDate,

    payTermId,
    branchId,
    id,
    userId,
    storeId,
    directInwardReturnItems: directInwardReturnItems?.filter(
      (po) => po.fabricId || po.accessoryId
    ),
    discountType,
    discountValue,
    dcNo,
    remarks,
    specialInstructions,
    vehicleNo,
    finYearId,
  };

  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU";
    }
    return false;
  }

  const validateData = (data) => {
    let mandatoryFields = ["uomId", "colorId", "price"];
    let lotMandatoryFields = ["qty"];
    if (transType === "GreyYarn" || transType === "DyedYarn") {
      mandatoryFields = [...mandatoryFields, "yarnId"];
      lotMandatoryFields = [...lotMandatoryFields, "noOfBags", "weightPerBag"];
    } else if (transType === "GreyFabric" || transType === "DyedFabric") {
      mandatoryFields = [
        ...mandatoryFields,
        ...[
          "fabricId",
          "designId",
          "gaugeId",
          "loopLengthId",
          "gsmId",
          "kDiaId",
          "fDiaId",
        ],
      ];
      lotMandatoryFields = [...lotMandatoryFields, "noOfRolls"];
    } else if (transType === "Accessory") {
      mandatoryFields = [...mandatoryFields, ...["accessoryId"]];
    }

    return (
      data.poType &&
      data.supplierId &&
      data.dcDate &&
      data.payTermId &&
      data.dcNo &&
      (data.poType === "Accessory"
        ? isGridDatasValid(data.directInwardReturnItems, false, [
            ...mandatoryFields,
            "qty",
          ])
        : data.directInwardReturnItems.every(
            (item) =>
              item?.inwardLotDetails &&
              isGridDatasValid(
                item?.inwardLotDetails,
                false,
                lotMandatoryFields
              )
          )) &&
      isGridDatasValid(data.directInwardReturnItems, false, mandatoryFields) &&
      data.directInwardReturnItems.length !== 0
    );
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        toast.success(text + "Successfully");
        setId("");
        syncFormWithDb(undefined);
      }
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
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
        await removeData(id);
        setId("");
        onNew();
        toast.success("Deleted Successfully");
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

  const onNew = () => {
    setId("");
    setSearchValue("");
    setReadOnly(false);
    syncFormWithDb(undefined);
    // getNextDocId()
  };

  const tableHeadings = ["PoNo", "PoDate", "PoType", "DueDate", "Supplier"];
  const tableDataNames = ["dataObj?.id", "dataObj.active ? ACTIVE : INACTIVE"];
  useEffect(() => {
    if (id) return;
    setDirectInwardReturnItems([]);
  }, [transType, id]);

  const allSuppliers = supplierList ? supplierList.data : [];

  function filterSupplier() {
    let finalSupplier = [];
    if (transType.toLowerCase().includes("yarn")) {
      finalSupplier = allSuppliers.filter((s) => s.yarn);
    } else if (transType.toLowerCase().includes("fabric")) {
      finalSupplier = allSuppliers.filter((s) => s.fabric);
    } else {
      finalSupplier = allSuppliers.filter(
        (s) => s.PartyOnAccessoryItems.length > 0
      );
    }
    return finalSupplier;
  }
  let supplierListBasedOnSupply = filterSupplier();

  const getTotalIssuedQty = () => {
    if (transType === "Accessory") {
      return directInwardReturnItems?.reduce(
        (total, current) => total + current?.qty,
        0
      );
    } else {
      return directInwardReturnItems?.reduce((total, current) => {
        return (
          total +
          sumArray(
            current?.inwardLotDetails ? current.inwardLotDetails : [],
            "qty"
          )
        );
      }, 0);
    }
  };

  useEffect(() => {
    if (id) return;
    setDirectInwardReturnItems([]);
    setSupplierId("");
  }, [transType]);

  // const { data: locationData } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });

  // const storeOptions = locationData ?
  //   locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
  //   [];

  function removeItem(id) {
    setDirectInwardReturnItems((directInwardItems) => {
      let newItems = structuredClone(directInwardItems);
      newItems = newItems.filter(
        (item) => parseInt(item.poItemsId) !== parseInt(id)
      );
      return newItems;
    });
  }

  // if (!branchList || !locationData) return <Loader />

  // let taxItems = transType !== "Accessory" ? directInwardReturnItems.map(item => {
  //   let newItem = structuredClone(item)
  //   newItem["qty"] = sumArray(newItem?.inwardLotDetails ? newItem?.inwardLotDetails : [], "qty")
  //   return newItem
  // }) : directInwardReturnItems

  return (
    <>
      <PurchaseInwardForm />
    </>
  );
}


import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { poTypes } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    DateInput,
    DropdownInput,
    DropdownNew,
    ReusableSearchableInput,
    TextInput,
} from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import {
    useGetPartyQuery,
} from "../../../redux/services/PartyMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import { useAddPurchaseReturnMutation, useDeletePurchaseReturnMutation, useGetPurchaseReturnByIdQuery, useUpdatePurchaseReturnMutation } from "../../../redux/services/PurchaseReturnService";
import { useGetPurchaseInwardEntryQuery, useLazyGetPurchaseDetailQuery } from "../../../redux/uniformService/PurchaseInwardEntry";
import ReturnItems from "./ReturnItems";

const PurchaseReturnForm = ({ onClose, id, setId }) => {
    const [docId, setDocId] = useState("New");
    const [readOnly, setReadOnly] = useState("");
    const [returnType, setReturnType] = useState("Fabric");
    const [supplierId, setSupplierId] = useState("");
    const [locationId, setLocationId] = useState("");
    const [storeId, setStoreId] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [purchaseReturnItems, setPurchaseReturnItems] = useState([]);
    const [docDate, setDocDate] = useState("")
    const { branchId, companyId, userId, finYearId } = getCommonParams();
    const branchIdFromApi = useRef(branchId);
    const [pdfOpen, setPdfOpen] = useState(false);
    const [invNo, setInvNo] = useState("")
    const params = {
        branchId,
        companyId,
    };
    const { data: partyList } = useGetPartyQuery({ params: { ...params } });
    const { data: branchList } = useGetBranchQuery({ params: { companyId } });
    const { data: invList } = useGetPurchaseInwardEntryQuery({ params: { branchId } });

    const { data: locationData } = useGetLocationMasterQuery({
        params: { branchId },
        searchParams: searchValue,
    });

    const storeOptions = locationData
        ? locationData.data.filter(
            (item) => parseInt(item.locationId) === parseInt(locationId)
        )
        : [];

    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetPurchaseReturnByIdQuery(id, { skip: !id });

    const [addData] = useAddPurchaseReturnMutation();
    const [updateData] = useUpdatePurchaseReturnMutation();
    const [removeData] = useDeletePurchaseReturnMutation();
    const [getPurchaseDetail] = useLazyGetPurchaseDetailQuery();
    const isFabric = returnType === "Fabric"

    const data = {
        docId,
        docDate,
        returnType,
        supplierId,
        branchId,
        id,
        userId,
        storeId,
        purchaseReturnItems: isFabric ?
            purchaseReturnItems?.filter((item) => item.styleId) : purchaseReturnItems?.filter((item) => item.accessoryId),
        finYearId,
        locationId,
        invNo
    };

    const syncFormWithDb = useCallback(
        (data) => {
            const today = new Date();
            if (data?.docId) {
                setDocId(data?.docId);
            }
            setDocDate(
                data?.docDate
                    ? moment.utc(data.docDate).format("YYYY-MM-DD")
                    : moment.utc(today).format("YYYY-MM-DD")
            );
            setReturnType(data?.returnType ? data.returnType : "Fabric");
            setSupplierId(data?.supplierId ? data?.supplierId : "");
            setLocationId(data?.Store ? data.Store.locationId : branchId);
            setStoreId(data?.storeId ? data.storeId : "");
            if (data?.branchId) {
                branchIdFromApi.current = data?.branchId;
            }
            setPurchaseReturnItems(data?.purchaseReturnItems ? data.purchaseReturnItems : []);
            setInvNo(data?.invNo ? data?.invNo : "")
        },
        [id]
    );

    const handleSubmitCustom = async (callback, data, text, nextProcess) => {
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback(data).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            if (returnData.statusCode === 0) {
                if (nextProcess == "new") {
                    setId(0);
                    setDocId("New");
                    syncFormWithDb(undefined);
                } else {
                    onClose();
                }
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
            } else {
                toast.error(returnData?.message);
            }
        } catch (error) {
            console.log("handle");
        }
    };

    const hasDuplicates = (items) => {
        const seen = new Set();

        for (const row of items) {
            // Create a unique key using all fields you want to check
            const key = [
                row.styleId || "",
                row.accessoryId || "",
                row.sizeId || "",
                row.portionId || ""
            ].join("-");

            if (seen.has(key)) return true; // duplicate found
            seen.add(key);
        }
        return false;
    };

    const validateData = (data) => {
        const items = data?.purchaseReturnItems || [];

        // remove blank rows
        const filledItems = items.filter(
            (item) =>
                item.styleId ||
                item.styleItemId ||
                item.fabricId ||
                item.accessoryId
        );

        // duplicate check
        if (hasDuplicates(filledItems)) {
            toast.info("Duplicate items found!", {
                position: "top-center",
                autoClose: 2000,
            });
            return false;
        }
        if (!(data?.storeId &&
            data?.supplierId &&
            data?.invNo &&
            filledItems.length > 0 &&
            (isFabric
                ? isGridDatasValid(
                    filledItems,
                    false,
                    ["returnFabMeter"]
                )
                : isGridDatasValid(
                    filledItems,
                    false,
                    ["returnQty"]
                )))) {

            toast.info("Please fill all required fields...!", {
                position: "top-center",
            });
            return false;
        }
        return true;
    };

    // const validateData = (data) => {
    //     return (
    //         data?.storeId && data?.supplierId && data?.invNo && (isFabric ? isGridDatasValid(data?.purchaseReturnItems.filter((item) => item?.styleId), false, ["returnFabMeter"]) : isGridDatasValid(data?.purchaseReturnItems.filter((item) => item?.accessoryId), false, ["returnQty"]))
    //         && data?.purchaseReturnItems.length > 0
    //     )
    // };

    const saveData = (nextProcess) => {
        if (!validateData(data)) {
            return;
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return;
        }
        if (nextProcess == "draft" && !id) {
            handleSubmitCustom(
                addData,
                { ...data, draftSave: true },
                "Added",
                nextProcess
            );
        } else if (id && nextProcess == "draft") {
            handleSubmitCustom(
                updateData,
                { ...data, draftSave: true },
                "Updated",
                nextProcess
            );
        } else if (id) {
            handleSubmitCustom(updateData, data, "Updated", nextProcess);
        } else {
            handleSubmitCustom(addData, data, "Added", nextProcess);
        }
    };

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    useEffect(() => {
        console.log(invList, "invList")
    }, [invList])


    const handleAddRow = async (newValue) => {
        setInvNo(newValue)
        if (!storeId) {
            toast.info("Please Choose Location...!", {
                position: "top-center",
                autoClose: 2000,
            });
            return;
        }
        const hasUnfilledRequired = purchaseReturnItems.some((row) => {
            const isFabric = returnType === "Fabric";

            const hasSelected =
                isFabric ? row.styleId : row.accessoryId;

            const isRequiredMissing =
                isFabric ? !row.returnFabMeter : !row.returnQty;

            return hasSelected && isRequiredMissing;
        });

        if (hasUnfilledRequired) {
            toast.info("Please fill all required fields before adding...!", {
                position: "top-center",
            });
            return;
        }
        try {
            const { data: purchaseData } = await getPurchaseDetail({
                params: {
                    invNo: newValue,
                    storeId,
                    branchId,
                },
            });
            setReturnType(purchaseData?.returnType);
            setSupplierId(purchaseData?.supplierId);
            const purchaseItems = purchaseData?.data;
            if (!purchaseItems) return;
            setPurchaseReturnItems((prev) => {
                const updated = [...prev];
                // Find first empty slot index
                let startIndex = updated.findIndex(
                    (row) =>
                        !row.styleNo &&
                        !row.styleItemId &&
                        !row.fabricId &&
                        !row.accessoryId &&
                        !row.accessoryGroupId &&
                        !row.styleId
                );
                if (startIndex === -1) startIndex = updated.length;

                // Fill in sizeRows starting at first empty slot
                purchaseItems.forEach((row, i) => {
                    if (startIndex + i < updated.length) {
                        updated[startIndex + i] = { ...row };
                    } else {
                        updated.push({ ...row }); // append if no empty slot
                    }
                });

                // Ensure at least 6 rows
                while (updated.length < 4) {
                    updated.push({
                        styleNo: "",
                        fabricId: "",
                        styleId: "",
                        styleItemId: "",
                        colorId: "",
                        qty: "",
                        fabWidth: "",
                        fabMeter: "",
                        noOfPcs: "",
                        accessoryId: "",
                        accessoryGroupId: "",
                        sizeId: "",
                        uomId: "",
                        qty: "",
                        selected: false,
                    });
                }

                return updated;
            });
        } catch (error) {
            console.error("Error adding row:", error);
        }

    };

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };



    return (
        <div onKeyDown={handleKeyDown}>
            {/* <Modal
                isOpen={pdfOpen}
                onClose={() => setPdfOpen(false)}
                widthClass={"w-[90%] h-[90%]"}
            >
                <PDFViewer style={tw("w-full h-full")}>
                    <PDF singleData={singleData?.data} branchList={branchList} />
                </PDFViewer>
            </Modal> */}
            <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-xl font-bold text-gray-800">Purchase Return</h1>
                    <button
                        onClick={onClose}
                        className="text-indigo-600 hover:text-indigo-700"
                        title="Open Report"
                    >
                        <FaFileAlt className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="space-y-3  mt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                        <h2 className="font-medium text-slate-700 mb-2">Basic Details</h2>
                        <div className="grid grid-cols-2 gap-1">
                            <ReusableInput label="Purchase Return No" readOnly value={docId} />
                            <ReusableInput
                                label="Purchase Return Date"
                                value={docDate}
                                type={"date"}
                                required={true}
                                readOnly={true}
                                disabled
                            />
                        </div>
                    </div>
                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                        <div className="grid grid-cols-1 gap-1">
                            <h2 className="font-medium text-slate-700 mb-2">Location Details</h2>
                            <div className="grid grid-cols-2 gap-1">
                                <DropdownInput
                                    name="Branch"
                                    options={
                                        branchList
                                            ? dropDownListObject(
                                                id
                                                    ? branchList?.data
                                                    : branchList?.data?.filter((item) => item.active),
                                                "branchName",
                                                "id"
                                            )
                                            : []
                                    }
                                    value={locationId}
                                    setValue={(value) => {
                                        setLocationId(value);
                                        setStoreId("");
                                    }}
                                    required={true}
                                    readOnly={id}
                                />
                                <DropdownInput
                                    name="Location"
                                    options={dropDownListObject(
                                        id
                                            ? storeOptions
                                            : storeOptions?.filter((item) => item.active),
                                        "storeName",
                                        "id"
                                    )}
                                    value={storeId}
                                    setValue={setStoreId}
                                    required={true}
                                    readOnly={id}
                                    autoFocus={true}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                        <h2 className="font-medium text-slate-700 mb-2">Return Details</h2>
                        <div className="grid grid-cols-2 gap-1">
                            {/* <ReusableInput
                                label="Invoice No"
                                value={invNo}
                                setValue={setInvNo}
                                type={"text"}
                                required={true}
                                readOnly={readOnly}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.stopPropagation();
                                        handleAddRow();
                                    }
                                }}
                            /> */}
                            <DropdownNew
                                name="Inv No"
                                dataList={
                                    invList?.data
                                }
                                value={invNo}
                                setValue={handleAddRow}
                                required={true}
                                readOnly={readOnly}
                                placeholder={"Select Inv"}
                                otherField={"invNo"}
                                otherValue={"invNo"}
                                disabled={id}
                            />
                            <DropdownInput
                                name="Return Type"
                                options={poTypes}
                                value={returnType}
                                setValue={setReturnType}
                                required={true}
                                readOnly={id}
                                beforeChange={() => {
                                    setPurchaseReturnItems([]);
                                }}
                            />
                            <DropdownInput
                                name="Supplier"
                                options={
                                    partyList
                                        ? dropDownListObject(
                                            id
                                                ? partyList?.data
                                                : partyList?.data?.filter((item) => item.active),
                                            "name",
                                            "id"
                                        )
                                        : []
                                }
                                value={supplierId}
                                setValue={(value) => {
                                    setSupplierId(value);
                                }}
                                required={true}
                                readOnly={id}
                            />
                            {/* <TextInput
                                name={"Invoice No"}
                                value={invNo}
                                setValue={setInvNo}
                                readOnly={readOnly}
                                required
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.stopPropagation();
                                        handleAddRow();
                                    }
                                }}
                            /> */}

                        </div>
                    </div>


                </div>
                <fieldset>

                    <ReturnItems
                        id={id}
                        returnType={returnType}
                        params={params}
                        purchaseReturnItems={purchaseReturnItems}
                        setPurchaseReturnItems={setPurchaseReturnItems}
                        readOnly={readOnly}
                    />
                </fieldset>

                <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => saveData("new")}
                            className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm"
                        >
                            <FiSave className="w-4 h-4 mr-2" />
                            Save & New
                        </button>
                        <button
                            onClick={() => saveData("close")}
                            className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm"
                        >
                            <HiOutlineRefresh className="w-4 h-4 mr-2" />
                            Save & Close
                        </button>
                        <button
                            onClick={() => saveData("draft")}
                            className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm"
                        >
                            <HiOutlineRefresh className="w-4 h-4 mr-2" />
                            Draft Save
                        </button>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {/* <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
              <FiShare2 className="w-4 h-4 mr-2" />
              Email
            </button> */}
                        <button
                            className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                            onClick={() => setReadOnly(false)}
                        >
                            <FiEdit2 className="w-4 h-4 mr-2" />
                            Edit
                        </button>
                        <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                            <FaWhatsapp className="w-4 h-4 mr-2" />
                            WhatsApp
                        </button>
                        <button
                            className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                            disabled={!id}
                            onClick={() => {
                                setPdfOpen(true);
                            }}
                        >
                            <FiPrinter className="w-4 h-4 mr-2" />
                            Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseReturnForm;


import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { PaymentTypeData } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    DateInput,
    DropdownInput,
    DropdownNew,
    TextInput,
} from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import {
    useGetPartyByIdQuery,
    useGetPartyQuery,
} from "../../../redux/services/PartyMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { findFromList, getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import { toast } from "react-toastify";
import PurchaseBillItems from "./PurchaseBillItems";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import { useDispatch } from "react-redux";
// import PDF from "./PrintFormat/PDF";
import tw from "../../../Utils/tailwind-react-pdf";
import { Loader } from "../../../Basic/components";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import secureLocalStorage from "react-secure-storage";
import { useAddPurchaseBillMutation, useDeletePurchaseBillMutation, useGetPurchaseBillByIdQuery, useGetPurchaseBillQuery, useUpdatePurchaseBillMutation } from "../../../redux/services/PurchaseBillService";
import PurchaseBillSummary from "./PurchaseBillSummary";
import { useGetSalesEntryQuery, useLazyGetSalesDCDetailQuery } from "../../../redux/uniformService/SalesEntryService";

const PurchaseBillForm = ({ onClose, id, setId, readOnly, setReadOnly,
    sizeList,
    styleItemList,
    colorList,
    uomList,
    taxTypeList
}) => {
    const [docId, setDocId] = useState("New");
    const [paymentType, setPaymentType] = useState("");
    const [invValue, setInvValue] = useState("");
    const [invDate, setInvDate] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [vehicleNo, setVehicleNo] = useState("");
    const [remarks, setRemarks] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [invNo, setInvNo] = useState("")
    const [purchaseBillItems, setPurchaseBillItems] = useState([]);
    const [docDate, setDocDate] = useState("")
    const { branchId, companyId, userId, finYearId } = getCommonParams();
    const branchIdFromApi = useRef(branchId);
    const [pdfOpen, setPdfOpen] = useState(false);
    const params = {
        branchId,
        companyId,
    };
    const [contactPerson, setContactPerson] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [dcNo, setDcNo] = useState("")
    const { data: partyList } = useGetPartyQuery({ params: { ...params } });
    const { data: locationData } = useGetLocationMasterQuery({
        params: { branchId },
        searchParams: searchValue,
    });
    const [taxTemplateId, setTaxTemplateId] = useState("");
    const [summary, setSummary] = useState(false);
    const [discountType, setDiscountType] = useState("Percentage");
    const [discountValue, setDiscountValue] = useState();
    const [termsAndCondition, setTermsAndCondition] = useState("");
    const [getSalesDCDetail] = useLazyGetSalesDCDetailQuery();

    const { data: salesList } = useGetSalesEntryQuery({
        params: { companyId, branchId },
    });
    const finyearId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentFinYear"
    );
    const {
        data: allData,
        isFetching,
        isLoading,
    } = useGetPurchaseBillQuery({
        params: {
            branchId,
            finyearId,
        },
    });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetPurchaseBillByIdQuery(id, { skip: !id });

    const [addData] = useAddPurchaseBillMutation();
    const [updateData] = useUpdatePurchaseBillMutation();
    const [removeData] = useDeletePurchaseBillMutation();
    const dispatch = useDispatch();

    const isLoadingIndicator = isSingleFetching || isSingleLoading;

    const data = {
        docId,
        docDate,
        paymentType,
        supplierId,
        invDate,
        branchId,
        id,
        userId,
        purchaseBillItems: purchaseBillItems?.filter((item) => item.styleItemId),
        finYearId,
        vehicleNo,
        remarks,
        invNo,
        invValue,
        contactPerson,
        contactNumber,
        taxTemplateId,
        discountType,
        discountValue,
        termsAndCondition,
        dcNo
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
            setPaymentType(data?.paymentType ? data.paymentType : "");
            setSupplierId(data?.supplierId ? data?.supplierId : "");
            setInvDate(
                data?.invDate ? moment.utc(data?.invDate).format("YYYY-MM-DD") : ""
            );
            if (data?.branchId) {
                branchIdFromApi.current = data?.branchId;
            }
            setPurchaseBillItems(data?.purchaseBillItems ? data?.purchaseBillItems : []);
            setVehicleNo(data?.vehicleNo ? data.vehicleNo : "");
            setRemarks(data?.remarks ? data.remarks : "");
            setInvNo(data?.invNo ? data?.invNo : "");
            setInvValue(data?.invValue ? data?.invValue : "");
            setContactNumber(data?.contactNumber ? data?.contactNumber : "");
            setContactPerson(data?.contactPerson ? data?.contactPerson : "");
            setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
            setDiscountType(data?.discountType || "Flat");
            setDiscountValue(data?.discountValue || "0");
            setTermsAndCondition(data?.termsAndCondition ? data.termsAndCondition : "");
            setDcNo(data?.dcNo ? data?.dcNo : "")
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

    const handlePartyChange = (selectedId, field) => {
        const selectedParty = partyList?.data?.find(
            (p) => p.id === Number(selectedId)
        );

        if (field === "supplier") {
            setSupplierId(selectedParty?.id);
            setContactNumber(selectedParty?.contactNumber);
            setContactPerson(selectedParty?.contactPersonName || "");
        }
    };

    useEffect(() => {
        if (supplierId && partyList?.data?.length) {
            handlePartyChange(supplierId, "supplier");
        }
    }, [supplierId, setSupplierId, partyList?.data]);


    const findDuplicateGoodss = (items) => {
        const seen = new Map(); // key -> first index
        const duplicates = [];

        items.forEach((row, index) => {
            const key = [row.styleItemId || "", row.barcodeNo || "", row.styleId || "", row.sizeId || ""].join(
                "-"
            );

            if (seen.has(key)) {
                duplicates.push({
                    firstIndex: seen.get(key),
                    duplicateIndex: index,
                    styleItemId: row.styleItemId,
                    styleId: row.styleId,
                    sizeId: row.styleId,
                    barcodeNo: row.barcodeNo
                });
            } else {
                seen.set(key, index);
            }
        });

        return duplicates; // empty array = no duplicates
    };

    const validateData = (data) => {
        // 1️⃣ Mandatory header fields
        if (!data?.supplierId || !data?.invNo || !data?.taxTemplateId) {
            toast.info("Please fill all required fields...!", {
                position: "top-center",
                autoClose: 2000
            });
            return false;
        }

        // 2️⃣ At least one item required
        if (!data?.purchaseBillItems || data.purchaseBillItems.length === 0) {
            toast.info("Please add at least one item...!", {
                position: "top-center",
            });
            return false;
        }

        // 3️⃣ Validate filled grid rows
        const filledGoodsItems = data.purchaseBillItems.filter(
            (item) => item?.styleItemId
        );

        if (
            !isGridDatasValid(
                filledGoodsItems,
                false,
                ["styleItemId", "sizeId", "qty", "uomId", "rate", "styleId"]
            )
        ) {
            toast.info("Please fill all required item details...!", {
                position: "top-center",
            });
            return false;
        }

        // 4️⃣ Duplicate check
        const duplicatesGoods = findDuplicateGoodss(filledGoodsItems);
        if (duplicatesGoods.length > 0) {
            const dup = duplicatesGoods[0];
            Swal.fire({
                icon: "warning",
                title: "Duplicate Item Found",
                html: `
        StyleItem - ${findFromList(dup?.styleItemId, styleItemList?.data, "name")},
       Barcode - ${dup?.barcodeNo},
        Rows - ${dup.firstIndex + 1} & ${dup.duplicateIndex + 1}
      `,
            });
            return false;
        }

        return true;
    };


    const saveData = (nextProcess) => {
        if (!validateData(data)) {
            return;
        }
        // let foundItem;
        // if (id) {
        //     foundItem = allData?.data
        //         ?.filter((i) => i.id !== id)
        //         ?.find((item) => item.invNo?.trim().toLowerCase() === invNo?.trim().toLowerCase());
        // } else {
        //     foundItem = allData?.data?.find(
        //         (item) => item.invNo?.trim().toLowerCase() === invNo?.trim().toLowerCase()
        //     );
        // }
        // if (foundItem) {

        //     const hasDuplicateGoods = foundItem.purchaseBillItems?.some(existing =>
        //         purchaseBillItems?.some(
        //             current => Number(current.styleId) === Number(existing.styleId) && Number(current.sizeId) === Number(existing.sizeId)
        //         )
        //     );
        //     if (hasDuplicateGoods) {
        //         Swal.fire({
        //             text: `Duplicate Style and Size already exists in this Invoice.`,
        //             icon: "warning",
        //             timer: 2000,
        //             showConfirmButton: false,
        //         });
        //         return false;
        //     }

        // }

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
        // dispatch(purchaseReturnApi.util.invalidateTags(["PurchaseReturn"]));
    };

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };

    const handleAddRow = async (newValue) => {
        setDcNo(newValue);
        const hasUnfilledRequired = purchaseBillItems.some((row) => {
            return row.styleId && !row.qty;
        });

        if (hasUnfilledRequired) {
            toast.info("Please fill all required fields before adding...!", {
                position: "top-center",
            });
            return;
        }
        try {
            const { data: salesData } = await getSalesDCDetail({
                params: {
                    dcNo: newValue,
                },
            });
            const salesItems = salesData?.data?.SalesEntryItems;
            if (!salesItems) return;
            setPurchaseBillItems((prev) => {
                const updated = [...prev];
                // Find first empty slot index
                let startIndex = updated.findIndex(
                    (row) =>
                        !row.styleId &&
                        !row.sizeId &&
                        !row.barcodeNo &&
                        !row.styleItemId
                );
                if (startIndex === -1) startIndex = updated.length;

                // Fill in sizeRows starting at first empty slot
                salesItems.forEach((row, i) => {
                    if (startIndex + i < updated.length) {
                        updated[startIndex + i] = row;
                    } else {
                        updated.push(row); // append if no empty slot
                    }
                });

                // Ensure at least 6 rows
                while (updated.length < 3) {
                    updated.push({
                        styleId: "",
                        sizeId: "",
                        qty: "",
                        styleItemId: "",
                        colorId: "",
                        selected: false,
                    });
                }

                return updated;
            });
        } catch (error) {
            console.error("Error adding row:", error);
        }
    };

    return (
        <>
            {isLoadingIndicator ? (
                <Loader />
            ) : (
                <div onKeyDown={handleKeyDown}>
                    {/* <Modal
                        isOpen={pdfOpen}
                        onClose={() => setPdfOpen(false)}
                        widthClass={"w-[90%] h-[90%]"}
                    >
                        <PDFViewer style={tw("w-full h-full")}>
                            <PDF singleData={singleData?.data} branchList={branchList} />
                        </PDFViewer >
                    </Modal > */}
                    <Modal
                        isOpen={summary}
                        onClose={() => setSummary(false)}
                        widthClass={"p-10"}
                    >
                        <PurchaseBillSummary
                            remarks={remarks}
                            setRemarks={setRemarks}
                            discountType={discountType}
                            setDiscountType={setDiscountType}
                            discountValue={discountValue}
                            setDiscountValue={setDiscountValue}
                            purchaseBillItems={purchaseBillItems}
                            taxTypeId={taxTemplateId}
                            readOnly={readOnly}
                        />
                    </Modal>
                    <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
                        <div className="flex justify-between items-center mb-1">
                            <h1 className="text-xl font-bold text-gray-800">Purchase Bill Entry</h1>
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
                                    <ReusableInput label="Purchase Bill No" readOnly value={docId} />
                                    <ReusableInput
                                        label="Purchase Bill Date"
                                        value={docDate}
                                        type={"date"}
                                        required={true}
                                        readOnly={true}
                                        disabled
                                    />
                                    <DropdownInput
                                        name="Tax Type"
                                        options={dropDownListObject(
                                            taxTypeList ? taxTypeList?.data : [],
                                            "name",
                                            "id",
                                        )}
                                        value={taxTemplateId}
                                        setValue={setTaxTemplateId}
                                        required={true}
                                        readOnly={readOnly}
                                        autoFocus={true}
                                    />
                                </div>
                            </div>

                            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                                <h2 className="font-medium text-slate-700 mb-2">Bill Details</h2>
                                <div className="grid grid-cols-2 gap-1">
                                    <TextInput
                                        name={"Inv No"}
                                        value={invNo}
                                        setValue={setInvNo}
                                        readOnly={readOnly}
                                        required
                                    // autoFocus={true}
                                    />
                                    <DateInput
                                        name="Inv Date"
                                        value={invDate}
                                        setValue={setInvDate}
                                        required={true}
                                        readOnly={readOnly}
                                    />
                                    <TextInput
                                        name={"Inv Value"}
                                        value={invValue}
                                        setValue={setInvValue}
                                        readOnly={readOnly}
                                        required
                                    />
                                    <DropdownInput
                                        name="Payment Type"
                                        options={PaymentTypeData}
                                        value={paymentType}
                                        setValue={setPaymentType}
                                        required={true}
                                        readOnly={id}
                                    />

                                </div>
                            </div>

                            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                                <div className="grid grid-cols-1 gap-1">
                                    <h2 className="font-medium text-slate-700 mb-2">Supplier Details</h2>
                                    <div className="grid grid-cols-2 gap-1">
                                        <DropdownNew
                                            name="Supplier"
                                            dataList={partyList?.data?.filter((item) => item.isSupplier)}
                                            value={supplierId}
                                            setValue={(value) => {
                                                setSupplierId(value);
                                            }}
                                            required={true}
                                            disabled={readOnly}
                                            placeholder={"Select Supplier"}
                                        />
                                        <ReusableInput
                                            label="Contact Person"
                                            value={contactPerson}
                                            type={"text"}
                                            readOnly={true}
                                            disabled
                                        />
                                        <ReusableInput
                                            label="Contact Number"
                                            value={contactNumber}
                                            type={"text"}
                                            readOnly={true}
                                            disabled
                                        />
                                        <DropdownNew
                                            name="Sales DC No"
                                            dataList={salesList?.data}
                                            value={dcNo}
                                            setValue={handleAddRow}
                                            readOnly={readOnly}
                                            placeholder={"Select DC"}
                                            otherField={"docId"}
                                            otherValue={"docId"}
                                            disabled={id}
                                            clear={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <fieldset>
                            <PurchaseBillItems
                                id={id}
                                params={params}
                                purchaseBillItems={purchaseBillItems}
                                setPurchaseBillItems={setPurchaseBillItems}
                                readOnly={readOnly}
                                sizeList={sizeList}
                                styleItemList={styleItemList}
                                colorList={colorList}
                                uomList={uomList}
                                taxTemplateId={taxTemplateId}
                                dcNo={dcNo}
                            />
                        </fieldset>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                                <h2 className="font-medium text-slate-700 mb-2 text-base">
                                    Terms and Condition
                                </h2>
                                <textarea
                                    readOnly={readOnly}
                                    value={termsAndCondition}
                                    onChange={(e) => {
                                        setTermsAndCondition(e.target.value);
                                    }}
                                    className="w-full overflow-auto h-10 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                    placeholder="Terms Details..."
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                                <h2 className="font-medium text-slate-700 mb-2 text-base">
                                    Remarks
                                </h2>
                                <textarea
                                    readOnly={readOnly}
                                    value={remarks}
                                    onChange={(e) => {
                                        setRemarks(e.target.value);
                                    }}
                                    className="w-full  overflow-auto h-10 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                    placeholder="Additional remarks..."
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="border border-slate-200 p-2 bg-white flex h-auto items-center rounded-md shadow-sm">
                                <h2 className="font-bold text-slate-800 mb-2 text-base">
                                    Puchase Bill Summary
                                </h2>

                                <button
                                    className="text-sm bg-sky-500 text-white font-semibold hover:bg-sky-800 transition p-1 ml-5 rounded"
                                    onClick={() => {
                                        if (!taxTemplateId) {
                                            toast.info("Please Select Tax Template !", {
                                                position: "top-center",
                                            });
                                            return;
                                        }
                                        setSummary(true);
                                    }}
                                >
                                    View Summary
                                </button>
                            </div>
                        </div>

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
                            </div>

                            <div className="flex gap-2 flex-wrap">
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
                                    PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div >
            )}

        </>
    );
};

export default PurchaseBillForm;

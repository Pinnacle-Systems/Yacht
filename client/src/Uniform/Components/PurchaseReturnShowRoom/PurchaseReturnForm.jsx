
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    DropdownNew,
    TextInput,
} from "../../../Inputs";
import {
    useGetPartyQuery,
} from "../../../redux/services/PartyMasterService";
import { findFromList, getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import { toast } from "react-toastify";
import PurchaseReturnItems from "./PurchaseReturnItems";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { Loader } from "../../../Basic/components";
import secureLocalStorage from "react-secure-storage";
import { useAddPurchaseReturnShowroomMutation, useDeletePurchaseReturnShowroomMutation, useGetPurchaseReturnShowroomByIdQuery, useGetPurchaseReturnShowroomQuery, useUpdatePurchaseReturnShowroomMutation } from "../../../redux/services/PurchaseReturnShowroomService";
import purchaseBillApi, { useGetPurBillItemsQuery, useGetPurchaseBillQuery } from "../../../redux/services/PurchaseBillService";
import showroomStockApi from "../../../redux/uniformService/ShowroomStockService";
import SalesReturnApi from "../../../redux/uniformService/SalesReturnService"
const PurchaseReturnForm = ({ onClose, id, setId, readOnly, setReadOnly,
    sizeList,
    styleItemList,
    colorList,
    uomList,
    styleList
}) => {
    const [docId, setDocId] = useState("New");
    const [supplierId, setSupplierId] = useState("");
    const [termsAndCondition, setTermsAndCondition] = useState("");
    const [remarks, setRemarks] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [invNo, setInvNo] = useState("")
    const [purchaseReturnItems, setPurchaseReturnItems] = useState([]);
    const [tempItems, setTempItems] = useState([]);
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
    const { data: partyList } = useGetPartyQuery({ params: { ...params } });
    const finyearId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentFinYear"
    );
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetPurchaseReturnShowroomByIdQuery(id, { skip: !id });

    const [addData] = useAddPurchaseReturnShowroomMutation();
    const [updateData] = useUpdatePurchaseReturnShowroomMutation();
    const dispatch = useDispatch();

    const isLoadingIndicator = isSingleFetching || isSingleLoading;

    const { data: purchaseList } = useGetPurchaseBillQuery({
        params: { companyId, branchId },
    });

    const {
        data: purBillItemsData,
        isLoading: isPurBillItemsLoading,
        isFetching: isPurBillItemsFetching,
    } = useGetPurBillItemsQuery({
        params: {
            branchId,
            invNo,
            pagination: true,
        },
    }, { skip: !invNo });

    const syncFormWithDbItems = useCallback(
        (data) => {
            setTempItems(data);
        },
        [invNo],
    );

    useEffect(() => {
        if (purBillItemsData?.data) {
            syncFormWithDbItems(purBillItemsData?.data);
            setSupplierId(purBillItemsData?.supplierId)
        }
    }, [
        isPurBillItemsFetching,
        isPurBillItemsLoading,
        syncFormWithDbItems,
        purBillItemsData,
    ]);

    const data = {
        docId,
        docDate,
        supplierId,
        branchId,
        id,
        userId,
        purchaseReturnItems: purchaseReturnItems?.filter((item) => item.styleItemId),
        finYearId,
        termsAndCondition,
        remarks,
        invNo,
        contactPerson,
        contactNumber,
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
            setSupplierId(data?.supplierId ? data?.supplierId : "");
            if (data?.branchId) {
                branchIdFromApi.current = data?.branchId;
            }
            setPurchaseReturnItems(data?.purchasReturnItemsSR ? data?.purchasReturnItemsSR : []);
            setRemarks(data?.remarks ? data.remarks : "");
            setInvNo(data?.invNo ? data?.invNo : "");
            setContactNumber(data?.contactNumber ? data?.contactNumber : "");
            setContactPerson(data?.contactPerson ? data?.contactPerson : "");
            setTermsAndCondition(data?.termsAndCondition ? data?.termsAndCondition : "")
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
                dispatch(purchaseBillApi.util.invalidateTags(["PurchaseBill"]));
                dispatch(showroomStockApi.util.invalidateTags(["showroomStock"]));
                dispatch(SalesReturnApi.util.invalidateTags(["salesReturn"]))
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
            const key = row?.barcodeId;

            if (seen.has(key)) {
                duplicates.push({
                    firstIndex: seen.get(key),
                    duplicateIndex: index,
                    barcodeId: row.barcodeId,
                    barcodeNo: row.barcodeNo
                });
            } else {
                seen.set(key, index);
            }
        });

        return duplicates; // empty array = no duplicates
    };

    const validateData = (data) => {
        if (!data.supplierId || !data.invNo) {
            toast.info("Please fill all required fields...!", {
                position: "top-center",
                autoClose: 2000
            });
            return false;
        }
        if (!data.purchaseReturnItems || data.purchaseReturnItems.length === 0) {
            toast.info("Please add at least one item...!", {
                position: "top-center",
                autoClose: 2000
            });
            return false;
        }
        const validRows = data.purchaseReturnItems.filter(
            (item) => item?.styleItemId
        );
        const hasEmptyQty = data.purchaseReturnItems?.find(item =>
            Number(item.stkQty) === 0

        );
        if (hasEmptyQty) {
            Swal.fire({
                text: `Barcode No ${hasEmptyQty.barcodeNo} cannot return. Currently no stock!.`,
                icon: "warning",
                timer: 2000,
                showConfirmButton: false,
            });
            return false;
        }

        if (
            !isGridDatasValid(validRows, false, [
                "styleItemId",
                "sizeId",
                "returnQty",
                "uomId",
                "styleId",
                "barcodeId"
            ])
        ) {
            toast.info("Please fill all required item details...!", {
                position: "top-center",
                autoClose: 2000
            });
            return false;
        }
        const duplicatesGoods = findDuplicateGoodss(validRows);
        if (duplicatesGoods.length > 0) {
            const dup = duplicatesGoods[0];
            Swal.fire({
                icon: "warning",
                title: "Duplicate Item Found",
                html: `
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

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === "s") {
            event.preventDefault();
            saveData();
        }
    };

    return (
        <>
            {isLoadingIndicator ? (
                <Loader />
            ) : (
                <div onKeyDown={handleKeyDown}>
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
                    <div className="space-y-2  mt-1.5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                                <h2 className="font-medium text-slate-700 mb-2">Basic Details</h2>
                                <div className="grid grid-cols-3 gap-1">
                                    <ReusableInput label="Purchase Return No" readOnly value={docId} />
                                    <ReusableInput
                                        label="Purchase Return Date"
                                        value={docDate}
                                        type={"date"}
                                        required={true}
                                        readOnly={true}
                                        disabled
                                    />
                                    <DropdownNew
                                        name="Inv No"
                                        dataList={purchaseList?.data}
                                        value={invNo}
                                        setValue={(value) => {
                                            setPurchaseReturnItems([])
                                            setInvNo(value)
                                        }}
                                        required={true}
                                        readOnly={readOnly}
                                        placeholder={"Select Inv"}
                                        otherField={"invNo"}
                                        otherValue={"invNo"}
                                        disabled={id}
                                        autoFocus={true}
                                    />
                                </div>
                            </div>
                            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                                <div className="grid grid-cols-1 gap-1">
                                    <h2 className="font-medium text-slate-700 mb-2">Supplier Details</h2>
                                    <div className="grid grid-cols-3 gap-1">
                                        <DropdownNew
                                            name="Supplier"
                                            dataList={partyList?.data?.filter((item) => item.isSupplier)}
                                            value={supplierId}
                                            setValue={(value) => {
                                                setSupplierId(value);
                                            }}
                                            required={true}
                                            readonly={true}
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
                                    </div>
                                </div>
                            </div>

                        </div>
                        <fieldset>
                            <PurchaseReturnItems
                                id={id}
                                params={params}
                                purchaseReturnItems={purchaseReturnItems}
                                setPurchaseReturnItems={setPurchaseReturnItems}
                                readOnly={readOnly}
                                sizeList={sizeList}
                                styleItemList={styleItemList}
                                colorList={colorList}
                                styleList={styleList}
                                uomList={uomList}
                                supplierId={supplierId}
                                invNo={invNo}
                                branchId={branchId}
                                tempItems={tempItems}
                                setTempItems={setTempItems}
                            />
                        </fieldset>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                                <h2 className="font-medium text-slate-700 mb-1 text-base">
                                    Terms and Condition
                                </h2>
                                <textarea
                                    readOnly={readOnly}
                                    value={termsAndCondition}
                                    onChange={(e) => {
                                        setTermsAndCondition(e.target.value);
                                    }}
                                    className="w-full overflow-auto h-9 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                    placeholder="Terms Details..."
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                                <h2 className="font-medium text-slate-700 mb-1 text-base">
                                    Remarks
                                </h2>
                                <textarea
                                    readOnly={readOnly}
                                    value={remarks}
                                    onChange={(e) => {
                                        setRemarks(e.target.value);
                                    }}
                                    className="w-full  overflow-auto h-9 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                    placeholder="Additional remarks..."
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                                <h2 className="font-semibold text-slate-800 mb-2 text-base">
                                    Qty Summary
                                </h2>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between  text-sm">
                                        <span className="text-slate-600">Total Return Qty</span>
                                        <span className="font-medium">
                                            {purchaseReturnItems
                                                .reduce((sum, row) => sum + (Number(row.returnQty) || 0), 0)
                                                .toFixed(2)}
                                        </span>
                                    </div>
                                </div>
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
                                {
                                    readOnly && (
                                        <button
                                            className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                                            onClick={() => setReadOnly(false)}
                                        >
                                            <FiEdit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </button>)}
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

export default PurchaseReturnForm;

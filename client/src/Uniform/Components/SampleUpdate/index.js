import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { useDispatch } from "react-redux";
import FormHeader from '../../../Basic/components/FormHeader';
import { toast } from "react-toastify"
import { DropdownInput, TextArea, DisabledInput, TextInput, DateInput, CheckBox } from "../../../Inputs"
import { useAddSampleMutation, useDeleteSampleMutation, useGetSampleByIdQuery, useGetSampleQuery, useUpdateSampleMutation } from '../../../redux/uniformService/SampleService';
import moment from 'moment';
import { getDateFromDateTime } from '../../../Utils/helper';
import FormSample from './FormSample';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetStyleMasterQuery } from '../../../redux/uniformService/StyleMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { dropDownListObject } from '../../../Utils/contructObject';
import { useGetPartyByIdQuery, useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import SampleFormReport from './SampleFormReport';
import Modal from "../../../UiComponents/Modal";
import PartyLogoUpload from './PartyLogoUpload';
import StyleImages from './StyleImages';
import { sampleUpdateStage, WayOfSample } from '../../../Utils/DropdownData';
import { useGetUserByIdQuery } from '../../../redux/services/UsersMasterService';
import SizeGrid from './SizeGrid';
import { useSelector } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import SampleDetailsForm from './SampleDetailsForm';
import useInvalidateTags from '../../../CustomHooks/useInvalidateTags';
import ViewImage from './ViewImage';
import { useGetUserQuery } from '../../../redux/services/UsersMasterService';



const MODEL = "Sample Update";

export default function Form({ }) {
    const dispatch = useDispatch();

    const openTabs = useSelector((state) => state.openTabs);



    const sampleUpdateId = openTabs.tabs.find(
        (i) => i.name == "SAMPLE UPDATE"
    )?.projectId;
    const projectForm = openTabs.tabs.find(
        (i) => i.name == "SAMPLE UPDATE"
    )?.projectForm;

    const [active, setActive] = useState(true);
    const today = new Date()
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState()
    const [form, setForm] = useState(openTabs.tabs.find((i) => i.name === "SAMPLE UPDATE")?.projectForm || false);
    const [formReport, setFormReport] = useState(false)
    const [searchValue, setSearchValue] = useState("");
    const [date, setDate] = useState(getDateFromDateTime(today));
    const [docId, setDocId] = useState("");
    const [sizeId, setSizeId] = useState();
    const [validDate, setValidDate] = useState()
    const [colorId, setColorId] = useState()
    const [styleId, setStyleId] = useState()
    const [fabricId, setFabricId] = useState()
    const [partyId, setPartyId] = useState()
    const [phone, setPhone] = useState()
    const [address, setAddress] = useState()
    const [contactPersonName, setContactPersonName] = useState("")
    const [isPartyLogoOpen, setIsPartyLogoOpen] = useState(false);
    const [logo, setLogo] = useState("")
    const [styleImages, setStyleImages] = useState([]);
    const [isStyleImageOpen, setIsStyleImageOpen] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [currentStage, setCurrentStage] = useState("");
    const childRecord = useRef(0);
    const [merchandId, setMerchandId] = useState()

    const [isAllowableUser, setIsAllowableUser] = useState(false)
    const [sampleSizeGrid, setSampleSizeGrid] = useState([])
    const [packing, setPacking] = useState(false);
    const [pattern, setPattern] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [stitching, setStitching] = useState(false);
    const [ironing, setIroning] = useState(false);
    const [cutting, setCutting] = useState(false);
    const [sampleDetails, setSampleDetails] = useState([]);
    const [sampleSubmitWay, setSampleSubmitWay] = useState("");
    const [sampleSubmitBy, setSampleSubmitBy] = useState("");
    const [currentImage, setCurrentImage] = useState("");


    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )


    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )


    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const params = {
        branchId, companyId
    };


    useEffect(() => {
        if (!sampleUpdateId) return;
        setId(sampleUpdateId);
        setForm(projectForm);

        dispatch(push({ name: "SAMPLE UPDATE", previewId: null }));
        dispatch(push({ name: "SAMPLE UPDATE", projectForm: null }));


    }, [sampleUpdateId, setId, projectForm]);

    const { data: partyList } =
        useGetPartyQuery({ params });
    const { data: singleSupplier, isLoading: isSingleSupplierLoading, isFetching: isSingleSupplierFetching } =
        useGetPartyByIdQuery(partyId, { skip: !partyId });

    const { data: colorList } =
        useGetColorMasterQuery({ params });
    const { data: styleList } =
        useGetStyleMasterQuery({ params });
    const { data: fabricList } =
        useGetFabricMasterQuery({ params: { ...params, active: true } });
    const { data: sizeList } =
        useGetSizeMasterQuery({ params });
    const { data: allData, isLoading, isFetching } = useGetSampleQuery({ params, searchParams: searchValue });



    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetSampleByIdQuery(id, { skip: !id });

    const [addData] = useAddSampleMutation();
    const [updateData] = useUpdateSampleMutation();
    const [removeData] = useDeleteSampleMutation();

    const { data: userData } = useGetUserQuery({ params })

    const { data: singlePartyData, isFetching: isSinglePartyFetching, isLoading: isSinglePartyLoading } = useGetPartyByIdQuery(partyId, { skip: !partyId });


    const {
        data: singleUserData,
        isFetching: isSingleUserFetching,
        isLoading: isSingleUserLoading,
    } = useGetUserByIdQuery(userId, { skip: !userId });



    useEffect(() => {
        if (!singleUserData) return
        if ((singleUserData?.data?.role?.name == "DEFAULT ADMIN") || (singleUserData?.data?.role?.name == "MERCHANDISER")) {
            setIsAllowableUser(true)
        }
        else {
            setIsAllowableUser(false)
        }
    }, [singleUserData, isSingleUserFetching, isSingleUserLoading])





    useEffect(() => {
        setLogo(singlePartyData?.data?.logo)
    }, [partyId, setLogo, singleData, isSingleFetching, isSingleLoading, singlePartyData, isSinglePartyFetching, isSinglePartyLoading])

    const getNextDocId = useCallback(() => {
        if (id || isLoading || isFetching) return
        if (allData?.nextDocId) {
            setDocId(allData.nextDocId)
        }
    }, [allData, isLoading, isFetching, id])

    useEffect(getNextDocId, [getNextDocId])

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            if (data?.docId) {
                setDocId(data?.docId)
            }
            // setStyleImages(data?.portionStyleImage ? data?.portionStyleImage : []);
            // setSampleSizeGrid(data?.sampleSizeGrid ? data?.sampleSizeGrid : []);
            setCurrentStage(data?.currentStage ? data?.currentStage : "");
            setRemarks(data?.remarks ? data?.remarks : "");
            // setColorId(data?.colorId ? data?.colorId : "");
            setStyleId(data?.styleId ? data?.styleId : "");
            setFabricId(data?.fabricId ? data?.fabricId : "");
            // setSizeId(data?.sizeId ? data?.sizeId : "");
            setPartyId(data?.partyId ? data?.partyId : "");
            setContactPersonName(data?.contactPersonName ? data?.contactPersonName : "")
            setPhone(data?.phone ? data?.phone : "");
            setMerchandId(data?.User ? data?.User?.username : "")
            setAddress(data?.address ? data?.address : "");
            setValidDate(data?.validDate ? moment(data?.validDate).format("YYYY-MM-DD") : "")
            setActive(id ? (data?.active ? data.active : false) : true);
            setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
            setPacking(data?.packing ? data?.packing : false);
            setPrinting(data?.printing ? data?.printing : false);
            setIroning(data?.ironing ? data?.ironing : false);
            setPattern(data?.pattern ? data?.pattern : false);
            setStitching(data?.stitching ? data?.stitching : false);
            setCutting(data?.cutting ? data?.cutting : false)
            setSampleDetails(data?.sampleDetails ? data?.sampleDetails : [])
            setSampleSubmitWay(data?.sampleSubmitWay ? data?.sampleSubmitWay : "");
            setSampleSubmitBy(data?.sampleSubmitBy ? data?.sampleSubmitBy : "");

            childRecord.current = data?.childRecord ? data?.childRecord : 0;
        }, [id])



    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])



    function filterSampleUpdateDate(sampleDetails) {
        setSampleDetails(prev => {
            let newObj = structuredClone(prev)
            newObj.forEach((val, index) => {
                if (!val.cutting) {
                    newObj[index]["cuttingDate"] = null;
                }
                if (!val.printing) {
                    newObj[index]["printingDate"] = null;
                }
                if (!val.stitching) {
                    newObj[index]["stitchingDate"] = null;
                }
                if (!val.pattern) {
                    newObj[index]["patternDate"] = null;
                }
                if (!val.embroiding) {

                    newObj[index]["embroidingDate"] = null;
                }
                if (!val.ironingAndPacking) {
                    newObj[index]["ironingAndPackingDate"] = null;
                }
            })


            return newObj
        })
    }




    const data = {
        id, remarks, sampleUpdateMerchandiser: true, userId,
        sampleDetails, sampleSubmitWay, sampleSubmitBy
        // packing, printing, cutting, ironing, stitching, pattern
    }



    const validateData = (data) => {
        if (!remarks) {
            return false
        }
        return true;
    }

    // const handleSubmitCustom = async (callback, data, text) => {
    //     try {
    //         let returnData = await callback(data).unwrap();
    //         if (returnData.statusCode === 0) {
    //             setId(returnData?.data?.id);

    //             syncFormWithDb(returnData?.data)
    //             toast.success(text + "Successfully");

    //         } else {
    //             toast.error(returnData?.message)
    //         }
    //     } catch (error) {
    //         console.log("handle")
    //     }
    // }

    const [invalidateTagsDispatch] = useInvalidateTags();
    const handleSubmitCustom = async (callback, data, text) => {

        try {
            const formData = new FormData();
            for (let key in data) {
                if (key === 'sampleDetails') {
                    formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? i.filePath.name : i.filePath, printingFilePath: (i.printingFilePath instanceof File) ? i.printingFilePath.name : i.printingFilePath, embroidingFilePath: (i.embroidingFilePath instanceof File) ? i.embroidingFilePath.name : i.embroidingFilePath, ironingAndPackingFilePath: (i.ironingAndPackingFilePath instanceof File) ? i.ironingAndPackingFilePath.name : i.ironingAndPackingFilePath }))));

                    data[key].forEach(option => {
                        if (option?.filePath instanceof File) {
                            formData.append('images', option.filePath);
                        }
                        if (option?.printingFilePath instanceof File) {
                            formData.append('images', option.printingFilePath);
                        }
                        if (option?.embroidingFilePath instanceof File) {
                            formData.append('images', option.embroidingFilePath);
                        }
                        if (option?.ironingAndPackingFilePath instanceof File) {
                            formData.append('images', option.ironingAndPackingFilePath);
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
            invalidateTagsDispatch()
        } catch (error) {
            console.log("handle", error);
        }
    };




    const saveData = () => {
        filterSampleUpdateDate(sampleDetails);
        // if (!validateData(data)) {
        //     toast.info("Please fill all required fields...!", { position: "top-center" })
        //     return
        // }

        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }

        if (id) {
            handleSubmitCustom(updateData, data, "Updated")

        } else {
            handleSubmitCustom(addData, data, "Added")

        }
    }

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return
            }
            try {
                let returnData = await removeData(id).unwrap();
                if (returnData.statusCode === 0) {
                    setId("")
                    syncFormWithDb(undefined)
                    toast.success("Deleted Successfully");
                } else {
                    toast.error(returnData?.message)
                }
            } catch (error) {
                toast.error("something went wrong")
            }
            ;
        }
    }

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === 's') {
            event.preventDefault();
            saveData();
        }
    }



    useEffect(() => {
        if (id) return
        if (!singleSupplier?.data || isSingleSupplierLoading || isSingleSupplierFetching) return
        if (!partyId) return
        setPhone(singleSupplier?.data?.contactMobile ? singleSupplier?.data.contactMobile : "")

        setContactPersonName(singleSupplier?.data?.contactPersonName ? singleSupplier?.data.contactPersonName : "");
        setAddress(singleSupplier?.data?.address ? singleSupplier?.data.address : "");
    }, [setPhone, setContactPersonName, partyId, singleSupplier, isSingleSupplierLoading, isSingleSupplierFetching])

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }



    if (!form)
        return (
            <SampleFormReport onClick={(id) => { setId(id); setForm(true) }} />
        );

    return (
        <div onKeyDown={handleKeyDown} className=' md:items-start md:justify-items-center grid h-full bg-theme'>
            <Modal

                isOpen={formReport}
                onClose={() => setFormReport(false)}
                widthClass={"px-2 h-[90%] w-[90%]"}

            >
                <SampleFormReport onClick={(id) => { setId(id); setFormReport(false) }} />
            </Modal>
            <Modal isOpen={isStyleImageOpen} onClose={() => setIsStyleImageOpen(false)} widthClass={"px-2 h-[55%] w-[35%]"}>
                <ViewImage picture={currentImage} />
            </Modal>

            <Modal isOpen={isPartyLogoOpen} onClose={() => setIsPartyLogoOpen(false)} widthClass={"px-2 h-[55%] w-[35%] "}>
                <PartyLogoUpload logo={logo} setLogo={setLogo} partyId={partyId} setIsPartyLogoOpen={setIsPartyLogoOpen} />
            </Modal>
            <div className='flex flex-col frame w-full  h-full'>
                <FormHeader
                    // onNew={onNew}
                    onClose={() => {
                        setForm(false);
                        setSearchValue("");
                    }}
                    openReport={() => setFormReport(true)}
                    model={MODEL}

                    saveData={saveData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                />
                <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
                    <div className='col-span-4 grid md:grid-cols-1 border overflow-auto'>
                        <div className='mr-1 md:ml-2'>
                            <fieldset className='frame my-1'>
                                <legend className='sub-heading'>Sample Info</legend>

                                <div className='grid grid-cols-5 w-[100%]'>
                                    <DisabledInput name={"DocId."} value={`${docId}`} />
                                    <DisabledInput name="Doc. 
                           Date" value={date} type={"Date"} required={true} readOnly={true} />
                                    <DropdownInput name="School Name" options={dropDownListObject((partyList?.data ? partyList?.data : []), "name", "id")} value={partyId} setValue={(value) => { setPartyId(value); }} readOnly={true} />
                                    <TextInput name="Phone No" type="text" value={phone} setValue={setPhone} readOnly={true} disabled={(childRecord.current > 0)} />
                                    <TextInput name="Con.Person.Name" type="text" value={contactPersonName} setValue={setContactPersonName} readOnly={true} disabled={(childRecord.current > 0)} />
                                    <TextInput name="Merchandaiser" type="text" value={merchandId} readOnly={true} disabled={(childRecord.current > 0)} />

                                    <TextInput name="Address" type="text" value={address} setValue={setAddress} readOnly={true} disabled={(childRecord.current > 0)} />
                                    {/* <DropdownInput name="Color" options={dropDownListObject((colorList?.data ? colorList?.data : []), "name", "id")} value={colorId} setValue={(value) => { setColorId(value); }} readOnly={true} required={true} /> */}


                                    {/* <DropdownInput name="Fabric" options={dropDownListObject((fabricList?.data ? fabricList?.data : []), "name", "id")} value={fabricId} setValue={(value) => { setFabricId(value); }} readOnly={true} /> */}
                                    {/* <DropdownInput name="Style" options={dropDownListObject((styleList?.data ? styleList?.data : []), "name", "id")} value={styleId} setValue={(value) => { setStyleId(value); }} readOnly={true} /> */}
                                    {/* <DropdownInput name="Size" options={dropDownListObject((sizeList?.data ? sizeList?.data : []), "name", "id")} value={sizeId} setValue={(value) => { setSizeId(value); }} readOnly={true} required={true} /> */}

                                    <DateInput name="Delivery.Date" value={validDate} setValue={setValidDate} readOnly={true} />
                                    <CheckBox name="Active" value={active} setValue={setActive} />


                                </div>
                                {
                                    isAllowableUser &&
                                    <>
                                        <div className='grid grid-cols-5 w-[100%]'>
                                            <div className='col-span-2'>
                                                <div className=' w-28 text-xs underline  ml-1'>Remarks :</div>
                                                <div className='ml-1'>
                                                    <textarea readOnly={readOnly} className=" w-[490px] h-8 overflow-auto focus:outline-none border border-gray-500 rounded p-2 text-xs"
                                                        value={remarks} onChange={(e) => { setRemarks(e.target.value) }} ></textarea>
                                                </div>

                                            </div>

                                            <div className=' col-span-1'>
                                                <DropdownInput
                                                    name="SampleWay"
                                                    options={WayOfSample}
                                                    value={sampleSubmitWay}
                                                    setValue={setSampleSubmitWay}
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                />
                                            </div>
                                            <div className=' col-span-1'>
                                                <TextInput name="PersonName" type="text" value={sampleSubmitBy} setValue={setSampleSubmitBy} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                                            </div>

                                        </div>
                                    </>
                                }

                                {
                                    id &&
                                    <button className='bg-blue-400 rounded-md m-2 text-xs ml-2 w-24 p-2' onClick={() => { setIsPartyLogoOpen(true) }} >School Logo</button>

                                }
                            </fieldset>


                            <div className="w-[100%] grid grid-cols-1 mt-2">
                                <div className="grid grid-cols-1 gap-4 p-1">
                                    <table className="border border-gray-300 text-sm table-auto w-full">
                                        <thead className="bg-blue-300 border border-gray-400">
                                            <tr>
                                                <th className="py-1 px-1 w-6  border border-gray-400">S.No</th>
                                                <th className="py-1 px-1 w-24  border border-gray-400">ItemType</th>

                                                <th className="py-1 px-1 w-24  border border-gray-400">Item</th>
                                                <th className="py-1 px-1 w-24  border border-gray-400">Fabric</th>
                                                <th className="py-1 px-1 w-16  border border-gray-400">Size</th>
                                                <th className="py-1 px-1 w-32  border border-gray-400">Color</th>
                                                <th className="py-1 px-1 w-12 border border-gray-400">Comments</th>
                                                <th className="py-1 px-1  w-12 border border-gray-400">Image</th>
                                                <th className="py-1 px-1  w-12 border border-gray-400">Pattern</th>
                                                <th className="py-1 px-1  w-12 border border-gray-400">Cutting</th>
                                                <th className="py-1 px-1  border border-gray-400">Printing</th>
                                                <th className="py-1 px-1  w-24 border border-gray-400">Embroiding</th>
                                                <th className="py-1 px-1  w-12 border border-gray-400">Stitching</th>
                                                <th className="py-1 px-1  w-24 border border-gray-400">Ironing/Packing</th>


                                            </tr>
                                        </thead>
                                        <tbody className="overflow-y-auto">
                                            {(sampleDetails ? sampleDetails : []).map((item, index) => (
                                                <SampleDetailsForm setCurrentImage={setCurrentImage} userData={userData} setIsStyleImageOpen={setIsStyleImageOpen} sampleFollowId={id} key={index} item={item} index={index} readOnly={readOnly} setSampleDetails={setSampleDetails} sampleDetails={sampleDetails} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* <div className='grid grid-cols-4'>
                                <div className='col-span-2'>
                                    <fieldset className='frame my-1 p-2'>
                                        <legend className='sub-heading'>Sample Image Info</legend>
                                        <SizeGrid singleData={singleData} sampleSizeGrid={sampleSizeGrid} setSampleSizeGrid={setSampleSizeGrid} id={id} readOnly={readOnly} />
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
    )
}

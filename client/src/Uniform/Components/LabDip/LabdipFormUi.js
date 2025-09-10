import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { HiOutlineDocumentText, HiOutlineRefresh } from "react-icons/hi";
import { ReusableInput, ReusableSearchableInput } from "../styleesheet/CommonInput";
import { DropdownWithSearch } from "../../../Inputs";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { useCallback, useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import PrintFormat from "./PrintFormat-CD";
import Modal from "../../../UiComponents/Modal";
import { useGetPoByIdQuery, useGetPoQuery } from "../../../redux/uniformService/PoServices";
import { getCommonParams } from "../../../Utils/helper";
import LapDipItems from "./LapDipItems";
import { useGetStyleSheetQuery } from "../../../redux/services/StyleSheet";


const LabDipFormUi =   (  {onClose}  )  =>  {

    
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [poId, setPoId] = useState("");
    const [date, setDate] = useState("");
    const [validDate, setValidDate] = useState("");
    const [poItems, setPoItems] = useState([]); 
    const [docId, setDocId] = useState("");
    let flattenedData = [];


  const { branchId, companyId, finYearId, userId } = getCommonParams();
  const params = {
    branchId,
    companyId,
    finYearId,
    value: true,
  };
  const { data: poData } = useGetPoQuery({ params });
  const { data: styleSheetData } = useGetStyleSheetQuery({ params });


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPoByIdQuery(poId, { skip: !poId });

    const syncFormWithDb = useCallback((data) => {
     setPoItems(data || []);

    }, [poId]);
    
            useEffect(() => {
        if (poId) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, poId, syncFormWithDb, singleData]);

            return (

                <>
         <Modal
            isOpen={printModalOpen}
            onClose={() => setPrintModalOpen(false)}
            widthClass={"w-[90%] h-[90%]"}
          >
            <PDFViewer style={tw("w-full h-full")}>
              <PrintFormat
              flattenedData  = {flattenedData}
              docId={docId}
                singleData={poId ? singleData?.data : "Null"}
                // singleData={id ? singleData?.data : "Null"}
                // date={id ? singleData?.data?.selectedDate : date}
                // docId={docId ? docId : ""}
                // cuttingDeliveryDetails={cuttingDeliveryDetails}
              />
            </PDFViewer>
          </Modal>
                       <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1">
                <div className="flex justify-between items-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">LabDip Information</h1>
                    <div className="gpa-4">
                             <button
                            onClick={onClose}
                            className="text-indigo-600 hover:text-indigo-700 w-"
                            title="Open Report"
                        >
                    <HiOutlineDocumentText className="w-7 h-6" />
                               </button>
                                <button
                            // onClick={onClose}
                            className="text-indigo-600 hover:text-indigo-700"
                            title="Open Report"
                        >
                            <FaFileAlt className="w-5 h-5" />
                        </button>
                    </div>
            
                </div>

                <div className="space-y-3 h-full ">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                LabDip Details
                            </h2>
                            <div className="grid grid-cols-2 gap-1">
                                <ReusableInput label="LapDip.No" readOnly  />

                                <ReusableInput label="Date" 
                                // value={date} type={"date"} 
                                required={true} readOnly={true} disabled />
                                <ReusableInput label="Date" type="date"
                                //  value={validDate} setValue={setValidDate} readOnly={readOnly}
                                  />
                                  <DropdownWithSearch 
                                  options={poData  ? poData?.data : []}
                                    labelField={"docId"}
                                    label={"Purchase Orders No"}
                                    value={poId}  
                                    setValue={setPoId}

                                  />
                            </div>
                        </div>



                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2">Customer Details</h2>

                            <div className="grid grid-cols-1">
                                <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                                    <div className="col-span-2">
                                        <ReusableSearchableInput
                                            label="Customer"
                                            component="PartyMaster"
                                            placeholder="Search Parties..."
                                            // optionList={supplierList?.data}
                                            // onAddItem={handleAddSupplier}
                                            // onDeleteItem={onDeleteItem}
                                            // setSearchTerm={setPartyId}
                                            // searchTerm={partyId}
                                            // readOnly={readOnly}
                                        />
                                    </div>







                                    <div className="mb-3">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Source Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full pl-2.5 pr-8 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                                placeholder="Select address"
                                                disabled
                                                // value={address}
                                                // onClick={() => setShowAddressPopup(true)}
                                            />

                           
                                        </div>

                                     
                                

                                    </div>
                                </div>
                            </div>
                        </div>



                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                            <h2 className="font-medium text-slate-700 mb-2">
                                Contact Details
                            </h2>
                            <div className="grid grid-cols-2 gap-x-3">
                                {/* <TextInput
                                    name="Contact Person"
                                    placeholder="Contact name"
                                    value={contactPersonName}
                                    setValue={setContactPersonName}
                                    readOnly={readOnly}
                                // onChange={(e) => setContactPersonName(e.target.value)}
                                /> */}
                                <DropdownWithSearch
                                    // options={partyId  ?  options  :  []}
                                    // labelField={"contactPersonName"}
                                    // label={"Contact Person Name"}
                                    // value={contactPersonName}
                                    // setValue={setContactPersonName}
                                
                                />
                                {/* <TextInput
                                    name="Phone"
                                    value={phone}
                                    setValue={setPhone}
                                    readOnly={readOnly}
                                    disabled={true}

                                onChange={(e) => setPhone(e.target.value)}
                                /> */}
                                 <DropdownWithSearch
                                    // options={partyId  ?  options  :  []}
                                    // labelField={"mobileNo"}
                                    // label={"Contact Person Name"}
                                    // value={partyId}
                                    // setValue={setContactPersonName}
                                
                                />

                            </div>
                        </div>
                    </div>
                             <fieldset className='mb-5'>                      

                    <LapDipItems poItems ={poItems} setPoItems={setPoItems} styleSheetData ={styleSheetData} flattenedData={flattenedData}
                    //  readOnly={readOnly} itemHeading={itemHeading} setOrderDetails={setOrderDetails} orderDetails={orderDetails} id={id}
                    // yarnItems={yarnItems} setYarnItems={setYarnItems}
                    />
                       </fieldset>
               
                    {/* <div className="grid grid-cols-3 gap-3">
                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-medium text-slate-700 mb-2 text-base">   Terms & Conditions</h2>
                            <textarea
                                readOnly={readOnly}
                                value={term}
                                onChange={(e) => {
                                    setTerm(e.target.value)
                                }}
                                className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                placeholder="Additional notes..."

                            />
                          
                        </div>

            


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                            <h2 className="font-medium text-slate-700 mb-2 text-base">Notes</h2>
                            <textarea
                                readOnly={readOnly}
                                value={notes}
                                onChange={(e) => {
                                    setNotes(e.target.value)
                                }}
                                className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                                placeholder="Additional notes..."
                            />
                        </div>


                        <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                            <h2 className="font-semibold text-slate-800 mb-2 text-base">
                                Qty Summary
                            </h2>

                            <div className="space-y-1.5">
                                <div className="flex justify-between py-1 text-sm">
                                    <span className="text-slate-600">Total Qty</span>
                                    <span className="font-medium">{parseInt(getTotalQty())}   No's</span>
                                </div>



                                <div className="flex justify-between py-1 text-sm">
                                    <span className="text-slate-600">Order By</span>
                                    <input
                                        type="text"
                                        className="w-60 pl-2.5 pr-8 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                        placeholder="Order By"
                                        readOnly
                                        value={orderBy}
                                        onChange={(e) => setOrderBy(e.target.value)}
                                    />
                                </div>

                            </div>
                        </div>*/}

                       
                     <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
                        <div className="flex gap-2 flex-wrap">
                            <button  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <FiSave className="w-4 h-4 mr-2" />
                                Save & New
                            </button>
                            <button  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                Save & Close
                            </button>
                            <button  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                                Draft Save
                            </button>
                        </div> 

                        <div className="flex gap-2 flex-wrap">
                   
                            {/* <button className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                                // onClick={() => setReadOnly(false)}
                            >
                                <FiEdit2 className="w-4 h-4 mr-2" />
                                Edit
                            </button>
                            <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                                <FaWhatsapp className="w-4 h-4 mr-2" />
                                WhatsApp
                            </button> */}
                            <button
                                onClick={() => {
                                    
                                    setPrintModalOpen(true)
                                }}
                            className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
                                <FiPrinter className="w-4 h-4 mr-2" />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
                </>
            )
}

export default LabDipFormUi;
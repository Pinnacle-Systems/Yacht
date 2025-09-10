// import {    DropdownWithSearch } from "../../../Inputs"
// import { useEffect } from "react";

// import { saveAs } from 'file-saver';
// import * as XLSX from "xlsx"
// import { toast } from "react-toastify";
// import FormHeader from "../../../Basic/components/FormHeader";
// import { getCommonParams, getDateFromDateTime } from "../../../Utils/helper";
// import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";

// import { useGetPercentageQuery } from "../../../redux/uniformService/Percentage";
// import { useUploadMutation } from "../../../redux/uniformService/OrderService";


// export default function GeneralSummary({singleData ,setForm,setMailform,vendor,setVendor,poItems,setPoItems,
//                                        setActive,setIsSave,saveData,id,setEmailId}){

//          const [upload] = useUploadMutation();

//          const { branchId, finYearId, userId } = getCommonParams()
   

     

     
    

//         const {data: Partydata} = useGetPartyQuery({params:{branchId, finYearId, userId}});
//         const {data: percentage} = useGetPercentageQuery({params:{branchId, finYearId, userId}});

//         let excessQty =  percentage?.data?.filter(item  =>  item?.active   === true)
//         let  partyOptions = Partydata?.data?.filter(item  => item?.partyType  ===   "VENDOR")
//         let data = singleData?.data
      
// console.log(data,"data")
        
        


//    useEffect(() => {
//         if (poItems.length >= 5) return
//         setPoItems(prev => {
//             let newArray = Array.from({ length: 5  - prev.length }, i => {
//                 return { excessQty: "", qty: 0.00,orderQty:0.00 }
//             })
//             return [...prev, ...newArray]
//         }
//         )
//     }, [poItems])

 
//        const exportAndUploadExcel = async (data, text = "uploaded") => {
           
//            try {
//                const combinedData =data?.orderBillItems?.map((item, index) => ({
//                    SrNo: index + 1,
//                    PONumber: data.docId,
//                    OrderDate: getDateFromDateTime(data.orderdate),
//                    Department: item.department,
//                    Class: item.class,
//                    ItemCode: item.itemCode,
//                    BarCode: item.barCode,
//                    SeasonSupplierCode: item.supplierCode,
//                    StyleCode: item.styleCode,
//                    Size: item.size,
//                    sizeDescription: item.sizeDesc,
//                    Color: item.color,
//                    Mrp:item.mrp,
//                    OrderQty:item.orderQty,
//                    Product: item.product,
//                    excessQty:item.excessQty,
//                    Quantity: item.qty
//                }));
       
//                const worksheet = XLSX.utils.json_to_sheet(combinedData);
//                const workbook = XLSX.utils.book_new();
//                XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
       
//                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//                const excelBlob = new Blob(
//                    [excelBuffer],
//                    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
//                );
       
//                const fileName = `Order_${Date.now()}.xlsx`;
    
//                const formData = new FormData();
//                formData.append('file', excelBlob, fileName);
//                formData.append('id',id);
//                const response = await upload({body: formData ,id }).unwrap();
//                console.log("Upload response?.data?.id:", response?.data?.id);

//                setEmailId(response?.data?.id)

//               //  toast.success(`${text} Successfully`);
//                console.log("Upload Response:", response);
       
       
       
//            } catch (error) {
//                console.error("Error during Export and Upload:", error);
//                toast.error("Something went wrong!");
//            }
//        };
       
        
    



//       const handleQtyChange = (field,index, value,orderQty) => {
//         setPoItems((prev) => {
//         let newItem=structuredClone(prev)
//         newItem[index][field]=value
//         if (field === 'excessQty' && index === 0 ) { 
//           for (let i = 0; i < newItem.length; i++) {
//             if(newItem[i].orderQty  > 0) {
//               newItem[i]['excessQty'] = value;
//               const percentage = parseFloat((newItem[i].orderQty * value) / 100);
//               newItem[i]['qty'] = parseFloat(newItem[i].orderQty) + percentage;
//             }
  
//           }
//         } 
//         if(field === 'excessQty'){
     
//           let qty = "qty"
//           let percentage=parseFloat((orderQty * value) / 100)
//           newItem[index][qty]=(parseFloat(orderQty) + percentage);
//         }
//         return newItem
//       });
//     }
      
//        console.log(poItems,"poItems");
         
//        console.log(data,"data");


    
//     return(
//         <>
//       <FormHeader
//       model={"Order"}
//       />   
             
//     <div className="flex flex-col w-full bg-white p-6 h-full overflow-auto">


//   <div className="grid grid-cols-7 gap-4 border border-gray-300 pb-3 p-2 rounded h-[15%]"  >

//   <div className="flex flex-col ">
//     <label className="text-xs font-semibold text-gray-600">Po Number</label>
//     <input
//       type="text"
//       className="border-2  rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 border-blue-400 font-bold text-black"
//       value={data?.docId}
//     />
//   </div>
//   <div className="flex flex-col ">
//     <label className="text-xs font-semibold text-gray-600">Po Date</label>
//     <input
//       type="text"
//       className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"

//       value={getDateFromDateTime(data?.orderdate)}

//     />
//   </div>
//   <div className="flex flex-col ">
//     <label className="text-xs font-semibold text-gray-600">Customer</label>
//     <input
//       type="text"
//       className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
//       value={ "MAX"}
//     />
//   </div>

//   <div className="flex flex-col ">
//     <label className="text-xs font-semibold text-gray-600">Manufacture</label>
//     <input
//       type="text"
//       className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 w-80"
//       value={data?.manufacture || ""}
//       />

//   </div>
// </div>

     

//   <div className="w-full mt-5 mb-3 h-[250px] overflow-y-auto overflow-x-auto "> 
//   <table className="table-fixed w-full text-xs rounded-lg border border-gray-200 h-[90%]">
//     <thead className="bg-gray-200 text-gray-700 ">
//       <tr className="p-2">
//         <th className="w-[50px] p-2">S No</th>
//         <th className="w-[120px] p-2">Department</th>   
//         <th className="w-[150px]">Class-SubClass</th>    
//         <th className="w-[120px]">ItemCode</th>     
//         <th className="w-[120px]">BarCode</th>    
//         <th className="w-[120px]">SeasonSupplierCode</th> 
//         <th className="w-[120px]">StyleCodeGroup</th>     
//         <th className="w-[150px]">SizeDesc</th> 
//          <th className="w-[50px]">Size</th>  
//         <th className="w-[90px]">Color</th>    
//         <th className="w-[50px]">MRP</th>   
//         <th className="w-[50px]">OrderQty</th> 
//         <th className="w-[50px]">Excess %</th>
//         <th className="w-[50px]">Qty</th>
//       </tr>
//     </thead>
  
//       <tbody className="">
//           {(poItems || []).map((item, index) => (
//             <tr key={index} className=" table-row ">
//               <td className="border border-gray-300 text-center p-2">{index + 1}</td>
//               <td className="border border-gray-300 text-left ">{item?.department}</td>
//               <td className="border border-gray-300 text-left ">{item?.class}</td>

//               <td className="border border-gray-300 text-left " >{item?.itemCode}</td>
//               <td className="border border-gray-300 text-left ">{item?.barCode}</td>
    
//               <td className="border border-gray-300 text-left ">{item?.supplierCode}</td>
//               <td className="border border-gray-300 text-left ">{item?.styleCode    }</td>
//               <td className="border border-gray-300 text-left ">{item?.sizeDesc}</td>

//               <td className="border border-gray-300 text-center ">{item?.size}</td>
//               <td className="border border-gray-300 text-center ">{item?.color}</td>

//               <td className="border border-gray-300 text-right ">{item?.mrp}</td>
//               <td className="border border-gray-300 text-right ">{item?.orderQty ||  ""}</td>
//               <td className="border border-gray-300 w-16">
//                 {/* {item?.orderQty   >  0   &&   excessQty?.map(item  =>    */}
//                   <input
//                   type="number"
//                   value={item?.excessQty }
//                   onChange={(e) => handleQtyChange("excessQty" ,index, e.target.value,item?.orderQty)}
//                   className="w-full p-1   rounded-md text-right focus:ring-blue-400"
//                 />
//                 {/* )} */}
            
//             </td>
          
//               <td className="border border-gray-300 text-right w-32 " key={index}>{item?.qty  ||  ""  } </td>

//             </tr>
//           ))}
//             <tr className="border-2  border-gray-400 bg-gray-200 p-2">
//             <td className="border-b border-gray-300 text-center w-2"></td>
//             <td className="border-b border-gray-300 text-left w-32"></td>
//             <td className="border-b border-gray-300 text-left w-32"></td>
//             <td className="border-b border-gray-300 text-left w-32"></td>
//             <td className="border-b border-gray-300 text-left w-32 text-xl text-gray-800  font-extrabold">
//             Total
//             </td>
//             <td className="border-b border-gray-300 text-left w-32"></td>
//             <td className="border-b border-gray-300 text-left w-16"></td>
//             <td className="border-b border-gray-300 text-left w-52"></td>
//             <td className="border-b border-gray-300 text-left w-52"></td>
//             <td className="border-b border-gray-300 text-left w-52"></td>

       
          


//             <td className="border-b border-gray-300 text-right w-32"></td>
//             <td className="border-x border-gray-500 text-right w-32 text-lg  text-gray-800 font-bold ">
//               {poItems.reduce((a, c) => a + parseFloat(c.orderQty || 0), 0) ||  ""}
//               </td>

//             <td className="border-b border-gray-300 text-right w-32 text-lg text-gray-800  font-bold">
//                </td>
//             <td className="border-x border-gray-500 text-right w-32 text-lg text-gray-800 font-bold  ">
//               {poItems.reduce((a, c) => a + parseFloat(c.qty || 0), 0) || ""}
    
//             </td>


//           </tr>

//       </tbody>


//     </table>
//     </div>
  
    
  


//   <div className=" w-full flex gap-4 border border-gray-300  p-2  h-[14%]">
//         <div className="flex flex-col w-72 ">
//           <label className="text-xs font-semibold text-gray-600">Tag vendor</label>
     
//           <DropdownWithSearch  className={"w-72 text-xs border-gray-300"}   value={vendor} setValue={setVendor}  options={partyOptions} optionName={"Tag vendor On Party Master"}   masterName={"PARTY MASTER"}   />
//          </div>
        
//             <div className="flex flex-col ">
//               <label className="text-xs font-semibold text-gray-600">Delivery Date</label>
//               <input
//                 type="text"
//                 className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 value={getDateFromDateTime(data?.deliverydate) }

//               />
//             </div>
//   </div>


//   <div className=" flex  justify-end  gap-3 mt-[50px]">
//             {!data?.isSave    ?
//             <button
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-1  rounded-sm "
//                 onClick={() => {
//                   // setIsSave(true)
//                   setForm(false);
//                   setActive("order")
//                   saveData()

//                 }}
//               >
//                 Save  
//               </button>   
//      :   
//       <></>
//       }
//             <button
//               className="bg-blue-600 hover:bg-blue-700 text-white  p-0  rounded-sm  "
//               onClick={() => {
//                 // setIsSave(true);
//                 saveData();
//                 exportAndUploadExcel(data);
//                 setForm(false);
//                 setActive("Mail");


//               }}



              
//             >
//               Save & Send 
//             </button>
//   </div>
//     </div>



               
   



//         </>
//     )


    
    
    
// };
// import React, { useEffect } from 'react';
// import { DELETE, PLUS } from '../../../icons';
// import { useGetYarnMasterQuery } from '../../../redux/ErpServices/YarnMasterServices';
// import { useGetColorMasterQuery } from '../../../redux/ErpServices/ColorMasterServices';
// import { useGetUnitOfMeasurementMasterQuery } from '../../../redux/ErpServices/UnitOfMeasurementServices';
// import { Loader } from '../../../Basic/components';
// import { useGetProcessQuery } from '../../../redux/ErpServices/processMasterServices';

// const YarnPoItems = ({ id, transType, poItems, setPoItems, readOnly, params, greyFilter }) => {
//     const handleInputChange = (value, index, field) => {
//         const newBlend = structuredClone(poItems);
//         newBlend[index][field] = value;
//         if (field !== "qty") {
//             newBlend[index]["qty"] = (parseFloat(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])).toFixed(3)
//         }
//         setPoItems(newBlend);
//     };


//     useEffect(() => {
//         if (poItems.length >= 12) return
//         setPoItems(prev => {
//             let newArray = Array.from({ length: 12 - prev.length }, i => {
//                 return { yarnId: "", qty: "0.000", taxPercent: "0.000", colorId: "", uomId: "", price: "0.00", discountType: "Percentage", discountValue: "0.00", noOfBags: "0", weightPerBag: "0.000" }
//             })
//             return [...prev, ...newArray]
//         }
//         )
//     }, [transType, setPoItems, poItems])


//     const addRow = () => {
//         const newRow = { yarnId: "", qty: "", taxPercent: "0.000", colorId: "", uomId: "", price: "", discountType: "Percentage", discountValue: "0.00" };
//         setPoItems([...poItems, newRow]);
//     };
//     const handleDeleteRow = id => {
//         setPoItems(yarnBlend => yarnBlend.filter((row, index) => index !== parseInt(id)));
//     };

//     const { data: yarnList } =
//         useGetYarnMasterQuery({ params });

//     const { data: colorList } =
//         useGetColorMasterQuery({ params: { ...params, isGrey: greyFilter ? true : undefined } });

//     const { data: uomList } =
//         useGetUnitOfMeasurementMasterQuery({ params });

//     const { data: processList } = useGetProcessQuery({ params: { ...params, isPcsStage: false } });

//     if (!yarnList || !colorList || !uomList) return <Loader />

//     function getTotals(field) {
//         const total = poItems.reduce((accumulator, current) => {
//             return accumulator + parseFloat(current[field] ? current[field] : 0)
//         }, 0)
//         return parseFloat(total)
//     }

//     function getGross(field1, field2) {
//         const total = poItems.reduce((accumulator, current) => {
//             return accumulator + parseFloat(current[field1] && current[field2] ? current[field1] * current[field2] : 0)
//         }, 0)
//         return parseFloat(total)
//     }

//     return (
//         <div className={` relative w-full overflow-y-auto py-1`}>
//             <table className=" border border-gray-500 text-xs table-auto  w-full">
//                 <thead className='bg-blue-200 top-0 border-b border-gray-500'>
//                     <tr >
//                         <th className="table-data  w-2 text-center">S.no</th>
//                         <th className="table-data ">Prev. Process<span className="text-red-500">*</span></th>
//                         <th className="table-data ">Items<span className="text-red-500">*</span></th>
//                         <th className="table-data ">Colors<span className="text-red-500">*</span></th>
//                         <th className="table-data  w-20">UOM<span className="text-red-500">*</span></th>
//                         <th className="table-data  w-20">Lot No<span className="text-red-500">*</span></th>
//                         <th className="table-data  w-16">No. of Bags<span className="text-red-500">*</span></th>
//                         <th className="table-data  w-16">Weight Per Bag<span className="text-red-500">*</span></th>
//                         <th className="table-data  w-16">Quantity<span className="text-red-500">*</span></th>
//                         <th className="table-data  w-16">Price<span className="text-red-500">*</span></th>
//                         <th className="table-data  w-16">Gross</th>
//                         {readOnly ?
//                             "" :
//                             <th className='w-20  bg-green-600 text-white'>
//                                 <div onClick={addRow}
//                                     className='hover:cursor-pointer w-full h-full flex items-center justify-center'>
//                                     {PLUS}
//                                 </div>
//                             </th>
//                         }
//                     </tr>
//                 </thead>
//                 <tbody className='overflow-y-auto h-full w-full'>
//                     {poItems.map((row, index) => (
//                         <tr key={index} className="w-full table-row">
//                             <td className="table-data w-2 text-left px-1 py-1">
//                                 {index + 1}
//                             </td>
//                             <td className='table-data'>
//                                 <select
//                                     onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "prevProcessId") } }}
//                                     tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
//                                     value={row.prevProcessId}
//                                     onChange={(e) => handleInputChange(e.target.value, index, "prevProcessId")}
//                                     onBlur={(e) => {
//                                         handleInputChange((e.target.value), index, "prevProcessId")
//                                     }
//                                     }
//                                 >
//                                     <option value="">
//                                     </option>
//                                     {(id ? (processList?.data ? processList?.data : []) : (processList?.data ? processList?.data : []).filter(item => item.active)).map((blend) =>
//                                         <option value={blend.id} key={blend.id}>
//                                             {blend.name}
//                                         </option>)}
//                                 </select>
//                             </td>
//                             <td className='table-data'>
//                                 <select
//                                     onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "yarnId") } }}
//                                     tabIndex={"0"} disabled={readOnly} className='text-left w-full rounded py-1 table-data-input'
//                                     value={row.yarnId}
//                                     onChange={(e) => handleInputChange(e.target.value, index, "yarnId")}
//                                     onBlur={(e) => {
//                                         handleInputChange((e.target.value), index, "yarnId")
//                                     }
//                                     }
//                                 >
//                                     <option hidden>
//                                     </option>
//                                     {(id ? yarnList.data : yarnList.data.filter(item => item.active)).map((blend) =>
//                                         <option value={blend.id} key={blend.id}>
//                                             {blend.aliasName}
//                                         </option>)}
//                                 </select>
//                             </td>

//                             <td className='table-data'>
//                                 <select
//                                     onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
//                                     disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
//                                     onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
//                                     onBlur={(e) => {
//                                         handleInputChange((e.target.value), index, "colorId")
//                                     }
//                                     }
//                                 >
//                                     <option hidden>
//                                     </option>
//                                     {(id ? colorList.data : colorList.data.filter(item => item.active)).map((blend) =>
//                                         <option value={blend.id} key={blend.id}>
//                                             {blend.name}
//                                         </option>
//                                     )}
//                                 </select>
//                             </td>
//                             <td className='table-data'>
//                                 <select
//                                     onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
//                                     disabled={readOnly} className='text-left w-20 rounded py-1 table-data-input' value={row.uomId} onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
//                                     onBlur={(e) => {
//                                         handleInputChange((e.target.value), index, "uomId")
//                                     }
//                                     }
//                                 >
//                                     <option hidden>
//                                     </option>
//                                     {(id ? uomList.data : uomList.data.filter(item => item.active)).map((blend) =>
//                                         <option value={blend.id} key={blend.id}>
//                                             {blend.name}
//                                         </option>
//                                     )}
//                                 </select>
//                             </td>
//                             <td className='table-data'>
//                                 <input
//                                     onKeyDown={e => {
//                                         if (e.key === "Delete") { handleInputChange("0", index, "lotNo") }
//                                     }}
//                                     min={"0"}
//                                     type="text"
//                                     onFocus={(e) => e.target.select()}
//                                     className="text-right rounded py-1 w-16 px-1 table-data-input"
//                                     value={(!row.lotNo) ? 0 : row.lotNo}
//                                     disabled={readOnly}
//                                     inputMode='decimal'
//                                     onChange={(e) => {
//                                         handleInputChange(e.target.value, index, "lotNo")
//                                     }
//                                     }
//                                     onBlur={(e) => {
//                                         handleInputChange(parseFloat(e.target.value), index, "lotNo")
//                                     }
//                                     }

//                                 />
//                             </td>
//                             <td className='table-data'>
//                                 <input
//                                     onKeyDown={e => {
//                                         if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
//                                         if (e.key === "Delete") { handleInputChange("0", index, "noOfBags") }
//                                     }}
//                                     min={"0"}
//                                     type="number"
//                                     onFocus={(e) => e.target.select()}
//                                     className="text-right rounded py-1 w-16 px-1 table-data-input"
//                                     value={(!row.noOfBags) ? 0 : row.noOfBags}
//                                     disabled={readOnly}
//                                     inputMode='decimal'
//                                     onChange={(e) => {
//                                         handleInputChange(e.target.value, index, "noOfBags")
//                                     }
//                                     }
//                                     onBlur={(e) => {
//                                         handleInputChange(parseFloat(e.target.value), index, "noOfBags")
//                                     }
//                                     }
//                                 />
//                             </td>
//                             <td className='table-data'>
//                                 <input
//                                     onKeyDown={e => {
//                                         if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
//                                         if (e.key === "Delete") { handleInputChange("0", index, "weightPerBag") }
//                                     }}
//                                     min={"0"}
//                                     type="number"
//                                     onFocus={(e) => e.target.select()}
//                                     className="text-right rounded py-1 w-16 px-1 table-data-input"
//                                     value={(!row.weightPerBag) ? 0 : row.weightPerBag}
//                                     disabled={readOnly}
//                                     inputMode='decimal'
//                                     onChange={(e) =>
//                                         handleInputChange(e.target.value, index, "weightPerBag")
//                                     }
//                                     onBlur={(e) => {
//                                         handleInputChange(parseFloat(e.target.value).toFixed(3), index, "weightPerBag")
//                                     }
//                                     }
//                                 />
//                             </td>
//                             <td className='table-data'>
//                                 <input
//                                     onKeyDown={e => {
//                                         if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
//                                         if (e.key === "Delete") { handleInputChange("0.000", index, "qty") }
//                                     }}
//                                     min={"0"}
//                                     type="number"
//                                     className="text-right rounded py-1 px-1 w-16 table-data-input"
//                                     onFocus={(e) => e.target.select()}
//                                     value={(!row.qty) ? 0 : row.qty}
//                                     disabled={readOnly}
//                                     onChange={(e) =>
//                                         handleInputChange(e.target.value, index, "qty")
//                                     }
//                                     onBlur={(e) => {
//                                         handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty");
//                                     }
//                                     }
//                                 />
//                             </td>
//                             <td className='table-data'>
//                                 <input
//                                     onKeyDown={e => {
//                                         if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
//                                         if (e.key === "Delete") { handleInputChange("0.00", index, "price") }
//                                     }}
//                                     min={"0"}
//                                     type="number"
//                                     className="text-right rounded py-1 w-16 px-1 table-data-input"
//                                     onFocus={(e) => e.target.select()}
//                                     value={(!row.price) ? 0 : row.price}
//                                     disabled={readOnly || Boolean(row?.alreadyCancelData?._sum?.qty)}
//                                     onChange={(e) =>
//                                         handleInputChange(e.target.value, index, "price")
//                                     }
//                                     onBlur={(e) => {
//                                         handleInputChange(parseFloat(e.target.value).toFixed(2), index, "price");
//                                     }
//                                     }
//                                 />
//                             </td>
//                             <td className='table-data'>
//                                 <input
//                                     type="number"
//                                     onFocus={(e) => e.target.select()}
//                                     className="text-right rounded py-1 w-16 px-1 table-data-input"
//                                     value={(!row.qty || !row.price) ? 0 : (parseFloat(row.qty) * parseFloat(row.price)).toFixed(2)}
//                                     disabled={true}
//                                 />
//                             </td>
//                             {readOnly
//                                 ?
//                                 ""
//                                 :
//                                 <td className='table-data w-20'>
//                                     <div tabIndex={-1} onClick={() => handleDeleteRow(index)}
//                                         className='flex justify-center px-2 py-1.5 items-center cursor-pointer'>
//                                         {DELETE}
//                                     </div>
//                                 </td>
//                             }
//                         </tr>
//                     ))}
//                     <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>
//                         <td className="table-data text-center w-10 font-bold" colSpan={5}>Total</td>
//                         <td className="table-data  w-10"></td>
//                         <td className="table-data text-right px-1 w-10">{getTotals("noOfBags")}</td>
//                         <td className="table-data  w-10"></td>
//                         <td className="table-data text-right px-1 w-10">{getTotals("qty").toFixed(3)}</td>
//                         <td className="table-data  w-10"></td>
//                         <td className="table-data text-right px-1  w-10">{getGross("qty", "price").toFixed(2)} </td>
//                         {!(readOnly)
//                             &&
//                             <td className="table-data w-10"></td>
//                         }
//                     </tr>
//                 </tbody>
//             </table>
//         </div>
//     )
// }

// export default YarnPoItems
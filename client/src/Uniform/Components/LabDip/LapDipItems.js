import { HiPlus } from "react-icons/hi";
import { findFromList } from "../../../Utils/helper";

const LapDipItems = ( {poItems  , setPoItems  , styleSheetData , flattenedData   }   )  =>  {

console.log(poItems,"c");


poItems?.poGrid?.forEach(parent => {
  parent?.poSubGrid.forEach(child => {
    console.log(parent, "Parent Child");
      flattenedData.push({
        
        customer: poItems?.customer?.name,
        poNumber : poItems?.docId,
        styleNo: parent?.fabCode,
        id: parent?.id,
        color: child?.color?.name,
        fabType : child?.fabType,
        uom: child?.UnitOfMeasurement?.name,
        fiberContent: child?.fiberContent,

      });
    // });
  });
});

const sampleTypes = ["Sample A", "Sample B", "Sample C", "Sample D"]
console.log("Flattened Data:", flattenedData);  

    return  (

        <>  
            <div className="flex justify-between items-center mb-2">
                    <h2 className="font-medium text-slate-700">List Of Items</h2>
                    <div className="flex gap-2 items-center">

                        <button
                            onClick={() => {
                                // addNewRow()
                            }}
                            className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                            <HiPlus className="w-3 h-3 mr-1" />
                            Add Item
                        </button>
                    </div>

                </div>
                 <div className="">

                   <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-200 text-gray-800">
                            <tr>
                                <th
                                    className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    S.No
                                </th>
                                <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                    Style No
                                </th>
                                         <th

                                    className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                   Fab Type
                                </th>       
                                  <th

                                    className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                   Fiber Content
                                </th>
                                       <th

                                    className={`w-9 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                   Uom
                                </th>
                                <th

                                    className={`w-14 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                  Color      
                                </th>
                               <th

                                    className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                                >
                                  Options  
                                </th>
                 
             
                  

                     

                            </tr>
                        </thead>
                          <tbody className='overflow-y-auto h-full w-full'>
                        {(flattenedData  ||  [])?.map((row, index) => (
                            <tr key={index} className="border border-blue-gray-200 cursor-pointer">
                                <td className="w-12 border border-gray-300 text-[11px] text-center p-0.5">
                                    {index + 1}
                                </td>

                                <td className=' border border-gray-300 text-[11px] w-40'>
                                        {  findFromList(row.styleNo,styleSheetData?.data,"fabCode") }
                                </td>   
                           
                            
                                 <td className=' border border-gray-300 text-[11px]'>
                             {  row?.fabType || "" }
                                </td>         
                                  <td className=' border border-gray-300 text-[11px]'>
                                        {  row?.fiberContent || "" }
                                </td>        
                                   <td className=' border border-gray-300 text-[11px]'>
                                        {  row?.uom || "" }
                                </td> 
                                    <td className=' border border-gray-300 text-[11px]'>
                                {  row?.color || "" }
                                </td> 
                              <td className=' border border-gray-300 text-[11px] py-2'>
                                               <div className="flex flex-row gap-6 text-[10px]">
                                            {sampleTypes.map((sample, sampleIndex) => (
                                                <label key={sampleIndex} className="flex items-center gap-1">
                                                <input
                                                    type="radio"
                                                    name={`bestSample-${row.styleNo}-${row.color}`} // Unique per row
                                                    value={sample}
                                                    onChange={(e) => {
                                                    // handle sample selection if needed
                                                    console.log(`Best sample for ${row.styleNo} / ${row.color}:`, e.target.value);
                                                    }}
                                                />
                                                {sample}
                                                </label>
                                            ))}
        </div>
                                </td> 
                            </tr>
                        ))}
        

                    </tbody>
                     </table>
                    </div>

        </>
    )
}

export default LapDipItems;
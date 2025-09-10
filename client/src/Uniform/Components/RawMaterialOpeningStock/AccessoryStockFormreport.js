import React, { useEffect } from 'react';
import { DELETE, PLUS } from '../../../icons';
import { useGetAccessoryMasterQuery } from '../../../redux/uniformService/AccessoryMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import {  useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { Loader } from '../../../Basic/components';
import { findFromList } from '../../../Utils/helper';

const AccessoryStockFormReport = ({ id, params, setPoItems, allData, rawMaterialType }) => {

       const { data: accessoryList } =
            useGetAccessoryMasterQuery({ params })
    
    
        const { data: colorList } =
            useGetColorMasterQuery({ params });
    
        const { data: uomList } =
        useGetUomQuery({ params });
    
        const { data: sizeList } =
            useGetSizeMasterQuery({ params });
    
        function findAccessoryItemName(id) {
            if (!accessoryList) return 0
            let acc = accessoryList.data.find(item => parseInt(item.id) === parseInt(id))
            return acc ? acc.accessoryItem.name : null
        }
    
        function findAccessoryGroupName(id) {
            if (!accessoryList) return 0
            let acc = accessoryList.data.find(item => parseInt(item.id) === parseInt(id))
            return acc ? acc.accessoryItem.AccessoryGroup.name : null
        }
    
    
        function getTotals(field) {
            const total = allData?.StockReport?.reduce((accumulator, current) => {
                return accumulator + parseFloat(current[field] ? current[field] : 0)
            }, 0)
            return parseFloat(total)
        }




    return (
       <>
                  <div className={` relative w-full overflow-y-auto p-3`}>
                      <table className=" border border-gray-500 text-xs table-auto w-full">
                          <thead className='bg-blue-200 top-0 border border-gray-500'>
                              <tr>
                                  <th className="table-data  w-2 text-center">S.no</th>
                                  <th className="table-data ">Accessory Name<span className="text-red-500">*</span></th>
                                  <th className="table-data  w-36">Accessory Item</th>
                                  <th className="table-data  w-36">Accessory Group</th>
                                  <th className="table-data ">Colors<span className="text-red-500">*</span></th>
                                  <th className="table-data  w-20">Size<span className="text-red-500">*</span></th>
                                  <th className="table-data  w-20">UOM<span className="text-red-500">*</span></th>
                                  <th className="table-data  w-20">Lot No<span className="text-red-500">*</span></th>
                                  <th className="table-data  w-16">Quantity<span className="text-red-500">*</span></th>
                                  <th className="table-data  w-16">Price<span className="text-red-500">*</span></th>
                             
                              </tr>
                          </thead>
                          <tbody className='overflow-y-auto  h-full w-full'>
                            {allData?.StockReport?.map((item,index)  =>  
                            <tr className='w-full table-row'>
                                <td className='table-data  w-2 text-left px-1'>
                                    {index + 1}
                                </td>
                                <td className='  table-data   shadow-xl'>
                                 {findFromList(item.accessoryId, accessoryList?.data, "aliasName")}
                                 
                                </td>
                                <td className='  table-data   shadow-xl'>
                                {findAccessoryItemName(item.accessoryId)}
                                </td>
                                <td className='  table-data   shadow-xl'>
                                {findAccessoryGroupName(item.accessoryId)}
                                </td>
                                <td className='  table-data   shadow-xl'>
                                {findFromList(item.colorId, colorList?.data, "name")}

                                </td>
                                <td className='  table-data   shadow-xl'>
                                {findFromList(item.sizeId, sizeList?.data, "name")}

                                </td>
                                <td className='  table-data   shadow-xl'>
                                {findFromList(item.uomId, uomList?.data, "name")}
                                
                                </td>
                                <td className='  table-data   shadow-xl'>
                                {item.lotNo}
                                </td>
                                <td className='  table-data   shadow-xl'> 
                                {item.qty}
                                </td>
                                <td className='  table-data   shadow-xl'>
                                {item.price}
                                </td>
                             
                            </tr>
                            )}
                                <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>
                            <td className="table-data text-center w-10 font-bold" colSpan={9}>Total</td>
                           
                            <td className="table-data text-right px-1 w-10">{getTotals("qty").toFixed(3)}</td>
                        
                            {/* <td className="table-data text-right px-1  w-10">{getGross("qty", "price").toFixed(2)} </td> */}
                           
                        </tr>
                          </tbody>
                      </table>
                  </div>
              </>
    )
}

export default AccessoryStockFormReport
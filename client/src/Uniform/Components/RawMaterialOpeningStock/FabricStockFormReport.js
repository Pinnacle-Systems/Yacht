import React, { useEffect, useState } from 'react';
import { DELETE, PLUS } from '../../../icons';
import { useGetAccessoryMasterQuery } from '../../../redux/uniformService/AccessoryMasterServices';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import {  useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { Loader } from '../../../Basic/components';
import { findFromList, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import ReactPaginate from 'react-paginate';
import { showEntries } from '../../../Utils/DropdownData';
import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService';

const FabricStockFormReport = ({ id, poItems, setPoItems, allData, params ,rawMaterialType,

    currentPageNumber ,totalCount,
                          setCurrentPageNumber
}) => {

      const [dataPerPage, setDataPerPage] = useState("10");
    

      const { data: procesList, isLoading: processListLoading, isFetching: processListFetching } = useGetProcessMasterQuery({ params })

    const { data: fabricList, isLoading: fabricListLoading, isFetching: fabricListFetching } = useGetFabricMasterQuery({ params })
    const { data: uomList, isLoading: uomLoading, isFetching: uomFetching } = useGetUomQuery({ params })
    const { data: colorList, isLoading: colorLoading, isFetching: colorFetching } = useGetColorMasterQuery({ params })
    const { data: designList, isLoading: designLoading, isFetching: designFetching } = useGetdesignQuery({ params })
    const { data: gaugeList, isLoading: gaugeLoading, isFetching: gaugeFetching } = useGetGaugeQuery({ params })
    const { data: loopList, isLoading: loopLoading, isFetching: loopFetching } = useGetLoopLengthQuery({ params })
    const { data: gsmList, isLoading: gsmLoading, isFetching: gsmFetching } = useGetgsmQuery({ params })
    const { data: diaList, isLoading: diaLoading, isFetching: diaFetching } = useGetDiaQuery({ params })

  const handleOnclick = (e) => {
    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
  }

    if ( !colorList || !uomList ) return <Loader />

    function getTotals(field) {
        const total = allData?.StockReport?.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field] ? current[field] : 0)
        }, 0)
        return parseFloat(total)
    }

    return (
      
            <div className={` relative w-full overflow-auto p-3 `}>
              <>
              <div className=' overflow-auto' >
          
                <table id="table-to-xls" className=" border border-gray-500 text-xs table-auto w-full">
                    <thead className='bg-blue-200 top-0 border border-gray-500'>
                        <tr>
                        <th className="table-data w-10 text-center">S.no</th>
                                        <th className="table-data ">Prev. Process<span className="text-red-500">*</span></th>
                                        <th className="table-data ">Items<span className="text-red-500">*</span></th>
                                        <th className="table-data ">Colors<span className="text-red-500">*</span></th>
                                        <th className="table-data ">Design<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">Gauge<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">LL<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">GSM<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">K Dia<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">F Dia<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">UOM<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-20">Lot No<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">No Of Rolls<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">Price<span className="text-red-500">*</span></th>
                                        <th className="table-data  w-16">Quantity<span className="text-red-500">*</span></th>

                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>
                        {allData?.StockReport?.map((item, index) => (
                            <tr key={index} className="w-full table-row">
                                <td className="table-data  w-2 text-left px-1">
                                    {index + 1}
                                </td>
                                 <td>
                                 {findFromList(item.processId, procesList?.data, "name")}                           
                                 </td>
                                <td className='  table-data   shadow-xl'>
                                    {findFromList(item.fabricId, fabricList?.data, "name")}
                                </td>
                                <td className='  table-data   shadow-xl'>
                                    {findFromList(item.colorId, colorList?.data, "name")}
                                </td>
                                <td className='   table-data  shadow-xl'>
                                    {findFromList(item.designId, designList?.data, "name")}
                                </td>
                                <td className='   table-data  shadow-xl'>
                                    {findFromList(item.gaugeId, gaugeList?.data, "name")}
                                </td>
                                <td className='  table-data   shadow-xl'>
                                    {findFromList(item.loopLengthId, loopList?.data, "name")}
                                </td>
                                <td className='  table-data   shadow-xl'>
                                    {findFromList(item.gsmId, gsmList?.data, "name")}
                                </td>
                                <td className='   table-data  shadow-xl'>
                                    {findFromList(item.kDiaId, diaList?.data, "name")}
                                </td>
                                <td className='  table-data   shadow-xl'>
                                    {findFromList(item.fDiaId, diaList?.data, "name")}
                                </td>
                                <td className='  table-data   shadow-xl'>
                                    {findFromList(item.uomId, uomList?.data, "name")}
                                </td>
                                   <td className='table-data'>
                                   {item.lotNo}
                                   </td>
                                   <td className='table-data'>
                                   {item.noOfRolls}
                                   </td>
                                 
                                <td className='table-data'>
                                  {item.price}
                                </td>
                                <td className='table-data'>
                                    {item.qty}
                                   </td>
                            
                            </tr>
                        ))}
                        <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>
                            <td className="table-data text-center w-10 font-bold" colSpan={14}>Total</td>
                
                            <td className="table-data text-right px-1 w-10">{getTotals("qty").toFixed(3)}</td>
                        
                            {/* <td className="table-data text-right px-1  w-10">{getGross("qty", "price").toFixed(2)} </td> */}
                           
                        </tr>
                    </tbody>
                   </table>
                   </div>
        </>
       
      </div>
      
       
    )
}

export default FabricStockFormReport
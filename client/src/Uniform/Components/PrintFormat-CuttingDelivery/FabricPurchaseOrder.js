import React from 'react'
import { useEffect, useState } from 'react'
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetdesignQuery } from "../../../redux/uniformService/DesignMasterServices";
import { useGetGaugeQuery } from "../../../redux/services/GaugeMasterServices";
import { useGetLoopLengthQuery } from "../../../redux/uniformService/LoopLengthMasterServices";
import { useGetgsmQuery } from "../../../redux/uniformService/GsmMasterServices";
import { useGetDiaQuery } from "../../../redux/uniformService/DiaMasterServices";
import secureLocalStorage from 'react-secure-storage';
import { Loader } from '../../../Basic/components';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { findFromList, getAllowableReturnQty, getDateFromDateTime, substract } from '../../../Utils/helper';
import { numToWords, titleCase } from "../../../Utils/helper";


const FabricPurchaseOrder = ({ purchaseData, poItems = [] }) => {


  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )
  const [supplierId, setSupplierId] = useState("");
  const params = {
    branchId, companyId
  };

  const { data: fabricList, isLoading: fabricListLoading, isFetching: fabricListFetching } = useGetFabricMasterQuery({ companyId })
  const { data: uomList, isLoading: uomLoading, isFetching: uomFetching } = useGetUomQuery({ companyId })
  const { data: colorList, isLoading: colorLoading, isFetching: colorFetching } = useGetColorMasterQuery({ companyId })
  const { data: designList, isLoading: designLoading, isFetching: designFetching } = useGetdesignQuery({ companyId })
  const { data: gaugeList, isLoading: gaugeLoading, isFetching: gaugeFetching } = useGetGaugeQuery({ companyId })
  const { data: loopList, isLoading: loopLoading, isFetching: loopFetching } = useGetLoopLengthQuery({ companyId })
  const { data: gsmList, isLoading: gsmLoading, isFetching: gsmFetching } = useGetgsmQuery({ companyId })
  const { data: diaList, isLoading: diaLoading, isFetching: diaFetching } = useGetDiaQuery({ companyId })

  if (fabricListLoading || fabricListFetching || uomFetching || uomLoading || colorFetching || colorLoading || designLoading || designFetching ||
    gaugeLoading || gaugeFetching || loopLoading || loopFetching || gsmLoading || gsmFetching || diaLoading || diaFetching) {
    return <tr>
      <td>
        <Loader />
      </td>
    </tr>
  }

  const poItem = poItems.filter((item) => item.fabricId != 0)

  function getTotals(field) {
    const total = poItems.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[field] ? current[field] : 0)
    }, 0)
    return parseFloat(total)
  }
  return (
    <div className='h-full'>
      <table className=" text-xs border  border-gray-500 table-auto w-full">
        <thead className=' border border-gray-500 top-0  bg-green-200'>
          <tr className=''>
            <th className="table-data text-center w-16">S.no</th>

            <th className="table-data w-56">Description</th>
            <th className="table-data ">Color</th>
            <th className="table-data  ">UOM</th>
            <th className='w-16 table-data'>
              Design
            </th>
            <th className='w-12 table-data'>
              Gauge
            </th>
            <th className='w-12 table-data'>
              LL
            </th>
            <th className='w-12 table-data'>
              Gsm
            </th>
            <th className='w-12 table-data'>
              K-Dia
            </th>
            <th className='w-12 table-data'>
              F-Dia
            </th>
            <th className="table-data  "> Qty</th>
          </tr>
        </thead>
        <tbody>
          {poItem.map((value, index) => (
            <tr className='border  border-gray-500 w-full' key={index}>
              <td className='table-data text-center px-1  '>{index + 1} </td>

              <td className='table-data  px-1 w-56'>
                {findFromList(value.fabricId, fabricList.data, "aliasName")}
              </td>
              <td className='table-data  px-1'>
                {findFromList(value.colorId, colorList.data, "name")}
              </td>

              <td className='table-data text-left px-1  w-20'>
                {findFromList(value.uomId, uomList.data, "name")}
              </td>
              <td className='text-left px-1  table-data '>
                {findFromList(value.designId, designList.data, "name")}
              </td>
              <td className='text-right px-1  table-data '>
                {findFromList(value.gaugeId, gaugeList.data, "name")}
              </td>
              <td className='text-right px-1  table-data '>
                {findFromList(value.loopLengthId, loopList.data, "name")}
              </td>
              <td className='text-right px-1  table-data '>
                {findFromList(value.gsmId, gsmList.data, "name")}
              </td>
              <td className='text-right px-1  table-data '>
                {findFromList(value.kDiaId, diaList.data, "name")}
              </td>
              <td className='text-right px-1  table-data '>
                {findFromList(value.fDiaId, diaList.data, "name")}
              </td>
              <td className='table-data text-right px-1  w-24'>{parseFloat(value.delQty).toFixed(3)}</td>
            </tr>
          ))}
          <tr className='border  border-gray-500'>
            <th className='table-data text-center px-1  font-bold text-xs' colSpan={10}>TOTAL</th>
            <td className='px-1 h-8  text-right'>{parseFloat(getTotals("delQty")).toFixed(3)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default FabricPurchaseOrder
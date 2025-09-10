import React from 'react'
import Address from './Address';
import RainDot from "../../../assets/RainDot.png"
import QRCode from "react-qr-code";
import { getDateFromDateTimeToDisplay } from '../../../Utils/helper';
import { useGetPartyByIdQuery } from '../../../redux/services/PartyMasterService';
import ProductionDeliveryDetails from './ProductionDeliveryDetails';
import { useGetProductionDeliveryByIdQuery } from '../../../redux/uniformService/ProductionDeliveryServices';
require('number-to-text/converters/en-in');

export default function PrintFormatProductionDelivery({ innerRef, id }) {

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetProductionDeliveryByIdQuery({ id }, { skip: !id });


  const { data: supplierDetails } =
    useGetPartyByIdQuery(singleData?.data?.supplierId, { skip: !singleData?.data?.supplierId });

  const from = {
    aliasName: "PS TEX",
    name: "PS TEX - GARMENT",
    address: "GS Edifice , 13/1,1st Floor , Bungalow Road,Avinashi - TiruppurRoad,Tiruppur",
    gstNo: "33AAICB7704K",
    panNo: "AAICB7704K",
    mobile: "0424-641601",
    eMail: "pinnaclesystems@gmail.com",
  }

  const fromAddress = {
    aliasName: "RAINDOT",
    name: "RAINDOT - GARMENT",
    address: "GS Edifice , 13/1,1st Floor , Bungalow Road,Avinashi - TiruppurRoad,Tiruppur",
    gstNo: "33AAICB7704K",
    panNo: "AAICB7704K",
    contactMobile: "0424-641601",
    email: "raindot@gmail.com",
  }

  if (!singleData || isSingleFetching || isSingleLoading) return null

  return (
    <div className="h-screen w-full flex flex-col justify-between border-2 m-0 border-black" id='poPrint' ref={innerRef}>
      <div>
        <div className='flex'>
          <div className='w-1/4 flex items-center justify-center'>
            <img src={RainDot} alt='raindot-logo' className="h-9 w-9" />
            <h1 className='font-bold text-md text-green-700'>{from.aliasName}</h1>
          </div>
          <div className='text-start p-2 w-full'>
            <div className=' w-full text-center p-1 '>
              <h1 className='font-bold text-green-700 text-md '>{from.name}</h1>
              <h1 className='text-xs'>{from.address}--</h1>
              <h1 className='text-xs'>{from.mobile}</h1>
              <h1 className='text-xs'>PANNO: {from.panNo} / GSTNO: {from.gstNo}</h1>
            </div>
          </div>
        </div>
        <div className='text-center p-1 flex items-center justify-center font-bold text-green-700 w-full'> Production Delivery
        </div>
        <div className=''>
          <table className="text-xs border border-gray-500 w-full table-auto ">
            <tbody>
              <tr className='text-xs'>
                <td >Doc. Id: {singleData?.data?.docId}</td>
                <td> Del. Date : {getDateFromDateTimeToDisplay(singleData?.data?.createdAt)}</td>
                <td> Due. Date : {getDateFromDateTimeToDisplay(singleData?.data?.dueDate)}</td>
                <td className='table-data px-14 py-1 w-1/6'>
                  <QRCode value={singleData?.data?.docId} size={80} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Address supplierDetails={supplierDetails} fromAddress={fromAddress} />
        <ProductionDeliveryDetails productionDeliveryDetails={singleData.data.ProductionDeliveryDetails} />
      </div>
      <div className=' w-full'>
        <div className='w-full '>
          <div className='w-full border border-gray-600 flex items-center'><h1 className='font-bold text-sm'>Remarks : </h1>
            <span className='text-xs'>
              {singleData?.data?.remarks}
            </span>
          </div>
        </div>
        <div className=''>
          <div className='text-sm text-right px-24 font-bold'>
            For PS-TEX
          </div>
          <div className='border grid grid-rows-1 grid-flow-col p-2 font-bold text-xs '>
            <h1>Prepared By:</h1>
            <h1>Verified By:</h1>
            <h1>Received By:</h1>
            <h1>Approved By :</h1>
          </div>
        </div>
      </div>
    </div>
  )
}


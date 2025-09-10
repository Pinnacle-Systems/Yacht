import React from 'react'
import Address from './Address';
import RainDot from "../../../assets/RainDot.png"
import QRCode from "react-qr-code";
import FabricPurchaseOrder from './FabricPurchaseOrder';
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
import { findFromList, findFromListReturnsItem } from '../../../Utils/helper';
import secureLocalStorage from 'react-secure-storage';
import {
  useGetBranchQuery,
} from '../../../redux/services/BranchMasterService';
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';


export default function Form({ innerRef, poItems, supplierDetails, singleData, poNumber, poDate, payTermId, deliveryType, deliveryToId,
  taxTemplateId }) {

  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  )
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  )

  const params = {
    branchId, companyId
  };
  const { data: payTermList } =
    useGetPaytermMasterQuery({ params: { ...params } });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });

  function getDeliveryDetails() {
    if (deliveryType === "ToSelf") {
      let deliveryObj = findFromListReturnsItem(deliveryToId, branchList ? branchList.data : [])
      if (!deliveryObj) return null
      return { name: deliveryObj.branchName, address: deliveryObj.address }
    } else {
      let deliveryObj = findFromListReturnsItem(deliveryToId, supplierList ? supplierList.data : [])
      if (!deliveryObj) return null
      return { name: deliveryObj.name, address: deliveryObj.address, contactMobile: deliveryObj.contactMobile }
    }
  }
  const deliveryTo = getDeliveryDetails();

  const from = {
    name: "RAIN DOT - GARMENT",
    address: "GS Edifice , 13/1,1st Floor , Bungalow Road,Avinashi - TiruppurRoad,Tiruppur",
    gstNo: "33AAICB7704K",
    panNo: "AAICB7704K",
    mobile: "0424-641601",
    eMail: "pinnaclesystems@gmail.com",
  }

  if (!supplierDetails || !singleData || !supplierList) return null

  return (
    <div className="p-1 border" ref={innerRef}>
      <div className='border  '>

        <div className='h-28 border border-gray-500'>
          <div className='flex'>

            <div className='w-1/4 flex items-center justify-center'>
              <img src={RainDot} alt='logo' className="h-12 w-12" />
              <h1 className='font-bold text-2xl text-green-700'>RainDot</h1>
            </div>

            <div className='text-center p-2'>
              <div className=' w-full text-center p-1'>
                <h1 className='font-bold text-green-700'>{from.name}</h1>
                <div>
                  {from.address}--
                  {from.mobile}</div>
                <h1>PANNO: {from.panNo} / GSTNO: {from.gstNo}</h1>
              </div>
            </div>
          </div>
        </div>
        <div className='text-center p-1 mt-1 flex items-center justify-center font-bold text-green-700'> Cutting Delivery</div>
        <div className=''>
          <table className="text-xs border border-gray-500 w-full table-auto ">
            <tbody>
              <tr className=''>
                <td >Doc Id: {poNumber}</td>
                <td> Doc Date : {poDate}</td>
                <td className='table-data px-14 py-1 w-1/6'>
                  <QRCode value={poNumber} size={80} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Address deliveryTo={deliveryTo} supplierDetails={supplierDetails} />
        <FabricPurchaseOrder poItems={poItems} />
        <div className='absolute bottom-10 w-full mt-16'>
          <div className='text-sm text-right px-24 font-bold'>
            For PS-TEX
          </div>
          <div className=' w-full border grid grid-rows-1 grid-flow-col p-2 m-5 font-bold text-xs'>
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


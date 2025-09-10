import React from 'react'
import QRCode from "react-qr-code";
import { useEffect, useState } from 'react'
import { Loader } from '../../../Basic/components';

import secureLocalStorage from 'react-secure-storage';
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { findFromList, getDateFromDateTime, getAllowableReturnQty, substract } from '../../../Utils/helper';
import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";

const Address = ({ deliveryTo, supplierDetails }) => {
  if (!deliveryTo || !supplierDetails) return null
  return (
    <div>
      <div className='ml-1'>
        <table className="text-xs  w-full p-2 table-auto ">
          <thead className='text-left p-1 ml-1'>
            <tr className='h-8 '>
              <th className=' font-bold w-1/2 text-sm'>VENDOR DETAILS : </th>
              <th className='table-data font-bold text-sm '>DELIVERY TO :</th>
            </tr>
          </thead>
          <tbody>
            <tr className=' text-xs'>
              <td className='p-1'>
                <h2 className='font-bold text-sm text-green-700'>{supplierDetails.name}</h2>
                <div> {supplierDetails.address} </div>
                <div className='font-bold'>Mobile NO :{supplierDetails.contactMobile}</div>
                <div className='font-bold'>PAN NO :{supplierDetails.panNo}</div>
                <div className='font-bold'>GST NO :{supplierDetails.gstNo}</div>
                <div className='font-bold'> EMAIL :{supplierDetails.email}</div>
              </td >
              <td className='table-data '>
                <h2 className='font-bold text-sm text-green-700'>{deliveryTo.name}</h2>
                <div>{deliveryTo.address}</div>
                <div>CONTACT :{deliveryTo.contactMobile}</div>
                {deliveryTo.panNo &&
                  <div className='font-bold'>PAN NO :{deliveryTo.panNo}</div>
                }
                {deliveryTo.gstNo &&
                  <div className='font-bold'>GST No :{deliveryTo.gstNo}</div>
                }
                {deliveryTo.mail &&
                  <div className='font-bold'>EMAIL :{deliveryTo.mail}</div>
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}


export default Address
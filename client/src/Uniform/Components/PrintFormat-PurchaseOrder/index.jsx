import React from 'react'
import Address from './Address';
import YarnPurchaseOrder from './YarnPurchaseOrder';
import RainDot from "../../../assets/RainDot.png"
import QRCode from "react-qr-code";
import FabricPurchaseOrder from './FabricPurchaseOrder';
import AccessoryPurchaseOrder from './AccessoryPurchaseOrder';
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
import { findFromList, getCommonParams, getDateFromDateTimeToDisplay } from '../../../Utils/helper';
import {
  useGetBranchByIdQuery
} from '../../../redux/services/BranchMasterService';
import { useGetPartyByIdQuery, useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import useTaxDetailsHook from '../../../CustomHooks/TaxHookDetails';
import TaxDetails from './TaxDetails';
import { useGetTermsAndConditionsQuery } from '../../../redux/services/TermsAndConditionsService';
const numberToText = require('number-to-text')
require('number-to-text/converters/en-in');

export default function Form({ poType, innerRef, poItems, supplierDetails, singleData, poNumber, poDate, dueDate, payTermId, deliveryType, deliveryToId,
  remarks,
  taxTemplateId, discountType, discountValue }) {

  const { branchId, companyId } = getCommonParams()

  const { data } = useGetBranchByIdQuery(branchId)

  const branchData = data?.data ? data.data : {};

  const { data: deliveryToBranch } = useGetBranchByIdQuery(deliveryToId, { skip: deliveryType === "ToParty" })
  const { data: deliveryToSupplier } = useGetPartyByIdQuery(deliveryToId, { skip: deliveryType === "ToSelf" })

  let deliveryTo = deliveryType === "ToParty" ? deliveryToSupplier?.data : deliveryToBranch?.data;

  const params = {
    branchId, companyId
  };
  const { data: payTermList } =
    useGetPaytermMasterQuery({ params: { ...params } });
  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });

  const { data: termsAndCondition } = useGetTermsAndConditionsQuery({ params: { poType, companyId } })


  const { isLoading: isTaxHookDetailsLoading, ...taxDetails } = useTaxDetailsHook({ poItems, taxTypeId: taxTemplateId, discountType, discountValue })


  if (!supplierDetails || !singleData || !supplierList || isTaxHookDetailsLoading || !termsAndCondition) return null

  return (
    <div className="h-[950px] w-full flex flex-col justify-between border-2 m-0 border-black" id='poPrint' ref={innerRef}>
      <div>
        <div className='font-bold text-green-700 text-md text-center'>{branchData.branchName}</div>
        <div className='flex'>
          <div className='w-1/4 flex items-center justify-center'>
            <img src={RainDot} alt='logo' className="h-16" />
          </div>
          <div className='text-start p-2 w-full'>
            <div className=' w-full p-1 '>
              <div className='grid text-xs'>
                <h1 className='w-[350px]'>{branchData.address}</h1>
                <h1 className=''>{branchData.mobile}</h1>
                <h1 className=''>PANNO: {branchData.panNo} </h1>
                <h1 className=''>GSTNO: {branchData.gstNo}</h1>
              </div>
            </div>
          </div>
        </div>
        <div className='text-center p-1 text-md flex items-center justify-center font-bold text-green-700 w-full border-t border-gray-500'> PURCHASE ORDER</div>
        <div className='flex justify-between text-sm border  border-gray-600' >
          <div className='grid grid-cols-2 w-full py-2'>
            <div className='flex ml-1'><span className="font-bold">PO No :</span> {poNumber}</div>
            <div className='flex ml-1'><span className="font-bold">PO Date :</span> {getDateFromDateTimeToDisplay(poDate)}</div>
            <div className='flex ml-1'><span className="font-bold">Due Date :</span> {getDateFromDateTimeToDisplay(dueDate)}</div>
            <div className='flex ml-1'><span className="font-bold">Payment Terms :</span> {findFromList(payTermId, payTermList.data, "name")}</div>
          </div>
          <div className='mr-2 p-1'>
            <QRCode value={poNumber} size={80} />
          </div>
        </div>
        <Address deliveryTo={deliveryTo} deliveryType={deliveryType} supplierDetails={supplierDetails} />
        {singleData.transType.toLowerCase().includes("yarn")
          ?
          <YarnPurchaseOrder poItems={poItems} taxDetails={taxDetails} />
          :
          (singleData.transType.toLowerCase().includes("fabric"))
            ?
            <FabricPurchaseOrder poItems={poItems} taxDetails={taxDetails} />
            :
            <AccessoryPurchaseOrder poItems={poItems} taxDetails={taxDetails} />
        }
        <div className='flex justify-end'>
          <table className='border border-gray-500 text-center'>
            <tbody>
              <tr className='border border-gray-500 '><th className='p-2 bg-green-200 text-xs' colSpan={2}>Tax Details</th></tr>
              <TaxDetails items={poItems} taxTemplateId={taxTemplateId} discountType={discountType} discountValue={discountValue} />
              <tr className='border border-gray-500 text-xs '>
                <td className='table-data p-1'>
                  ROUNDOFF
                </td>
                <td className='table-data text-right p-1'>
                  {parseFloat(taxDetails?.roundOffAmount).toFixed(2)}
                </td>
              </tr>
              <tr className='border border-gray-500 text-xs'>
                <td className='table-data p-1 bg-green-200 text-xs'>
                  NET AMOUNT
                </td>
                <td className='table-data p-1 text-xs'>
                  {parseFloat(taxDetails?.netAmount).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className=' w-full'>
        <div className='w-full '>
          <div className='w-full border border-gray-600 flex items-center'>
            <h1 className='font-bold text-sm'>Amount in words    :
            </h1>
            <span className='text-xs'>
              Rs.{numberToText.convertToText(taxDetails?.netAmount, { language: "en-in", separator: "" })} Only
            </span>
          </div>
          <div className='w-full border border-gray-600 flex items-center'><h1 className='font-bold text-sm'>Remarks : </h1>
            <span className='text-xs'>
              {remarks}
            </span>
          </div>
          <div className='w-full '>
            <h1 className='text-sm w-full font-bold'>Terms and Condition :
            </h1>
            <h1 className='text-[10px] w-full border-b border-gray-600'>
              {(((termsAndCondition.data)
                &&
                (termsAndCondition.data)).filter(item => item.isPurchaseOrder).map((value) =>
                  <pre key={value.id} className='font-sans'>{value.description}</pre>
                ))}
            </h1>
          </div>
        </div>
        <div className='mt-3'>
          <div className='text-sm text-right px-2 font-bold italic'>
            For {branchData?.branchName}
          </div>
          <div className='grid grid-rows-1 grid-flow-col p-2 font-bold text-xs mt-8 justify-around'>
            <h1>Prepared By</h1>
            <h1>Verified By</h1>
            <h1>Received By</h1>
            <h1>Approved By</h1>
          </div>
        </div>
      </div>
    </div>
  )
}


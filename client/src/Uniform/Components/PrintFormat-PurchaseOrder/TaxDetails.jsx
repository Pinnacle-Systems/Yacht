import React from 'react'
import useTaxDetailsHook from '../../../CustomHooks/TaxHookDetails'
import { groupBy } from '../../../Utils/helper'

const TaxDetail = ({ items, taxTemplateId, discountType, discountValue, taxKey }) => {
    const { isLoading: isTaxHookDetailsLoading, ...taxDetails } =
        useTaxDetailsHook({ poItems: items, taxTypeId: taxTemplateId, discountType, discountValue })
    if (isTaxHookDetailsLoading) return null
    return (
        <>{console.log(items,"items")}
            <tr className='border border-gray-500 text-xs'>
                <td className='table-data'>
                    CGST@{parseFloat(taxKey)/2}%
                </td>
                <td className='table-data'>
                    {parseFloat(taxDetails.cgstAmount).toFixed(2)}
                </td>
            </tr>
            <tr className='border border-gray-500 text-xs'>
                <td className='table-data'>
                    SGST@{parseFloat(taxKey)/2}%
                </td>
                <td className='table-data'>
                    {parseFloat(taxDetails.sgstAmount).toFixed(2)}
                </td>
            </tr>
        </>
    )
}

const TaxDetails = ({ items, taxTemplateId, discountType, discountValue }) => {
    let taxGroupWise = groupBy(items, "taxPercent")
    return (
        <>{console.log(taxGroupWise,"taxGroupWise")}
            {
                Object.keys(taxGroupWise).map(taxKey =>
                    <TaxDetail taxKey={taxKey} items={taxGroupWise[taxKey]} discountType={discountType} taxTemplateId={taxTemplateId} discountValue={discountValue} />)
            }
        </>
    )
}

export default TaxDetails

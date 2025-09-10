import React from 'react'
import useTaxDetailsHook from '../../../CustomHooks/TaxHookDetails'
import { groupBy } from '../../../Utils/helper'

const TaxDetail = ({ items, taxTemplateId, discountType, discountValue, taxKey, isSupplierOutside = false }) => {
    const { isLoading: isTaxHookDetailsLoading, ...taxDetails } =
        useTaxDetailsHook({ poItems: items, taxTypeId: taxTemplateId, discountType, discountValue, isSupplierOutside })
    if (isTaxHookDetailsLoading) return null
    return (
        <>
            {isSupplierOutside
                ?
                <tr className='border border-gray-500 text-xs '>
                    <td className='table-data'>
                        IGST
                    </td>
                    <td className='table-data text-right'>
                        {parseFloat(taxKey)}%
                    </td>
                    <td className='table-data text-right'>
                        {parseFloat(taxDetails.igstAmount).toFixed(2)}
                    </td>
                </tr>
                :
                <>
                    <tr className='border border-gray-500 text-xs '>
                        <td className='table-data'>
                            CGST
                        </td>
                        <td className='table-data text-right'>
                            {parseFloat(taxKey) / 2}%
                        </td>
                        <td className='table-data text-right'>
                            {parseFloat(taxDetails.cgstAmount).toFixed(2)}
                        </td>
                    </tr>
                    <tr className='border border-gray-500 text-xs'>
                        <td className='table-data'>
                            SGST
                        </td>
                        <td className='table-data text-right'>
                            {parseFloat(taxKey) / 2}%
                        </td>
                        <td className='table-data text-right'>
                            {parseFloat(taxDetails.sgstAmount).toFixed(2)}
                        </td>
                    </tr>
                </>
            }
        </>
    )
}

const TaxDetailsSplitUp = ({ items, taxTemplateId, discountType, discountValue, isSupplierOutside }) => {
    let taxGroupWise = groupBy(items, "taxPercent")
    return (
        <>
            {
                Object.keys(taxGroupWise).filter(item => Boolean(item)).map(taxKey =>
                    <TaxDetail key={taxKey} taxKey={taxKey} items={taxGroupWise[taxKey]} discountType={discountType} taxTemplateId={taxTemplateId} discountValue={discountValue} isSupplierOutside={isSupplierOutside} />)
            }
        </>
    )
}

export default TaxDetailsSplitUp

import React from 'react'
import { discountTypes } from '../../../Utils/DropdownData';
import { Loader } from '../../../Basic/components';
import useTaxDetailsHook from '../../../CustomHooks/TaxHookDetails';
const numberToText = require('number-to-text')


const PoSummary = ({ poItems, readOnly, taxTypeId, isSupplierOutside, discountType, setDiscountType, discountValue, setDiscountValue, remarks, setRemarks }) => {

    const { isLoading: isTaxHookDetailsLoading, ...taxDetails } = useTaxDetailsHook({ poItems, taxTypeId, discountType, discountValue })

    if (isTaxHookDetailsLoading) return <Loader />

    return (
        <div className={`bg-gray-200 rounded z-50 w-[700px] `}>
            <table className="border border-gray-500 w-full text-xs text-start">
                <thead className="border border-gray-500">
                    <tr>
                        <th className="w-36 border border-gray-500">Tax Name</th>
                        <th className="w-28 border border-gray-500">Value</th>
                        <th className="w-28 border border-gray-500">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-500">Remarks</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input type="text" name='value' disabled={readOnly} className='h-7 w-full' value={remarks}
                                onChange={(e) => { setRemarks(e.target.value) }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-500">Gross Amount</td>
                        <td className="border border-gray-500 text-right" colSpan={2}
                        >
                            {parseFloat(taxDetails.grossAmount).toFixed(3)}
                        </td>
                    </tr>
                    <tr>
                        <td className="border border-gray-500">Discount Type</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <select autoFocus name='type' disabled={readOnly} className='text-left w-full rounded h-8'
                                value={discountType}
                                onChange={(e) => { setDiscountType(e.target.value) }}
                            >
                                <option hidden>
                                    Select
                                </option>
                                {discountTypes.map((option, index) => <option key={index} value={option.value} >
                                    {option.show}
                                </option>)}
                            </select>
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Discount</td>
                        <td className="border border-gray-500"
                        >
                            <input type="text" name='value' disabled={readOnly} className='h-7 w-full' value={discountValue}
                                onKeyDown={e => {
                                    if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault()
                                    if (e.key === "Delete") { setDiscountValue(0) }
                                }}
                                min={"0"}
                                onChange={(e) => { setDiscountValue(e.target.value) }}
                            />
                        </td>
                        <td className="border border-gray-500"
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right' value={taxDetails.overAllDiscountAmount}
                            />
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Net Amount</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                                value={
                                    taxDetails.netAmount
                                }
                            />
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Round Off</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                                value={
                                    parseFloat(taxDetails.roundOffAmount).toFixed(2)
                                }
                            />
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Amount in Words</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input disabled type="text" name='value' className='h-7 w-full text-right'
                                value={
                                    numberToText.convertToText(taxDetails.netAmount, { language: "en-in" }) + " Only"
                                }
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default PoSummary;
import React, { useEffect, useState } from 'react'
import { useGetTaxTemplateByIdQuery } from '../../redux/ErpServices/TaxTemplateServices';
import { useGetTaxTermMasterQuery } from '../../redux/ErpServices/TaxTermMasterServices';
import { substract as s } from '../../Utils/helper';

let substract = s;

const TaxTemplateConsolidate = ({ poItems, taxTypeId, isSupplierOutside = false, discountType: overAllDiscountType, discountValue: overAllDiscountValue }) => {
    const [formulas, setFormulas] = useState([])

    const { data, isLoading, isFetching } = useGetTaxTemplateByIdQuery(taxTypeId, { skip: !taxTypeId })

    const { data: taxTermMaster, isLoading: isTemplateTermLoading, isFetching: isTemplateTermFetching } = useGetTaxTermMasterQuery(taxTypeId, { skip: !taxTypeId })

    function getRegex(formula) {
        if (!formula) return formula
        let input = formula;
        const words = formula.match(/\{(.*?)\}/g)
        if (!words) return formula
        words.forEach(element => {
            input = input.replace(element, getFormula(element.slice(1, -1)))
        });
        return getRegex(input)
    }


    function getFormula(constant) {
        const split = constant.split("_");
        let name = split[0];
        let value = split[1];
        let formula = formulas.find(f => f.name === name)
        return formula ? formula[value.toLowerCase()] : ""
    }
    useEffect(() => {
        if (data) {
            setFormulas(data.data.TaxTemplateDetails.map(f => { return { name: (getName(f.taxTermId)), isPowise: getIsPoItem(f?.taxTermId), displayName: f.displayName, value: f.value, amount: f.amount } }))
        }

    }, [isLoading, isFetching, isTemplateTermFetching, isTemplateTermLoading, taxTypeId])

    if (!taxTypeId) return { data: null }
    function getName(id) {
        if (!taxTermMaster) return ""
        let data = taxTermMaster.data.find(t => parseInt(t.id) === parseInt(id))
        if (!data) return ""
        return data.name
    }

    function getFormulaByName(formulaName) {
        let formula = formulas.find(f => f.name === formulaName)
        return formula ? formula : ''
    }

    function getIsPoItem(id) {
        if (!taxTermMaster) return false
        let data = taxTermMaster.data.find(t => parseInt(t.id) === parseInt(id))
        if (!data) return false
        return data.isPoWise
    }

    function getTotalQuantity(taxTerm, valueOrAmount) {
        let calculateItems = structuredClone(poItems)
        let formula = getRegex(getFormulaByName(taxTerm)[valueOrAmount])
        const total = calculateItems.reduce((accumulator, currentItem) => {
            let price = isNaN(parseFloat(currentItem["price"])) ? 0 : parseFloat(currentItem["price"])
            let qty = isNaN(parseFloat(currentItem["qty"])) ? 0 : parseFloat(currentItem["qty"])
            let discountType = currentItem["discountType"];
            let discountValue = isNaN(parseFloat(currentItem["discountValue"])) ? 0 : parseFloat(currentItem["discountValue"]);
            let taxPercent = isNaN(parseFloat(currentItem["taxPercent"])) ? 0 : parseFloat(currentItem["taxPercent"])
            return accumulator + eval(formula)
        }, 0)
        return total
    }

    if (!formulas || isFetching || isLoading) {
        return { isLoading: isTemplateTermFetching || isTemplateTermLoading || isLoading || isFetching }
    }
    return (
        <div className={`bg-gray-200 z-50 overflow-auto `}>
            <div className=" flex text-sm justify-around text-center border-t border-r border-l border-gray-500 bo font-bold p-1">
                <span>
                    Tax Details
                </span>
            </div>
            <table className="border border-gray-500 w-full text-xs text-start">
                <thead className="border border-gray-500">
                    <tr>
                        <th className="w-52 border border-gray-500">Tax Name</th>
                        <th className="w-28 border border-gray-500">Value</th>
                        <th className="w-28 border border-gray-500">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-500">Discount Type</td>
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <select autoFocus disabled={readOnly} className='text-left w-full rounded h-8'
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
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
                        <td className="border border-gray-500" colSpan={2}
                        >
                            <input type="text" disabled={readOnly} className='h-7 w-full text-right' value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
                        </td>
                    </tr>
                    <tr className='h-7'>
                        <td className="border border-gray-500">Tax</td>
                        <td className="border border-gray-500" colSpan={2}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setCurrentSelectedIndex("");
                                }
                            }
                            }
                        >
                            <input type="text" disabled={readOnly} className='h-7 w-full text-right'
                                value={taxPercent} onChange={(e) => { handleInputChange(e.target.value, index, "taxPercent") }} />
                        </td>
                    </tr>
                    {formulas.filter(item => !item.isPowise).map((f, i) =>
                        <tr key={i}>
                            <td className="border border-gray-500 font-semibold">{f.displayName}</td>
                            <td className="border border-gray-500 font-semibold text-right">
                                {getTotalQuantity(f.name, "value")}
                            </td>
                            <td className="border border-gray-500 font-semibold text-right">
                                {
                                    getTotalQuantity(f.name, "amount")
                                }
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default useTaxDetailsHook; 
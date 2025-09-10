import React, { useEffect } from 'react';
import { useGetTaxTermMasterQuery } from '../../../redux/services/TaxTermMasterServices';
import { toast } from 'react-toastify';
import { Loader } from '../../../Basic/components';
import { DELETE, PLUS } from '../../../icons';

const TaxTemplateGrid = ({ taxTemplateItems, setTaxTemplateItems, readOnly, params }) => {
    function handleOnClick(index, value) {
        console.log(taxTemplateItems, "taxTemplat")
        if (readOnly) return
        let newList = structuredClone(taxTemplateItems);
        newList[index]["additionalTax"] = value
        setTaxTemplateItems(newList);
    }

    const handleInputChange = (event, index, field) => {
        const value = event.target.value;
        const newBlend = structuredClone(taxTemplateItems);
        newBlend[index][field] = value;
        setTaxTemplateItems(newBlend);
    };

    const addRow = () => {
        if (taxTemplateItems.length >= TaxTermList.data.length) {
            toast.info("No More Tax Values", { position: 'top-center' })
            return
        }
        const newRow = { taxTermId: "", displayName: "", value: "", amount: "" };
        setTaxTemplateItems([...taxTemplateItems, newRow]);
    };
    const handleDeleteRow = id => {
        setTaxTemplateItems(tax => tax.filter((row, index) => index !== parseInt(id)));
    };

    const { data: TaxTermList, isLoading, isFetching } =
        useGetTaxTermMasterQuery({ params: { ...params, active: true } });

    function findIdInTaxTerms(id) {
        return taxTemplateItems ? taxTemplateItems.find(taxItems => parseInt(taxItems.taxTermId) === parseInt(id)) : false
    }

    useEffect(() => {
        if (readOnly) return
        else {
            if (taxTemplateItems.length === 0) {
                setTaxTemplateItems([
                    { taxTermId: "", displayName: "", value: "", amount: "" },
                    { taxTermId: "", displayName: "", value: "", amount: "" },
                    { taxTermId: "", displayName: "", value: "", amount: "" },
                    { taxTermId: "", displayName: "", value: "", amount: "" },
                ]);
            }
        }
    }, [taxTemplateItems])
    if (!TaxTermList || isLoading || isFetching) return <Loader />

    return (
        <>
            {
                taxTemplateItems.length !== 0 ?
                    <>
                        <div className={`w-full overflow-y-auto py-3 `}>
                            <table className=" border border-gray-600 text-xs table-auto w-full">
                                <thead className='bg-gray-100 top-0'>
                                    <tr>
                                        <th className="table-data border border-gray-600 w-28">Tax Name</th>
                                        <th className="table-data border border-gray-600 w-32">Display Name</th>
                                        <th className="table-data border border-gray-600 ">Value</th>
                                        <th className="table-data border border-gray-600">Amount</th>
                                        <th className={` ${readOnly ? "hidden" : "w-5"}`}>
                                            {readOnly ?
                                                "" :
                                                <div onClick={addRow}
                                                    className='hover:cursor-pointer  py-2 flex items-center justify-center bg-green-600 text-white rounded'>
                                                    {PLUS}
                                                </div>
                                            }
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='overflow-y-auto border border-gray-600 h-full w-full'>
                                    {taxTemplateItems.map((row, index) => (
                                        <tr key={index} className="w-full">
                                            <td className='flex justify-center items-center'>
                                                <select disabled={readOnly}
                                                    className='text-left w-full rounded border border-gray-600 h-8 py-2 focus:outline-none'
                                                    value={row.taxTermId} onChange={(e) => handleInputChange(e, index, "taxTermId")}>
                                                    <option hidden>
                                                        Select
                                                    </option>
                                                    {TaxTermList.data.map((taxItems) =>
                                                        <option value={taxItems.id} key={taxItems.id} hidden={findIdInTaxTerms(taxItems.id)}>
                                                            {taxItems.name}
                                                        </option>
                                                    )}
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="border border-gray-600 text-center rounded h-8 py-2 w-full"
                                                    value={(row.displayName)}
                                                    disabled={readOnly}
                                                    onChange={(event) =>
                                                        handleInputChange(event, index, "displayName")
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="border border-gray-600 text-center rounded h-8 py-2 w-full"
                                                    value={(row.value)}
                                                    disabled={readOnly}
                                                    onChange={(event) =>
                                                        handleInputChange(event, index, "value")
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="border border-gray-600 text-center rounded h-8 py-2 w-full"
                                                    value={(row.amount)}
                                                    disabled={readOnly}
                                                    onChange={(event) =>
                                                        handleInputChange(event, index, "amount")
                                                    }
                                                />
                                            </td>
                                            <td className={`border border-gray-600 hover:cursor-pointer ${readOnly ? "hidden" : ""} `}>
                                                {readOnly
                                                    ?
                                                    ""
                                                    :
                                                    <div tabIndex={-1} onClick={() => handleDeleteRow(index)} className='flex justify-center px-2 py-2 items-center rounded bg-gray-300'>
                                                        {DELETE}
                                                    </div>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                    :
                    <div></div>
            }
        </>
    )
}

export default TaxTemplateGrid
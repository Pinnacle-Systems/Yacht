import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { findFromList, isBetweenRange, substract } from '../../../Utils/helper';
import { DELETE, PLUS } from '../../../icons';
import { toast } from 'react-toastify';
import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService';


const Fabric = ({ rawMaterials, setRawMaterials, readOnly, getIssuedProperty, setFillGrid, removeItem }) => {
    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };

    const handleInputChange = (value, index, field) => {
        const newBlend = structuredClone(rawMaterials);
        newBlend[index][field] = value;
        setRawMaterials(newBlend);
    };

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )

    const { data: fabricList } =
        useGetFabricMasterQuery({ params: { companyId } });

    const { data: colorList } =
        useGetColorMasterQuery({ params: { companyId } });

    const { data: designList } =
        useGetdesignQuery({ params: { companyId } });

    const { data: gaugeList } =
        useGetGaugeQuery({ params: { companyId } });

    const { data: loopLengthList } =
        useGetLoopLengthQuery({ params: { companyId } });

    const { data: gsmList } =
        useGetgsmQuery({ params: { companyId } });

    const { data: diaList } =
        useGetDiaQuery({ params: { companyId } });

    const { data: uomList } =
        useGetUomQuery({ params: { companyId } });
    const { data: processList, isLoading: isProcessLoading, isFetching: isProcessFetching } = useGetProcessMasterQuery({ params });

    function getTotals(field) {
        const total = rawMaterials.reduce((accumulator, current) => {
            return accumulator + parseFloat(current[field] ? current[field] : 0)
        }, 0)
        return parseFloat(total)
    }

    if (!fabricList || !colorList || !uomList || !gaugeList || !designList || !gsmList || !loopLengthList || !diaList
        || isProcessFetching || isProcessLoading) return <Loader />
    return (
        <>
            <div className={`relative w-full overflow-y-auto py-1`}>
                <table className="border border-gray-500 text-xs table-auto w-full">
                    <thead className='bg-blue-200 top-0'>
                        <tr className='h-8'>
                            <th className=' table-data '>
                                S.no
                            </th>
                            <th className='table-data'>
                                Fabric Name
                            </th>
                            <th className=' table-data'>
                                Color
                            </th>
                            <th className='table-data'>
                                Design
                            </th>
                            <th className='table-data'>
                                Gauge
                            </th>
                            <th className='table-data'>
                                LL
                            </th>
                            <th className='table-data'>
                                Gsm
                            </th>
                            <th className='table-data'>
                                K-Dia
                            </th>
                            <th className='table-data'>
                                F-Dia
                            </th>
                            <th className='table-data'>
                                Uom
                            </th>
                            <th className='table-data  w-16'>
                                Lot No.
                            </th>
                            <th className='table-data '>
                                Prev. Process
                            </th>
                            <th className='table-data'>
                                Stock Rolls
                            </th>
                            <th className='table-data'>
                                Stock qty
                            </th>
                            <th className="table-data ">
                                No. of Rolls.
                            </th>
                            <th className="table-data">
                                Issue qty
                            </th>
                            {!readOnly &&
                                <th className='table-data'>
                                    <div onClick={() => setFillGrid(true)}
                                        className='hover:cursor-pointer py-2 flex items-center justify-center bg-green-600 text-white'>
                                        {PLUS}
                                    </div>
                                </th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto border border-gray-600 h-full w-full'>
                        {rawMaterials.map((item, index) => (
                            <tr key={index} className="w-full table-row">
                                <td className='text-left px-1 table-data shadow-xl '>
                                    {index + 1}
                                </td>
                                <td className='text-left px-1 table-data shadow-xl'>
                                    {findFromList(item.fabricId, fabricList.data, "aliasName")}
                                </td>
                                <td className='text-left  table-data shadow-xl'>
                                    {findFromList(item.colorId, colorList.data, "name")}
                                </td>
                                <td className='text-left px-1 table-data shadow-xl'>
                                    {findFromList(item.designId, designList.data, "name")}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {findFromList(item.gaugeId, gaugeList.data, "name")}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {findFromList(item.loopLengthId, loopLengthList.data, "name")}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {findFromList(item.gsmId, gsmList.data, "name")}
                                </td>
                                <td className='text-right px-1  table-data shadow-xl'>
                                    {findFromList(item.kDiaId, diaList.data, "name")}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {findFromList(item.fDiaId, diaList.data, "name")}
                                </td>
                                <td className='text-right px-1 table-data shadow-xl'>
                                    {findFromList(item.uomId, uomList.data, "name")}
                                </td>
                                <td className='table-data'>
                                    {item.lotNo}
                                </td>
                                <td className=' px-1 table-data shadow-xl '>
                                    {findFromList(item.processId, processList.data, "name")}
                                </td>
                                <td className='shadow-xl text-right table-data '>
                                    {item.stockRolls}
                                </td>
                                <td className='shadow-xl text-right table-data '>
                                    {parseFloat(item.stockQty).toFixed(3)}
                                </td>
                                <td className='table-data'>
                                    <input
                                        min={"0"}
                                        type="number"
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0", index, "noOfRolls") } }}
                                        className="text-right rounded py-1 px-1 w-full table-data-input"
                                        value={(!item.noOfRolls) ? 0 : item.noOfRolls}
                                        disabled={readOnly}
                                        onChange={(e) => {
                                            if (parseInt(e.target.value) > parseInt(item.stockRolls)) {
                                                toast.info("Issue Rolls Cannot be more than Stock Rolls", { position: 'top-center' })
                                                return
                                            }
                                            handleInputChange(e.target.value, index, "noOfRolls")
                                        }
                                        }
                                    />
                                </td>
                                <td className='table-data'>
                                    <input
                                        min={"0"}
                                        type="number"
                                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000", index, "qty") } }}
                                        onFocus={(e) => e.target.select()}
                                        className="text-right rounded py-1 px-1 w-full table-data-input"
                                        value={(!item.qty) ? 0 : item.qty}
                                        disabled={readOnly}
                                        onChange={(e) => {
                                            if (isBetweenRange(0, substract(item._sum.qty, substract(getIssuedProperty(item), item?.qty ? item?.qty : 0)), e.target.value)) {
                                                handleInputChange(e.target.value, index, "qty")
                                            } else {
                                                toast.info("Issue Qty Cannot be more than Stock Qty", { position: 'top-center' })
                                            }
                                        }
                                        }
                                        onBlur={(e) =>
                                            handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty")
                                        }
                                    />
                                </td>
                                {!readOnly &&
                                    <td className='table-data w-12'>
                                        <div tabIndex={-1} onClick={() => removeItem(item)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                                            {DELETE}
                                        </div>
                                    </td>
                                }
                            </tr>
                        ))}
                        {Array.from({ length: 2 - rawMaterials.length }).map(i =>
                            <tr className='w-full font-bold h-6 border-gray-400 border'>
                                <td className='table-data'>
                                </td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                <td className="table-data    "></td>
                                <td className="table-data    "></td>
                                <td className="table-data    "></td>
                                <td className="table-data    "></td>
                                <td className="table-data    "></td>
                                <td className="table-data    "></td>
                                <td className="table-data    "></td>
                                <td className="table-data   "></td>
                                <td className="table-data   "></td>
                                {!readOnly &&
                                    <td className="table-data   "></td>
                                }
                            </tr>)
                        }
                        <tr className='bg-blue-200 w-full font-bold'>
                            <td className="table-data  font-bold text-center" colSpan={14}>Total</td>
                            <td className="table-data    text-right">{getTotals("noOfRolls")}</td>
                            <td className="table-data    text-right">{getTotals("qty").toFixed(3)}</td>
                            {!readOnly &&
                                <td className="table-data   "></td>
                            }
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Fabric
import React from 'react'
import { substract } from '../../../Utils/helper'

const FabricRawMaterialItem = ({ item }) => {
    return (
        <table className='table-auto w-full text-xs border border-gray-500'>
            <thead>
                <tr className='bg-blue-200 border border-gray-500 sticky top-10 '>
                    <th className="table-data w-28">S.no</th>
                    <th className="table-data w-28">Fabric</th>
                    <th className='w-10 table-data'>
                        Color
                    </th>
                    <th className='w-16 table-data'>
                        Design
                    </th>
                    <th className='w-12 table-data'>
                        Gauge
                    </th>
                    <th className='w-12 table-data'>
                        LL
                    </th>
                    <th className='w-12 table-data'>
                        Gsm
                    </th>
                    <th className='w-12 table-data'>
                        K-Dia
                    </th>
                    <th className='w-12 table-data'>
                        F-Dia
                    </th>
                    <th className='w-12 table-data'>
                        Uom
                    </th>
                    <th className="table-data  w-14">Qty</th>
                    <th className="table-data  w-14">Already Used</th>
                    <th className="table-data  w-14">Bal. Qty</th>
                </tr>
            </thead>
            <tbody>
                {(item?.rawMaterials ? item?.rawMaterials : []).map(
                    (item, index) =>
                        <tr key={item.id} className={`table-row `}>
                            <td className='text-center   table-data'>{index + 1}</td>
                            <td className='text-left px-1 table-data'>{item.Fabric.aliasName}</td>
                            <td className='text-left px-1 table-data'>{item.Color.name}</td>
                            <td className='text-left px-1  table-data'>{item.Design.name}</td>
                            <td className='text-right px-1  table-data'>{item.Gauge.name}</td>
                            <td className='text-right px-1  table-data'>{item.LoopLength.name}</td>
                            <td className='text-left px-1  table-data'>{item.Gsm.name}</td>
                            <td className='text-right px-1  table-data'>{item.KDia.name}</td>
                            <td className='text-right px-1  table-data'>{item.FDia.name}</td>
                            <td className='text-left px-1  table-data'>{item.Uom.name}</td>
                            <td className='text-left   table-data'>{parseFloat(item?.qty ? item?.qty : 0).toFixed(3)}</td>
                            <td className='text-left   table-data'>{parseFloat(item?.alreadyUsedQty ? item?.alreadyUsedQty : 0).toFixed(3)}</td>
                            <td className='text-left   table-data'>{parseFloat(substract(item?.qty ? item?.qty : 0, item?.alreadyUsedQty ? item?.alreadyUsedQty : 0)).toFixed(3)}</td>
                        </tr>
                )}
            </tbody>
        </table>
    )
}

export default FabricRawMaterialItem

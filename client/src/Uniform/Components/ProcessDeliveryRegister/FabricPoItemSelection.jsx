import React from 'react'
import FabricPoItem from './FabricProgramItem';
import { useGetProcessDeliveryByIdQuery } from '../../../redux/ErpServices/ProcessDeliveryServices';

const FabricPoItemSelection = ({ id, rawMaterialType, dataObj }) => {
    const {
        data: singleData,
    } = useGetProcessDeliveryByIdQuery({ id }, { skip: !id });
    let processDeliveryProgramDetails = singleData?.data?.ProcessDeliveryProgramDetails ? singleData?.data?.ProcessDeliveryProgramDetails : []

    return (
        <div className='border bg-gray-200'>
            <table className='table-auto w-full text-xs border border-gray-500 '>
                <thead className=' border-b border-gray-500'>
                    <tr className='bg-blue-200 border border-gray-500 sticky top-10 '>
                        <th className="table-data  w-2 text-center">S.no</th>
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
                        <th className="table-data w-10">Prog. Qty</th>
                        <th className="table-data  w-10"> In Qty</th>
                        <th className="table-data  w-10">Bal. Qty</th>
                        <th className="table-data  w-10">Bill Qty</th>
                        <th className="table-data  w-10">Bal Bill Qty</th>
                        <th className="table-data  w-10">Raw Materials</th>
                    </tr>
                </thead>
                <tbody>
                    {processDeliveryProgramDetails.map((item, index) =>
                        <FabricPoItem dataObj={dataObj} delivery={singleData?.data} key={item.id} id={item.id} index={index} item={item} rawMaterialType={rawMaterialType} />
                    )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default FabricPoItemSelection
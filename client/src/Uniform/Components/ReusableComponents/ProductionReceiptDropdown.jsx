import React from 'react'
import { DropdownInput } from '../../../Inputs';
import { dropDownListObject } from '../../../Utils/contructObject';
import { getCommonParams } from '../../../Utils/helper';
import { useGetProductionReceiptQuery } from '../../../redux/uniformService/ProductionReceiptServices';
import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService';


const ProductionReceiptDropdown = ({ readOnly, name, selected, setSelected, clear, partyId, orderId }) => {
    const { token, ...params } = getCommonParams();
    const { data: productionList } = useGetProductionReceiptQuery({ params: { ...params, partyId } });

    const { data: processData } = useGetProcessMasterQuery({ params });

    function isPacking(processId) {
        return processData?.data?.find(j => parseInt(j.id) == (processId))?.isPacking
    }

    return (
        <DropdownInput readOnly={readOnly} name={name} value={selected} setValue={setSelected} clear={clear}
            options={dropDownListObject(productionList?.data ? productionList.data?.filter(v => (v.orderId == orderId && isPacking(v.prevProcessId))) : [], "docId", "id")} />
    )
}

export default ProductionReceiptDropdown

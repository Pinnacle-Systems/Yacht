import React from 'react'
import { DropdownInput } from '../../../Inputs';
import { dropDownListObject } from '../../../Utils/contructObject';
import { getCommonParams } from '../../../Utils/helper';
import { useGetOrderQuery } from '../../../redux/uniformService/OrderService';

const OrderDropdown = ({ readOnly, name, selected, setSelected, clear, partyId }) => {
    const { token, ...params } = getCommonParams();
    const { data: orderList } = useGetOrderQuery({ params: { ...params, partyId } });
    return (
        <DropdownInput readOnly={readOnly} name={name} value={selected} setValue={setSelected} clear={clear}
            options={dropDownListObject(orderList?.data ? orderList.data : [], "docId", "id")} />
    )
}

export default OrderDropdown

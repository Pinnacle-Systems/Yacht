import React, { useEffect, useState } from 'react'
import { useGetOrderByIdQuery, useGetOrderQuery, useLazyGetOrderQuery } from '../../../redux/uniformService/OrderService'
import { MultiSelectDropdown } from '../../../Inputs';
import { multiSelectOption } from '../../../Utils/contructObject';
import { useGetOrderImportQuery } from '../../../redux/services/OrderImportService';
import { classListData, findFromListFromMatchField, findFromListFromSizeList, getCommonParams } from '../../../Utils/helper';
import { DeleteButton, GenerateButton } from '../../../Buttons';
import { toast } from 'react-toastify';
import { useGetItemTypeMasterQuery } from '../../../redux/uniformService/ItemTypeMasterService';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import secureLocalStorage from 'react-secure-storage';

const OrderConsolidation = ({ selectedColorList, setSelectedColorList,
    selectedSizeList, setSelectedSizeList,
    selectedClassList, setSelectedClassList,
    selectedStyleList, setSelectedStyleList,
    selectedStyleTypeList, setSelectedStyleTypeList, orderId, setCuttingOrderDetails, cuttingOrderDetails, id }) => {

    const { branchId } = getCommonParams()
    const [selectedProjectImportList, setSelectedProjectImportList] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [itemColorList, setItemColorList] = useState([]);
    const [itemClassList, setItemClassList] = useState([]);
    const [itemTypeList, setItemTypeList] = useState([]);

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const params = {
        companyId
    };

    const { data: orderImportResponse } = useGetOrderImportQuery({ params: { orderId, branchId } });
    let orderImportList = orderImportResponse?.data || [];
    const {
        data: singleOrderData,
        isFetching: isOrderFetching,
        isLoading: isOrderLoading,
    } = useGetOrderByIdQuery(orderId, { skip: !orderId });

    useEffect(() => {
        if (id) return
        let itemTypeList = singleOrderData?.data?.orderDetails?.map(val => {
            return {
                name: val?.ItemType?.name,
                id: val?.itemTypeId,
            }
        }) || [];

        const uniqueArray = itemTypeList?.filter((item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)

        );

        setItemTypeList(uniqueArray)
    }, [singleOrderData, isOrderFetching, isOrderLoading])



    let styleList = [];


    useEffect(() => {
        if (id) return
        if (!selectedStyleTypeList) return

        let newArrayList = [];
        selectedStyleTypeList?.forEach((val, valIndex) => {
            let newObject = singleOrderData?.data?.orderDetails?.filter(j => parseInt(j.itemTypeId) === parseInt(val.value))
            newObject = newObject?.flatMap(j => j.orderDetailsSubGrid)
            newArrayList = [...newArrayList, ...newObject]
        })

        let femaleItemList = newArrayList?.map(val => {
            return {
                name: val?.isFemaleStyle?.name,
                id: val?.isFemaleItemId,
            }
        }) || [];

        let maleItemList = newArrayList?.map(val => {
            return {
                name: val?.isMaleStyle?.name,
                id: val?.isMaleItemId,
            }
        }) || [];


        styleList = [...femaleItemList, ...maleItemList]

        styleList = styleList.filter((obj, index, self) =>
            index === self.findIndex((item) => parseInt(item.id) === parseInt(obj.id))
        );

        setItemList(styleList)
        setSelectedStyleList([])
        setSelectedColorList([]);
        setItemColorList([]);
        setSelectedClassList([]);
        setItemClassList([]);
        setSelectedSizeList(([]))

    }, [selectedStyleTypeList])




    useEffect(() => {
        if (id) return
        if (!selectedStyleList) return

        let newArrayList = [];
        let maleColorList = [];
        let feMaleColorList = [];
        let houseMaleColorLists = [];
        let houseFemaleColorLists = [];

        let orderDetailsSubGrid = singleOrderData?.data?.orderDetails?.flatMap(j => j.orderDetailsSubGrid)
        selectedStyleList?.forEach((val, valIndex) => {

            houseFemaleColorLists = orderDetailsSubGrid?.filter(j => parseInt(j.isFemaleItemId) === parseInt(val.value))

            for (let i = 0; i < houseFemaleColorLists?.length; i++) {
                let colorList = houseFemaleColorLists[i]
                if (colorList?.uniformType == "HOUSE") {
                    feMaleColorList = [...feMaleColorList, ...colorList?.femaleColorsIds]

                }
                else {
                    feMaleColorList = [...feMaleColorList]
                    let femaleColorObject = {
                        femaleColorId: colorList?.isFemaleColorId,
                        name: colorList?.isFemaleColor?.name
                    }
                    feMaleColorList.push(femaleColorObject)


                }
            }

            houseMaleColorLists = orderDetailsSubGrid?.filter(j => parseInt(j.isMaleItemId) === parseInt(val.value))

            for (let i = 0; i < houseMaleColorLists?.length; i++) {
                let colorList = houseMaleColorLists[i]
                if (colorList?.uniformType == "HOUSE") {
                    maleColorList = [...maleColorList, ...colorList?.maleColorIds]
                }
                else {
                    maleColorList = [...maleColorList]
                    let maleColorObject = {
                        maleColorId: colorList?.isMaleColorId,
                        name: colorList?.isMaleColor?.name
                    }
                    maleColorList.push(maleColorObject)
                }
            }

            maleColorList = maleColorList?.map(val => {
                return {
                    id: val?.maleColorId ? val?.maleColorId : val?.id,
                    name: val?.name ? val?.name : val?.Color?.name
                }
            })


            feMaleColorList = feMaleColorList?.map(val => {
                return {
                    id: val?.femaleColorId ? val?.femaleColorId : val?.id,
                    name: val?.name ? val?.name : val?.Color?.name
                }
            })

            newArrayList = [...newArrayList, ...maleColorList, ...feMaleColorList]
        })


        newArrayList = newArrayList.filter((obj, index, self) =>
            index === self.findIndex((item) => parseInt(item.id) === parseInt(obj.id))
        );

        setItemColorList(newArrayList)
        setSelectedColorList([]);

    }, [selectedStyleList])


    useEffect(() => {
        if (id) return
        if (!selectedStyleList) return
        let newArrayList = [];
        let bothGenderClassList = [];
        selectedStyleList?.forEach((val, valIndex) => {
            let orderDetailsSubGrid = singleOrderData?.data?.orderDetails?.flatMap(j => j.orderDetailsSubGrid)
            bothGenderClassList = orderDetailsSubGrid?.filter(j => parseInt(j.isFemaleItemId) === parseInt(val.value) || parseInt(j.isMaleItemId) === parseInt(val.value))
            bothGenderClassList = bothGenderClassList?.map(val => {
                return {
                    classIds: val?.classIds
                }
            })

            newArrayList = [...newArrayList, ...bothGenderClassList,]

        })


        newArrayList = newArrayList?.flatMap(val => val.classIds)?.map(value => {
            return {
                id: value?.classId,
                name: value?.Class?.name
            }
        })

        newArrayList = newArrayList.filter((obj, index, self) =>
            index === self.findIndex((item) => parseInt(item.id) === parseInt(obj.id))
        );
        classListData(newArrayList)
        setItemClassList(newArrayList)
        setSelectedClassList([])
    }, [selectedStyleList, selectedStyleTypeList, setSelectedStyleList])

    const { data: orderParamsResponse } = useGetOrderQuery({ params: { branchId, isCuttingOrderParams: true, filterOrderImportIdList: JSON.stringify(orderImportList.map(i => i.id)) } }, { skip: orderImportList === 0 });
    console.log(orderParamsResponse, "orderParamsResponse")
    const sizeList = orderParamsResponse?.data?.sizeIdList || [];

    const [fetchCuttingOrderList, { data: cuttingOrderListResponse }] = useLazyGetOrderQuery();



    function generateCuttingOrderList() {
        if (selectedStyleList.length === 0) return toast.error("Atleast One Style Should be Selected...!!!")
        if (selectedStyleTypeList.length === 0) return toast.error("Atleast One Style Type Should be Selected...!!!")
        if (selectedColorList.length === 0) return toast.error("Atleast One Color Should be Selected...!!!")
        if (selectedSizeList.length === 0) return toast.error("Atleast One Size Should be Selected...!!!")
        if (selectedClassList.length === 0) return toast.error("Atleast One Class Should be Selected...!!!");

        setCuttingOrderDetails(cuttingOrderListResponse?.groupDataByItem || []);

        fetchCuttingOrderList({
            params: {
                branchId,
                isCuttingOrderPackingList: true, orderId, filterOrderImportIdList: JSON.stringify(selectedProjectImportList.map(i => i.value)), filterColorIdList: JSON.stringify(selectedColorList.map(i => i.value)), filterClassOnlyIdList: JSON.stringify(selectedClassList.map(i => i.value)), filterSizeIdList: JSON.stringify(selectedSizeList.map(i => i.value)),
                filterStyleTypeIdList: JSON.stringify(selectedStyleTypeList.map(i => i.value)), filterStyleIdList: JSON.stringify(selectedStyleList.map(i => i.value))
            }
        })


    }



    useEffect(() => {
        if (id) return
        const generatedCuttingOrderList = cuttingOrderListResponse?.groupDataByItem || [];
        setCuttingOrderDetails(generatedCuttingOrderList)

    }, [cuttingOrderListResponse, setCuttingOrderDetails])

    function handleInputChangeSubGridValue(index, fieldItem, valIndex, fieldColor, dIndex, fieldSize, sizeId, cuttingValue, field) {
        setCuttingOrderDetails(prev => {
            let newList = structuredClone(prev)
            let sizeIndex = newList[index][fieldItem][valIndex][fieldColor][dIndex][fieldSize]?.findIndex(val => parseInt(val.sizeId) === parseInt(sizeId))
            newList[index][fieldItem][valIndex][fieldColor][dIndex][fieldSize][sizeIndex][field] = cuttingValue
            return newList;
        })




        // setCuttingOrderDetails(prev => {
        //     const colorIndex = prev.findIndex(i => parseInt(colorId) === parseInt(i.colorId));
        //     if (colorIndex === -1) return prev;
        //     const sizeIndex = prev[colorIndex]['sizeWiseDetails'].findIndex(i => parseInt(sizeId) === parseInt(i.sizeId));
        //     if (sizeIndex === -1) return prev;
        //     let newList = structuredClone(prev);
        //     newList[colorIndex]['sizeWiseDetails'][sizeIndex][field] = cuttingQty;
        //     return newList;
        // })
    }


    // function findExtraQty(cuttingQty, noOfSet) {
    //     let result = (parseInt(cuttingQty) * parseInt(noOfSet))
    //     if (result >= 1 && result < 10) {
    //         return 2
    //     }

    //     else if (result >= 10 && result < 50) {
    //         return 3
    //     }
    //     else if (result >= 50 && result < 75) {
    //         return 4
    //     }
    //     else if (result >= 75 && result <= 100) {
    //         return 5
    //     }
    //     else if (result > 100) {
    //         return 6
    //     }

    // }

    //    function getDataAsending (data) {

    //     const order = { "PLAYSCHOOL": 0, "PRE-KG": 1, "LKG": 2, "UKG": 3 };

    //         const sortedClasses = [...data].sort((a, b) => {
    //             const getOrder = (name) => {
    //                 for (let key in order) {
    //                     if (name.startsWith(key)) {
    //                         return order[key];
    //                     }
    //                 }
    //                 return Infinity;
    //             };
    //             return getOrder(a.label) - getOrder(b.label);
    //         });

    // console.log(sortedClasses);
    //  }
    // console.log(selectedClassList,"selectedStyleList")

    useEffect(() => {
        if (!id) return
        setItemList(selectedStyleList)
        setItemColorList(selectedColorList)
        setItemClassList(selectedClassList)
        setItemTypeList(selectedStyleTypeList)
    }, [id,])


    return (
        <>{console.log(cuttingOrderDetails, "cuttingOrderDetails")}
            <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600'>
                <legend className='sub-heading'> &nbsp;Cutting Order List Parameters&nbsp;</legend>
                <div className="grid grid-cols-5 w-full">
                    <MultiSelectDropdown name={"Item Type"} selected={selectedStyleTypeList} setSelected={setSelectedStyleTypeList} options={id ? multiSelectOption(itemTypeList, 'label', 'value') : multiSelectOption(itemTypeList, 'name', 'id')} readOnly={cuttingOrderDetails.length > 0} />

                    <MultiSelectDropdown name={"Item"} selected={selectedStyleList} setSelected={setSelectedStyleList} options={id ? multiSelectOption(itemList, 'label', 'value') : multiSelectOption(itemList, 'name', 'id')} readOnly={cuttingOrderDetails.length > 0} />
                    <MultiSelectDropdown name={"Color"} selected={selectedColorList} setSelected={setSelectedColorList} options={id ? multiSelectOption(itemColorList, 'label', 'value') : multiSelectOption(itemColorList, 'name', 'id')} readOnly={cuttingOrderDetails.length > 0} />
                    {/* <MultiSelectDropdown name={"Color"} selected={selectedColorList} setSelected={setSelectedColorList} options={colorList ? multiSelectOption(colorList, 'color', 'colorId') : multiSelectOption(itemColorList, 'name', 'id')} readOnly={cuttingOrderDetails.length > 0} /> */}
                    <MultiSelectDropdown name={"Size"} selected={selectedSizeList} setSelected={setSelectedSizeList} options={multiSelectOption(sizeList, 'size', 'sizeId')} readOnly={cuttingOrderDetails.length > 0} />
                    {/* <MultiSelectDropdown name={"Class"} selected={selectedClassList} setSelected={setSelectedClassList} options={multiSelectOption(classList, 'classOnlyId', 'classOnlyId')} readOnly={cuttingOrderDetails.length > 0} /> */}
                    <MultiSelectDropdown name={"Class"} selected={selectedClassList} setSelected={setSelectedClassList} options={id ? multiSelectOption(itemClassList, 'label', 'value') : multiSelectOption(itemClassList, 'name', 'id')} readOnly={cuttingOrderDetails.length > 0} />
                    <div className='flex gap-x-5 items-center justify-center'>
                        <GenerateButton label="Generate Cutting Order List" onClick={() => {
                            if (cuttingOrderDetails.length > 0) {
                                return toast.error("Delete CuttingOrder List to Generate New...!!!")
                            }
                            generateCuttingOrderList()
                        }} />
                        <DeleteButton label="Delete Cutting Order List" className={"text-white bg-red-500"} onClick={() => { setCuttingOrderDetails([]); setSelectedClassList([]); setSelectedColorList([]); setSelectedSizeList([]); setSelectedStyleList([]); setSelectedStyleTypeList([]) }} />
                    </div>
                </div>
            </fieldset>
            {(cuttingOrderDetails.length > 0) &&
                <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 '>
                    <legend className='sub-heading'> &nbsp;Generated Cutting Order List&nbsp;</legend>
                    <div className='w-full overflow-x-auto'>

                        {(cuttingOrderDetails ? cuttingOrderDetails : []).map((item, index) =>
                            <>
                                <div className='w-full p-2 bg-sky-200 text-sm font-bold mt-2'>
                                    {item.itemTypeName || item?.ItemType?.name}
                                </div>
                                {
                                    item?.items?.map((val, valIndex) =>
                                        <>
                                            <div className='w-full p-2  text-sm font-bold mt-2  '>
                                                {val.itemName || val?.Item?.name}
                                            </div>
                                            <div className='w-full overflow-x-auto text-xs '>
                                                <table className="w-full">
                                                    <thead className="border-2 text-xs">
                                                        <tr className='h-2'>
                                                            <th
                                                                className="border-2  top-0 stick-bg w-6">
                                                                S.no.
                                                            </th>
                                                            <th
                                                                className="border-2  top-0 stick-bg w-40 ">
                                                                Color
                                                            </th>
                                                            {selectedSizeList?.map(size =>
                                                                <th key={size.value}
                                                                    className="border-2  top-0 stick-bg w-32">
                                                                    <div className='grid'>
                                                                        <span>
                                                                            {size.label}
                                                                        </span>
                                                                        <div className='grid grid-cols-2 text-xs'>
                                                                            <span className='border-r-2'> O </span>
                                                                            <span> C </span>
                                                                        </div>
                                                                    </div>
                                                                </th>
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="border-2">
                                                        {val?.colorList?.map((dataObj, dIndex) => (
                                                            <tr
                                                                key={dataObj.id}
                                                                className="border-2 stick-bg text-xs"
                                                            >
                                                                <td className='py-1'> {(dIndex + 1)}</td>
                                                                <td className='py-1'> {dataObj?.name}</td>
                                                                {dataObj?.sizeList?.map(size =>
                                                                    <td key={size.sizeId}
                                                                        className="border-2 w-32">
                                                                        <div className='grid '>
                                                                            <div className='grid grid-cols-2'>
                                                                                <span>

                                                                                    {parseInt(size?.orderQty || 0)}
                                                                                </span>
                                                                                <span>

                                                                                    <input type='number' onFocus={(e) => { e.target.select() }} className='w-full text-right'
                                                                                        value={parseInt(size?.cuttingQty || 0)}

                                                                                        onChange={(e) => {
                                                                                            handleInputChangeSubGridValue(index, "items", valIndex, "colorList", dIndex, "sizeList", size.sizeId, e.target.value, "cuttingQty")
                                                                                        }} />
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                        </>

                                    )
                                }

                            </>
                        )}
                    </div>

                </fieldset>
            }
        </>
    )
}

export default OrderConsolidation















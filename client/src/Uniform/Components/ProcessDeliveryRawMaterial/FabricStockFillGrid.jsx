import React, { useEffect, useState } from 'react'
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { useGetdesignQuery } from "../../../redux/uniformService/DesignMasterServices";
import { useGetGaugeQuery } from "../../../redux/services/GaugeMasterServices";
import { useGetLoopLengthQuery } from "../../../redux/uniformService/LoopLengthMasterServices";
import { useGetgsmQuery } from "../../../redux/uniformService/GsmMasterServices";
import { useGetDiaQuery } from "../../../redux/uniformService/DiaMasterServices";
import secureLocalStorage from 'react-secure-storage';
import { Loader } from '../../../Basic/components';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { findFromList, getItemFullNameFromShortCode, pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber, substract, sumArray } from '../../../Utils/helper';
import { useGetProcessMasterQuery } from '../../../redux/uniformService/ProcessMasterService';
import { useGetStockQuery } from '../../../redux/services/StockService';
import { showEntries } from '../../../Utils/DropdownData';
import ReactPaginate from 'react-paginate';


const FabricStockFillGrid = ({ setLocalRawMaterials, getIssuedProperty, rawMaterialType, styleColors, localRawMaterials, storeId }) => {
    const [searchPrevProcess, setSearchPrevProcess] = useState("");
    const [searchFabricAliasName, setSearchFabricAliasName] = useState("");
    const [searchColor, setSearchColor] = useState("");
    const [searchDesign, setSearchDesign] = useState("");
    const [searchGauge, setSearchGauge] = useState("");
    const [searchLoopLength, setSearchLoopLength] = useState("");
    const [searchGsm, setSearchGsm] = useState("");
    const [searchKDia, setSearchKDia] = useState("");
    const [searchFDia, setSearchFDia] = useState("");
    const [searchUom, setSearchUom] = useState("");
    const [searchLotNo, setSearchLotNo] = useState("");
    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    function addItem(item) {
        setLocalRawMaterials(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems.push(item);
            return newItems
        });
    }
    function removeItem(removeItem) {
        setLocalRawMaterials(localInwardItems => {
            return localInwardItems.filter(item =>
                !(removeItem.fabricId === item.fabricId
                    &&
                    removeItem.designId === item.designId
                    &&
                    removeItem.gaugeId === item.gaugeId
                    &&
                    removeItem.loopLengthId === item.loopLengthId
                    &&
                    removeItem.gsmId === item.gsmId
                    &&
                    removeItem.kDiaId === item.kDiaId
                    &&
                    removeItem.fDiaId === item.fDiaId
                    &&
                    removeItem.colorId === item.colorId
                    &&
                    removeItem.uomId === item.uomId
                    &&
                    removeItem.lotNo == item.lotNo
                    &&
                    removeItem.processId === item.processId
                    &&
                    removeItem.storeId === item.storeId
                )
            )
        });
    }

    function isItemChecked(checkItem) {
        let item = localRawMaterials.find(item =>
            checkItem.fabricId === item.fabricId
            &&
            checkItem.designId === item.designId
            &&
            checkItem.gaugeId === item.gaugeId
            &&
            checkItem.loopLengthId === item.loopLengthId
            &&
            checkItem.gsmId === item.gsmId
            &&
            checkItem.kDiaId === item.kDiaId
            &&
            checkItem.fDiaId === item.fDiaId
            &&
            checkItem.colorId === item.colorId
            &&
            checkItem.uomId === item.uomId
            &&
            checkItem.lotNo == item.lotNo
            &&
            checkItem.processId === item.processId
            &&
            checkItem.storeId === item.storeId
        )
        if (!item) return false
        return true
    }

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )
    const searchFields = { searchColor, searchUom, searchLotNo, searchPrevProcess, searchYarnAliasName: searchFabricAliasName }
    let params = { companyId }

    const { data: stockData, isLoading, isFetching
    } = useGetStockQuery({
        params: {
            branchId, itemType: getItemFullNameFromShortCode(rawMaterialType), isGetStock: true,
            filterColors: styleColors,
            ...searchFields,
            pagination: true,
            pageNumber: currentPageNumber,
            dataPerPage,
            storeId
        }
    });

    useEffect(() => {
        if (stockData?.totalCount) {
            setTotalCount(stockData?.totalCount)
        }
    }, [stockData, isLoading, isFetching])


    const { data: fabricList, isLoading: fabricListLoading, isFetching: fabricListFetching } = useGetFabricMasterQuery({ params })
    const { data: uomList, isLoading: uomLoading, isFetching: uomFetching } = useGetUomQuery({ params })
    const { data: colorList, isLoading: colorLoading, isFetching: colorFetching } = useGetColorMasterQuery({ params })
    const { data: designList, isLoading: designLoading, isFetching: designFetching } = useGetdesignQuery({ params })
    const { data: gaugeList, isLoading: gaugeLoading, isFetching: gaugeFetching } = useGetGaugeQuery({ params })
    const { data: loopList, isLoading: loopLoading, isFetching: loopFetching } = useGetLoopLengthQuery({ params })
    const { data: gsmList, isLoading: gsmLoading, isFetching: gsmFetching } = useGetgsmQuery({ params })
    const { data: diaList, isLoading: diaLoading, isFetching: diaFetching } = useGetDiaQuery({ params })
    const { data: processList, isLoading: isProcessLoading, isFetching: isProcessFetching } = useGetProcessMasterQuery({ params });

    if (fabricListLoading || fabricListFetching || uomFetching || uomLoading || colorFetching || colorLoading || designLoading || designFetching ||
        gaugeLoading || gaugeFetching || loopLoading || loopFetching || gsmLoading || gsmFetching || diaLoading || diaFetching
        || isProcessFetching || isProcessLoading) {
        return <tr>
            <td>
                <Loader />
            </td>
        </tr>
    }

    function handleCheckBoxChange(value, item) {
        if (value) {
            addItem(item)
        } else {
            removeItem(item)
        }
    }

    function handleSelectAllChange(value) {
        if (value) {
            (stockData?.data ? stockData.data : []).forEach(item => addItem(item))
        } else {
            (stockData?.data ? stockData.data : []).forEach(item => removeItem(item))
        }
    }

    function getSelectAll() {
        return (stockData?.data ? stockData.data : []).every(item => isItemChecked(item))
    }
    let count = 1;

    return (
        <div className='table-data bg-gray-200'>
            <div className="md:flex md:items-center md:justify-between page-heading p-1">
                <div className="heading text-center md:mx-10 text-xs"> Store Items</div>
                <div className=" sub-heading justify-center md:justify-start items-center">
                    <label className="text-white text-xs rounded-md m-1  border-none">Show Entries</label>
                    <select value={dataPerPage}
                        onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded mr-9'>
                        {showEntries.map((option) => <option value={option.value} >{option.show}</option>)}
                    </select>
                </div>
            </div>
            <table className='w-full text-xs'>
                <thead>
                    <tr className='bg-blue-200'>
                        <th className='w-8 p-5'>
                            Mark All
                            <input type="checkbox" className='w-full' onChange={(e) => handleSelectAllChange(e.target.checked)}
                                checked={getSelectAll()}
                            />
                        </th>
                        <th className=' w-8  table-data  '>
                            S.no
                        </th>
                        <th className='w-24 table-data  '>
                            Fabric
                        </th>
                        <th className='w-16 table-data  '>
                            Color
                        </th>
                        <th className='w-16  table-data '>
                            Design
                        </th>
                        <th className='w-12  table-data '>
                            Gauge
                        </th>
                        <th className='w-12 table-data  '>
                            LL
                        </th>
                        <th className='w-12  table-data '>
                            Gsm
                        </th>
                        <th className='w-12 table-data  '>
                            K-Dia
                        </th>
                        <th className='w-12  table-data '>
                            F-Dia
                        </th>
                        <th className='w-12 table-data  '>
                            Uom
                        </th>
                        <th className='table-data  w-16'>
                            Prev. Process
                        </th>
                        <th className='table-data  w-16'>
                            Stock Rolls
                        </th>
                        <th className='table-data  w-16'>
                            Stock qty
                        </th>

                    </tr>
                </thead>
                <tbody>
                    <tr className='sticky top-5 table-row'>
                        <td className='table-data  shadow-xl'>
                        </td>
                        <td className='table-data shadow-xl'>
                        </td>
                        <td className='   table-data  shadow-xl'>
                            <input className='w-full p-2' type="text" onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    setSearchFabricAliasName(e.target.value);
                                }} />
                        </td>
                        <td className=' table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    setSearchColor(e.target.value);
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    setSearchDesign(e.target.value);
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    setSearchGauge(e.target.value);
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    setSearchLoopLength(e.target.value);
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    setSearchGsm(e.target.value);
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    setSearchKDia(e.target.value);
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    setSearchFDia(e.target.value);
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                            <input className='w-full p-2' type="text"
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    setSearchColor(e.target.value)
                                }}
                            />
                        </td>
                        <td className='  table-data  shadow-xl'>
                        </td>

                    </tr>
                    {(stockData?.data ? stockData.data : []).map((item, index) =>
                        <tr key={index} className='py-2 table-row'
                            onClick={() => {
                                handleCheckBoxChange(!isItemChecked(item), {
                                    ...item,
                                    stockQty: item._sum.qty, stockRolls: item._sum.noOfRolls,
                                    stockPrice: item.price
                                })
                            }}
                        >
                            <td className=' p-1  table-data  shadow-xl'>
                                <input type="checkbox" className='w-full table-data-input'
                                    checked={isItemChecked(item)} />
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {count++}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.fabricId, fabricList.data, "aliasName")}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.colorId, colorList.data, "name")}
                            </td>
                            <td className='   table-data  shadow-xl'>
                                {findFromList(item.designId, designList.data, "name")}
                            </td>
                            <td className='   table-data  shadow-xl'>
                                {findFromList(item.gaugeId, gaugeList.data, "name")}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.loopLengthId, loopList.data, "name")}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.gsmId, gsmList.data, "name")}
                            </td>
                            <td className='   table-data  shadow-xl'>
                                {findFromList(item.kDiaId, diaList.data, "name")}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.fDiaId, diaList.data, "name")}
                            </td>
                            <td className='  table-data   shadow-xl'>
                                {findFromList(item.uomId, uomList.data, "name")}
                            </td>
                            <td className=' px-1 table-data shadow-xl '>
                                {findFromList(item.processId, processList.data, "name")}
                            </td>
                            <td className=' table-data  text-right'>
                                {substract(item._sum.noOfRolls, getIssuedProperty(item, "noOfRolls"))}
                            </td>
                            <td className=' table-data  text-right'>
                                {substract(item._sum.qty, getIssuedProperty(item, "qty")).toFixed(3)}
                            </td>
                        </tr>
                    )
                    }
                    <tr className='bg-blue-200 w-full font-bold'>
                        <td className="table-data   w-10"></td>
                        <td className="table-data   w-10"></td>
                        <td className="table-data   w-10"></td>
                        <td className="table-data   w-10"></td>
                        <td className="table-data   w-10"></td>
                        <td className="table-data   w-10"></td>
                        <td className="table-data   w-10"></td>
                        <td className="table-data   w-10"></td>
                        <td className="table-data   w-10"></td>
                        <td className="table-data   w-10"></td>
                        <td className="table-data   w-10 font-bold">Total</td>
                    </tr>
                </tbody>
            </table>
            <ReactPaginate
                previousLabel={"<"}
                nextLabel={">"}
                breakLabel={"..."}
                breakClassName={"break-me"}
                forcePage={pageNumberToReactPaginateIndex(currentPageNumber)}
                pageCount={Math.ceil(totalCount / dataPerPage)}
                marginPagesDisplayed={1}
                onPageChange={(e) => {
                    setCurrentPageNumber(reactPaginateIndexToPageNumber(e.selected));
                }}
                containerClassName={"flex justify-center mt-10 gap-5 items-center w-full absolute bottom-14 z-10"}
                pageClassName={"border custom-circle text-center"}
                disabledClassName={"p-1 bg-gray-200"}
                previousLinkClassName={"border p-1 text-center"}
                nextLinkClassName={"border p-1"}
                activeClassName={"bg-blue-900 text-white px-2"} />
        </div>

    )
}

export default FabricStockFillGrid
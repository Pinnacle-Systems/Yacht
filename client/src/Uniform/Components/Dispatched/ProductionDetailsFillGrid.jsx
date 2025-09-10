import React, { useEffect, useState } from 'react'
import { useGetPcsStockQuery, useGetStockByIdQuery } from '../../../redux/services/StockService';
import { Loader } from '../../../Basic/components';
import { pageNumberToReactPaginateIndex, reactPaginateIndexToPageNumber } from '../../../Utils/helper';
import ReactPaginate from 'react-paginate';
import { showEntries } from '../../../Utils/DropdownData';

const ProductionDetailsFillGrid = ({ isStitching, processIdTo, productionDeliveryDetails, setProductionDeliveryDetails, setFillGrid, storeId, fromProcessId, itemId, orderId }) => {
    const [localProductionDeliveryDetails, setLocaProductionDeliveryDetails] = useState(productionDeliveryDetails);

    function handleDone() {
        setProductionDeliveryDetails(localProductionDeliveryDetails);
        setFillGrid(false);
    }

    function handleCancel() {
        setLocaProductionDeliveryDetails([]);
        setFillGrid(false);
    }
    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    const { data, isFetching, isLoading } = useGetPcsStockQuery({
        params: {
            storeId, prevProcessId: fromProcessId, itemId, isForProductionDelivery: true,
            pagination: true, orderId, toProcessId: processIdTo,
            dataPerPage, pageNumber: currentPageNumber
        }
    })

    useEffect(() => {
        if (data?.totalCount) {
            setTotalCount(data?.totalCount)
        }
    }, [data, isLoading, isFetching])
    if (!data?.data || isFetching || isLoading) return <Loader />

    function addItem(item) {
        setLocaProductionDeliveryDetails(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems.push(item);
            return newItems
        });
    }
    function removeItem(removeItem) {
        setLocaProductionDeliveryDetails(localInwardItems => {
            return localInwardItems.filter(item =>
                !(removeItem.itemId === item.itemId
                    &&
                    removeItem.prevProcessId === item.prevProcessId
                    &&
                    removeItem.panelId === item.panelId
                    &&
                    removeItem.sizeId === item.sizeId
                    &&
                    removeItem.colorId === item.colorId
                    &&
                    removeItem.storeId === item.storeId
                    &&
                    removeItem.panelColorId === item.panelColorId
                )
            )
        });
    }

    function isItemChecked(checkItem) {
        let item = localProductionDeliveryDetails.find(item =>
            checkItem.itemId === item.itemId
            &&
            checkItem.prevProcessId === item.prevProcessId
            &&
            checkItem.panelId === item.panelId
            &&
            checkItem.sizeId === item.sizeId
            &&
            checkItem.colorId === item.colorId
            &&
            checkItem.storeId === item.storeId
            &&
            checkItem.panelColorId === item.panelColorId
        )
        if (!item) return false
        return true
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
            (data?.data ? data.data : []).forEach(item => addItem(item))
        } else {
            (data?.data ? data.data : []).forEach(item => removeItem(item))
        }
    }

    function getSelectAll() {
        return (data?.data ? data.data : []).every(item => isItemChecked(item))
    }


    return (
        <div>
            <div className={`bg-gray-200 z-50 w-[1000px] h-[400px] overflow-auto`}>
                <div className="md:flex md:items-center md:justify-between page-heading p-1">
                    <div className="heading text-center md:mx-10 text-xs"> Stock Items</div>

                    <div className=" sub-heading justify-center md:justify-start items-center">
                        <label className="text-white text-xs rounded-md m-1  border-none">Show Entries</label>
                        <select value={dataPerPage}
                            onChange={(e) => setDataPerPage(e.target.value)} className='h-6 w-40 border border-gray-500 rounded mr-9'>
                            {showEntries.map((option) => <option value={option.value} >{option.show}</option>)}
                        </select>
                    </div>
                    <button className='p-1 bg-blue-400 rounded-lg' onClick={handleDone}>Done</button>
                </div>
                <table className="border border-gray-500 w-full text-xs text-start">
                    <thead className="border border-gray-500">
                        <tr>
                            <th className='w-8 p-5'>
                                Mark All
                                <input type="checkbox" className='w-full' onChange={(e) => handleSelectAllChange(e.target.checked)}
                                    checked={getSelectAll()}
                                />
                            </th>
                            <th className="w-20 border border-gray-500">S.no</th>
                            <th className="border border-gray-500">Item</th>
                            {
                                !isStitching() &&
                                <th className="border border-gray-500">panel</th>
                            }

                            <th className="border border-gray-500">Color</th>
                            <th className="border border-gray-500">Size</th>
                            <th className="border border-gray-500">Prev. Process</th>
                            <th className="border border-gray-500">Stock Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data?.data || []).map((item, index) =>
                            <tr key={index} className='table-row' onClick={() => {
                                handleCheckBoxChange(!isItemChecked(item), item)
                            }}>
                                <td className='table-data'>
                                    <input type="checkbox" className='w-full table-data-input'
                                        checked={isItemChecked(item)} />
                                </td>
                                <td>{index + 1}</td>
                                <td>{item.itemName}</td>

                                {
                                    !isStitching() &&
                                    <td className='text-center'>{item?.panelName}</td>
                                }
                                <td className='text-center'>{item?.colorName}</td>
                                <td className='text-center'>{item.sizeName}</td>
                                <td className='text-center'>{item.stage}</td>
                                <td className='text-right'>{item.qty}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className=''>
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
                    containerClassName={"flex justify-center mt-3 gap-3 items-center w-full"}
                    pageClassName={"border custom-circle text-center"}
                    disabledClassName={"p-1 bg-gray-200"}
                    previousLinkClassName={"border p-1 text-center"}
                    nextLinkClassName={"border p-1"}
                    activeClassName={"bg-blue-900 text-white px-2"} />
            </div>
            <div className='flex justify-end -mt-5'>
                <button className='p-1 bg-blue-400 rounded-lg' onClick={handleDone}>Done</button>
            </div>
        </div>

    )
}

export default ProductionDetailsFillGrid;
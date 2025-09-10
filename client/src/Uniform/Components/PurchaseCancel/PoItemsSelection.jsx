import React, { useState } from 'react';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from "react-secure-storage";
import { useGetPartyQuery } from '../../../redux/services/PartyMasterService';
import { findFromList } from '../../../Utils/helper';
import YarnPoItemSelection from './YarnPoItemSelection';
import FabricPoItemSelection from './FabricPoItemSelection';
import AccessoryPoItemSelection from './AccessoryPoItemSelection';

const PoItemsSelection = ({ transtype, supplierId, setInwardItems, inwardItems, setInwardItemSelection }) => {
    const [localInwardItems, setLocalInwardItems] = useState(inwardItems.map(i => i.poItemsId));
    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const { data: supplierList, isLoading: supplierLoading, isFetching: supplierFetching } =
        useGetPartyQuery({ params: { companyId, active: true } });

    if (supplierFetching || supplierLoading) return <Loader />

    function addItem(id) {
        setLocalInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems.push(id);
            return newItems
        });
    }
    function removeItem(id) {
        setLocalInwardItems(localInwardItems => {
            let newItems = structuredClone(localInwardItems);
            newItems = newItems.filter(item => parseInt(item) !== parseInt(id))
            return newItems
        });
    }
    function handleChange(id) {
        if (isItemAdded(id)) {
            removeItem(id)
        } else {
            addItem(id)
        }
    }
    function isItemAdded(id) {
        return localInwardItems.findIndex(item => parseInt(item) === parseInt(id)) !== -1
    }
    function handleDone() {
        setInwardItems(prevInwardItems => {
            let oldInwardItems = prevInwardItems.filter(item => isItemAdded(item.poItemsId))
            let newInwardItems = localInwardItems.filter(item => {
                return prevInwardItems.findIndex(prevItem => parseInt(prevItem.poItemsId) === parseInt(item)) === -1
            })
            return [...oldInwardItems, ...newInwardItems.map(i => { return { poItemsId: i } })]
        });
        setInwardItemSelection(false);
    }

    function handleCancel() {
        setLocalInwardItems([]);
        setInwardItemSelection(false);
    }
    return (
        <>
            <div className='h-full w-full flex flex-col'>
                <div className='flex justify-between text-center bg-blue-200 rounded-b-md sticky top-0'>
                    <div className='p-2 rounded-lg flex items-center gap-5'>
                        <label className='text-xs font-semibold'>TransType</label>
                        <input className='text-xs h-6 rounded border border-gray-500 bg-white' value={transtype} disabled={true} />
                    </div>
                    <div className='p-2 rounded-lg flex items-center gap-5'>
                        <label className='text-xs font-semibold'>Supplier</label>
                        <input className='text-xs h-6 rounded border border-gray-500 bg-white' value={findFromList(supplierId, supplierList.data, "aliasName")} disabled={true} />
                    </div>
                </div>
                <div className='h-full overflow-auto'>
                    {
                        <>
                            {transtype.includes("Yarn") ?
                                <YarnPoItemSelection poType={transtype} handleChange={handleChange} supplierId={supplierId} isItemAdded={isItemAdded} />
                                :
                                <>
                                    {transtype.includes("Fabric") ?

                                        <FabricPoItemSelection poType={transtype} isItemAdded={isItemAdded} handleChange={handleChange} supplierId={supplierId} />
                                        :
                                        <AccessoryPoItemSelection poType={transtype} isItemAdded={isItemAdded} handleChange={handleChange} supplierId={supplierId} />
                                    }
                                </>
                            }

                        </>
                    }
                </div>
            </div>
            <div className='flex justify-end gap-4 mt-3'>
                <button onClick={handleDone} className='bg-lime-400 hover:bg-lime-600 hover:text-white p-1 px-3 text-sm rounded font-semibold transition'>
                    Done
                </button>
                <button onClick={handleCancel} className='bg-red-400 hover:bg-red-600 hover:text-white p-1 text-sm rounded font-semibold transition'>
                    Cancel
                </button>
            </div>
        </>
    )
}

export default PoItemsSelection
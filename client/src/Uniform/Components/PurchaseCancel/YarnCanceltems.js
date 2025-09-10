import React from 'react';
import YarnPoItem from './YarnPoItem';
import { toast } from 'react-toastify';


const YarnCancelItems = ({ inwardItems, setInwardItems, readOnly, removeItem, purchaseInwardId }) => {

    const handleInputChange = (value, index, field, balanceQty) => {
        setInwardItems(inwardItems => {
            const newBlend = structuredClone(inwardItems);
            newBlend[index][field] = value;
            // if (field !== "qty" && newBlend[index]["noOfBags"] && newBlend[index]["weightPerBag"]) {
            //     let tempInwardQty = (parseFloat(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])).toFixed(3)
            //     if (parseFloat(balanceQty) < parseFloat(tempInwardQty)) {
            //         toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
            //         return inwardItems
            //     }
            //     newBlend[index]["qty"] = tempInwardQty
            // }
            // if (field === "qty") {
            //     if (parseFloat(balanceQty) < parseFloat(value)) {
            //         toast.info("Inward Qty Can not be more than balance Qty", { position: 'top-center' })
            //         return inwardItems
            //     }
            //     let qty = parseInt(newBlend[index]["noOfBags"]) * parseFloat(newBlend[index]["weightPerBag"])
            //     let excessQty = parseInt(newBlend[index]["noOfBags"]) * 2
            //     if ((qty + excessQty) < parseFloat(value)) {
            //         toast.info("Excess Qty Cannot be More than 2kg Per Bag", { position: 'top-center' })
            //         return inwardItems
            //     }
            // }
            return newBlend
        });
    };

    return (
        <>
        
            <div className={`w-full overflow-y-auto py-1`}>
                <table className=" text-xs border border-gray-500 table-auto w-full">
                    <thead className='bg-blue-200 border border-gray-500 top-0'>
                        <tr className='h-8'>
                            <th className="table-data text-center">S.no</th>
                            <th className="table-data   text-center">P.no</th>
                            <th className="table-data ">Items</th>
                            <th className="table-data">Colors</th>
                            <th className="table-data">UOM</th>
                            <th className="table-data">Po.Qty</th>
                            <th className="table-data">Po.Bags</th>
                            <th className="table-data">A.Can Qty</th>
                            <th className="table-data ">A.Can Bags</th>                         
                            <th className="table-data">A.In. Qty</th>
                            <th className="table-data">A.In. Bags</th>

                            <th className="table-data ">A.Rtn Qty</th>
                            <th className="table-data ">A.Rtn Bags</th>

                            <th className="table-data  "> Bal Qty</th>  
                            <th className="table-data  "> Bal Bags</th>  
                                
                            <th className="table-data  ">Can. Bags<span className="text-red-500">*</span></th>
                            {/* <th className="table-data  ">Wt/Bag<span className="text-red-500">*</span></th> */}
                            <th className="table-data  ">Can Qty</th>
                           

                            {!readOnly &&
                                <th className='table-data'>Del</th>
                            }
                        </tr>
                    </thead>
                    <tbody className='overflow-y-auto  h-full w-full'>
                        
                        {inwardItems.map((item, index) => <YarnPoItem readOnly={readOnly} noOfBags={item.noOfBags} weightPerBag={item.weightPerBag} purchaseInwardId={purchaseInwardId} removeItem={removeItem} key={item.poItemsId} qty={item.qty} poItemId={item.poItemsId} index={index} handleInputChange={handleInputChange} />)}
                        {Array.from({ length: 8 - inwardItems.length }).map(i =>
                            <tr className='w-full font-bold h-8 border border-gray-400 table-row' key={i}>
                            {Array.from({ length: 17}).map(i =>
                                <td className="table-data   "></td>
                            )}
                            {!readOnly &&
                                <td className="table-data w-10"></td>
                            }
                        </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default YarnCancelItems
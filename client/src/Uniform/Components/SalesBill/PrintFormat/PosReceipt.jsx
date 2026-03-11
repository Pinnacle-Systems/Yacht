import React from "react";
import { findFromList, getTimeFromDateTime } from "../../../../Utils/helper";
import { toWords } from "number-to-words";

const PosReceipt = React.forwardRef(({ singleData, branchData, taxRows, grossAmount, roundOffValue, roundOffType, totalNetAmt, salesBillItems, savedData,sizeList,styleItemList }, ref) => {
    const receiptData = savedData || singleData || {};
    const uniqueStyleIds = [...new Set(salesBillItems.map(i => i.styleItemId))];
    const totalItems = uniqueStyleIds?.length;
    const totalQty = salesBillItems.reduce((sum, r) => sum + (r.qty || 0), 0);
    const totalAmt = salesBillItems.reduce(
        (sum, r) => sum + (Number(r.netAmount) || 0),
        0
    );
    const calculateDiscAmt = (item) => {
        const qty = parseFloat(item.qty) || 0;
        const rate = parseFloat(item.rate) || 0;
        const discountValue = parseFloat(item.discountValue) || 0;
        const discountType = item.discountType || "";

        // Gross amount
        const grossAmount = qty * rate;
        let discountAmount = 0;
        if (discountType) {
            if (discountType === "Flat") {
                discountAmount = discountValue;
            } else {
                discountAmount = (grossAmount * discountValue) / 100;
            }
        }
        return discountAmount;
    };

    const totalDiscAmt = salesBillItems?.reduce((sum, item) => sum + calculateDiscAmt(item), 0)
    const words =
        "Rupees " +
        toWords(totalNetAmt)
            .replace(/\b\w/g, (c) => c.toUpperCase()) +
        " Only";

    return (
        <div ref={ref} className="pos-receipt py-1 bg-white">

            <div className="pos-center pos-bold">{branchData?.company?.code || ""}</div>
            <div className="pos-center text-[10px]">{branchData?.address || ""}</div>
            <div className="pos-center">Ph: {branchData?.company?.contactMobile || ""}</div>

            <div className="pos-divider" />
            <div className="pos-center pos-bold">CASH BILL</div>
            <div className="flex font-medium gap-1 my-1">
                <div>
                    <div className="flex ">
                        <span>B.No : </span>
                        <span className="px-1">{receiptData?.docId?.split("/").pop() || ""}</span>
                    </div>

                    <div className="flex">
                        <span>Date :</span>
                        <span className="px-1">
                            {(receiptData?.docDate
                                ? new Date(receiptData.docDate)
                                : new Date()
                            ).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex">
                        <span>Time :</span>
                        <span className="px-1">
                            {receiptData?.createdAt
                                ? getTimeFromDateTime(receiptData.createdAt)
                                : new Date().toLocaleTimeString()}
                        </span>
                    </div>
                </div>
                <div>
                    <div className="flex ">
                        <span>To : </span>
                        <span className="px-1">{receiptData?.customerName || ""}</span>
                    </div>

                    <div className="flex">
                        <span>Ph :</span>
                        <span className="px-1">
                            {receiptData?.mobileNo || ""}
                        </span>
                    </div>
                </div>

            </div>


            <div className="pos-divider" />

            <table className="pos-items text-[12px]">
                <thead className="">
                    <tr className="">
                        <th className="text-left w-[48%]">ITEM</th>
                        <th className="text-left w-[12%]">QTY</th>
                        <th className="text-right w-[20%]">RATE</th>
                        <th className="text-right w-[20%]">AMT</th>
                    </tr>
                </thead>

                <tbody>
                    {salesBillItems?.map((item, i) => (
                        <tr key={i}>
                            <td className="pos-left">{findFromList(item?.styleItemId, styleItemList?.data, "name") || ""}-{findFromList(item?.sizeId, sizeList?.data, "name") || ""}</td>
                            <td>{item.qty || ""} {item?.Uom?.name}</td>
                            <td className="pos-right">
                                {Number(item.rate).toFixed(2) || ""}
                            </td>
                            <td className="pos-right">
                                {!item.qty || !item.rate
                                    ? 0.0
                                    : (
                                        parseFloat(item.qty) * parseFloat(item.rate)
                                    ).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pos-divider" />



            <div className="pos-row font-medium">
                <span>Total Amount</span>
                <span> {(Array.isArray(salesBillItems) ? salesBillItems : [])
                    .reduce((sum, row) => {
                        const qty = parseFloat(row.qty) || 0;
                        const rate = parseFloat(row.rate) || 0;
                        return sum + qty * rate;
                    }, 0)
                    .toFixed(2)}</span>
            </div>
            <div className="pos-row font-medium">
                <span>Discount</span>
                <span>-{totalDiscAmt.toFixed(2)}</span>
            </div>
            {
                taxRows?.map((item) => (
                    <div>
                        <span>{item?.taxPercent} % GST on ({(grossAmount).toFixed(2)}) = {(item?.cgstAmount + item?.sgstAmount).toFixed(2)}</span>
                    </div>
                ))
            }

            <div className="pos-row font-medium">
                <span>Rounded Off</span>
                <span>{roundOffType === "PLUS" ? "+" : "-"}{Number(roundOffValue || 0).toFixed(2)}</span>
            </div>
            <div className="pos-row font-bold">
                <div className="flex items-center text-[14px]  w-1/2">
                    <span>NET AMOUNT</span>
                </div>
                <div className="pos-dividerY w-1/2 py-1 text-right text-[16px]">
                    <span>{totalNetAmt.toFixed(2)}</span>
                </div>
            </div>
            {/* <div className="my-1">
                <span className="font-medium ">{words}</span>
            </div> */}
            <div className="pos-row font-bold">
                <div className="flex   w-1/2">
                    <span>Total Items :</span>
                    <span className="px-1">{totalItems}</span>
                </div>
                <div className=" w-1/2">
                    <span>Total Qty :</span>
                    <span className="px-1">{totalQty}</span>
                </div>
            </div>
            <div className="pos-divider pt-1 text-[13px]">
                <ul className="list-disc pl-4">
                    <li>Exchange is applicable within 3 days with the bill and barcode tag.</li>
                    <li>Please follow the wash care instructions.</li>
                </ul>
            </div>


            <div className="pos-center">Thank You Visit Again!</div>
        </div>
    );
});

export default PosReceipt;
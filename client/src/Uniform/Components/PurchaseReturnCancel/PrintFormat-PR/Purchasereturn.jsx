import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import logo from '../../../../assets/iknits.png'
import moment from 'moment';
import PageWrapper from '../../../../Utils/PageWrapper';
import numWords from 'num-words';
import tw from '../../../../Utils/tailwind-react-pdf';


export default function PurchaseReturn( { styles,singleData,findAmount,getTotals,getGross,getTotalAmount }) {

    console.log(singleData,"singleData")

        return (
            <>
        <PageWrapper heading={"PurchaseReturn"} singleData={singleData} DeliveryNo={"Receipt.No :"} DeliveryDate={"Receipt.Date :"} >
            <View style={styles.container}>
            <View style={tw("flex gap-y-3")}>

<View style={tw("flex flex-row justify-start w-full  ")} >
<View style={tw("flex flex-row gap-x-2 w-1/2 -ml-1")}>
    <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Return Doc No : </Text>
    <Text style={tw("text-xs")}>  {singleData?.docId || ""} </Text>
</View>
<View style={tw("flex flex-row gap-x-2 w-1/2 ml-1")}>
    <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Inward Type :</Text>
    <Text style={tw("text-xs")}>{singleData?.poInwardOrDirectInward}</Text>
</View>
</View>


<View style={tw("flex flex-row  justify-start w-full ")} >

  <View style={tw("flex flex-row gap-x-2 w-1/2")}>
    <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Supplier :  </Text>
    <Text style={tw("text-xs")}>{singleData?.supplier?.name || 'N/A'}</Text>
  </View>
  <View style={tw("flex flex-row gap-x-2 w-1/2")}>
    <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Dc No :</Text>
    <Text style={tw("text-xs")}>{singleData?.dcNo}</Text>
  </View>
</View>
<View style={tw("flex flex-row  justify-start w-full  ")} >
  <View style={tw("flex flex-row gap-x-2 w-1/2")}>
    <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Dc Date :</Text>
    <Text style={tw("text-xs")}>{moment(singleData?.dcDate).format("DD-MM-YYYY") || ""} </Text>
  </View>


  <View style={tw("flex flex-row gap-x-2 w-1/2")}>
    <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>location :</Text>
    <Text style={tw("text-xs")}>{singleData?.Branch?.branchName || 'N/A'} </Text>
  </View>

</View>
<View style={tw("flex flex-row  justify-start w-full  ")} >
  <View style={tw("flex flex-row gap-x-2 w-1/2")}>
    <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Store :</Text>
    <Text style={tw("text-xs")}>{singleData?.Store?.storeName} </Text>
  </View>


</View>
            </View>
            <View style={styles.divider} />
            <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                {(singleData?.transType === "Accessory"
                    ? [
                    "Accessory Group",
                    "Accessory Item",
                    "Alias Name",
                    "Color",
                    "Size",
                    "UOM",
                    "Qty",
                    "Price",
                    "Total",
                    "Tax",
                    "Discount Type",
                    "Discount Value",
                    "Final Amount",
                    ]
                    : [
                        "S.no",
                        "Di.No",
                        "Fabric Name",
                        "Color",
                        "Design",
                        "Gauge",
                        "LL",
                        "Gsm",
                        "K-Dia",
                        "F-Dia",
                        "Uom",
                        "StockQty",
                        "No. of Rolls",
                        "Return Qty",
                        "Price",
                        "Gross"
]
                ).map((header, index) => (
                    <Text key={index} style={styles.headerCell}>{header}</Text>
                ))}
                </View>

                {/* Table Rows */}
                {(singleData?.directReturnItems || []).map((item, index) => (
                <View key={index} style={[styles.tableRow, index % 2 !== 0 && styles.tableRowOdd]}>
                    {(singleData?.transType === "Accessory"
                    ? [
                        item?.AccessoryGroup?.name,
                        item?.AccessoryItem?.name,
                        item?.Accessory?.aliasName,
                        item?.Color?.name,
                        item?.Size?.name,
                        item?.Uom?.name,
                        item?.qty,
                        item?.price,
                        (parseFloat(item?.qty) * parseFloat(item?.price)).toFixed(2),
                        item?.tax,
                        item?.discountType,
                        item?.discountValue,
                        findAmount(item.qty, item.price)
                    ]
                    : [
                        parseInt(index) + parseInt(1),
                        item?.poNo,
                        item?.Fabric?.name,
                        item?.Color?.name,
                        item?.Design?.name,
                        item?.Gauge?.name,
                        item?.LoopLength?.name,
                        item?.Gsm?.name,
                        item?.KDia?.name,
                        item?.FDia?.name,
                        item?.Uom?.name,
                        item?.poQty,
                        item?.noOfRolls,
                        item?.qty,
                        item?.price,
                        findAmount(item.poQty, item.price)
                    ]
                    ).map((cell, i) => (
                    <Text key={i} style={styles.tableCell}>{cell || "N/A"}</Text>
                    ))}
                </View>
                ))}
                <View style={styles.totalRow}>
                {[...Array(singleData?.transType === "Accessory" ? 5 : 8)].map((_, i) => (
                    <Text key={i} style={styles.totalCell}></Text>
                ))}

                <Text style={styles.totalCell}>Total:</Text>

                <Text style={styles.totalCell}></Text>
                <Text style={styles.totalCell}></Text>
                <Text style={styles.totalCell}> {getTotals("poQty").toFixed(3)}</Text>
                <Text style={styles.totalCell}></Text>
                <Text style={styles.totalCell}></Text>
                <Text style={styles.totalCell}></Text>
                <Text style={styles.totalCell}>
                    {getTotalAmount("poQty", "price", "tax", "discountType", "discountAmount").toFixed(2)}
                </Text>
                </View>

            </View>


       
            <View style={styles.amountInWordsContainer}>
                <Text style={styles.amountInWordsLabel}>Amount in Words:</Text>
                <Text>
                { (getTotalAmount("qty", "price", "tax", "discountType", "discountAmount" )) ?  numWords?.(getTotalAmount("qty", "price", "tax", "discountType", "discountAmount" )) : null} Rupees

                </Text> 
            </View>


            </View>
            
    </PageWrapper>
            </>
        )

  
}
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import logo from '../../../../assets/iknits.png'
import moment from 'moment';
import PageWrapper from '../../../../Utils/PageWrapper';
import numWords from 'num-words';
import tw from '../../../../Utils/tailwind-react-pdf';


export default function PurchaseOrder( { styles,singleData,findAmount,getTotals,getGross,getTotalAmount }) {

        return (
            <>
        <PageWrapper heading={"PurchaseOrder"} singleData={singleData} DeliveryNo={"Receipt.No :"} DeliveryDate={"Receipt.Date :"} >
            <View style={styles.container}>
       
            <View style={tw("flex gap-y-3")}>

                    <View style={tw("flex flex-row justify-start w-full  ")} >
                    <View style={tw("flex flex-row gap-x-2 w-1/2 -ml-1")}>
                        <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Po No : </Text>
                        <Text style={tw("text-xs")}>  {singleData?.docId || ""} </Text>
                    </View>
                    <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1")}>
                        <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Due Date :</Text>
                        <Text style={tw("text-xs")}>{moment(singleData?.dueDate).format("DD-MM-YYYY") || ""}</Text>
                    </View>
                    </View>


                    <View style={tw("flex flex-row  justify-start w-full ")} >

                    <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                        <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Supplier :  </Text>
                        <Text style={tw("text-xs")}>{singleData?.supplier?.aliasName || 'N/A'}</Text>
                    </View>
                    <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                        <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Pay Terms :</Text>
                        <Text style={tw("text-xs")}>{singleData?.PayTerms?.name}</Text>
                    </View>
                    </View>
                    <View style={tw("flex flex-row  justify-start w-full  ")} >
                    <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                        <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Delivery Type :</Text>
                        <Text style={tw("text-xs")}>{singleData?.deliveryType} </Text>
                    </View>


                    <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                        <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Delivery To :</Text>
                        <Text style={tw("text-xs")}>{singleData?.DeliveryParty?.name || 'N/A'} </Text>
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
                    "Accessory Name",
                    "Color",
                    "Size",
                    "UOM",
                    "Qty",
                    "Price",
                    "Total",
                    "Tax",
                    "Final Amount",
                    ]
                    : [
                    "Fabric",
                    "Color",
                    "GSM",
                    "UOM",
                    "Qty",
                    "Price",
                    "Total",
                    "Tax",
                    "Final Amount",
                   
                
                    ]
                ).map((header, index) => (
                    <Text key={index} style={styles.headerCell}>{header}</Text>
                ))}
                </View>

                {/* Table Rows */}
                {(singleData?.PoItems || []).map((item, index) => (
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
                       findAmount(item.qty, item.price, item.tax, item.discountType, item.discountAmount),
                    ]
                    : [
                        item?.Fabric?.name,
                        item?.Color?.name,
                   
                        item?.Gsm?.name,
                  
                        item?.Uom?.name,
                        item?.qty,
                        item?.price,
                        (parseFloat(item?.qty) * parseFloat(item?.price)).toFixed(2),
                        item?.tax,
                        findAmount(item.qty, item.price, item.tax, item.discountType, item.discountAmount),
                  
                    ]
                    ).map((cell, i) => (
                    <Text key={i} style={styles.tableCell}>{cell || "N/A"}</Text>
                    ))}
                </View>
                ))}
                <View style={styles.totalRow}>
                {[...Array(singleData?.transType === "Accessory" ? 5 : 3)].map((_, i) => (
                    <Text key={i} style={styles.totalCell}></Text>
                ))}

                <Text style={styles.totalCell}>Total:</Text>

                <Text style={styles.totalCell}>{getTotals("qty").toFixed(3)}</Text>
                <Text style={styles.totalCell}></Text>
                <Text style={styles.totalCell}>{getGross("qty", "price").toFixed(2)}</Text>
                <Text style={styles.totalCell}></Text>
                {/* <Text style={styles.totalCell}></Text> */}
         
                <Text style={styles.totalCell}>
                    {getTotalAmount("qty", "price", "tax", "discountType", "discountAmount").toFixed(2)}
                </Text>
                </View>

            </View>


            <View style={styles.amountInWordsContainer}>
                <Text style={styles.amountInWordsLabel}>Amount in Words:</Text>
                <Text>  
                    {numWords(getTotalAmount?.("qty", "price", "tax", "discountType", "discountAmount" )) } Rupees

                </Text> 
            </View>

            </View>
            
    </PageWrapper>
            </>
        )

  
}
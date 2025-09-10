import { Image, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import logo from '../../../../assets/iknits.png'
import moment from "moment";
import { substract } from "../../../../Utils/helper";
import PageWrapper from "../../../../Utils/PageWrapper";
import tw from "../../../../Utils/tailwind-react-pdf";

export default function CuttingReceipt ({singleData,styles,getTotals,substract,findAmount}){



  return(
    <>
    <PageWrapper heading={"Cutting Receipt"} singleData={singleData} DeliveryNo={"CuttingReceipt.No :"} DeliveryDate={"CuttingReceipt.Date :"} >
      
                    {/* <Page style={styles.page}> */}
                            
<View style={styles.container}>

<View style={tw("flex gap-y-3 p-2")}>

<View style={tw("flex flex-row justify-start w-full  ")} >
  <View style={tw("flex flex-row gap-x-2 w-1/2 -ml-1")}>
    <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Cutting Receipt No : </Text>
    <Text style={tw("text-xs")}>  {singleData?.docId || ""} </Text>
  </View>
  <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1")}>
    <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Store :</Text>
    <Text style={tw("text-xs")}>{singleData?.Store?.storeName}</Text>
  </View>
</View>


<View style={tw("flex flex-row  justify-start w-full ")} >

  <View style={tw("flex flex-row gap-x-2 w-1/2")}>
    <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>location :  </Text>
    <Text style={tw("text-xs")}>{singleData?.Branch?.branchName || 'N/A'}</Text>
  </View>
  <View style={tw("flex flex-row gap-x-2 w-1/2")}>
    <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Cutting Order :</Text>
    <Text style={tw("text-xs")}>{singleData?.CuttingOrder?.docId}</Text>
  </View>
</View>
<View style={tw("flex flex-row  justify-start w-full  ")} >
  <View style={tw("flex flex-row gap-x-2 w-1/2")}>
    <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Supplier :</Text>
    <Text style={tw("text-xs")}>{singleData?.Supplier?.name} </Text>
  </View>


  <View style={tw("flex flex-row gap-x-2 w-1/2")}>
    <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Supplier Dc :</Text>
    <Text style={tw("text-xs")}>{singleData?.supplierDc || 'N/A'} </Text>
  </View>

</View>
</View>
                               <View style={styles.divider} />
                               <View style={styles.table}>
                                 {/* Table Header */}
                                 <View style={styles.tableHeader}>
                                   {(singleData?.transType === "Accessory"
                                     ? [
                                       "S.No",
                                       "Accessory Group",
                                       "Accessory Item",
                                       "Alias Name",
                                       "Color",
                                       "Size",
                                       "UOM",
                                       "Qty",
                                       "stockPrice",
                                       "Total",
                                       "Tax",
                                       "Discount Type",
                                       "Discount Value",
                                       "Final Amount",
                                     ]
                                     : [
                                       "S.No",
                                       "Item",
                                       "Color",
                                       "Size",
                                       "Order Qty",
                                       "Cutting Qty",
                                       "Already recived Qty",
                                       "Bal To Rec Qty",
                                       "Received Qty",
                                      
                                       // "Tax",
                                       // "Discount Type",
                                       // "Discount Value",
                                       // "Final Amount",
                                     ]
                                   ).map((header, index) => (
                                     <Text key={index} style={styles.headerCell}>{header}</Text>
                                   ))}
                                 </View>
                     
                                 {/* Table Rows */}
                                 {(singleData?.CuttingReceiptInwardDetails || []).map((item, index) => (
                                   <View wrap={true} key={index} style={[styles.tableRow, index % 2 !== 0 && styles.tableRowOdd]}>
                                     {(singleData?.transType === "Accessory"
                                       ? [
                                         parseInt(index) + 1,
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
                                         findAmount(item.qty, item.price, item.tax, item.discountType, item.discountAmount),
                                       ]
                                       : [ 
                                          parseInt(index) + 1,
                                         item?.Item?.name, 
                                         item?.Color?.name,
                                         item?.Size?.name,
                                         item?.orderQty ,
                                         item?.cuttingQty,
                                         item?.alreadyReceivedQty || 0,
                                        substract(item?.cuttingQty,item?.alreadyReceivedQty),
                                         item?.receivedQty,
                                  
                                       ]
                                     ).map((cell, i) => (
                                       <Text wrap={true} break-words  key={i} style={[styles.tableCell ,tw("h-9 w-10 break-words")]} >{cell || "N/A"}</Text>
                                     ))}
                                   </View>
                                 ))}
                                 <View style={styles.totalRow}>
                                   {[...Array(singleData?.transType === "Accessory" ? 5 : 6)].map((_, i) => (
                                     <Text key={i} style={styles.totalCell}></Text>
                                   ))}
                     
                               <Text style={styles.totalCell}>Total Qty:</Text>
                     
                                   {/*     <Text style={styles.totalCell}></Text>
                                   <Text style={styles.totalCell}></Text>
                                   <Text style={styles.totalCell}></Text>
                                   <Text style={styles.totalCell}></Text> */}
                                   <Text style={styles.totalCell}></Text>
                                   <Text style={styles.totalCell}>{getTotals("receivedQty").toFixed(3)}</Text>
                                   {/* <Text style={styles.totalCell}>
                                     {getTotalAmount("qty", "price", "tax", "discountType", "discountAmount").toFixed(2)}
                                   </Text> */}
                                 </View>
                     
                               </View>
                     
                     
                               {/* <View style={styles.amountInWordsContainer}>
                                 <Text style={styles.amountInWordsLabel}>Amount in Words:</Text>
                                 <Text style={styles.amountInWordsText}>
                                 </Text>
                               </View> */}
                     
                             </View>
                           
                           {/* </Page> */}
    
                           
                </PageWrapper>
        </>
  )
}


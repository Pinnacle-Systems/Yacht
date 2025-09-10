  import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import moment from 'moment';
// import numWords from 'num-words';
import logo from '../../../../assets/iknits.png'
import PageWrapper from '../../../../Utils/PageWrapper';
import tw from '../../../../Utils/tailwind-react-pdf';

export default  function  CuttingDelivery({ singleData,styles,getTotals,findAmount }) {

    return (
        <>       
        
         <PageWrapper heading={"Cutting Delivery"} singleData={singleData} DeliveryNo={"CuttingDelivry.No :"} DeliveryDate={"CuttingOrder.Date :"} >

                <View style={styles.container}>
                <View style={tw("flex gap-y-3 p-2")}>

            <View style={tw("flex flex-row justify-start w-full  ")} >
              <View style={tw("flex flex-row gap-x-2 w-1/2 -ml-1")}>
                <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Cutting Delivry NO :</Text>
                <Text style={tw("text-xs")}>  {singleData?.docId|| ""} </Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1")}>
                <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Due Date :</Text>
                <Text style={tw("text-xs")}>{moment(singleData?.dueDate).format("DD-MM-YYYY") || ""}</Text>
              </View>
            </View>


            <View style={tw("flex flex-row  justify-start w-full ")} >

              <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Location :  </Text>
                <Text style={tw("text-xs")}>{singleData?.Branch?.branchName || 'N/A'}</Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Delivery To :</Text>
                <Text style={tw("text-xs")}>{singleData?.DeliveryTo?.name}</Text>
              </View>
            </View>
            <View style={tw("flex flex-row  justify-start w-full  ")} >
              <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Store :</Text>
                <Text style={tw("text-xs")}>{singleData?.Store?.storeName} </Text>
              </View>


              <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Cutting Order Id :</Text>
                <Text style={tw("text-xs")}>{singleData?.CuttingOrder?.docId || 'N/A'} </Text>
              </View>



            </View>
            <View style={tw("flex flex-row  justify-start w-full  ")} >
              <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Supplier :</Text>
                <Text style={tw("text-xs")}>{singleData?.Supplier?.name} </Text>
              </View>


           



            </View>
          </View>
                  <View style={styles.infoWrapper}>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.table}>
              
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
                          "Fabric",
                          "Color",
                          "Design",
                          "GSM",
                          "gauge",
                          "Loop Length",
                          "K Dia",
                          "F Dia",
                          "UOM",
                          "Lot NO",
                          "No Of Rolls",
                          " Stock Qty",
                          "Issue Roll",
                          "Issue Qty",
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
                    {(singleData?.CuttingDeliveryDetails || []).map((item, index) => (
                      <View key={index} style={[styles.tableRow, index % 2 !== 0 && styles.tableRowOdd]}>
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
                            item?.Fabric?.name ,
                            item?.Color?.name,
                            item?.Design?.name,
                            item?.Gsm?.name,
                            item?.GG?.name,
                            item?.LoopLength?.name,
                            item?.KDia?.name,
                            item?.FDia?.name,
                            item?.Uom?.name,
                            item?.lotNo,
                            item?.stockRolls,
                            // (parseFloat(item?.qty) * parseFloat(item?.price)).toFixed(2),
                            item?.stockQty,
                            item?.delRolls,
                            item?.delQty,
                            // (parseFloat(item?.stockQty) * parseFloat(item?.stockPrice)).toFixed(2),
        
                            // findAmount(item.qty, item.price, item.tax, item.discountType, item.discountAmount),
                          ]
                        ).map((cell, i) => (
                          <Text key={i} style={styles.tableCell}>{cell || "N/A"}</Text>
                        ))}
                      </View>
                    ))}
                    <View style={styles.totalRow}>
                      {[...Array(singleData?.transType === "Accessory" ? 5 : 7)].map((_, i) => (
                        <Text key={i} style={styles.totalCell}></Text>
                      ))}
        
                      <Text style={styles.totalCell}>Total:</Text>
        
                      <Text style={styles.totalCell}></Text>
                      <Text style={styles.totalCell}></Text>
                      <Text style={styles.totalCell}></Text>
                      <Text style={styles.totalCell}></Text>
                      <Text style={styles.totalCell}></Text>
                      <Text style={styles.totalCell}>{getTotals("delQty").toFixed(3)}</Text>
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
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Thank you for your business!</Text>
                  <Text style={styles.footerText}>Contact us:  iKnits@gmail.com</Text>
                </View>
                </PageWrapper>

        </>
    )
}


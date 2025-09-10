import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import moment from 'moment';
// import numWords from 'num-words';
import logo from '../../../../assets/iknits.png'
import PageWrapper from '../../../../Utils/PageWrapper';
import tw from '../../../../Utils/tailwind-react-pdf';

export default  function  ProductionDeleviry({ getTotals, singleData, styles, findAmount }) {

    
    return (
        <>       
        
         <PageWrapper heading={"Production Delivery"} singleData={singleData} DeliveryNo={"ProductionDelivery.No :"} DeliveryDate={"ProductionDelivery.Date :"} >

                  <View style={styles.container}>
                  <View style={tw("flex gap-y-3 p-2")}>

          <View style={tw("flex flex-row justify-start w-full  ")} >
              <View style={tw("flex flex-row gap-x-2 w-1/3 -ml-1")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Delivery No : </Text>
                  <Text style={tw("text-xs")}>  {singleData?.docId || ""} </Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/3 ml-1")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Due Date :</Text>
                  <Text style={tw("text-xs")}>{moment(singleData?.dueDate).format("DD-MM-YYYY") || ""}</Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                      <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Order :</Text>
                      <Text style={tw("text-xs")}>{singleData?.Order?.docId}</Text>
                  </View>
          </View>


          <View style={tw("flex flex-row  justify-start w-full ")} >
           
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>In/out House :  </Text>
                  <Text style={tw("text-xs")}>{singleData?.productionType || 'N/A'}</Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Location :</Text>
                  <Text style={tw("text-xs")}>{singleData?.Branch?.branchName} </Text>
              </View>


              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Store :</Text>
                  <Text style={tw("text-xs")}>{singleData?.Store?.storeName || 'N/A'} </Text>
              </View>
          </View>
       
             <View style={tw("flex flex-row  justify-start w-full  ")} >
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Form Process :</Text>
                  <Text style={tw("text-xs")}>{singleData?.FromProcess?.name} </Text>
              </View>

              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>To Process :</Text>
                  <Text style={tw("text-xs")}>{singleData?.ToProcess?.name} </Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Process cost :</Text>
                  <Text style={tw("text-xs")}>{singleData?.ironingCost  ||  singleData?.packingCost || singleData?.stitchingCost  } </Text>
              </View>


          </View>
          <View style={tw("flex flex-row  justify-start w-full  ")} >
                
                  <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                      <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Packing Type :</Text>
                      <Text style={tw("text-xs")}>{singleData?.packingType} </Text>
                  </View>
                  <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                      <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Category :</Text>
                      <Text style={tw("text-xs")}>{singleData?.packingCategory} </Text>
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
                          "StockQty",
                          "Del.Qty"
                     
                        ]
                      ).map((header, index) => (
                        <Text key={index} style={styles.headerCell}>{header}</Text>
                      ))}
                    </View>
        
                    {/* Table Rows */}
                    {(singleData?.productionDeliveryDetails || []).map((item, index) => (
                      <View key={index} style={[styles.tableRow, index % 2 !== 0 && styles.tableRowOdd]}>
                        {(singleData?.singleData?.transType === "Accessory"
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
                             item?.qty,
                             item?.delQty,

                            // (parseFloat(item?.qty) * parseFloat(item?.price)).toFixed(2),
                            
                            // (parseFloat(item?.stockQty) * parseFloat(item?.stockPrice)).toFixed(2),
        
                            // findAmount(item.qty, item.price, item.tax, item.discountType, item.discountAmount),
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
                
                </PageWrapper>

        </>
    )
}


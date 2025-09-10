import { Image, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import logo from '../../../../assets/iknits.png'
import moment from "moment";
import { substract } from "../../../../Utils/helper";
import PageWrapper from "../../../../Utils/PageWrapper";
import tw from "../../../../Utils/tailwind-react-pdf";

export default function CuttingOrder({ singleData, styles, getTotals, substract, findAmount, cuttingOrderDetails,
  selectedSizeList, selectedStyleList, tempOrderDetails }) {
  let array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  return (
    <>{console.log(cuttingOrderDetails, "cuttingOrderDetails")}
      <PageWrapper heading={"Cutting Order"} singleData={singleData} DeliveryNo={"CuttingOrder.No :"} DeliveryDate={"CuttingOrder.Date :"} styles={styles} >

        {/* <Page style={styles.page}> */}




        <View style={styles.container}>

          <View style={tw("flex gap-y-3 p-2")}>

            <View style={tw("flex flex-row justify-start w-full  ")} >
              <View style={tw("flex flex-row gap-x-2 w-1/2 -ml-1")}>
                <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Cutting Order No : </Text>
                <Text style={tw("text-xs")}>  {singleData?.docId || ""} </Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1")}>
                <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Doc Date :</Text>
                <Text style={tw("text-xs")}>{moment(singleData?.dueDate).format("DD-MM-YYYY") || ""}</Text>
              </View>
            </View>


            <View style={tw("flex flex-row  justify-start w-full ")} >

              <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Order NO :  </Text>
                <Text style={tw("text-xs")}>{singleData?.Order?.docId || 'N/A'}</Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Customer :</Text>
                <Text style={tw("text-xs")}>{singleData?.Party?.name}</Text>
              </View>
            </View>
            <View style={tw("flex flex-row  justify-start w-full  ")} >
              <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Delivery Type:</Text>
                <Text style={tw("text-xs")}>{singleData?.deliveryType} </Text>
              </View>


              <View style={tw("flex flex-row gap-x-2 w-1/2")}>
                <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Delivery To :</Text>
                <Text style={tw("text-xs")}>{singleData?.Branch?.branchName || 'N/A'} </Text>
              </View>

            </View>
          </View>






          {/* <View style={tw("flex flex-row justify-around text-sm")}>
            <View style={styles.fromInfoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.labelpo}>Cutting Order No : </Text>
                <Text style={styles.valueText}>{singleData?.docId || ""}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.labelpo}>Order NO : </Text>
                <Text style={styles.valueText}>{singleData?.Order?.docId || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.labelpo}>Delivery Type: </Text>
                <Text style={styles.valueText}>{singleData?.deliveryType}</Text>
              </View>




            </View>
            <View style={styles.fromInfoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.labelpo}>Doc Date : </Text>
                <Text style={styles.valueText}>{moment(singleData?.dueDate).format("DD-MM-YYYY")}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.labelpo}>Delivery To : </Text>
                <Text style={styles.valueText}>{singleData?.Branch?.branchName || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.labelpo}>Customer : </Text>
                <Text style={styles.valueText}>{singleData?.Party?.name}</Text>
              </View>
            </View>

          </View> */}





          <View style={styles.infoWrapper}>
          </View>
          <View style={styles.divider} />





          <View>

            <View style={tw("flex-col mt-2")}>
              {(cuttingOrderDetails || []).map((itemType, index) => (
                (itemType?.items || []).map((item, valIndex) => (
                  (item?.colorList || []).map((color, colorIndex) => (
                    <View>
                      <View style={tw("w-full flex flex-row  justify-center items-center text-center gap-x-10 border bg-sky-200 p-1")}>
                        <Text key={index} style={tw(" px-1 ")}>{itemType.itemTypeName}</Text>-
                        <Text key={valIndex} style={tw(" ")}>{item.itemName}  </Text>
                        <Text key={valIndex} style={tw(" ")}>{color.name}  </Text>
                      </View>





                      {/* FIRST SET */}


                      <View style={tw("flex flex-col  border-x")} >

                        <View style={tw("flex flex-row w-full flex-wrap ")} >

                          <Text style={tw("w-12  flex-wrap border-r px-1 ")}>
                            Size
                          </Text>

                          {(color?.sizeList?.filter((j, jIndex) => jIndex <= 18)?.map((size, sizeIndex) => (


                            <View style={tw("flex")}>

                              <View style={tw(" ")} >
                                <Text key={sizeIndex} style={tw("w-9 text-center border-r ")}>
                                  {size?.sizeName}
                                </Text>
                              </View>
                            </View>


                          )))}
                        </View>
                      </View>

                      <View style={tw("flex flex-col border-t border-x")} >

                        <View style={tw("flex flex-row w-full flex-wrap ")} >

                          <Text style={tw("w-12  flex-wrap border-r  px-1 ")}>
                            O.Qty
                          </Text>

                          {(color?.sizeList?.filter((j, jIndex) => jIndex <= 18)?.map((size, sizeIndex) => (

                            <View style={tw("flex")}>

                              <View style={tw(" ")} >
                                <Text key={sizeIndex} style={tw("w-9 text-center border-r ")}>
                                  {size?.orderQty || 0}
                                </Text>
                              </View>
                            </View>


                          )))}
                        </View>
                      </View>


                      <View style={tw("flex flex-col border-t border-x border-b")} >

                        <View style={tw("flex flex-row w-full flex-wrap bg bg-zinc-400")} >

                          <Text style={tw("w-12  flex-wrap border-r px-1 ")}>
                            C.Qty
                          </Text>

                          {(color?.sizeList?.filter((j, jIndex) => jIndex <= 18)?.map((size, sizeIndex) => (

                            <View style={tw("flex bg bg-zinc-400")}>

                              <View style={tw(" bg bg-zinc-400")} >
                                <Text key={sizeIndex} style={tw("w-9 text-center  border-r")}>
                                  {size?.cuttingQty || 0}
                                </Text>
                              </View>
                            </View>


                          )))}
                        </View>
                      </View>







                      {/* SECOND SET */}




                      {
                        (color?.sizeList?.length > 19) &&
                        <>

                          <View style={tw("flex flex-col border-t border-x")} >

                            <View style={tw("flex flex-row w-full flex-wrap ")} >

                              <Text style={tw("w-12  flex-wrap border-r px-1 ")}>
                                Size
                              </Text>

                              {(color?.sizeList?.filter((j, jIndex) => (jIndex >= 19 && jIndex <= 37))?.map((size, sizeIndex) => (

                                <View style={tw("flex")}>

                                  <View style={tw(" ")} >
                                    <Text key={sizeIndex} style={tw("w-9 text-center border-r")}>
                                      {size?.sizeName}
                                    </Text>
                                  </View>
                                </View>


                              )))}
                            </View>
                          </View>

                          <View style={tw("flex flex-col border-t border-x")} >

                            <View style={tw("flex flex-row w-full flex-wrap ")} >

                              <Text style={tw("w-12  flex-wrap border-r px-1 ")}>
                                O.Qty
                              </Text>

                              {(color?.sizeList?.filter((j, jIndex) => (jIndex >= 19 && jIndex <= 37))?.map((size, sizeIndex) => (

                                <View style={tw("flex")}>

                                  <View style={tw(" ")} >
                                    <Text key={sizeIndex} style={tw("w-9 text-center  border-r")}>
                                      {size?.orderQty || 0}
                                    </Text>
                                  </View>
                                </View>


                              )))}
                            </View>
                          </View>


                          <View style={tw("flex flex-col border-t border-b border-x  ")} >

                            <View style={tw("flex flex-row w-full flex-wrap bg bg-zinc-400 ")} >

                              <Text style={tw("w-12  flex-wrap border-r px-1 ")}>
                                C.Qty
                              </Text>

                              {(color?.sizeList?.filter((j, jIndex) => (jIndex >= 19 && jIndex <= 37))?.map((size, sizeIndex) => (

                                <View style={tw("flex bg bg-zinc-400")}>

                                  <View style={tw("bg bg-zinc-400")} >
                                    <Text key={sizeIndex} style={tw("w-9 text-center border-r ")}>
                                      {size?.cuttingQty || 0}
                                    </Text>
                                  </View>
                                </View>


                              )))}
                            </View>
                          </View>
                        </>

                      }


                      {/* THIRD SET */}


                      {
                        color?.sizeList?.length > 38 &&
                        <>

                          <View style={tw("flex flex-col border-t border-x")} >

                            <View style={tw("flex flex-row w-full flex-wrap ")} >

                              <Text style={tw("w-12  flex-wrap border-r px-1 ")}>
                                Size
                              </Text>

                              {(color?.sizeList?.filter((j, jIndex) => jIndex >= 38)?.map((size, sizeIndex) => (

                                <View style={tw("flex")}>

                                  <View style={tw(" ")} >
                                    <Text key={sizeIndex} style={tw("w-9 text-center border-r")}>
                                      {size?.sizeName}
                                    </Text>
                                  </View>
                                </View>


                              )))}
                            </View>
                          </View>

                          <View style={tw("flex flex-col border-t border-x")} >

                            <View style={tw("flex flex-row w-full flex-wrap ")} >

                              <Text style={tw("w-12  flex-wrap border-r px-1 ")}>
                                O.Qty
                              </Text>

                              {(color?.sizeList?.filter((j, jIndex) => jIndex >= 38)?.map((size, sizeIndex) => (

                                <View style={tw("flex")}>

                                  <View style={tw(" ")} >
                                    <Text key={sizeIndex} style={tw("w-9 text-center  border-r")}>
                                      {size?.orderQty || 0}
                                    </Text>
                                  </View>
                                </View>


                              )))}
                            </View>
                          </View>


                          <View style={tw("flex flex-col border-t border-b border-x")} >

                            <View style={tw("flex flex-row w-full flex-wrap  bg bg-zinc-400")} >

                              <Text style={tw("w-12  flex-wrap border-r px-1 ")}>
                                C.Qty
                              </Text>

                              {(color?.sizeList?.filter((j, jIndex) => jIndex >= 38)?.map((size, sizeIndex) => (

                                <View style={tw("flex  bg bg-zinc-400")}>

                                  <View style={tw("bg bg-zinc-400")} >
                                    <Text key={sizeIndex} style={tw("w-9 text-center border-r ")}>
                                      {size?.cuttingQty || 0}
                                    </Text>
                                  </View>
                                </View>


                              )))}
                            </View>
                          </View>
                        </>

                      }




                    </View>





                  ))
                ))

              ))}

            </View>

            {/* {(singleData?.CuttingReceiptInwardDetails || []).map((item, index) => (
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
                    item?.orderQty,
                    item?.cuttingQty,
                    item?.alreadyReceivedQty || 0,
                    substract(item?.cuttingQty, item?.alreadyReceivedQty),
                    item?.receivedQty,

                  ]
                ).map((cell, i) => (
                  <Text wrap={true} break-words key={i} style={[styles.tableCell, tw("h-9 w-10 break-words")]} >{cell || "N/A"}</Text>
                ))}
              </View>
            ))}


            <View style={styles.totalRow}>
              {[...Array(singleData?.transType === "Accessory" ? 5 : 6)].map((_, i) => (
                <Text key={i} style={styles.totalCell}></Text>
              ))}

              <Text style={styles.totalCell}>Total Qty:</Text>

              <Text style={styles.totalCell}></Text>
              <Text style={styles.totalCell}>{getTotals("receivedQty").toFixed(3)}</Text>
            </View> */}





          </View>
        </View>
      </PageWrapper>
    </>
  )
}


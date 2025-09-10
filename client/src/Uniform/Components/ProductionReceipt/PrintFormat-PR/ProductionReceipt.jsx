import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import moment from 'moment';
// import numWords from 'num-words';
import logo from '../../../../assets/iknits.png'
import PageWrapper from '../../../../Utils/PageWrapper';
import tw from '../../../../Utils/tailwind-react-pdf';

export default  function  ProductionReceipt({ getTotals, singleData, styles, groupData,productionReceiptDetails,findFromList ,classList ,panelList ,itemList ,sizeList,id,
  getItemId,colorList,isStitching,substract,getReceivedQty}) {


    
    return (
        <>       
      
      
         <PageWrapper heading={"Production Receipt"} singleData={singleData} DeliveryNo={"Receipt.No :"} DeliveryDate={"Receipt.Date :"} >

                <View style={styles.container}>
               
                <View style={tw("flex gap-y-3")}>

          <View style={tw("flex flex-row justify-start w-full  ")} >
              <View style={tw("flex flex-row gap-x-2 w-1/3 -ml-1")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Receipt No : </Text>
                  <Text style={tw("text-xs")}>  {singleData?.docId || ""} </Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/3 ml-1")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Due Date :</Text>
                  <Text style={tw("text-xs")}>{moment(singleData?.dueDate).format("DD-MM-YYYY") || ""}</Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                      <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Location :</Text>
                      <Text style={tw("text-xs")}>{singleData?.Branch?.branchName}</Text>
              </View>
          </View>


          <View style={tw("flex flex-row  justify-start w-full ")} >
            
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Store :  </Text>
                  <Text style={tw("text-xs")}>{singleData?.Store?.storeName || 'N/A'}</Text>
              </View>
          
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold "), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Suplier Dc :</Text>
                  <Text style={tw("text-xs")}>{singleData?.supplierDc || 'N/A'} </Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Process :</Text>
                  <Text style={tw("text-xs")}>{singleData?.PrevProcess?.name} </Text>
              </View>


          </View>


          
          <View style={tw("flex flex-row  justify-start w-full  ")} >
      
          <View style={tw("flex flex-row gap-x-2 w-1/3")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Packing Type :</Text>
              <Text style={tw("text-xs")}>{singleData?.packingType} </Text>
          </View>
          <View style={tw("flex flex-row gap-x-2 w-1/3")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Category :</Text>
              <Text style={tw("text-xs")}>{singleData?.packingCategory } </Text>
          </View>
          <View style={tw("flex flex-row gap-x-2 w-1/3")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>ProcessCost :</Text>
              <Text style={tw("text-xs")}>{singleData?.packingType} </Text>
          </View>
      </View>
          <View style={tw("flex flex-row  justify-start w-full  ")} >
          
         
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}> Order :</Text>
                  <Text style={tw("text-xs")}>{singleData?.Order?.docId} </Text>
              </View>
              <View style={tw("flex flex-row gap-x-2 w-1/3")}>
                  <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>Suplier  :</Text>
                  <Text style={tw("text-xs")}>{singleData?.Supplier?.aliasName} </Text>
              </View>
          </View>

      </View>
        
                  <View style={styles.infoWrapper}>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.table}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}> 
                      {(singleData?.PrevProcess?.name === "PACKING"  &&  singleData?.packingType === "SET" &&  singleData?.packingCategory ===  "CLASSWISE"
                        ? 
                        [
                           "S.No",
                          "Class",
                          "Item",
                          "Size",
                          "TotalSet",
                          "Box"
                          
                        ]
                        : 
                         singleData?.PrevProcess?.name === "PACKING"  &&  singleData?.packingType === "INDIVIDUAL" &&  singleData?.packingCategory ===  "SIZEWISE"  ?  
                       
                       [
                        "S.NO",
                        "Size",
                        "Item",
                        "Color",
                        "Received Qty",
                         "Box"
                      ]

                      : 
                      singleData?.PrevProcess?.name === "PACKING"  &&  singleData?.packingType === "MIXED" &&  singleData?.packingCategory ===  "CLASSWISE"  ?  

                      [
                        "S.NO",
                        "Class/Item",
                        "Size",
                        "Totalset/Qty",
                        "Box"
                      ]
           
                      :
                      [
                        "S.NO",
                        "Item",
                        "Color",
                        "Size",
                        "Cut.Qty",
                        "Already Received Qty",
                        "Balance/R.To.Inward",
                          "Loss Qty",
                        "Received Qty",
                      ]
                    
                   
                      )?.map((header, index) => (
                        <Text key={index} style={styles.headerCell}>{header}</Text>
                      ))}
                    </View>
        
              
                    {(singleData?.packingType === "SET" || "INDIVIDUAL"  || "MIXED"  &&  singleData?.packingCategory ===  "CLASSWISE"  ||  "SIZEWISE"  ?  productionReceiptDetails : []
                    || [])?.map((item, index,self) => (
                      <View key={index} style={[styles.tableRow, index % 2 !== 0 && styles.tableRowOdd]}> 
                        {(singleData?.PrevProcess?.name === "PACKING"  &&  singleData?.packingType === "SET"   &&  singleData?.packingCategory ===  "CLASSWISE" 
                          ? [
                            parseInt(index) + 1,
                   
                                   
                          item?.items?.filter(
                              (obj, index, self) => index === self.findIndex((t) => t.classId === obj.classId)
                          )?.map((val, valIndex) => (
                              findFromList(val?.classId, classList?.data, "name")
                          )).join(","),
                                   



                        id ?
                          (item?.items?.filter(
                              (obj, index, self) => index === self.findIndex((t) => t.itemId === obj.itemId)
                          )?.map((val, valIndex) => (
                              findFromList(val?.itemId, itemList?.data, "name")
                          )).join(","))
                          :
                          (
                              (getItemId() || [])?.filter(
                                  (obj, index, self) => index === self.findIndex((t) => t.itemId == obj.itemId)
                              )?.map((val, valIndex) => (
                                  findFromList(val?.itemId, itemList?.data, "name")
                              )).join(",")),


                          item?.items?.filter(
                              (obj, index, self) => index === self.findIndex((t) => t.sizeId == obj.sizeId)
                          )?.map((val, valIndex) => (
                              findFromList(val?.sizeId, sizeList?.data, "name")
                          )).join(",")
                      ,



                      item?.items
                      ?.filter((obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId))
                      ?.reduce((accumulation, currentValue) => {
                        return accumulation + (parseFloat(currentValue?.receivedQty || 0)); 
                      }, 0),
                    
                 
                        item?.box,
            ]

                  : 
                  
                  singleData?.PrevProcess?.name === "PACKING"  &&  singleData?.packingType === "INDIVIDUAL" &&  singleData?.packingCategory ===  "SIZEWISE"  ?  
                  
                  [
                    parseInt(index) + 1,

                    item?.items?.filter(
                        (obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId)
                    )?.map((val, valIndex) => (
                        findFromList(val?.sizeId, sizeList?.data, "name")
                    )).join(",")
                  ,
                      
                      item?.items?.filter(
                        (obj, index, self) => index === self.findIndex((t) => t.itemId === obj.itemId)
                    )?.map((val, valIndex) => (
                        findFromList(val?.itemId, itemList?.data, "name")
                    )).join(",")
                    ,
                      item?.items?.filter(
                        (obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId)
                    )?.map((val, valIndex) => (
                        findFromList(val?.colorId, colorList?.data, "name")
                    )).join(",")
                    ,
                    
                    (item?.items || [])?.reduce((accumulation, currentValue) => {
                      return (parseFloat(accumulation) + parseFloat(currentValue?.receivedQty ? currentValue?.receivedQty : 0))
                     }, 0) ,
                     
                     (!item?.items[0]?.box) ? 0 : item?.items[0]?.box
                  ]

                  :
                  singleData?.PrevProcess?.name === "PACKING"  &&  singleData?.packingType === "MIXED" &&  singleData?.packingCategory ===  "CLASSWISE"  ?  


                  [
                    parseInt(index) + 1,

                   item?.items?.filter(
                        (obj, index, self) => index === self.findIndex((t) => t.classId === obj.classId)
                    )?.map((val, valIndex) => (
                        findFromList(val?.classId, classList?.data, "name")
                    )).join(",") || item?.items?.map((val, valIndex) => (
                        findFromList(val?.itemId, itemList?.data, "name")
                    )).join(",")

                    ,

                     item?.items?.filter(
                      (obj, index, self) => index === self.findIndex((t) => t.sizeId === obj.sizeId)
                  )?.map((val, valIndex) => (
                      findFromList(val?.sizeId, sizeList?.data, "name")
                  )).join(","),


                    id ? getReceivedQty(item) : (parseFloat(item?.items?.reduce((accumulation, currentValue) => {
                      return (parseFloat(accumulation) + parseFloat(currentValue?.maleInwardQty ? currentValue?.maleInwardQty : 0))
                  }, 0) || 0) + parseFloat(item?.items?.reduce((accumulation, currentValue) => {
                      return (parseFloat(accumulation) + parseFloat(currentValue?.femaleInwardQty ? currentValue?.femaleInwardQty : 0))
                  }, 0) || 0)) || item?.items?.reduce((accumulation, currentValue) => {
                      return (parseFloat(accumulation) + parseFloat(currentValue?.receivedQty ? currentValue?.receivedQty : 0))
                  }, 0)
                  ,

                  item?.box  



                  ]


                :

                  [ 
                         
                            parseInt(index) + 1,
                            item?.Item?.name,
                            item?.Color?.name,
                            item?.Size?.name,
                            item?.cuttingQty,
                            item?.alreadyReceivedQty,
                            isStitching() ? substract(item?.readyQty, item?.alreadyReceivedQty) : substract(item?.delQty, item?.alreadyReceivedQty) || 0,
                            item?.lossDetails[0],
                            item?.receivedQty,
                          
                    ]
                        
                  
                  
                         )?.map((cell, i) => (

                          <Text key={i} style={styles.tableCell}>{cell || "N/A"}</Text>

                        ))}

                      </View>
                    ))}



                    <View style={styles.totalRow}>
                      {[...Array(singleData?.transType === "Accessory" ? 5 : 2)].map((_, i) => (
                        <Text key={i} style={styles.totalCell}></Text>
                      ))}
        
                      <Text style={styles.totalCell}>Total:</Text>
        
                      <Text style={styles.totalCell}></Text>
                      {/* <Text style={styles.totalCell}></Text> */}
                      {/* <Text style={styles.totalCell}></Text> */}
                      {/* <Text style={styles.totalCell}></Text>
                      <Text style={styles.totalCell}></Text> */}
                      <Text style={styles.totalCell}>{getTotals("receivedQty").toFixed(3)}</Text>
                  
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


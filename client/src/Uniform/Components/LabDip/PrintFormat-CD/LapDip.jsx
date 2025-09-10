  import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import moment from 'moment';
// import numWords from 'num-words';
import logo from '../../../../assets/iknits.png'
import PageWrapper from '../../../../Utils/PageWrapper';
import tw from '../../../../Utils/tailwind-react-pdf';

export default  function  LapDip({ docId , styles, singleData,flattenedData }) {
console.log(flattenedData,"flattenedData" ,singleData)
    return (
        <>       
        
 {flattenedData.map((item, index) => (
  <PageWrapper
    key={index}
    heading={"Cutting Delivery"}
    singleData={item}
    DeliveryNo={"CuttingDelivry.No :"}
    DeliveryDate={"CuttingOrder.Date :"}
  >
    <View style={styles.container}>
        <View style={tw("flex flex-row gap-y-3 p-2 grid grid-cols-2 ")}>

          <View style={tw("flex flex-col justify-start w-full")}>
            <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>
                LabDip No       
              </Text>
               <Text style={[tw("ml-8")]}>:</Text> 
              <Text style={tw("text-xs")}> {docId || ""}</Text>
            </View>



             <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
                <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                  Garment Factory   
                </Text>
                <Text style={tw("text-xs")}>:</Text>
            </View>
     <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Submit Date           
              </Text>
              <Text style={tw("ml-6")}>:</Text> 
              <Text style={tw("text-xs")}> {new Date().toLocaleDateString('en-GB')}</Text>
            </View>
            <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Light Source        
              </Text>
                <Text style={tw("ml-6")}>:</Text> 
              <Text style={tw("text-xs")}></Text>
            </View>
     <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 900, fontFamily: "Times-Bold" }]}>
                Remarks                  
              </Text>
              <Text style={tw("ml-11")}>:</Text>
            </View>

            <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Buyer Comments   
              </Text>
              <Text style={tw("")}>:</Text> 
            </View>
          
          

            <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Fabric Content       
              </Text>
              <Text style={tw("ml-3")}>:</Text> 
            </View>

            <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Description        
              </Text>
                <Text style={tw("ml-8")}>:</Text>   
            </View>
          </View>

          <View style={tw("flex flex-col justify-start w-full")}>

              <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Po Number    
              </Text>
               <Text style={tw("ml-2")}>:</Text>  
              <Text style={tw("text-xs")}>{item?.poNumber || ""}</Text>
            </View>
            <View style={tw("flex flex-row gap-x-2  ml-1 p-2")}>
          <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
            Customer      
          </Text>
          <Text style={tw("ml-4")}>:</Text> 
          <Text style={tw("text-xs")}
          >
            {singleData?.customer?.name || ""}
          </Text>
        </View>
       

            <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Item           
              </Text>
              <Text style={tw("ml-11")}>:</Text> 
            </View>

         <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Type 
              </Text>
              <Text style={tw("ml-11")}>:</Text>  
              <Text style={tw("text-xs")}>{item?.fabType || ""}</Text>
            </View>


            <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Season    
              </Text>
              <Text style={tw("ml-9")}>:</Text>  
            </View>

            <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Attn          
              </Text>
           <Text style={tw("ml-12")}>:</Text>         
                   </View>

            <View style={tw("flex flex-row gap-x-2 w-1/2 ml-1 p-2")}>
              <Text style={[tw("text-xs font-bold"), { fontWeight: 400, fontFamily: "Times-Bold" }]}>
                Colour Name  
              </Text>
               <Text style={tw("ml-1")}>:</Text> 
              <Text style={tw("text-xs")}>{item?.color || ""}</Text>
            </View>

          
          </View>
        </View>
    </View>

<View style={tw("flex flex-row flex-wrap p-2 ")}>
  <View style={tw("w-1/2 p-1")}>
    <View style={tw("h-[200px] border border-orange-500")}>
      <View style={tw("flex items-start border-b border-orange-500 px-2 py-1")}>
        <Text style={tw("text-xs text-gray-700")}>L/D No :</Text>
      </View>
    </View>
  </View>

  <View style={tw("w-1/2 p-1")}>
    <View style={tw("h-[200px] border border-orange-500")}>
      <View style={tw("flex items-start border-b border-orange-500 px-2 py-1")}>
        <Text style={tw("text-xs text-gray-700")}>L/D No :</Text>
      </View>
    </View>
  </View>

  <View style={tw("w-1/2 p-1")}>
    <View style={tw("h-[200px] border border-orange-500")}>
      <View style={tw("flex items-start border-b border-orange-500 px-2 py-1")}>
        <Text style={tw("text-xs text-gray-700")}>L/D No :</Text>
      </View>
    </View>
  </View>

  <View style={tw("w-1/2 p-1")}>
    <View style={tw("h-[200px] border border-orange-500")}>
      <View style={tw("flex items-start border-b border-orange-500 px-2 py-1")}>
        <Text style={tw("text-xs text-gray-700")}>L/D No :</Text>
      </View>
    </View>
  </View>
</View>


       






          



   

  </PageWrapper>
))}


        </>
    )
}


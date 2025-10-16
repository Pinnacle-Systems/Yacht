import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path,
} from "@react-pdf/renderer";
import moment from "moment";
// import numWords from 'num-words';
import logo from "../../../../assets/iknits.png";
import PageWrapper from "../../../../Utils/PageWrapper";
import tw from "../../../../Utils/tailwind-react-pdf";
import FactoryAddress from "../../../../Utils/FactoryAddress";
import { getImageUrlPath } from "../../../../Constants";
import { useEffect } from "react";

export default function PrintDetails({
  singleData,
  allData,
}) {

  console.log(allData, "allData", singleData);

useEffect(() => {
 console.log("Fetched",singleData)
}, [singleData])


  const newstyle = StyleSheet.create({
    section: {
      marginBottom: 12,
      marginTop: 12,
      marginLeft: 15,
    },
    heading: {
      fontSize: 12,
      marginBottom: 6,
      textAlign: "left",
      textTransform: "uppercase",
      fontWeight: "bold",
    },
    row: {
      flexDirection: "row",
      marginBottom: 4,
    },
    label: {
      width: "40%",
      fontWeight: "bold",
    },
    value: {
      width: "60%",
    },
  });

  const data = singleData || {};

  const renderRow = (label, value) => (
    <View style={newstyle.row} key={label}>
      <Text style={newstyle.label}>{label}:</Text>
      <Text style={newstyle.value}>{value || "-"}</Text>
    </View>
  );
  return (
    <>
      <PageWrapper
        heading={"Sales Delivery"}
        DeliveryNo={"SalesDelivry.No :"}
        DeliveryDate={"SalesDelivery.Date :"}
        value={"true"}
      >
        {/* Basic Information */}
        <View style={newstyle.section}>
          <Text
            style={[
              tw("text-lg font-bold"),
              { fontWeight: 900, fontFamily: "Times-Bold" },
            ]}
          >
            Basic Information
          </Text>
          {renderRow("Sales Date", moment(data?.docDate).format("YYYY-MM-DD"))}

          {/* {renderRow("Customer Material Code", data?.materialCode)}
          {renderRow("Fab Code", data?.fabCode)}
          {renderRow("Fab Type", data?.fabType)}
          {renderRow("Country Of Origin (Fabric)", data?.countryOriginFabric)}
          {renderRow("Country Of Origin (Yarn)", data?.countryOriginYarn)}
          {renderRow("Country Of Origin (Fiber)", data?.countryOriginFiber)} */}
        </View>

      
      </PageWrapper>
    
    </>
  );
}

  // {/* Capacity / Lead Times */}
  //       <View style={newstyle.section}>
  //         <Text
  //           style={[
  //             tw("text-lg font-bold"),
  //             { fontWeight: 900, fontFamily: "Times-Bold" },
  //           ]}
  //         >
  //           Capacity / Lead Times
  //         </Text>
  //         {renderRow("SMS MOQ", data?.smsMoq)}
  //         {renderRow("SMS MCQ", data?.smsMcq)}
          
  //         {renderRow("SMS Lead Time", data?.smsLeadTime)}
  //         {renderRow("BULK MOQ", data?.bulkMoq)}
  //         {renderRow("BULK MCQ", data?.bulkMcq)}


  //         {renderRow("BULK Lead Time", data?.bulkLeadTime)}
  //       </View>

  //       {/* Construction Details */}
  //       <View style={newstyle.section}>
  //         <Text
  //           style={[
  //             tw("text-lg font-bold"),
  //             { fontWeight: 900, fontFamily: "Times-Bold" },
  //           ]}
  //         >
  //           Construction Details
  //         </Text>
  //         {renderRow("Construction", data?.construction)}
  //         {renderRow("Fiber Content", data?.fiberContent)}
  //         {renderRow("Yarn Details", data?.yarnDetails)}
  //         {renderRow("Weight (GSM)", data?.weightGSM)}

  //         {renderRow("Width", data?.widthFinished)}
  //         {/* {renderRow("Width (Cuttable)", data?.widthCuttale)} */}
  //         {renderRow("Weft/Wales Count", data?.weftWalesCount)}
  //         {renderRow("Warp/Count", data?.wrapCoursesCount)}
  //       </View>

  //       {/* Process Finishing */}
  //       <View style={newstyle.section}>
  //         <Text
  //           style={[
  //             tw("text-lg font-bold"),
  //             { fontWeight: 900, fontFamily: "Times-Bold" },
  //           ]}
  //         >
  //           Process Finishing
  //         </Text>
  //         {renderRow("Dye Name", data?.dyeName)}
  //         {renderRow("Dyed Method", data?.dyedMethod)}
  //         {renderRow("Printing Method", data?.printingMethod)}
  //         {renderRow("Surface Finish", data?.surfaceFinish)}
  //         {renderRow(
  //           "Other Performance Function",
  //           data?.otherPerformanceFunction
  //         )}
  //       </View>
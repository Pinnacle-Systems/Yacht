import { Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import tw from "./tailwind-react-pdf";
import logo from "../assets/yacht.jpeg";


import { getImageUrlPath } from "../helper";
import moment from "moment";

const Header = ({ heading, singleData, DeliveryNo, DeliveryDate, styles }) => {
  return (
    <>
      <View
        style={tw(
          "flex flex-row   justify-between w-full h-[80px]  border-b border-teal-800"
        )}
      >
        <View style={tw("")}>
          <Image style={tw("h-12 w-auto mt-5")} src={logo} />
        </View>
        <View style={tw("mt-4")}>
          <Text style={tw(" mx-auto text-lg text-black")}>
            YACHT WOMENS
          </Text>
          <Text style={tw("mx-auto  text-xs ")}>No.24/47, RSR Complex,</Text>
          <Text style={tw("mx-auto  text-xs p-1 ")}>
            Bridge Way Colony, Extn Main Road,
          </Text>
     
          <Text style={tw("mx-auto  text-xs")}>
            TIRUPUR - 641 607.
          </Text>
        </View>
        <View style={tw("flex flex-col mr-4 text-xl mt-5  item-center ")}>
          {/* <Text style={tw("text-teal-500")}>{heading}</Text> */}

          <Text style={tw("text-xs")}> {singleData?.docId || ""} </Text>
          {console.log(singleData?.docId,"docId")}
          
          <Text style={tw("text-xs ml-0.5 mt-2")}>
            {moment(singleData?.date).format("DD-MM-YYYY") || ""}
          </Text>
        </View>
      </View>
    </>
  );
};

export default Header;

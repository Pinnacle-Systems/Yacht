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
          "flex flex-row px-2 items-center justify-between w-full h-[80px] mb-2  border-b border-gray-400"
        )}
      >
        <View style={tw("w-[25%]")}>
          <Image style={tw("h-12")} src={logo} />
        </View>
        <View style={tw(" w-[50%]")}>
          <Text style={tw(" mx-auto text-lg text-black")}>
            YACHT 
          </Text>
          <Text style={tw("mx-auto  text-xs ")}>No.24/47, RSR Complex,</Text>
          <Text style={tw("mx-auto  text-xs p-1 ")}>
            Bridge Way Colony, Extn Main Road,
          </Text>
     
          <Text style={tw("mx-auto  text-xs")}>
            TIRUPUR - 641 607.
          </Text>
        </View>
        <View style={tw("flex flex-col  text-xl   item-center w-[25%]")}>
          {/* <Text style={tw("text-teal-500")}>{heading}</Text> */}

          <Text style={tw("text-xs ml-1 text-right")}>{singleData?.docId || ""}</Text>
          {console.log(singleData?.docId,"docId")}
          
          <Text style={tw("text-xs ml-1 text-right mt-2")}>{moment(singleData?.date).format("DD-MM-YYYY") || ""}</Text>
        </View>
      </View>
    </>
  );
};

export default Header;

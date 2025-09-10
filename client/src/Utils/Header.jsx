import { Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import tw from "./tailwind-react-pdf";
import logo from "../assets/Eunoia-logo.jpeg";


import { getImageUrlPath } from "../helper";
import moment from "moment";

const Header = ({ heading, singleData, DeliveryNo, DeliveryDate, styles }) => {
  return (
    <>
      <View
        style={tw(
          "flex flex-row  gap-x-12  justify-between    w-full h-[80px]  border-b border-teal-800 "
        )}
      >
        <View style={tw("")}>
          <Image style={tw("h-12 w-32 mt-5")} src={logo} />
        </View>

        {/* <View
          style={tw(
            "flex flex-row text-xl    mt-1 item-center ml-[90px]  mt-[35px] text-teal-500 "
          )}
        >
          <Text  >{heading}</Text>
        </View> */}
        <View style={tw("mt-4")}>
          <Text style={tw(" ml-[55px]  text-lg text-black")}>
            EUNOIA TEXTILES
          </Text>
          <Text style={tw("ml-[75px]  text-xs")}>Unit 04-05, 16th Floor, </Text>
          <Text style={tw("ml-[35px]  text-xs p-1 ")}>
            The BroadWay Number 54-62 LockHard Road,
          </Text>
     
          <Text style={tw(" ml-[65px]  text-xs")}>
            WAN CHAI HONGKONG.
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

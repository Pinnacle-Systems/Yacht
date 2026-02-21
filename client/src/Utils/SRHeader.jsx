import { Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import tw from "./tailwind-react-pdf";
import logo from "../assets/yacht.jpeg";

import moment from "moment";

const SRHeader = ({ heading, singleDataDoc, DeliveryNo, DeliveryDate, styles, singleData, showDate = true }) => {
    return (
        <>
            <View
                style={[
                    tw("flex flex-row px-2 items-center justify-between w-full h-[80px] border-b"),
                    { borderColor: "#411354" }
                ]}
            >
                <View style={tw("w-[25%]")}>
                    <Image style={tw("h-12")} src={logo} />
                </View>
                <View style={tw(" w-[50%] item-center")}>
                    <Text style={tw(" mx-auto text-2xl font-bold text-purple-900")}>
                        YACHT
                    </Text>
                    {
                        showDate && (
                            <Text style={tw("text-xs  text-right mt-2")}>{moment(singleDataDoc?.date).format("DD-MM-YYYY") || ""}</Text>

                        )
                    }

                </View>
                <View style={tw("flex flex-col  text-xl   item-center w-[25%]")}>
                    <Text style={tw("mx-auto  text-xs ")}>{singleData?.data?.address}</Text>


                </View>
            </View>
        </>
    );
};

export default SRHeader;

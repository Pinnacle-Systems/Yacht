import { Document, StyleSheet, Text, View } from "@react-pdf/renderer";
import { useEffect } from "react";
import PageWrapper from "../../../../Utils/PageWrapper";
import tw from "../../../../Utils/tailwind-react-pdf";
import Header from "../../../../Utils/Header";
import { findFromList } from "../../../../Utils/helper";

const PDF = ({ singleData, branchList }) => {
    const styles = StyleSheet.create({
        page: { padding: 5 },

        bold: {
            fontWeight: "bold",
            fontSize: 14,
        },
        bold: {
            fontWeight: "bold",
            color: "#333",
            marginRight: 4,
        },
        container: {
            width: "100%",
            // padding: 5,
            // paddingHorizontal:5
        },
        totalRow: {
            flexDirection: "row",
            backgroundColor: "#bfdbfe",
            padding: 5,
            fontWeight: "bold",
        },
        bold: {
            fontWeight: "bold",
        },
        divider: {
            borderBottomWidth: 1,
            borderBottomColor: "#9ca3af",
            marginVertical: 4,
        },

        footer: {
            marginTop: 10,
            borderTopWidth: 1,
            borderTopColor: "#016B65",
            paddingTop: 10,
            alignItems: "center",
        },
        table: {
            display: "table",
            marginTop: 10,
            borderCollapse: "collapse",
            borderLeftWidth: 0,
            borderRightWidth: 0,
        },
        tableHeader: {
            flexDirection: "row",
            backgroundColor: "#F3F4F6",
            borderTopWidth: 1,
            borderTopColor: "#D1D5DB",
            borderBottomWidth: 1,
            borderBottomColor: "#D1D5DB",
            fontWeight: "bold",
            color: "black",
            textAlign: "center",
            fontSize: 7,
            borderLeftWidth: 1,
            borderLeftStyle: "solid",
            borderColor: "#D1D5DB",
        },
        headerCell: {
            flex: 1,
            padding: 4,
            fontSize: 7,
            textAlign: "center",
            fontWeight: "bold",
            borderRightWidth: 1,
            borderRightColor: "#D1D5DB",
            paddingTop: 4,
        },
        tableRow: {
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#D1D5DB",
            textAlign: "left",
            borderLeftWidth: 1,
            borderLeftStyle: "solid",
            borderColor: "#D1D5DB",
        },
        tableCell: {
            padding: 4,
            fontSize: 7,
            paddingTop: "5px",
            borderRightWidth: 1,
            borderRightColor: "#D1D5DB",
            // border:"1 solid black"
        },
        totalRow: {
            flexDirection: "row",
            backgroundColor: "#E5E7EB",
            fontWeight: "bold",
        },
        lastColumn: {
            borderRightWidth: 0, // Remove right border for the last column
        },
    });
    useEffect(() => {
        console.log("Single Data Fetched", singleData)
    }, [singleData])

    return (
        <Document>
            <PageWrapper heading={"Sales Delivery"} singleData={singleData} header={false}>
                <View style={tw("")}>
                    <Header styles={styles} />
                </View>
                <View style={styles.container}>
                    <Text style={tw("mx-auto   text-base text-black mt-1")}>Purchase Inward</Text>

                    {/* non grid  */}

                    <View style={[tw("flex flex-row justify-between w-full  p-2")]}>
                        {/* left column */}
                        <View style={tw("flex flex-col w-1/2 gap-y-2")}>
                            <Text
                                style={[
                                    tw("font-bold"),
                                    { fontWeight: 900, fontFamily: "Times-Bold" },
                                ]}
                            >
                                Basic Details
                            </Text>
                            <View style={tw("flex flex-row gap-x-2")}>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        { fontWeight: 900, fontFamily: "Times-Bold" },
                                    ]}
                                >
                                    Inward No
                                </Text>
                                <Text
                                    style={[
                                        tw("text-xs font-bold "),
                                        {
                                            fontWeight: 900,
                                            fontFamily: "Times-Bold",
                                            marginLeft: 7,
                                        },
                                    ]}
                                >
                                    :
                                </Text>
                                <Text style={tw("text-xs ml-2")}>
                                    {singleData?.docId || ""}
                                </Text>
                            </View>
                            <View style={tw("flex flex-row gap-x-2")}>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        { fontWeight: 900, fontFamily: "Times-Bold" },
                                    ]}
                                >
                                    Inward Date
                                </Text>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        {
                                            fontWeight: 900,
                                            fontFamily: "Times-Bold",
                                            marginLeft: 0,
                                        },
                                    ]}
                                >
                                    :
                                </Text>
                                <Text style={tw("text-xs ml-2")}>
                                    {singleData?.docDate
                                        ? new Date(singleData.docDate).toLocaleDateString()
                                        : ""}
                                </Text>
                            </View>
                            <View style={tw("flex flex-row gap-x-2")}>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        { fontWeight: 900, fontFamily: "Times-Bold" },
                                    ]}
                                >
                                    Location
                                </Text>
                                <Text
                                    style={[
                                        tw("text-xs font-bold "),
                                        {
                                            fontWeight: 900,
                                            fontFamily: "Times-Bold",
                                            marginLeft: 15,
                                        },
                                    ]}
                                >
                                    :
                                </Text>
                                <Text style={tw("text-xs ml-2")}>
                                    {singleData?.Branch?.branchName || ""}
                                    {findFromList(singleData?.locationId, branchList?.data, "name")}
                                </Text>
                            </View>
                            <View style={tw("flex flex-row gap-x-2")}>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        { fontWeight: 900, fontFamily: "Times-Bold" },
                                    ]}
                                >
                                    Store
                                </Text>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        {
                                            fontWeight: 900,
                                            fontFamily: "Times-Bold",
                                            marginLeft: 29,
                                        },
                                    ]}
                                >
                                    :
                                </Text>
                                <Text style={tw("text-xs ml-2")}>
                                    {singleData?.Store?.storeName || ""}
                                </Text>
                            </View>
                        </View>

                        {/* Right Column */}

                        <View style={tw("flex flex-col w-1/2 gap-y-2")}>
                            <Text
                                style={[
                                    tw("font-bold"),
                                    { fontWeight: 900, fontFamily: "Times-Bold" },
                                ]}
                            >
                                Supplier Details
                            </Text>
                            {/* Customer Name */}
                            <View style={tw("flex flex-row gap-x-2")}>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        { fontWeight: 900, fontFamily: "Times-Bold" },
                                    ]}
                                >
                                    Supplier Name
                                </Text>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        {
                                            fontWeight: 900,
                                            fontFamily: "Times-Bold",
                                            marginLeft: 1,
                                        },
                                    ]}
                                >
                                    :
                                </Text>
                                <Text style={tw("text-xs ml-1")}>
                                    {" "}
                                    {singleData?.Supplier?.name
                                        ? singleData.Supplier.name
                                            .toLowerCase()
                                            .replace(/\b\w/g, (char) => char.toUpperCase())
                                        : ""}
                                </Text>
                            </View>
                            {/*Customer Phone No */}
                            <View style={tw("flex flex-row gap-x-2")}>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        { fontWeight: 900, fontFamily: "Times-Bold" },
                                    ]}
                                >
                                    DC No
                                </Text>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        {
                                            fontWeight: 900,
                                            fontFamily: "Times-Bold",
                                            marginLeft: 32,
                                        },
                                    ]}
                                >
                                    :
                                </Text>
                                <Text style={tw("text-xs ml-2")}>
                                    {singleData?.dcNo || ""}
                                </Text>
                            </View>
                            {/*Customer Address */}
                            <View style={tw("flex flex-row gap-x-2")}>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        { fontWeight: 900, fontFamily: "Times-Bold" },
                                    ]}
                                >
                                    DC Date
                                </Text>
                                <Text
                                    style={[
                                        tw("text-xs font-bold "),
                                        {
                                            fontWeight: 900,
                                            fontFamily: "Times-Bold",
                                            marginLeft: 25,
                                        },
                                    ]}
                                >
                                    :
                                </Text>
                                <Text style={tw("text-xs ml-2")}>
                                    {singleData?.dcDate
                                        ? new Date(singleData.dcDate).toLocaleDateString()
                                        : ""}
                                </Text>
                            </View>
                            <View style={tw("flex flex-row gap-x-2")}>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        { fontWeight: 900, fontFamily: "Times-Bold" },
                                    ]}
                                >
                                    Vehicle No
                                </Text>
                                <Text
                                    style={[
                                        tw("text-xs font-bold "),
                                        {
                                            fontWeight: 900,
                                            fontFamily: "Times-Bold",
                                            marginLeft: 18,
                                        },
                                    ]}
                                >
                                    :
                                </Text>
                                <Text style={tw("text-xs ml-2")}>
                                    {singleData?.vehicleNo || ""}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />
                    <View style={{ height: 10 }} fixed />
                    <View style={[styles.table]}>
                        {/* Table Header */}
                        {
                            singleData?.inwardType === "Fabric" && (

                                <View fixed style={styles.tableHeader}>
                                    {[
                                        { label: "S.No", flex: 0.5 },
                                        { label: "Style No", flex: 0.8 },
                                        { label: "Style", flex: 2.5 },
                                        { label: "Fabric", flex: 2 },
                                        { label: "Color", flex: 2 },
                                        { label: "Width ", flex: 0.8 },
                                        { label: "Meter", flex: 0.8 },
                                        { label: "No Of Rolls", flex: 1 },
                                    ].map((header, index) => (
                                        <Text
                                            key={index}
                                            style={[
                                                styles.headerCell,
                                                {
                                                    flex: header.flex,
                                                    textAlign: "center",
                                                    fontSize: 8,
                                                    fontWeight: "bold",
                                                },
                                                index === header.length - 1 && styles.lastColumn,
                                            ]}
                                        >
                                            {header.label}
                                        </Text>
                                    ))}
                                </View>
                            )
                        }
                        {
                            singleData?.inwardType === "Accessory" && (

                                <View fixed style={styles.tableHeader}>
                                    {[
                                        { label: "S.No", flex: 0.5 },
                                        { label: "Accessory Name", flex: 2.5 },
                                        { label: "Accessory Group Name", flex: 2.5 },
                                        { label: "Color", flex: 2 },
                                        { label: "Size", flex: 1 },
                                        { label: "Uom ", flex: 1 },
                                        { label: "Quantity", flex: 1 },
                                    ].map((header, index) => (
                                        <Text
                                            key={index}
                                            style={[
                                                styles.headerCell,
                                                {
                                                    flex: header.flex,
                                                    textAlign: "center",
                                                    fontSize: 8,
                                                    fontWeight: "bold",
                                                },
                                                index === header.length - 1 && styles.lastColumn,
                                            ]}
                                        >
                                            {header.label}
                                        </Text>
                                    ))}
                                </View>
                            )
                        }
                        {/*  Grouped Rows */}

                        {(singleData?.fabricInwardItems || []).map((item, index) => {
                            const gross = item.price * item.qty;
                            return (
                                <View
                                    key={index}
                                    wrap={false}
                                    style={{
                                        flexDirection: "row",
                                        width: "100%",
                                        borderBottomWidth: 1,
                                        borderBottomColor: "#D1D5DB",
                                        borderLeftColor: "#D1D5DB",
                                        borderLeftWidth: 1
                                    }}
                                >
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "center" }]}>
                                        {index + 1}
                                    </Text>
                                    {
                                        singleData?.inwardType === "Fabric" && (
                                            <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7 }]}>
                                                {item?.styleNo || ""}
                                            </Text>
                                        )

                                    }
                                    {
                                        singleData?.inwardType === "Fabric" && (

                                            <Text style={[styles.tableCell, { flex: 2.5, fontSize: 7 }]}>
                                                {item?.StyleItem?.name || ""}
                                            </Text>
                                        )}
                                    {
                                        singleData?.inwardType === "Fabric" && (

                                            <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                                {item?.Fabric?.name || ""}
                                            </Text>
                                        )}
                                    {
                                        singleData?.inwardType === "Accessory" && (

                                            <Text style={[styles.tableCell, { flex: 2.5, fontSize: 7 }]}>
                                                {item?.Accessory?.name || ""}
                                            </Text>
                                        )}
                                    {
                                        singleData?.inwardType === "Accessory" && (

                                            <Text style={[styles.tableCell, { flex: 2.5, fontSize: 7 }]}>
                                                {item?.AccessoryGroup?.name || ""}
                                            </Text>
                                        )}
                                    {
                                        singleData?.inwardType === "Fabric" && (

                                            <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                                {item?.Color?.name || ""}
                                            </Text>
                                        )}
                                    {
                                        singleData?.inwardType === "Accessory" && (

                                            <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                                {item?.Color?.name || ""}
                                            </Text>
                                        )}

                                    {
                                        singleData?.inwardType === "Accessory" && (

                                            <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                                {item?.Size?.name || ""}
                                            </Text>
                                        )}
                                    {
                                        singleData?.inwardType === "Accessory" && (

                                            <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                                {item?.Uom?.name || ""}
                                            </Text>
                                        )}
                                    {
                                        singleData?.inwardType === "Accessory" && (

                                            <Text style={[styles.tableCell, { flex: 1, fontSize: 7, textAlign: "right" }]}>
                                                {item?.qty || ""}
                                            </Text>
                                        )}
                                    {
                                        singleData?.inwardType === "Fabric" && (

                                            <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7, textAlign: "right" }]}>
                                                {item?.fabWidth || ""}
                                            </Text>
                                        )}
                                    {
                                        singleData?.inwardType === "Fabric" && (

                                            <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7, textAlign: "right" }]}>
                                                {item?.fabMeter || ""}
                                            </Text>
                                        )}
                                    {
                                        singleData?.inwardType === "Fabric" && (

                                            <Text style={[styles.tableCell, { flex: 1, fontSize: 7, textAlign: "right" }]}>
                                                {item?.noOfPcs || 0}
                                            </Text>
                                        )}
                                </View>
                            );
                        })}
                        {
                            singleData?.inwardType === "Fabric" && (

                                <View style={{
                                    flexDirection: "row",
                                    width: "100%",
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#D1D5DB",
                                    borderLeftColor: "#D1D5DB",
                                    borderLeftWidth: 1
                                }}>
                                    <Text
                                        style={[
                                            styles.headerCell,
                                            {
                                                flex: 9.6,
                                                // backgroundColor: "white", borderLeftWidth: 1,
                                                // borderLeftStyle: "solid",
                                                // borderColor: "#D1D5DB", borderBottomWidth: 1,
                                                // borderBottomStyle: "solid",
                                                fontSize: 8,
                                                textAlign: "right",
                                            },
                                        ]}
                                    >
                                        Total
                                    </Text>
                                    <Text style={[styles.headerCell, { flex: 0.8, fontSize: 8, textAlign: "right" }]}>
                                        {singleData?.fabricInwardItems?.reduce((sum, row) => sum + row.fabMeter, 0)}
                                    </Text>
                                    <Text style={[styles.headerCell, { flex: 1, fontSize: 8, textAlign: "right" }]}>
                                        {singleData?.fabricInwardItems?.reduce((sum, row) => sum + row.noOfPcs, 0)}
                                    </Text>
                                </View>
                            )}
                        {
                            singleData?.inwardType === "Accessory" && (


                                <View style={{
                                    flexDirection: "row",
                                    width: "100%",
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#D1D5DB",
                                    borderLeftColor: "#D1D5DB",
                                    borderLeftWidth: 1
                                }}>
                                    <Text
                                        style={[
                                            styles.headerCell,
                                            {
                                                flex: 9.5,
                                                // backgroundColor: "white", borderLeftWidth: 1,
                                                // borderLeftStyle: "solid",
                                                // borderColor: "#D1D5DB", borderBottomWidth: 1,
                                                // borderBottomStyle: "solid",
                                                fontSize: 8,
                                                textAlign: "right",
                                            },
                                        ]}
                                    >
                                        Total
                                    </Text>
                                    <Text style={[styles.headerCell, { flex: 1, fontSize: 8, textAlign: "right" }]}>
                                        {singleData?.fabricInwardItems?.reduce((sum, row) => sum + row.qty, 0)}
                                    </Text>
                                </View>
                            )}


                    </View>

                </View>
            </PageWrapper>
        </Document>
    );
};

export default PDF;

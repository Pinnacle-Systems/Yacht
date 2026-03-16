import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { useEffect } from "react";
import tw from "../../../../Utils/tailwind-react-pdf";
import { findFromList } from "../../../../Utils/helper";
import Header from "../../../../Utils/Header";
import SRPageWrapper from "../../../../Utils/SRPageWrapper";
import SRHeader from "../../../../Utils/SRHeader";
import { groupBy } from "lodash";


const PDF = ({ singleData, styleItemList, sizeList, colorList, singleDataBranch, salesReturnItems, styleList, branchList }) => {
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
            paddingBottom: 80,
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
            // width: "auto",
            //   borderStyle: "solid",
            //   borderWidth: 1,
            //   borderColor: "#D1D5DB",
            // borderTopWidth: 1,
            // borderTopStyle: "solid",
            // borderTopColor: "#D1D5DB",
            // paddingHorizontal: 1,
            borderCollapse: "collapse",
            marginBottom: 20,
            borderLeftWidth: 0,
            borderRightWidth: 0,
        },
        tableHeader: {
            flexDirection: "row",
            backgroundColor: "#411354",   // Dark purple background
            borderTopWidth: 1,
            borderTopColor: "#411354",
            borderBottomWidth: 1,
            borderBottomColor: "#411354",
            textAlign: "center",
            fontSize: 7,
            borderLeftWidth: 1,
            borderColor: "#411354",
            alignItems: "center"
        },
        headerCell: {
            flex: 1,
            padding: 4,
            fontSize: 8,
            textAlign: "center",
            fontWeight: "bold",
            color: "#FFFFFF",            // 👈 white text
            borderRightWidth: 1,
            borderRightColor: "#411354", // 👈 purple border
        },
        tableRow: {
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#D1D5DB",
            textAlign: "left",
            // borderLeftWidth: 1,
            // borderLeftStyle: "solid",
            borderColor: "#D1D5DB",
        },
        tableCell: {
            padding: 4,
            fontSize: 7,
            paddingTop: "5px",
            borderRightWidth: 1,
            borderRightColor: "#D8B4FE",
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
        summaryBox: {
            borderWidth: 1,
            borderColor: "#9CA3AF",
            borderRadius: 4,
            padding: 8,
            marginTop: 8,
        },

        summaryTitle: {
            position: "absolute",
            top: -8,
            left: 10,
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 4,
            fontSize: 9,
            fontWeight: "bold",
            color: "#374151",
        },

        summaryRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginVertical: 2,
        },

        summaryLabel: {
            fontSize: 8,
            color: "#374151",
        },

        summaryValue: {
            fontSize: 8,
            fontWeight: "bold",
            textAlign: "right",
        },
        customTitle: {
            textAlign: "center",
            fontSize: 14,
            color: "#FFFFFF",
            backgroundColor: "#411354", // purple-700
            paddingVertical: 3,
            fontWeight: "600",
        },
    });

    return (
        <Document>
            <SRPageWrapper heading={"Sales Delivery"} singleData={singleData} header={false}>
                <View>
                    <SRHeader styles={styles} showDate={false} singleData={singleDataBranch} />
                </View>

                <View>
                    <Text style={styles.customTitle}>Sales Return</Text>

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
                                    Sales Return No
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
                                    Sales Return Date
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
                                <Text style={tw("text-xs ml-2")}>
                                    {singleData?.docDate
                                        ? new Date(singleData.docDate).toLocaleDateString()
                                        : ""}
                                </Text>
                            </View>
                        </View>

                        <View style={tw("flex flex-col w-1/2 gap-y-2")}>
                            <Text
                                style={[
                                    tw("font-bold"),
                                    { fontWeight: 900, fontFamily: "Times-Bold" },
                                ]}
                            >
                                Bill Details
                            </Text>
                            <View style={tw("flex flex-row gap-x-2")}>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        { fontWeight: 900, fontFamily: "Times-Bold" },
                                    ]}
                                >
                                    Return Type
                                </Text>
                                <Text
                                    style={[
                                        tw("text-xs font-bold"),
                                        {
                                            fontWeight: 900,
                                            fontFamily: "Times-Bold",
                                            marginLeft: 3,
                                        },
                                    ]}
                                >
                                    :
                                </Text>
                                <Text style={tw("text-xs ml-1")}>
                                    {singleData?.returnType}
                                </Text>
                            </View>
                            
                        </View>
                    </View>

                    <View style={{ height: 1 }} fixed />
                    <View style={[styles.table]}>
                        {/* Table Header */}
                        <View fixed style={styles.tableHeader}>
                            {[
                                { label: "S.No", flex: 0.5 },
                                { label: "Barcode No", flex: 1.8 },
                                { label: "Bill No", flex: 1.8 },
                                { label: "Customer", flex: 2 },
                                { label: "Style Item", flex: 2 },
                                { label: "Size", flex: 0.8 },
                                { label: "Color", flex: 2 },
                                { label: "Qty", flex: 0.8 },
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
                        {/*  Grouped Rows */}

                        {(salesReturnItems || []).slice().sort((a, b) =>
                            String(a?.Style?.sku ?? "").localeCompare(String(b?.Style?.sku ?? ""), undefined, {
                                numeric: true,
                                sensitivity: "base",
                            })).filter((item) => item.barcodeId).map((item, index) => {
                                const isEven = index % 2 === 0;
                                return (
                                    <View
                                        key={index}

                                        style={{
                                            flexDirection: "row",
                                            width: "100%",
                                            borderBottomWidth: 1,
                                            borderBottomColor: "#D8B4FE",
                                            borderLeftColor: "#D8B4FE",
                                            backgroundColor: isEven ? "#FAF5FF" : "#FFFFFF",
                                            borderLeftWidth: 1
                                        }}
                                    >
                                        <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "center" }]}>
                                            {index + 1}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1.8, fontSize: 7 }]}>
                                            {item?.barcodeNo}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1.8, fontSize: 7 }]}>
                                            {item?.billNo}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                            {findFromList(item.deliveryToId, branchList?.data, "branchName") || ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                            {findFromList(item.styleItemId, styleItemList?.data, "name") || ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7 }]}>
                                            {findFromList(item.sizeId, sizeList?.data, "name") || ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                            {findFromList(item.colorId, colorList?.data, "name") || ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7, textAlign: "right" }]}>
                                            {item.returnQty || 0}
                                        </Text>
                                    </View>
                                );
                            })}
                        <View
                            style={{
                                flexDirection: "row",
                                width: "100%",
                                backgroundColor: "#F3E8FF", // light purple background
                                borderBottomWidth: 1,
                                borderBottomColor: "#D8B4FE",
                                borderLeftWidth: 1,
                                borderLeftColor: "#D8B4FE",
                            }}
                        >
                            <Text
                                style={[
                                    styles.tableCell,
                                    {
                                        flex: 11.9,
                                        fontSize: 8,
                                        textAlign: "right",
                                        fontWeight: "bold",
                                        color: "#000000",
                                    },
                                ]}
                            >
                                Total
                            </Text>

                            <Text
                                style={[
                                    styles.tableCell,
                                    {
                                        flex: 0.8,
                                        fontSize: 8,
                                        textAlign: "right",
                                        fontWeight: "bold",
                                        color: "#000000",
                                    },
                                ]}
                            >
                                {salesReturnItems.reduce(
                                    (sum, row) => sum + (row.returnQty || 0),
                                    0
                                )}
                            </Text>

                        </View>

                    </View>

                </View>
                <View
                    style={{
                        marginTop: "auto",   // 👈 THIS pushes it to bottom
                        flexDirection: "row",
                        borderTopWidth: 1,
                        borderTopColor: "#9ca3af",
                        height: 130,
                    }}
                >
                    <View
                        style={{
                            flex: 0.3,
                            borderRight: "1 solid #9ca3af",
                            backgroundColor: "#F3E8FF",
                            paddingVertical: 5,
                            paddingHorizontal: 6,
                            minHeight: 60,
                            width: 40

                        }}
                    >
                        <Text
                            style={{
                                fontSize: 8,
                                fontWeight: "bold",
                                color: "#1D3A76",
                                flexWrap: "wrap"
                            }}
                        >
                            Remarks:
                        </Text>
                        <Text style={{ fontSize: 8, flexWrap: "wrap" }}>
                            {singleData?.remarks || ""}
                        </Text>
                    </View>


                    <View
                        style={{
                            flex: 0.7,
                            paddingVertical: 5,
                            paddingHorizontal: 6,
                            minHeight: 60,
                            width: 100,
                            backgroundColor: "#F3E8FF",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 8,
                                fontWeight: "bold",
                                color: "#1D3A76",
                                flexWrap: "wrap",
                            }}
                        >
                            Terms & Conditions:
                        </Text>
                        <Text style={{ fontSize: 8, flexWrap: "wrap" }}>
                            {singleData?.termsAndCondition || ""}
                        </Text>
                    </View>
                </View>
            </SRPageWrapper>
        </Document>
    );
};

export default PDF;

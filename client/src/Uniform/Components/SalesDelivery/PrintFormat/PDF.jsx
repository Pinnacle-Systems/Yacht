import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { useEffect } from "react";
import PageWrapper from "../../../../Utils/PageWrapper";
import tw from "../../../../Utils/tailwind-react-pdf";
import { findFromList } from "../../../../Utils/helper";
import Header from "../../../../Utils/Header";

const PDF = ({ singleData, allData }) => {
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
            // borderLeftWidth: 1,
            // borderLeftStyle: "solid",
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
        console.log("Single Data Fetched", singleData,)
    }, [singleData])

    let overallGrandTotal = 0;

    const calculateNetAmount = (item) => {
        const qty = parseFloat(item.qty) || 0;
        const price = parseFloat(item.price) || 0;
        const taxPercent = parseFloat(item.taxPercent) || 0;
        const discountValue = parseFloat(item.discountValue) || 0;
        const discountType = item.discountType || "";

        // Gross amount
        const grossAmount = qty * price;

        // GST Subtracted
        const amountAfterGST = grossAmount - (grossAmount * taxPercent) / 100;

        // Apply Discount
        let discountAmt = 0;
        if (discountType === "Flat") discountAmt = discountValue;
        else if (discountType === "Percent")
            discountAmt = (amountAfterGST * discountValue) / 100;

        // Final net amount
        const netAmount = amountAfterGST - discountAmt;

        return netAmount.toFixed(2);
    };
    return (
        <Document>
            <PageWrapper heading={"Sales Delivery"} singleData={singleData} header={false}>
                <View>
                    <Header styles={styles} />
                </View>

                    <View style={styles.container}>
                        <Text style={tw("mx-auto   text-base text-black my-1")}>Sales Delivery</Text>

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
                                        Delivery No
                                    </Text>
                                    <Text
                                        style={[
                                            tw("text-xs font-bold "),
                                            {
                                                fontWeight: 900,
                                                fontFamily: "Times-Bold",
                                                marginLeft: 4,
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
                                        Date
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
                                                marginLeft: 16,
                                            },
                                        ]}
                                    >
                                        :
                                    </Text>
                                    <Text style={tw("text-xs ml-2")}>
                                        {singleData?.Location?.branchName || ""}
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
                                                marginLeft: 30,
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
                                    Customer Details
                                </Text>
                                {/* Customer Name */}
                                <View style={tw("flex flex-row gap-x-2")}>
                                    <Text
                                        style={[
                                            tw("text-xs font-bold"),
                                            { fontWeight: 900, fontFamily: "Times-Bold" },
                                        ]}
                                    >
                                        Customer Name
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
                                        {" "}
                                        {singleData?.Customer?.name
                                            ? singleData.Customer.name
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
                                        Contact Number
                                    </Text>
                                    <Text
                                        style={[
                                            tw("text-xs font-bold"),
                                            {
                                                fontWeight: 900,
                                                fontFamily: "Times-Bold",
                                                marginLeft: 2,
                                            },
                                        ]}
                                    >
                                        :
                                    </Text>
                                    <Text style={tw("text-xs ml-2")}>
                                        {singleData?.Customer?.contactNumber || ""}
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
                                        Contact Address
                                    </Text>
                                    <Text
                                        style={[
                                            tw("text-xs font-bold "),
                                            {
                                                fontWeight: 900,
                                                fontFamily: "Times-Bold",
                                                marginLeft: 4,
                                            },
                                        ]}
                                    >
                                        :
                                    </Text>
                                    <Text style={tw("text-xs ml-2")}>
                                        {singleData?.Destination?.name}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />
                        <View style={{ height: 1 }} fixed />
                        <View style={[styles.table]}>
                            {/* Table Header */}
                            <View fixed style={styles.tableHeader}>
                                {[
                                    { label: "S.No", flex: 0.5 },
                                    { label: "Style No", flex: 1 },
                                    { label: "Barcode ", flex: 1 },
                                    { label: "Style", flex: 2 },
                                    { label: "Fabric", flex: 2 },
                                    { label: "Size", flex: 0.8 },
                                    { label: "Qty", flex: 0.8 },
                                    { label: "Price", flex: 1 },
                                    { label: "Tax", flex: 0.8 },
                                    { label: "Disc Type", flex: 1 },
                                    { label: "Discount", flex: 1 },
                                    { label: "Gross Amount", flex: 1.3 },
                                    { label: "Net Amount", flex: 1.3 },
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

                            {(singleData?.SalesEntryItems || []).slice().sort((a, b) =>
                                String(a?.styleNo ?? "").localeCompare(String(b?.styleNo ?? ""), undefined, {
                                    numeric: true,
                                    sensitivity: "base",
                                })
                            ).map((item, index) => {
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
                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                            {item?.styleNo || ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                            {item?.barcode || ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                            {item?.StyleItem?.name || ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                            {item?.Fabric?.name || ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7 }]}>
                                            {item.Size?.name || ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7, textAlign: "right" }]}>
                                            {item.qty || 0}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7, textAlign: "right" }]}>
                                            {item.price?.toFixed(2) || "0.00"}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7, textAlign: "right" }]}>
                                            {item.taxPercent || 0}%
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                            {item.discountType || "-"}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7, textAlign: "right" }]}>
                                            {item.discountValue || 0}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1.3, fontSize: 7, textAlign: "right" }]}>
                                            {gross.toFixed(2)}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1.3, fontSize: 7, textAlign: "right" }]}>
                                            {calculateNetAmount(item)}
                                        </Text>
                                    </View>
                                );
                            })}
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
                                            flex: 6.7,
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
                                <Text style={[styles.headerCell, , { flex: 0.6, fontSize: 8, textAlign: "right" }]}>
                                    {singleData?.SalesEntryItems?.reduce((sum, row) => sum + row.qty, 0)}
                                </Text>
                                <Text
                                    style={[
                                        styles.headerCell,
                                        {
                                            flex: 6,
                                            fontSize: 8,
                                            textAlign: "right",
                                            // fontWeight: "bold",
                                            // backgroundColor: "white",
                                            // marginTop:-1
                                            // borderColor: "#D1D5DB", borderBottomWidth: 1,
                                            // borderBottomStyle: "solid",
                                        },
                                    ]}
                                >
                                    {singleData?.SalesEntryItems
                                        .reduce(
                                            (sum, row) => sum + parseFloat(calculateNetAmount(row)),
                                            0
                                        )
                                        .toFixed(2)}
                                </Text>
                            </View>


                        </View>

                    </View>
            </PageWrapper>
        </Document>
    );
};

export default PDF;

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { useEffect } from "react";
import tw from "../../../../Utils/tailwind-react-pdf";
import { findFromList } from "../../../../Utils/helper";
import Header from "../../../../Utils/Header";
import SRPageWrapper from "../../../../Utils/SRPageWrapper";
import SRHeader from "../../../../Utils/SRHeader";
import { groupBy } from "lodash";


const PDF = ({ singleData, styleList, styleItemList, sizeList, colorList, singleDataBranch, grossAmount, netAmount, roundOff, taxRows, salesBillItems, roundOffType }) => {
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

    let overallGrandTotal = 0;

    const calculateNetAmount = (item) => {
        const qty = parseFloat(item.qty) || 0;
        const rate = parseFloat(item.rate) || 0;
        const taxPercent = parseFloat(item.taxPercent) || 0;
        const discountValue = parseFloat(item.discountValue) || 0;
        const discountType = item.discountType || "";

        // Gross amount
        const grossAmount = qty * rate;

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

    const totalNetAmount = singleData?.salesBillItems
        ?.reduce((sum, row) => sum + parseFloat(calculateNetAmount(row)), 0) || 0;

    const overAllDisc = parseFloat(singleData?.overAllDisc || 0);

    const overallDiscAmt = ((totalNetAmount * overAllDisc) / 100).toFixed(2);

    const overallGrossAmount = grossAmount.toFixed(2);

    const overallNetAmount =
        netAmount.toFixed(2);

    const sumNetAmount = singleData?.salesBillItems.reduce(
        (sum, row) => sum + (Number(row.netAmount) || 0),
        0,
    );

    return (
        <Document>
            <SRPageWrapper heading={"Sales Delivery"} singleData={singleData} header={false}>
                <View>
                    <SRHeader styles={styles} showDate={false} singleData={singleDataBranch} />
                </View>

                <View>
                    <Text style={styles.customTitle}>SALES BILL</Text>

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
                                    Bill No
                                </Text>
                                <Text
                                    style={[
                                        tw("text-xs font-bold "),
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
                                            marginLeft: 9,
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
                                    {singleData?.DeliveryTo?.branchName
                                        ? singleData.DeliveryTo.branchName
                                        : ""}
                                </Text>
                            </View>
                            {/*Customer Phone No */}
                            {/* <View style={tw("flex flex-row gap-x-2")}>
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
                                            marginLeft: 1,
                                        },
                                    ]}
                                >
                                    :
                                </Text>
                                <Text style={tw("text-xs ml-2")}>
                                    {singleData?.Customer?.mobileNo || ""}
                                </Text>
                            </View> */}
                        </View>
                    </View>

                    <View style={{ height: 1 }} fixed />
                    <View style={[styles.table]}>
                        {/* Table Header */}
                        <View fixed style={styles.tableHeader}>
                            {[
                                { label: "S.No", flex: 0.5 },
                                { label: "Barcode No", flex: 1.8 },
                                { label: "Style Item", flex: 2 },
                                { label: "Size", flex: 0.8 },
                                { label: "Color", flex: 2 },
                                { label: "Qty", flex: 0.8 },
                                { label: "Rate", flex: 1 },
                                { label: "Disc Type", flex: 1 },
                                { label: "Disc", flex: 0.8 },
                                { label: "Gross Amt", flex: 1.3 },
                                { label: "Net Amt", flex: 1.3 },
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

                        {(salesBillItems || []).slice().sort((a, b) =>
                            String(a?.Style?.sku ?? "").localeCompare(String(b?.Style?.sku ?? ""), undefined, {
                                numeric: true,
                                sensitivity: "base",
                            })).filter((item) => item.barcodeId).map((item, index) => {
                                const isEven = index % 2 === 0;
                                const gross = item.rate * item.qty;
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
                                            {item.qty || 0}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7, textAlign: "right" }]}>
                                            {Number(item.rate || 0).toFixed(2)}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                            {item.discountType === "Percentage" ? "Perc" : item.discountType || ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7, textAlign: "right" }]}>
                                            {item.discountValue || 0}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1.3, fontSize: 7, textAlign: "right" }]}>
                                            {gross.toFixed(2)}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1.3, fontSize: 7, textAlign: "right" }]}>
                                            {item?.netAmount !== undefined && item?.netAmount !== null
                                                ? Number(item.netAmount).toFixed(2)
                                                : "0"}
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
                                        flex: 7.6,
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
                                        flex: 0.7,
                                        fontSize: 8,
                                        textAlign: "right",
                                        fontWeight: "bold",
                                        color: "#000000",
                                    },
                                ]}
                            >
                                {salesBillItems.reduce(
                                    (sum, row) => sum + (row.qty || 0),
                                    0
                                )}
                            </Text>

                            <Text
                                style={[
                                    styles.tableCell,
                                    {
                                        flex: 6,
                                        fontSize: 8,
                                        textAlign: "right",
                                        fontWeight: "bold",
                                        color: "#000000",
                                    },
                                ]}
                            >
                                {salesBillItems
                                    ?.reduce(
                                        (sum, row) => sum + (Number(row.netAmount) || 0),
                                        0,
                                    )
                                    .toFixed(2)}
                            </Text>
                        </View>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            marginTop: 5,
                            paddingHorizontal: 5,
                        }}>
                            <View style={[
                                styles.summaryBox,
                                {
                                    width: 220,          // 👈 controls minimum width
                                    alignSelf: "flex-end",
                                    marginRight: 5
                                },
                            ]}>
                                {/* Legend Title */}
                                <Text style={styles.summaryTitle}>Summary</Text>
                                {taxRows?.map((tax, index) => (
                                    <View key={index}>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}> Gross Amount</Text>
                                            <Text style={styles.summaryValue}>{overallGrossAmount}</Text>
                                        </View>
                                        {/* SGST Row */}
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>
                                                SGST @{tax.halfTax}%
                                            </Text>
                                            <Text style={styles.summaryValue}>
                                                {tax.sgstAmount?.toFixed(2)}
                                            </Text>
                                        </View>

                                        {/* CGST Row */}
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>
                                                CGST @{tax.halfTax}%
                                            </Text>
                                            <Text style={styles.summaryValue}>
                                                {tax.cgstAmount?.toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}


                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}> Net Amount</Text>
                                    <Text style={styles.summaryValue}>{sumNetAmount.toFixed(2)}</Text>
                                </View>

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Round Off</Text>
                                    <Text style={styles.summaryValue}>{roundOffType === "PLUS" ? "+" : "-"} {Number(roundOff || 0).toFixed(2)}</Text>
                                </View>

                                <View
                                    style={[
                                        styles.summaryRow,
                                        { borderTopWidth: 1, borderTopColor: "#D1D5DB", marginTop: 4, paddingTop: 4 },
                                    ]}
                                >
                                    <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>
                                        Overall Net Amount
                                    </Text>
                                    <Text style={[styles.summaryValue, { fontSize: 10 }]}>
                                        {overallNetAmount}
                                    </Text>
                                </View>
                            </View>
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

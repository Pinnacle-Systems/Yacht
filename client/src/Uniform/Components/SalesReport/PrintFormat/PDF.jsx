import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { useEffect } from "react";
import PageWrapper from "../../../../Utils/PageWrapper";
import tw from "../../../../Utils/tailwind-react-pdf";
import { findFromList, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";
import Header from "../../../../Utils/Header";

const PDF = ({ allData, customerList, singleDataBranch }) => {

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
            padding: 5,
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
        footer: {
            marginTop: 10,
            borderTopWidth: 1,
            borderTopColor: "#016B65",
            paddingTop: 10,
            alignItems: "center",
        },
        table: {
            display: "table",
            marginTop: 0,
            // borderTopWidth: 1,
            // borderTopStyle: "solid",
            // borderTopColor: "#D1D5DB",
            width: "80%",
            borderCollapse: "collapse",
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
        tableRowEven: {
            backgroundColor: "#FFFFFF", // white
        },
        tableRowOdd: {
            backgroundColor: "#F9FAFB", // light gray (soft stripe)
        },
        tableCell: {
            padding: 4,
            fontSize: 7,
            borderRightWidth: 1,
            borderRightColor: "#D1D5DB",
        },
        totalRow: {
            flexDirection: "row",
            backgroundColor: "#E5E7EB",
            fontWeight: "bold",
        },
        totalCell: {
            flex: 1,
            padding: 6,
            fontSize: 7,
            textAlign: "center",
            fontWeight: "bold",
            // borderRightWidth: 1,
            borderRightColor: "#D1D5DB",
        },
        lastColumn: {
            borderRightWidth: 0, // Remove right border for the last column
        },
        firstRow: {
            borderTopWidth: 0, // Optional: if you want to remove top line
        },
    });


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

        return netAmount;
    };

    const totalQty = allData?.data?.reduce((grandTotal, dataObj) => {
        const itemQty = dataObj?.SalesEntryItems?.reduce(
            (total, item) => total + item?.qty,
            0
        );
        return grandTotal + itemQty;
    }, 0);

    const totalNetAmt = allData?.data?.reduce((grandAmount, dataObj) => {
        const itemAmt = dataObj?.SalesEntryItems?.reduce(
            (total, item) => total + calculateNetAmount(item),
            0
        );
        return grandAmount + itemAmt;
    }, 0);


    return (
        <Document>
            <PageWrapper heading={"Sales Report"} allData={allData} header={false}>
                <View>
                    <Header styles={styles} singleData={singleDataBranch?.data}/>
                </View>

                <View style={styles.container}>
                    <Text style={tw("mx-auto     text-base text-black")}>Sales Report</Text>
                    <View style={{ height: 1 }} fixed />
                    <View style={[styles.table,]} wrap>
                        <View fixed style={styles.tableHeader}>
                            {[
                                { label: "S.No", flex: 0.3 },
                                { label: "Delivery Date", flex: 0.7 },
                                { label: "Delivery No", flex: 0.7 },
                                { label: "Customer ", flex: 1.5 },
                                { label: "Sales Qty", flex: 0.5 },
                                { label: " Amount", flex: 0.5 },
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

                        {(allData?.data || []).map((item, index) => {
                            return (
                                <View
                                    key={index}
                                    wrap={false}
                                    style={[
                                        {
                                            flexDirection: "row",
                                            width: "100%",
                                            borderBottomWidth: 1,
                                            borderBottomColor: "#D1D5DB",
                                            borderLeftColor: "#D1D5DB",
                                            borderLeftWidth: 1,
                                        },
                                        index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd, // ✅ alternate color
                                    ]}
                                >
                                    <Text style={[styles.tableCell, { flex: 0.3, fontSize: 7, textAlign: "center" }]}>
                                        {index + 1}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.7, fontSize: 7 }]}>
                                        {item?.docDate
                                            ? getDateFromDateTimeToDisplay(item.docDate)
                                            : ""}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.7, fontSize: 7 }]}>
                                        {item?.docId
                                            ? item.docId
                                            : ""}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 1.5, fontSize: 7 }]}>
                                        {findFromList(
                                            item?.customerId,
                                            customerList?.data,
                                            "name"
                                        )}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "right" }]}>
                                        {item?.SalesEntryItems?.reduce(
                                            (total, item) => total + item?.qty,
                                            0
                                        )}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "right" }]}>
                                        {item?.SalesEntryItems?.reduce(
                                            (total, item) =>
                                                total + calculateNetAmount(item),
                                            0
                                        ).toFixed(2)}
                                    </Text>

                                </View>
                            );
                        })}
                        <View
                            style={[
                                {
                                    flexDirection: "row",
                                    width: "100%",
                                    borderBottomWidth: 1,
                                    borderBottomColor: "#D1D5DB",
                                    borderLeftColor: "#D1D5DB",
                                    borderLeftWidth: 1,
                                    // backgroundColor: "#F3F4F6"
                                },
                            ]}
                        >
                            {/* <Text
                                style={[styles.tableCell, {
                                    flex: 1.5, fontSize: 8, textAlign: "right",
                                    fontWeight: "bold",
                                    // paddingRight: 4,
                                }]}></Text> */}
                            <Text
                                style={[styles.tableCell, {
                                    flex: 2.1, textAlign: "right",
                                    fontWeight: "bold",
                                    fontSize: 8,
                                    // paddingRight: 4,
                                }]}
                            >
                                Total
                            </Text>

                            <Text
                                style={[styles.tableCell, {
                                    flex: 0.3, textAlign: "right",
                                    fontWeight: "bold",
                                    // paddingRight: 4,
                                }]}
                            >
                                {totalQty}
                            </Text>
                            <Text
                                style={[styles.tableCell, {
                                    flex: 0.3, textAlign: "right",
                                    fontWeight: "bold",
                                    // paddingRight: 4,
                                }]}
                            >
                                {totalNetAmt.toFixed(2)}
                            </Text>
                        </View>

                    </View>

                </View>
            </PageWrapper>
        </Document>
    );
};

export default PDF;

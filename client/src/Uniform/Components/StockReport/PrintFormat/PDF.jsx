import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { useEffect } from "react";
import PageWrapper from "../../../../Utils/PageWrapper";
import tw from "../../../../Utils/tailwind-react-pdf";
import { findFromList } from "../../../../Utils/helper";

const PDF = ({ allData, sizeList, fabricList, styleItemList }) => {
   
    const styles = StyleSheet.create({
        page: { padding: 5 },
        infoRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 5,
        },
        bold: {
            fontWeight: "bold",
            fontSize: 14,
        },
        valueText: {
            fontSize: 7,
            color: "#555",
            paddingLeft: 3,
        },
        labelpo: {
            fontSize: 7,
            textAlign: "center",
            paddingLeft: 6,
        },
        labelpo1: {
            fontSize: 7,
            textAlign: "right",
            paddingRight: 8,
        },
        fromInfoContainer: {
            width: "45%",
            // backgroundColor: '#f3f4f6',
            padding: 6,
            borderRadius: 8,
        },
        rightContainer: {
            flexDirection: "column",
            backgroundColor: "#f9f9f9",
            borderRadius: 8,
            padding: 6,
            shadowColor: "#E5E7EB",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            width: "33%",
        },
        labelContainer: {
            fontSize: 10,
            fontWeight: "bold",
            color: "#333",
        },
        photoContainer: {
            width: "15%",
            height: 80,
            marginRight: 10,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 2,
            backgroundColor: "#f3f4f6",
        },
        infoCard: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 6,
            padding: 8,
            marginHorizontal: 4,
            marginVertical: 4,
            shadowColor: "#E5E7EB",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        bold: {
            fontWeight: "bold",
            color: "#333",
            marginRight: 4,
        },

        valueContainer: {
            width: "60%",
            color: "#555",
        },

        container: {
            width: "100%",
            padding: 5,
        },
        headerContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 5,
            marginBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#016B65",
        },
        title: {
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            color: "#B81981",
            letterSpacing: 0.5,
            marginVertical: 5,
        },
        withBorder: {
            borderRightWidth: 1,
            borderRightColor: "#E5E7EB",
        },
        logo: {
            width: 60,
            height: 60,
        },

        billInfoContainer: {
            flexDirection: "column",
            alignItems: "flex-end",
        },
        infoWrapper: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 5,
        },

        toInfoContainer: {
            width: "33%",
        },
        infoText: {
            fontSize: 7,
            marginVertical: 2,
            flexDirection: "row",
            alignItems: "center",
        },
        infoText1: {
            fontSize: 7,
            marginVertical: 2,
            flexDirection: "row",
            alignItems: "center",
            color: "#016B65",
        },
        infoText2: {
            fontSize: 7,
            marginVertical: 2,
            flexDirection: "row",
            alignItems: "center",
        },
        totalRow: {
            flexDirection: "row",
            backgroundColor: "#bfdbfe",
            padding: 5,
            fontWeight: "bold",
        },
        icon: {
            marginRight: 6,
            width: 12,
            height: 12,
        },
        bold: {
            fontWeight: "bold",
        },
        divider: {
            borderBottomWidth: 1,
            borderBottomColor: "#016B65",
            marginVertical: 4,
        },

        amountInWordsContainer: {
            backgroundColor: "#f0f8ff", // Light blue background
            padding: 10,
            marginTop: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#ccc",
            alignItems: "center",
        },
        amountInWordsLabel: {
            fontSize: 8,
            fontWeight: "bold",
            color: "#333",
            marginBottom: 5,
        },
        amountInWordsText: {
            fontSize: 8,
            fontWeight: "600",
            color: "#007bff", // Blue text for visibility
            textAlign: "center",
        },

        footer: {
            marginTop: 10,
            borderTopWidth: 1,
            borderTopColor: "#016B65",
            paddingTop: 10,
            alignItems: "center",
        },
        footerText: {
            fontSize: 7,
            color: "#555",
            marginVertical: 2,
        },
        table: {
            display: "table",
            // width: "auto",
            //   borderStyle: "solid",
            //   borderWidth: 1,
            //   borderColor: "#D1D5DB",
            marginTop: 10,
            borderTopWidth: 1,
            borderTopStyle: "solid",
            borderTopColor: "#D1D5DB",

            borderCollapse: "collapse",
        },
        tableHeader: {
            flexDirection: "row",
            backgroundColor: "#F3F4F6",
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
        tableRowOdd: {
            // backgroundColor: "#F9FAFB",
            // textTransform:"capitalize"
        },
        tableCell: {
            padding: 5,
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
        totalCell: {
            flex: 1,
            padding: 6,
            fontSize: 7,
            textAlign: "center",
            fontWeight: "bold",
            borderRightWidth: 1,
            borderRightColor: "#D1D5DB",
        },
        lastColumn: {
            borderRightWidth: 0, // Remove right border for the last column
        },
        firstRow: {
            borderTopWidth: 0, // Optional: if you want to remove top line
        },
    });


    useEffect(() => {
        console.log("Single Data Fetched", allData,)
    }, [allData])

    let overallGrandTotal = 0;

    return (
        <Document>
            <PageWrapper heading={"Stock Report"} allData={allData}>
                <View style={styles.container}>
                    <Text style={tw("mx-auto     text-base text-black mt-2")}>Stock Report</Text>

                    <View style={[styles.table, tw("mt-5")]}>
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
                                    wrap
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
                                        {item?.styleNo || "-"}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                        {item?.barcode || "-"}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                        {findFromList(
                                            item?.styleItemId,
                                            styleItemList?.data,
                                            "name"
                                        )}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 2, fontSize: 7 }]}>
                                        {findFromList(
                                            item?.fabricId,
                                            fabricList?.data,
                                            "name"
                                        )}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7 }]}>
                                        {findFromList(
                                            item?.sizeId,
                                            sizeList?.data,
                                            "name"
                                        )}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.8, fontSize: 7, textAlign: "right" }]}>
                                        {item.stkQty || 0}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                </View>
            </PageWrapper>
        </Document>
    );
};

export default PDF;

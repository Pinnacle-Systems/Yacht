import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";
import tw from "../../../Utils/tailwind-react-pdf";
import SRPageWrapper from "../../../Utils/SRPageWrapper";
import SRHeader from "../../../Utils/SRHeader";
import { getDateFromDateTimeToDisplay } from "../../../Utils/helper";

const PDF = ({ allData, singleData }) => {

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

    return (
        <Document>
            <SRPageWrapper heading={"Stock Report"} allData={allData} header={false}>
                <View>
                    <SRHeader styles={styles} singleData={singleData} />
                </View>

                <View style={styles.container}>
                    <Text style={tw("mx-auto     text-base text-black mt-2")}>Sales Report</Text>
                    <View style={{ height: 1 }} fixed />
                    <View style={[styles.table,]} wrap>
                        <View fixed style={styles.tableHeader}>
                            {[
                                { label: "S.No", flex: 0.4 },
                                { label: "Sales No", flex: 1 },
                                { label: "Sales Date", flex: 0.5 },
                                { label: "Customer", flex: 1.5 },
                                { label: "Cash Amt", flex: 0.5 },
                                { label: "Card Amt", flex: 0.5 },
                                { label: "UPI Amt", flex: 0.5 },
                                { label: "Net Amt", flex: 0.5 },
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

                        {(allData?.data || []).map((dataObj, index) => {
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
                                    <Text style={[styles.tableCell, { flex: 0.4, fontSize: 7, textAlign: "center" }]}>
                                        {index + 1}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                        {dataObj.docId}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7 }]}>
                                        {dataObj?.docDate
                                            ? getDateFromDateTimeToDisplay(dataObj.docDate)
                                            : ""}
                                    </Text>

                                    <Text style={[styles.tableCell, { flex: 1.5, fontSize: 7 }]}>
                                        {dataObj?.customerName}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "right" }]}>
                                        {dataObj?.cashAmount
                                            ? Number(dataObj?.cashAmount).toFixed(2)
                                            : "-"}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "right" }]}>
                                        {dataObj?.cardAmount
                                            ? Number(dataObj?.cardAmount).toFixed(2)
                                            : "-"}
                                    </Text>

                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "right" }]}>
                                        {dataObj?.upiAmount
                                            ? Number(dataObj?.upiAmount).toFixed(2)
                                            : "-"}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "right" }]}>
                                        {(
                                            Number(dataObj?.cashAmount) +
                                            Number(dataObj?.cardAmount) +
                                            Number(dataObj?.upiAmount)
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
                                },
                            ]}
                        >
                            <Text
                                style={[styles.tableCell, {
                                    flex: 3.7, fontSize: 8, textAlign: "right",
                                }]}
                            >
                                Total
                            </Text>
                            <Text
                                style={[styles.tableCell, {
                                    flex: 0.5, fontSize: 8, textAlign: "right",
                                }]}
                            >
                                {Number(allData?.totalCashAmount).toFixed(2)}
                            </Text>
                            <Text
                                style={[styles.tableCell, {
                                    flex: 0.5, fontSize: 8, textAlign: "right",
                                }]}
                            >
                                {Number(allData?.totalCardAmount).toFixed(2)}
                            </Text>
                            <Text
                                style={[styles.tableCell, {
                                    flex: 0.5, fontSize: 8, textAlign: "right",
                                }]}
                            >
                                {Number(allData?.totalUpiAmount).toFixed(2)}
                            </Text>

                            <Text
                                style={[styles.tableCell, {
                                    flex: 0.5, fontSize: 8, textAlign: "right",
                                }]}
                            >
                                {Number(allData?.totalNetAmount).toFixed(2)}
                            </Text>
                        </View>

                    </View>

                </View>
            </SRPageWrapper>
        </Document>
    );
};

export default PDF;

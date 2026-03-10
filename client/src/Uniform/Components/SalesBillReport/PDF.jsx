import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";
import tw from "../../../Utils/tailwind-react-pdf";
import SRPageWrapper from "../../../Utils/SRPageWrapper";
import SRHeader from "../../../Utils/SRHeader";
import { findFromList, getDateFromDateTimeToDisplay, getTimeFromDateTime } from "../../../Utils/helper";

const PDF = ({ allData, singleData, viewType, isAdmin }) => {

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

    const headers =
        viewType === "Normal"
            ? [
                { label: "S.No", flex: 0.3 },
                { label: "Sales No", flex: 0.8 },
                { label: "Sales Date", flex: 0.5 },
                { label: " Time", flex: 0.5 },
                { label: "Customer", flex: 1.5 },
                { label: "Cash Amt", flex: 0.5 },
                { label: "Card Amt", flex: 0.5 },
                { label: "UPI Amt", flex: 0.5 },
                { label: "Net Amt", flex: 0.5 },
            ]
            : [
                { label: "S.No", flex: 0.3 },
                { label: "Sales No", flex: 0.8 },
                { label: "Sales Date", flex: 0.5 },
                { label: " Time", flex: 0.5 },
                { label: "Customer", flex: 1.5 },
                { label: "Barcode", flex: 0.8 },
                { label: "Item Name", flex: 1.5 },
                { label: "Size", flex: 0.5 },
                { label: "Unit", flex: 0.5 },
                { label: "Qty", flex: 0.5 },
            ];

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
                            {headers.map((header, index) => (
                                <Text
                                    key={index}
                                    style={[
                                        styles.headerCell,
                                        { flex: header.flex, textAlign: "center", fontSize: 8 },
                                    ]}
                                >
                                    {header.label}
                                </Text>
                            ))}
                        </View>
                        {/*  Grouped Rows */}

                        {(allData?.data || []).map((dataObj, index) => {
                            const salesItems = dataObj?.SalesEntryItems || [];

                            // 🔹 NORMAL VIEW
                            if (viewType === "Normal") {
                                return (
                                    <View
                                        key={dataObj.id || index}
                                        style={[
                                            {
                                                flexDirection: "row",
                                                borderBottomWidth: 1,
                                                borderBottomColor: "#D1D5DB",
                                                borderLeftWidth: 1,
                                                borderLeftColor: "#D1D5DB",
                                            },
                                            index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                                        ]}
                                    >
                                        <Text style={[styles.tableCell, { flex: 0.3, textAlign: "center" }]}>
                                            {index + 1}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 0.8 }]}>
                                            {dataObj?.docId}
                                        </Text>


                                        <Text style={[styles.tableCell, { flex: 0.5 }]}>
                                            {dataObj?.docDate
                                                ? getDateFromDateTimeToDisplay(dataObj.docDate)
                                                : ""}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 0.5 }]}>
                                            {dataObj?.createdAt
                                                ? getTimeFromDateTime(dataObj.createdAt)
                                                : ""}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 1.5 }]}>
                                            {isAdmin
                                                ? dataObj?.deliveryTo
                                                : `${dataObj?.customerName} - ${dataObj?.mobileNo}`}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 0.5, textAlign: "right" }]}>
                                            {Number(dataObj?.cashAmount || 0).toFixed(2)}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 0.5, textAlign: "right" }]}>
                                            {Number(dataObj?.cardAmount || 0).toFixed(2)}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 0.5, textAlign: "right" }]}>
                                            {Number(dataObj?.upiAmount || 0).toFixed(2)}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 0.5, textAlign: "right" }]}>
                                            {(
                                                Number(dataObj?.cashAmount || 0) +
                                                Number(dataObj?.cardAmount || 0) +
                                                Number(dataObj?.upiAmount || 0)
                                            ).toFixed(2)}
                                        </Text>
                                    </View>
                                );
                            }

                            // 🔹 DETAIL VIEW
                            return salesItems.map((item, itemIndex) => (
                                <View
                                    key={`${dataObj.id}-${itemIndex}`}
                                    style={[
                                        {
                                            flexDirection: "row",
                                            borderBottomWidth: 1,
                                            borderBottomColor: "#D1D5DB",
                                            borderLeftWidth: 1,
                                            borderLeftColor: "#D1D5DB",
                                        },
                                        index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                                    ]}
                                >
                                    {/* S NO */}
                                    <Text style={[styles.tableCell, { flex: 0.3, textAlign: "center" }]}>
                                        {itemIndex === 0 ? index + 1 : ""}
                                    </Text>

                                    {/* SALES NO */}
                                    <Text style={[styles.tableCell, { flex: 0.7 }]}>
                                        {itemIndex === 0 ? dataObj?.docId : ""}
                                    </Text>

                                    {/* DATE */}
                                    <Text style={[styles.tableCell, { flex: 0.7 }]}>
                                        {itemIndex === 0 && dataObj?.docDate
                                            ? getDateFromDateTimeToDisplay(dataObj.docDate)
                                            : ""}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.8 }]}>
                                        {dataObj?.createdAt
                                            ? getTimeFromDateTime(dataObj.createdAt)
                                            : ""}
                                    </Text>
                                    {/* CUSTOMER */}
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>
                                        {itemIndex === 0
                                            ? dataObj?.customerName
                                            : ""}
                                    </Text>

                                    {/* BARCODE */}
                                    <Text style={[styles.tableCell, { flex: 1 }]}>
                                        {item?.barcodeNo}
                                    </Text>

                                    {/* ITEM NAME */}
                                    <Text style={[styles.tableCell, { flex: 1.5 }]}>
                                        {item?.StyleItem?.name}
                                    </Text>

                                    {/* SIZE */}
                                    <Text style={[styles.tableCell, { flex: 0.5, textAlign: "center" }]}>
                                        {item?.Size?.name}
                                    </Text>

                                    {/* UNIT */}
                                    <Text style={[styles.tableCell, { flex: 0.5, textAlign: "center" }]}>
                                        {item?.Uom?.name}
                                    </Text>

                                    {/* QTY */}
                                    <Text style={[styles.tableCell, { flex: 0.5, textAlign: "right" }]}>
                                        {item?.qty}
                                    </Text>
                                </View>
                            ));
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
                                    flex: 4, fontSize: 8, textAlign: "right",
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

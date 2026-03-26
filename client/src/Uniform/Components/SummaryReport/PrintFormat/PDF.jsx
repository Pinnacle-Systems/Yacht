import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { useEffect } from "react";
import PageWrapper from "../../../../Utils/PageWrapper";
import tw from "../../../../Utils/tailwind-react-pdf";
import { findFromList, formatCamelCase, getDateFromDateTimeToDisplay } from "../../../../Utils/helper";
import Header from "../../../../Utils/Header";

const PDF = ({ allData, sizeList, fabricList, styleItemList, colorList ,singleDataBranch}) => {

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


    useEffect(() => {
        console.log("Single Data Fetched", allData,)
    }, [allData])

    let overallGrandTotal = 0;

    return (
        <Document>
            <PageWrapper heading={"Stock Report"} allData={allData} header={false}>
                <View>
                    <Header styles={styles} singleData={singleDataBranch?.data}/>
                </View>

                <View style={styles.container}>
                    <Text style={tw("mx-auto     text-base text-black")}>Stock Summary Report</Text>
                    <View style={{ height: 1 }} fixed />
                    <View style={[styles.table,]} wrap>
                        <View fixed style={styles.tableHeader}>
                            {[
                                { label: "S.No", flex: 0.3 },
                                { label: "Date", flex: 0.5 },
                                { label: "Style No", flex: 0.5 },
                                { label: "Style", flex: 1 },
                                { label: "Fabric", flex: 1 },
                                { label: "Color", flex: 1 },
                                { label: "Size", flex: 0.4 },
                                { label: "Process ", flex: 1.5 },
                                { label: "Qty", flex: 0.5 },
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
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7 }]}>
                                        {item?.createdAt
                                            ? getDateFromDateTimeToDisplay(
                                                item.createdAt
                                            )
                                            : ""}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7 }]}>
                                        {item?.styleNo || "-"}
                                    </Text>
                                    {/* <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7 }]}>
                                        {item?.barcode || "-"}
                                    </Text> */}
                                    <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                        {findFromList(
                                            item?.styleItemId,
                                            styleItemList?.data,
                                            "name"
                                        )}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                        {findFromList(
                                            item?.fabricId,
                                            fabricList?.data,
                                            "name"
                                        )}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                        {findFromList(
                                            item?.colorId,
                                            colorList?.data,
                                            "name"
                                        )}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.4, fontSize: 7 }]}>
                                        {findFromList(
                                            item?.sizeId,
                                            sizeList?.data,
                                            "name"
                                        )}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 1.5, fontSize: 7 }]}>
                                        {formatCamelCase(item?.inOrOut)}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "right" }]}>
                                        {item.qty || 0}
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
                                flex: 5.7, fontSize: 8, textAlign: "right",
                                fontWeight: "bold",
                                // paddingRight: 4,
                            }]}></Text> */}
                            <Text
                                style={[styles.tableCell, {
                                    flex: 5.7, fontSize: 8, textAlign: "right",
                                    // fontWeight: "bold",
                                    // paddingRight: 4,
                                }]}
                            >
                                Total
                            </Text>

                            <Text
                                style={[styles.tableCell, {
                                    flex: 0.4, fontSize: 8, textAlign: "right",
                                    // fontWeight: "bold",
                                    // paddingRight: 4,
                                }]}
                            >
                                {allData?.totalQty || 0}
                            </Text>
                        </View>

                    </View>

                </View>
            </PageWrapper>
        </Document>
    );
};

export default PDF;

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React, { useEffect } from "react";
import PageWrapper from "../../../../Utils/PageWrapper";
import tw from "../../../../Utils/tailwind-react-pdf";
import { findFromList } from "../../../../Utils/helper";
import Header from "../../../../Utils/Header";

const PDF = ({ allData, sizeList, fabricList, portionList, colorList, styleList, stockType, accessoryList, accessoryGroupList }) => {

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

    const fabricHeaders = [
        { label: "S.No", flex: 0.4 },
        { label: "Style No", flex: 0.5 },
        { label: "Fabric", flex: 1 },
        { label: "Color", flex: 1 },
        { label: "Portion", flex: 0.5 },
        { label: "Meter", flex: 0.5 },
    ];

    const accessoryHeaders = [
        { label: "S.No", flex: 0.4 },
        { label: "Accessory Name", flex: 1 },
        { label: "Accessory Group Name", flex: 1 },
        { label: "Color", flex: 1 },
        { label: "Size", flex: 0.5 },
        { label: "Quantity", flex: 0.5 },
    ];

    const headers =
        stockType === "Fabric" ? fabricHeaders : accessoryHeaders;

    return (
        <Document>
            <PageWrapper heading={"Stock Report"} allData={allData} header={false}>
                <View>
                    <Header styles={styles} />
                </View>

                <View style={styles.container}>
                    <Text style={tw("mx-auto     text-base text-black")}>Material Stock Report</Text>
                    <View style={{ height: 1 }} fixed />
                    <View style={[styles.table,]} wrap>
                        <View fixed style={styles.tableHeader}>
                            {headers.map((header, index) => (
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

                        {(allData?.data || []).map((item, index) => (
                            <View
                                key={index}
                                wrap={false}
                                style={[
                                    {
                                        flexDirection: "row",
                                        width: "100%",
                                        borderBottomWidth: 1,
                                        borderBottomColor: "#D1D5DB",
                                        borderLeftWidth: 1,
                                        borderLeftColor: "#D1D5DB",
                                    },
                                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                                ]}
                            >
                                {/* S.No */}
                                <Text style={[styles.tableCell, { flex: 0.4, fontSize: 7, textAlign: "center" }]}>
                                    {index + 1}
                                </Text>

                                {stockType === "Fabric" ? (
                                    <>
                                        <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7 }]}>
                                            {findFromList(item?.styleId, styleList?.data, "sku")}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                            {findFromList(item?.fabricId, fabricList?.data, "name")}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                            {findFromList(item?.colorId, colorList?.data, "name")}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7 }]}>
                                            {findFromList(item?.portionId, portionList?.data, "name")}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "right" }]}>
                                            {item.fabMeter || 0}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                            {findFromList(item?.accessoryId, accessoryList?.data, "name")}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                            {findFromList(item?.accessoryGroupId, accessoryGroupList?.data, "name")}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                            {findFromList(item?.colorId, colorList?.data, "name")}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7 }]}>
                                            {findFromList(item?.sizeId, sizeList?.data, "name")}
                                        </Text>

                                        <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "right" }]}>
                                            {item.stkQty || 0}
                                        </Text>
                                    </>
                                )}
                            </View>
                        ))}
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
                        >   <Text
                            style={[styles.tableCell, {
                                flex: stockType === "Fabric" ? 3.1 : 3.6, fontSize: 8, textAlign: "right",
                                fontWeight: "bold",
                            }]}></Text>
                            <Text
                                style={[styles.tableCell, {
                                    flex: 0.5, fontSize: 8, textAlign: "left",
                                }]}
                            >
                                Total
                            </Text>

                            <Text
                                style={[styles.tableCell, {
                                    flex: 0.5, fontSize: 8, textAlign: "right",
                                }]}
                            >
                                {
                                    Number(
                                        stockType === "Fabric"
                                            ? allData?.totalMeter || 0
                                            : allData?.totalQty || 0
                                    ).toFixed(2)
                                }
                            </Text>
                        </View>

                    </View>

                </View>
            </PageWrapper>
        </Document>
    );
};

export default PDF;

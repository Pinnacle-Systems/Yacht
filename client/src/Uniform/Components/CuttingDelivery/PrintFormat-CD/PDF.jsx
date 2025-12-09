import { Document, StyleSheet, Text, View } from "@react-pdf/renderer";
import { useEffect } from "react";
import PageWrapper from "../../../../Utils/PageWrapper";
import tw from "../../../../Utils/tailwind-react-pdf";
import { findFromList } from "../../../../Utils/helper";
import Header from "../../../../Utils/Header";

const PDF = ({ singleData, sizeColumns }) => {
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
            // borderTopWidth: 1,
            // borderTopStyle: "solid",
            // borderTopColor: "#D1D5DB",
            // paddingHorizontal: 1,
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
        },
        totalRow: {
            flexDirection: "row",
            backgroundColor: "#E5E7EB",
            fontWeight: "bold",
        },
        lastColumn: {
            borderRightWidth: 0,
        },
    });
    useEffect(() => {
        console.log("Single Data Fetched", singleData,)
    }, [singleData])

    return (
        <Document>
            <PageWrapper heading={"Sales Return"} singleData={singleData} header={false}>
                <View>
                    <Header styles={styles} />
                </View>
                <View style={styles.container}>
                    <Text style={tw("mx-auto   text-base text-black mt-1")}>Cutting Production</Text>

                    {/* non grid  */}

                    <View style={[tw("flex flex-row justify-between w-full  p-2")]}>
                        {/* left column */}
                        <View style={tw("flex flex-col  gap-y-2")}>
                            <Text
                                style={[
                                    tw("font-bold"),
                                    { fontWeight: 900, fontFamily: "Times-Bold" },
                                ]}
                            >
                                Basic Details
                            </Text>
                            <View style={tw("flex flex-row gap-x-2")}>

                                <View style={tw("flex flex-row gap-x-2 mr-11")}>
                                    <Text
                                        style={[
                                            tw("text-xs font-bold"),
                                            { fontWeight: 900, fontFamily: "Times-Bold" },
                                        ]}
                                    >
                                        Cutting Production No
                                    </Text>
                                    <Text
                                        style={[
                                            tw("text-xs font-bold "),
                                            {
                                                fontWeight: 900,
                                                fontFamily: "Times-Bold",
                                                marginLeft: 10,
                                            },
                                        ]}
                                    >
                                        :
                                    </Text>
                                    <Text style={tw("text-xs ml-2")}>
                                        {singleData?.docId || ""}
                                    </Text>
                                </View>
                                <View style={tw("flex flex-row gap-x-2 ")}>

                                    <Text
                                        style={[
                                            tw("text-xs font-bold"),
                                            { fontWeight: 900, fontFamily: "Times-Bold" },
                                        ]}
                                    >
                                        Style No
                                    </Text>
                                    <Text
                                        style={[
                                            tw("text-xs font-bold "),
                                            {
                                                fontWeight: 900,
                                                fontFamily: "Times-Bold",
                                                marginLeft: 5,
                                            },
                                        ]}
                                    >
                                        :
                                    </Text>
                                    <Text style={tw("text-xs ml-2")}>
                                        {singleData?.Style?.sku || ""}
                                    </Text>
                                </View>

                            </View>
                            <View style={tw("flex flex-row gap-x-2")}>
                                <View style={tw("flex flex-row gap-x-2 mr-16")}>
                                    <Text
                                        style={[
                                            tw("text-xs font-bold"),
                                            { fontWeight: 900, fontFamily: "Times-Bold" },
                                        ]}
                                    >
                                        Cutting Production Date
                                    </Text>
                                    <Text
                                        style={[
                                            tw("text-xs font-bold"),
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
                                        Employee
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
                                        {singleData?.Employee
                                            ? singleData.Employee.firstName
                                            : ""}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />
                    <View style={{ height: 1 }} fixed />
                    <View style={[styles.table]}>
                        {/* Table Header */}
                        <View fixed style={styles.tableHeader}>
                            {[
                                { label: "S.No", flex: 0.3 },
                                { label: "Style", flex: 1 },
                                { label: "Fabric", flex: 1 },
                                { label: "Color", flex: 1 },
                                { label: "Portion", flex: 0.5 },
                                // { label: "Width", flex: 0.6 },
                                { label: "Meter", flex: 0.4 },
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
                                    ]}
                                >
                                    {header.label}
                                </Text>
                            ))}

                            {/* 🔥 ADD DYNAMIC SIZE COLUMNS */}
                            {sizeColumns.map((col) => (
                                <Text
                                    key={col.sizeId}
                                    style={[
                                        styles.headerCell, {
                                            flex: 0.3,
                                            textAlign: "center",
                                            fontSize: 8,
                                            fontWeight: "bold",
                                        }]}
                                >
                                    {col.sizeName}
                                </Text>
                            ))}

                            {/* Remaining columns */}
                            {[
                                { label: "Qty", flex: 0.3 },
                                { label: "Cons", flex: 0.3 },
                                // { label: "Remarks", flex: 1 },
                            ].map((header, i) => (
                                <Text
                                    key={`end-${i}`}
                                    style={[
                                        styles.headerCell, {
                                            flex: header.flex,
                                            textAlign: "center",
                                            fontSize: 8,
                                            fontWeight: "bold",
                                        }]}
                                >
                                    {header.label}
                                </Text>
                            ))}
                        </View>
                        {/*  Grouped Rows */}

                        {(singleData?.cuttingDeliveryItems || []).map((item, index) => {
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
                                    <Text style={[styles.tableCell, { flex: 0.3, fontSize: 7, textAlign: "center" }]}>
                                        {index + 1}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                        {item?.StyleItem?.name || ""}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                        {item?.Fabric?.name || ""}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                        {item?.Color?.name || ""}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7 }]}>
                                        {item?.Portion?.name || ""}
                                    </Text>
                                    {/* <Text style={[styles.tableCell, { flex: 0.5, fontSize: 7, textAlign: "right" }]}>
                                        {item.fabWidth || ""}
                                    </Text> */}
                                    <Text style={[styles.tableCell, { flex: 0.4, fontSize: 7, textAlign: "right" }]}>
                                        {item.usedMeter || ""}
                                    </Text>
                                    {sizeColumns.map((col) => {
                                        const sizeItem =
                                            item.sizeDetails?.find((s) => s.sizeId === col.sizeId) || { qty: "" };

                                        return (
                                            <Text
                                                key={col.sizeId}
                                                style={[
                                                    styles.tableCell,
                                                    { flex: 0.3, fontSize: 7, textAlign: "right" }
                                                ]}
                                            >
                                                {sizeItem.qty || ""}
                                            </Text>
                                        );
                                    })}
                                    <Text style={[styles.tableCell, { flex: 0.3, fontSize: 7, textAlign: "right" }]}>
                                        {item.issueQty || ""}
                                    </Text>
                                    <Text style={[styles.tableCell, { flex: 0.3, fontSize: 7, textAlign: "right" }]}>
                                        {item.usedMeter && item.issueQty
                                            ? (item.usedMeter / item.issueQty).toFixed(2)
                                            : ""}
                                    </Text>
                                    {/* <Text style={[styles.tableCell, { flex: 1, fontSize: 7 }]}>
                                        {item.remarks || ""}
                                    </Text> */}
                                </View>
                            );
                        })}
                        {/* <View style={{
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
                                        flex: 6.8,
                                        fontSize: 9,
                                        textAlign: "right",
                                    },
                                ]}
                            >
                                Total
                            </Text>
                            <Text style={[styles.headerCell, , { flex: 0.8, fontSize: 8, textAlign: "right" }]}>
                                {singleData?.salesReturnItems?.reduce((sum, row) => sum + row.returnQty, 0)}
                            </Text>
                        </View> */}
                    </View>

                </View>
            </PageWrapper>
        </Document>
    );
};

export default PDF;

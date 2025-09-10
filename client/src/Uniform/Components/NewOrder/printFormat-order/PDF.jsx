import React from "react";
import PageWrapper from "../../../../Utils/PageWrapper";
import { Text, View } from "@react-pdf/renderer";
import tw from "../../../../Utils/tailwind-react-pdf";
import moment from "moment";
import { Document, StyleSheet } from "@react-pdf/renderer";

const PDF = ({ singleData }) => {
  const customerName = singleData?.customer?.name;
  const customerAddress = singleData?.customer?.address;
  const customerMobile = singleData?.customer?.mobileNumber;

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

  let overallGrandTotal = 0;
  return (
    <Document>
      <PageWrapper
        heading={"ORDER"}
        singleData={singleData}
        DeliveryNo={"CuttingOrder.No :"}
        DeliveryDate={"CuttingOrder.Date :"}
      >
        <View style={styles.container}>
          <Text style={tw("ml-80  text-base text-black")}>ORDERSHEET</Text>
          {/*  Customer Details */}
          <View style={tw("flex flex-row justify-around w-full p-2")}>
            {/* ✅ Left Column - Customer Info */}
            <View style={tw("flex flex-col w-1/2 gap-y-2")}>
              {/* Customer Name */}
              <View style={tw("flex flex-row gap-x-2")}>
                <Text
                  style={[
                    tw("text-xs font-bold"),
                    { fontWeight: 900, fontFamily: "Times-Bold" },
                  ]}
                >
                  Customer
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
                <Text style={tw("text-xs ml-2")}>{customerName}</Text>
              </View>

              {/* Address */}
              <View style={tw("flex flex-row gap-x-2")}>
                <Text
                  style={[
                    tw("text-xs font-bold"),
                    { fontWeight: 900, fontFamily: "Times-Bold" },
                  ]}
                >
                  Address
                </Text>
                <Text
                  style={[
                    tw("text-xs font-bold leading-normal"),
                    {
                      fontWeight: 900,
                      fontFamily: "Times-Bold",
                      marginLeft: 8,
                    },
                  ]}
                >
                  :
                </Text>
                <Text style={tw("text-xs ml-2 w-60 leading-4")}>
                  {customerAddress}
                </Text>
              </View>

              {/* Phone No */}
              <View style={tw("flex flex-row gap-x-2")}>
                <Text
                  style={[
                    tw("text-xs font-bold"),
                    { fontWeight: 900, fontFamily: "Times-Bold" },
                  ]}
                >
                  Phone No
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
                  {singleData?.customer?.mobileNumber || "N/A"}
                </Text>
              </View>
            </View>

            {/* ✅ Right Column - Order Info */}
            <View style={tw("flex flex-col gap-x-20 pl-20 w-1/2 gap-y-2")}>
              {/* Order No */}
              <View style={tw("flex flex-row gap-x-2 justify-start")}>
                <Text
                  style={[
                    tw("text-xs font-bold"),
                    { fontWeight: 900, fontFamily: "Times-Bold" },
                  ]}
                >
                  Order No
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
                <Text style={tw("text-xs ml-2")}>
                  {singleData?.docId || ""}
                </Text>
              </View>

              {/* Order Date */}
              <View style={tw("flex flex-row gap-x-2 justify-start")}>
                <Text
                  style={[
                    tw("text-xs font-bold"),
                    { fontWeight: 900, fontFamily: "Times-Bold" },
                  ]}
                >
                  Order Date :
                </Text>

                <Text style={tw("text-xs ml-2")}>
                  {moment(singleData?.orderdate).format("YYYY-MM-DD")}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/*  Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View fixed style={styles.tableHeader}>
              {[
                { label: "S.No", flex: 0.4 },
                { label: "Type", flex: 1 },
                { label: "Fiber Content", flex: 3 },
                { label: "GSM", flex: 1.3 },
                { label: "Width", flex: 0.6 },
                { label: "Color", flex: 1.2 },
                { label: "Price", flex: 1 },
                { label: "SurCharges", flex: 1 },
                { label: "Unit", flex: 0.5 },
                { label: "Quantity", flex: 1 },
                { label: "Amount", flex: 1.3 },
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
            </View>
            {/*  Grouped Rows */}

            {(singleData?.orderBillItems || [])?.map((item, groupIndex) => {
              let groupTotal = 0;

              return (
                <React.Fragment key={groupIndex}>
                  {/* Group Header Row */}
                  <View
                    wrap
                    style={{
                      flexDirection: "row",
                      width: "100%",
                      borderBottomWidth: 1,
                      borderBottomColor: "#D1D5DB",
                    }}
                  >
                    {/* Serial Number */}
                    <View
                      style={[
                        styles.tableCell,
                        {
                          flex: 0.4,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "white",
                           borderLeftWidth: 1,
                          borderLeftStyle: "solid",
                          borderColor: "#D1D5DB",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: 8,
                        }}
                      >
                        {groupIndex + 1}
                      </Text>
                    </View>

                    {/* Fabric Code (now acts as header for this group) */}
                    <View
                      style={[
                        styles.tableCell,
                        {
                          flex: 15.6, // Span remaining width
                          justifyContent: "flex-start",
                          paddingLeft: 4,
                          //   backgroundColor: "#F3F4F6",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          textAlign: "left",
                          fontWeight: "bold",
                          fontSize: 8,
                        }}
                      >
                        Fabric Code: {item?.styleSheet?.fabCode || "-"}
                      </Text>
                    </View>
                  </View>

                  {/* Subgrid Rows */}
                  {item?.subGrid?.map((subItem, subIndex) => {
                    const qty = parseFloat(subItem?.quantity || 0);
                    const price = parseFloat(subItem?.priceFob || 0);
                    const surCharges = parseFloat(subItem?.surCharges || 0);
                    const total = ((price + surCharges) * qty).toFixed(2);

                    groupTotal += parseFloat(total);

                    return (
                      <View
                        wrap={false}
                        key={subIndex}
                        style={[
                          styles.tableRow,
                          subIndex % 2 !== 0 && styles.tableRowOdd,
                          { flexDirection: "row" },
                        ]}
                      >
                        {[
                          {
                            value: subItem?.fabType || "",
                            flex: 1.7,
                            textAlign: "center",
                          },
                          {
                            value: subItem?.fiberContent || "",
                            flex: 3.1,
                            textAlign: "left",
                          },
                          {
                            value: subItem?.weightGSM || "",
                            flex: 1.3,
                            textAlign: "right",
                          },
                          {
                            value: subItem?.widthFinished || "",
                            flex: 0.6,
                            textAlign: "right",
                          },
                          {
                            value: subItem?.color?.name || "",
                            flex: 1.2,
                            textAlign: "left",
                          },
                          {
                            value: `$ ${price.toFixed(2)}`,
                            flex: 1,
                            textAlign: "right",
                          },
                          {
                            value: `$ ${surCharges.toFixed(2)}`,
                            flex: 1,
                            textAlign: "right",
                          },
                          {
                            value: subItem?.UnitOfMeasurement?.name || "",
                            flex: 0.5,
                            textAlign: "left",
                          },
                          {
                            value: qty.toFixed(3),
                            flex: 1,
                            textAlign: "right",
                          },
                          {
                            value: `$ ${parseFloat(total).toFixed(2)}`,
                            flex: 1.3,
                            textAlign: "right",
                          },
                        ].map((cell, i) => (
                          <Text
                            key={i}
                            style={[
                              styles.tableCell,
                              {
                                flex: cell.flex,
                                textAlign: cell.textAlign,
                                fontSize: 8,
                              },
                            ]}
                          >
                            {cell.value}
                          </Text>
                        ))}
                      </View>
                    );
                  })}

                  {/* Sub Total Row */}
                  <View
                    style={[
                      styles.totalRow,
                      {
                        flexDirection: "row",
                        backgroundColor: "#E5E7EB",
                        marginTop: -3,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        {
                          flex: 12, // Full width excluding subtotal amount cell
                          textAlign: "right",
                          fontWeight: "bold",
                          fontSize: 8,
                          paddingRight: 4,
                          paddingTop: 5,
                        },
                      ]}
                    >
                      Sub Total:
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        {
                          flex: 1.3,
                          textAlign: "right",
                          fontWeight: "bold",
                          fontSize: 8,
                        },
                      ]}
                    >
                      $ {groupTotal.toFixed(2)}
                    </Text>
                  </View>

                  {(overallGrandTotal += groupTotal)}
                </React.Fragment>
              );
            })}
            {/*  Grand Total at the end */}
            <View style={[styles.totalRow]}>
              <Text
                style={[
                  styles.tableCell,
                  { flex: 9, backgroundColor: "white" , borderLeftWidth: 1,
                    borderLeftStyle: "solid",
                    borderColor: "#D1D5DB" ,borderBottomWidth: 1,
                    borderBottomStyle: "solid",},
                ]}
              ></Text>
              <Text
                style={[
                  {
                    flex: 1,
                    fontWeight: "bold",
                    fontSize: 8,
                    textAlign: "center",
                    backgroundColor: "white",
                    paddingTop: 5,
                   borderColor: "#D1D5DB",
                      borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                  },
                ]}
              >
                Grand Total:
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  {
                    flex: 1.2,
                    fontWeight: "bold",
                    fontSize: 8,
                    textAlign: "right",
                    backgroundColor: "white",
                    borderColor: "#D1D5DB",
                     borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                  },
                ]}
              >
                $ {overallGrandTotal.toFixed(2)}
              </Text>
            </View>
            {/*  Overall Grand Total */}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerText}>
            Email : info@peenics.in, Kannan@peenics.in
          </Text>
        </View>
      </PageWrapper>
    </Document>
  );
};

export default PDF;

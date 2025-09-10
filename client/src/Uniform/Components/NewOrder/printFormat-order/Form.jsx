import React from "react";
import PageWrapper from "../../../../Utils/PageWrapper";
import { Text, View } from "@react-pdf/renderer";
import tw from "../../../../Utils/tailwind-react-pdf";
import moment from "moment";

import { findFromList } from "../../../../Utils/helper";

const Form = ({ singleData, styles, docId, updatedOrderBillItems }) => {
  const customerName = singleData?.customer?.name;
  const customerAddress = singleData?.customer?.address;
  const customerMobile = singleData?.customer?.mobileNumber;

  console.log(updatedOrderBillItems, "updatedOrderBillItems in print");

  let overallGrandTotal = 0;

  return (
    <PageWrapper
      heading={"ORDER"}
      singleData={singleData}
      DeliveryNo={"CuttingOrder.No :"}
      DeliveryDate={"CuttingOrder.Date :"}
    >
      <View style={styles.container}>
        <Text style={tw("ml-80  text-base text-black")}>PROFORMA INVOICE</Text>
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
                  { fontWeight: 900, fontFamily: "Times-Bold", marginLeft: 2 },
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
                  { fontWeight: 900, fontFamily: "Times-Bold", marginLeft: 8 },
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
                  { fontWeight: 900, fontFamily: "Times-Bold", marginLeft: 2 },
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
                  { fontWeight: 900, fontFamily: "Times-Bold", marginLeft: 3 },
                ]}
              >
                :
              </Text>
              <Text style={tw("text-xs ml-2")}>{singleData?.docId || ""}</Text>
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
          <View style={styles.tableHeader}>
            {[
              { label: "S.No", flex: 0.4 },
              { label: "Fabric Code", flex: 3.5 },
              { label: "Fabric", flex: 1 },
              { label: "Fiber Content", flex: 4 },
              { label: "GSM", flex: 1 },
              { label: "Width", flex: 0.6 },
              { label: "Price", flex: 0.8 },
              { label: "Color", flex: 1.2 },
              { label: "Unit", flex: 0.5 },
              { label: "Quantity", flex: 1 },
              { label: "Actual Quantity", flex: 1 },
              { label: "Amount", flex: 1 },
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

          {(updatedOrderBillItems || [])?.map((item, groupIndex) => {
            let groupTotal = 0;

            return (
              <React.Fragment key={groupIndex}>
                {/*  Group Rows */}
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    borderBottomWidth: 1,
                    // borderColor: "#D1D5DB",
                  }}
                >
                  {/* Serial Number */}
                  <View
                    style={[
                      styles.tableCell,
                      {
                        flex: 0.3,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "white",
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

                  {/*  FabCode */}
                  <View
                    style={[
                      styles.tableCell,
                      {
                        flex: 2.7,
                        justifyContent: "center",
                        backgroundColor: "white",
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
                      {/* {findFromList(item?.fabCode, styleData, "fabCode") ||
                        "N/A"} */}
                      {item?.styleSheet.fabCode}
                    </Text>
                  </View>

                  {/*  Subgrid Rows */}
                  <View style={{ flex: 10 }}>
                    {item?.subGrid?.map((subItem, subIndex) => {
                      const quantity =
                        subItem?.actualQuantity != null &&
                        subItem?.actualQuantity !== "" 
                          ? subItem.actualQuantity
                          : subItem?.quantity || 0;

                      const total = (
                        parseFloat(quantity) *
                        parseFloat(subItem?.priceFob || 0)
                      ).toFixed(2);
                      groupTotal += parseFloat(total);

                      return (
                        <View
                          key={subIndex}
                          style={[
                            styles.tableRow,
                            subIndex % 2 !== 0 && styles.tableRowOdd,
                            {
                              flexDirection: "row",
                              // alignItems: "center",
                              // backgroundColor: "#E5E7EB",
                            },
                          ]}
                        >
                          {[
                            {
                              value: subItem?.fabType,
                              flex: 1,
                              textAlign: "left",
                            },
                            {
                              value: subItem?.fiberContent,
                              flex: 4,
                              textAlign: "left",
                            },
                            {
                              value: subItem?.weightGSM,
                              flex: 1,
                              textAlign: "right",
                            },
                            {
                              value: subItem?.widthFinished,
                              flex: 0.6,
                              textAlign: "right",
                            },
                            {
                              value: subItem?.priceFob,
                              flex: 0.8,
                              textAlign: "right",
                            },
                            {
                              value: subItem?.color?.name,
                              flex: 1.2,
                              textAlign: "left",
                            },
                            {
                              value: subItem?.UnitOfMeasurement?.name,
                              flex: 0.5,
                              textAlign: "left",
                            },
                            {
                              value: parseFloat(subItem?.quantity ?? 0).toFixed(
                                3
                              ),
                              flex: 1,
                              textAlign: "right",
                            },
                            {
                              value: parseFloat(
                                subItem?.actualQuantity ?? 0
                              ).toFixed(3),
                              flex: 1,
                              textAlign: "right",
                            },

                            { value: total, flex: 1, textAlign: "right" },
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
                              {cell.value || "N/A"}
                            </Text>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/*  Sub Total after each group */}
                <View style={styles.totalRow}>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 10,
                        textAlign: "right",
                        fontWeight: "bold",
                        fontSize: 8,
                        backgroundColor: "#E5E7EB",
                        marginTop: -3,
                      },
                    ]}
                  >
                    Sub Total:
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 0.7,
                        textAlign: "right",
                        fontWeight: "bold",
                        fontSize: 8,
                        backgroundColor: "#E5E7EB",
                        marginTop: -3,
                      },
                    ]}
                  >
                    {groupTotal.toFixed(2)}
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
                { flex: 10.4, backgroundColor: "white" },
              ]}
            ></Text>
            <Text
              style={[
                styles.tableCell,
                {
                  flex: 1,
                  fontWeight: "bold",
                  fontSize: 8,
                  textAlign: "center",
                  backgroundColor: "white",
                  // marginTop:-1
                },
              ]}
            >
              Grand Total:
            </Text>
            <Text
              style={[
                styles.tableCell,
                {
                  flex: 0.8,
                  fontWeight: "bold",
                  fontSize: 8,
                  textAlign: "right",
                  backgroundColor: "white",
                  // marginTop:-1
                },
              ]}
            >
              {overallGrandTotal.toFixed(2)}
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
  );
};

export default Form;

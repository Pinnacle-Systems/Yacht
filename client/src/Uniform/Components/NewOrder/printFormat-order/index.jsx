import { Document, StyleSheet } from "@react-pdf/renderer";
import Form from "./Form";


const PrintFormat = ({ singleData, docId }) => {
  console.log(singleData, "singleData in index");

  const orderBillItems = singleData?.orderBillItems;
  console.log(orderBillItems, "orderBillItems");

  const purchaseInwardEntryGrid = singleData?.purchaseInwardEntry?.flatMap(
    (item) => item.purchaseInwardEntryGrid
  );

  console.log(purchaseInwardEntryGrid, "purchaseInwardEntry");

  // const order_fabCode = orderBillItems?.StyleSheet?.id
  // const inward_fabCode = purchaseInwardEntry?.StyleSheet?.id
  // const order_Color  = orderBillItems?.orderDeatailsSubGrid?.color?.id
  // const inward_color = purchaseInwardEntry?.purchaseInwardEntrySubGrid?.color?.id
  // const fab_Match = order_fabCode === inward_fabCode;
  // const color_Match = order_Color === inward_color;
  // if(fab_Match && color_Match ){
  //   let actualQuantity;
  // }
  const orderStyleIds = orderBillItems?.map((item) => item?.styleSheet?.id);

  console.log(orderStyleIds, "orderStyleIds");

  const inwardStyleIds = purchaseInwardEntryGrid?.map(
    (item) => item?.styleSheet?.id
  );
  console.log(inwardStyleIds, "inwardStyleIds");

  const orderColorIds = orderBillItems?.flatMap((item) =>
    item?.subGrid?.map((sub) => sub?.colorId)
  );
  console.log(orderColorIds, "orderColorIds");

  const inwardColorIds = purchaseInwardEntryGrid?.flatMap((item) =>
    item?.purchaseInwardEntrySubGrid?.map((sub) => sub?.colorId)
  );

  console.log(inwardColorIds, "inwardColorIds");

  const styleMatch =
    orderStyleIds?.length === inwardStyleIds?.length &&
    orderStyleIds?.every((id) => inwardStyleIds?.includes(id));
  const colorMatch =
    orderColorIds?.length === inwardColorIds?.length &&
    orderColorIds?.every((id) => inwardColorIds?.includes(id));

  console.log(styleMatch, "styleMatch");
  console.log(colorMatch, "colorMatch");

  let updatedOrderBillItems = orderBillItems;
  if (styleMatch && colorMatch) {
    updatedOrderBillItems = orderBillItems.map((item) => {
      // Find the matching grid by styleSheet.id
      const matchingInwardGrid = purchaseInwardEntryGrid?.filter(
        (inward) => inward?.styleSheet?.id === item?.styleSheet?.id
      );

      if (!matchingInwardGrid) return item;

      const updatedSubGrid = item?.subGrid?.map((subItem) => {
        // const matchingInwardSub =
        //   matchingInwardGrid?.purchaseInwardEntrySubGrid?.find(
        //     (inwardSub) => inwardSub?.colorId === subItem?.colorId
        //   );

        // if (!matchingInwardSub) return subItem;
        let matchedQuantity = 0;
        for (const inward of matchingInwardGrid || []) {
          const inwardSub = inward?.purchaseInwardEntrySubGrid?.find(
            (inwardSub) => inwardSub?.colorId === subItem?.colorId
          );
          if (inwardSub) {
            matchedQuantity += inwardSub?.actualQuantity || 0;
          }
        }

        return {
          ...subItem,
          actualQuantity: matchedQuantity || 0,
        };
      });

      return {
        ...item,
        subGrid: updatedSubGrid,
      };
    });
    console.log(
      updatedOrderBillItems,
      "Final updated order items with actualQuantity"
    );
  }

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
      border: "1 solid #e5e7eb",
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
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#D1D5DB",
      marginTop: 10,
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
    },
    headerCell: {
      flex: 1,
      padding: 1,
      fontSize: 7,
      textAlign: "center",
      fontWeight: "bold",
      borderRightWidth: 1,
      borderRightColor: "#D1D5DB",
      paddingTop: "4px",
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#D1D5DB",
      textAlign: "left",
    },
    tableRowOdd: {
      // backgroundColor: "#F9FAFB",
      // textTransform:"capitalize"
    },
    tableCell: {
      padding: 1,
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
  });
  return (
    <>
      <Document>
        <Form
          styles={styles}
          singleData={singleData}
          docId={docId}
          updatedOrderBillItems={updatedOrderBillItems}
        />
       
      </Document>
    </>
  );
};

export default PrintFormat;

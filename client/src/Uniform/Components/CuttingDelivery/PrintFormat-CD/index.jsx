import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import moment from 'moment';
// import numWords from 'num-words';
import logo from '../../../../assets/iknits.png'
import CuttingDelivery from './CuttingDelivery';


export default function PrintFormat({  singleData, docId }) {


  const findAmount = (qty, price, tax, discountType, disAmount) => {
    let taxAmount = 0;
    let grossAmount = parseFloat((parseFloat(qty) * parseFloat(price)) || 0).toFixed(2);
    let dicountAmount = 0;

    if (tax !== "") {
      let percentage = parseFloat(tax) / 100

      taxAmount = parseFloat(parseFloat(grossAmount) * percentage).toFixed(2)
    }

    if (discountType == "Flat") {
      dicountAmount = parseFloat(disAmount).toFixed(2)
    }
    else if (discountType == "Percentage") {
      let percentage = parseFloat(disAmount) / 100
      dicountAmount = parseFloat(parseFloat(grossAmount) * percentage).toFixed(2)
    }


    return (((parseFloat(grossAmount || 0) + parseFloat(taxAmount || 0)) - parseFloat(dicountAmount || 0)) || 0)

  }
  function getTotals(field) {
    const total = singleData?.CuttingDeliveryDetails?.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[field] ? current[field] : 0)
    }, 0)
    return parseFloat(total)
  }

  function getGross(field1, field2) {
    const total = singleData?.CuttingDeliveryDetails?.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[field1] || current[field2] ? current[field1] * current[field2] : 0)
    }, 0)
    return parseFloat(total)
  }

  function getTotalAmount(qty, price, tax, discountType, disAmount) {
    const total = singleData?.PoItems?.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[qty] || current[price] ? findAmount(current[qty], current[price], current[tax], current[discountType], current[disAmount]) : 0)
    }, 0)
    return parseFloat(total)
  }


  const styles = StyleSheet.create({
    page: { padding: 5, },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, },
    bold: {
      fontWeight: 'bold',
      fontSize: 14,
    },
    valueText: {
      fontSize: 7,
      color: '#555',
      paddingLeft: 3
  
    },
    labelpo: {
      fontSize: 7,
      textAlign: 'center',
      paddingLeft: 6
      
    },
    labelpo1: {
      fontSize: 7,
      textAlign: 'right',
      paddingRight: 8
    },
    fromInfoContainer: {
      width: '45%',
      // backgroundColor: '#f3f4f6', 
      padding: 6,
      borderRadius: 8,
    },
    rightContainer: {
      flexDirection: 'column',
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
      padding: 6,
      shadowColor: '#E5E7EB',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      width: '33%',
    },
    labelContainer: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#333',
    },
    photoContainer: {
      width: '15%',
      height: 80,
      marginRight: 10,
      borderRadius: 4,
      border: '1 solid #e5e7eb',
      padding: 2,
      backgroundColor: '#f3f4f6',
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 6,
      padding: 8,
      marginHorizontal: 4,
      marginVertical: 4,
      shadowColor: '#E5E7EB',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    bold: {
      fontWeight: 'bold',
      color: '#333',
      marginRight: 4,
    },
  
    valueContainer: {
      width: '60%',
      color: '#555',
    },
  
    container: {
      width: '100%',
      padding: 5,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 5,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#016B65',
    },
    title: {
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: '#B81981',
      letterSpacing: 0.5,
      marginVertical: 5,
    },
    withBorder: {
      borderRightWidth: 1,
      borderRightColor: '#E5E7EB',
    },
    logo: {
      width: 60,
      height: 60,
    },
  
    billInfoContainer: {
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    infoWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
  
    toInfoContainer: {
      width: '33%',
    },
    infoText: {
      fontSize: 7,
      marginVertical: 2,
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoText1: {
      fontSize: 7,
      marginVertical: 2,
      flexDirection: 'row',
      alignItems: 'center',
      color: '#016B65',
    },
    infoText2: {
      fontSize: 7,
      marginVertical: 2,
      flexDirection: 'row',
      alignItems: 'center',
  
    },
    totalRow: { flexDirection: 'row', backgroundColor: '#bfdbfe', padding: 5, fontWeight: 'bold' },
    icon: {
      marginRight: 6,
      width: 12,
      height: 12,
    },
    bold: {
      fontWeight: 'bold',
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: '#016B65',
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
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: '#016B65',
      paddingTop: 10,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 7,
      color: '#555',
      marginVertical: 2,
    },
    table: {
      display: "table",
      width: "auto",
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
      textAlign: "center",
  
    },
    headerCell: {
      flex: 1,
      padding: 9,
      fontSize: 7,
      textAlign: "center",
      fontWeight: "bold",
      borderRightWidth: 1,
      borderRightColor: "#D1D5DB",
   
  
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#D1D5DB",
      textAlign: "start",
  
      
  
    },
    tableRowOdd: {
      backgroundColor: "#F9FAFB",
      // textTransform:"capitalize"
    },
    tableCell: {
      flex:1,
      padding: 9,
  
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
      borderRightWidth: 1,
      borderRightColor: "#D1D5DB",
    },
  
  });


  return (
    <Document>
    <CuttingDelivery  singleData={singleData}  docId={docId} styles={styles}   getTotals={getTotals} findAmount={findAmount}  />
    </Document>
  );
}


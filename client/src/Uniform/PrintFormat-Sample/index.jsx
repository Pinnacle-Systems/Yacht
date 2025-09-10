import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from '@react-pdf/renderer';
import moment from 'moment';
import logo from '../../assets/iknits.png'
import { getImageUrlPath } from '../../Constants';
export default function PrintFormat({ branch, party, date, data, id, docId,singleData}) {
  return (
    <Document>{console.log(singleData||[]," for Print")}
      <Page style={styles.page}>
        <View fixed style={styles.headerContainer}>
        <Image style={styles.logo} src={logo} />

          <Text style={styles.title}>
           Sample Register Form
          </Text>
          <View style={styles.billInfoContainer}>
            <Text style={styles.infoText2}>
              <Text style={styles.bold}>Sample.No</Text>: {docId || ''}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Sample.Date</Text>: {moment(date).format("DD-MM-YYYY")}
            </Text>
           
          </View>
        </View>
        <View style={styles.container}>
        <View style={styles.infoWrapper}>
            <View style={styles.fromInfoContainer}>
              <Text style={styles.infoText1}>
                <Svg style={styles.icon} viewBox="0 0 24 24"><Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></Svg>
                <Text style={styles.bold}></Text> I Knits
              </Text>
              <Text style={styles.infoText}>
                <Svg style={styles.icon} viewBox="0 0 24 24"><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></Svg>
                <Text style={styles.bold}></Text>{branch.contactName}
              </Text>
              <Text style={styles.infoText}>
                <Svg style={styles.icon} viewBox="0 0 24 24"><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></Svg>
                <Text style={styles.bold}></Text>{branch.address}
              </Text>
              <Text style={styles.infoText}>
                <Svg style={styles.icon} viewBox="0 0 24 24"><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></Svg>
                <Text style={styles.bold}></Text>{branch.contactMobile}
                </Text>
            </View>
            <View style={styles.toInfoContainer}>
            <Text style={styles.infoText1}>
                <Svg style={styles.icon} viewBox="0 0 24 24"><Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></Svg>
                <Text style={styles.bold}></Text> Buyer Details
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.bold}></Text>{party?.name || ''}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.bold}></Text>{party?.address || ''}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.bold}></Text>{party?.City?.name || ''}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.bold}></Text> {party?.pincode  || ''}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.bold}></Text>{party?.contactMobile || ''}
              </Text>
            </View>
            <View style={styles.rightContainer}>
    {[
      { label: 'docId : ', value:docId || '' },
      { label: 'Doc.Date : ', value: moment(date).format("DD-MM-YYYY")|| '' },
      { label: 'Cont.Per : ', value: data?.contactPersonName || '' },
      { label: 'Style : ', value: data?.Style?.name || '' },
     { label: 'Delivery.Date : ', value:  moment(data?.validDate).format("DD-MM-YYYY") || '' },

    ].map((item, index) => (
      <View key={index} style={styles.infoText}>
        <Text style={styles.labelContainer}>{item.label}</Text>
        <Text style={styles.valueContainer}>{item.value}</Text>
      </View>
    ))}
  </View>
          </View>
      
          <View style={styles.infoWrapper}>
           
        
          </View>
          <View style={styles.divider} />
          <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>

              <Text style={styles.tableHeaderCell}>ItemType</Text>
              <Text style={styles.tableHeaderCell}>Item</Text>
              <Text style={styles.tableHeaderCell}>Fabric</Text>
              <Text style={styles.tableHeaderCell}>Size</Text>
              <Text style={styles.tableHeaderCell}>Color</Text>
              <Text style={styles.tableHeaderCell}>Comments</Text>
              <Text style={styles.tableHeaderCell}>Image</Text>

            </View>
            {(singleData || []).map((item, index) => (
              <View key={index} style={[styles.tableRow, index % 2 !== 0 && styles.tableRowOdd]}>
                <Text style={styles.tableCell}>
                  {item?.ItemType?.name|| ''}
                </Text>
                <Text style={styles.tableCell}>{item?.Item?.name || ''}</Text>
                <Text style={styles.tableCell}>{item?.Fabric?.name || ''}</Text>
                <Text style={styles.tableCell}>{item?.Size?.name || ''}</Text>
                <Text style={styles.tableCell}>{item?.Color?.name || ''}</Text>
                <Text style={styles.tableCell}>{item?.comment || ''}</Text>
                <View style={styles.photoContainer}>
                 <Image style={styles.photo} src={getImageUrlPath(item?.filePath || '')} />
                 </View>

              </View>
            ))}
           
          </View>
       

<View style={styles.amountInWordsContainer}>
  <Text style={styles.amountInWordsText}>
    <Svg style={styles.icon} viewBox="0 0 24 24">
      <Path d="M4 4h16v16H4V4zm1.5 1.5v3H6v-3h2v3h1.5v-3h2v3h1.5v-3h2v3h1.5v-3H18v6h-6v-1.5H7.5V18h-2v-6H6v3H4.5v-6H6v1.5h2V6H6V4.5H5.5z" />
    </Svg>
  </Text>
</View>

        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerText}>Contact us:  iKnits@gmail.com</Text>
          <Text style={styles.footerText}>{branch.contactMobile}</Text>
        </View>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 15,
  },
 
  fromInfoContainer: {
    width: '33%',
    backgroundColor: '#f3f4f6', // Light background color
    padding: 6,
    borderRadius: 8,
  },
  rightContainer: {
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 6,
    shadowColor: '#000',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,             
  },
  valueText: {
    color: '#555',
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
    backgroundColor: '#e0f7f6', 
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
    borderRightColor: '#000',
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
  fromInfoContainer: {
    width: '33%',
  },
  toInfoContainer: {
    width: '33%',
  },
  infoText: {
    fontSize: 8,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText1: {
    fontSize:8,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    color: '#016B65',
  },
  infoText2: {
    fontSize:8,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    padding: 5,
    borderRadius: 10

  },
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

tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    padding: 4,
    borderTopWidth: 1,
    borderColor: '#000',
},
tableHeaderCell: {
    flex: 1,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#ddd',
},

tableRow: {
    flexDirection: 'row',
    padding: 4,
    borderBottomWidth: 1,
    borderColor: '#ddd',
},
tableRowOdd: {
    backgroundColor: '#F9FAFB',
},
tableCell: {
    flex: 1,
    fontSize: 8,
    textAlign: 'left',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 5
},
tableCell1: {
    flex: 1,
    fontSize: 10,
    textAlign: 'right',
    paddingRight: 33,
    borderWidth: 1,
    borderColor: '#ddd',
},
tableFooter: {
    flexDirection: 'row',
    padding: 4,
    borderTopWidth: 1,
    borderColor: '#000',
    backgroundColor: '#E5E7EB',
},
tableFooterCell: {
    flex: 1,
    fontSize:8,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
},
tableFooterCell1: {
    flex: 1,
    fontSize:8,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 123,
    borderWidth: 1,
    borderColor: '#ddd',
},

  amountInWordsContainer: {
    marginTop: 15,
    marginBottom: 15,

    borderTopWidth: 1,
    borderTopColor: '#016B65',
    paddingTop: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
  },

  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#016B65',
    paddingTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#555',
    marginVertical: 2,
  },
  
});
import React from 'react'
import { Document, Page, View, PDFViewer, Text } from '@react-pdf/renderer';
import tw from '../../../Utils/tailwind-react-pdf';
import BarcodeGenerator from '../BarcodeGenerator';


const BarCodePrintFormat = ({ data }) => {
    return (
        <PDFViewer style={tw("h-full w-full")}>
            <Document width={500} height={300} style={tw("h-full w-full")} >
                {data.map((i, index) =>
                    <Page size="A4" key={index} style={tw("flex flex-row flex-wrap gap-5 justify-center")} >
                        <Text render={({ pageNumber, totalPages }) => (
                            `${pageNumber} / ${totalPages}`
                        )} fixed />
                        {Array.from({ length: parseInt(i?.qty ? i?.qty : 0) }, (j, index) =>
                            <View key={index}>
                                <BarcodeGenerator value={i.barCode} />
                            </View>
                        )}
                    </Page>
                )}
            </Document>
        </PDFViewer>
    )
}

export default BarCodePrintFormat
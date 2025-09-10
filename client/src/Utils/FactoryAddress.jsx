import React from 'react';
import { Document, Page, Text, Link, StyleSheet, View } from '@react-pdf/renderer';

import tw from './tailwind-react-pdf'
// Define styles using react-pdf
const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    title: {
        fontSize: 12,
        fontWeight: 'bold',
        

    },
    paragraph: {
        fontSize: 10,
        marginBottom: 5,

        textAlign: 'justify',

    },
    link: {
        color: 'blue',
    },
});

const FactoryAddress = () => (

    <>

   <View style={tw("  ")}>

  
        <View style={tw("w-full flex flex-col items-end justify-end ml-80 ")}>
        <View  >
                <Text  style={tw(" ")}></Text>
            </View>
            <View>
                <Text></Text>
            </View>
            <View>
                <Text></Text>
            </View>
            <Text style={tw("")}>
                Authorized By

            </Text>



        </View>
        <View style={tw("w-full flex flex-col items-center justify-center ml-48    ")}>
            <Text style={[styles.title]}>
                Thank you for your business!
            </Text>

            {/* <Text style={tw(" font-bold text-blue-400")}>
                Contact us: iKnits@gmail.com
            </Text> */}

        </View>
        </View>
    </>

);

export default FactoryAddress;

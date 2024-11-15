import React from 'react';
import {Document, Font, Image, Page, StyleSheet, Text, View} from '@react-pdf/renderer';

const Report = ({data, columns}) => {
    const logo = 'src/assets/images/connect-academy.png';
    const rows = data;
    Font.register({
        family: 'Amiri-Regular',
        src: 'src/assets/fonts/Amiri-Regular.ttf',
    });
    const styles = StyleSheet.create({
        titleContainer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
        page: {
            padding: 20,
        },
        title: {
            fontSize: 20,
            textAlign: 'center',
            marginBottom: 20,
        },
        table: {
            display: "table",
            width: "auto",
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: "#d9d9d9",
            borderRadius: 8,
        },
        tableRow: {
            flexDirection: "row",
            borderBottom: "1px solid #d9d9d9",
        },
        tableHeader: {
            backgroundColor: "#f0f0f0",
            flexDirection: "row",
            fontWeight: "bold",
        },
        tableCell: {
            margin: 5,
            flexGrow: 1,
            flexBasis: '0%',
            padding: 5,
            textAlign: "center",
            fontFamily: 'Amiri-Regular',
            fontSize: 10,
            flexWrap: 'wrap',
            wordBreak: 'break-word',
            direction: 'rtl',
        },
        logo: {
            width: 100,
            height: 100,
        },
    });

    const Title = () => (
        <View style={styles.titleContainer}>
            <Image src={logo} style={styles.logo}/>
            <Text style={styles.title}>Connect Academy</Text>
        </View>
    );

    const TableHeaders = () => (
        <View style={[styles.tableRow, styles.tableHeader]}>
            {columns.map((col, index) => (
                <Text key={index} style={styles.tableCell}>{col.header}</Text>
            ))}
        </View>
    );

    const TableBody = () => (
        <View>
            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.tableRow}>
                    {columns.map((col, colIndex) => (
                        <Text key={colIndex} style={styles.tableCell}>
                            {typeof row[col.field] === 'object' && row[col.field] !== null
                                ? col.nestedField != null ? row[col.field][col.listFieldName][col.nestedField] : row[col.field][col.listFieldName]
                                : row[col.field] || ""}
                        </Text>
                    ))}
                </View>
            ))}
        </View>
    );


    return (
        <Document
            options={{
                cMapUrl: '/cmaps/',
                cMapPacked: true,
            }}
        >
            <Page size="A1" style={styles.page}>
                <Title/>
                <View style={styles.table}>
                    <TableHeaders/>
                    <TableBody/>
                </View>
            </Page>
        </Document>
    );
};

export default Report;

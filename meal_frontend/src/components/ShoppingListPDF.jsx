import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Estilos
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        fontFamily: 'Helvetica',
        color: '#1f2937',
    },
    // CABECERA
    header: {
        marginBottom: 25,
        borderBottomWidth: 2,
        borderBottomColor: '#E11D48', // Berry
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    headerLeft: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold', // Helvetica standard soporta bold básico
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#E11D48',
    },
    subtitle: {
        fontSize: 10,
        marginTop: 4,
        color: '#6b7280',
    },
    headerRight: {
        fontSize: 10,
        color: '#9ca3af',
        textAlign: 'right',
    },
    // TABLA
    section: {
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#e5e7eb',
        alignItems: 'center',
        paddingVertical: 10,
    },
    // --- CHECKBOX VACÍO ---
    checkBox: {
        width: 14,
        height: 14,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 7, // Círculo
        marginRight: 12,
    },
    // --- CHECKBOX RELLENO (CON LA X) ---
    checkBoxFilled: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#E11D48', // Fondo Berry
        marginRight: 12,
        justifyContent: 'center',   // Centrar X vertical
        alignItems: 'center',       // Centrar X horizontal
    },
    // --- LA X ---
    checkMarkText: {
        color: '#ffffff', // X Blanca
        fontSize: 8,      // Pequeña para que quepa
        fontWeight: 'bold',
        marginBottom: 1,  // Ajuste fino visual
    },
    // TEXTOS
    itemName: {
        fontSize: 11,
        color: '#374151',
        flexGrow: 1,
        fontWeight: 'bold',
    },
    itemPurchased: {
        fontSize: 11,
        color: '#9ca3af',
        flexGrow: 1,
        textDecoration: 'line-through',
    },
    quantityBadge: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 9,
        color: '#111827',
        minWidth: 50,
        textAlign: 'center',
    },
    quantityPurchased: {
        color: '#d1d5db',
        fontSize: 9,
        textAlign: 'right',
        minWidth: 50,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 8,
        borderTopWidth: 0.5,
        borderTopColor: '#f3f4f6',
        paddingTop: 10,
    },
});

export const ShoppingListPDF = ({ shoppingList, groupName }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* CABECERA */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>Lista de la Compra</Text>
                        <Text style={styles.subtitle}>
                            GRUPO: {groupName.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text>{shoppingList.start_date} / {shoppingList.end_date}</Text>
                        <Text style={{ marginTop: 2 }}>{shoppingList.items.length} productos</Text>
                    </View>
                </View>

                {/* LISTA */}
                <View style={styles.section}>
                    {shoppingList.items.map((item, index) => (
                        <View key={index} style={styles.row}>

                            {/* LÓGICA CHECKBOX */}
                            {item.is_purchased ? (
                                <View style={styles.checkBoxFilled}>
                                    <Text style={styles.checkMarkText}>X</Text>
                                </View>
                            ) : (
                                <View style={styles.checkBox} />
                            )}

                            {/* NOMBRE */}
                            <Text style={item.is_purchased ? styles.itemPurchased : styles.itemName}>
                                {item.name}
                            </Text>

                            {/* CANTIDAD */}
                            {item.is_purchased ? (
                                <Text style={styles.quantityPurchased}>
                                    {item.quantity} {item.unit}
                                </Text>
                            ) : (
                                <View style={styles.quantityBadge}>
                                    <Text>{item.quantity} {item.unit}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* FOOTER */}
                <Text style={styles.footer}>
                    Generado automáticamente por MealPlanner.
                </Text>

            </Page>
        </Document>
    );
};
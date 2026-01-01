import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#16a34a',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6', // Gris muy clarito
        alignItems: 'center',
        paddingVertical: 8,
    },
    // ESTILO DE LA CAJA DE CHECK
    checkBox: {
        width: 15,
        height: 15,
        borderWidth: 1,
        borderColor: '#374151',
        marginRight: 10,
        justifyContent: 'center', // Centrar la X o el tick verticalmente
        alignItems: 'center',     // Centrar horizontalmente
    },
    // ESTILO DEL CHECK DENTRO DE LA CAJA
    checkMark: {
        fontSize: 10,
        color: '#16a34a', // Verde
        fontWeight: 'bold',
    },
    itemName: {
        fontSize: 12,
        color: '#1f2937',
        flexGrow: 1,
    },
    // ESTILO PARA TEXTO YA COMPRADO (Gris)
    itemPurchased: {
        fontSize: 12,
        color: '#9ca3af', // Gris claro
        flexGrow: 1,
        textDecoration: 'line-through', // Tachado (opcional, react-pdf lo soporta en versiones recientes)
    },
    quantity: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
    },
    unit: {
        fontSize: 10,
        color: '#6b7280',
        marginLeft: 2,
        width: 40,
        textAlign: 'right'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 10,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 10,
    },
});

export const ShoppingListPDF = ({ shoppingList, groupName }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* CABECERA */}
            <View style={styles.header}>
                <Text style={styles.title}>Lista de la Compra</Text>
                <Text style={styles.subtitle}>
                    Grupo: {groupName} | {shoppingList.start_date} - {shoppingList.end_date}
                </Text>
            </View>

            {/* LISTA DE ITEMS */}
            <View>
                {shoppingList.items.map((item, index) => (
                    <View key={index} style={styles.row}>

                        {/* LÓGICA DEL CHECKBOX */}
                        <View style={styles.checkBox}>
                            {/* Si está comprado, pintamos una X o un tick */}
                            {item.is_purchased && (
                                <Text style={styles.checkMark}>X</Text>
                            )}
                        </View>

                        {/* NOMBRE (Si está comprado, sale en gris) */}
                        <Text style={item.is_purchased ? styles.itemPurchased : styles.itemName}>
                            {item.name}
                        </Text>

                        {/* CANTIDAD (Si está comprado, también en gris para que no destaque) */}
                        <Text style={item.is_purchased ? { ...styles.quantity, color: '#9ca3af' } : styles.quantity}>
                            {item.quantity}
                        </Text>
                        <Text style={styles.unit}>{item.unit}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.footer}>
                Generado por MealPlanner - Lo marcado (X) ya lo tienes.
            </Text>

        </Page>
    </Document>
);
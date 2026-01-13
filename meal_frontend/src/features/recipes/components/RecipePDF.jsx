import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Paleta de colores (Hardcoded para PDF)
const COLORS = {
    primary: '#E11D48', // Berry
    primaryLight: '#fff1f2', // Rose-50
    text: '#1f2937',    // Gray-800
    textLight: '#6b7280', // Gray-500
    border: '#e5e7eb',  // Gray-200
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        color: COLORS.text,
        fontSize: 11,
    },
    // CABECERA
    header: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
        paddingBottom: 15,
    },
    titleBlock: {
        width: '70%',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
        lineHeight: 1,
    },
    // BADGES (Raciones / Autor)
    metaRow: {
        flexDirection: 'row',
        gap: 10,
    },
    badge: {
        backgroundColor: COLORS.primary,
        color: 'white',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        fontSize: 8,
        fontWeight: 'bold',
    },
    authorText: {
        fontSize: 9,
        color: COLORS.textLight,
        marginTop: 4,
    },
    // IMAGEN
    imageContainer: {
        height: 200,
        marginBottom: 25,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
    },
    recipeImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    // CONTENIDO PRINCIPAL (2 Columnas)
    contentContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    // SIDEBAR INGREDIENTES
    sidebar: {
        width: '35%',
        backgroundColor: COLORS.primaryLight, // Fondo rosita suave
        padding: 15,
        borderRadius: 8,
    },
    sidebarTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(225, 29, 72, 0.2)',
        paddingBottom: 5,
    },
    ingredientRow: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start',
    },
    bullet: {
        width: 10,
        color: COLORS.primary,
        fontSize: 14,
        lineHeight: 0.8,
    },
    ingredientText: {
        fontSize: 10,
        flex: 1,
        lineHeight: 1.4,
    },
    quantityText: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    // COLUMNA INSTRUCCIONES
    mainColumn: {
        width: '65%',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 5,
    },
    instructionText: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#374151',
        textAlign: 'justify',
    },
    // FOOTER
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        textAlign: 'center',
        color: '#9ca3af',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 10,
    }
});

export const RecipePDF = ({ recipe }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* CABECERA */}
            <View style={styles.header}>
                <View style={styles.titleBlock}>
                    <Text style={styles.title}>{recipe.name}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.badge}>{recipe.base_servings} RACIONES</Text>
                        <Text style={styles.authorText}>Receta de {recipe.owner_name}</Text>
                    </View>
                </View>
                {/* Podríamos poner un logo aquí a la derecha si quisiéramos */}
            </View>

            {/* IMAGEN DESTACADA */}
            {recipe.image && (
                <View style={styles.imageContainer}>
                    <Image src={recipe.image} style={styles.recipeImage} />
                </View>
            )}

            {/* CUERPO DE LA RECETA */}
            <View style={styles.contentContainer}>

                {/* SIDEBAR: INGREDIENTES */}
                <View style={styles.sidebar}>
                    <Text style={styles.sidebarTitle}>Ingredientes</Text>

                    {recipe.ingredients.map((ing, i) => (
                        <View key={i} style={styles.ingredientRow}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.ingredientText}>
                                {ing.ingredient_name}{'\n'}
                                <Text style={styles.quantityText}>
                                    {ing.quantity} {ing.unit}
                                </Text>
                            </Text>
                        </View>
                    ))}

                    {recipe.ingredients.length === 0 && (
                        <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#9ca3af' }}>
                            Sin ingredientes listados.
                        </Text>
                    )}
                </View>

                {/* PRINCIPAL: INSTRUCCIONES */}
                <View style={styles.mainColumn}>
                    <Text style={styles.sectionTitle}>Preparación</Text>
                    <Text style={styles.instructionText}>
                        {recipe.instructions || "No se han detallado los pasos para esta receta."}
                    </Text>
                </View>

            </View>

            <Text style={styles.footer}>
                Generado el {new Date().toLocaleDateString()} • MealPlanner App
            </Text>
        </Page>
    </Document>
);

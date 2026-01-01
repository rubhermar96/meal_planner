import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica' },
    header: { marginBottom: 20, borderBottom: '2px solid #2563eb', paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' }, // Azul oscuro
    meta: { fontSize: 10, color: '#6b7280', marginTop: 5 },
    imageContainer: { height: 200, marginBottom: 20, backgroundColor: '#f3f4f6' },
    recipeImage: { width: '100%', height: '100%', objectFit: 'cover' },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#2563eb' },
    text: { fontSize: 11, lineHeight: 1.5, color: '#374151', marginBottom: 5 },
    ingredientRow: { flexDirection: 'row', borderBottom: '1px solid #e5e7eb', paddingVertical: 4 },
    bullet: { width: 10 },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 9, textAlign: 'center', color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: 10 }
});

export const RecipePDF = ({ recipe }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* CABECERA */}
            <View style={styles.header}>
                <Text style={styles.title}>{recipe.name}</Text>
                <Text style={styles.meta}>
                    Raciones Base: {recipe.base_servings} | Creado por: {recipe.owner_name}
                </Text>
            </View>

            {/* IMAGEN (Solo si existe) */}
            {recipe.image && (
                <View style={styles.imageContainer}>
                    {/* React-PDF necesita URLs públicas o base64. Si es Cloudinary funciona bien. */}
                    <Image src={recipe.image} style={styles.recipeImage} />
                </View>
            )}

            {/* DOS COLUMNAS: Ingredientes y Pasos */}
            <View style={{ flexDirection: 'row', gap: 20 }}>

                {/* COLUMNA IZQUIERDA: INGREDIENTES (35% ancho) */}
                <View style={{ width: '35%' }}>
                    <Text style={styles.sectionTitle}>Ingredientes</Text>
                    {recipe.ingredients.map((ing, i) => (
                        <View key={i} style={styles.ingredientRow}>
                            <Text style={styles.text}>• {ing.ingredient_name}</Text>
                            <Text style={{ ...styles.text, marginLeft: 'auto', fontWeight: 'bold' }}>
                                {ing.quantity} {ing.unit}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* COLUMNA DERECHA: INSTRUCCIONES (65% ancho) */}
                <View style={{ width: '65%' }}>
                    <Text style={styles.sectionTitle}>Instrucciones</Text>
                    <Text style={styles.text}>
                        {recipe.instructions || "Sin instrucciones detalladas."}
                    </Text>
                </View>

            </View>

            <Text style={styles.footer}>Receta generada por MealPlanner App</Text>
        </Page>
    </Document>
);
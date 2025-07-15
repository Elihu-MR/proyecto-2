import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Colores ajustados para un diseño más minimalista y profesional
const PRIMARY_GREEN = '#6BB240';
const LIGHT_GREEN = '#9CD275';
const ACCENT_GREEN_BACKGROUND = '#EEF7E8';
const DARK_GRAY = '#333';
const MEDIUM_GRAY = '#555';
const LIGHT_GRAY = '#888';
const VERY_LIGHT_GRAY = '#eee';
const BACKGROUND_LIGHT = '#fcfcfc';
const WHITE = '#fff';
const WARNING_ORANGE = '#fd7e14'; // For values slightly off
const DANGER_RED = '#DC3545'; // For values significantly off

const { width } = Dimensions.get('window');
const IS_LARGE_SCREEN = width > 900;

// Datos de ejemplo para los reportes (estáticos)
const sampleConsultas = [
    {
        id: '1',
        residente: 'Juan Pérez',
        fecha: '01/07/2025 10:30',
        frecuencia_cardiaca: 72, // Normal
        oxigeno: 98, // Normal
        temperatura: 36.7, // Normal
        peso: 70, // kg
        estatura: 175, // cm
        imc: 22.86, // Normal
        notas: 'Paciente estable, continuar con dieta blanda.',
        personalName: 'Dr. Alejandro Soto',
    },
    {
        id: '2',
        residente: 'María López',
        fecha: '02/07/2025 14:15',
        frecuencia_cardiaca: 105, // Alta (fuera de rango)
        oxigeno: 93, // Baja (fuera de rango)
        temperatura: 38.0, // Alta (fuera de rango)
        peso: 55, // kg
        estatura: 160, // cm
        imc: 21.48,
        notas: 'Se detectó ligera fiebre, monitorizar.',
        personalName: 'Enf. Laura Gómez',
    },
    {
        id: '3',
        residente: 'Carlos Sánchez',
        fecha: '01/07/2025 09:00',
        frecuencia_cardiaca: 58, // Baja (fuera de rango)
        oxigeno: 96, // Normal
        temperatura: 37.1, // Normal
        peso: 80, // kg
        estatura: 180, // cm
        imc: 24.69,
        notas: 'Signos vitales dentro de rangos normales.',
        personalName: 'Dr. Alejandro Soto',
    },
    {
        id: '4',
        residente: 'Ana García',
        fecha: '03/07/2025 11:00',
        frecuencia_cardiaca: 80,
        oxigeno: 97,
        temperatura: 36.9,
        peso: 60,
        estatura: 165,
        imc: 22.04,
        notas: 'Buen estado general.',
        personalName: 'Enf. Laura Gómez',
    },
    {
        id: '5',
        residente: 'Pedro Ruiz',
        fecha: '03/07/2025 08:45',
        frecuencia_cardiaca: 68,
        oxigeno: 99,
        temperatura: 36.5,
        peso: 75,
        estatura: 170,
        imc: 25.95,
        notas: 'Sin novedades.',
        personalName: 'Dr. Alejandro Soto',
    },
    {
        id: '6',
        residente: 'Juan Pérez',
        fecha: '05/07/2025 11:00',
        frecuencia_cardiaca: 70, // Normal
        oxigeno: 97, // Normal
        temperatura: 36.8, // Normal
        peso: 69.5,
        estatura: 175,
        imc: 22.70,
        notas: 'Seguimiento de dieta blanda, buena tolerancia.',
        personalName: 'Enf. Laura Gómez',
    },
    {
        id: '7',
        residente: 'María López',
        fecha: '04/07/2025 10:00',
        frecuencia_cardiaca: 95, // Mejorando
        oxigeno: 95, // Mejorando
        temperatura: 37.5, // Mejorando
        peso: 55.2,
        estatura: 160,
        imc: 21.56,
        notas: 'Fiebre controlada, oxígeno estable.',
        personalName: 'Dr. Alejandro Soto',
    },
];

// Rangos de referencia para métricas (ejemplo)
const RANGOS_SALUDABLES = {
    frecuencia_cardiaca: { min: 60, max: 100 },
    oxigeno: { min: 95, max: 100 },
    temperatura: { min: 36.0, max: 37.5 },
    imc: { min: 18.5, max: 24.9 }, // Rangos de IMC para adultos
};

// Función para determinar si una métrica está fuera de rango
const isOutOfRange = (metric, value) => {
    const range = RANGOS_SALUDABLES[metric];
    if (!range) return false;
    return value < range.min || value > range.max;
};

const CheckupReportsScreen = ({ route }) => {
    // Estados para los campos de búsqueda
    const [searchTextResident, setSearchTextResident] = useState('');
    const [searchTextStaff, setSearchTextStaff] = useState('');

    // --- Reporte 1: Tendencia de signos vitales por residente ---
    // Filtra las consultas basándose en el texto de búsqueda del residente
    const filteredConsultasForTrend = useMemo(() => {
        if (!searchTextResident) {
            // Si no hay texto de búsqueda, muestra las consultas de un residente por defecto o un mensaje
            // Para el ejemplo, usaremos 'Juan Pérez' por defecto si el campo está vacío.
            return sampleConsultas
                .filter(c => c.residente === 'Juan Pérez')
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        }
        return sampleConsultas
            .filter(c => c.residente.toLowerCase().includes(searchTextResident.toLowerCase()))
            .sort((a, b) => new Date(a.fecha) - new Date(b).fecha);
    }, [searchTextResident]);

    const residenteParaTendencia = searchTextResident || 'Juan Pérez'; // Nombre del residente que se está mostrando

    // --- Reporte 2: Residentes con Métricas Fuera de Rango ---
    const filteredResidentesFueraDeRango = useMemo(() => {
        const outOfRangeList = sampleConsultas.filter(consulta =>
            isOutOfRange('frecuencia_cardiaca', consulta.frecuencia_cardiaca) ||
            isOutOfRange('oxigeno', consulta.oxigeno) ||
            isOutOfRange('temperatura', consulta.temperatura) ||
            isOutOfRange('imc', consulta.imc)
        );

        if (!searchTextResident) {
            return outOfRangeList;
        }

        return outOfRangeList.filter(consulta =>
            consulta.residente.toLowerCase().includes(searchTextResident.toLowerCase())
        );
    }, [searchTextResident]);

    // --- Reporte 3: Actividad del Personal (Consultas Registradas) ---
    const filteredActividadPersonal = useMemo(() => {
        const actividad = sampleConsultas.reduce((acc, consulta) => {
            acc[consulta.personalName] = (acc[consulta.personalName] || 0) + 1;
            return acc;
        }, {});

        if (!searchTextStaff) {
            return actividad;
        }

        const filtered = {};
        for (const [name, count] of Object.entries(actividad)) {
            if (name.toLowerCase().includes(searchTextStaff.toLowerCase())) {
                filtered[name] = count;
            }
        }
        return filtered;
    }, [searchTextStaff]);

    return (
        <ScrollView contentContainerStyle={styles.screenContainer}>
            <Text style={styles.title}>Reportes de Consultas</Text>

            {/* Campo de búsqueda para Residentes */}
            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color={MEDIUM_GRAY} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar residente por nombre..."
                    placeholderTextColor={LIGHT_GRAY}
                    value={searchTextResident}
                    onChangeText={setSearchTextResident}
                />
            </View>

            <View style={styles.reportsGrid}>
                {/* Reporte 1: Tendencia de signos vitales por residente */}
                <View style={IS_LARGE_SCREEN ? styles.reportCardHalf : styles.reportCard}>
                    <View style={styles.reportHeader}>
                        <Ionicons name="trending-up-outline" size={24} color={PRIMARY_GREEN} />
                        <Text style={styles.reportTitle}>Tendencia de Signos Vitales: {residenteParaTendencia}</Text>
                    </View>
                    <View style={styles.reportContent}>
                        {filteredConsultasForTrend.length > 0 ? (
                            filteredConsultasForTrend.map((consulta, index) => (
                                <View key={consulta.id} style={styles.trendItem}>
                                    <Text style={styles.trendDate}>{consulta.fecha}</Text>
                                    <View style={styles.trendMetrics}>
                                        <Text style={styles.metricMini}>FC: {consulta.frecuencia_cardiaca} lpm</Text>
                                        <Text style={styles.metricMini}>Oxig: {consulta.oxigeno}%</Text>
                                        <Text style={styles.metricMini}>Temp: {consulta.temperatura}°C</Text>
                                        <Text style={styles.metricMini}>IMC: {consulta.imc}</Text>
                                    </View>
                                    <Text style={styles.trendNotes}>Notas: {consulta.notas}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>No hay datos de consultas para "{residenteParaTendencia}".</Text>
                        )}
                    </View>
                </View>

                {/* Reporte 2: Residentes con Métricas Fuera de Rango */}
                <View style={IS_LARGE_SCREEN ? styles.reportCardHalf : styles.reportCard}>
                    <View style={styles.reportHeader}>
                        <Ionicons name="alert-circle-outline" size={24} color={DANGER_RED} />
                        <Text style={styles.reportTitle}>Residentes con Métricas Fuera de Rango</Text>
                    </View>
                    <View style={styles.reportContent}>
                        {filteredResidentesFueraDeRango.length > 0 ? (
                            filteredResidentesFueraDeRango.map((consulta) => (
                                <View key={consulta.id} style={styles.outOfRangeItem}>
                                    <Text style={styles.outOfRangeResidente}>{consulta.residente}</Text>
                                    <Text style={styles.outOfRangeDate}>Última consulta: {consulta.fecha}</Text>
                                    <View style={styles.outOfRangeMetrics}>
                                        {isOutOfRange('frecuencia_cardiaca', consulta.frecuencia_cardiaca) && (
                                            <Text style={styles.outOfRangeMetric}>FC: {consulta.frecuencia_cardiaca} lpm</Text>
                                        )}
                                        {isOutOfRange('oxigeno', consulta.oxigeno) && (
                                            <Text style={styles.outOfRangeMetric}>Oxig: {consulta.oxigeno}%</Text>
                                        )}
                                        {isOutOfRange('temperatura', consulta.temperatura) && (
                                            <Text style={styles.outOfRangeMetric}>Temp: {consulta.temperatura}°C</Text>
                                        )}
                                        {isOutOfRange('imc', consulta.imc) && (
                                            <Text style={styles.outOfRangeMetric}>IMC: {consulta.imc}</Text>
                                        )}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noDataText}>Todos los residentes están dentro de los rangos normales (o no hay datos que coincidan con la búsqueda).</Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Campo de búsqueda para Personal */}
            <View style={styles.searchBarContainer}>
                <Ionicons name="search" size={20} color={MEDIUM_GRAY} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar personal por nombre..."
                    placeholderTextColor={LIGHT_GRAY}
                    value={searchTextStaff}
                    onChangeText={setSearchTextStaff}
                />
            </View>

            {/* Reporte 3: Actividad del Personal (Consultas Registradas) */}
            <View style={styles.reportCard}>
                <View style={styles.reportHeader}>
                    <Ionicons name="briefcase-outline" size={24} color={PRIMARY_GREEN} />
                    <Text style={styles.reportTitle}>Actividad del Personal (Consultas Registradas)</Text>
                </View>
                <View style={styles.reportContent}>
                    {Object.keys(filteredActividadPersonal).length > 0 ? (
                        Object.entries(filteredActividadPersonal).map(([personalName, count]) => (
                            <View key={personalName} style={styles.staffActivityItem}>
                                <Text style={styles.staffName}>{personalName}</Text>
                                <Text style={styles.staffCount}>
                                    <Text style={{ fontWeight: 'bold' }}>{count}</Text> consultas
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataText}>No hay consultas registradas por el personal (o no hay datos que coincidan con la búsqueda).</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default CheckupReportsScreen;

const styles = StyleSheet.create({
    screenContainer: {
        flexGrow: 1,
        padding: IS_LARGE_SCREEN ? 25 : 15,
        backgroundColor: BACKGROUND_LIGHT,
        alignItems: 'center',
    },
    title: {
        fontSize: IS_LARGE_SCREEN ? 28 : 22,
        fontWeight: '800',
        color: DARK_GRAY,
        marginBottom: IS_LARGE_SCREEN ? 25 : 20,
        textAlign: 'center',
    },
    reportsGrid: {
        flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 1400, // Aumenta el maxWidth para pantallas grandes si es necesario
        marginBottom: IS_LARGE_SCREEN ? 20 : 15,
    },
    reportCard: {
        width: '100%',
        maxWidth: 700,
        backgroundColor: WHITE,
        borderRadius: 12,
        padding: IS_LARGE_SCREEN ? 20 : 15,
        marginBottom: IS_LARGE_SCREEN ? 20 : 15,
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY,
        ...Platform.select({
            ios: {
                shadowColor: DARK_GRAY,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: `0 4px 8px rgba(51, 51, 51, 0.08)`,
            },
        }),
    },
    reportCardHalf: {
        width: IS_LARGE_SCREEN ? '48.5%' : '100%', // Aproximadamente la mitad con espacio entre ellas
        backgroundColor: WHITE,
        borderRadius: 12,
        padding: IS_LARGE_SCREEN ? 20 : 15,
        marginBottom: IS_LARGE_SCREEN ? 20 : 15,
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY,
        ...Platform.select({
            ios: {
                shadowColor: DARK_GRAY,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: `0 4px 8px rgba(51, 51, 51, 0.08)`,
            },
        }),
    },
    reportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: ACCENT_GREEN_BACKGROUND,
    },
    reportTitle: {
        fontSize: IS_LARGE_SCREEN ? 20 : 18,
        fontWeight: '700',
        color: DARK_GRAY,
        marginLeft: 10,
    },
    reportContent: {
        paddingTop: 5,
    },
    noDataText: {
        fontSize: 14,
        color: MEDIUM_GRAY,
        textAlign: 'center',
        paddingVertical: 10,
    },

    // --- Estilos para Campo de Búsqueda ---
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        maxWidth: 700,
        backgroundColor: WHITE,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: IS_LARGE_SCREEN ? 12 : 10,
        marginBottom: IS_LARGE_SCREEN ? 20 : 15,
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY,
        ...Platform.select({
            ios: {
                shadowColor: DARK_GRAY,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: `0 2px 4px rgba(51, 51, 51, 0.05)`,
            },
        }),
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: IS_LARGE_SCREEN ? 16 : 14,
        color: DARK_GRAY,
        paddingVertical: 0, // Ajuste para iOS/Android
    },

    // --- Estilos para Reporte 1: Tendencia de signos vitales por residente ---
    trendItem: {
        backgroundColor: ACCENT_GREEN_BACKGROUND,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: LIGHT_GREEN,
    },
    trendDate: {
        fontSize: 14,
        fontWeight: '600',
        color: DARK_GRAY,
        marginBottom: 5,
    },
    trendMetrics: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 8,
    },
    trendNotes: {
        fontSize: 13,
        color: MEDIUM_GRAY,
        fontStyle: 'italic',
    },

    // --- Estilos para Reporte 2: Residentes con Métricas Fuera de Rango ---
    outOfRangeItem: {
        backgroundColor: '#FFEBEB', // Fondo rojo claro para alertas
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: DANGER_RED, // Borde rojo
    },
    outOfRangeResidente: {
        fontWeight: '700',
        fontSize: 16,
        color: DANGER_RED,
        marginBottom: 5,
    },
    outOfRangeDate: {
        fontSize: 13,
        color: MEDIUM_GRAY,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    outOfRangeMetrics: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    outOfRangeMetric: {
        fontSize: 13,
        backgroundColor: WHITE,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 5,
        color: DANGER_RED, // Texto rojo para la métrica fuera de rango
        fontWeight: '600',
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
    },

    // --- Estilos para Reporte 3: Actividad del Personal ---
    staffActivityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: ACCENT_GREEN_BACKGROUND,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: PRIMARY_GREEN,
    },
    staffName: {
        fontSize: 15,
        fontWeight: '600',
        color: DARK_GRAY,
    },
    staffCount: {
        fontSize: 14,
        color: MEDIUM_GRAY,
    },

    // Reutilizados de estilos anteriores
    metricMini: {
        fontSize: 12,
        backgroundColor: WHITE,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 5,
        color: MEDIUM_GRAY,
        fontWeight: '500',
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY,
    },
});
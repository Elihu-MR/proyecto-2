// AETHERIS/screens/admin/ConsultasHistory.js
import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Platform,
    Dimensions,
    SafeAreaView,
    KeyboardAvoidingView,
    Image // Import Image component
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Colores basados en EmployeeManagementScreen.js y ajustados para minimalismo
const PRIMARY_GREEN = '#6BB240';
const LIGHT_GREEN = '#9CD275';
const ACCENT_GREEN_BACKGROUND = '#EEF7E8';
const DARK_GRAY = '#333';
const MEDIUM_GRAY = '#555';
const LIGHT_GRAY = '#888';
const VERY_LIGHT_GRAY = '#eee';
const BACKGROUND_LIGHT = '#fcfcfc'; // Slightly lighter background
const WHITE = '#fff';
const ERROR_RED = '#DC3545';
const BUTTON_HOVER_COLOR = '#5aa130';

const { width } = Dimensions.get('window');
const IS_LARGE_SCREEN = width > 900;

// Sample data with added photo URLs
const sampleConsultas = [
    {
        id: '1',
        residente: 'Juan Pérez',
        fecha: '2025-07-01',
        frecuencia_cardiaca: 72,
        oxigeno: 98,
        temperatura: 36.7,
        notas: 'Paciente estable, continuar con dieta blanda.',
        photo: 'https://ui-avatars.com/api/?name=Juan+Perez&background=6BB240&color=fff&size=128&rounded=true',
    },
    {
        id: '2',
        residente: 'María López',
        fecha: '2025-07-02',
        frecuencia_cardiaca: 105,
        oxigeno: 93,
        temperatura: 38.0,
        notas: 'Se detectó ligera fiebre, monitorizar.',
        photo: 'https://ui-avatars.com/api/?name=Maria+Lopez&background=9CD275&color=fff&size=128&rounded=true',
    },
    {
        id: '3',
        residente: 'Carlos Sánchez',
        fecha: '2025-07-01',
        frecuencia_cardiaca: 58,
        oxigeno: 96,
        temperatura: 37.1,
        notas: 'Signos vitales dentro de rangos normales.',
        photo: 'https://ui-avatars.com/api/?name=Carlos+Sanchez&background=6BB240&color=fff&size=128&rounded=true',
    },
    {
        id: '4',
        residente: 'Ana Gómez',
        fecha: '2025-06-29',
        frecuencia_cardiaca: 80,
        oxigeno: 92,
        temperatura: 37.8,
        notas: 'Oxígeno bajo, se administró oxígeno suplementario.',
        photo: 'https://ui-avatars.com/api/?name=Ana+Gomez&background=9CD275&color=fff&size=128&rounded=true',
    },
    {
        id: '5',
        residente: 'Pedro Ramírez',
        fecha: '2025-07-03',
        frecuencia_cardiaca: 70,
        oxigeno: 99,
        temperatura: 36.5,
        notas: 'Todo en orden.',
        photo: 'https://ui-avatars.com/api/?name=Pedro+Ramirez&background=6BB240&color=fff&size=128&rounded=true',
    },
];

const getColorFC = (fc) => (fc > 100 || fc < 60 ? ERROR_RED : PRIMARY_GREEN);
const getColorO2 = (o2) => (o2 < 95 ? '#fd7e14' : PRIMARY_GREEN); // Orange for caution
const getColorTemp = (temp) => (temp > 37.5 ? ERROR_RED : PRIMARY_GREEN);

const ConsultasHistory = () => {
    const [searchName, setSearchName] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredConsultas = useMemo(() => {
        return sampleConsultas.filter((c) => {
            const nombreMatch = c.residente.toLowerCase().includes(searchName.toLowerCase());

            const fechaObj = new Date(c.fecha + 'T00:00:00');
            const fromOk = dateFrom ? fechaObj >= new Date(dateFrom + 'T00:00:00') : true;
            const toOk = dateTo ? fechaObj <= new Date(dateTo + 'T23:59:59') : true;

            return nombreMatch && fromOk && toOk;
        });
    }, [searchName, dateFrom, dateTo]);

    const renderConsultaCard = ({ item, index }) => {
        const bgColor = index % 2 === 0 ? WHITE : BACKGROUND_LIGHT;

        return (
            <View style={[styles.cardContainer, { backgroundColor: bgColor }]}>
                <View style={styles.headerRow}>
                    <View style={styles.residenteInfo}>
                        {item.photo && <Image source={{ uri: item.photo }} style={styles.residentePhoto} />}
                        <Text style={styles.residenteName}>{item.residente}</Text>
                    </View>
                    <Text style={styles.fecha}>{new Date(item.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
                </View>

                <Text style={styles.notasInline}>
                    <Ionicons name="document-text-outline" size={15} color={MEDIUM_GRAY} /> {item.notas}
                </Text>

                <View style={styles.metricsRow}>
                    <Text style={[styles.metricText, { color: getColorFC(item.frecuencia_cardiaca) }]}>
                        <Ionicons name="heart-outline" size={13} color={getColorFC(item.frecuencia_cardiaca)} /> FC: <Text style={styles.metricValue}>{item.frecuencia_cardiaca} bpm</Text>
                    </Text>
                    <Text style={[styles.metricText, { color: getColorO2(item.oxigeno) }]}>
                        <Ionicons name="water-outline" size={13} color={getColorO2(item.oxigeno)} /> Oxígeno: <Text style={styles.metricValue}>{item.oxigeno}%</Text>
                    </Text>
                    <Text style={[styles.metricText, { color: getColorTemp(item.temperatura) }]}>
                        <Ionicons name="thermometer-outline" size={13} color={getColorTemp(item.temperatura)} /> Temp: <Text style={styles.metricValue}>{item.temperatura}°C</Text>
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.verMasButton}
                    onPress={() => alert(`Ver detalles de consulta de ${item.residente}`)}
                >
                    <Ionicons name="eye-outline" size={16} color={PRIMARY_GREEN} />
                    <Text style={styles.verMasText}>Ver más</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.mainContentArea}>
                    <Text style={styles.screenTitle}>Historial de Consultas</Text>

                    <View style={styles.filtersContainer}>
                        <View style={styles.searchInputContainer}>
                            <Ionicons name="search" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Buscar por nombre de residente"
                                placeholderTextColor={LIGHT_GRAY}
                                value={searchName}
                                onChangeText={setSearchName}
                                autoCorrect={false}
                                autoCapitalize="none"
                                clearButtonMode="while-editing"
                            />
                        </View>

                        <View style={styles.dateFiltersRow}>
                            {Platform.OS === 'web' ? (
                                <>
                                    <View style={styles.dateInputWebContainer}>
                                        <Ionicons name="calendar-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            style={styles.dateInputWeb}
                                            title="Fecha Desde"
                                        />
                                    </View>
                                    <View style={styles.dateInputWebContainer}>
                                        <Ionicons name="calendar-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            style={styles.dateInputWeb}
                                            title="Fecha Hasta"
                                        />
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={styles.nativeDateInputContainer}>
                                        <Ionicons name="calendar-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.inputNativeDate}
                                            placeholder="Desde (YYYY-MM-DD)"
                                            placeholderTextColor={LIGHT_GRAY}
                                            value={dateFrom}
                                            onChangeText={setDateFrom}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={styles.nativeDateInputContainer}>
                                        <Ionicons name="calendar-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.inputNativeDate}
                                            placeholder="Hasta (YYYY-MM-DD)"
                                            placeholderTextColor={LIGHT_GRAY}
                                            value={dateTo}
                                            onChangeText={setDateTo}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    <FlatList
                        data={filteredConsultas}
                        keyExtractor={(item) => item.id}
                        renderItem={renderConsultaCard}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No se encontraron consultas con los filtros aplicados.</Text>
                        }
                        contentContainerStyle={filteredConsultas.length === 0 && styles.flatListEmpty}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// Base styles for cards, adjusted for minimalism
const containerBaseStyles = {
    backgroundColor: WHITE,
    borderRadius: 12, // Slightly smaller border radius
    padding: IS_LARGE_SCREEN ? 20 : 16, // Reduced padding
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 3 }, // More subtle shadow
    shadowOpacity: 0.08, // Reduced opacity
    shadowRadius: 6, // Smaller radius
    elevation: 4, // Reduced elevation
    borderWidth: 1, // Thinner border
    borderColor: VERY_LIGHT_GRAY, // Lighter border
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BACKGROUND_LIGHT,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    mainContentArea: {
        flex: 1,
        padding: IS_LARGE_SCREEN ? 20 : 15,
        alignItems: 'center',
    },
    screenTitle: {
        fontSize: IS_LARGE_SCREEN ? 26 : 22, // Slightly smaller title
        fontWeight: '700',
        marginBottom: 25, // Adjusted margin
        color: DARK_GRAY,
        alignSelf: 'center',
    },

    filtersContainer: {
        width: '100%',
        maxWidth: IS_LARGE_SCREEN ? 750 : 'auto', // Slightly narrower filters
        marginBottom: 20,
        gap: 12, // Reduced gap
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40, // Slightly shorter input
        borderColor: VERY_LIGHT_GRAY, // Lighter border
        borderWidth: 1,
        borderRadius: 8, // Smaller border radius
        backgroundColor: WHITE,
        shadowColor: DARK_GRAY,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03, // More subtle shadow
        shadowRadius: 3,
        elevation: 1,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 14, // Slightly smaller font
        color: DARK_GRAY,
        paddingVertical: 0,
        ...Platform.select({
            web: {
                outlineStyle: 'none',
            },
        }),
    },
    inputIcon: {
        marginRight: 8, // Reduced margin
    },
    dateFiltersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    dateInputWebContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40, // Slightly shorter input
        borderColor: VERY_LIGHT_GRAY, // Lighter border
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: WHITE,
        shadowColor: DARK_GRAY,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
        paddingHorizontal: 10,
    },
    dateInputWeb: {
        flex: 1,
        paddingVertical: 0,
        fontSize: 14, // Slightly smaller font
        color: DARK_GRAY,
        borderWidth: 0,
        backgroundColor: 'transparent',
        ...Platform.select({
            web: {
                outlineStyle: 'none',
                width: '100%',
            },
        }),
    },
    nativeDateInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40, // Slightly shorter input
        borderColor: VERY_LIGHT_GRAY, // Lighter border
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: WHITE,
        shadowColor: DARK_GRAY,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
        paddingHorizontal: 10,
    },
    inputNativeDate: {
        flex: 1,
        height: '100%',
        fontSize: 14, // Slightly smaller font
        color: DARK_GRAY,
        paddingVertical: 0,
    },

    cardContainer: {
        ...containerBaseStyles,
        width: IS_LARGE_SCREEN ? 750 : '100%',
        alignSelf: 'center',
        marginBottom: 12, // Reduced margin
        paddingVertical: IS_LARGE_SCREEN ? 16 : 14, // Reduced padding
        paddingHorizontal: IS_LARGE_SCREEN ? 22 : 18, // Reduced padding
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8, // Reduced margin
    },
    residenteInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10, // Space between photo and name
    },
    residentePhoto: {
        width: 40,
        height: 40,
        borderRadius: 20, // Makes it a circle
        backgroundColor: ACCENT_GREEN_BACKGROUND, // Fallback background
        borderWidth: 1,
        borderColor: LIGHT_GREEN,
    },
    residenteName: {
        fontWeight: '600', // Slightly less bold
        fontSize: IS_LARGE_SCREEN ? 19 : 17, // Slightly smaller font
        color: DARK_GRAY, // Changed to dark gray for a softer, minimalist feel
    },
    fecha: {
        fontSize: IS_LARGE_SCREEN ? 14 : 12, // Slightly smaller font
        color: MEDIUM_GRAY,
        fontStyle: 'italic',
    },

    notasInline: {
        fontSize: IS_LARGE_SCREEN ? 14 : 13, // Slightly smaller font
        color: MEDIUM_GRAY, // Changed to medium gray
        marginBottom: 10, // Reduced margin
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    metricText: {
        fontWeight: '500', // Lighter font weight
        fontSize: IS_LARGE_SCREEN ? 13 : 12, // Slightly smaller font
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metricValue: {
        fontWeight: 'bold',
    },
    metricsRow: {
        flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: IS_LARGE_SCREEN ? 15 : 8, // Reduced gap
        marginBottom: 12, // Reduced margin
    },

    verMasButton: {
        flexDirection: 'row',
        backgroundColor: 'transparent', // Transparent background
        paddingVertical: 6, // Reduced padding
        paddingHorizontal: 10, // Reduced padding
        borderRadius: 8, // Smaller border radius
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY, // Lighter border
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transitionDuration: '0.2s',
                transitionProperty: 'background-color, border-color, color',
                ':hover': {
                    backgroundColor: ACCENT_GREEN_BACKGROUND, // Light hover background
                    borderColor: LIGHT_GREEN,
                },
            },
        }),
    },
    verMasText: {
        color: PRIMARY_GREEN,
        fontSize: 13, // Slightly smaller font
        fontWeight: '600',
        marginLeft: 4, // Reduced margin
        ...Platform.select({
            web: {
                ':hover': {
                    color: PRIMARY_GREEN, // Keep green on hover
                },
            },
        }),
    },

    emptyText: {
        marginTop: 40, // Reduced margin
        textAlign: 'center',
        color: MEDIUM_GRAY,
        fontSize: 15, // Slightly smaller font
        fontWeight: '500',
    },
    flatListEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ConsultasHistory;
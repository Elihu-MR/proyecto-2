// AETHERIS/screens/admin/CreateConsultaScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions,
    SafeAreaView,
    KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

// Colores ajustados para un diseño más minimalista y profesional
const PRIMARY_GREEN = '#6BB240';
const LIGHT_GREEN = '#9CD275';
const ACCENT_GREEN_BACKGROUND = '#EEF7E8'; // Used for subtle backgrounds
const DARK_GRAY = '#333';
const MEDIUM_GRAY = '#555';
const LIGHT_GRAY = '#888'; // For placeholders and secondary text
const VERY_LIGHT_GRAY = '#eee'; // Used for subtle borders
const BACKGROUND_LIGHT = '#fcfcfc'; // Overall screen background
const WHITE = '#fff'; // Card and input background
const BUTTON_HOVER_COLOR = '#5aa130'; // For button hover state

const { width } = Dimensions.get('window');
const IS_LARGE_SCREEN = width > 900;

export default function CreateConsultaScreen() {
    const [idResidente, setIdResidente] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState('');
    const [frecuencia, setFrecuencia] = useState('');
    const [oxigeno, setOxigeno] = useState('');
    const [temperatura, setTemperatura] = useState('');
    const [peso, setPeso] = useState('');
    const [estatura, setEstatura] = useState('');
    const [observaciones, setObservaciones] = useState('');

    const [residentes, setResidentes] = useState([
        { id: 1, nombre: 'María González', edad: 82, telefono: '664-123-4567', area: 'Dormitorio' },
        { id: 2, nombre: 'Jorge Martínez', edad: 75, telefono: '664-987-6543', area: 'Comedor' },
        { id: 3, nombre: 'Luz Ramírez', edad: 91, telefono: '664-555-1212', area: 'Sala de estar' },
    ]);

    useEffect(() => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        setCurrentDateTime(formattedDate);
    }, []);

    const imc = useMemo(() => {
        const parsedPeso = parseFloat(peso);
        const parsedEstaturaCm = parseFloat(estatura);

        if (isNaN(parsedPeso) || isNaN(parsedEstaturaCm) || parsedEstaturaCm === 0) {
            return '';
        }

        const estaturaM = parsedEstaturaCm / 100;
        const calculatedIMC = parsedPeso / (estaturaM * estaturaM);
        return calculatedIMC.toFixed(2);
    }, [peso, estatura]);

    const handleGuardar = () => {
        console.log({
            idResidente,
            fecha: currentDateTime,
            frecuencia,
            oxigeno,
            temperatura,
            peso,
            estatura,
            imc,
            observaciones,
        });
        console.log('Consulta guardada (simulado)');
    };

    const residenteSeleccionado = residentes.find((r) => r.id === idResidente);

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Contenedor para Fecha y Hora - Fuera del formulario, arriba a la derecha */}
            <View style={styles.dateTimeContainer}>
                <Ionicons name="calendar-outline" size={16} color={PRIMARY_GREEN} style={styles.dateTimeIcon} />
                <Text style={styles.dateTimeText}>{currentDateTime}</Text>
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.mainContentArea}>
                        <Text style={styles.title}>Nueva Consulta</Text>

                        {/* Selector de residente */}
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.inputLabel}>Residente</Text>
                            <View style={styles.inputContainerWithIcon}>
                                <Ionicons name="people-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                <Picker
                                    selectedValue={idResidente}
                                    onValueChange={(itemValue) => setIdResidente(Number(itemValue))}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}
                                >
                                    <Picker.Item label="-- Selecciona un residente --" value="" color={LIGHT_GRAY} />
                                    {residentes.map((res) => (
                                        <Picker.Item key={res.id} label={res.nombre} value={res.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Info del residente (con datos simulados) */}
                        {residenteSeleccionado && (
                            <View style={styles.infoBox}>
                                <Text style={styles.infoText}>
                                    <Text style={styles.infoLabel}>Nombre:</Text> {residenteSeleccionado.nombre}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Text style={styles.infoLabel}>Edad:</Text> {residenteSeleccionado.edad} años
                                </Text>
                                <Text style={styles.infoText}>
                                    <Text style={styles.infoLabel}>Teléfono:</Text> {residenteSeleccionado.telefono}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Text style={styles.infoLabel}>Área asignada:</Text> {residenteSeleccionado.area}
                                </Text>
                            </View>
                        )}

                        {/* Campos clínicos */}
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.inputLabel}>Frecuencia cardíaca (lpm)</Text>
                            <View style={styles.inputContainerWithIcon}>
                                <Ionicons name="heart-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={frecuencia}
                                    onChangeText={setFrecuencia}
                                    placeholder="Ej: 75"
                                    placeholderTextColor={LIGHT_GRAY}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.inputLabel}>Oxigenación (%)</Text>
                            <View style={styles.inputContainerWithIcon}>
                                <Ionicons name="water-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={oxigeno}
                                    onChangeText={setOxigeno}
                                    placeholder="Ej: 96.5"
                                    placeholderTextColor={LIGHT_GRAY}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.inputLabel}>Temperatura (°C)</Text>
                            <View style={styles.inputContainerWithIcon}>
                                <Ionicons name="thermometer-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={temperatura}
                                    onChangeText={setTemperatura}
                                    placeholder="Ej: 36.5"
                                    placeholderTextColor={LIGHT_GRAY}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.inputLabel}>Peso (kg)</Text>
                            <View style={styles.inputContainerWithIcon}>
                                <Ionicons name="body-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={peso}
                                    onChangeText={setPeso}
                                    placeholder="Ej: 60.2"
                                    placeholderTextColor={LIGHT_GRAY}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.inputLabel}>Estatura (cm)</Text>
                            <View style={styles.inputContainerWithIcon}>
                                <Ionicons name="resize-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={estatura}
                                    onChangeText={setEstatura}
                                    placeholder="Ej: 158"
                                    placeholderTextColor={LIGHT_GRAY}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        {/* Índice de Masa Corporal (IMC) - Campo de solo lectura */}
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.inputLabel}>Índice de Masa Corporal (IMC)</Text>
                            <View style={styles.inputContainerWithIcon}>
                                <Ionicons name="body-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={imc}
                                    editable={false}
                                    placeholder="Calculado automáticamente"
                                    placeholderTextColor={LIGHT_GRAY}
                                />
                            </View>
                        </View>

                        {/* Apartado de Observaciones */}
                        <View style={styles.fieldWrapper}>
                            <Text style={styles.inputLabel}>Observaciones</Text>
                            <View style={[styles.inputContainerWithIcon, styles.textAreaContainer]}>
                                <Ionicons name="document-text-outline" size={18} color={MEDIUM_GRAY} style={[styles.inputIcon, styles.textAreaIcon]} />
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={observaciones}
                                    onChangeText={setObservaciones}
                                    placeholder="Añade cualquier observación relevante aquí..."
                                    placeholderTextColor={LIGHT_GRAY}
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        {/* Botón Guardar */}
                        <TouchableOpacity style={styles.primaryButton} onPress={handleGuardar}>
                            <Text style={styles.primaryButtonText}>GUARDAR CONSULTA</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BACKGROUND_LIGHT,
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    dateTimeContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        right: 15,
        backgroundColor: WHITE,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY,
        ...Platform.select({
            ios: {
                shadowColor: DARK_GRAY,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: `0 2px 4px rgba(51, 51, 51, 0.1)`,
            },
        }),
    },
    dateTimeIcon: {
        marginRight: 8,
        color: PRIMARY_GREEN,
    },
    dateTimeText: {
        fontSize: 13,
        color: DARK_GRAY,
        fontWeight: '700',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 10, // Más reducido para un formulario más corto
        alignItems: 'center',
    },
    mainContentArea: {
        width: '90%',
        maxWidth: IS_LARGE_SCREEN ? 500 : '90%',
        backgroundColor: WHITE,
        borderRadius: 12,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderTopWidth: 4,
        borderTopColor: PRIMARY_GREEN,
        padding: IS_LARGE_SCREEN ? 15 : 10, // Más reducido para un formulario más corto
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY,
        ...Platform.select({
            ios: {
                shadowColor: DARK_GRAY,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: `0 3px 6px rgba(51, 51, 51, 0.08)`,
            },
        }),
    },
    title: {
        fontSize: IS_LARGE_SCREEN ? 24 : 20,
        fontWeight: '700',
        color: DARK_GRAY,
        marginBottom: 15,
        textAlign: 'center',
    },
    fieldWrapper: {
        marginBottom: 8, // Más reducido para un formulario más corto
    },
    inputLabel: {
        fontSize: 13,
        color: MEDIUM_GRAY,
        marginBottom: 5,
        fontWeight: '600',
    },
    inputContainerWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: WHITE,
        height: 40,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        color: DARK_GRAY,
        paddingVertical: 0,
        ...Platform.select({
            web: {
                outline: 'none',
            },
        }),
    },
    textAreaContainer: {
        height: 90,
        alignItems: 'flex-start',
        paddingVertical: 8,
    },
    textArea: {
        height: '100%',
        paddingVertical: 0,
        textAlignVertical: 'top',
    },
    textAreaIcon: {
        paddingTop: 3,
    },
    picker: {
        flex: 1,
        color: DARK_GRAY,
        fontSize: 14,
        ...Platform.select({
            web: {
                outline: 'none',
            },
        }),
    },
    pickerItem: {
        fontSize: 14,
        color: DARK_GRAY,
    },
    infoBox: {
        backgroundColor: ACCENT_GREEN_BACKGROUND,
        padding: 12,
        borderRadius: 10,
        marginBottom: 15,
        borderLeftWidth: 3,
        borderLeftColor: LIGHT_GREEN,
    },
    infoText: {
        fontSize: 13,
        marginBottom: 3,
        color: MEDIUM_GRAY,
    },
    infoLabel: {
        fontWeight: 'bold',
        color: DARK_GRAY,
    },
    primaryButton: {
        backgroundColor: PRIMARY_GREEN,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15, // Más reducido para un formulario más corto
        marginBottom: 10,
        ...Platform.select({
            ios: {
                shadowColor: PRIMARY_GREEN,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
            web: {
                cursor: 'pointer',
                transitionDuration: '0.2s',
                transitionProperty: 'background-color, transform, box-shadow',
                boxShadow: `0 4px 8px rgba(107, 178, 64, 0.2)`,
                ':hover': {
                    backgroundColor: BUTTON_HOVER_COLOR,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 12px rgba(107, 178, 64, 0.3)`,
                },
                ':active': {
                    transform: 'translateY(0)',
                    boxShadow: `0 3px 6px rgba(107, 178, 64, 0.2)`,
                },
            },
        }),
    },
    primaryButtonText: {
        color: WHITE,
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
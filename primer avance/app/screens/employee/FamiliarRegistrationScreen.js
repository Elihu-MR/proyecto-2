import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { StackActions } from '@react-navigation/native';

// Asegúrate de que la ruta a tu archivo de configuración sea correcta
import Config from '../../config/config';
const API_URL = Config.API_BASE_URL;

// --- COLORES BASADOS EN SIDEMENU.JS para consistencia ---
const PRIMARY_GREEN = '#6BB240';
const LIGHT_GREEN = '#9CD275';
const ACCENT_GREEN_BACKGROUND = '#EEF7E8'; // Para elementos activos o de fondo sutil
const DARK_GRAY = '#333';
const MEDIUM_GRAY = '#555';
const LIGHT_GRAY = '#888';
const VERY_LIGHT_GRAY = '#eee';
const BACKGROUND_LIGHT = '#fcfcfc'; // Fondo general de la pantalla
const WHITE = '#fff'; // Para texto en botones de color

export default function FamiliarRegistrationScreen({ navigation, route }) {
  // Desestructuramos residentId y residentSummary de los parámetros de navegación
  const { residentId, residentSummary } = route.params;

  // Estados para los campos del formulario del familiar
  const [familiarName, setFamiliarName] = useState('');
  const [familiarApellido, setFamiliarApellido] = useState('');
  const [familiarFechaNacimiento, setFamiliarFechaNacimiento] = useState(new Date());
  const [showFamiliarDatePicker, setShowFamiliarDatePicker] = useState(false);
  const [familiarGenero, setFamiliarGenero] = useState(''); // Usamos un Picker para el género
  const [familiarTelefono, setFamiliarTelefono] = useState('');
  const [familiarParentesco, setFamiliarParentesco] = useState(''); // ID del parentesco
  const [familiarFirebaseEmail, setFamiliarFirebaseEmail] = useState('');
  const [familiarFirebasePassword, setFamiliarFirebasePassword] = useState('');

  // Estado para el indicador de carga y la lista de parentescos
  const [isLoading, setIsLoading] = useState(false);
  const [parentescos, setParentescos] = useState([]);

  // useEffect para cargar la lista de parentescos desde la API
  useEffect(() => {
    // Verificamos si los datos del residente están presentes al cargar la pantalla
    if (!residentId || !residentSummary) {
      Alert.alert('Error de Navegación', 'Datos del residente no disponibles. Regresando.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }

    const fetchParentescos = async () => {
      try {
        const response = await fetch(`${API_URL}/Parentesco`);
        const data = await response.json();
        if (response.ok && data.data) {
          setParentescos(data.data);
        } else {
          console.error('Error al cargar parentescos:', data.message || 'Error desconocido');
          // Fallback en caso de error o datos vacíos
          setParentescos([
            { id: 1, nombre: 'Hijo/a' }, { id: 2, nombre: 'Cónyuge' },
            { id: 3, nombre: 'Hermano/a' }, { id: 4, nombre: 'Nieto/a' },
            { id: 5, nombre: 'Sobrino/a' }, { id: 6, nombre: 'Otro' },
          ]);
        }
      } catch (error) {
        console.error('Error de conexión al cargar parentescos:', error);
        // Fallback en caso de error de conexión
        setParentescos([
          { id: 1, nombre: 'Hijo/a' }, { id: 2, nombre: 'Cónyuge' },
          { id: 3, nombre: 'Hermano/a' }, { id: 4, nombre: 'Nieto/a' },
          { id: 5, nombre: 'Sobrino/a' }, { id: 6, nombre: 'Otro' },
        ]);
      }
    };
    fetchParentescos();
  }, [residentId, residentSummary, navigation]); // Dependencias del useEffect

  // Manejador de cambio de fecha para DateTimePicker (móvil)
  const onChangeFamiliarDateMobile = (event, selectedDate) => {
    const currentDate = selectedDate || familiarFechaNacimiento;
    setShowFamiliarDatePicker(Platform.OS === 'ios'); // En iOS, el picker se cierra solo al seleccionar
    setFamiliarFechaNacimiento(currentDate);
  };

  // Manejador de cambio de fecha para input tipo 'date' (web)
  const onChangeFamiliarDateWeb = (event) => {
    const dateString = event.target.value; // El input type="date" devuelve "YYYY-MM-DD"
    if (dateString) {
      // Usar 'T00:00:00Z' para asegurar que la fecha se interprete en UTC y evitar problemas de zona horaria
      const date = new Date(dateString + 'T00:00:00Z');
      if (!isNaN(date.getTime())) { // Valida si la fecha es válida
        setFamiliarFechaNacimiento(date);
      }
    }
  };

  // Función para manejar el registro de un nuevo familiar
  const handleRegisterFamiliar = async () => {
    // Validaciones de campos obligatorios
    if (!familiarName || !familiarApellido || familiarGenero === '' || !familiarTelefono || familiarParentesco === '' || !familiarFirebaseEmail || !familiarFirebasePassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios del familiar, incluyendo email y contraseña para el acceso.');
      return;
    }
    if (!residentId) {
      Alert.alert('Error', 'Error: No se encontró el ID del residente asociado.');
      return;
    }

    setIsLoading(true); // Activar indicador de carga
    let firebaseUid = null;

    try {
      // --- SIMULACIÓN DE CREACIÓN DE USUARIO EN FIREBASE ---
      // En una aplicación real, aquí integrarías tu SDK de Firebase
      // por ejemplo: const userCredential = await auth().createUserWithEmailAndPassword(familiarFirebaseEmail, familiarFirebasePassword);
      // firebaseUid = userCredential.user.uid;
      console.log("Simulando creación de usuario Firebase con:", familiarFirebaseEmail, familiarFirebasePassword);
      // Generamos un UID simulado para propósitos de demostración
      firebaseUid = `mock_${Math.random().toString(36).substring(2, 15)}`;
      console.log("UID de Firebase simulado:", firebaseUid);

    } catch (firebaseError) {
      console.error("Error al crear usuario Firebase:", firebaseError);
      Alert.alert("Error Firebase", `No se pudo crear el usuario en Firebase: ${firebaseError.message || 'Error desconocido.'}`);
      setIsLoading(false); // Desactivar indicador en caso de error de Firebase
      return;
    }

    // Preparar los datos del formulario para enviar al backend
    const formDataFamiliar = new FormData();
    formDataFamiliar.append('nombre', familiarName);
    formDataFamiliar.append('apellido', familiarApellido);

    // Formatear la fecha de nacimiento a 'YYYY-MM-DD'
    const familiarYear = familiarFechaNacimiento.getFullYear();
    const familiarMonth = String(familiarFechaNacimiento.getMonth() + 1).padStart(2, '0');
    const familiarDay = String(familiarFechaNacimiento.getDate()).padStart(2, '0');
    const formattedFamiliarDate = `${familiarYear}-${familiarMonth}-${familiarDay}`;
    formDataFamiliar.append('fechaNacimiento', formattedFamiliarDate);

    formDataFamiliar.append('genero', familiarGenero);
    formDataFamiliar.append('telefono', familiarTelefono);
    formDataFamiliar.append('id_residente', residentId.toString());
    formDataFamiliar.append('id_parentesco', familiarParentesco);
    formDataFamiliar.append('firebase_uid', firebaseUid);

    // También enviamos email y contraseña al backend de SQL si es necesario para crear un usuario o vincular
    formDataFamiliar.append('email', familiarFirebaseEmail);
    formDataFamiliar.append('contra', familiarFirebasePassword);

    console.log('Datos del familiar a enviar (FormData):');
    for (let pair of formDataFamiliar.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      const response = await fetch(`${API_URL}/Familiar`, {
        method: 'POST',
        body: formDataFamiliar,
      });

      const data = await response.json();
      console.log('Respuesta de la API al registrar familiar:', data);

      // Si la respuesta es exitosa y el status es 0 (convención de tu API)
      if (response.ok && data.status === 0) {
        Alert.alert('Éxito', 'Familiar registrado exitosamente en la base de datos SQL.');
        // Redirigir a la pantalla principal o anterior (popToTop para ResidentRegistrationScreen)
        navigation.dispatch(StackActions.popToTop());
      } else {
        // Manejo de errores de validación o errores específicos de la API
        if (data.errors) {
          let errorMessages = Object.values(data.errors).map(errArray => errArray.join(', ')).join('\n');
          Alert.alert('Error de Validación', `Por favor, corrige los siguientes errores:\n${errorMessages}`);
        } else {
          Alert.alert('Error al Registrar Familiar', data.message || 'Ocurrió un error inesperado al guardar datos personales.');
        }
      }
    } catch (error) {
      console.error('Error registrando familiar en SQL:', error);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor para registrar al familiar en SQL. Por favor, verifica tu conexión.');
    } finally {
      setIsLoading(false); // Desactivar indicador de carga al finalizar
    }
  };

  // Formato de fecha para mostrar en el campo de fecha y para el input de tipo 'date' en web
  const formattedFamiliarDateForDisplay = familiarFechaNacimiento.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedFamiliarDateForWebInput = familiarFechaNacimiento.toISOString().split('T')[0]; // "YYYY-MM-DD"

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={DARK_GRAY} />
        </TouchableOpacity>
        <Text style={styles.title}>Registro de Familiar</Text>
        <View style={{ width: 24 }} /> {/* Espaciador para centrar el título */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Contenedor principal que abarca tanto el resumen como el formulario */}
        <View style={styles.mainLayoutContainer}>
          {/* Sección de Resumen del Residente (Top Right) */}
          {residentSummary && (
            <View style={styles.residentSummaryWrapper}>
              <View style={styles.residentSummaryCard}>
                <Text style={styles.summaryTitle}>Residente Asociado</Text>
                {residentSummary.fotoPreview ? (
                  <Image source={{ uri: residentSummary.fotoPreview }} style={styles.residentPhotoSummary} />
                ) : (
                  <View style={styles.residentPhotoPlaceholder}>
                    <Ionicons name="person-circle-outline" size={60} color={LIGHT_GRAY} />
                  </View>
                )}
                <Text style={styles.summaryTextBold}>{residentSummary.name} {residentSummary.apellido}</Text>
                <Text style={styles.summaryText}>ID: {residentId}</Text>
                <View style={styles.summaryDetails}>
                  <Text style={styles.summaryDetailItem}>
                    <Ionicons name="calendar-outline" size={14} color={MEDIUM_GRAY} /> Fecha Nac: {residentSummary.fechaNacimiento}
                  </Text>
                  <Text style={styles.summaryDetailItem}>
                    <Ionicons name="male-female-outline" size={14} color={MEDIUM_GRAY} /> Género: {residentSummary.genero}
                  </Text>
                  <Text style={styles.summaryDetailItem}>
                    <Ionicons name="call-outline" size={14} color={MEDIUM_GRAY} /> Teléfono: {residentSummary.telefono}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Sección del Formulario del Familiar (Centrado) */}
          <View style={styles.familiarFormWrapper}>
            <View style={styles.familiarFormCard}>
              <Text style={styles.sectionTitle}>Datos del Familiar</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre Familiar"
                placeholderTextColor={MEDIUM_GRAY}
                value={familiarName}
                onChangeText={setFamiliarName}
              />
              <TextInput
                style={styles.input}
                placeholder="Apellido Familiar"
                placeholderTextColor={MEDIUM_GRAY}
                value={familiarApellido}
                onChangeText={setFamiliarApellido}
              />

              {/* Selector de Género Familiar */}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={familiarGenero}
                  onValueChange={(itemValue) => setFamiliarGenero(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Seleccionar Género..." value="" enabled={true} color={MEDIUM_GRAY} />
                  <Picker.Item label="Masculino" value="Masculino" />
                  <Picker.Item label="Femenino" value="Femenino" />
                </Picker>
                <View style={styles.pickerIcon}>
                  <Ionicons name="chevron-down" size={20} color={MEDIUM_GRAY} />
                </View>
              </View>

              {/* Selector de Fecha de Nacimiento Familiar Condicional (para Web y Mobile) */}
              {Platform.OS === 'web' ? (
                <View style={styles.webDateInputContainer}>
                  <Text style={styles.dateLabel}>Fecha de Nacimiento Familiar:</Text>
                  {/* Usamos el input HTML nativo para web */}
                  <input
                    type="date"
                    value={formattedFamiliarDateForWebInput}
                    onChange={onChangeFamiliarDateWeb}
                    style={styles.webDateInput} // Aplicamos estilos CSS directamente
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity style={styles.dateInput} onPress={() => setShowFamiliarDatePicker(true)}>
                    <Text style={styles.dateInputText}>
                      Fecha de Nacimiento Familiar: {formattedFamiliarDateForDisplay}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={MEDIUM_GRAY} />
                  </TouchableOpacity>
                  {showFamiliarDatePicker && (
                    <DateTimePicker
                      testID="familiarDatePicker"
                      value={familiarFechaNacimiento}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onChangeFamiliarDateMobile}
                    />
                  )}
                </>
              )}

              <TextInput
                style={styles.input}
                placeholder="Teléfono Familiar"
                placeholderTextColor={MEDIUM_GRAY}
                value={familiarTelefono}
                onChangeText={setFamiliarTelefono}
                keyboardType="phone-pad"
              />

              {/* Selector de Parentesco */}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={familiarParentesco}
                  onValueChange={(itemValue) => setFamiliarParentesco(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Seleccionar Parentesco..." value="" enabled={true} color={MEDIUM_GRAY} />
                  {parentescos.map((p) => (
                    <Picker.Item key={p.id} label={p.nombre} value={p.id.toString()} />
                  ))}
                </Picker>
                <View style={styles.pickerIcon}>
                  <Ionicons name="chevron-down" size={20} color={MEDIUM_GRAY} />
                </View>
              </View>

              <Text style={styles.sectionSubtitle}>Credenciales de Acceso</Text>
              <TextInput
                style={styles.input}
                placeholder="Email (para acceso)"
                placeholderTextColor={MEDIUM_GRAY}
                value={familiarFirebaseEmail}
                onChangeText={setFamiliarFirebaseEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña (para acceso)"
                placeholderTextColor={MEDIUM_GRAY}
                value={familiarFirebasePassword}
                onChangeText={setFamiliarFirebasePassword}
                secureTextEntry={true}
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRegisterFamiliar}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={WHITE} />
                ) : (
                  <Text style={styles.primaryButtonText}>Registrar Familiar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT, // Fondo claro general
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: WHITE, // Fondo blanco para el encabezado
    borderBottomWidth: 0.5,
    borderBottomColor: VERY_LIGHT_GRAY, // Línea sutil en la parte inferior
    paddingTop: Platform.OS === 'android' ? 35 : 18, // Ajuste para Android
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'android' ? 35 : 18,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center', // Centra verticalmente el contenido del ScrollView
    alignItems: 'center',     // Centra horizontalmente el contenido del ScrollView
    paddingVertical: 30, // Espacio superior e inferior para el contenido
  },
  mainLayoutContainer: {
    width: '95%', // Ocupa el 95% del ancho del padre (ScrollViewContent)
    maxWidth: 900, // Ancho máximo para el layout combinado en pantallas grandes
    marginBottom: 20, // Espacio inferior
  },
  // Wrapper para el resumen del residente para controlar su alineación
  residentSummaryWrapper: {
    width: '100%',
    // Alinea a la derecha en web (si la ventana es ancha), centra en móvil
    alignItems: Platform.OS === 'web' && window.innerWidth > 768 ? 'flex-end' : 'center',
    marginBottom: Platform.OS === 'web' && window.innerWidth > 768 ? 20 : 30, // Más espacio debajo en móvil
  },
  residentSummaryCard: {
    width: Platform.OS === 'web' && window.innerWidth > 768 ? 320 : '100%', // Ancho fijo en web, completo en móvil
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 20, // Espaciado interno de la tarjeta
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3, // Sombra para Android
    borderWidth: 0.5,
    borderColor: VERY_LIGHT_GRAY,
    alignItems: 'center', // Centra el contenido (foto, textos) dentro de la tarjeta
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 10,
    textAlign: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: VERY_LIGHT_GRAY,
    paddingBottom: 8,
    width: '100%',
  },
  residentPhotoSummary: {
    width: 90,
    height: 90,
    borderRadius: 45, // Mitad del ancho/alto para un círculo perfecto
    marginBottom: 12,
    borderWidth: 2,
    borderColor: PRIMARY_GREEN, // Borde de color primario
  },
  residentPhotoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: ACCENT_GREEN_BACKGROUND,
    borderWidth: 1,
    borderColor: LIGHT_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden', // Asegura que el icono no se desborde
  },
  summaryTextBold: {
    fontSize: 17,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 6,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: MEDIUM_GRAY,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryDetails: {
    marginTop: 12,
    width: '100%',
    paddingHorizontal: 5,
  },
  summaryDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 13,
    color: MEDIUM_GRAY,
    marginBottom: 6,
    gap: 6, // Espacio entre el icono y el texto
  },
  // Wrapper para el formulario del familiar para centrarlo
  familiarFormWrapper: {
    width: '100%',
    alignItems: 'center', // Centra el formulario horizontalmente dentro de su wrapper
  },
  familiarFormCard: {
    width: Platform.OS === 'web' && window.innerWidth > 768 ? 600 : '100%', // Ancho más grande en web, completo en móvil
    maxWidth: 600, // Evita que el formulario se estire demasiado en pantallas muy grandes
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 25, // Espaciado interno del formulario
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: VERY_LIGHT_GRAY,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 20,
    textAlign: 'center',
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: VERY_LIGHT_GRAY,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK_GRAY,
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: VERY_LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 18,
    fontSize: 16,
    color: DARK_GRAY,
    backgroundColor: WHITE,
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerContainer: {
    height: 50,
    borderColor: VERY_LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 18,
    backgroundColor: WHITE,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 50,
    width: '100%',
    color: DARK_GRAY,
  },
  pickerItem: {
    color: DARK_GRAY,
    fontSize: 16,
  },
  pickerIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -10 }], // Centra verticalmente el icono
    pointerEvents: 'none', // Asegura que el picker pueda ser clickeado a través del icono
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderColor: VERY_LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 18,
    backgroundColor: WHITE,
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInputText: {
    fontSize: 16,
    color: DARK_GRAY,
    flex: 1, // Permite que el texto ocupe el espacio restante
  },
  webDateInputContainer: {
    marginBottom: 18,
    borderColor: VERY_LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: WHITE,
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    paddingVertical: 5, // Añade un poco de padding vertical para el label
  },
  dateLabel: {
    fontSize: 14,
    color: MEDIUM_GRAY,
    marginBottom: 5,
    paddingLeft: 15,
    paddingTop: 8,
  },
  webDateInput: {
    // Estilos CSS directamente para el input HTML
    height: 38, // Altura adecuada para el input nativo
    width: '100%',
    paddingLeft: 15, // Padding horizontal
    paddingRight: 15,
    fontSize: 16,
    color: DARK_GRAY,
    backgroundColor: 'transparent',
    borderWidth: 0, // No borde, el contenedor lo provee
    outline: 'none', // Quita el contorno azul al hacer foco
    boxSizing: 'border-box', // Incluye padding en el tamaño total
    fontFamily: Platform.OS === 'web' ? 'sans-serif' : undefined, // Asegura una fuente legible en web
    // Puedes añadir más estilos web específicos aquí si es necesario
  },
  primaryButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: PRIMARY_GREEN, // Sombra con color del botón
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: WHITE,
    fontSize: 17,
    fontWeight: 'bold',
  },
});
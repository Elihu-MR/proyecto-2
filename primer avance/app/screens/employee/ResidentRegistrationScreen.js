import React, { useState, useEffect, useRef } from 'react';
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
import * as ImagePicker from 'expo-image-picker';

// Ajusta la ruta de config si es necesario
import Config from '../../config/config';
const API_URL = Config.API_BASE_URL;

// --- COLORES BASADOS EN SIDEMENU.JS ---
const PRIMARY_GREEN = '#6BB240';
const LIGHT_GREEN = '#9CD275';
const ACCENT_GREEN_BACKGROUND = '#EEF7E8'; // Usado para elementos activos o de fondo sutil
const DARK_GRAY = '#333';
const MEDIUM_GRAY = '#555';
const LIGHT_GRAY = '#888';
const VERY_LIGHT_GRAY = '#eee';
const BACKGROUND_LIGHT = '#fcfcfc'; // Fondo general de la pantalla
const WHITE = '#fff'; // Para texto en botones de color

export default function ResidentRegistrationScreen({ navigation }) {
  const [residentName, setResidentName] = useState('');
  const [residentApellido, setResidentApellido] = useState('');
  const [residentFechaNacimiento, setResidentFechaNacimiento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [residentGenero, setResidentGenero] = useState('');
  const [residentTelefono, setResidentTelefono] = useState('');

  const residentPhotoDataRef = useRef(null);
  const [residentFotoPreview, setResidentFotoPreview] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // console.log('*** [useEffect] Cambio en residentFotoPreview:', residentFotoPreview);
    // if (residentFotoPreview) {
    //   console.log('*** [useEffect] URI de residentFotoPreview:', residentFotoPreview);
    // }
  }, [residentFotoPreview]);

  // Manejador de cambio de fecha para DateTimePicker (móvil)
  const onChangeResidentDateMobile = (event, selectedDate) => {
    const currentDate = selectedDate || residentFechaNacimiento;
    setShowDatePicker(Platform.OS === 'ios' ? false : false); // Cerrar después de seleccionar en iOS
    setResidentFechaNacimiento(currentDate);
  };

  // Manejador de cambio de fecha para input tipo 'date' (web)
  const onChangeResidentDateWeb = (event) => {
    const dateString = event.target.value; // Formato "YYYY-MM-DD"
    if (dateString) {
      // Parsear la fecha como UTC para evitar problemas de zona horaria con new Date()
      // new Date(YYYY-MM-DD) se interpreta como UTC medianoche, lo cual es deseable aquí.
      setResidentFechaNacimiento(new Date(dateString + 'T00:00:00Z'));
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos permiso para acceder a tu galería de fotos.');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const assetUri = result.assets[0].uri;
      let imageDataForUpload = null;
      let previewUri = assetUri;

      if (assetUri.startsWith('data:')) {
        try {
          const response = await fetch(assetUri);
          const blob = await response.blob();

          const match = assetUri.match(/^data:(.*?);base64,/);
          const mimeType = match ? match[1] : 'image/jpeg';
          let extension = mimeType.split('/')[1] || 'jpeg';

          imageDataForUpload = { blob, name: `photo.${extension}`, type: mimeType };
        } catch (blobError) {
          console.error('Error al convertir data URI a Blob:', blobError);
          Alert.alert('Error', 'No se pudo procesar la imagen seleccionada.');
          residentPhotoDataRef.current = null;
          setResidentFotoPreview(null);
          return;
        }
      } else {
        let filename = assetUri.split('/').pop();
        let type = 'image/jpeg';
        const extensionMatch = filename.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
        if (extensionMatch) {
          const ext = extensionMatch[1].toLowerCase();
          switch (ext) {
            case 'png': type = 'image/png'; break;
            case 'jpg':
            case 'jpeg': type = 'image/jpeg'; break;
            case 'gif': type = 'image/gif'; break;
            default: type = 'application/octet-stream';
          }
        }
        imageDataForUpload = { uri: assetUri, name: filename, type: type };
      }

      residentPhotoDataRef.current = imageDataForUpload;
      setResidentFotoPreview(previewUri);
    } else {
      residentPhotoDataRef.current = null;
      setResidentFotoPreview(null);
    }
  };

  const handleRegisterResident = async () => {
    const currentResidentPhotoData = residentPhotoDataRef.current;

    if (!residentName || !residentApellido || residentGenero === '' || !residentTelefono) {
      Alert.alert('Error', 'Por favor, completa todos los campos obligatorios del residente.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('nombre', residentName);
    formData.append('apellido', residentApellido);

    const year = residentFechaNacimiento.getFullYear();
    const month = String(residentFechaNacimiento.getMonth() + 1).padStart(2, '0');
    const day = String(residentFechaNacimiento.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    formData.append('fechaNacimiento', formattedDate);

    formData.append('genero', residentGenero);
    formData.append('telefono', residentTelefono);

    let newResidentId = null;

    try {
      const response = await fetch(`${API_URL}/Residente`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data && data.status === 0) {
        newResidentId = data.data?.id_residente || null;

        if (newResidentId) {
          if (currentResidentPhotoData) {
            const photoUploadFormData = new FormData();
            photoUploadFormData.append('IdResidente', newResidentId.toString());

            if (currentResidentPhotoData.blob) {
              photoUploadFormData.append('FotoArchivo', currentResidentPhotoData.blob, currentResidentPhotoData.name);
            } else {
              photoUploadFormData.append('FotoArchivo', {
                uri: currentResidentPhotoData.uri,
                name: currentResidentPhotoData.name,
                type: currentResidentPhotoData.type,
              });
            }

            try {
              const photoUploadResponse = await fetch(`${API_URL}/Residente/UploadPhoto`, {
                method: 'POST',
                body: photoUploadFormData,
              });

              if (!photoUploadResponse.ok) {
                const errorText = await photoUploadResponse.text();
                console.error('Error al subir la foto. Código de estado:', photoUploadResponse.status, 'Respuesta:', errorText);
                try {
                  const errorData = JSON.parse(errorText);
                  Alert.alert('Error al subir foto', errorData.message || 'Ocurrió un error al subir la imagen.');
                } catch (parseError) {
                  Alert.alert('Error al subir foto', `Ocurrió un error inesperado al subir la imagen: ${errorText}`);
                }
              }
            } catch (photoError) {
              console.error('Error de conexión al subir la foto:', photoError);
              Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor para subir la foto.');
            }
          }

          navigation.navigate('FamiliarRegistrationScreen', {
            residentId: newResidentId,
            residentSummary: {
              name: residentName,
              apellido: residentApellido,
              fechaNacimiento: residentFechaNacimiento.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
              genero: residentGenero,
              telefono: residentTelefono,
              fotoPreview: residentFotoPreview,
            },
          });

        } else {
          Alert.alert('Advertencia', 'Residente registrado, pero no se recibió el ID. No se puede continuar al siguiente paso.');
          console.error('ID del residente no recibido en la respuesta (verifica la estructura del JSON):', data);
        }
      } else {
        Alert.alert('Error al Registrar Residente', data.message || 'Ocurrió un error inesperado.');
      }
    } catch (error) {
      console.error('Error registrando residente:', error);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor para registrar al residente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDateForDisplay = residentFechaNacimiento.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedDateForWebInput = residentFechaNacimiento.toISOString().split('T')[0]; // "YYYY-MM-DD"

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={DARK_GRAY} />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo Residente</Text>
        <View style={{ width: 24 }} /> {/* Espaciador para centrar */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.formCard}>
          {/* Sección de la foto */}
          <View style={styles.photoContainer}>
            {residentFotoPreview ? (
              <Image source={{ uri: residentFotoPreview }} style={styles.residentPhotoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person-circle-outline" size={80} color={LIGHT_GRAY} />
                <Text style={styles.photoPlaceholderText}>Añadir Foto</Text>
              </View>
            )}
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Ionicons name="camera-outline" size={20} color={WHITE} />
              <Text style={styles.imagePickerButtonText}>Seleccionar Foto</Text>
            </TouchableOpacity>
          </View>

          {/* Sección de datos del residente */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Datos Personales</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={MEDIUM_GRAY}
              value={residentName}
              onChangeText={setResidentName}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              placeholderTextColor={MEDIUM_GRAY}
              value={residentApellido}
              onChangeText={setResidentApellido}
            />

            {/* Selector de Género */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={residentGenero}
                onValueChange={(itemValue) => setResidentGenero(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Seleccionar Género..." value="" enabled={true} color={MEDIUM_GRAY} /> {/* Aseguramos que sea seleccionable y con color */}
                <Picker.Item label="Masculino" value="Masculino" />
                <Picker.Item label="Femenino" value="Femenino" />
              </Picker>
              <View style={styles.pickerIcon}>
                <Ionicons name="chevron-down" size={20} color={MEDIUM_GRAY} />
              </View>
            </View>

            {/* Selector de Fecha de Nacimiento Condicional */}
            {Platform.OS === 'web' ? (
              <View style={styles.webDateInputContainer}>
                <Text style={styles.dateLabel}>Fecha de Nacimiento:</Text>
                <input
                  type="date"
                  value={formattedDateForWebInput}
                  onChange={onChangeResidentDateWeb}
                  style={styles.webDateInput}
                />
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateInputText}>
                    Fecha de Nacimiento: {formattedDateForDisplay}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={MEDIUM_GRAY} />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    testID="residentDatePicker"
                    value={residentFechaNacimiento}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeResidentDateMobile}
                  />
                )}
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="Teléfono (Ej: 5512345678)"
              placeholderTextColor={MEDIUM_GRAY}
              value={residentTelefono}
              onChangeText={setResidentTelefono}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRegisterResident}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={WHITE} />
              ) : (
                <Text style={styles.primaryButtonText}>Registrar Residente y Continuar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS DEL FORMULARIO (ADAPTADOS DE SIDEMENU.JS) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT, // Fondo claro del SideMenu
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: WHITE, // Fondo blanco para el header
    borderBottomWidth: 0.5,
    borderBottomColor: VERY_LIGHT_GRAY, // Línea sutil
    paddingTop: Platform.OS === 'android' ? 35 : 18,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  formCard: {
    width: '95%',
    maxWidth: 600, // Un poco más estrecho que antes para centralizar
    backgroundColor: WHITE, // Fondo blanco para la tarjeta del formulario
    borderRadius: 12, // Bordes redondeados
    padding: 25, // Padding interno
    marginBottom: 20,
    // Sombra suave como en los ítems activos del SideMenu
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, // Menos opaca para un efecto sutil
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 0.5, // Borde sutil
    borderColor: VERY_LIGHT_GRAY,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ACCENT_GREEN_BACKGROUND, // Fondo verde claro como los ítems activos
    borderWidth: 1,
    borderColor: LIGHT_GREEN, // Borde verde más claro
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: LIGHT_GRAY,
    marginTop: 5,
  },
  residentPhotoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: PRIMARY_GREEN, // Borde verde primario
  },
  imagePickerButton: {
    flexDirection: 'row',
    backgroundColor: LIGHT_GREEN, // Verde claro para el botón de foto
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra sutil como en los ítems del SideMenu
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imagePickerButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailsSection: {},
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
  input: {
    height: 50,
    borderColor: VERY_LIGHT_GRAY, // Borde muy claro
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 18,
    fontSize: 16,
    color: DARK_GRAY,
    backgroundColor: WHITE, // Fondo blanco
    // Sombra sutil para inputs
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
    // Sombra sutil para picker
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
    transform: [{ translateY: -10 }],
    pointerEvents: 'none',
  },
  dateInput: { // Estilo para el botón que abre el picker en móvil
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
    // Sombra sutil
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInputText: {
    fontSize: 16,
    color: DARK_GRAY,
    flex: 1,
  },
  // Estilos para el input de fecha en Web
  webDateInputContainer: {
    marginBottom: 18,
    // Añadir el estilo del contenedor si es necesario para sombra/borde global
    borderColor: VERY_LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 8,
    padding: 0, // Remover padding para que el input ocupe el 100%
    backgroundColor: WHITE,
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  dateLabel: {
    fontSize: 14, // Más pequeño para el label
    color: MEDIUM_GRAY,
    marginBottom: 5,
    paddingLeft: 15, // Alinear con el padding de los inputs
    paddingTop: 8, // Pequeño padding superior para separar
  },
  webDateInput: {
    height: 38, // Ajustar altura para el input de fecha en web dentro del contenedor
    width: '100%',
    borderColor: 'transparent', // Sin borde porque el contenedor ya lo tiene
    borderWidth: 0,
    borderRadius: 8, // Hereda del contenedor
    paddingHorizontal: 15,
    fontSize: 16,
    color: DARK_GRAY,
    backgroundColor: 'transparent', // Fondo transparente, el contenedor provee el color
    outline: 'none', // Quita el outline azul al enfocar en navegadores
    boxSizing: 'border-box', // Asegura que padding y border no aumenten el tamaño
  },
  primaryButton: {
    backgroundColor: PRIMARY_GREEN, // Verde primario del SideMenu
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    // Sombra fuerte como el botón de logout del SideMenu
    shadowColor: PRIMARY_GREEN,
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
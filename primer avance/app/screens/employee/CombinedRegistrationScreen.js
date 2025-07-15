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
  Platform,
  Image,
  Dimensions,
  ActionSheetIOS, // Import for iOS specific action sheet
  Alert, // Import for general alerts
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

import * as ImagePicker from 'expo-image-picker';

import { app, auth, db } from '../../config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

import BackButton from '../../components/shared/BackButton';
import { useNotification } from '../../src/context/NotificationContext';

import {
  formatName,
  isValidName,
  isAdult,
  formatPhoneNumber,
  isValidPhoneNumber,
  isValidDateFormat,
  isValidEmail,
} from '../../components/shared/Validations';

import Config from '../../config/config';
const API_URL = Config.API_BASE_URL;

const PRIMARY_GREEN = '#6BB240';
const LIGHT_GREEN = '#9CD275';
const ACCENT_GREEN_BACKGROUND = '#EEF7E8';
const DARK_GRAY = '#333';
const MEDIUM_GRAY = '#555';
const LIGHT_GRAY = '#888';
const VERY_LIGHT_GRAY = '#eee';
const BACKGROUND_LIGHT = '#fcfcfc';
const WHITE = '#fff';
const ERROR_RED = '#DC3545';
const BUTTON_HOVER_COLOR = '#5aa130';

const { width, height } = Dimensions.get('window');
const IS_LARGE_SCREEN = width > 900;

export default function CombinedRegistrationScreen({ navigation }) {
  const { showNotification } = useNotification();

  const [residentName, setResidentName] = useState('');
  const [residentApellido, setResidentApellido] = useState('');
  const [residentFechaNacimiento, setResidentFechaNacimiento] = useState(new Date(1990, 0, 1));
  const [showResidentDatePicker, setShowResidentDatePicker] = useState(false);
  const [residentGenero, setResidentGenero] = useState('');
  const [residentTelefono, setResidentTelefono] = useState('');
  const residentPhotoDataRef = useRef(null);
  const [residentFotoPreview, setResidentFotoPreview] = useState(null);

  const [residentNameError, setResidentNameError] = useState('');
  const [residentApellidoError, setResidentApellidoError] = useState('');
  const [residentFechaNacimientoError, setResidentFechaNacimientoError] = useState('');
  const [residentGeneroError, setResidentGeneroError] = useState('');
  const [residentTelefonoError, setResidentTelefonoError] = useState('');

  const [familiarName, setFamiliarName] = useState('');
  const [familiarApellido, setFamiliarApellido] = useState('');
  const [familiarFechaNacimiento, setFamiliarFechaNacimiento] = useState(new Date(1990, 0, 1));
  const [showFamiliarDatePicker, setShowFamiliarDatePicker] = useState(false);
  const [familiarGenero, setFamiliarGenero] = useState('');
  const [familiarTelefono, setFamiliarTelefono] = useState('');
  const [familiarParentesco, setFamiliarParentesco] = useState('');
  const [familiarFirebaseEmail, setFamiliarFirebaseEmail] = useState('');
  const [familiarFirebasePassword, setFamiliarFirebasePassword] = useState('');
  const [familiarConfirmPassword, setFamiliarConfirmPassword] = useState(''); // Nuevo estado para confirmación
  const [showPassword, setShowPassword] = useState(false);

  const [familiarNameError, setFamiliarNameError] = useState('');
  const [familiarApellidoError, setFamiliarApellidoError] = useState('');
  const [familiarFechaNacimientoError, setFamiliarFechaNacimientoError] = useState('');
  const [familiarGeneroError, setFamiliarGeneroError] = useState('');
  const [familiarTelefonoError, setFamiliarTelefonoError] = useState('');
  const [familiarParentescoError, setFamiliarParentescoError] = useState('');
  const [familiarFirebaseEmailError, setFamiliarFirebaseEmailError] = useState('');
  const [familiarFirebasePasswordError, setFamiliarFirebasePasswordError] = useState('');
  const [familiarConfirmPasswordError, setFamiliarConfirmPasswordError] = useState(''); // Nuevo estado de error

  const [isLoading, setIsLoading] = useState(false);
  const [parentescos, setParentescos] = useState([]);

useEffect(() => {
    const fetchParentescos = async () => {
      try {
        const response = await fetch(`${API_URL}/Parentesco`);
        const data = await response.json();

        if (response.ok && data.parentesco) {
          setParentescos(data.parentesco);
        } else {
          console.error('Error al cargar parentescos:', data.message || 'Error desconocido');
          setParentescos([
            { id: 1, nombre: 'Hijo/a' }, { id: 2, nombre: 'Cónyuge' },
          ]);
        }
      } catch (error) {
        console.error('Error de conexión al cargar parentescos:', error);
        setParentescos([
          { id: 1, nombre: 'Hijo/a' }, { id: 2, nombre: 'Cónyuge' },
        ]);
      }
    };
    fetchParentescos();
  }, []);

  const onChangeResidentDateMobile = (event, selectedDate) => {
    const currentDate = selectedDate || residentFechaNacimiento;
    setShowResidentDatePicker(Platform.OS === 'ios' ? false : false);
    setResidentFechaNacimiento(currentDate);
  };

  const onChangeResidentDateWeb = (event) => {
    const dateString = event.target.value;
    if (dateString) {
      const date = new Date(dateString + 'T00:00:00Z');
      if (!isNaN(date.getTime())) {
        setResidentFechaNacimiento(date);
      }
    }
  };

  const onChangeFamiliarDateMobile = (event, selectedDate) => {
    const currentDate = selectedDate || familiarFechaNacimiento;
    setShowFamiliarDatePicker(Platform.OS === 'ios' ? false : false);
    setFamiliarFechaNacimiento(currentDate);
  };

  const onChangeFamiliarDateWeb = (event) => {
    const dateString = event.target.value;
    if (dateString) {
      const date = new Date(dateString + 'T00:00:00Z');
      if (!isNaN(date.getTime())) {
        setFamiliarFechaNacimiento(date);
      }
    }
  };

  const processImageResult = async (result) => {
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
          showNotification('No se pudo procesar la imagen seleccionada.', 'error');
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

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showNotification('Permiso requerido para acceder a la cámara.', 'error');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    processImageResult(result);
  };

  const choosePhotoFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showNotification('Permiso requerido para acceder a la galería de fotos.', 'error');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });
    processImageResult(result);
  };

  const handleImagePickOption = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tomar Foto', 'Seleccionar de Galería'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            choosePhotoFromLibrary();
          }
        }
      );
    } else if (Platform.OS === 'web') {
      // Para web, directamente abre la galería de fotos
      choosePhotoFromLibrary();
    } else {
      // Mantiene Alert.alert para Android
      Alert.alert(
        "Seleccionar Foto",
        "¿De dónde quieres seleccionar la foto?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Tomar Foto", onPress: takePhoto },
          { text: "Seleccionar de Galería", onPress: choosePhotoFromLibrary },
        ],
        { cancelable: true }
      );
    }
  };

  const validateField = (fieldName, value) => {
    let isValid = true;
    switch (fieldName) {
      case 'residentName':
        if (!value.trim()) {
          setResidentNameError('El nombre es obligatorio.');
          isValid = false;
        } else if (!isValidName(value)) {
          setResidentNameError('El nombre solo puede contener letras y espacios.');
          isValid = false;
        } else {
          setResidentNameError('');
        }
        break;
      case 'residentApellido':
        if (!value.trim()) {
          setResidentApellidoError('El apellido es obligatorio.');
          isValid = false;
        } else if (!isValidName(value)) {
          setResidentApellidoError('El apellido solo puede contener letras y espacios.');
          isValid = false;
        } else {
          setResidentApellidoError('');
        }
        break;
      case 'residentFechaNacimiento':
        const rDateString = value.toISOString().split('T')[0];
        if (!rDateString) {
          setResidentFechaNacimientoError('La fecha de nacimiento es obligatoria.');
          isValid = false;
        } else if (!isValidDateFormat(rDateString)) {
          setResidentFechaNacimientoError('Formato de fecha inválido (YYYY-MM-DD).');
          isValid = false;
        } else if (!isAdult(rDateString)) {
          setResidentFechaNacimientoError('La edad no cumple con los requisitos (mayor de 18 y no más de 120 años).');
          isValid = false;
        } else {
          setResidentFechaNacimientoError('');
        }
        break;
      case 'residentGenero':
        if (!value) {
          setResidentGeneroError('El género es obligatorio.');
          isValid = false;
        } else {
          setResidentGeneroError('');
        }
        break;
      case 'residentTelefono':
        if (!value) {
          setResidentTelefonoError('El teléfono es obligatorio.');
          isValid = false;
        } else if (!isValidPhoneNumber(value)) {
          setResidentTelefonoError('El teléfono debe tener exactamente 10 dígitos numéricos.');
          isValid = false;
        } else {
          setResidentTelefonoError('');
        }
        break;
      case 'familiarName':
        if (!value.trim()) {
          setFamiliarNameError('El nombre es obligatorio.');
          isValid = false;
        } else if (!isValidName(value)) {
          setFamiliarNameError('El nombre solo puede contener letras y espacios.');
          isValid = false;
        } else {
          setFamiliarNameError('');
        }
        break;
      case 'familiarApellido':
        if (!value.trim()) {
          setFamiliarApellidoError('El apellido es obligatorio.');
          isValid = false;
        } else if (!isValidName(value)) {
          setFamiliarApellidoError('El apellido solo puede contener letras y espacios.');
          isValid = false;
        } else {
          setFamiliarApellidoError('');
        }
        break;
      case 'familiarFechaNacimiento':
        const fDateString = value.toISOString().split('T')[0];
        if (!fDateString) {
          setFamiliarFechaNacimientoError('La fecha de nacimiento es obligatoria.');
          isValid = false;
        } else if (!isValidDateFormat(fDateString)) {
          setFamiliarFechaNacimientoError('Formato de fecha inválido (YYYY-MM-DD).');
          isValid = false;
        } else if (!isAdult(fDateString)) {
          setFamiliarFechaNacimientoError('La edad no cumple con los requisitos (mayor de 18 y no más de 120 años).');
          isValid = false;
        } else {
          setFamiliarFechaNacimientoError('');
        }
        break;
      case 'familiarGenero':
        if (!value) {
          setFamiliarGeneroError('El género es obligatorio.');
          isValid = false;
        } else {
          setFamiliarGeneroError('');
        }
        break;
      case 'familiarTelefono':
        if (!value) {
          setFamiliarTelefonoError('El teléfono es obligatorio.');
          isValid = false;
        } else if (!isValidPhoneNumber(value)) {
          setFamiliarTelefonoError('El teléfono debe tener exactamente 10 dígitos numéricos.');
          isValid = false;
        } else {
          setFamiliarTelefonoError('');
        }
        break;
      case 'familiarParentesco':
        if (!value) {
          setFamiliarParentescoError('El parentesco es obligatorio.');
          isValid = false;
        } else {
          setFamiliarParentescoError('');
        }
        break;
      case 'familiarFirebaseEmail':
        if (!value.trim()) {
          setFamiliarFirebaseEmailError('El correo electrónico es obligatorio.');
          isValid = false;
        } else if (!isValidEmail(value)) {
          setFamiliarFirebaseEmailError('El formato del correo electrónico no es válido.');
          isValid = false;
        } else {
          setFamiliarFirebaseEmailError('');
        }
        break;
      case 'familiarFirebasePassword':
        if (!value) {
          setFamiliarFirebasePasswordError('La contraseña es obligatoria.');
          isValid = false;
        } else if (value.length < 6) {
          setFamiliarFirebasePasswordError('La contraseña debe tener al menos 6 caracteres.');
          isValid = false;
        } else {
          setFamiliarFirebasePasswordError('');
        }
        break;
      case 'familiarConfirmPassword':
        if (!value) {
          setFamiliarConfirmPasswordError('Confirma tu contraseña.');
          isValid = false;
        } else if (value !== familiarFirebasePassword) {
          setFamiliarConfirmPasswordError('Las contraseñas no coinciden.');
          isValid = false;
        } else {
          setFamiliarConfirmPasswordError('');
        }
        break;
      default:
        break;
    }
    return isValid;
  };


  const handleCombinedRegistration = async () => {
    setIsLoading(true);

    const isResidentNameValid = validateField('residentName', residentName);
    const isResidentApellidoValid = validateField('residentApellido', residentApellido);
    const isResidentFechaNacimientoValid = validateField('residentFechaNacimiento', residentFechaNacimiento);
    const isResidentGeneroValid = validateField('residentGenero', residentGenero);
    const isResidentTelefonoValid = validateField('residentTelefono', residentTelefono);

    const isFamiliarNameValid = validateField('familiarName', familiarName);
    const isFamiliarApellidoValid = validateField('familiarApellido', familiarApellido);
    const isFamiliarFechaNacimientoValid = validateField('familiarFechaNacimiento', familiarFechaNacimiento);
    const isFamiliarGeneroValid = validateField('familiarGenero', familiarGenero);
    const isFamiliarTelefonoValid = validateField('familiarTelefono', familiarTelefono);
    const isFamiliarParentescoValid = validateField('familiarParentesco', familiarParentesco);
    const isFamiliarFirebaseEmailValid = validateField('familiarFirebaseEmail', familiarFirebaseEmail);
    const isFamiliarFirebasePasswordValid = validateField('familiarFirebasePassword', familiarFirebasePassword);
    const isFamiliarConfirmPasswordValid = validateField('familiarConfirmPassword', familiarConfirmPassword); // Validar confirmación

    if (
      !isResidentNameValid || !isResidentApellidoValid || !isResidentFechaNacimientoValid ||
      !isResidentGeneroValid || !isResidentTelefonoValid ||
      !isFamiliarNameValid || !isFamiliarApellidoValid || !isFamiliarFechaNacimientoValid ||
      !isFamiliarGeneroValid || !isFamiliarTelefonoValid || !isFamiliarParentescoValid ||
      !isFamiliarFirebaseEmailValid || !isFamiliarFirebasePasswordValid || !isFamiliarConfirmPasswordValid
    ) {
      showNotification('Por favor, corrige los errores en el formulario antes de continuar.', 'error');
      setIsLoading(false);
      return;
    }

    let newResidentId = null;
    let firebaseUser = null;

    try {
      try {
        console.log("Intentando crear usuario en Firebase con:", familiarFirebaseEmail);
        const userCredential = await createUserWithEmailAndPassword(auth, familiarFirebaseEmail, familiarFirebasePassword);
        firebaseUser = userCredential.user;
        console.log("Usuario Firebase creado, UID:", firebaseUser.uid);

        await setDoc(doc(db, "users", firebaseUser.uid), {
            email: firebaseUser.email,
            role: "family",
            createdAt: new Date().toISOString(),
        });
        console.log("Documento de usuario 'family' creado en Firestore para UID:", firebaseUser.uid);

      } catch (firebaseError) {
        let errorMessage = "Error desconocido al crear usuario en Firebase.";
        if (firebaseError.code === 'auth/email-already-in-use') {
          errorMessage = 'El correo electrónico ya está en uso. Por favor, utiliza otro.';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'El formato del correo electrónico no es válido.';
        } else if (firebaseError.code === 'auth/weak-password') {
          errorMessage = 'La contraseña es demasiado débil (mínimo 6 caracteres).';
        }
        console.error("Error al crear usuario Firebase:", firebaseError);
        showNotification(errorMessage, 'error');
        setIsLoading(false);
        return;
      }

      const residentFormData = new FormData();
      residentFormData.append('nombre', formatName(residentName));
      residentFormData.append('apellido', formatName(residentApellido));

      const year = residentFechaNacimiento.getFullYear();
      const month = String(residentFechaNacimiento.getMonth() + 1).padStart(2, '0');
      const day = String(residentFechaNacimiento.getDate()).padStart(2, '0');
      residentFormData.append('fechaNacimiento', `${year}-${month}-${day}`);

      residentFormData.append('genero', residentGenero);
      residentFormData.append('telefono', formatPhoneNumber(residentTelefono));

      const residentResponse = await fetch(`${API_URL}/Residente`, {
        method: 'POST',
        body: residentFormData,
      });

      const residentData = await residentResponse.json();

      if (!residentResponse.ok || residentData.status !== 0) {
        if (firebaseUser) {
          console.warn(`Falló registro de residente. Intentando notificar al backend para eliminar UID de Firebase: ${firebaseUser.uid}`);
        }
        showNotification(residentData.message || 'Ocurrió un error inesperado al registrar al residente. El familiar no fue registrado.', 'error');
        setIsLoading(false);
        return;
      }
      newResidentId = residentData.data?.id_residente;
      if (!newResidentId) {
        if (firebaseUser) {
          console.warn(`Residente registrado pero sin ID. Intentando notificar al backend para eliminar UID de Firebase: ${firebaseUser.uid}`);
        }
        showNotification('Residente registrado, pero no se recibió el ID. No se puede registrar al familiar.', 'error');
        setIsLoading(false);
        return;
      }

      const currentResidentPhotoData = residentPhotoDataRef.current;
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
            console.warn('Advertencia: Error al subir la foto del residente. Se continuará con el registro del familiar. Error:', await photoUploadResponse.text());
            showNotification('Error al subir la foto del residente, pero el registro continuará.', 'warning');
          }
        } catch (photoError) {
          console.warn('Advertencia: Error de conexión al subir la foto del residente. Se continuará con el registro del familiar. Error:', photoError);
          showNotification('Error de conexión al subir la foto del residente, pero el registro continuará.', 'warning');
        }
      }

      const familiarFormData = new FormData();
      familiarFormData.append('nombre', formatName(familiarName));
      familiarFormData.append('apellido', formatName(familiarApellido));
      const familiarYear = familiarFechaNacimiento.getFullYear();
      const familiarMonth = String(familiarFechaNacimiento.getMonth() + 1).padStart(2, '0');
      const familiarDay = String(familiarFechaNacimiento.getDate()).padStart(2, '0');
      familiarFormData.append('fechaNacimiento', `${familiarYear}-${familiarMonth}-${familiarDay}`);
      familiarFormData.append('genero', familiarGenero);
      familiarFormData.append('telefono', formatPhoneNumber(familiarTelefono));
      familiarFormData.append('id_residente', newResidentId.toString());
      familiarFormData.append('id_parentesco', familiarParentesco);
      familiarFormData.append('firebase_uid', firebaseUser.uid);

      const familiarResponse = await fetch(`${API_URL}/Familiar`, {
        method: 'POST',
        body: familiarFormData,
      });

      const familiarData = await familiarResponse.json();

      if (familiarResponse.ok && familiarData.status === 0) {
        showNotification('Residente y familiar registrados exitosamente.', 'success');
        navigation.navigate('ResidentsList', { registrationSuccess: true });
      } else {
        if (firebaseUser) {
          console.warn(`Falló registro de familiar en backend. Intentando notificar al backend para eliminar UID de Firebase: ${firebaseUser.uid}`);
        }
        if (familiarData.errors) {
          let errorMessages = Object.values(familiarData.errors).map(errArray => errArray.join(', ')).join('\n');
          showNotification(`Por favor, corrige los siguientes errores del familiar:\n${errorMessages}`, 'error');
        } else {
          showNotification(familiarData.message || 'Ocurrió un error inesperado al guardar datos personales del familiar.', 'error');
        }
        console.error('El registro del familiar falló después de registrar al residente. ID del Residente:', newResidentId);
      }

    } catch (error) {
      console.error('Error en el proceso de registro combinado:', error);
      showNotification('No se pudo conectar con el servidor para completar el registro combinado.', 'error');
      if (firebaseUser) {
        console.warn(`Error de conexión general. Intentando notificar al backend para eliminar UID de Firebase: ${firebaseUser.uid}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formattedResidentDateForDisplay = residentFechaNacimiento.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedResidentDateForWebInput = residentFechaNacimiento.toISOString().split('T')[0];

  const formattedFamiliarDateForDisplay = familiarFechaNacimiento.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedFamiliarDateForWebInput = familiarFechaNacimiento.toISOString().split('T')[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Registro de Residente y Familiar</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.mainContentWrapper}>
          <View style={styles.formCard}>
            {/* INICIO DE LA SECCIÓN DE FOTO MODIFICADA */}
            <TouchableOpacity style={styles.photoContainer} onPress={handleImagePickOption} disabled={isLoading}>
              {residentFotoPreview ? (
                <Image source={{ uri: residentFotoPreview }} style={styles.residentPhotoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={50} color={LIGHT_GRAY} />
                  <Text style={styles.photoPlaceholderText}>Añadir Foto</Text>
                </View>
              )}
            </TouchableOpacity>
            {/* FIN DE LA SECCIÓN DE FOTO MODIFICADA */}

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Datos Personales del Residente</Text>

              <Text style={styles.inputLabel}>Nombre</Text>
              <View style={[styles.inputContainer, residentNameError ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ej: Juan"
                  placeholderTextColor={LIGHT_GRAY}
                  value={residentName}
                  onChangeText={(text) => {setResidentName(formatName(text)); setResidentNameError('');}}
                  onBlur={() => validateField('residentName', residentName)}
                  editable={!isLoading}
                />
              </View>
              {residentNameError ? <Text style={styles.errorText}>{residentNameError}</Text> : null}

              <Text style={styles.inputLabel}>Apellido</Text>
              <View style={[styles.inputContainer, residentApellidoError ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ej: Pérez"
                  placeholderTextColor={LIGHT_GRAY}
                  value={residentApellido}
                  onChangeText={(text) => {setResidentApellido(formatName(text)); setResidentApellidoError('');}}
                  onBlur={() => validateField('residentApellido', residentApellido)}
                  editable={!isLoading}
                />
              </View>
              {residentApellidoError ? <Text style={styles.errorText}>{residentApellidoError}</Text> : null}

              <Text style={styles.inputLabel}>Género</Text>
              <View style={[styles.pickerInputContainer, residentGeneroError ? styles.inputError : null]}>
                <Ionicons name="person-circle-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <Picker
                  selectedValue={residentGenero}
                  onValueChange={(itemValue) => {setResidentGenero(itemValue); setResidentGeneroError('');}}
                  onBlur={() => validateField('residentGenero', residentGenero)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  enabled={!isLoading}
                >
                  <Picker.Item label="Seleccionar Género..." value="" enabled={true} color={LIGHT_GRAY} />
                  <Picker.Item label="Masculino" value="Masculino" />
                  <Picker.Item label="Femenino" value="Femenino" />
                </Picker>
              </View>
              {residentGeneroError ? <Text style={styles.errorText}>{residentGeneroError}</Text> : null}

              <Text style={styles.inputLabel}>Fecha de Nacimiento</Text>
              {Platform.OS === 'web' ? (
                <View style={[styles.inputContainer, residentFechaNacimientoError ? styles.inputError : null]}>
                  <Ionicons name="calendar-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                  <input
                    type="date"
                    value={formattedResidentDateForWebInput}
                    onChange={onChangeResidentDateWeb}
                    onBlur={() => validateField('residentFechaNacimiento', residentFechaNacimiento)}
                    style={styles.datePickerWeb}
                    disabled={isLoading}
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.inputContainer, residentFechaNacimientoError ? styles.inputError : null]}
                    onPress={() => setShowResidentDatePicker(true)}
                    disabled={isLoading}
                  >
                    <Ionicons name="calendar-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                    <Text style={styles.dateInputText}>{formattedResidentDateForDisplay}</Text>
                  </TouchableOpacity>
                  {showResidentDatePicker && (
                    <DateTimePicker
                      testID="residentDatePicker"
                      value={residentFechaNacimiento}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onChangeResidentDateMobile}
                      maximumDate={new Date()}
                    />
                  )}
                </>
              )}
              {residentFechaNacimientoError ? <Text style={styles.errorText}>{residentFechaNacimientoError}</Text> : null}

              <Text style={styles.inputLabel}>Teléfono</Text>
              <View style={[styles.inputContainer, residentTelefonoError ? styles.inputError : null]}>
                <Ionicons name="call-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ej: 5512345678"
                  placeholderTextColor={LIGHT_GRAY}
                  value={residentTelefono}
                  onChangeText={(text) => {setResidentTelefono(formatPhoneNumber(text)); setResidentTelefonoError('');}}
                  onBlur={() => validateField('residentTelefono', residentTelefono)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isLoading}
                />
                <Text style={styles.charCounter}>{residentTelefono.length}/10</Text>
              </View>
              {residentTelefonoError ? <Text style={styles.errorText}>{residentTelefonoError}</Text> : null}
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.familiarFormContent}>
              <Text style={styles.sectionTitle}>Datos del Familiar</Text>

              <Text style={styles.inputLabel}>Nombre Familiar</Text>
              <View style={[styles.inputContainer, familiarNameError ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ej: Ana"
                  placeholderTextColor={LIGHT_GRAY}
                  value={familiarName}
                  onChangeText={(text) => {setFamiliarName(formatName(text)); setFamiliarNameError('');}}
                  onBlur={() => validateField('familiarName', familiarName)}
                  editable={!isLoading}
                />
              </View>
              {familiarNameError ? <Text style={styles.errorText}>{familiarNameError}</Text> : null}

              <Text style={styles.inputLabel}>Apellido Familiar</Text>
              <View style={[styles.inputContainer, familiarApellidoError ? styles.inputError : null]}>
                <Ionicons name="person-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ej: Gómez"
                  placeholderTextColor={LIGHT_GRAY}
                  value={familiarApellido}
                  onChangeText={(text) => {setFamiliarApellido(formatName(text)); setFamiliarApellidoError('');}}
                  onBlur={() => validateField('familiarApellido', familiarApellido)}
                  editable={!isLoading}
                />
              </View>
              {familiarApellidoError ? <Text style={styles.errorText}>{familiarApellidoError}</Text> : null}

              <Text style={styles.inputLabel}>Género Familiar</Text>
              <View style={[styles.pickerInputContainer, familiarGeneroError ? styles.inputError : null]}>
                <Ionicons name="person-circle-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <Picker
                  selectedValue={familiarGenero}
                  onValueChange={(itemValue) => {setFamiliarGenero(itemValue); setFamiliarGeneroError('');}}
                  onBlur={() => validateField('familiarGenero', familiarGenero)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  enabled={!isLoading}
                >
                  <Picker.Item label="Seleccionar Género..." value="" enabled={true} color={LIGHT_GRAY} />
                  <Picker.Item label="Masculino" value="Masculino" />
                  <Picker.Item label="Femenino" value="Femenino" />
                </Picker>
              </View>
              {familiarGeneroError ? <Text style={styles.errorText}>{familiarGeneroError}</Text> : null}

              <Text style={styles.inputLabel}>Fecha de Nacimiento Familiar</Text>
              {Platform.OS === 'web' ? (
                <View style={[styles.inputContainer, familiarFechaNacimientoError ? styles.inputError : null]}>
                  <Ionicons name="calendar-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                  <input
                    type="date"
                    value={formattedFamiliarDateForWebInput}
                    onChange={onChangeFamiliarDateWeb}
                    onBlur={() => validateField('familiarFechaNacimiento', familiarFechaNacimiento)}
                    style={styles.datePickerWeb}
                    disabled={isLoading}
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.inputContainer, familiarFechaNacimientoError ? styles.inputError : null]}
                    onPress={() => setShowFamiliarDatePicker(true)}
                    disabled={isLoading}
                  >
                    <Ionicons name="calendar-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                    <Text style={styles.dateInputText}>{formattedFamiliarDateForDisplay}</Text>
                  </TouchableOpacity>
                  {showFamiliarDatePicker && (
                    <DateTimePicker
                      testID="familiarDatePicker"
                      value={familiarFechaNacimiento}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onChangeFamiliarDateMobile}
                      maximumDate={new Date()}
                    />
                  )}
                </>
              )}
              {familiarFechaNacimientoError ? <Text style={styles.errorText}>{familiarFechaNacimientoError}</Text> : null}

              <Text style={styles.inputLabel}>Teléfono Familiar</Text>
              <View style={[styles.inputContainer, familiarTelefonoError ? styles.inputError : null]}>
                <Ionicons name="call-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Ej: 5512345678"
                  placeholderTextColor={LIGHT_GRAY}
                  value={familiarTelefono}
                  onChangeText={(text) => {setFamiliarTelefono(formatPhoneNumber(text)); setFamiliarTelefonoError('');}}
                  onBlur={() => validateField('familiarTelefono', familiarTelefono)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isLoading}
                />
                <Text style={styles.charCounter}>{familiarTelefono.length}/10</Text>
              </View>
              {familiarTelefonoError ? <Text style={styles.errorText}>{familiarTelefonoError}</Text> : null}

              <Text style={styles.inputLabel}>Parentesco</Text>
              <View style={[styles.pickerInputContainer, familiarParentescoError ? styles.inputError : null]}>
                <Ionicons name="people-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <Picker
                  selectedValue={familiarParentesco}
                  onValueChange={(itemValue) => {setFamiliarParentesco(itemValue); setFamiliarParentescoError('');}}
                  onBlur={() => validateField('familiarParentesco', familiarParentesco)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  enabled={!isLoading}
                >
                  <Picker.Item label="Seleccionar Parentesco..." value="" enabled={true} color={LIGHT_GRAY} />
                  {parentescos.map((p) => (
                    <Picker.Item key={p.id} label={p.nombre} value={p.id.toString()} />
                  ))}
                </Picker>
              </View>
              {familiarParentescoError ? <Text style={styles.errorText}>{familiarParentescoError}</Text> : null}

              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <View style={[styles.inputContainer, familiarFirebaseEmailError ? styles.inputError : null]}>
                <Ionicons name="mail-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="ejemplo@dominio.com"
                  placeholderTextColor={LIGHT_GRAY}
                  value={familiarFirebaseEmail}
                  onChangeText={(text) => {setFamiliarFirebaseEmail(text); setFamiliarFirebaseEmailError('');}}
                  onBlur={() => validateField('familiarFirebaseEmail', familiarFirebaseEmail)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
              {familiarFirebaseEmailError ? <Text style={styles.errorText}>{familiarFirebaseEmailError}</Text> : null}

              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={[styles.inputContainer, familiarFirebasePasswordError ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={LIGHT_GRAY}
                  value={familiarFirebasePassword}
                  onChangeText={(text) => {setFamiliarFirebasePassword(text); setFamiliarFirebasePasswordError('');}}
                  onBlur={() => validateField('familiarFirebasePassword', familiarFirebasePassword)}
                  secureTextEntry={!showPassword}
                  autoCompleteType={Platform.OS === 'web' ? 'new-password' : 'off'}
                  autoComplete={Platform.OS === 'web' ? 'new-password' : 'off'}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={MEDIUM_GRAY} />
                </TouchableOpacity>
              </View>
              {familiarFirebasePasswordError ? <Text style={styles.errorText}>{familiarFirebasePasswordError}</Text> : null}

              <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
              <View style={[styles.inputContainer, familiarConfirmPasswordError ? styles.inputError : null]}>
                <Ionicons name="lock-closed-outline" size={18} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Confirmar contraseña"
                  placeholderTextColor={LIGHT_GRAY}
                  value={familiarConfirmPassword}
                  onChangeText={(text) => {setFamiliarConfirmPassword(text); setFamiliarConfirmPasswordError('');}}
                  onBlur={() => validateField('familiarConfirmPassword', familiarConfirmPassword)}
                  secureTextEntry={!showPassword}
                  autoCompleteType={Platform.OS === 'web' ? 'new-password' : 'off'}
                  autoComplete={Platform.OS === 'web' ? 'new-password' : 'off'}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={MEDIUM_GRAY} />
                </TouchableOpacity>
              </View>
              {familiarConfirmPasswordError ? <Text style={styles.errorText}>{familiarConfirmPasswordError}</Text> : null}

            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCombinedRegistration}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={WHITE} />
          ) : (
            <Text style={styles.primaryButtonText}>Registrar Residente y Familiar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const containerBaseStyles = {
  backgroundColor: WHITE,
  borderRadius: 15,
  padding: 10, // Reducido de 15 a 10
  shadowColor: DARK_GRAY,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 6,
  borderWidth: 1.5,
  borderColor: VERY_LIGHT_GRAY,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowColor: 'transparent',
    elevation: 0,
    paddingTop: Platform.OS === 'android' ? 35 : 18,
  },
  title: {
    fontSize: IS_LARGE_SCREEN ? 26 : 22,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5, // Más compacto verticalmente, reducido de 10 a 5
  },
  mainContentWrapper: {
    flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
    justifyContent: 'center',
    alignItems: 'center', // Alineación vertical para centrar el familiar form
    flexWrap: 'wrap',
    maxWidth: IS_LARGE_SCREEN ? 900 : '98%',
    width: '100%',
    paddingHorizontal: 8,
  },
  formCard: {
    ...containerBaseStyles,
    padding: IS_LARGE_SCREEN ? 10 : 8, // Más compacto, ajustado de 15 a 10 y de 10 a 8
    margin: IS_LARGE_SCREEN ? 8 : 5, // Más compacto
    alignItems: 'center',
    flex: 1,
    minWidth: IS_LARGE_SCREEN ? 300 : 250, // Ancho mínimo ajustado
    maxWidth: IS_LARGE_SCREEN ? '49%' : '100%',
    width: '100%',
  },
  // INICIO DE ESTILOS DE FOTO MODIFICADOS
  photoContainer: {
    width: 120, // Más pequeño, de 150 a 120
    height: 120, // Más pequeño, de 150 a 120
    borderRadius: 60, // Sigue siendo un círculo (mitad del width/height)
    backgroundColor: VERY_LIGHT_GRAY, // Fondo más claro
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2, // Borde más delgado
    borderColor: LIGHT_GRAY, // Color de borde más suave
    borderStyle: 'dashed', // Borde punteado
    marginBottom: 10, // Un poco más de margen
    // Sombras removidas o ajustadas para coincidir con el estilo punteado más limpio
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  photoPlaceholderText: {
    color: LIGHT_GRAY, // Color de texto claro
    fontSize: 14, // Texto más pequeño, de 16 a 14
    marginTop: 5,
    fontWeight: '600',
    textAlign: 'center',
  },
  residentPhotoPreview: { // Usado cuando hay una foto
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // FIN DE ESTILOS DE FOTO MODIFICADOS
  detailsSection: {
    width: '100%',
  },
  familiarFormContent: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: IS_LARGE_SCREEN ? 20 : 18,
    fontWeight: '700',
    color: PRIMARY_GREEN,
    marginBottom: 8, // Ajustado de 10 a 8
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_GRAY,
    marginTop: 15,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12, // Reducido de 13 a 12
    color: DARK_GRAY,
    marginBottom: 3,
    fontWeight: '600',
    marginTop: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: VERY_LIGHT_GRAY,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: BACKGROUND_LIGHT,
    height: 35, // Ligeramente más pequeño, de 38 a 35
  },
  inputField: {
    flex: 1,
    height: '100%',
    color: MEDIUM_GRAY,
    fontSize: 13, // Reducido de 14 a 13
    paddingLeft: 6,
    ...Platform.select({
      web: {
        outline: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
      },
    }),
  },
  inputIcon: {
    marginRight: 0,
    fontSize: 16,
  },
  inputError: {
    borderColor: ERROR_RED,
    borderWidth: 2,
  },
  errorText: {
    color: ERROR_RED,
    fontSize: 10, // Reducido de 11 a 10
    marginBottom: 0,
    marginTop: 3,
    alignSelf: 'flex-start',
    paddingLeft: 4,
    fontWeight: '500',
  },
  pickerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: BACKGROUND_LIGHT,
    height: 35, // Ligeramente más pequeño, de 38 a 35
    borderWidth: 1.5,
    borderColor: VERY_LIGHT_GRAY,
  },
  picker: {
    flex: 1,
    height: '100%',
    color: MEDIUM_GRAY,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    borderRadius: 0,
    ...Platform.select({
      web: {
        outline: 'none',
      },
    }),
  },
  pickerItem: {
    fontSize: 13, // Reducido de 14 a 13
  },
  dateInputText: {
    flex: 1,
    fontSize: 13, // Reducido de 14 a 13
    color: MEDIUM_GRAY,
    paddingLeft: 6,
  },
  datePickerWeb: {
    flex: 1,
    height: '100%',
    color: MEDIUM_GRAY,
    fontSize: 13, // Reducido de 14 a 13
    paddingLeft: 6,
    borderWidth: 0,
    backgroundColor: 'transparent',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    outline: 'none',
    cursor: 'pointer',
    paddingRight: Platform.OS === 'web' ? 8 : 0,
  },
  passwordToggle: {
    paddingLeft: 8,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  charCounter: {
    fontSize: 10, // Reducido de 11 a 10
    color: LIGHT_GRAY,
    marginLeft: 6,
  },
  primaryButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 8, // Reducido de 10 a 8
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, // Reducido de 15 a 10
    marginBottom: 15,
    width: IS_LARGE_SCREEN ? 350 : '85%',
    maxWidth: 450,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionDuration: '0.3s',
        transitionProperty: 'background-color',
        ':hover': {
          backgroundColor: BUTTON_HOVER_COLOR,
        },
      },
    }),
  },
  primaryButtonText: {
    color: WHITE,
    fontSize: 14, // Reducido de 15 a 14
    fontWeight: 'bold',
  },
});
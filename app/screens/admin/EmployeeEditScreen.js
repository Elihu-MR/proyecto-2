import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Config from '../../config/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  formatName,
  isValidName,
  isAdult,
  formatPhoneNumber,
  isValidPhoneNumber,
  isValidDateFormat,
  isValidEmail,
} from '../../components/shared/Validations';
import { useNotification } from '../../src/context/NotificationContext';

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
const { width } = Dimensions.get('window');
const IS_LARGE_SCREEN = width > 900;

export default function EmployeeEditScreen({ route, onEmployeeEdited, onCancel }) {
  const { employeeData } = route.params;

  const [employeeName, setEmployeeName] = useState(employeeData.nombre);
  const [employeeLastName, setEmployeeLastName] = useState(employeeData.apellido);
  const [employeePhone, setEmployeePhone] = useState(employeeData.telefono);
  const [employeeGender, setEmployeeGender] = useState(employeeData.genero);
  const [employeeBirthDate, setEmployeeBirthDate] = useState(new Date(employeeData.fecha_nacimiento));
  const [showEmployeeDatePicker, setShowEmployeeDatePicker] = useState(false);
  const [employeeActive, setEmployeeActive] = useState(employeeData.activo);

  const [employeeEmail, setEmployeeEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');

  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { showNotification } = useNotification();
  const [nameError, setNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [birthDateError, setBirthDateError] = useState('');

  const API_URL = Config.API_BASE_URL;

  useEffect(() => {
    const fetchEmployeeEmail = async () => {
      if (employeeData.firebaseUid) {
        try {
          const response = await fetch(`${API_URL}/Personal/manage/get-correo/${employeeData.firebaseUid}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener el correo electrónico.');
          }
          const data = await response.json();
          setEmployeeEmail(data.email);
        } catch (error) {
          console.error("Error al obtener el correo electrónico:", error.message);
          showNotification(`Error al cargar el correo: ${error.message}`, 'error');
        }
      }
    };
    fetchEmployeeEmail();
  }, [employeeData.firebaseUid, API_URL, showNotification]);

  const handleNameChange = (text) => {
    const formatted = formatName(text);
    setEmployeeName(formatted);
    if (nameError && isValidName(formatted)) {
      setNameError('');
    }
  };

  const handleNameBlur = () => {
    if (!employeeName.trim()) {
      setNameError('El nombre es obligatorio.');
    } else if (!isValidName(employeeName)) {
      setNameError('El nombre solo puede contener letras y espacios.');
    } else {
      setNameError('');
    }
  };

  const handleLastNameChange = (text) => {
    const formatted = formatName(text);
    setEmployeeLastName(formatted);
    if (lastNameError && isValidName(formatted)) {
      setLastNameError('');
    }
  };

  const handleLastNameBlur = () => {
    if (!employeeLastName.trim()) {
      setLastNameError('El apellido es obligatorio.');
    } else if (!isValidName(employeeLastName)) {
      setLastNameError('El apellido solo puede contener letras y espacios.');
    } else {
      setLastNameError('');
    }
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setEmployeePhone(formatted);
    if (phoneError && isValidPhoneNumber(formatted)) {
      setPhoneError('');
    }
  };

  const handlePhoneBlur = () => {
    if (!employeePhone) {
      setPhoneError('El teléfono es obligatorio.');
    } else if (!isValidPhoneNumber(employeePhone)) {
      setPhoneError('El teléfono debe tener exactamente 10 dígitos numéricos.');
    } else {
      setPhoneError('');
    }
  };

  const handleGenderChange = (itemValue) => {
    setEmployeeGender(itemValue);
    if (!itemValue) {
      setGenderError('El género es obligatorio.');
    } else {
      setGenderError('');
    }
  };

  const handleBirthDateChangeMobile = (event, selectedDate) => {
    const currentDate = selectedDate || employeeBirthDate;
    setShowEmployeeDatePicker(Platform.OS === 'ios' ? false : false);
    setEmployeeBirthDate(currentDate);
    const dateString = currentDate.toISOString().split('T')[0];
    if (!dateString) {
      setBirthDateError('La fecha de nacimiento es obligatoria.');
    } else if (!isValidDateFormat(dateString)) {
      setBirthDateError('Formato de fecha inválido (YYYY-MM-DD).');
    } else if (!isAdult(dateString)) {
      setBirthDateError('La edad no cumple con los requisitos (mayor de 18 y no más de 120 años).');
    } else {
      setBirthDateError('');
    }
  };

  const handleBirthDateChangeWeb = (event) => {
    const dateString = event.target.value;
    if (dateString) {
      const date = new Date(dateString + 'T00:00:00Z');
      if (!isNaN(date.getTime())) {
        setEmployeeBirthDate(date);
        if (!isAdult(dateString)) {
          setBirthDateError('La edad no cumple con los requisitos (mayor de 18 y no más de 120 años).');
        } else {
          setBirthDateError('');
        }
      } else {
        setBirthDateError('Formato de fecha inválido (YYYY-MM-DD).');
      }
    } else {
      setBirthDateError('La fecha de nacimiento es obligatoria.');
    }
  };

  const handleEmailChange = (text) => {
    setEmployeeEmail(text);
    if (emailError && isValidEmail(text)) {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    if (!employeeEmail.trim()) {
      setEmailError('El correo electrónico es obligatorio.');
    } else if (!isValidEmail(employeeEmail)) {
      setEmailError('El correo electrónico no es válido.');
    } else {
      setEmailError('');
    }
  };

  const handleNewPasswordChange = (text) => {
    setNewPassword(text);
    if (newPasswordError && text.length >= 6) {
      setNewPasswordError('');
    }
    if (confirmNewPassword && text === confirmNewPassword) {
      setConfirmNewPasswordError('');
    }
  };

  const handleNewPasswordBlur = () => {
    if (newPassword.trim() && newPassword.length < 6) {
      setNewPasswordError('La contraseña debe tener al menos 6 caracteres.');
    } else {
      setNewPasswordError('');
    }
  };

  const handleConfirmNewPasswordChange = (text) => {
    setConfirmNewPassword(text);
    if (confirmNewPasswordError && newPassword === text) {
      setConfirmNewPasswordError('');
    }
  };

  const handleConfirmNewPasswordBlur = () => {
    if (newPassword.trim() && confirmNewPassword.trim() && newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError('Las contraseñas no coinciden.');
    } else {
      setConfirmNewPasswordError('');
    }
  };

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleShowConfirmNewPassword = () => {
    setShowConfirmNewPassword(!showConfirmNewPassword);
  };

  const handleSaveEmployee = async () => {
    setFormError('');

    handleNameBlur();
    handleLastNameBlur();
    handlePhoneBlur();
    handleGenderChange(employeeGender);
    handleBirthDateChangeMobile(null, employeeBirthDate);
    handleEmailBlur();
    if (newPassword.trim()) {
        handleNewPasswordBlur();
        handleConfirmNewPasswordBlur();
    }

    const editableFieldErrors = [
      nameError,
      lastNameError,
      phoneError,
      genderError,
      birthDateError,
      emailError,
      newPassword.trim() ? newPasswordError : '',
      confirmNewPassword.trim() ? confirmNewPasswordError : ''
    ].filter(Boolean);

    if (
      !employeeName.trim() ||
      !employeeLastName.trim() ||
      !employeePhone ||
      !employeeEmail.trim() ||
      !employeeGender ||
      !employeeBirthDate
    ) {
      setFormError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (editableFieldErrors.length > 0) {
      setFormError('Por favor, corrige los errores en los campos editables.');
      return;
    }

    if (
      !isValidName(employeeName) ||
      !isValidName(employeeLastName) ||
      !isValidPhoneNumber(employeePhone) ||
      !isValidEmail(employeeEmail) ||
      !isAdult(employeeBirthDate.toISOString().split('T')[0]) ||
      (newPassword.trim() && newPassword.length < 6) ||
      (newPassword.trim() && newPassword !== confirmNewPassword)
    ) {
      setFormError('Por favor, corrige los errores en el formulario antes de guardar.');
      return;
    }

    setIsSaving(true);

    try {
      const updatedEmployeeData = {
        nombre: employeeName,
        apellido: employeeLastName,
        fecha_nacimiento: employeeBirthDate.toISOString(),
        genero: employeeGender,
        telefono: employeePhone,
        activo: employeeActive,
      };

      const personalResponse = await fetch(`${API_URL}/Personal/${employeeData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEmployeeData),
      });

      if (!personalResponse.ok) {
        const errorData = await personalResponse.json();
        let errorMessage = errorData.message || errorData.title || 'Error desconocido al actualizar datos personales.';
        if (errorData.errors && Object.keys(errorData.errors).length > 0) {
          errorMessage += "\n" + Object.values(errorData.errors).flat().join("\n");
        }
        throw new Error(`Error al actualizar datos personales: ${errorMessage}`);
      }
      console.log("Datos personales de empleado actualizados en SQL a través del backend.");

      if (employeeEmail.trim() !== employeeData.email && employeeData.firebaseUid) {
        try {
          const emailUpdateResponse = await fetch(`${API_URL}/Personal/manage/update-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firebaseUid: employeeData.firebaseUid,
              newEmail: employeeEmail,
            }),
          });

          if (!emailUpdateResponse.ok) {
            const errorData = await emailUpdateResponse.json();
            throw new Error(errorData.message || 'Error desconocido al actualizar el correo en Firebase.');
          }
          console.log("Correo electrónico actualizado en Firebase.");
        } catch (error) {
          showNotification(`Error al actualizar el correo en Firebase: ${error.message}`, 'warning');
          console.error("Error al actualizar correo en Firebase:", error.message);
        }
      }

      if (newPassword.trim() && employeeData.firebaseUid) {
        try {
          const passwordUpdateResponse = await fetch(`${API_URL}/Personal/manage/update-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firebaseUid: employeeData.firebaseUid,
              newPassword: newPassword,
            }),
          });

          if (!passwordUpdateResponse.ok) {
            const errorData = await passwordUpdateResponse.json();
            throw new Error(errorData.message || 'Error desconocido al actualizar la contraseña en Firebase.');
          }
          console.log("Contraseña actualizada en Firebase.");
        } catch (error) {
          showNotification(`Error al actualizar la contraseña en Firebase: ${error.message}`, 'warning');
          console.error("Error al actualizar contraseña en Firebase:", error.message);
        }
      }

      showNotification('Empleado actualizado exitosamente!', 'success');
      onEmployeeEdited();

    } catch (error) {
      console.error("Error al actualizar empleado:", error.message);
      let errorMessage = "Ocurrió un error inesperado al actualizar el empleado.";
      errorMessage = error.message;
      showNotification(errorMessage, 'error');
      setFormError(errorMessage);
    } finally {
      setIsSaving(false);
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const formattedEmployeeDateForDisplay = employeeBirthDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedEmployeeDateForWebInput = employeeBirthDate.toISOString().split('T')[0];

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollViewContentContainer,
        IS_LARGE_SCREEN && styles.scrollViewContentContainerWeb
      ]}
    >
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Editar Empleado</Text>
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <View style={IS_LARGE_SCREEN ? styles.rowContainer : null}>
          <View style={[IS_LARGE_SCREEN ? styles.rowField : null, styles.fieldWrapper]}>
            <Text style={styles.inputLabel}>Nombre</Text>
            <View style={[styles.inputContainer, nameError ? styles.inputError : null]}>
              <Ionicons name="person-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Juan"
                placeholderTextColor={LIGHT_GRAY}
                value={employeeName}
                onChangeText={handleNameChange}
                onBlur={handleNameBlur}
              />
            </View>
            {nameError ? <Text style={styles.fieldErrorText}>{nameError}</Text> : null}
          </View>

          <View style={[IS_LARGE_SCREEN ? styles.rowField : null, styles.fieldWrapper]}>
            <Text style={styles.inputLabel}>Apellido</Text>
            <View style={[styles.inputContainer, lastNameError ? styles.inputError : null]}>
              <Ionicons name="person-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ej: Pérez"
                placeholderTextColor={LIGHT_GRAY}
                value={employeeLastName}
                onChangeText={handleLastNameChange}
                onBlur={handleLastNameBlur}
              />
            </View>
            {lastNameError ? <Text style={styles.fieldErrorText}>{lastNameError}</Text> : null}
          </View>
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.inputLabel}>Teléfono</Text>
          <View style={[styles.inputContainer, phoneError ? styles.inputError : null]}>
            <Ionicons name="call-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: 5512345678"
              placeholderTextColor={LIGHT_GRAY}
              value={employeePhone}
              onChangeText={handlePhoneChange}
              onBlur={handlePhoneBlur}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <Text style={styles.charCounter}>{employeePhone.length}/10</Text>
          </View>
          {phoneError ? <Text style={styles.fieldErrorText}>{phoneError}</Text> : null}
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.inputLabel}>Género</Text>
          <View style={[styles.pickerInputContainer, genderError ? styles.inputError : null]}>
            <Ionicons name="person-circle-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
            <Picker
              selectedValue={employeeGender}
              onValueChange={handleGenderChange}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              enabled={!isSaving}
            >
              <Picker.Item label="Seleccionar Género..." value="" enabled={true} color={LIGHT_GRAY} />
              <Picker.Item label="Masculino" value="Masculino" />
              <Picker.Item label="Femenino" value="Femenino" />
            </Picker>
          </View>
          {genderError ? <Text style={styles.fieldErrorText}>{genderError}</Text> : null}
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.inputLabel}>Fecha de Nacimiento</Text>
          {Platform.OS === 'web' ? (
            <View style={[styles.inputContainer, birthDateError ? styles.inputError : null]}>
              <Ionicons name="calendar-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
              <input
                type="date"
                value={formattedEmployeeDateForWebInput}
                onChange={handleBirthDateChangeWeb}
                onBlur={() => handleBirthDateChangeWeb({ target: { value: formattedEmployeeDateForWebInput } })}
                style={styles.datePickerWeb}
                disabled={isSaving}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.inputContainer, birthDateError ? styles.inputError : null]}
                onPress={() => setShowEmployeeDatePicker(true)}
                disabled={isSaving}
              >
                <Ionicons name="calendar-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
                <Text style={styles.dateInputText}>{formattedEmployeeDateForDisplay}</Text>
              </TouchableOpacity>
              {showEmployeeDatePicker && (
                <DateTimePicker
                  testID="employeeDatePicker"
                  value={employeeBirthDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleBirthDateChangeMobile}
                  maximumDate={new Date()}
                />
              )}
            </>
          )}
          {birthDateError ? <Text style={styles.fieldErrorText}>{birthDateError}</Text> : null}
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.inputLabel}>Estado (Activo/Inactivo)</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Inactivo</Text>
            <Switch
              trackColor={{ false: LIGHT_GRAY, true: LIGHT_GREEN }}
              thumbColor={employeeActive ? PRIMARY_GREEN : MEDIUM_GRAY}
              ios_backgroundColor={LIGHT_GRAY}
              onValueChange={setEmployeeActive}
              value={employeeActive}
              disabled={isSaving}
            />
            <Text style={styles.switchLabel}>Activo</Text>
          </View>
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.inputLabel}>Correo Electrónico</Text>
          <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
            <Ionicons name="mail-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, Platform.OS === 'web' && styles.noWebYellowBackground]}
              placeholder="Ej: correo@ejemplo.com"
              placeholderTextColor={LIGHT_GRAY}
              value={employeeEmail}
              onChangeText={handleEmailChange}
              onBlur={handleEmailBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
              editable={!isSaving}
            />
          </View>
          {emailError ? <Text style={styles.fieldErrorText}>{emailError}</Text> : null}
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.inputLabel}>Nueva Contraseña</Text>
          <View style={[styles.inputContainer, newPasswordError ? styles.inputError : null]}>
            <Ionicons name="lock-closed-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, Platform.OS === 'web' && styles.noWebYellowBackground]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={LIGHT_GRAY}
              value={newPassword}
              onChangeText={handleNewPasswordChange}
              onBlur={handleNewPasswordBlur}
              secureTextEntry={!showNewPassword}
              autoComplete="off"
              textContentType="newPassword"
              importantForAutofill="no"
              editable={!isSaving}
            />
            <TouchableOpacity onPress={toggleShowNewPassword} style={styles.eyeIconContainer}>
              <Ionicons
                name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={MEDIUM_GRAY}
              />
            </TouchableOpacity>
          </View>
          {newPasswordError ? <Text style={styles.fieldErrorText}>{newPasswordError}</Text> : null}
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.inputLabel}>Confirmar Nueva Contraseña</Text>
          <View style={[styles.inputContainer, confirmNewPasswordError ? styles.inputError : null]}>
            <Ionicons name="lock-closed-outline" size={16} color={MEDIUM_GRAY} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, Platform.OS === 'web' && styles.noWebYellowBackground]}
              placeholder="Repite la nueva contraseña"
              placeholderTextColor={LIGHT_GRAY}
              value={confirmNewPassword}
              onChangeText={handleConfirmNewPasswordChange}
              onBlur={handleConfirmNewPasswordBlur}
              secureTextEntry={!showConfirmNewPassword}
              autoComplete="off"
              textContentType="newPassword"
              importantForAutofill="no"
              editable={!isSaving}
            />
            <TouchableOpacity onPress={toggleShowConfirmNewPassword} style={styles.eyeIconContainer}>
              <Ionicons
                name={showConfirmNewPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={MEDIUM_GRAY}
              />
            </TouchableOpacity>
          </View>
          {confirmNewPasswordError ? <Text style={styles.fieldErrorText}>{confirmNewPasswordError}</Text> : null}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSaveEmployee}
          disabled={isSaving}
        >
          <Text style={styles.primaryButtonText}>{isSaving ? <ActivityIndicator color={WHITE} /> : 'GUARDAR CAMBIOS'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const containerBaseStyles = {
  backgroundColor: WHITE,
  borderRadius: 12,
  padding: 12,
  shadowColor: DARK_GRAY,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 4,
  borderWidth: 1,
  borderColor: VERY_LIGHT_GRAY,
};

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    flexGrow: 1,
  },
  scrollViewContentContainerWeb: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    ...containerBaseStyles,
    alignSelf: 'center',
    marginTop: IS_LARGE_SCREEN ? 0 : 10,
    marginBottom: IS_LARGE_SCREEN ? 0 : 10,
    paddingVertical: 18,
    paddingHorizontal: IS_LARGE_SCREEN ? 18 : 10,
    width: IS_LARGE_SCREEN ? '48%' : '95%',
    maxWidth: IS_LARGE_SCREEN ? 500 : '98%',
  },
  formTitle: {
    fontSize: IS_LARGE_SCREEN ? 22 : 18,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 15,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    color: DARK_GRAY,
    marginBottom: 2,
    fontWeight: '600',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  rowField: {
    flex: 1,
    marginRight: IS_LARGE_SCREEN ? 8 : 0,
  },
  fieldWrapper: {
    marginBottom: 8,
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: VERY_LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: BACKGROUND_LIGHT,
    height: 38,
  },
  input: {
    flex: 1,
    height: '100%',
    color: MEDIUM_GRAY,
    fontSize: 13,
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
  noWebYellowBackground: {
    ...Platform.select({
      web: {
        boxShadow: '0 0 0px 1000px #fcfcfc inset',
        WebkitBoxShadow: '0 0 0px 1000px #fcfcfc inset',
        caretColor: MEDIUM_GRAY,
      },
    }),
  },
  inputIcon: {
    marginRight: 0,
    fontSize: 16,
  },
  inputError: {
    borderColor: ERROR_RED,
    borderWidth: 1.5,
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
    fontSize: 13,
  },
  pickerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: BACKGROUND_LIGHT,
    height: 38,
    borderWidth: 1,
    borderColor: VERY_LIGHT_GRAY,
  },
  dateInputText: {
    flex: 1,
    fontSize: 13,
    color: MEDIUM_GRAY,
    paddingLeft: 6,
  },
  datePickerWeb: {
    flex: 1,
    height: '100%',
    color: MEDIUM_GRAY,
    fontSize: 13,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: VERY_LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: BACKGROUND_LIGHT,
    height: 38,
  },
  switchLabel: {
    fontSize: 13,
    color: MEDIUM_GRAY,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 5,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
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
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: ERROR_RED,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
  },
  fieldErrorText: {
    color: ERROR_RED,
    fontSize: 10,
    position: 'absolute',
    bottom: -13,
    left: 5,
  },
  charCounter: {
    fontSize: 10,
    color: LIGHT_GRAY,
    marginLeft: 6,
  },
  eyeIconContainer: {
    paddingLeft: 8,
    paddingRight: 4,
  },
});
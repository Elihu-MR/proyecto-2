import React, { useState, useRef, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Config from '../../config/config';
const API_URL = Config.API_BASE_URL;

import Notification from '../../components/shared/Notification';

const PRIMARY_GREEN = '#6BB240';
const LIGHT_GREEN = '#9CD275';
const ACCENT_GREEN_BACKGROUND = '#EEF7E8';
const DARK_GRAY = '#333';
const MEDIUM_GRAY = '#555';
const LIGHT_GRAY = '#888';
const VERY_LIGHT_GRAY = '#eee';
const BACKGROUND_LIGHT = '#fcfcfc';
const WHITE = '#fff';

const { width } = Dimensions.get('window');
const IS_LARGE_SCREEN = width > 900;

export default function AsylumDataScreen() {
  const [asylumData, setAsylumData] = useState({
    nombre: '',
    direccion: '',
    pais: '',
    ciudad: '',
    codigo_postal: '',
    telefono: '',
    correo: '',
    cantidad_residentes: 0,
    cantidad_empleados: 0,
  });

  const [originalAsylumData, setOriginalAsylumData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const notificationRef = useRef();

  const fetchAsylumData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/Asilo`);
      const data = await response.json();

      if (response.ok && data.status === 0 && data.asilo) {
        const fetchedData = {
          nombre: data.asilo.nombre || '',
          direccion: data.asilo.direccion || '',
          pais: data.asilo.pais || '',
          ciudad: data.asilo.ciudad || '',
          codigo_postal: data.asilo.codigo_postal || '',
          telefono: data.asilo.telefono || '',
          correo: data.asilo.correo || '',
          cantidad_residentes: data.asilo.cantidad_residentes || 0,
          cantidad_empleados: data.asilo.cantidad_empleados || 0,
        };
        setAsylumData(fetchedData);
        setOriginalAsylumData(fetchedData);
      } else {
        const errorMessage = data.message || `No se pudieron cargar los datos del asilo. Código de estado: ${data.status || 'desconocido'}`;
        notificationRef.current.show(`Error: ${errorMessage}`, 'error');
      }
    } catch (error) {
      notificationRef.current.show('Error de Conexión: No se pudo conectar con el servidor.', 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAsylumData();
      return () => {
        setIsEditing(false);
      };
    }, [fetchAsylumData])
  );

  const handleSaveChanges = async () => {
    const editableFieldsForChangeDetection = ['telefono', 'correo'];

    const hasChanged = editableFieldsForChangeDetection.some(field =>
      asylumData[field] !== originalAsylumData[field]
    );

    if (!hasChanged) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('nombre', asylumData.nombre);
    formData.append('direccion', asylumData.direccion);
    formData.append('pais', asylumData.pais);
    formData.append('ciudad', asylumData.ciudad);
    formData.append('codigo_postal', asylumData.codigo_postal);
    formData.append('telefono', asylumData.telefono);
    formData.append('correo', asylumData.correo);

    try {
      const response = await fetch(`${API_URL}/Asilo`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.status === 0) {
        notificationRef.current.show(data.message || 'Datos del asilo actualizados correctamente.', 'success');
        setIsEditing(false);
        setOriginalAsylumData({ ...asylumData });
      } else {
        const errorMessage = data.message || `No se pudieron actualizar los datos del asilo. Código de estado: ${data.status || 'desconocido'}`;
        notificationRef.current.show(`Error: ${errorMessage}`, 'error');
      }
    } catch (error) {
      notificationRef.current.show('Error de Conexión: No se pudo conectar con el servidor para actualizar los datos.', 'error', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.mainContentContainer}>
          <View style={styles.leftColumn}>
            <Image
              source={require('../../assets/images/arbol2.png')}
              style={styles.mainLogoImage}
            />
            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Ionicons name="people-outline" size={24} color={PRIMARY_GREEN} />
                <Text style={styles.metricNumber}>{asylumData.cantidad_residentes}</Text>
                <Text style={styles.metricLabel}>Residentes</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="briefcase-outline" size={24} color={PRIMARY_GREEN} />
                <Text style={styles.metricNumber}>{asylumData.cantidad_empleados}</Text>
                <Text style={styles.metricLabel}>Empleados</Text>
              </View>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <Text style={styles.sectionTitle}>Información de Contacto y Ubicación</Text>

            {isLoading ? (
              <ActivityIndicator size="large" color={PRIMARY_GREEN} />
            ) : (
              <>
                <Text style={styles.inputLabel}>Nombre del Asilo</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="business-outline" size={20} color={MEDIUM_GRAY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    placeholder="Nombre del Asilo"
                    placeholderTextColor={MEDIUM_GRAY}
                    value={asylumData.nombre}
                    editable={false}
                    selectionColor={PRIMARY_GREEN}
                    underlineColorAndroid="transparent"
                  />
                </View>

                <Text style={styles.inputLabel}>Dirección</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color={MEDIUM_GRAY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    placeholder="Dirección"
                    placeholderTextColor={MEDIUM_GRAY}
                    value={asylumData.direccion}
                    editable={false}
                    selectionColor={PRIMARY_GREEN}
                    underlineColorAndroid="transparent"
                  />
                </View>

                <Text style={styles.inputLabel}>País</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="globe-outline" size={20} color={MEDIUM_GRAY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    placeholder="País"
                    placeholderTextColor={MEDIUM_GRAY}
                    value={asylumData.pais}
                    editable={false}
                    selectionColor={PRIMARY_GREEN}
                    underlineColorAndroid="transparent"
                  />
                </View>

                <Text style={styles.inputLabel}>Ciudad</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="map-outline" size={20} color={MEDIUM_GRAY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    placeholder="Ciudad"
                    placeholderTextColor={MEDIUM_GRAY}
                    value={asylumData.ciudad}
                    editable={false}
                    selectionColor={PRIMARY_GREEN}
                    underlineColorAndroid="transparent"
                  />
                </View>

                <Text style={styles.inputLabel}>Código Postal</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="navigate-outline" size={20} color={MEDIUM_GRAY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    placeholder="Código Postal"
                    placeholderTextColor={MEDIUM_GRAY}
                    value={asylumData.codigo_postal}
                    keyboardType="numeric"
                    editable={false}
                    selectionColor={PRIMARY_GREEN}
                    underlineColorAndroid="transparent"
                  />
                </View>

                <Text style={styles.inputLabel}>Teléfono</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color={MEDIUM_GRAY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    placeholder="Teléfono"
                    placeholderTextColor={MEDIUM_GRAY}
                    value={asylumData.telefono}
                    onChangeText={(text) => setAsylumData({ ...asylumData, telefono: text })}
                    keyboardType="phone-pad"
                    editable={isEditing}
                    selectionColor={PRIMARY_GREEN}
                    underlineColorAndroid="transparent"
                  />
                </View>

                <Text style={styles.inputLabel}>Correo Electrónico</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color={MEDIUM_GRAY} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, !isEditing && styles.inputDisabled]}
                    placeholder="Correo Electrónico"
                    placeholderTextColor={MEDIUM_GRAY}
                    value={asylumData.correo}
                    onChangeText={(text) => {
                      // Filter out spaces instantly and convert to lowercase
                      const filteredText = text.replace(/\s/g, '').toLowerCase();
                      setAsylumData({ ...asylumData, correo: filteredText });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={isEditing}
                    selectionColor={PRIMARY_GREEN}
                    underlineColorAndroid="transparent"
                  />
                </View>

                {isEditing ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSaveChanges}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={WHITE} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Guardar Cambios</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      isHovered && styles.secondaryButtonHover
                    ]}
                    onPress={() => setIsEditing(true)}
                    onPressIn={() => setIsHovered(true)}
                    onPressOut={() => setIsHovered(false)}
                    disabled={isLoading}
                  >
                    <Text style={styles.secondaryButtonText}>Editar Datos</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
      <Notification ref={notificationRef} />
    </SafeAreaView>
  );
}

const columnBaseStyles = {
  backgroundColor: WHITE,
  borderRadius: 15,
  padding: IS_LARGE_SCREEN ? 22 : 18,
  shadowColor: DARK_GRAY,
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 8,
  borderWidth: 1.5,
  borderColor: VERY_LIGHT_GRAY,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  mainContentContainer: {
    flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
    width: '95%',
    maxWidth: IS_LARGE_SCREEN ? 880 : 550,
    alignItems: IS_LARGE_SCREEN ? 'center' : 'center',
    justifyContent: 'center',
    gap: IS_LARGE_SCREEN ? 25 : 20,
    padding: 10,
  },
  leftColumn: {
    ...Platform.select({
      web: { flex: 1, alignSelf: 'center' },
      default: { width: '100%' },
    }),
    ...columnBaseStyles,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mainLogoImage: {
    width: IS_LARGE_SCREEN ? 140 : 100,
    height: IS_LARGE_SCREEN ? 140 : 100,
    resizeMode: 'contain',
    marginBottom: 25,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: 18,
  },
  metricCard: {
    backgroundColor: ACCENT_GREEN_BACKGROUND,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '38%',
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: LIGHT_GREEN,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PRIMARY_GREEN,
    marginTop: 5,
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: MEDIUM_GRAY,
    textAlign: 'center',
  },
  rightColumn: {
    ...Platform.select({
      web: { flex: 1.5 },
      default: { width: '100%' },
    }),
    ...columnBaseStyles,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 15,
    textAlign: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: VERY_LIGHT_GRAY,
  },
  inputLabel: {
    fontSize: 14,
    color: MEDIUM_GRAY,
    marginBottom: 3,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderColor: LIGHT_GRAY,
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: WHITE,
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: DARK_GRAY,
    paddingVertical: 0,
  },
  inputDisabled: {
    color: LIGHT_GRAY,
    backgroundColor: VERY_LIGHT_GRAY,
  },
  primaryButton: {
    backgroundColor: PRIMARY_GREEN,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: PRIMARY_GREEN,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: WHITE,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: PRIMARY_GREEN,
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryButtonText: {
    color: PRIMARY_GREEN,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonHover: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
});
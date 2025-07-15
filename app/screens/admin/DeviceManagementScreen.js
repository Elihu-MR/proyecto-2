import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert, // Kept Alert for confirmation dialog
    SafeAreaView,
    Platform,
    TextInput,
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Switch,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';


import Config from '../../config/config';
import Notification from '../../components/shared/Notification'; // Import Notification component

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


export default function DeviceManagementScreen() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const notificationRef = useRef(null); // Create a ref for the Notification

    const [devices, setDevices] = useState([]);
    const [isLoadingDevices, setIsLoadingDevices] = useState(true);
    const [fetchError, setFetchError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Activos');

    const [currentPage, setCurrentPage] = useState(1);
    const [devicesPerPage] = useState(8);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [deviceToEdit, setDeviceToEdit] = useState(null);

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [deviceForAssignment, setDeviceForAssignment] = useState(null);
    const [allResidents, setAllResidents] = useState([]);
    // MODIFICACIÓN: Inicializar con cadena vacía "" en lugar de null
    const [selectedResidentId, setSelectedResidentId] = useState("");

    const API_URL = Config.API_BASE_URL;

    const fetchDevices = async () => {
        setIsLoadingDevices(true);
        setFetchError('');
        try {
            const [devicesResponse, residentsResponse] = await Promise.all([
                fetch(`${API_URL}/Dispositivo`),
                fetch(`${API_URL}/Residente`)
            ]);

            if (!devicesResponse.ok) {
                const errorData = await devicesResponse.json();
                throw new Error(errorData.message || 'Error al cargar dispositivos del backend.');
            }
            if (!residentsResponse.ok) {
                const errorData = await residentsResponse.json();
                throw new Error(errorData.message || 'Error al cargar residentes del backend.');
            }

            const devicesData = await devicesResponse.json();
            const residentsData = await residentsResponse.json();

            console.log("API RESIDENTES DATA:", residentsData); // Log de la data de residentes
            console.log("API DISPOSITIVOS DATA:", devicesData); // Log de la data de dispositivos

            let devicesList = devicesData && devicesData.dispositivo ? devicesData.dispositivo : devicesData;
            let residentsList = residentsData && residentsData.data ? residentsData.data : [];

            setAllResidents(residentsList);

            const residentMap = {};
            residentsList.forEach(resident => {
                if (resident.dispositivo && resident.dispositivo.id) {
                    residentMap[resident.dispositivo.id] = {
                        name: `${resident.nombre} ${resident.apellido}`,
                        id: resident.id_residente
                    };
                }
            });

            const augmentedDevices = devicesList.map(device => {
                const residentInfo = residentMap[device.id];
                return {
                    ...device,
                    residentName: residentInfo ? residentInfo.name : 'No Asignado',
                    residentId: residentInfo ? residentInfo.id : null
                };
            });

            setDevices(augmentedDevices);

        } catch (error) {
            console.error("Error al cargar datos:", error.message);
            setFetchError('No se pudieron cargar los datos. Intenta de nuevo más tarde.');
            if (notificationRef.current) {
                notificationRef.current.show('No se pudieron cargar los datos. Intenta de nuevo más tarde.', 'error');
            }
        } finally {
            setIsLoadingDevices(false);
        }
    };

    useEffect(() => {
        if (isFocused && !showCreateForm && !showEditForm && !showAssignModal) {
            fetchDevices();
        }
    }, [isFocused, showCreateForm, showEditForm, showAssignModal]);

    const handleCreateNewDevice = () => {
        setShowCreateForm(true);
        setShowEditForm(false);
        setDeviceToEdit(null);
    };

    const handleCancelCreate = () => {
        setShowCreateForm(false);
        fetchDevices();
    };

    const handleDeviceCreated = () => {
        setShowCreateForm(false);
        fetchDevices();
    };

    const handleEditDevice = (device) => {
        setDeviceToEdit(device);
        setShowEditForm(true);
        setShowCreateForm(false);
    };

    const handleCancelEdit = () => {
        setShowEditForm(false);
        setDeviceToEdit(null);
        fetchDevices();
    };

    const handleDeviceEdited = () => {
        setShowEditForm(false);
        setDeviceToEdit(null);
        fetchDevices();
    };

    const handleOpenAssignModal = (device) => {
        setDeviceForAssignment(device);
        // MODIFICACIÓN: Si no tiene un residente asignado, inicializar con cadena vacía.
        setSelectedResidentId(device.residentId === null ? "" : device.residentId);
        console.log(`Abriendo modal para dispositivo: ${device.nombre}, Residente ID actual: ${device.residentId}`); // Log de apertura de modal
        setShowAssignModal(true);
    };

    const handleCloseAssignModal = () => {
        setShowAssignModal(false);
        setDeviceForAssignment(null);
        // MODIFICACIÓN: Resetear a cadena vacía
        setSelectedResidentId("");
        fetchDevices();
    };

    // New function to handle explicit deassignment
    const handleDeassignDevice = async () => {
        if (!deviceForAssignment || deviceForAssignment.residentId === null) {
            if (notificationRef.current) {
                notificationRef.current.show('Este dispositivo no está asignado a ningún residente.', 'error');
            }
            return;
        }

        const currentResidentId = deviceForAssignment.residentId;
        const deviceId = deviceForAssignment.id;

        const url = `${API_URL}/Residente/${currentResidentId}/dispositivo/0`; // Send 0 for device ID to deassign

        try {
            console.log(`Desasignando: Realizando fetch a: ${url} con método: PUT`);
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const responseData = await response.json();
            console.log("Respuesta parseada de la API (desasignar):", responseData);

            if (response.ok && responseData.status === 0) {
                if (notificationRef.current) {
                    notificationRef.current.show(responseData.message || 'Dispositivo desasignado correctamente.', 'success');
                }
                handleCloseAssignModal();
            } else {
                if (notificationRef.current) {
                    notificationRef.current.show(responseData.message || 'No se pudo desasignar el dispositivo.', 'error');
                }
            }
        } catch (error) {
            console.error("Error al desasignar dispositivo (catch):", error);
            if (notificationRef.current) {
                notificationRef.current.show('Ocurrió un error al conectar con el servidor.', 'error');
            }
        }
    };


    const assignDevice = async () => {
        console.log("Iniciando assignDevice...");
        console.log("deviceForAssignment:", deviceForAssignment);
        console.log("selectedResidentId (en assignDevice):", selectedResidentId);

        // MODIFICACIÓN: Considerar cadena vacía como "no seleccionado"
        // If selectedResidentId is empty string, it means "no resident selected for assignment"
        if (!deviceForAssignment || selectedResidentId === "") {
            if (notificationRef.current) {
                notificationRef.current.show('Debe seleccionar un residente para asignar.', 'error');
            }
            console.log("Validación fallida: deviceForAssignment o selectedResidentId vacío.");
            return;
        }

        // This function is now ONLY for assigning/reassigning
        const url = `${API_URL}/Residente/${selectedResidentId}/dispositivo/${deviceForAssignment.id}`;
        const method = 'PUT'; // Asignaciones y reasignaciones son PUT

        try {
            console.log(`Asignando/Reasignando: Realizando fetch a: ${url} con método: ${method}`);
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log("Respuesta raw del fetch (asignar):", response);
            const responseData = await response.json();
            console.log("Respuesta parseada de la API (asignar):", responseData);

            if (response.ok && responseData.status === 0) {
                if (notificationRef.current) {
                    notificationRef.current.show(responseData.message || 'Operación realizada correctamente.', 'success');
                }
                handleCloseAssignModal();
            } else {
                if (notificationRef.current) {
                    notificationRef.current.show(responseData.message || 'No se pudo realizar la operación.', 'error');
                }
            }
        } catch (error) {
            console.error("Error al asignar dispositivo (catch):", error);
            if (notificationRef.current) {
                notificationRef.current.show('Ocurrió un error al conectar con el servidor.', 'error');
            }
        }
    };

    const handleToggleDeviceStatus = async (device) => {
        const newStatus = !device.estado;
        Alert.alert( // Keeping Alert.alert for confirmation dialog
            'Confirmar Cambio de Estado',
            `¿Estás seguro de que quieres ${newStatus ? 'activar' : 'desactivar'} el dispositivo ${device.direccion_MAC}?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/Dispositivo/${device.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ estado: newStatus }) // Ensure you send the new status in the body
                            });

                            const responseData = await response.json();

                            if (response.ok && responseData.status === 0) {
                                if (notificationRef.current) {
                                    notificationRef.current.show(responseData.message || 'Estado del dispositivo actualizado correctamente.', 'success');
                                }
                                fetchDevices();
                            } else {
                                if (notificationRef.current) {
                                    notificationRef.current.show(responseData.message || 'No se pudo actualizar el estado del dispositivo.', 'error');
                                }
                            }
                        } catch (error) {
                            console.error("Error al actualizar estado del dispositivo:", error);
                            if (notificationRef.current) {
                                notificationRef.current.show('Ocurrió un error al conectar con el servidor.', 'error');
                            }
                        }
                    },
                },
            ]
        );
    };

    const filteredDevices = devices.filter(device => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const matchesSearchTerm = device.direccion_MAC.toLowerCase().includes(lowerCaseSearchTerm) ||
            (device.nombre && device.nombre.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (device.residentName && device.residentName.toLowerCase().includes(lowerCaseSearchTerm));

        let matchesFilterStatus = true;
        if (filterStatus === 'Activos') {
            matchesFilterStatus = device.estado === true;
        } else if (filterStatus === 'Inactivos') {
            matchesFilterStatus = device.estado === false;
        }
        return matchesSearchTerm && matchesFilterStatus;
    });

    const indexOfLastDevice = currentPage * devicesPerPage;
    const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
    const currentDevices = filteredDevices.slice(indexOfFirstDevice, indexOfLastDevice);

    const totalPages = Math.ceil(filteredDevices.length / devicesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // MODIFICACIÓN: Mostrar todos los residentes en el picker, sin filtrar por "no asignados"
    const residentsForPicker = allResidents;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {(showCreateForm || showEditForm) && (
                    <TouchableOpacity
                        onPress={
                            showCreateForm ? handleCancelCreate :
                                handleCancelEdit
                        }
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back-outline" size={20} color={WHITE} />
                        <Text style={styles.backButtonText}>Regresar</Text>
                    </TouchableOpacity>
                )}

                {showCreateForm ? (
                    // Aquí iría el componente CreateDeviceScreen
                    <Text>CreateDeviceScreen Placeholder</Text>
                ) : showEditForm && deviceToEdit ? (
                    // Aquí iría el componente EditDeviceScreen
                    <Text>EditDeviceScreen Placeholder</Text>
                ) : (
                    <View style={styles.mainContentArea}>
                        <View style={styles.controlsContainer}>
                            <View style={styles.searchFilterGroup}>
                                <View style={styles.searchInputContainer}>
                                    <Ionicons name="search" size={20} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Buscar por MAC, nombre o Residente..."
                                        placeholderTextColor={LIGHT_GRAY}
                                        value={searchTerm}
                                        onChangeText={setSearchTerm}
                                    />
                                </View>
                                <View style={styles.filterButtonsContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.filterButton,
                                            filterStatus === 'Todos' && styles.filterButtonActive,
                                        ]}
                                        onPress={() => setFilterStatus('Todos')}
                                    >
                                        <Text style={[
                                            styles.filterButtonText,
                                            filterStatus === 'Todos' && styles.filterButtonTextActive
                                        ]}>
                                            Todos
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.filterButton,
                                            filterStatus === 'Activos' && styles.filterButtonActive,
                                        ]}
                                        onPress={() => setFilterStatus('Activos')}
                                    >
                                        <Text style={[
                                            styles.filterButtonText,
                                            filterStatus === 'Activos' && styles.filterButtonTextActive
                                        ]}>
                                            Activos
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.filterButton,
                                            filterStatus === 'Inactivos' && styles.filterButtonActive,
                                        ]}
                                        onPress={() => setFilterStatus('Inactivos')}
                                    >
                                        <Text style={[
                                            styles.filterButtonText,
                                            filterStatus === 'Inactivos' && styles.filterButtonTextActive
                                        ]}>
                                            Inactivos
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* REMOVED: Botón de Añadir Dispositivo */}
                            {/*
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleCreateNewDevice}
                            >
                                <Ionicons name="add-circle" size={20} color={styles.createButtonText.color} />
                                <Text style={styles.createButtonText}>AÑADIR DISPOSITIVO</Text>
                            </TouchableOpacity>
                            */}
                        </View>

                        {isLoadingDevices ? (
                            <ActivityIndicator size="large" color={PRIMARY_GREEN} style={styles.loadingIndicator} />
                        ) : fetchError ? (
                            <Text style={styles.errorText}>{fetchError}</Text>
                        ) : devices.length === 0 && searchTerm === '' && filterStatus === 'Activos' ? (
                            <Text style={styles.noDevicesText}>No hay dispositivos registrados.</Text>
                        ) : (
                            <>
                                <View style={styles.tableContainer}>
                                    <ScrollView horizontal={true} contentContainerStyle={styles.tableScrollViewContent}>
                                        <View style={styles.table}>
                                            <View style={styles.tableRowHeader}>
                                                <Text style={styles.tableHeaderCell}>Nombre</Text>
                                                <Text style={styles.tableHeaderCell}>Dirección MAC</Text>
                                                <Text style={styles.tableHeaderCell}>Residente Asignado</Text>
                                                <Text style={[styles.tableHeaderCell, styles.estadoCell]}>Estado</Text>
                                            </View>

                                            <ScrollView style={styles.tableBodyScrollView}>
                                                {currentDevices.length === 0 ? (
                                                    <Text style={styles.noResultsText}>No se encontraron resultados para la búsqueda/filtro.</Text>
                                                ) : (
                                                    currentDevices.map((device, index) => (
                                                        <View
                                                            key={device.id}
                                                            style={[
                                                                styles.tableRow,
                                                                index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                                                            ]}
                                                        >
                                                            <Text style={styles.tableCell}>{device.nombre}</Text>
                                                            <Text style={styles.tableCell}>{device.direccion_MAC}</Text>
                                                            <TouchableOpacity
                                                                style={[styles.tableCell, styles.residentNameCell]}
                                                                onPress={() => handleOpenAssignModal(device)}
                                                            >
                                                                <Text style={styles.residentNameText}>{device.residentName}</Text>
                                                                <Ionicons name="pencil" size={16} color={MEDIUM_GRAY} style={styles.editIcon} />
                                                            </TouchableOpacity>
                                                            <View style={[styles.tableCell, styles.estadoCell]}>
                                                                <Switch
                                                                    trackColor={{ false: LIGHT_GRAY, true: PRIMARY_GREEN }}
                                                                    thumbColor={device.estado ? WHITE : WHITE}
                                                                    ios_backgroundColor={LIGHT_GRAY}
                                                                    onValueChange={() => handleToggleDeviceStatus(device)}
                                                                    value={device.estado}
                                                                />
                                                            </View>
                                                        </View>
                                                    ))
                                                )}
                                            </ScrollView>
                                        </View>
                                    </ScrollView>
                                </View>

                                {totalPages > 1 && (
                                    <View style={styles.paginationContainer}>
                                        <TouchableOpacity
                                            style={styles.paginationButton}
                                            onPress={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <Ionicons name="chevron-back-outline" size={20} color={currentPage === 1 ? LIGHT_GRAY : DARK_GRAY} />
                                        </TouchableOpacity>
                                        {[...Array(totalPages).keys()].map(number => (
                                            <TouchableOpacity
                                                key={number}
                                                style={[
                                                    styles.paginationPageButton,
                                                    currentPage === number + 1 && styles.paginationPageButtonActive,
                                                ]}
                                                onPress={() => paginate(number + 1)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.paginationPageText,
                                                        currentPage === number + 1 && styles.paginationPageTextActive,
                                                    ]}
                                                >
                                                    {number + 1}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                        <TouchableOpacity
                                            style={styles.paginationButton}
                                            onPress={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <Ionicons name="chevron-forward-outline" size={20} color={currentPage === totalPages ? LIGHT_GRAY : DARK_GRAY} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={showAssignModal}
                    onRequestClose={handleCloseAssignModal}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPressOut={handleCloseAssignModal}
                    >
                        <TouchableWithoutFeedback>
                            <View style={styles.modalView}>
                                <TouchableOpacity onPress={handleCloseAssignModal} style={styles.modalCloseIcon}>
                                    <Ionicons name="close-circle-outline" size={28} color={MEDIUM_GRAY} />
                                </TouchableOpacity>

                                <Text style={styles.modalTitle}>
                                    {deviceForAssignment ? `Gestionar Asignación para ${deviceForAssignment.nombre}` : 'Gestionar Asignación'}
                                </Text>

                                {deviceForAssignment && deviceForAssignment.residentId ? (
                                    <View style={styles.assignmentStatusContainer}>
                                        <Text style={styles.currentAssignmentText}>
                                            Actualmente asignado a: <Text style={styles.assignedResidentName}>{deviceForAssignment.residentName}</Text>
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.deassignButtonSmall}
                                            onPress={handleDeassignDevice} // Call the new deassign function
                                        >
                                            <Ionicons name="person-remove-outline" size={20} color={ERROR_RED} />
                                            <Text style={styles.deassignButtonSmallText}>Desasignar</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}

                                <View style={styles.assignmentSelectionContainer}>
                                    <Text style={styles.selectResidentText}>
                                        {deviceForAssignment && deviceForAssignment.residentId ? 'Reasignar a otro Residente:' : 'Asignar a un Residente:'}
                                    </Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={selectedResidentId}
                                            style={styles.picker}
                                            onValueChange={(itemValue) => {
                                                setSelectedResidentId(itemValue);
                                                console.log(`Picker value changed to: ${itemValue}`);
                                            }}
                                        >
                                            {/* MODIFICACIÓN: Usar cadena vacía como valor */}
                                            <Picker.Item label="Seleccionar Residente..." value={""} />
                                            {/* MODIFICACIÓN: Iterar sobre todos los residentes */}
                                            {residentsForPicker.map((resident) => (
                                                <Picker.Item
                                                    key={resident.id_residente}
                                                    label={`${resident.nombre} ${resident.apellido} (ID: ${resident.id_residente})`}
                                                    value={resident.id_residente}
                                                />
                                            ))}
                                        </Picker>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.assignButton]}
                                        onPress={assignDevice}
                                        // MODIFICACIÓN: Deshabilitar si el ID seleccionado es "" o null
                                        disabled={selectedResidentId === "" || selectedResidentId === null}
                                    >
                                        <Text style={styles.modalButtonText}>
                                            Asignar Dispositivo
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </TouchableOpacity>
                </Modal>
            </KeyboardAvoidingView>
            <Notification ref={notificationRef} /> {/* Add the Notification component here */}
        </SafeAreaView>
    );
}

const containerBaseStyles = {
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
        position: 'relative',
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PRIMARY_GREEN,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: PRIMARY_GREEN,
        zIndex: 10,
        shadowColor: PRIMARY_GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transitionDuration: '0.2s',
                transitionProperty: 'background-color, border-color, color',
                ':hover': {
                    backgroundColor: BUTTON_HOVER_COLOR,
                },
            },
        }),
    },
    backButtonText: {
        color: WHITE,
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 8,
    },
    mainContentArea: {
        flex: 1,
        padding: IS_LARGE_SCREEN ? 20 : 10,
        alignItems: 'center',
        marginTop: 60, // para que no se superponga con el backButton
    },

    controlsContainer: {
        width: '100%',
        maxWidth: IS_LARGE_SCREEN ? 1000 : 'auto',
        flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
        justifyContent: 'space-between',
        alignItems: IS_LARGE_SCREEN ? 'center' : 'stretch',
        marginBottom: 20,
        gap: IS_LARGE_SCREEN ? 0 : 15,
        flexWrap: IS_LARGE_SCREEN ? 'nowrap' : 'wrap', // Asegura que en móvil se envuelvan
    },

    createButton: {
        flexDirection: 'row',
        backgroundColor: PRIMARY_GREEN,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: PRIMARY_GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
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
    createButtonText: {
        color: WHITE,
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    searchFilterGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
        flexWrap: 'wrap',
    },
    searchInputContainer: {
        flex: IS_LARGE_SCREEN ? 0.6 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 45,
        borderColor: LIGHT_GRAY,
        borderWidth: 1.5,
        borderRadius: 10,
        backgroundColor: WHITE,
        shadowColor: DARK_GRAY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        paddingHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 15,
        color: DARK_GRAY,
        paddingVertical: 0,
        ...Platform.select({
            web: {
                outlineStyle: 'none',
            },
        }),
    },
    inputIcon: {
        marginRight: 10,
    },
    filterButtonsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        backgroundColor: VERY_LIGHT_GRAY,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transitionDuration: '0.3s',
                transitionProperty: 'background-color, border-color, color',
                ':hover': {
                    backgroundColor: LIGHT_GREEN,
                    borderColor: PRIMARY_GREEN,
                    color: WHITE,
                },
            },
        }),
    },
    filterButtonActive: {
        backgroundColor: PRIMARY_GREEN,
        borderColor: PRIMARY_GREEN,
    },
    filterButtonText: {
        color: MEDIUM_GRAY,
        fontSize: 14,
        fontWeight: '600',
    },
    filterButtonTextActive: {
        color: WHITE,
    },
    errorText: {
        color: ERROR_RED,
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 14,
        fontWeight: '500',
    },
    loadingIndicator: {
        marginTop: 50,
    },
    noDevicesText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: MEDIUM_GRAY,
    },
    tableContainer: {
        ...containerBaseStyles,
        width: '100%',
        maxWidth: IS_LARGE_SCREEN ? 1000 : '100%',
        alignSelf: 'center',
        marginTop: 40,
        marginBottom: 20,
        padding: 0,
        height: 500,
        overflow: 'hidden',
    },
    tableScrollViewContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    table: {
        flex: 1,
        width: '100%',
        minWidth: '0',
    },
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: WHITE,
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 2,
        borderBottomColor: VERY_LIGHT_GRAY,
    },
    tableHeaderCell: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 13,
        color: DARK_GRAY,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    tableBodyScrollView: {
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: VERY_LIGHT_GRAY,
        alignItems: 'center',
        flexWrap: 'nowrap', // evitar que se rompa fila
    },
    tableRowEven: {
        backgroundColor: WHITE,
    },
    tableRowOdd: {
        backgroundColor: BACKGROUND_LIGHT,
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        color: MEDIUM_GRAY,
        textAlign: 'center',
        minWidth: 60, // para que no queden celdas demasiado chicas
    },
    estadoCell: {
        flex: IS_LARGE_SCREEN ? 0.5 : 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    residentNameCell: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    residentNameText: {
        fontSize: 14,
        color: MEDIUM_GRAY,
        textAlign: 'center',
        marginRight: 5,
    },
    editIcon: {
    },
    actionsCell: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: IS_LARGE_SCREEN ? 0.7 : 1,
    },
    actionButton: {
        padding: 5,
        borderRadius: 5,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transitionDuration: '0.2s',
                transitionProperty: 'background-color',
                ':hover': {
                    backgroundColor: VERY_LIGHT_GRAY,
                },
            },
        }),
    },
    noResultsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: MEDIUM_GRAY,
        padding: 20,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        width: '100%',
        maxWidth: IS_LARGE_SCREEN ? 1000 : 'auto',
    },
    paginationButton: {
        padding: 8,
        borderRadius: 8,
        marginHorizontal: 5,
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY,
        shadowColor: DARK_GRAY,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transitionDuration: '0.2s',
                transitionProperty: 'background-color, border-color',
                ':hover': {
                    backgroundColor: ACCENT_GREEN_BACKGROUND,
                    borderColor: LIGHT_GREEN,
                },
            },
        }),
    },
    paginationPageButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginHorizontal: 3,
        backgroundColor: WHITE,
        borderWidth: 1,
        borderColor: VERY_LIGHT_GRAY,
        shadowColor: DARK_GRAY,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transitionDuration: '0.2s',
                transitionProperty: 'background-color, border-color, color',
                ':hover': {
                    backgroundColor: ACCENT_GREEN_BACKGROUND,
                    borderColor: LIGHT_GREEN,
                },
            },
        }),
    },
    paginationPageButtonActive: {
        backgroundColor: PRIMARY_GREEN,
        borderColor: PRIMARY_GREEN,
    },
    paginationPageText: {
        color: MEDIUM_GRAY,
        fontSize: 14,
        fontWeight: '600',
    },
    paginationPageTextActive: {
        color: WHITE,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalView: {
        backgroundColor: WHITE,
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
        width: IS_LARGE_SCREEN ? '30%' : '75%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    modalCloseIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
        zIndex: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: DARK_GRAY,
        textAlign: 'center',
    },
    assignmentStatusContainer: {
        width: '100%',
        marginBottom: 15,
        alignItems: 'center',
    },
    currentAssignmentText: {
        fontSize: 14,
        color: MEDIUM_GRAY,
        marginBottom: 8,
    },
    assignedResidentName: {
        fontWeight: 'bold',
        color: PRIMARY_GREEN,
    },
    assignmentSelectionContainer: {
        width: '100%',
        marginBottom: 15,
    },
    selectResidentText: {
        fontSize: 14,
        color: DARK_GRAY,
        marginBottom: 8,
        textAlign: 'center',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: LIGHT_GRAY,
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
        backgroundColor: VERY_LIGHT_GRAY,
    },
    picker: {
        height: 40,
        width: '100%',
        color: DARK_GRAY,
    },
    modalButton: {
        borderRadius: 8,
        padding: 10,
        elevation: 1,
        width: '100%',
        alignItems: 'center',
        marginBottom: 8,
    },
    assignButton: {
        backgroundColor: PRIMARY_GREEN,
    },
    deassignButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: ERROR_RED,
        marginTop: 5,
        ...Platform.select({
            web: {
                cursor: 'pointer',
                transitionDuration: '0.2s',
                transitionProperty: 'background-color, opacity',
                ':hover': {
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                },
            },
        }),
    },
    deassignButtonSmallText: {
        color: ERROR_RED,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    modalButtonText: {
        color: WHITE,
        fontWeight: 'bold',
        fontSize: 14,
    },
});
// AETHERIS/screens/admin/EmployeeManagementScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView, Platform, TextInput, ActivityIndicator, Dimensions, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';

import Config from '../../config/config';
import EmployeeCreationForm from './EmployeeCreationScreen';
// Importamos la nueva pantalla de edición
import EmployeeEditScreen from './EmployeeEditScreen'; //

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

export default function EmployeeManagementScreen() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const [employees, setEmployees] = useState([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [fetchError, setFetchError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Activos');

    const [currentPage, setCurrentPage] = useState(1);
    const [employeesPerPage] = useState(8);

    const [showCreateForm, setShowCreateForm] = useState(false);
    // Nuevo estado para controlar si se muestra el formulario de edición
    const [showEditForm, setShowEditForm] = useState(false); //
    // Estado para guardar los datos del empleado que se está editando
    const [employeeToEdit, setEmployeeToEdit] = useState(null); //

    const API_URL = Config.API_BASE_URL;

    const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        setFetchError('');
        try {
            const response = await fetch(`${API_URL}/Personal`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar empleados del backend.');
            }

            const data = await response.json();
            if (data && data.personal) {
                setEmployees(data.personal);
            } else {
                setEmployees(data);
            }
            console.log("Empleados cargados:", data);
        } catch (error) {
            console.error("Error al cargar empleados:", error.message);
            setFetchError('No se pudieron cargar los empleados. Intenta de nuevo más tarde.');
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    useEffect(() => {
        // Only re-fetch if the screen is focused and no forms are active
        // The search and filter status changes will trigger filtering on the client-side
        // The API call is to get the base data.
        if (isFocused && !showCreateForm && !showEditForm) {
            fetchEmployees();
        }
    }, [isFocused, showCreateForm, showEditForm]);

    const handleCreateNewEmployee = () => {
        setShowCreateForm(true);
        setShowEditForm(false); // Asegurarse de ocultar el formulario de edición
        setEmployeeToEdit(null); // Limpiar el empleado a editar
    };

    const handleCancelCreate = () => {
        setShowCreateForm(false);
        fetchEmployees();
    };

    const handleEmployeeCreated = () => {
        setShowCreateForm(false);
        fetchEmployees();
    };

    // Nueva función para manejar la edición
    const handleEditEmployee = (employee) => { //
        setEmployeeToEdit(employee); //
        setShowEditForm(true); //
        setShowCreateForm(false); // Asegurarse de ocultar el formulario de creación
    };

    // Nueva función para cancelar la edición
    const handleCancelEdit = () => { //
        setShowEditForm(false); //
        setEmployeeToEdit(null); //
        fetchEmployees(); //
    };

    // Nueva función que se llama cuando el empleado ha sido editado exitosamente
    const handleEmployeeEdited = () => { //
        setShowEditForm(false); //
        setEmployeeToEdit(null); //
        fetchEmployees(); //
    };

    // Filter employees based on search term and status
    // This filtering happens on the client-side from the 'employees' state
    const filteredEmployees = employees.filter(employee => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const matchesSearchTerm = employee.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            employee.apellido.toLowerCase().includes(lowerCaseSearchTerm);

        let matchesFilterStatus = true;
        if (filterStatus === 'Activos') {
            matchesFilterStatus = employee.activo === true;
        } else if (filterStatus === 'Inactivos') {
            matchesFilterStatus = employee.activo === false;
        }
        return matchesSearchTerm && matchesFilterStatus;
    });

    // Recalculate current page employees whenever filteredEmployees or currentPage changes
    const indexOfLastEmployee = currentPage * employeesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Botón de regresar visible si cualquier formulario está activo */}
                {(showCreateForm || showEditForm) && ( //
                    <TouchableOpacity onPress={showCreateForm ? handleCancelCreate : handleCancelEdit} style={styles.backButton}> {/* */}
                        <Ionicons name="arrow-back-outline" size={20} color={WHITE} />
                        <Text style={styles.backButtonText}>Regresar</Text>
                    </TouchableOpacity>
                )}

                {showCreateForm ? (
                    <EmployeeCreationForm onEmployeeCreated={handleEmployeeCreated} onCancel={handleCancelCreate} />
                ) : showEditForm && employeeToEdit ? ( // Renderiza EmployeeEditScreen si showEditForm es true y hay un empleado a editar
                    <EmployeeEditScreen
                        route={{ params: { employeeData: employeeToEdit } }} // Pasa los datos del empleado
                        onEmployeeEdited={handleEmployeeEdited}
                        onCancel={handleCancelEdit}
                    />
                ) : (
                    <View style={styles.mainContentArea}>
                        <View style={styles.controlsContainer}>
                            <View style={styles.searchFilterGroup}>
                                <View style={styles.searchInputContainer}>
                                    <Ionicons name="search" size={20} color={MEDIUM_GRAY} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Buscar por nombre/apellido..."
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

                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={handleCreateNewEmployee}
                            >
                                <Ionicons name="person-add" size={20} color={styles.createButtonText.color} />
                                <Text style={styles.createButtonText}>CREAR EMPLEADO</Text>
                            </TouchableOpacity>
                        </View>

                        {isLoadingEmployees ? (
                            <ActivityIndicator size="large" color={PRIMARY_GREEN} style={styles.loadingIndicator} />
                        ) : fetchError ? (
                            <Text style={styles.errorText}>{fetchError}</Text>
                        ) : employees.length === 0 && searchTerm === '' && filterStatus === 'Activos' ? (
                            <Text style={styles.noEmployeesText}>No hay empleados registrados.</Text>
                        ) : (
                            <>
                                <View style={styles.tableContainer}>
                                    <ScrollView horizontal={true} contentContainerStyle={styles.tableScrollViewContent}>
                                        <View style={styles.table}>
                                            <View style={styles.tableRowHeader}>
                                                <Text style={[styles.tableHeaderCell, styles.idCell]}>ID</Text>
                                                <Text style={styles.tableHeaderCell}>Nombre</Text>
                                                <Text style={styles.tableHeaderCell}>Apellido</Text>
                                                {IS_LARGE_SCREEN && (
                                                    <>
                                                        <Text style={styles.tableHeaderCell}>Nacimiento</Text>
                                                        <Text style={styles.tableHeaderCell}>Género</Text>
                                                        <Text style={styles.tableHeaderCell}>Teléfono</Text>
                                                    </>
                                                )}
                                                <Text style={[styles.tableHeaderCell, styles.activeCell]}>Activo</Text>
                                                <Text style={[styles.tableHeaderCell, styles.actionsCell]}>Acciones</Text>
                                            </View>


                                            <ScrollView style={styles.tableBodyScrollView}>
                                                {currentEmployees.length === 0 ? (
                                                    <Text style={styles.noResultsText}>No se encontraron resultados para la búsqueda/filtro.</Text>
                                                ) : (
                                                    currentEmployees.map((employee, index) => (
                                                        <View
                                                            key={employee.id}
                                                            style={[
                                                                styles.tableRow,
                                                                index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                                                            ]}
                                                        >
                                                            <Text style={[styles.tableCell, styles.idCell]}>{employee.id}</Text>
                                                            <Text style={styles.tableCell}>{employee.nombre}</Text>
                                                            <Text style={styles.tableCell}>{employee.apellido}</Text>
                                                            {IS_LARGE_SCREEN && (
                                                                <>
                                                                    <Text style={styles.tableCell}>
                                                                        {new Date(employee.fecha_nacimiento).toLocaleDateString()}
                                                                    </Text>
                                                                    <Text style={styles.tableCell}>{employee.genero}</Text>
                                                                    <Text style={styles.tableCell}>{employee.telefono}</Text>
                                                                </>
                                                            )}
                                                            <Text style={[styles.tableCell, styles.activeCell]}>{employee.activo ? 'Sí' : 'No'}</Text>
                                                            <View style={[styles.tableCell, styles.actionsCell]}>
                                                                <TouchableOpacity
                                                                    style={styles.actionButton}
                                                                    onPress={() => handleEditEmployee(employee)} // Pasa el objeto empleado completo
                                                                >
                                                                    <Ionicons name="create-outline" size={20} color={PRIMARY_GREEN} />
                                                                </TouchableOpacity>
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
            </KeyboardAvoidingView>
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
                    borderColor: BUTTON_HOVER_COLOR,
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
    },
    controlsContainer: {
        width: '100%',
        maxWidth: IS_LARGE_SCREEN ? 1000 : 'auto',
        flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
        justifyContent: IS_LARGE_SCREEN ? 'space-between' : 'flex-start',
        alignItems: IS_LARGE_SCREEN ? 'center' : 'stretch',
        marginBottom: 20,
        gap: IS_LARGE_SCREEN ? 0 : 15,
    },
    searchFilterGroup: {
        flexDirection: IS_LARGE_SCREEN ? 'row' : 'column',
        gap: 10,
        width: IS_LARGE_SCREEN ? 'auto' : '100%',
    },
    searchInputContainer: {
        flex: IS_LARGE_SCREEN ? 1 : 'none',
        width: IS_LARGE_SCREEN ? '70%' : '100%',
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
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: IS_LARGE_SCREEN ? 'flex-start' : 'flex-start',
        width: IS_LARGE_SCREEN ? 'auto' : '100%',
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
    createButton: {
        marginTop: IS_LARGE_SCREEN ? 0 : 15,
        alignSelf: IS_LARGE_SCREEN ? 'auto' : 'center',
        width: IS_LARGE_SCREEN ? 'auto' : '100%',
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
                transitionDuration: '0.2s',
                transitionProperty: 'background-color, border-color',
                ':hover': {
                    backgroundColor: BUTTON_HOVER_COLOR,
                    borderColor: BUTTON_HOVER_COLOR,
                },
            },
        }),
    },
    createButtonText: {
        color: WHITE,
        fontWeight: '700',
        fontSize: 15,
        marginLeft: 8,
    },
    tableContainer: {
        width: '100%',
        maxHeight: 450,
        borderRadius: 12,
        backgroundColor: WHITE,
        padding: 10,
        alignContent: 'center',
        alignItems: 'center',
        ...containerBaseStyles,
    },
    tableScrollViewContent: {
        width: '100%',
        minWidth: IS_LARGE_SCREEN ? 1000 : '100%',
        alignItems: 'center',
    },
    table: {
        width: '100%',
        borderRadius: 10,

    },
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: ACCENT_GREEN_BACKGROUND,
        borderBottomColor: PRIMARY_GREEN,
        borderBottomWidth: 2,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    tableHeaderCell: {
        fontWeight: '700',
        fontSize: 14,
        color: PRIMARY_GREEN,
        paddingHorizontal: 8,
        flex: 1,
        textAlign: 'center',
    },
    idCell: {
        flex: 0.5,
    },
    activeCell: {
        flex: 0.6,
    },
    actionsCell: {
        flex: 0.8,
    },
    tableBodyScrollView: {
        maxHeight: 350,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderBottomColor: VERY_LIGHT_GRAY,
        borderBottomWidth: 1,
    },
    tableRowEven: {
        backgroundColor: '#f9f9f9',
    },
    tableRowOdd: {
        backgroundColor: WHITE,
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        color: DARK_GRAY,
        paddingHorizontal: 8,
        textAlign: 'center',
    },
    actionButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginationContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    paginationButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: VERY_LIGHT_GRAY,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginationPageButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: VERY_LIGHT_GRAY,
        alignItems: 'center',
        justifyContent: 'center',
    },
    paginationPageButtonActive: {
        backgroundColor: PRIMARY_GREEN,
    },
    paginationPageText: {
        color: MEDIUM_GRAY,
        fontWeight: '600',
    },
    paginationPageTextActive: {
        color: WHITE,
    },
    loadingIndicator: {
        marginTop: 50,
    },
    errorText: {
        marginTop: 50,
        color: ERROR_RED,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    noEmployeesText: {
        marginTop: 50,
        color: MEDIUM_GRAY,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    noResultsText: {
        marginVertical: 15,
        fontSize: 14,
        color: MEDIUM_GRAY,
        textAlign: 'center',
    },
});

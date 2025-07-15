import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, useWindowDimensions, Animated, Easing, Platform } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Definiciones de colores y constantes ---
const PRIMARY_ACCENT = '#4A90E2';
const SECONDARY_ACCENT = '#7ED321';
const WARNING_COLOR = '#F5A623';
const DANGER_COLOR = '#D0021B';
const NEUTRAL_DARK = '#3A4750';
const NEUTRAL_MEDIUM = '#606C76';
const NEUTRAL_LIGHT = '#B0BEC5';
const BACKGROUND_LIGHT = '#F8F9FA';
const CARD_BACKGROUND = '#FFFFFF';
const PURPLE = '#8B5CF6';

const HomeScreen = () => {
  // --- Hooks y Estado ---
  const { width: screenWidth } = useWindowDimensions();
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [chartCardWidth, setChartCardWidth] = useState(screenWidth * 0.9 / 2 - 10);

  const onChartCardLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    if (width !== chartCardWidth) {
      setChartCardWidth(width);
    }
  };

  // --- Datos Estáticos ---
  const totalPersonal = 21;
  const totalResidentes = 71;
  const notasActivas = 2;
  const temperaturaPromedio = 23.5;
  const dispositivosDisponibles = 24;

  // --- Datos para las Gráficas ---
  const datosRitmoCardiacoPromedio = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [78, 75, 80, 76, 82, 79, 77],
        color: (opacity = 1) => `rgba(208, 2, 27, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const datosAlertasPorTipoPastel = [
    { name: 'Ritmo Alto', population: 5, color: DANGER_COLOR, legendFontColor: NEUTRAL_DARK, legendFontSize: 14 },
    { name: 'Caída', population: 2, color: WARNING_COLOR, legendFontColor: NEUTRAL_DARK, legendFontSize: 14 },
    { name: 'Oxígeno Bajo', population: 4, color: PRIMARY_ACCENT, legendFontColor: NEUTRAL_DARK, legendFontSize: 14 },
    { name: 'Inactividad', population: 3, color: SECONDARY_ACCENT, legendFontColor: NEUTRAL_DARK, legendFontSize: 14 },
    { name: 'Otros', population: 1, color: PURPLE, legendFontColor: NEUTRAL_DARK, legendFontSize: 14 },
  ].sort((a, b) => b.population - a.population);

  const chartConfig = {
    backgroundGradientFrom: CARD_BACKGROUND,
    backgroundGradientTo: CARD_BACKGROUND,
    color: (opacity = 1) => `rgba(58, 71, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(58, 71, 80, ${opacity})`,
    paddingRight: 5,
  };

  const ultimasAlertas = [
    { id: 'al1', tipo: 'Ritmo Cardíaco Alto', residente: 'Juan P.', mensaje: 'Frecuencia sobre 100 bpm', fecha: 'Hace 5 min' },
    { id: 'al2', tipo: 'Caída Detectada', residente: 'Ana G.', mensaje: 'Posible caída', fecha: 'Hace 30 min' },
    { id: 'al3', tipo: 'Inactividad Anormal', residente: 'Carlos R.', mensaje: 'Sin actividad por 6h', fecha: 'Ayer' },
    { id: 'al4', tipo: 'Oxígeno Bajo', residente: 'María L.', mensaje: 'Nivel de oxígeno crítico', fecha: 'Ayer' },
    { id: 'al5', tipo: 'Temperatura Corporal', residente: 'Pedro G.', mensaje: 'Temperatura alta (39°C)', fecha: '2 días' },
  ];

  const ultimosChequeos = [
    { id: 'ch1', residente: 'Elena D.', fecha: '2025-07-07', frecuencia_cardiaca: 78, oxigeno: 98.2, peso: 65.1, observaciones: 'Todo normal.' },
    { id: 'ch2', residente: 'Felipe C.', fecha: '2025-07-06', frecuencia_cardiaca: 72, oxigeno: 97.5, peso: 70.0, observaciones: 'Leves dolores de cabeza.' },
    { id: 'ch3', residente: 'Laura S.', fecha: '2025-07-05', frecuencia_cardiaca: 85, oxigeno: 96.0, peso: 58.5, observaciones: 'Se siente cansada.' },
    { id: 'ch4', residente: 'Marco P.', fecha: '2025-07-04', frecuencia_cardiaca: 70, oxigeno: 99.1, peso: 80.3, observaciones: 'Sin novedad.' },
    { id: 'ch5', residente: 'Nadia V.', fecha: '2025-07-03', frecuencia_cardiaca: 80, oxigeno: 97.8, peso: 62.7, observaciones: 'Requiere más hidratación.' },
  ];

  // --- Eventos y animaciones ---
  const handleDataPointClick = ({ value, x, y }) => {
    setTooltipPos({
      x: x + 15,
      y: y - 25,
      visible: true,
      value,
    });
    fadeAnim.setValue(1);
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => setTooltipPos((pos) => ({ ...pos, visible: false })));
    }, 1500);
  };

  // --- Contenedor dinámico ---
  const Wrapper = Platform.OS === 'web' ? View : ScrollView;

  return (
    <SafeAreaView style={styles.container}>
      <Wrapper
        style={Platform.OS === 'web' ? styles.mainContent : undefined}
        contentContainerStyle={Platform.OS !== 'web' ? styles.mainContent : undefined}
        nestedScrollEnabled={true}
      >
        {/* KPI Cards */}
        <View style={styles.kpiContainer}>
          <View style={[styles.kpiCard, styles.kpiCardPurple]}>
            <Ionicons name="briefcase-outline" size={32} color={PURPLE} />
            <Text style={styles.kpiNumber}>{totalPersonal}</Text>
            <Text style={styles.kpiLabel}>Personal</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardGreen]}>
            <Ionicons name="people-outline" size={32} color={SECONDARY_ACCENT} />
            <Text style={styles.kpiNumber}>{totalResidentes}</Text>
            <Text style={styles.kpiLabel}>Residentes</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardRed]}>
            <Ionicons name="clipboard-outline" size={32} color={DANGER_COLOR} />
            <Text style={styles.kpiNumber}>{notasActivas}</Text>
            <Text style={styles.kpiLabel}>Notas Activas</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardBlue]}>
            <Ionicons name="thermometer-outline" size={32} color={PRIMARY_ACCENT} />
            <Text style={styles.kpiNumber}>{temperaturaPromedio}°C</Text>
            <Text style={styles.kpiLabel}>Temp. del Asilo</Text>
          </View>
          <View style={[styles.kpiCard, styles.kpiCardOrange]}>
            <Ionicons name="watch-outline" size={32} color={WARNING_COLOR} />
            <Text style={styles.kpiNumber}>{dispositivosDisponibles}</Text>
            <Text style={styles.kpiLabel}>Dispositivos Disponibles</Text>
          </View>
        </View>

        {/* Gráficas */}
        <View style={[styles.chartsAndListsContainer, { marginBottom: 40 }]}>
          <View style={styles.leftColumn} onLayout={onChartCardLayout}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Ritmo Cardíaco Promedio (Últimos 7 Días)</Text>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <LineChart
                  data={datosRitmoCardiacoPromedio}
                  width={chartCardWidth - 20}
                  height={240}
                  chartConfig={{
                    ...chartConfig,
                    ...lineChartConfig,
                    yAxisLabel: '',
                    propsForLabels: {
                      fontSize: 9,
                      fill: NEUTRAL_MEDIUM,
                    },
                  }}
                  bezier
                  style={styles.chartStyle}
                  onDataPointClick={handleDataPointClick}
                  fromZero={false}
                  paddingLeft="20"
                />
                {tooltipPos.visible && (
                  <Animated.View
                    style={[
                      styles.tooltip,
                      {
                        left: tooltipPos.x,
                        top: tooltipPos.y,
                        opacity: fadeAnim,
                      },
                    ]}
                  >
                    <Text style={styles.tooltipText}>{tooltipPos.value}</Text>
                  </Animated.View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Tendencia de tipo de alerta (Últimos 30 dias)</Text>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <PieChart
                  data={datosAlertasPorTipoPastel}
                  width={screenWidth * 0.9 / 2}
                  height={220}
                  chartConfig={chartConfig}
                  accessor={'population'}
                  backgroundColor={'transparent'}
                  paddingLeft={'15'}
                  center={[10, 0]}
                  absolute
                  renderDecorator={({ data, width, height }) => {
                    const total = data.reduce((sum, item) => sum + item.population, 0);
                    const radius = Math.min(width, height) / 2;
                    const centerX = width / 2;
                    const centerY = height / 2;
                    let currentAngle = 0;

                    return data.map((item, index) => {
                      const percentage = ((item.population / total) * 100).toFixed(0);
                      const angle = (item.population / total) * 2 * Math.PI;
                      const midAngle = currentAngle + angle / 2;

                      const textRadius = radius * 0.8;
                      const x = centerX + textRadius * Math.cos(midAngle - Math.PI / 2);
                      const y = centerY + textRadius * Math.sin(midAngle - Math.PI / 2);

                      currentAngle += angle;

                      return (
                        <Text
                          key={index}
                          style={{
                            position: 'absolute',
                            left: x - (percentage.length * 3),
                            top: y - 10,
                            color: NEUTRAL_DARK,
                            fontSize: 14,
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {percentage}%
                        </Text>
                      );
                    });
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Listas */}
        <View style={styles.chartsAndListsContainer}>
          <View style={styles.leftColumn}>
            <View style={styles.compactListCard}>
              <Text style={styles.chartTitle}>Alertas Recientes</Text>
              <ScrollView nestedScrollEnabled={true} style={{ flex: 1 }}>
                {ultimasAlertas.map((item) => (
                  <View key={item.id} style={[styles.activityItem, { borderLeftColor: DANGER_COLOR }]}>
                    <Ionicons name="warning-outline" size={20} color={DANGER_COLOR} style={styles.activityIcon} />
                    <View style={styles.activityTextContent}>
                      <Text style={styles.activityDescription}>
                        <Text style={{ fontWeight: 'bold' }}>{item.tipo}:</Text> {item.mensaje} - Residente <Text style={{ fontWeight: 'bold' }}>{item.residente}</Text>
                      </Text>
                      <Text style={styles.activityDate}>{item.fecha}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.compactListCard}>
              <Text style={styles.chartTitle}>Consultas Recientes</Text>
              <ScrollView nestedScrollEnabled={true} style={{ flex: 1 }}>
                {ultimosChequeos.map((item) => (
                  <View key={item.id} style={[styles.activityItem, { borderLeftColor: SECONDARY_ACCENT }]}>
                    <Ionicons name="heart-circle-outline" size={20} color={SECONDARY_ACCENT} style={styles.activityIcon} />
                    <View style={styles.activityTextContent}>
                      <Text style={styles.activityDescription}>
                        <Text style={{ fontWeight: 'bold' }}>Residente:</Text> <Text style={{ fontWeight: 'bold' }}>{item.residente}</Text>
                      </Text>
                      <Text style={styles.activityDetails}>
                        FC: {item.frecuencia_cardiaca} bpm | Oxig: {item.oxigeno}% | Peso: {item.peso} kg
                      </Text>
                      <Text style={styles.activityDetails}>Obs: {item.observaciones}</Text>
                      <Text style={styles.activityDate}>{item.fecha}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Wrapper>
    </SafeAreaView>
  );
};

// --- Configuración Específica de Gráficas ---
const lineChartConfig = {
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: DANGER_COLOR,
    fill: CARD_BACKGROUND,
  },
  fillShadowGradientFrom: DANGER_COLOR,
  fillShadowGradientFromOpacity: 0.2,
  propsForBackgroundLines: {
    strokeWidth: 0.5,
    stroke: NEUTRAL_LIGHT,
  },
  propsForLabels: {
    fontSize: 10,
    fill: NEUTRAL_MEDIUM,
  },
  decimalPlaces: 0,
};

// --- Estilos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
  },
  mainContent: {
    padding: 15,
    width: '100%',
    maxWidth: 1300,
    alignSelf: 'center',
    flexGrow: 1, // para que ScrollView tome todo el espacio posible
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  kpiCard: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    flexGrow: 1,
    flexBasis: '18%',
    minWidth: 150,
    margin: 8,
    justifyContent: 'center',
    borderWidth: 1,
  },
  kpiCardGreen: { borderColor: SECONDARY_ACCENT, backgroundColor: `${SECONDARY_ACCENT}1A` },
  kpiCardRed: { borderColor: DANGER_COLOR, backgroundColor: `${DANGER_COLOR}1A` },
  kpiCardBlue: { borderColor: PRIMARY_ACCENT, backgroundColor: `${PRIMARY_ACCENT}1A` },
  kpiCardOrange: { borderColor: WARNING_COLOR, backgroundColor: `${WARNING_COLOR}1A` },
  kpiCardPurple: { borderColor: PURPLE, backgroundColor: `${PURPLE}1A` },
  kpiNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: NEUTRAL_DARK,
    marginTop: 8,
  },
  kpiLabel: {
    marginTop: 5,
    fontSize: 13,
    color: NEUTRAL_MEDIUM,
    textAlign: 'center',
  },
  chartsAndListsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    flex: 1,
  },
  leftColumn: {
    flex: 1,
    minWidth: 300,
    marginRight: 10,
  },
  rightColumn: {
    flex: 1,
    minWidth: 300,
    marginLeft: 10,
  },
  compactListCard: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    height: 255,
    borderWidth: 1,
    borderColor: NEUTRAL_LIGHT,
  },
  chartCard: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 12,
    padding: 15,
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: NEUTRAL_LIGHT,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: NEUTRAL_DARK,
    marginBottom: 12,
  },
  chartStyle: {
    borderRadius: 8,
    marginVertical: 0,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: DANGER_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  tooltipText: {
    color: CARD_BACKGROUND,
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 10,
    borderLeftWidth: 3,
    paddingLeft: 8,
  },
  activityIcon: {
    marginRight: 10,
  },
  activityTextContent: {
    flex: 1,
  },
  activityDescription: {
    color: NEUTRAL_DARK,
  },
  activityDate: {
    fontSize: 11,
    color: NEUTRAL_MEDIUM,
    marginTop: 2,
  },
  activityDetails: {
    fontSize: 12,
    color: NEUTRAL_MEDIUM,
  },
});

export default HomeScreen;

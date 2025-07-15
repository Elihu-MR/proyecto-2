// AETHERIS/screens/family/FamilyDashboardScreen.js
import React from 'react';
import { View, Text, Platform, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export default function FamilyDashboardScreen() {
  // Datos simulados
  const residente = {
    nombre: 'María Gómez',
    edad: 83,
    habitacion: '204B',
    estado: 'Estable',
    resumen: '📝 Paciente estable. Seguimiento regular. Hidratación controlada.',
  };

  const signos = {
    fc: 78,
    oxigeno: 96,
    temperatura: 36.8,
    historialFC: [72, 75, 74, 78, 77, 80, 78],
  };

  const ambiente = {
    temp: 25.4,
    humedad: 52,
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(64, 115, 158, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#1e3799',
      fill: '#40739e',
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.title}>Bienvenido</Text>
      <View style={styles.card}>
        <Text style={styles.residentName}>{residente.nombre}, {residente.edad} años</Text>
        <Text style={styles.detail}>Hab. {residente.habitacion} • Estado: <Text style={{ fontWeight: 'bold' }}>{residente.estado}</Text></Text>
      </View>

      {/* Signos Vitales */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Últimos Signos Vitales</Text>
        <View style={styles.signosContainer}>
          <View style={styles.signoBox}>
            <Ionicons name="heart-outline" size={20} color="#EF4444" />
            <Text style={styles.signoLabel}>FC</Text>
            <Text style={styles.signoValue}>{signos.fc} bpm</Text>
          </View>
          <View style={styles.signoBox}>
            <Ionicons name="water-outline" size={20} color="#F59E0B" />
            <Text style={styles.signoLabel}>O₂</Text>
            <Text style={styles.signoValue}>{signos.oxigeno}%</Text>
          </View>
          <View style={styles.signoBox}>
            <Ionicons name="thermometer-outline" size={20} color="#EF4444" />
            <Text style={styles.signoLabel}>Temp</Text>
            <Text style={styles.signoValue}>{signos.temperatura}°C</Text>
          </View>
        </View>

        {/* Gráfica FC */}
        <Text style={styles.graphTitle}>Frecuencia Cardíaca (últimos días)</Text>
        <LineChart
          data={{
            labels: signos.historialFC.map((_, i) => `${i + 1}`),
            datasets: [{ data: signos.historialFC }],
          }}
          width={CARD_WIDTH - 32}
          height={160}
          chartConfig={chartConfig}
          bezier
          withDots
          withShadow={false}
          withInnerLines={false}
          withOuterLines={false}
          fromZero
          style={styles.chart}
        />
      </View>

      {/* Ambiente */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ambiente del Asilo</Text>
        <Text style={styles.ambienteText}>🌡️ Temperatura: {ambiente.temp}°C</Text>
        <Text style={styles.ambienteText}>💧 Humedad: {ambiente.humedad}%</Text>
      </View>

      {/* Resumen */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen médico</Text>
        <Text style={styles.resumenText}>{residente.resumen}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#f5f6fa',
  paddingLeft: Platform.OS === 'web' ? 260 : 0, 
},

  content: {
    padding: 16,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  residentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3640',
  },
  detail: {
    fontSize: 14,
    color: '#718093',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#353b48',
    marginBottom: 10,
  },
  signosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  signoBox: {
    alignItems: 'center',
  },
  signoLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  signoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2f3640',
    marginTop: 2,
  },
  graphTitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 10,
    marginTop: 4,
  },
  ambienteText: {
    fontSize: 14,
    marginTop: 6,
    color: '#2f3640',
  },
  resumenText: {
    fontSize: 14,
    color: '#2f3640',
    lineHeight: 20,
  },
});

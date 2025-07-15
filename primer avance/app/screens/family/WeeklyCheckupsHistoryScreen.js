// AETHERIS/screens/family/WeeklyCheckupsHistoryScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WeeklyCheckupsHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Chequeos Semanales</Text>
      <Text>Aquí se mostrará el historial completo de chequeos semanales (SpO2, temperatura, peso, IMC).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
});
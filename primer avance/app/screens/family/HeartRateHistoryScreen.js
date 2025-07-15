// AETHERIS/screens/family/HeartRateHistoryScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HeartRateHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Ritmo Cardíaco</Text>
      <Text>Aquí se mostrará el historial detallado de ritmo cardíaco de su familiar.</Text>
      {/* Componentes para las gráficas y lista de datos */}
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
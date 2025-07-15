// AETHERIS/screens/family/AsylumInfoScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.88; // 88% del ancho de pantalla

export default function AsylumInfoScreen() {
  const asylum = {
    nombre: 'Residencia Aetheris',
    direccion: '-------- Tijuana, BC',
    telefono: '(55) 1234 5678',
    correo: 'contacto@aetheris.com',
    horario: 'Lunes a Viernes - 9:00 AM a 5:00 PM',
    responsableMedico: 'Dra. Vanessa Perez',
    responsableAdmin: 'Lic. Fermamdp Perez',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Información del Asilo</Text>

      {[
        {
          icon: <Ionicons name="business-outline" size={24} color="#40739e" />,
          title: asylum.nombre,
          subtitle: asylum.direccion,
        },
        {
          icon: <Ionicons name="call-outline" size={24} color="#40739e" />,
          title: 'Teléfono',
          subtitle: asylum.telefono,
        },
        {
          icon: <Ionicons name="mail-outline" size={24} color="#40739e" />,
          title: 'Correo Electrónico',
          subtitle: asylum.correo,
        },
        {
          icon: <Ionicons name="time-outline" size={24} color="#40739e" />,
          title: 'Horario de Atención',
          subtitle: asylum.horario,
        },
        {
          icon: <MaterialIcons name="medical-services" size={24} color="#40739e" />,
          title: 'Responsable Médico',
          subtitle: asylum.responsableMedico,
        },
        {
          icon: <Ionicons name="person-outline" size={24} color="#40739e" />,
          title: 'Responsable Administrativo',
          subtitle: asylum.responsableAdmin,
        },
      ].map((item, index) => (
        <View key={index} style={styles.card}>
          {item.icon}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.subtitle && <Text style={styles.cardText}>{item.subtitle}</Text>}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2f3640',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    width: CARD_WIDTH,  // <- usa esta variable dinámica
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#353b48',
  },
  cardText: {
    fontSize: 13,
    color: '#636e72',
    marginTop: 2,
  },
});

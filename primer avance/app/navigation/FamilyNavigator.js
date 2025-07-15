// AETHERIS/navigation/FamilyNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Header from '../components/navigation/Header';
import SideMenu from '../components/navigation/SideMenu'; // <-- Usa el SideMenu UNIFICADO

import FamilyDashboardScreen from '../screens/family/FamilyDashboardScreen';
import HeartRateHistoryScreen from '../screens/family/HeartRateHistoryScreen';
import WeeklyCheckupsHistoryScreen from '../screens/family/WeeklyCheckupsHistoryScreen';
import AsylumInfoScreen from '../screens/family/AsylumInfoScreen';

const Drawer = createDrawerNavigator();

const FamilyNavigator = ({ onLogout, userRole }) => { // <-- Recibe userRole aquí
  return (
    <Drawer.Navigator
      initialRouteName="FamilyDashboard"
      // Pasa onLogout Y userRole al SideMenu UNIFICADO
      drawerContent={(props) => <SideMenu {...props} onLogout={onLogout} userRole={userRole} />}
      screenOptions={({ navigation, route }) => ({
        drawerType: 'slide',
        drawerStyle: {
          width: 260,
          backgroundColor: '#fcfcfc',
          shadowColor: '#000',
          shadowOffset: { width: 6, height: 0 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
        headerShown: true,
        header: ({ options }) => (
          <Header
            title={options.title || route.name}
            onMenuPress={() => navigation.toggleDrawer()}
          />
        ),
      })}
    >
      <Drawer.Screen name="FamilyDashboard" component={FamilyDashboardScreen} options={{ title: 'Home' }} />
      <Drawer.Screen name="HeartRateHistory" component={HeartRateHistoryScreen} options={{ title: 'RITMO CARDÍACO' }} />
      <Drawer.Screen name="AsylumInfo" component={AsylumInfoScreen} options={{ title: 'INFO DEL ASILO' }} />
    </Drawer.Navigator>
  );
};

export default FamilyNavigator;
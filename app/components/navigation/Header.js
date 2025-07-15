import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Header = ({ title, onMenuPress }) => {
  const { width } = useWindowDimensions();
  const showMenuButton = Platform.OS !== 'web' || width < 1024;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.leftContainer}>
          {showMenuButton && (
            <Pressable onPress={onMenuPress} style={styles.menuButton}>
              <Ionicons name="menu" size={28} color="#333" />
            </Pressable>
          )}
          <Text style={styles.screenTitle}>{title}</Text>
        </View>

        <View style={styles.rightIconsContainer}>
          <View style={styles.notificationWrapper}>
            <Ionicons name="notifications-outline" size={24} color="#666" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </View>
          <Ionicons name="settings-outline" size={24} color="#666" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  headerContainer: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 12,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationWrapper: {
    position: 'relative',
    marginRight: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#6BB240',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Header;

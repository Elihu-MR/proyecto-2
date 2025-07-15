// ./components/shared/Notification.js
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SUCCESS_GREEN = '#6BB240';
const ERROR_RED = '#DC3545';
const INFO_BLUE = '#007BFF';
const WARNING_ORANGE = '#FFC107';
const WHITE = '#FFFFFF';
const DARK_GRAY = '#333';
const LIGHT_BORDER_GRAY = '#ddd';

const Notification = forwardRef((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');
  const slideAnim = useState(new Animated.Value(Platform.OS === 'web' ? -50 : -100))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useImperativeHandle(ref, () => ({
    show: (msg, type = 'success', duration = 3000) => {
      setMessage(msg);
      setType(type);
      setIsVisible(true);

      let slideToValue;
      if (Platform.OS === 'web') {
        slideToValue = 20;
      } else if (Platform.OS === 'ios') {
        slideToValue = 0;
      } else {
        slideToValue = 20;
      }

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: slideToValue,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (duration > 0) {
          setTimeout(() => {
            hide();
          }, duration);
        }
      });
    },
    hide: () => {
      hide();
    }
  }));

  const hide = () => {
    const slideToValue = Platform.OS === 'web' ? -50 : -100;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: slideToValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setMessage('');
      setType('success');
    });
  };

  if (!isVisible) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return SUCCESS_GREEN;
      case 'error':
        return ERROR_RED;
      case 'info':
        return INFO_BLUE;
      case 'warning':
        return WARNING_ORANGE;
      default:
        return SUCCESS_GREEN;
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'close-circle-outline';
      case 'info':
        return 'information-circle-outline';
      case 'warning':
        return 'warning-outline';
      default:
        return 'information-circle-outline';
    }
  };

  return (
    <Animated.View
      style={[
        styles.notificationContainer,
        { backgroundColor: getBackgroundColor() },
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        Platform.OS === 'web' && styles.notificationContainerWeb,
      ]}
    >
      <View style={styles.contentWrapper}>
        <Ionicons name={getIconName()} size={20} color={WHITE} style={styles.icon} />
        <Text style={styles.messageText}>{message}</Text>
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeButton}>
        <Ionicons name="close" size={16} color={WHITE} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    width: width * 0.9,
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    shadowColor: DARK_GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: LIGHT_BORDER_GRAY,
  },
  notificationContainerWeb: {
    top: 20,
    width: 320,
    left: '50%',
    right: 'auto',
    transform: [{ translateX: -160 }],
    marginHorizontal: 'auto',
    alignSelf: 'auto',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  icon: {
    marginRight: 8,
  },
  messageText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  closeButton: {
    padding: 3,
  },
});

export default Notification;
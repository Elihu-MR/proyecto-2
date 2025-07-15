// /src/context/NotificationContext.js
// This file provides a context for managing notifications across the application.
import React, { createContext, useRef, useContext } from 'react';
import Notification from '../../components/shared/Notification';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const notificationRef = useRef(null);

  const showNotification = (message, type = 'success', duration = 3000) => {
    if (notificationRef.current) {
      notificationRef.current.show(message, type, duration);
    }
  };

  const hideNotification = () => {
    if (notificationRef.current) {
      notificationRef.current.hide();
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      <Notification ref={notificationRef} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
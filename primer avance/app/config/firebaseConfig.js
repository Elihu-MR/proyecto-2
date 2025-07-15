// AETHERIS/config/firebaseConfig.js
import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

console.log("--- firebaseConfig.js: Iniciando carga del archivo ---");

const firebaseConfig = {
  apiKey: "AIzaSyDR5fgU2nFx7KA8pIpEb9TVZzN5KgbchKQ",
  authDomain: "aetheris-ac3f3.firebaseapp.com",
  projectId: "aetheris-ac3f3",
  storageBucket: "aetheris-ac3f3.firebasestorage.app",
  messagingSenderId: "1053969698323",
  appId: "1:1053969698323:web:37f2a6ad866dcecb9cf9e6"
};


let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log("--- firebaseConfig.js: Firebase App inicializada ---");
} else {
  app = getApp();
  console.log("--- firebaseConfig.js: Firebase App ya inicializada, obteniendo instancia existente ---");
}

let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
    console.log("--- firebaseConfig.js: Firebase Auth inicializada para WEB ---");
  } else {
    let asyncStorageInstance;
    try {
      const AsyncStorageModule = require('@react-native-async-storage/async-storage');
      asyncStorageInstance = AsyncStorageModule.default || AsyncStorageModule;
      console.log("--- firebaseConfig.js: AsyncStorage importado exitosamente para nativo ---");
    } catch (importError) {
      console.warn("--- firebaseConfig.js: Advertencia: No se pudo importar @react-native-async-storage/async-storage.", importError.message);
      asyncStorageInstance = null;
    }

    if (asyncStorageInstance) {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(asyncStorageInstance)
      });
      console.log("--- firebaseConfig.js: Firebase Auth inicializada con persistencia NATIVA ---");
    } else {
      auth = initializeAuth(app, {
        persistence: undefined
      });
      console.warn("--- firebaseConfig.js: Firebase Auth inicializada para NATIVA sin persistencia (AsyncStorage no disponible) ---");
    }
  }
} catch (e) {
  console.error("--- firebaseConfig.js: ERROR al inicializar Auth ---", e);
  auth = null;
}

const db = getFirestore(app);
console.log("--- firebaseConfig.js: Firebase Firestore inicializada ---");

export { app, auth, db };
console.log("--- firebaseConfig.js: Exportaciones completadas ---");

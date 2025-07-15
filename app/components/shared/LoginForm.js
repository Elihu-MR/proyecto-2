"use client"

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';


export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    if (!auth) {
      console.error("Firebase Auth no está inicializado. No se puede iniciar sesión.");
      setError("Un error interno impide la autenticación. Contacta al soporte.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Firebase login successful for user:", user.email, "UID:", user.uid);

      // --- ¡¡¡AQUÍ ES DONDE SE IMPRIMIRÁ EL TOKEN!!! ---
      if (user) {
          const idToken = await user.getIdToken(true); // El 'true' fuerza la actualización del token para asegurar los claims.
          console.log("--> MI ID TOKEN DE FIREBASE ES:", idToken); // <--- ¡Copia esta cadena!
      }
      // --- FIN DEL CÓDIGO PARA IMPRIMIR EL TOKEN ---


      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const assignedRole = userData.role;

        if (assignedRole) {
          console.log("User role fetched from Firestore:", assignedRole);
          if (onLoginSuccess) {
            onLoginSuccess(assignedRole);
          }
        } else {
          console.warn("User document found in Firestore for UID:", user.uid, "but no 'role' field. Contact administrator.");
          setError("Tu cuenta no tiene un rol asignado. Contacta al administrador.");
        }
      } else {
        console.warn("No user document found in Firestore for UID:", user.uid, ". User may not be fully set up.");
        setError("Tu cuenta no está completamente configurada. Contacta al administrador.");
      }

    } catch (firebaseError) {
      console.error("Firebase Login Error:", firebaseError.code, firebaseError.message);
      let errorMessage = "Error de autenticación. Inténtalo de nuevo.";

      switch (firebaseError.code) {
        case 'auth/invalid-email':
          errorMessage = 'Formato de ID/correo electrónico inválido.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Tu cuenta ha sido deshabilitada.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'ID o contraseña incorrectos.';
          break;
        default:
          errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo más tarde.';
          break;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.formContainer}>
          <LinearGradient
            colors={["#3B82F6", "#10B981", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBorder}
          >
            <View style={styles.innerContainer}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/images/ahorasi.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ID (Correo Electrónico)</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholder=""
                    />
                    <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Text style={styles.loginButtonText}>Iniciando sesión...</Text>
                  ) : (
                    <Text style={styles.loginButtonText}>LOG IN</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity>
                  <Text style={styles.forgotPassword}>Forgot your password?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  formContainer: {
    alignItems: "center",
  },
  gradientBorder: {
    borderRadius: 8,
    padding: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  innerContainer: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: 32,
    width: Platform.OS === 'web' ? 450 : 350,
    maxWidth: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 5,
    marginTop: 10,
  },
  logo: {
    width: 270,
    height: 130,
  },
  form: {
    marginBottom: 6,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "white",
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
    backgroundColor: "white",
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 14,
  },
  loginButton: {
    backgroundColor: "#4F46E5",
    height: 48,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
  },
  forgotPassword: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  registerText: {
    fontSize: 14,
    color: '#4F46E5',
    marginTop: 10,
    fontWeight: 'bold',
  }
});
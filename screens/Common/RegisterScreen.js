import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../config/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

// Importar la imagen de fondo
import backgroundImage from "../../assets/fondo1.png";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (
      !email ||
      !password ||
      !name ||
      !year ||
      !gender ||
      !height ||
      !weight
    ) {
      Alert.alert("Error", "Por favor, complete todos los campos.");
      return;
    }

    // Validar altura y peso
    if (isNaN(parseFloat(height)) || isNaN(parseFloat(weight))) {
      Alert.alert("Error", "Altura y peso deben ser valores numéricos.");
      return;
    }

    // Validar correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Ingrese un correo electrónico válido.");
      return;
    }

    // Validar contraseña
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    // --- NUEVA VALIDACIÓN AQUÍ ---
    // Verificamos si la contraseña incluye el nombre (convirtiendo ambos a minúsculas)
    if (password.toLowerCase().includes(name.trim().toLowerCase())) {
        Alert.alert("Error", "Por seguridad, la contraseña no puede contener tu nombre.");
        return;
    }
    // -----------------------------

    // Validar año
    const currentYear = new Date().getFullYear();
    const yearValue = parseInt(year);
    if (isNaN(yearValue) || yearValue < 1900 || yearValue > currentYear) {
      Alert.alert("Error", `El año debe estar entre 1900 y ${currentYear}.`);
      return;
    }

    // Validar género
    const validGenders = ["Masculino", "Femenino", "Otro"];
    if (!validGenders.includes(gender)) {
      Alert.alert("Error", "El género debe ser Masculino, Femenino u Otro.");
      return;
    }

    setLoading(true);

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;

        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          email: user.email,
          role: "alumno",
          name,
          year,
          gender,
          height: parseFloat(height),
          weight: parseFloat(weight),
          assignedTrainer: null,
        });

        Alert.alert(
          "Registro exitoso",
          "El alumno ha sido registrado correctamente.",
          [{ text: "OK", onPress: () => navigation.navigate("Login") }]
        );
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.overlay}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <>
              <Text style={styles.title}>Registro de Alumno</Text>
              <TextInput
                style={[styles.input, styles.wideInput]}
                placeholder="Nombre"
                value={name}
                onChangeText={(text) => setName(text)}
                placeholderTextColor="#ccc"
              />
              <TextInput
                style={[styles.input, styles.wideInput]}
                placeholder="Año (ej. 2000)"
                value={year}
                onChangeText={(text) => {
                  if (/^\d{0,4}$/.test(text)) {
                    setYear(text);
                  }
                }}
                keyboardType="numeric"
                placeholderTextColor="#ccc"
              />

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={gender}
                  onValueChange={(value) => setGender(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione su género" value="" />
                  <Picker.Item label="Hombre" value="Masculino" />
                  <Picker.Item label="Mujer" value="Femenino" />
                  <Picker.Item label="Otro" value="Otro" />
                </Picker>
              </View>

              <TextInput
                style={[styles.input, styles.wideInput]}
                placeholder="Altura (cm)"
                value={height}
                onChangeText={(text) => {
                  // Expresión regular: Solo permite dígitos (0-9) y máximo 3 caracteres
                  if (/^\d{0,3}$/.test(text)) {
                    setHeight(text);
                  }
                }}
                keyboardType="numeric"
                maxLength={3} // Bloqueo adicional del teclado
                placeholderTextColor="#ccc"
              />

              <TextInput
                style={[styles.input, styles.wideInput]}
                placeholder="Peso (kg)"
                value={weight}
                onChangeText={(text) => {
                  // Expresión regular: Solo permite dígitos (0-9) y máximo 3 caracteres
                  if (/^\d{0,3}$/.test(text)) {
                    setWeight(text);
                  }
                }}
                keyboardType="numeric"
                maxLength={3} // Bloqueo adicional del teclado
                placeholderTextColor="#ccc"
              />
              
              <TextInput
                style={[styles.input, styles.wideInput]}
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#ccc"
              />
              <TextInput
                style={[styles.input, styles.wideInput]}
                placeholder="Contraseña"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry
                placeholderTextColor="#ccc"
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleRegister}
                >
                  <Text style={styles.buttonText}>Registrar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.navigate("Login")}
                >
                  <Text style={styles.backButtonText}>
                    Volver a Iniciar Sesión
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
    width: "95%",
  },
  title: {
    fontSize: 36,
    color: "#fff",
    marginBottom: 30,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  input: {
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
  },
  wideInput: {
    width: "100%",
  },
  buttonContainer: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#ff6f00",
    paddingVertical: 20,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 10,
  },
  backButtonText: {
    color: "#ff6f00",
    fontSize: 18,
    fontWeight: "bold",
  },

  pickerContainer: {
    width: "100%",
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  picker: {
    color: "#fff",
  },
});

export default RegisterScreen;

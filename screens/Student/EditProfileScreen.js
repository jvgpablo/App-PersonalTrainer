import React, { useState, useEffect } from "react";
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
import { auth, db } from "../../config/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import backgroundImage from "../../assets/fondo1.png"; 

const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Estado para el mensaje de éxito
  const [successMessage, setSuccessMessage] = useState(null);

  // 1. Cargar datos del usuario al iniciar
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || "");
            setYear(data.year ? data.year.toString() : "");
            setGender(data.gender || "");
            setHeight(data.height ? data.height.toString() : "");
            setWeight(data.weight ? data.weight.toString() : "");
          }
        }
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 2. Función para guardar cambios
  const handleUpdate = async () => {
    if (!name || !year || !gender || !height || !weight) {
      Alert.alert("Error", "Por favor, complete todos los campos.");
      return;
    }

    setUpdating(true);
    setSuccessMessage(null);

    try {
      const user = auth.currentUser;
      const docRef = doc(db, "usuarios", user.uid);

      await updateDoc(docRef, {
        name,
        year,
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
      });

      // MOSTRAR MENSAJE DE ÉXITO (Sin Alerta)
      setSuccessMessage("¡Datos guardados correctamente!");

      // Esperar 2 segundos y salir
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate("StudentHomeScreen");
        }
      }, 2000);

      // NOTA: No ponemos setUpdating(false) aquí para que el botón 
      // siga oculto mientras redirige.

    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil.");
      setUpdating(false); // Solo volvemos a mostrar el botón si hubo error
    }
  };

  if (loading) {
    return (
      <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6f00" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.overlay}>
          <Text style={styles.title}>Editar Perfil</Text>

          <Text style={styles.label}>Nombre:</Text>
          <TextInput
            style={[styles.input, styles.wideInput]}
            value={name}
            onChangeText={setName}
            placeholder="Nombre"
            placeholderTextColor="#ccc"
          />

          <Text style={styles.label}>Año de nacimiento:</Text>
          <TextInput
            style={[styles.input, styles.wideInput]}
            value={year}
            onChangeText={(text) => {
              if (/^\d{0,4}$/.test(text)) setYear(text);
            }}
            keyboardType="numeric"
            placeholder="Año"
            placeholderTextColor="#ccc"
          />

          <Text style={styles.label}>Género:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(value) => setGender(value)}
              style={styles.picker}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Masculino" value="Masculino" />
              <Picker.Item label="Femenino" value="Femenino" />
              <Picker.Item label="Otro" value="Otro" />
            </Picker>
          </View>

          <Text style={styles.label}>Altura (cm):</Text>
          <TextInput
            style={[styles.input, styles.wideInput]}
            value={height}
            onChangeText={(text) => {
              if (/^\d{0,3}$/.test(text)) setHeight(text);
            }}
            keyboardType="numeric"
            maxLength={3}
            placeholder="Altura"
            placeholderTextColor="#ccc"
          />

          <Text style={styles.label}>Peso (kg):</Text>
          <TextInput
            style={[styles.input, styles.wideInput]}
            value={weight}
            onChangeText={(text) => {
              if (/^\d{0,3}$/.test(text)) setWeight(text);
            }}
            keyboardType="numeric"
            maxLength={3}
            placeholder="Peso"
            placeholderTextColor="#ccc"
          />

          {/* MENSAJE DE ÉXITO VISUAL */}
          {successMessage && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* LÓGICA DE BOTONES: Si hay éxito, ocultamos botones y mostramos "Redirigiendo..." */}
          {successMessage ? (
             <View style={{ marginTop: 20, alignItems: 'center' }}>
               <ActivityIndicator size="small" color="#fff" />
               <Text style={{ color: '#fff', marginTop: 10 }}>Redirigiendo...</Text>
             </View>
          ) : (
            <View style={styles.buttonContainer}>
              {updating ? (
                <ActivityIndicator size="large" color="#ff6f00" />
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                  <Text style={styles.buttonText}>Guardar Cambios</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "bold",
  },
  label: {
    alignSelf: "flex-start",
    color: "#ff6f00",
    fontSize: 14,
    marginLeft: 5,
    marginBottom: 2,
    fontWeight: 'bold'
  },
  input: {
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
  },
  wideInput: {
    width: "100%",
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  picker: {
    color: "#fff",
  },
  
  // ESTILOS NUEVOS PARA EL MENSAJE
  successContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.9)", // Verde
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
  },
  successText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  buttonContainer: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#ff6f00",
    paddingVertical: 15,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 10,
  },
  backButtonText: {
    color: "#ccc",
    fontSize: 16,
  },
});

export default EditProfileScreen;
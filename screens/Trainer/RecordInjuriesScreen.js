import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { db } from "../../config/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  getDocs,
  collectionGroup,
} from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "react-native-vector-icons/Ionicons";

const RecordInjuriesScreen = ({ route }) => {
  const { trainerId } = route.params || {};
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [injuryDescription, setInjuryDescription] = useState("");
  const [trainerNotes, setTrainerNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [injuriesList, setInjuriesList] = useState([]);

  useEffect(() => {
    if (!trainerId) {
      Alert.alert("Error", "El ID del entrenador no está disponible.");
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      try {
        const trainerDoc = await getDoc(doc(db, "usuarios", trainerId));
        if (trainerDoc.exists()) {
          const trainerData = trainerDoc.data();
          const studentIds = trainerData.listaDeAlumnos || [];
          const studentDocs = await Promise.all(
            studentIds.map((id) => getDoc(doc(db, "usuarios", id)))
          );
          const studentList = studentDocs
            .filter((doc) => doc.exists())
            .map((doc) => ({ id: doc.id, ...doc.data() }));

          setStudents(studentList);
        } else {
          Alert.alert("Error", "No se encontraron datos del entrenador.");
        }
      } catch (error) {
        console.error("Error al cargar alumnos:", error);
        Alert.alert("Error", "No se pudieron cargar los alumnos.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [trainerId]);

  const handleRecordInjury = async () => {
    if (!selectedStudent || !injuryDescription.trim()) {
      Alert.alert(
        "Error",
        "Selecciona un alumno y proporciona una descripción de la lesión."
      );
      return;
    }

    const injuryData = {
      description: injuryDescription,
      date: new Date(),
      status: "Activa",
      trainerNotes: trainerNotes.trim(),
    };

    try {
      await addDoc(
        collection(db, "usuarios", selectedStudent, "injuries"),
        injuryData
      );
      Alert.alert("Éxito", "La lesión ha sido registrada.");
      setInjuryDescription("");
      setTrainerNotes("");
    } catch (error) {
      console.error("Error registrando lesión:", error);
      Alert.alert("Error", "No se pudo registrar la lesión.");
    }
  };

  const fetchInjuriesList = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collectionGroup(db, "injuries"));
      const injuries = await Promise.all(
        querySnapshot.docs.map(async (injuryDoc) => {
          const data = injuryDoc.data();
          const studentId = injuryDoc.ref.path.split("/")[1];

          // Obtener el nombre del estudiante desde la colección usuarios
          const studentDoc = await getDoc(doc(db, "usuarios", studentId));
          const studentName = studentDoc.exists()
            ? studentDoc.data().name || "Alumno sin nombre"
            : "Alumno no encontrado";

          return {
            id: injuryDoc.id,
            ...data,
            studentId,
            studentName,
          };
        })
      );

      setInjuriesList(injuries);
    } catch (error) {
      console.error("Error al cargar lista de lesiones:", error);
      Alert.alert("Error", "No se pudo cargar la lista de lesiones.");
    } finally {
      setLoading(false);
      setMostrarLista(!mostrarLista);
    }
  };

  const renderInjury = ({ item }) => {
    const formattedDate =
      item.date && item.date.toDate
        ? item.date.toDate().toLocaleDateString()
        : "Fecha no disponible";
    return (
      <View style={styles.injuryContainer}>
        <Text style={styles.injuryText}>Alumno: {item.studentName}</Text>
        <Text style={styles.injuryText}>Descripción: {item.description}</Text>
        <Text style={styles.injuryText}>Estado: {item.status}</Text>
        <Text style={styles.injuryText}>Fecha: {formattedDate}</Text>
        <Text style={styles.injuryText}>
          Notas: {item.trainerNotes || "Sin notas"}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Lesión</Text>
      {students.length === 0 ? (
        <Text style={styles.noStudentsText}>No hay alumnos asignados.</Text>
      ) : (
        <View style={styles.formContainer}>
          <View style={styles.pickerContainer}>
            <Ionicons
              name="people-outline"
              size={20}
              color="#FF6347"
              style={styles.pickerIcon}
            />
            <Picker
              selectedValue={selectedStudent}
              onValueChange={(value) => setSelectedStudent(value)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona un alumno" value="" />
              {students.map((student) => (
                <Picker.Item
                  key={student.id}
                  label={student.name || student.email || "Alumno sin nombre"}
                  value={student.id}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="clipboard-outline" size={20} color="#FF6347" />
            <TextInput
              style={styles.input}
              placeholder="Descripción de la lesión"
              value={injuryDescription}
              onChangeText={setInjuryDescription}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="create-outline" size={20} color="#FF6347" />
            <TextInput
              style={styles.input}
              placeholder="Notas del entrenador"
              value={trainerNotes}
              onChangeText={setTrainerNotes}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleRecordInjury}
          >
            <Text style={styles.buttonText}>Registrar Lesión</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.listButton} onPress={fetchInjuriesList}>
        <Text style={styles.buttonText}>
          {mostrarLista ? "Ocultar Lista de Lesiones" : "Ver Lista de Lesiones"}
        </Text>
      </TouchableOpacity>

      {mostrarLista && (
        <FlatList
          data={injuriesList}
          keyExtractor={(item) => item.id}
          renderItem={renderInjury}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
    color: "#FF6347",
    fontWeight: "bold",
  },
  formContainer: {
    width: "100%",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  picker: {
    flex: 1,
    marginLeft: 10,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "#333",
  },
  recordButton: {
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  listButton: {
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  list: {
    marginTop: 20,
  },
  injuryContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  injuryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    color: "#888",
  },
  noStudentsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 18,
    marginTop: 20,
  },
});

export default RecordInjuriesScreen;

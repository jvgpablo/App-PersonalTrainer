import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { db } from "../../config/firebaseConfig";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";

const ManageRoutinesScreen = ({ route }) => {
  const { trainerId } = route.params || {};
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [routineType, setRoutineType] = useState("");
  const [predefinedRoutines, setPredefinedRoutines] = useState([]);
  const [selectedPredefinedRoutines, setSelectedPredefinedRoutines] = useState(
    []
  );
  const [customRoutine, setCustomRoutine] = useState({
    area: "",
    nombre: "",
    repeticiones: "",
    series: "",
    peso: "",
  });
  const [newPredefinedRoutine, setNewPredefinedRoutine] = useState({
    area: "",
    nombre: "",
    repeticiones: "",
    series: "",
    peso: "",
  });
  const [showCreatePredefined, setShowCreatePredefined] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trainerDoc = await getDoc(doc(db, "usuarios", trainerId));
        if (trainerDoc.exists()) {
          const assignedStudents = trainerDoc.data().listaDeAlumnos || [];
          const studentsData = await Promise.all(
            assignedStudents.map(async (studentId) => {
              const studentDoc = await getDoc(doc(db, "usuarios", studentId));
              if (studentDoc.exists()) {
                return {
                  id: studentId,
                  nombre: studentDoc.data().name || "Alumno sin nombre",
                };
              }
              return null;
            })
          );
          setStudents(studentsData.filter((student) => student !== null));
        }

        const predefinedSnapshot = await getDocs(
          collection(db, "ejerciciosPredefinidos")
        );
        const predefinedData = predefinedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPredefinedRoutines(predefinedData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Alert.alert("Error", "No se pudo cargar la información.");
      }
    };

    fetchData();
  }, [trainerId]);

  const handleAssignPredefinedRoutines = async () => {
    if (!selectedStudent || selectedPredefinedRoutines.length === 0) {
      Alert.alert(
        "Error",
        "Seleccione un alumno y al menos una rutina predefinida."
      );
      return;
    }

    try {
      const routinesToSave = selectedPredefinedRoutines.map((id) =>
        predefinedRoutines.find((routine) => routine.id === id)
      );

      await addDoc(collection(db, "usuarios", selectedStudent, "routine"), {
        routineName: "Rutinas Predefinidas",
        exercises: routinesToSave,
        startDate: new Date(),
      });

      Alert.alert("Éxito", "Rutinas predefinidas asignadas al alumno.");
      setSelectedPredefinedRoutines([]);
    } catch (error) {
      console.error("Error al asignar rutinas predefinidas:", error);
      Alert.alert("Error", "No se pudo asignar las rutinas.");
    }
  };

  const handleCreateCustomRoutine = async () => {
    if (!selectedStudent || !customRoutine.nombre || !customRoutine.area) {
      Alert.alert("Error", "Complete todos los campos y seleccione un alumno.");
      return;
    }

    try {
      await addDoc(collection(db, "usuarios", selectedStudent, "routine"), {
        routineName: customRoutine.nombre,
        exercises: [customRoutine],
        startDate: new Date(),
      });

      Alert.alert("Éxito", "Rutina personalizada asignada al alumno.");
      setCustomRoutine({
        area: "",
        nombre: "",
        repeticiones: "",
        series: "",
        peso: "",
      });
    } catch (error) {
      console.error("Error al asignar rutina personalizada:", error);
      Alert.alert("Error", "No se pudo asignar la rutina personalizada.");
    }
  };

  const handleCreatePredefinedRoutine = async () => {
    if (
      !newPredefinedRoutine.area ||
      !newPredefinedRoutine.nombre ||
      !newPredefinedRoutine.repeticiones ||
      !newPredefinedRoutine.series ||
      !newPredefinedRoutine.peso
    ) {
      Alert.alert("Error", "Complete todos los campos para crear la rutina.");
      return;
    }

    try {
      await addDoc(
        collection(db, "ejerciciosPredefinidos"),
        newPredefinedRoutine
      );
      Alert.alert("Éxito", "Rutina predefinida creada con éxito.");
      setNewPredefinedRoutine({
        area: "",
        nombre: "",
        repeticiones: "",
        series: "",
        peso: "",
      });
      setShowCreatePredefined(false);

      // Recargar rutinas predefinidas
      const predefinedSnapshot = await getDocs(
        collection(db, "ejerciciosPredefinidos")
      );
      const predefinedData = predefinedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPredefinedRoutines(predefinedData);
    } catch (error) {
      console.error("Error al crear rutina predefinida:", error);
      Alert.alert("Error", "No se pudo crear la rutina predefinida.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gestión de Rutinas</Text>

      <TouchableOpacity
        style={styles.createPredefinedButton}
        onPress={() => setShowCreatePredefined(!showCreatePredefined)}
      >
        <Text style={styles.buttonText}>
          {showCreatePredefined
            ? "Cancelar Crear Rutina Predefinida"
            : "Crear Rutina Predefinida Nueva"}
        </Text>
      </TouchableOpacity>

      {showCreatePredefined && (
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Crear Rutina Predefinida</Text>
          <TextInput
            style={styles.input}
            placeholder="Área"
            value={newPredefinedRoutine.area}
            onChangeText={(text) =>
              setNewPredefinedRoutine({ ...newPredefinedRoutine, area: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={newPredefinedRoutine.nombre}
            onChangeText={(text) =>
              setNewPredefinedRoutine({ ...newPredefinedRoutine, nombre: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Repeticiones"
            keyboardType="numeric"
            value={newPredefinedRoutine.repeticiones}
            onChangeText={(text) =>
              setNewPredefinedRoutine({
                ...newPredefinedRoutine,
                repeticiones: text,
              })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Series"
            keyboardType="numeric"
            value={newPredefinedRoutine.series}
            onChangeText={(text) =>
              setNewPredefinedRoutine({ ...newPredefinedRoutine, series: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Peso (kg)"
            keyboardType="numeric"
            value={newPredefinedRoutine.peso}
            onChangeText={(text) =>
              setNewPredefinedRoutine({ ...newPredefinedRoutine, peso: text })
            }
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleCreatePredefinedRoutine}
          >
            <Text style={styles.buttonText}>Guardar Rutina Predefinida</Text>
          </TouchableOpacity>
        </View>
      )}

      <Picker
        selectedValue={selectedStudent}
        onValueChange={setSelectedStudent}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione un alumno" value="" />
        {students.map((student) => (
          <Picker.Item
            key={student.id}
            label={student.nombre}
            value={student.id}
          />
        ))}
      </Picker>

      <Picker
        selectedValue={routineType}
        onValueChange={setRoutineType}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione tipo de rutina" value="" />
        <Picker.Item label="Rutina Predefinida" value="predefined" />
        <Picker.Item label="Rutina Personalizada" value="custom" />
      </Picker>

      {routineType === "predefined" && (
        <>
          <Text style={styles.subtitle}>Seleccionar Rutinas Predefinidas</Text>
          {predefinedRoutines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={[
                styles.routineButton,
                selectedPredefinedRoutines.includes(routine.id) &&
                  styles.selectedRoutine,
              ]}
              onPress={() => {
                if (selectedPredefinedRoutines.includes(routine.id)) {
                  setSelectedPredefinedRoutines((prev) =>
                    prev.filter((id) => id !== routine.id)
                  );
                } else {
                  setSelectedPredefinedRoutines((prev) => [
                    ...prev,
                    routine.id,
                  ]);
                }
              }}
            >
              <Text style={styles.routineText}>
                {routine.nombre} - {routine.area}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAssignPredefinedRoutines}
          >
            <Text style={styles.buttonText}>Guardar Rutinas Predefinidas</Text>
          </TouchableOpacity>
        </>
      )}

      {routineType === "custom" && (
        <>
          <Text style={styles.subtitle}>Crear Rutina Personalizada</Text>
          <TextInput
            style={styles.input}
            placeholder="Área"
            value={customRoutine.area}
            onChangeText={(text) =>
              setCustomRoutine({ ...customRoutine, area: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={customRoutine.nombre}
            onChangeText={(text) =>
              setCustomRoutine({ ...customRoutine, nombre: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Repeticiones"
            keyboardType="numeric"
            value={customRoutine.repeticiones}
            onChangeText={(text) =>
              setCustomRoutine({ ...customRoutine, repeticiones: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Series"
            keyboardType="numeric"
            value={customRoutine.series}
            onChangeText={(text) =>
              setCustomRoutine({ ...customRoutine, series: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Peso (kg)"
            keyboardType="numeric"
            value={customRoutine.peso}
            onChangeText={(text) =>
              setCustomRoutine({ ...customRoutine, peso: text })
            }
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleCreateCustomRoutine}
          >
            <Text style={styles.buttonText}>Guardar Rutina Personalizada</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 18, marginBottom: 10 },
  picker: { marginBottom: 15, backgroundColor: "#f9f9f9" },
  input: { marginBottom: 15, padding: 10, backgroundColor: "#f9f9f9" },
  createPredefinedButton: {
    padding: 15,
    backgroundColor: "#3CB371",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButton: {
    padding: 15,
    backgroundColor: "#FF6347",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  routineButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
  },
  routineText: { fontSize: 16 },
  selectedRoutine: { backgroundColor: "#FFD700" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  formContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
});

export default ManageRoutinesScreen;

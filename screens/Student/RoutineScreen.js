import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { db, auth } from "../../config/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const RoutineScreen = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutines = async () => {
      setLoading(true);
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("Usuario no autenticado.");

        const routineSnapshot = await getDocs(
          collection(db, "usuarios", userId, "routine")
        );
        const routineData = routineSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRoutines(routineData);
      } catch (error) {
        console.error("Error al obtener rutinas:", error);
        Alert.alert("Error", "No se pudieron cargar las rutinas.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  const markAsCompleted = async (routineId) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("Usuario no autenticado.");

      const routineRef = doc(db, "usuarios", userId, "routine", routineId);
      await updateDoc(routineRef, { completed: true });

      setRoutines((prevRoutines) =>
        prevRoutines.map((routine) =>
          routine.id === routineId ? { ...routine, completed: true } : routine
        )
      );

      Alert.alert("Éxito", "¡Rutina marcada como completada!");
    } catch (error) {
      console.error("Error al marcar rutina como completada:", error);
      Alert.alert("Error", "No se pudo marcar la rutina como completada.");
    }
  };

  const renderExercise = (exercise, index) => (
    <View key={index} style={styles.exerciseContainer}>
      <Text style={styles.exerciseText}>
        Área: {exercise.area || "No especificado"}
      </Text>
      <Text style={styles.exerciseText}>
        Nombre: {exercise.name || "No especificado"}
      </Text>
      <Text style={styles.exerciseText}>
        Repeticiones: {exercise.repetitions || "No especificado"}
      </Text>
      <Text style={styles.exerciseText}>
        Series: {exercise.sets || "No especificado"}
      </Text>
      <Text style={styles.exerciseText}>
        Peso: {exercise.weight || "No especificado"} kg
      </Text>
    </View>
  );

  const renderRoutine = ({ item }) => (
    <View style={styles.routineContainer}>
      <Text style={styles.routineText}>
        Nombre de Rutina: {item.routineName || "No especificado"}
      </Text>
      <Text style={styles.routineText}>
        Fecha de Inicio:{" "}
        {item.startDate?.toDate().toLocaleDateString() || "No especificada"}
      </Text>
      <Text style={styles.routineText}>
        Estado: {item.completed ? "Completada" : "Pendiente"}
      </Text>

      <Text style={styles.exerciseTitle}>Ejercicios:</Text>
      {item.exercises && item.exercises.length > 0 ? (
        item.exercises.map(renderExercise)
      ) : (
        <Text style={styles.noExercisesText}>
          No hay ejercicios en esta rutina.
        </Text>
      )}

      {!item.completed && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => markAsCompleted(item.id)}
        >
          <Text style={styles.buttonText}>Rutina Completada</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rutinas</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FF6347" />
      ) : routines.length > 0 ? (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          renderItem={renderRoutine}
        />
      ) : (
        <Text style={styles.noRoutinesText}>No hay rutinas disponibles.</Text>
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
  routineContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  routineText: {
    fontSize: 16,
    marginBottom: 5,
  },
  exerciseTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  exerciseContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  exerciseText: {
    fontSize: 14,
    color: "#555",
  },
  completeButton: {
    marginTop: 15,
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  noRoutinesText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#888",
  },
  noExercisesText: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    marginTop: 10,
  },
});

export default RoutineScreen;

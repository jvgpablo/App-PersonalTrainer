import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { db, auth } from "../../config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import backgroundImage from "../../assets/motivacion.png";

const ProgressScreen = () => {
  const [completedRoutines, setCompletedRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompletedRoutines = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("Usuario no autenticado.");

      const progressSnapshot = await getDocs(
        collection(db, "usuarios", userId, "progress")
      );

      const routines = progressSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCompletedRoutines(routines);
    } catch (error) {
      console.error("Error al obtener rutinas completadas:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCompletedRoutines();
    }, [])
  );

  const renderRoutine = (routine) => (
    <View key={routine.id} style={styles.routineContainer}>
      <Text style={styles.routineText}>
        <Text style={styles.label}>Nombre de Rutina: </Text>
        {routine.routineName || "No especificado"}
      </Text>
      <Text style={styles.routineText}>
        <Text style={styles.label}>Ejercicios:</Text>
      </Text>
      {routine.exercises && routine.exercises.length > 0 ? (
        routine.exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseContainer}>
            <Text style={styles.exerciseText}>
              Área: {exercise.area || "No especificado"}
            </Text>
            <Text style={styles.exerciseText}>
              Nombre: {exercise.nombre || "No especificado"}
            </Text>
            <Text style={styles.exerciseText}>
              Repeticiones: {exercise.repeticiones || "No especificado"}
            </Text>
            <Text style={styles.exerciseText}>
              Series: {exercise.series || "No especificado"}
            </Text>
            <Text style={styles.exerciseText}>
              Peso: {exercise.peso || "No especificado"} kg
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noExercisesText}>No hay ejercicios.</Text>
      )}
    </View>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Progreso del Alumno</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#FFD700" />
        ) : (
          <>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                Rutinas Completadas: {completedRoutines.length}
              </Text>
            </View>
            {completedRoutines.length > 0 ? (
              completedRoutines.map(renderRoutine)
            ) : (
              <Text style={styles.noDataText}>
                No hay rutinas completadas disponibles.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  summaryContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  summaryText: {
    fontSize: 20,
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
    color: "#333",
  },
  label: {
    fontWeight: "bold",
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
  noExercisesText: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    marginTop: 10,
  },
  noDataText: {
    textAlign: "center",
    marginTop: 20,
    color: "#fff",
    fontSize: 18,
    fontStyle: "italic",
  },
});

export default ProgressScreen;

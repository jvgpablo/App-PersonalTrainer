import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
} from "react-native";
import {
  VictoryChart,
  VictoryBar,
  VictoryLine,
  VictoryTheme,
} from "victory-native";
import { db, auth } from "../../config/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import backgroundImage from "../../assets/motivacion.png";

const ProgressScreen = () => {
  const [progressData, setProgressData] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch progress data and routines
  useEffect(() => {
    const fetchProgressAndRoutines = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("Usuario no autenticado.");

        // Fetch routine data
        const routineSnapshot = await getDocs(
          collection(db, "usuarios", userId, "routine")
        );
        const routines = routineSnapshot.docs.map((doc) => doc.data());
        const completed = routines.filter(
          (routine) => routine.completed
        ).length;
        const total = routines.length;

        setCompletedCount(completed);
        setTotalCount(total);

        // Fetch progress data for the last 4 weeks
        const progressQuery = query(
          collection(db, "usuarios", userId, "progress"),
          where(
            "date",
            ">=",
            new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000)
          ) // Últimas 4 semanas
        );
        const progressSnapshot = await getDocs(progressQuery);
        const data = {};

        progressSnapshot.forEach((doc) => {
          const progress = doc.data();
          const week = `Semana ${getWeekNumber(progress.date.toDate())}`;

          if (!data[week]) {
            data[week] = { semana: week, Piernas: 0, Cardio: 0, Fuerza: 0 };
          }
          data[week][progress.area] += progress.volume;
        });

        const processedData = Object.values(data).map((weekData) => ({
          ...weekData,
          totalVolume: weekData.Piernas + weekData.Cardio + weekData.Fuerza,
        }));

        setProgressData(processedData);
      } catch (error) {
        console.error("Error fetching progress and routines:", error);
      }
    };

    fetchProgressAndRoutines();
  }, []);

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Progreso del Alumno</Text>

        {/* Mostrar Rutinas Completadas/Total */}
        <View style={styles.routinesContainer}>
          <Text style={styles.routinesText}>
            Rutinas Completadas: {completedCount}/{totalCount}
          </Text>
        </View>

        {progressData.length > 0 ? (
          <View>
            <Text style={styles.chartTitle}>
              Volumen de Entrenamiento Semanal
            </Text>
            <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
              <VictoryBar
                data={progressData}
                x="semana"
                y="totalVolume"
                style={{ data: { fill: "#FF6347" } }}
              />
            </VictoryChart>

            <Text style={styles.chartTitle}>Progreso en Cardio</Text>
            <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
              <VictoryLine
                data={progressData}
                x="semana"
                y="Cardio"
                style={{ data: { stroke: "#FFD700", strokeWidth: 3 } }}
              />
            </VictoryChart>

            <Text style={styles.chartTitle}>Progreso en Fuerza</Text>
            <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
              <VictoryLine
                data={progressData}
                x="semana"
                y="Fuerza"
                style={{ data: { stroke: "#3CB371", strokeWidth: 3 } }}
              />
            </VictoryChart>
          </View>
        ) : (
          <Text style={styles.noDataText}></Text>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

// Helper function to get week number
const getWeekNumber = (date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - startOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
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
  routinesContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  routinesText: {
    fontSize: 20,
    color: "#FF6347",
    fontWeight: "bold",
  },
  chartTitle: {
    fontSize: 20,
    marginTop: 20,
    textAlign: "center",
    color: "#FFD700",
    fontWeight: "bold",
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

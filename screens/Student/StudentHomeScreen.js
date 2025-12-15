import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { auth } from "../../config/firebaseConfig";
import ProgressScreen from "./ProgressScreen";
import RoutineScreen from "./RoutineScreen";
import InjuryScreen from "./InjuryScreen";
import SettingsScreen from "./SettingsScreen";

const Tab = createBottomTabNavigator();

// Modificamos WelcomeScreen para recibir 'navigation' y mostrar el botón
const WelcomeScreen = ({ navigation }) => (
  <View style={styles.welcomeContainer}>
    <Text style={styles.welcomeText}>
      ¡Bienvenido a tu panel de estudiante!
    </Text>

    <TouchableOpacity
      style={styles.editButton}
      onPress={() => navigation.navigate("EditProfile")}
    >
      <Text style={styles.editButtonText}>Editar Mis Datos</Text>
    </TouchableOpacity>
  </View>
);

const StudentHomeScreen = () => {
  const studentId = auth.currentUser?.uid; // Obtén el UID directamente del usuario autenticado.

  if (!studentId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Usuario no autenticado.</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Inicio")
            iconName = focused ? "home" : "home-outline";
          if (route.name === "Progreso")
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          if (route.name === "Rutinas")
            iconName = focused ? "barbell" : "barbell-outline";
          if (route.name === "Lesiones")
            iconName = focused ? "bandage" : "bandage-outline";
          if (route.name === "Ajustes")
            iconName = focused ? "settings" : "settings-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Progreso"
        children={() => <ProgressScreen studentId={studentId} />}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Rutinas"
        children={() => <RoutineScreen studentId={studentId} />}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Lesiones"
        component={InjuryScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  welcomeText: {
    fontSize: 20,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#ff6f00",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 18,
  },
});

export default StudentHomeScreen;
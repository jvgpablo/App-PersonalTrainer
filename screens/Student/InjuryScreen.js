import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { db, auth } from "../../config/firebaseConfig";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

const InjuryScreen = () => {
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInjury, setSelectedInjury] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchInjuries = async () => {
      try {
        const userId = auth.currentUser?.uid; // Obtén el UID del usuario autenticado.
        if (!userId) {
          throw new Error("Usuario no autenticado.");
        }

        const injurySnapshot = await getDocs(
          collection(db, "usuarios", userId, "injuries")
        );
        const injuriesData = injurySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setInjuries(injuriesData);
      } catch (error) {
        console.error("Error fetching injuries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInjuries();
  }, []);

  const agregarComentario = async () => {
    if (!selectedInjury || !newComment) {
      Alert.alert("Error", "Selecciona una lesión y escribe un comentario.");
      return;
    }

    try {
      const lesionRef = doc(
        db,
        `usuarios/${auth.currentUser.uid}/injuries`,
        selectedInjury.id
      );
      const comentariosActuales = selectedInjury.comments || [];
      await updateDoc(lesionRef, {
        comments: [
          ...comentariosActuales,
          { autor: "student", texto: newComment },
        ],
      });

      // Actualiza localmente los comentarios
      setInjuries((prevInjuries) =>
        prevInjuries.map((injury) =>
          injury.id === selectedInjury.id
            ? {
                ...injury,
                comments: [
                  ...comentariosActuales,
                  { autor: "student", texto: newComment },
                ],
              }
            : injury
        )
      );

      Alert.alert("Éxito", "Comentario agregado.");
      setNewComment("");
      setSelectedInjury(null);
    } catch (error) {
      console.error("Error al agregar comentario:", error);
    }
  };

  const renderInjury = ({ item }) => (
    <View style={styles.injuryContainer}>
      <Text style={styles.injuryText}>
        Fecha:{" "}
        {item.date?.toDate().toLocaleDateString() || "Fecha no disponible"}
      </Text>
      <Text style={styles.injuryText}>Descripción: {item.description}</Text>
      <Text style={styles.injuryText}>Estado: {item.status}</Text>
      <Text style={styles.injuryText}>
        Notas del Entrenador: {item.trainerNotes || "Sin notas"}
      </Text>
      <Text style={styles.injuryText}>
        Comentarios: {item.comments?.length > 0 ? "" : "No hay comentarios."}
      </Text>
      {item.comments?.map((comment, index) => (
        <Text key={index} style={styles.comment}>
          - {comment.autor}: {comment.texto}
        </Text>
      ))}
      <Button
        title="Agregar Comentario"
        onPress={() => setSelectedInjury(item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Lesiones</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : injuries.length > 0 ? (
        <>
          <FlatList
            data={injuries}
            keyExtractor={(item) => item.id}
            renderItem={renderInjury}
            style={styles.list}
          />
          {selectedInjury && (
            <View style={styles.commentBox}>
              <Text style={styles.commentPrompt}>
                Agregar comentario para: {selectedInjury.description}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu comentario..."
                value={newComment}
                onChangeText={setNewComment}
              />
              <Button title="Enviar" onPress={agregarComentario} />
            </View>
          )}
        </>
      ) : (
        <Text style={styles.noInjuriesText}>
          No hay lesiones registradas. ¡Sigue entrenando de forma segura!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  injuryContainer: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  injuryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  comment: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  noInjuriesText: {
    textAlign: "center",
    marginTop: 20,
  },
  commentBox: {
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    marginTop: 20,
  },
  commentPrompt: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default InjuryScreen;

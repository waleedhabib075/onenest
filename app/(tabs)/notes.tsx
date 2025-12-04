import { NotesStorage, StoredNote } from "@/lib/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Note = StoredNote;

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      NotesStorage.load().then((saved) => {
        if (isActive && saved && Array.isArray(saved)) {
          setNotes(saved);
        }
      });
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleAddNote = async () => {
    router.push("/note-editor");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Notes</Text>

        <View style={styles.inputCard}>
          <Text style={styles.cardLabel}>
            Capture ideas, lists and reminders.
          </Text>
          <Pressable style={styles.addButton} onPress={handleAddNote}>
            <Text style={styles.addButtonText}>Add Note</Text>
          </Pressable>
        </View>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.noteCard}
              onPress={() =>
                router.push({
                  pathname: "/note-editor",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.notePreview} numberOfLines={2}>
                {item.preview}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "white",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: {
    flex: 1,
    fontSize: 16,
    color: "#475569",
    marginRight: 12,
  },
  addButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 40,
    gap: 12,
  },
  noteCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "white",
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: "#6B7280",
  },
});

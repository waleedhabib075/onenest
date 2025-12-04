import { StoredTodo, TodosStorage } from "@/lib/storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIORITIES = ["Low", "Medium", "High"] as const;
const CATEGORIES = ["Work", "Personal", "Shopping", "Health", "Other"];

export default function TodoEditor() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const editId = params.id as string | undefined;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (editId) {
      TodosStorage.load().then((saved) => {
        if (saved) {
          const found = saved.find((t) => t.id === editId);
          if (found) {
            setTitle(found.title);
            setDescription(found.description || "");
            setPriority(found.priority);
            setCategory(found.category);
            setDueDate(found.dueDate || "");
          }
        }
      });
    }
  }, [editId]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    const todos = (await TodosStorage.load()) || [];
    const now = Date.now();

    if (editId) {
      const updated = todos.map((t) =>
        t.id === editId
          ? {
              ...t,
              title: title.trim(),
              description: description.trim(),
              priority,
              category,
              dueDate: dueDate.trim() || null,
              dueDateTimestamp: dueDate.trim()
                ? new Date(dueDate).getTime()
                : null,
            }
          : t
      );
      await TodosStorage.save(updated);
    } else {
      const newTodo: StoredTodo = {
        id: `todo-${now}`,
        title: title.trim(),
        description: description.trim(),
        completed: false,
        priority,
        category,
        dueDate: dueDate.trim() || null,
        dueDateTimestamp: dueDate.trim() ? new Date(dueDate).getTime() : null,
        createdAt: now,
      };
      await TodosStorage.save([...todos, newTodo]);
    }

    router.back();
  };

  const handleDelete = async () => {
    if (!editId) return;

    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const todos = (await TodosStorage.load()) || [];
          const filtered = todos.filter((t) => t.id !== editId);
          await TodosStorage.save(filtered);
          router.back();
        },
      },
    ]);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "High":
        return "#EF4444";
      case "Medium":
        return "#F59E0B";
      case "Low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {editId ? "Edit Todo" : "New Todo"}
          </Text>
          <Pressable onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter todo title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add details..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.priorityChip,
                  priority === p && {
                    backgroundColor: getPriorityColor(p),
                    borderColor: getPriorityColor(p),
                  },
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityChipText,
                    priority === p && styles.priorityChipTextActive,
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.categoryChip,
                  category === c && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(c)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === c && styles.categoryChipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Due Date (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChangeText={setDueDate}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {editId && (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Todo</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  container: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  cancelText: {
    fontSize: 16,
    color: "#64748B",
  },
  saveText: {
    fontSize: 16,
    color: "#10B981",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  priorityChipText: {
    color: "#64748B",
    fontWeight: "500",
  },
  priorityChipTextActive: {
    color: "white",
    fontWeight: "600",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryChipActive: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  categoryChipText: {
    color: "#64748B",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  deleteButtonText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 16,
  },
});

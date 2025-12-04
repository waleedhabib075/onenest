import { StoredTodo, TodosStorage } from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Todo = StoredTodo;

export default function TodosScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      TodosStorage.load().then((saved) => {
        if (isActive && saved && Array.isArray(saved)) {
          setTodos(saved);
        }
      });
      return () => {
        isActive = false;
      };
    }, [])
  );

  const filteredTodos = useMemo(() => {
    let result = todos;
    if (filter === "active") {
      result = todos.filter((t) => !t.completed);
    } else if (filter === "completed") {
      result = todos.filter((t) => t.completed);
    }
    return result.sort((a, b) => {
      // Sort by completion, then priority, then date
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      if (a.priority !== b.priority)
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      return b.createdAt - a.createdAt;
    });
  }, [todos, filter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [todos]);

  const handleAddTodo = () => {
    router.push("/todo-editor");
  };

  const toggleComplete = async (todo: Todo) => {
    const updated = todos.map((t) =>
      t.id === todo.id ? { ...t, completed: !t.completed } : t
    );
    setTodos(updated);
    await TodosStorage.save(updated);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
      <View style={styles.container}>
        <Text style={styles.title}>Todos</Text>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#0EA5E9" }]}>
              {stats.active}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {stats.completed}
            </Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(["all", "active", "completed"] as const).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.cardLabel}>
            Organize tasks with priorities and categories.
          </Text>
          <Pressable style={styles.addButton} onPress={handleAddTodo}>
            <Text style={styles.addButtonText}>Add Todo</Text>
          </Pressable>
        </View>

        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.todoCard}
              onPress={() =>
                router.push({
                  pathname: "/todo-editor",
                  params: { id: item.id },
                })
              }
            >
              <Pressable
                style={styles.checkbox}
                onPress={() => toggleComplete(item)}
              >
                {item.completed && (
                  <Ionicons name="checkmark" size={18} color="white" />
                )}
              </Pressable>
              <View style={styles.todoContent}>
                <View style={styles.todoHeader}>
                  <Text
                    style={[
                      styles.todoTitle,
                      item.completed && styles.todoTitleCompleted,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(item.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>{item.priority}</Text>
                  </View>
                </View>
                {item.description && (
                  <Text style={styles.todoDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.todoFooter}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                  {item.dueDate && (
                    <Text style={styles.dueDateText}>Due: {item.dueDate}</Text>
                  )}
                </View>
              </View>
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
  statsCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "white",
  },
  filterChipActive: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  filterText: {
    color: "#64748B",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#4F46E5",
    fontWeight: "600",
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
    backgroundColor: "#10B981",
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
  todoCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 16,
    backgroundColor: "white",
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#10B981",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  todoContent: {
    flex: 1,
    gap: 4,
  },
  todoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  todoTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#94A3B8",
  },
  todoDescription: {
    fontSize: 14,
    color: "#64748B",
  },
  todoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  categoryText: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  dueDateText: {
    fontSize: 12,
    color: "#F59E0B",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 11,
    color: "white",
    fontWeight: "600",
  },
});

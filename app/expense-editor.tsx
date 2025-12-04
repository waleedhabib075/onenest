import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ExpensesStorage,
  StoredExpense,
  PreferencesStorage,
  StoredPreferences,
  defaultPreferences,
} from "@/lib/storage";
import {
  scheduleBudgetAlertNotification,
  scheduleExpenseLoggedNotification,
} from "@/lib/notifications";

const CATEGORY_OPTIONS = ["Food", "Bills", "Shopping", "Transport", "Other"];

export default function ExpenseEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [allExpenses, setAllExpenses] = useState<StoredExpense[]>([]);
  const [id, setId] = useState<string | undefined>(params.id);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [preferences, setPreferences] =
    useState<StoredPreferences>(defaultPreferences);

  useEffect(() => {
    PreferencesStorage.load().then((saved) => {
      if (saved) setPreferences(saved);
    });
    ExpensesStorage.load().then((saved) => {
      if (!saved) return;
      setAllExpenses(saved);

      if (params.id) {
        const existing = saved.find((e) => e.id === params.id);
        if (existing) {
          setId(existing.id);
          setLabel(existing.label);
          setAmount(existing.amount.toString());
          setCategory(existing.category || "Other");
        }
      }
    });
  }, [params.id]);

  const handleSave = async () => {
    const trimmedLabel = label.trim() || "Untitled expense";
    const parsedAmount = parseFloat(amount);
    const safeAmount = isNaN(parsedAmount) ? 0 : parsedAmount;

    let updated: StoredExpense[];
    if (id) {
      updated = allExpenses.map((e) =>
        e.id === id
          ? {
              ...e,
              label: trimmedLabel,
              amount: safeAmount,
              category,
            }
          : e
      );
    } else {
      const newId = Date.now().toString();
      const exp: StoredExpense = {
        id: newId,
        label: trimmedLabel,
        amount: safeAmount,
        category,
      };
      updated = [exp, ...allExpenses];
      setId(newId);
    }

    const newTotal = updated.reduce((sum, e) => sum + e.amount, 0);

    if (preferences.notificationsEnabled) {
      await scheduleExpenseLoggedNotification(trimmedLabel, safeAmount);
      if (preferences.budgetAlerts && newTotal >= 1000) {
        await scheduleBudgetAlertNotification(newTotal);
      }
    }

    setAllExpenses(updated);
    await ExpensesStorage.save(updated);
    router.back();
  };

  const handleDelete = async () => {
    if (!id) {
      router.back();
      return;
    }
    const updated = allExpenses.filter((e) => e.id !== id);
    setAllExpenses(updated);
    await ExpensesStorage.save(updated);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.header}>
            {id ? "Edit Expense" : "New Expense"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Label (e.g. Coffee)"
            value={label}
            onChangeText={setLabel}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount (e.g. 4.50)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORY_OPTIONS.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, category === c && styles.chipActive]}
                onPress={() => setCategory(c)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === c && styles.chipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.footerRow}>
          {id && (
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
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
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#0F172A",
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  chipActive: {
    borderColor: "#4A6CF7",
    backgroundColor: "#EFF6FF",
  },
  chipText: {
    fontSize: 14,
    color: "#4B5563",
  },
  chipTextActive: {
    color: "#1D4ED8",
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#4A6CF7",
  },
  saveText: {
    color: "white",
    fontWeight: "600",
  },
});



import {
  defaultPreferences,
  ExpensesStorage,
  PreferencesStorage,
  StoredExpense,
  StoredPreferences,
} from "@/lib/storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Expense = StoredExpense;

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [prefs, setPrefs] = useState<StoredPreferences>(defaultPreferences);
  const router = useRouter();

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const currency = prefs.currency ?? defaultPreferences.currency ?? "$";
  const budget = prefs.monthlyBudget ?? defaultPreferences.monthlyBudget ?? 0;
  const remaining = useMemo(() => budget - total, [budget, total]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach((e) => {
      const key = e.category || "Other";
      map.set(key, (map.get(key) ?? 0) + e.amount);
    });
    return Array.from(map.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [expenses]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      PreferencesStorage.load().then((saved) => {
        if (isActive && saved) {
          setPrefs({ ...defaultPreferences, ...saved });
        }
      });
      ExpensesStorage.load().then((saved) => {
        if (isActive && saved && Array.isArray(saved)) {
          setExpenses(saved);
        }
      });
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleAddExpense = () => {
    router.push("/expense-editor");
  };

  const handleExportPdf = async () => {
    if (!expenses.length) return;

    const rows = expenses
      .map(
        (e) =>
          `<tr>
            <td>${e.label}</td>
            <td>${e.category}</td>
            <td style="text-align:right;">${currency}${e.amount.toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html>
        <body style="font-family: system-ui; padding: 16px;">
          <h1>Expenses</h1>
          <p>Total: ${currency}${total.toFixed(2)}${
      budget ? ` of ${currency}${budget.toFixed(0)}` : ""
    }</p>
          <table style="width:100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th align="left">Label</th>
                <th align="left">Category</th>
                <th align="right">Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Expenses</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This month</Text>
          <Text style={styles.summaryValue}>
            {currency}
            {total.toFixed(2)}
          </Text>
          {budget > 0 && (
            <Text style={styles.budgetText}>
              of {currency}
              {budget.toFixed(0)} •{" "}
              <Text style={{ color: remaining >= 0 ? "#059669" : "#DC2626" }}>
                {remaining >= 0
                  ? `${remaining.toFixed(0)} left`
                  : `${Math.abs(remaining).toFixed(0)} over`}
              </Text>
            </Text>
          )}
        </View>

        {categoryTotals.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>By category</Text>
            {categoryTotals.map((row) => (
              <View key={row.category} style={styles.chartRow}>
                <Text style={styles.chartLabel}>{row.category}</Text>
                <View style={styles.chartBarBackground}>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        width: `${Math.min(
                          100,
                          (row.amount / (total || 1)) * 100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartValue}>
                  {currency}
                  {row.amount.toFixed(0)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.inputCard}>
          <Text style={styles.cardLabel}>
            Track every purchase and keep categories organized.
          </Text>
          <Pressable style={styles.addButton} onPress={handleAddExpense}>
            <Text style={styles.addButtonText}>Add Expense</Text>
          </Pressable>
          <Pressable style={styles.exportButton} onPress={handleExportPdf}>
            <Text style={styles.exportButtonText}>PDF</Text>
          </Pressable>
        </View>

        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.expenseRow}
              onPress={() =>
                router.push({
                  pathname: "/expense-editor",
                  params: { id: item.id },
                })
              }
            >
              <View>
                <Text style={styles.expenseLabel}>{item.label}</Text>
                <Text style={styles.expenseCategory}>{item.category}</Text>
              </View>
              <Text style={styles.expenseAmount}>
                {currency}
                {item.amount.toFixed(2)}
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
  summaryCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    backgroundColor: "white",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0F172A",
  },
  budgetText: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },
  chartCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "white",
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#0F172A",
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chartLabel: {
    width: 80,
    fontSize: 13,
    color: "#64748B",
  },
  chartBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  chartBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#38BDF8",
  },
  chartValue: {
    width: 60,
    textAlign: "right",
    fontSize: 13,
    color: "#0F172A",
  },
  inputCard: {
    borderRadius: 20,
    padding: 18,
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
    color: "#475569",
    marginRight: 12,
  },
  addButton: {
    backgroundColor: "#0EA5E9",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
  exportButton: {
    marginLeft: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#0EA5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  exportButtonText: {
    color: "#0EA5E9",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 40,
    gap: 8,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    marginBottom: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  expenseLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  expenseCategory: {
    fontSize: 13,
    color: "#94A3B8",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },
});

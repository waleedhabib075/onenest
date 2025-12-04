import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    CURRENCIES,
    PreferencesStorage,
    StoredPreferences,
    defaultPreferences,
} from "@/lib/storage";

export default function ProfileScreen() {
  const router = useRouter();
  const [preferences, setPreferences] =
    useState<StoredPreferences>(defaultPreferences);

  useEffect(() => {
    PreferencesStorage.load().then((saved) => {
      if (saved) {
        setPreferences(saved);
      }
    });
  }, []);

  const handleToggle = (key: keyof StoredPreferences) => {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    PreferencesStorage.save(next);
  };

  const handleBudgetChange = (value: string) => {
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
    const next = {
      ...preferences,
      monthlyBudget: Number.isNaN(numeric) ? undefined : numeric,
    };
    setPreferences(next);
    PreferencesStorage.save(next);
  };

  const handleCurrencyChange = (symbol: string) => {
    const next = { ...preferences, currency: symbol };
    setPreferences(next);
    PreferencesStorage.save(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Customize how OneNest works for you.
        </Text>

        {/* <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Name</Text>
              <Text style={styles.rowSubtitle}>Alex Johnson</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Email</Text>
              <Text style={styles.rowSubtitle}>alex@example.com</Text>
            </View>
          </View>
          <Pressable style={styles.vipButton}>
            <Text style={styles.vipText}>Upgrade to VIP</Text>
          </Pressable>
        </View> */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notifications</Text>
          <View style={styles.prefRow}>
            <View style={styles.prefText}>
              <Text style={styles.rowTitle}>Enable notifications</Text>
              <Text style={styles.rowSubtitle}>
                Allow reminders and alerts on this device.
              </Text>
            </View>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={() => handleToggle("notificationsEnabled")}
            />
          </View>
          <View style={styles.prefRow}>
            <View style={styles.prefText}>
              <Text style={styles.rowTitle}>Subscription alerts</Text>
              <Text style={styles.rowSubtitle}>Remind me before renewals.</Text>
            </View>
            <Switch
              value={preferences.subscriptionAlerts}
              onValueChange={() => handleToggle("subscriptionAlerts")}
            />
          </View>
          <View style={styles.prefRow}>
            <View style={styles.prefText}>
              <Text style={styles.rowTitle}>Budget alerts</Text>
              <Text style={styles.rowSubtitle}>
                Notify me when I exceed my budget.
              </Text>
            </View>
            <Switch
              value={preferences.budgetAlerts}
              onValueChange={() => handleToggle("budgetAlerts")}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Budget</Text>
          <View style={styles.prefRow}>
            <View style={styles.prefText}>
              <Text style={styles.rowTitle}>Monthly budget</Text>
              <Text style={styles.rowSubtitle}>
                Used to calculate alerts and summaries in Expenses.
              </Text>
            </View>
            <View style={styles.budgetBox}>
              <Text style={styles.currency}>{preferences.currency ?? "$"}</Text>
              <TextInput
                style={styles.budgetInput}
                keyboardType="numeric"
                value={
                  preferences.monthlyBudget != null
                    ? String(preferences.monthlyBudget)
                    : ""
                }
                onChangeText={handleBudgetChange}
              />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Currency</Text>
          <View style={styles.currencyGrid}>
            {CURRENCIES.map((curr) => (
              <Pressable
                key={curr.symbol}
                style={[
                  styles.currencyChip,
                  preferences.currency === curr.symbol &&
                    styles.currencyChipActive,
                ]}
                onPress={() => handleCurrencyChange(curr.symbol)}
              >
                <Text style={styles.currencyChipSymbol}>{curr.symbol}</Text>
                <Text
                  style={[
                    styles.currencyChipCode,
                    preferences.currency === curr.symbol &&
                      styles.currencyChipCodeActive,
                  ]}
                >
                  {curr.code}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={styles.exchangeButton}
            onPress={() => router.push("/currency-exchange")}
          >
            <Text style={styles.exchangeButtonText}>Currency Exchange</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support</Text>
          <Pressable style={styles.row}>
            <Text style={styles.rowTitle}>Help Center</Text>
          </Pressable>
          <Pressable style={styles.row}>
            <Text style={styles.rowTitle}>Contact Support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 16,
    color: "#475569",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  prefRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  prefText: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  rowSubtitle: {
    marginTop: 4,
    color: "#64748B",
  },
  vipButton: {
    borderRadius: 999,
    backgroundColor: "#F97316",
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  vipText: {
    color: "white",
    fontWeight: "600",
  },
  budgetBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 90,
    justifyContent: "flex-end",
  },
  currency: {
    color: "#64748B",
    marginRight: 4,
  },
  budgetInput: {
    minWidth: 50,
    textAlign: "right",
    color: "#0F172A",
  },
  currencyRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  currencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: 70,
    alignItems: "center",
  },
  currencyChipActive: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  currencyChipSymbol: {
    fontSize: 20,
    marginBottom: 2,
  },
  currencyChipCode: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  currencyChipCodeActive: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  currencyChipText: {
    color: "#64748B",
  },
  currencyChipTextActive: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  exchangeButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  exchangeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});

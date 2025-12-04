import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  StoredSubscription,
  SubscriptionsStorage,
} from "@/lib/storage";

type Subscription = StoredSubscription;

export default function SubscriptionsOverviewScreen() {
  const [subs, setSubs] = useState<Subscription[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      SubscriptionsStorage.load().then((saved) => {
        if (isActive && saved && Array.isArray(saved)) {
          setSubs(saved);
        }
      });
      return () => {
        isActive = false;
      };
    }, [])
  );

  const monthlyTotal = useMemo(
    () =>
      subs
        .filter((s) => s.cycle === "Monthly")
        .reduce((sum, s) => sum + parseFloat(s.price.replace(/[^0-9.]/g, "")), 0),
    [subs]
  );

  const yearlyTotal = useMemo(
    () =>
      subs
        .filter((s) => s.cycle === "Yearly")
        .reduce((sum, s) => sum + parseFloat(s.price.replace(/[^0-9.]/g, "")), 0),
    [subs]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Subscriptions overview</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Monthly</Text>
          <Text style={styles.summaryValue}>${monthlyTotal.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Yearly</Text>
          <Text style={styles.summaryValue}>${yearlyTotal.toFixed(2)}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Active subscriptions</Text>
          <Text style={styles.infoText}>{subs.length} total</Text>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  infoText: {
    marginTop: 4,
    color: "#64748B",
  },
});



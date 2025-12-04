import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  cancelNotification,
  scheduleSubscriptionReminder,
} from "@/lib/notifications";
import {
  PreferencesStorage,
  StoredPreferences,
  StoredSubscription,
  SubscriptionsStorage,
  defaultPreferences,
} from "@/lib/storage";

export default function SubscriptionEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [allSubs, setAllSubs] = useState<StoredSubscription[]>([]);
  const [id, setId] = useState<string | undefined>(params.id);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cycle, setCycle] = useState<"Monthly" | "Yearly">("Monthly");
  const [nextRenewal, setNextRenewal] = useState("");
  const [notes, setNotes] = useState("");
  const [preferences, setPreferences] =
    useState<StoredPreferences>(defaultPreferences);

  useEffect(() => {
    PreferencesStorage.load().then((saved) => {
      if (saved) setPreferences(saved);
    });
    SubscriptionsStorage.load().then((saved) => {
      if (!saved) return;
      setAllSubs(saved);

      if (params.id) {
        const existing = saved.find((s) => s.id === params.id);
        if (existing) {
          setId(existing.id);
          setName(existing.name);
          setPrice(existing.price);
          setCycle(existing.cycle);
          if (existing.nextRenewalTimestamp) {
            setNextRenewal(
              new Date(existing.nextRenewalTimestamp).toISOString().slice(0, 10)
            );
          } else {
            setNextRenewal(existing.nextRenewal);
          }
        }
      }
    });
  }, [params.id]);

  const handleSave = async () => {
    const trimmedName = name.trim() || "Untitled subscription";
    const trimmedPrice = price.trim() || "$0";
    const trimmedRenewal = nextRenewal.trim() || "Unknown";
    const nextRenewalTimestamp = !Number.isNaN(Date.parse(trimmedRenewal))
      ? Date.parse(trimmedRenewal)
      : null;

    let updated: StoredSubscription[];
    let target: StoredSubscription | undefined;
    if (id) {
      updated = allSubs.map((s) =>
        s.id === id
          ? {
              ...s,
              name: trimmedName,
              price: trimmedPrice,
              cycle,
              nextRenewal: trimmedRenewal,
              nextRenewalTimestamp,
            }
          : s
      );
      target = updated.find((s) => s.id === id);
    } else {
      const newId = Date.now().toString();
      const sub: StoredSubscription = {
        id: newId,
        name: trimmedName,
        price: trimmedPrice,
        cycle,
        nextRenewal: trimmedRenewal,
        nextRenewalTimestamp,
        notificationId: null,
      };
      updated = [sub, ...allSubs];
      setId(newId);
      target = sub;
    }

    if (target) {
      await cancelNotification(target.notificationId);
      if (
        preferences.notificationsEnabled &&
        preferences.subscriptionAlerts &&
        target.nextRenewalTimestamp
      ) {
        const notificationId = await scheduleSubscriptionReminder(target);
        target.notificationId = notificationId;
      }
    }

    setAllSubs(updated);
    await SubscriptionsStorage.save(updated);
    router.back();
  };

  const handleDelete = async () => {
    if (!id) {
      router.back();
      return;
    }
    const target = allSubs.find((s) => s.id === id);
    if (target?.notificationId) {
      await cancelNotification(target.notificationId);
    }
    const updated = allSubs.filter((s) => s.id !== id);
    setAllSubs(updated);
    await SubscriptionsStorage.save(updated);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.header}>
            {id ? "Edit Subscription" : "New Subscription"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Name (e.g. Netflix)"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Price (e.g. $9.99)"
            value={price}
            onChangeText={setPrice}
          />

          <Text style={styles.label}>Billing cycle</Text>
          <View style={styles.chipRow}>
            {(["Monthly", "Yearly"] as const).map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, cycle === c && styles.chipActive]}
                onPress={() => setCycle(c)}
              >
                <Text
                  style={[
                    styles.chipText,
                    cycle === c && styles.chipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Next renewal (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="2025-02-10"
            value={nextRenewal}
            onChangeText={setNextRenewal}
          />
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
    marginTop: 20,
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

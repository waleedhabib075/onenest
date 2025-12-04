import { StoredSubscription, SubscriptionsStorage } from "@/lib/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Subscription = StoredSubscription;

export default function SubscriptionsScreen() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const router = useRouter();

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

  const handleAddSub = () => {
    router.push("/subscription-editor");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Subscriptions</Text>

        <View style={styles.inputCard}>
          <Text style={styles.cardLabel}>
            Keep an eye on renewals, bills and memberships.
          </Text>
          <Pressable style={styles.addButton} onPress={handleAddSub}>
            <Text style={styles.addButtonText}>Add Subscription</Text>
          </Pressable>
        </View>

        <FlatList
          data={subs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.subCard}
              onPress={() =>
                router.push({
                  pathname: "/subscription-editor",
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.subHeader}>
                <Text style={styles.subName}>{item.name}</Text>
                <Text style={styles.subPrice}>{item.price}</Text>
              </View>
              <Text style={styles.subMeta}>
                {item.cycle} • Next: {item.nextRenewal}
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
    backgroundColor: "#059669",
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
  subCard: {
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
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  subName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },
  subMeta: {
    fontSize: 13,
    color: "#6B7280",
  },
});

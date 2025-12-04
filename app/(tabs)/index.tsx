import { OutlineBox } from "@/components/box/OutlineBox";
import TimeOfDayIcon from "@/components/time/TimeOfDayIcon";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  defaultPreferences,
  ExpensesStorage,
  NotesStorage,
  PreferencesStorage,
  StoredExpense,
  StoredNote,
  StoredPreferences,
  StoredSubscription,
  StoredTodo,
  SubscriptionsStorage,
  TodosStorage,
} from "@/lib/storage";

const quickActions = [
  {
    icon: "add",
    label: "Add Note",
    route: "/note-editor",
    colors: { bg: "#FDF2E9", border: "#FCD9B6", accent: "#F97316" },
  },
  {
    icon: "analytics",
    label: "Track Expense",
    route: "/expense-editor",
    colors: { bg: "#E0F2FE", border: "#BAE6FD", accent: "#0284C7" },
  },
  {
    icon: "checkmark-circle-outline",
    label: "Add Todo",
    route: "/todo-editor",
    colors: { bg: "#D1FAE5", border: "#A7F3D0", accent: "#10B981" },
  },
  {
    icon: "swap-horizontal",
    label: "Currency Exchange",
    route: "/currency-exchange",
    colors: { bg: "#EDE9FE", border: "#DDD6FE", accent: "#7C3AED" },
  },
];

type Reminder = {
  id: string;
  title: string;
  detail: string;
};

export default function index() {
  const router = useRouter();

  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [expenses, setExpenses] = useState<StoredExpense[]>([]);
  const [subs, setSubs] = useState<StoredSubscription[]>([]);
  const [todos, setTodos] = useState<StoredTodo[]>([]);
  const [prefs, setPrefs] = useState<StoredPreferences>(defaultPreferences);

  useEffect(() => {
    NotesStorage.load().then((saved) => {
      if (saved) setNotes(saved);
    });
    ExpensesStorage.load().then((saved) => {
      if (saved) setExpenses(saved);
    });
    SubscriptionsStorage.load().then((saved) => {
      if (saved) setSubs(saved);
    });
    TodosStorage.load().then((saved) => {
      if (saved) setTodos(saved);
    });
    PreferencesStorage.load().then((saved) => {
      if (saved) setPrefs({ ...defaultPreferences, ...saved });
    });
  }, []);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const currency = prefs.currency ?? defaultPreferences.currency ?? "$";

  const activeTodos = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );

  const quickStats = [
    {
      icon: "document-text",
      title: "Notes",
      subtitle: `${notes.length} saved`,
      colors: { bg: "#FDECEF", border: "#F9A8D4", accent: "#DB2777" },
      route: "/notes",
    },
    {
      icon: "checkmark-circle-outline",
      title: "Todos",
      subtitle: `${activeTodos} active`,
      colors: { bg: "#D1FAE5", border: "#A7F3D0", accent: "#10B981" },
      route: "/todos",
    },
    {
      icon: "cash",
      title: "Expenses",
      subtitle: `${currency}${totalExpenses.toFixed(0)}`,
      colors: { bg: "#ECFDF5", border: "#A7F3D0", accent: "#059669" },
      route: "/expenses",
    },
    {
      icon: "card",
      title: "Subs",
      subtitle: `${subs.length} active`,
      colors: { bg: "#EEF2FF", border: "#C7D2FE", accent: "#4F46E5" },
      route: "/subscriptions",
    },
  ];

  const reminders: Reminder[] = useMemo(() => {
    const upcomingSubs = subs
      .filter(
        (sub) =>
          sub.nextRenewalTimestamp && sub.nextRenewalTimestamp > Date.now()
      )
      .sort(
        (a, b) => (a.nextRenewalTimestamp ?? 0) - (b.nextRenewalTimestamp ?? 0)
      )
      .slice(0, 3)
      .map((sub) => ({
        id: `sub-${sub.id}`,
        title: `${sub.name} renewal`,
        detail: new Date(sub.nextRenewalTimestamp ?? 0).toDateString(),
      }));

    const upcomingNotes = notes
      .filter(
        (note) => note.reminderTimestamp && note.reminderTimestamp > Date.now()
      )
      .sort((a, b) => (a.reminderTimestamp ?? 0) - (b.reminderTimestamp ?? 0))
      .slice(0, 2)
      .map((note) => ({
        id: `note-${note.id}`,
        title: note.title,
        detail: new Date(note.reminderTimestamp ?? 0).toLocaleString(),
      }));

    return [...upcomingSubs, ...upcomingNotes];
  }, [subs, notes]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={{ flex: 1 }}>
            <TimeOfDayIcon size={42} />
            <Text style={styles.subtitle}>Stay ahead of your day</Text>
          </View>
          {/* <View style={styles.timeOfDayIconContainer}></View> */}
          {/* <View style={styles.headerTextContainer}>
            <MaterialIcons name="settings" size={28} color="#0F172A" />
          </View> */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsRow}>
            {quickStats.map((stat) => (
              <OutlineBox
                key={stat.title}
                icon={stat.icon}
                title={stat.title}
                subtitle={stat.subtitle}
                backgroundColor={stat.colors.bg}
                borderColor={stat.colors.border}
                iconColor={stat.colors.accent}
                subtitleColor={stat.colors.accent}
                style={styles.statBox}
                onPress={() => router.push(stat.route as any)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionsRow}>
            {quickActions.map((action) => (
              <OutlineBox
                key={action.label}
                icon={action.icon}
                title={action.label}
                backgroundColor={action.colors.bg}
                borderColor={action.colors.border}
                iconColor={action.colors.accent}
                subtitleColor={action.colors.accent}
                style={styles.actionBox}
                onPress={() => router.push(action.route as never)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscriptions & Expenses</Text>
          <View style={styles.doubleRow}>
            <OutlineBox
              icon="card-outline"
              title="Subscriptions"
              subtitle="Overview"
              backgroundColor="#FFF7ED"
              borderColor="#FED7AA"
              iconColor="#EA580C"
              subtitleColor="#EA580C"
              style={styles.bigBox}
              onPress={() => router.push("/subscriptions-overview")}
            />
            <OutlineBox
              icon="bar-chart"
              title="Expenses"
              subtitle="Charts"
              backgroundColor="#EEF2FF"
              borderColor="#C7D2FE"
              iconColor="#4F46E5"
              subtitleColor="#4F46E5"
              style={styles.bigBox}
              onPress={() => router.push("/expenses")}
            />
          </View>
        </View>

        {reminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            <View style={styles.reminderCard}>
              {reminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderRow}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderDetail}>{reminder.detail}</Text>
                </View>
              ))}
            </View>
          </View>
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
  scroll: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 28,
  },
  timeOfDayIconContainer: {
    justifyContent: "center",
    marginRight: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#111827",
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  headerTextContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    color: "#64748B",
    marginTop: 4,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statBox: {
    flexBasis: "48%",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionBox: {
    flexBasis: "48%",
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridBox: {
    flexBasis: "48%",
    paddingVertical: 20,
    marginBottom: 12,
  },
  doubleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    flex: 1,
    marginHorizontal: 4,
  },
  bigBox: {
    flexBasis: "48%",
    paddingVertical: 40,
  },
  reminderCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#111827",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    gap: 12,
  },
  reminderRow: {
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    paddingBottom: 8,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  reminderDetail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
});

import { OutlineBox } from "@/components/box/OutlineBox";
import TimeOfDayIcon from "@/components/time/TimeOfDayIcon";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function index() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.timeOfDayIconContainer}>
          <TimeOfDayIcon size={50} />
        </View>
        <View style={styles.headerTextContainer}>
          <MaterialIcons name="settings" size={28} color="black" />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <OutlineBox
            icon="document-text"
            title="Notes"
            subtitle="5"
            style={styles.box}
          />
          <OutlineBox
            icon="cash"
            title="Expenses"
            subtitle="$450"
            style={styles.box}
          />
          <OutlineBox
            icon="checkmark-done"
            title="Habits"
            subtitle="3"
            style={styles.box}
          />
        </View>

        <View style={styles.row}>
          <OutlineBox icon="book-outline" title="Notes" style={styles.bigBox} />
          <OutlineBox icon="card" title="Expenses" style={styles.bigBox} />
        </View>
        <View style={styles.row}>
          <OutlineBox icon="send" title="Subscriptions" style={styles.bigBox} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  timeOfDayIconContainer: {
    justifyContent: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 20,
    gap: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    flex: 1,
    marginHorizontal: 6,
  },
  bigBox: {
    flex: 1,
    paddingVertical: 30,
    marginHorizontal: 6,
  },
});

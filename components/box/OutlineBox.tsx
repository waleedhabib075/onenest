import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface Props {
  icon?: string;
  title?: string;
  subtitle?: string | number;
  style?: ViewStyle;
}

export const OutlineBox: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  style,
}) => {
  return (
    <View style={[styles.box, style]}>
      {icon && <Ionicons name={icon as any} size={24} color="black" />}
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 3,
    borderColor: "#839476",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A6CF7",
  },
});

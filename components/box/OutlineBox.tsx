import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

interface Props {
  icon?: string;
  title?: string;
  subtitle?: string | number;
  style?: ViewStyle;
  onPress?: () => void;
  backgroundColor?: string;
  borderColor?: string;
  iconColor?: string;
  titleColor?: string;
  subtitleColor?: string;
}

export const OutlineBox: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  style,
  onPress,
  backgroundColor = "white",
  borderColor = "#E2E8F0",
  iconColor = "#111827",
  titleColor = "#111827",
  subtitleColor = "#4A6CF7",
}) => {
  return (
    <Pressable
      style={[styles.box, { backgroundColor, borderColor }, style]}
      onPress={onPress}
    >
      {icon && <Ionicons name={icon as any} size={24} color={iconColor} />}
      {title && (
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      )}
      {subtitle && (
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          {subtitle}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
});

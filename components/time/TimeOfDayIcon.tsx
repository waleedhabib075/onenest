import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type TimeOfDayResult = {
  icon: IconName;
  label: string;
};

const getTimeOfDay = (): TimeOfDayResult => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { icon: "weather-sunny", label: "Morning" };
  }
  if (hour >= 12 && hour < 17) {
    return { icon: "weather-partly-cloudy", label: "Afternoon" };
  }
  if (hour >= 17 && hour < 20) {
    return { icon: "weather-sunset", label: "Evening" };
  }
  return { icon: "weather-night", label: "Night" };
};

interface Props {
  size?: number;
  color?: string;
}

const TimeOfDayIcon: React.FC<Props> = ({ size = 40, color = "#FFA726" }) => {
  const { icon, label } = getTimeOfDay();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <MaterialCommunityIcons name={icon} size={size} color={color} />
      <Text
        style={{
          marginLeft: 12,
          fontSize: 26,
          fontWeight: "bold",
          color: "black",
        }}
      >
        {label}
      </Text>
    </View>
  );
};

export default TimeOfDayIcon;

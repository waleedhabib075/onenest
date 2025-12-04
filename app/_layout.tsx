import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen name="note-editor" options={{ title: "Note" }} />
        <Stack.Screen
          name="subscription-editor"
          options={{ title: "Subscription" }}
        />
        <Stack.Screen name="expense-editor" options={{ title: "Expense" }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

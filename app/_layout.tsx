import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { LanguageProvider } from "@/context/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
// eslint-disable-next-line import/no-unresolved
import { initializeLanguage } from "@/i18n/i18n";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadLanguage = async () => {
      // Load custom fonts
      await Font.loadAsync({
        Cairo: require("@/assets/fonts/Cairo-Regular.ttf"),
        "Cairo-Bold": require("@/assets/fonts/Cairo-Bold.ttf"),
      });
      await initializeLanguage();
      setIsLoading(false);
    };

    loadLanguage();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <LanguageProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </LanguageProvider>
    </ThemeProvider>
  );
}

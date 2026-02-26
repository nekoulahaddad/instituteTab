import LanguageSwitcher from "@/components/language-switcher";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet } from "react-native";

export default function LanguageScreen() {
  return (
    <ThemedView style={styles.container}>
      <LanguageSwitcher />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

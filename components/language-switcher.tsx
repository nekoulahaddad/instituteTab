import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Colors } from "../constants/theme";
import { useLanguage } from "../context/LanguageContext";
import { useColorScheme } from "../hooks/use-color-scheme";
import { IconSymbol } from "./ui/icon-symbol";

const LanguageSwitcher: React.FC<any> = (props) => {
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(language === "en" ? "ar" : "en");
  };

  // avoid triggering the default navigation onPress handler that
  // would switch to the `language` tab. We only want to toggle the
  // language and keep the current screen.
  const { onPress, accessibilityState, ...rest } = props as any;

  const focused = accessibilityState?.selected;
  const color = focused
    ? Colors[useColorScheme() ?? "light"].tabIconSelected
    : Colors[useColorScheme() ?? "light"].tabIconDefault;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleLanguage}
      {...rest}
    >
      <IconSymbol size={24} name="globe" color={color} />
      <Text style={[styles.langLabel, { color }]}>
        {language.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  langLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});

export default LanguageSwitcher;

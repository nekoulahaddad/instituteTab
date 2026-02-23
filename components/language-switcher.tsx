import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../context/LanguageContext";

const LanguageSwitcher: React.FC = () => {
  const { language, changeLanguage, isRTL } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={toggleLanguage}>
      <View
        style={[
          styles.switcher,
          { flexDirection: isRTL ? "row-reverse" : "row" },
        ]}
      >
        <View style={[styles.option, language === "en" && styles.activeOption]}>
          <Text
            style={[styles.optionText, language === "en" && styles.activeText]}
          >
            EN
          </Text>
        </View>
        <View style={[styles.option, language === "ar" && styles.activeOption]}>
          <Text
            style={[styles.optionText, language === "ar" && styles.activeText]}
          >
            AR
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  switcher: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 2,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeOption: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeText: {
    color: "#fff",
  },
});

export default LanguageSwitcher;

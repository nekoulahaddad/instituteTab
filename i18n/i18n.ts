import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
// Translation resources
const resources = {
  en: {
    translation: en,
  },
  ar: {
    translation: ar,
  },
};

// Get stored language
const getStoredLanguage = async (): Promise<string> => {
  try {
    const language = await AsyncStorage.getItem("appLanguage");
    return language || "en"; // Default to English
  } catch (error) {
    console.error("Error getting language:", error);
    return "en";
  }
};

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export const changeLanguage = async (language: "en" | "ar") => {
  try {
    // Save language preference
    await AsyncStorage.setItem("appLanguage", language);

    // Change i18n language
    await i18n.changeLanguage(language);

    // Handle RTL for Arabic
    const isRTL = language === "ar";

    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  } catch (error) {
    console.error("Error changing language:", error);
  }
};

export const initializeLanguage = async () => {
  const language = await getStoredLanguage();

  // Set RTL based on language
  I18nManager.allowRTL(language === "ar");
  I18nManager.forceRTL(language === "ar");

  await i18n.changeLanguage(language);
};

export default i18n;

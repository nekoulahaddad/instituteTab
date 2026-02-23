import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { changeLanguage as changeAppLanguage } from "../i18n/i18n";

interface LanguageContextType {
  language: "en" | "ar";
  changeLanguage: (lang: "en" | "ar") => Promise<void>;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const storedLang = await AsyncStorage.getItem("appLanguage");
    const lang = (storedLang as "en" | "ar") || "en";
    setLanguage(lang);
    setIsRTL(lang === "ar");
  };

  const handleChangeLanguage = async (lang: "en" | "ar") => {
    await changeAppLanguage(lang);
    setLanguage(lang);
    setIsRTL(lang === "ar");
  };

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage: handleChangeLanguage, isRTL }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

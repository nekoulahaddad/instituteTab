import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { StyleSheet, useColorScheme, View } from "react-native";

import LanguageSwitcher from "../language-switcher";
import { ThemedText } from "../themed-text";

export type HeaderGradientColors = {
  light: [string, string, string];
  dark: [string, string, string];
};

type HeaderProps = {
  title: string;
  subTitle: string;
  backgroundColors?: HeaderGradientColors;
};

const defaultBackgroundColors: HeaderGradientColors = {
  light: ["#D6EEF7", "#F4FBFF", "#FFFFFF"],
  dark: ["#0D2A33", "#132329", "#151718"],
};

const Header = ({
  title,
  subTitle,
  backgroundColors = defaultBackgroundColors,
}: HeaderProps) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { isRTL } = useLanguage();
  const mutedColor = useThemeColor(
    { light: "#5B6670", dark: "#A9B4BE" },
    "icon",
  );

  const colors =
    colorScheme === "dark" ? backgroundColors.dark : backgroundColors.light;

  return (
    <View>
      <LinearGradient colors={colors} style={styles.heroContainer}>
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />

        <View
          style={[
            styles.heroTopRow,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <ThemedText type="title" style={styles.heroTitle}>
            {t(title)}
          </ThemedText>
          <LanguageSwitcher />
        </View>

        <ThemedText style={[styles.heroSubtitle, { color: mutedColor }]}>
          {t(subTitle)}
        </ThemedText>
      </LinearGradient>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  heroContainer: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  heroGlowTop: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    top: -64,
    right: -44,
    backgroundColor: "rgba(10,126,164,0.12)",
  },
  heroGlowBottom: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 999,
    bottom: -60,
    left: -38,
    backgroundColor: "rgba(10,126,164,0.08)",
  },
  heroTopRow: {
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 36,
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "88%",
  },
});

import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { StyleSheet, useColorScheme, View } from "react-native";
import LanguageSwitcher from "../language-switcher";
import { ThemedText } from "../themed-text";

const Header = ({ title, subTitle }: { title: string; subTitle: string }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { isRTL } = useLanguage();
  const mutedColor = useThemeColor(
    { light: "#5B6670", dark: "#A9B4BE" },
    "icon",
  );

  return (
    <View>
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#0D2A33", "#132329", "#151718"]
            : ["#D6EEF7", "#F4FBFF", "#FFFFFF"]
        }
        style={styles.heroContainer}
      >
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
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
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
    fontSize: 30,
    lineHeight: 36,
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "88%",
  },
  latestBadge: {
    alignSelf: "flex-start",
    marginTop: 14,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(10,126,164,0.14)",
  },
  latestBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  featuredContainer: {
    height: 242,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "#1E2428",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  featuredOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-end",
  },
  featuredTopRow: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  featuredBadge: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featuredBadgeText: {
    color: "#0A7EA4",
    fontSize: 12,
    fontWeight: "700",
  },
  featuredDate: {
    color: "#E6EEF4",
    fontSize: 12,
  },
  featuredTitle: {
    color: "#FFFFFF",
    lineHeight: 28,
    marginBottom: 6,
  },
  featuredSummary: {
    color: "#D2DEE8",
    lineHeight: 22,
    fontSize: 14,
  },
  sectionHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 2,
  },
  newsCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  newsCardImage: {
    width: "100%",
    height: 136,
  },
  newsCardBody: {
    padding: 14,
  },
  metaRow: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  metaChip: {
    borderRadius: 999,
    backgroundColor: "rgba(10,126,164,0.12)",
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  metaChipText: {
    color: "#0A7EA4",
    fontWeight: "700",
    fontSize: 12,
  },
  metaDate: {
    fontSize: 12,
  },
  newsTitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 6,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    marginTop: 30,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  emptyHint: {
    textAlign: "center",
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: "#0A7EA4",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 12,
  },
  skeletonHero: {
    height: 180,
    borderRadius: 24,
    opacity: 0.8,
  },
  skeletonCard: {
    height: 170,
    borderRadius: 20,
    opacity: 0.55,
  },
});

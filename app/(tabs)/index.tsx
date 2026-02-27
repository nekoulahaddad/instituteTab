import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View
} from "react-native";

import {
  getLatestNews,
  InstituteNews,
  LocalizedText,
} from "@/app/services/api";
import Header from "@/components/Header/Header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLanguage } from "@/context/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";

function getLocalizedValue(
  value: LocalizedText | string | undefined,
  language: "en" | "ar",
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.ar || "";
}

function formatPublishedDate(date: string, language: "en" | "ar"): string {
  const dateValue = new Date(date);
  if (Number.isNaN(dateValue.getTime())) {
    return date;
  }

  const locale = language === "ar" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateValue);
}

function NewsCard({
  item,
  language,
  isRTL,
}: {
  item: InstituteNews;
  language: "en" | "ar";
  isRTL: boolean;
}) {
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor(
    { light: "#5B6670", dark: "#A9B4BE" },
    "icon",
  );
  const cardBackground = useThemeColor(
    { light: "#FFFFFF", dark: "#1C1F22" },
    "background",
  );

  return (
    <View style={[styles.newsCard, { backgroundColor: cardBackground }]}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.newsCardImage}
          contentFit="cover"
        />
      ) : null}

      <View style={styles.newsCardBody}>
        <View
          style={[
            styles.metaRow,
            { flexDirection: isRTL ? "row-reverse" : "row" },
          ]}
        >
          <View style={styles.metaChip}>
            <ThemedText style={styles.metaChipText}>
              {getLocalizedValue(item.category, language)}
            </ThemedText>
          </View>
          <ThemedText style={[styles.metaDate, { color: mutedColor }]}>
            {formatPublishedDate(item.publishedAt, language)}
          </ThemedText>
        </View>

        <ThemedText
          type="defaultSemiBold"
          style={[styles.newsTitle, { color: textColor }]}
          numberOfLines={2}
        >
          {getLocalizedValue(item.title, language)}
        </ThemedText>

        <ThemedText
          style={[styles.newsSummary, { color: mutedColor }]}
          numberOfLines={3}
        >
          {getLocalizedValue(item.summary, language)}
        </ThemedText>
      </View>
    </View>
  );
}

function SkeletonBlock() {
  const skeletonColor = useThemeColor(
    { light: "#E8EDF2", dark: "#262A2E" },
    "icon",
  );

  return (
    <View style={styles.skeletonContainer}>
      <View style={[styles.skeletonHero, { backgroundColor: skeletonColor }]} />
      <View style={[styles.skeletonCard, { backgroundColor: skeletonColor }]} />
      <View style={[styles.skeletonCard, { backgroundColor: skeletonColor }]} />
    </View>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();

  const [news, setNews] = useState<InstituteNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor(
    { light: "#5B6670", dark: "#A9B4BE" },
    "icon",
  );

  const loadNews = useCallback(async () => {
    try {
      setError(null);
      const items = await getLatestNews();

      const sorted = [...items].sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
      setNews(sorted);
    } catch (e) {
      console.error("Home latest news error", e);
      setError(t("newsLoadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  }, [loadNews]);

  if (loading && !news.length) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <SkeletonBlock />
      </ThemedView>
    );
  }

  if (!loading && !news.length && error) {
    return (
      <ThemedView
        style={[styles.container, styles.centered, { backgroundColor }]}
      >
        <ThemedText type="subtitle">{t("newsUnavailable")}</ThemedText>
        <ThemedText style={[styles.emptyHint, { color: mutedColor }]}>
          {error}
        </ThemedText>
        <Pressable style={styles.retryButton} onPress={loadNews}>
          <ThemedText style={styles.retryButtonText}>{t("retry")}</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Header title="instituteNews" subTitle="instituteNewsSubtitle" />
        }
        renderItem={({ item }) => (
          <NewsCard item={item} language={language} isRTL={isRTL} />
        )}
        ListEmptyComponent={
          !loading && !error ? (
            <View style={styles.emptyContainer}>
              <ThemedText type="subtitle">{t("newsUnavailable")}</ThemedText>
              <ThemedText style={[styles.emptyHint, { color: mutedColor }]}>
                {t("newsUnavailableHint")}
              </ThemedText>
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
}

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

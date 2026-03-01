import {
  CatalogBranch,
  CatalogLanguage,
  CatalogLevel,
  findUserByPhone,
  getBranchesCatalog,
  getLanguagesCatalog,
  getStoredUser,
  saveStoredUser,
} from "@/app/services/api";
import Header from "@/components/Header";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import QRModal from "@/components/qr-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ModernButton from "@/components/ui/modern-button";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Image as ExpoImage } from "expo-image";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, View } from "react-native";

type UserLanguage = {
  language: string;
  level: string;
};

const findLanguageByAnyValue = (
  catalog: CatalogLanguage[],
  value: unknown,
): CatalogLanguage | undefined => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const input = value.trim().toLowerCase();
  return catalog.find((item) => {
    return (
      item._id.toLowerCase() === input ||
      item.language.en.toLowerCase() === input ||
      item.language.ar.toLowerCase() === input
    );
  });
};

const findLevelByAnyValue = (
  levels: CatalogLevel[],
  value: unknown,
): CatalogLevel | undefined => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const input = value.trim().toLowerCase();
  return levels.find((item) => {
    return (
      item._id.toLowerCase() === input ||
      item.en.toLowerCase() === input ||
      item.ar.toLowerCase() === input
    );
  });
};

const findBranchByAnyValue = (
  catalog: CatalogBranch[],
  value: unknown,
): CatalogBranch | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === "object") {
    const raw = value as any;
    const idCandidate =
      typeof raw._id === "string"
        ? raw._id
        : typeof raw.id === "string"
          ? raw.id
          : undefined;

    if (idCandidate) {
      return catalog.find((item) => item._id === idCandidate);
    }

    const nameCandidate =
      typeof raw.name?.en === "string"
        ? raw.name.en
        : typeof raw.name === "string"
          ? raw.name
          : undefined;
    if (nameCandidate) {
      return catalog.find(
        (item) => item.name.en.toLowerCase() === nameCandidate.toLowerCase(),
      );
    }
  }

  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const input = value.trim().toLowerCase();
  return catalog.find((item) => {
    return (
      item._id.toLowerCase() === input ||
      item.name.en.toLowerCase() === input ||
      item.name.ar.toLowerCase() === input ||
      item.code?.toLowerCase() === input
    );
  });
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { language: appLanguage } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [languageCatalog, setLanguageCatalog] = useState<CatalogLanguage[]>([]);
  const [branchCatalog, setBranchCatalog] = useState<CatalogBranch[]>([]);

  const mutedColor = useThemeColor(
    { light: "#5B6670", dark: "#A9B4BE" },
    "icon",
  );
  const cardBackground = useThemeColor(
    { light: "#FFFFFF", dark: "#1C1F22" },
    "background",
  );

  const checkUserStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const storedUser = await getStoredUser();

      if (!storedUser) {
        setUser(null);
        setUserStatus("not_registered");
        return;
      }

      const userByPhone = await findUserByPhone(storedUser.phone);

      if (userByPhone) {
        await saveStoredUser(userByPhone);
        setUser(userByPhone);
        setUserStatus(userByPhone.status);

        if (!userByPhone.status) {
          setUserStatus("not_registered");
        }
      }
    } catch (error: any) {
      console.error("Error checking user status:", error);
      const storedUser = await getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setUserStatus("unknown");
      } else {
        setUserStatus("error");
      }
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const loadLanguageCatalog = useCallback(async () => {
    try {
      const catalog = await getLanguagesCatalog();
      setLanguageCatalog(catalog);
    } catch (error) {
      console.error("Error loading languages catalog:", error);
    }
  }, []);

  const loadBranchCatalog = useCallback(async () => {
    try {
      const catalog = await getBranchesCatalog();
      setBranchCatalog(catalog);
    } catch (error) {
      console.error("Error loading branches catalog:", error);
    }
  }, []);

  useEffect(() => {
    loadLanguageCatalog();
  }, [loadLanguageCatalog]);

  useEffect(() => {
    loadBranchCatalog();
  }, [loadBranchCatalog]);

  useFocusEffect(
    useCallback(() => {
      checkUserStatus();
    }, [checkUserStatus]),
  );

  const getStatusMessage = () => {
    switch (userStatus) {
      case "not_registered":
        return t("notRegisteredMessage");
      case "pending":
        return t("registrationUnderReviewMessage");
      case "canceled":
        return t("registrationRejectedMessage");
      case "error":
        return t("statusCheckError");
      default:
        return t("notLoggedIn");
    }
  };

  const getBranchLabel = (rawBranch: any) => {
    const match = findBranchByAnyValue(branchCatalog, rawBranch);
    if (match) {
      return appLanguage === "ar" ? match.name.ar : match.name.en;
    }

    return t("unknownBranch");
  };

  const getStatusLabel = (status: unknown) => {
    if (typeof status !== "string" || !status.trim()) {
      return t("statuses.unknown");
    }
    return t(`statuses.${status}`, { defaultValue: status });
  };

  const getLocalizedLanguageLabel = (languageValue: string) => {
    const match = findLanguageByAnyValue(languageCatalog, languageValue);
    if (!match) {
      return languageValue;
    }
    return appLanguage === "ar" ? match.language.ar : match.language.en;
  };

  const getLocalizedLevelLabel = (languageValue: string, levelValue: string) => {
    const languageMatch = findLanguageByAnyValue(languageCatalog, languageValue);
    const levelMatch = findLevelByAnyValue(languageMatch?.levels || [], levelValue);

    if (!levelMatch) {
      return levelValue;
    }

    return appLanguage === "ar" ? levelMatch.ar : levelMatch.en;
  };

  const userLanguages = useMemo<UserLanguage[]>(() => {
    if (!Array.isArray(user?.languages)) {
      return [];
    }

    return user.languages.filter(
      (item: any) => typeof item?.language === "string" && typeof item?.level === "string",
    );
  }, [user]);

  const commonHeader = (
    <Header
      title="profileHeaderTitle"
      subTitle="profileHeaderSubtitle"
      backgroundColors={{
        light: ["#FFEED8", "#FFF7EE", "#FFFFFF"],
        dark: ["#3B261C", "#2E211C", "#151718"],
      }}
    />
  );

  if (!user || userStatus !== "approved") {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#FFF3E0", dark: "#3E2723" }}
        headerImage={
          <ExpoImage
            source={{
              uri: "https://via.placeholder.com/600x250.png?text=Profile+Header",
            }}
            style={styles.headerImage}
          />
        }
      >
        {commonHeader}
        <ThemedView style={styles.container}>
          <ThemedText style={styles.statusMessage}>
            {statusLoading ? t("loading") : getStatusMessage()}
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#FFF3E0", dark: "#3E2723" }}
      headerImage={
        <ExpoImage
          source={{
            uri: "https://via.placeholder.com/600x250.png?text=Profile+Header",
          }}
          style={styles.headerImage}
        />
      }
    >
      {commonHeader}

      <ThemedView style={styles.container}>
        <View style={[styles.profileCard, { backgroundColor: cardBackground }]}> 
          {user.profileImageUrl ? (
            <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
          ) : null}

          <ThemedText style={styles.profileName} type="title">
            {user.englishName}
          </ThemedText>
          <ThemedText style={[styles.profileSubName, { color: mutedColor }]}> 
            {user.arabicName}
          </ThemedText>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: mutedColor }]}>
                {t("phone")}
              </ThemedText>
              <ThemedText>{user.phone}</ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: mutedColor }]}>
                {t("role")}
              </ThemedText>
              <ThemedText>{t(`roles.${user.role}`)}</ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: mutedColor }]}>
                {t("branch")}
              </ThemedText>
              <ThemedText>{getBranchLabel(user.branchId)}</ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: mutedColor }]}>
                {t("status")}
              </ThemedText>
              <ThemedText>{getStatusLabel(user.status)}</ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.languagesCard, { backgroundColor: cardBackground }]}> 
          <View style={styles.languagesCardHeader}>
            <ThemedText type="subtitle">{t("languages")}</ThemedText>
            <View style={styles.languagesCountChip}>
              <ThemedText style={styles.languagesCountText}>
                {userLanguages.length}
              </ThemedText>
            </View>
          </View>

          {userLanguages.length ? (
            <View style={styles.languagesList}>
              {userLanguages.map((item, index) => (
                <View key={`${item.language}-${item.level}-${index}`} style={styles.languageTagRow}>
                  <View style={styles.languageTag}>
                    <ThemedText style={styles.languageTagText}>
                      {getLocalizedLanguageLabel(item.language)}
                    </ThemedText>
                  </View>
                  <View style={styles.levelTag}>
                    <ThemedText style={styles.levelTagText}>
                      {getLocalizedLevelLabel(item.language, item.level)}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText style={{ color: mutedColor }}>
              {t("noLanguagesAdded")}
            </ThemedText>
          )}
        </View>

        <View style={{ marginTop: 12 }}>
          <ModernButton title={t("showQR")} onPress={() => setQrVisible(true)} />
        </View>

        <QRModal
          visible={qrVisible}
          onRequestClose={() => setQrVisible(false)}
          userId={user.id || user._id || user.userId}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  container: {
    padding: 16,
    gap: 12,
  },
  profileCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 8,
    alignSelf: "center",
  },
  profileName: {
    fontSize: 24,
    lineHeight: 28,
    textAlign: "center",
  },
  profileSubName: {
    textAlign: "center",
    marginBottom: 14,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoItem: {
    width: "48%",
    borderRadius: 12,
    backgroundColor: "rgba(10,126,164,0.08)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  languagesCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  languagesCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  languagesCountChip: {
    minWidth: 30,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(10,126,164,0.16)",
    alignItems: "center",
  },
  languagesCountText: {
    color: "#0A7EA4",
    fontWeight: "700",
  },
  languagesList: {
    gap: 8,
  },
  languageTagRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(10,126,164,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(10,126,164,0.05)",
  },
  languageTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(10,126,164,0.16)",
  },
  languageTagText: {
    color: "#0A7EA4",
    fontWeight: "700",
  },
  levelTag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  levelTagText: {
    fontWeight: "700",
  },
  statusMessage: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
});

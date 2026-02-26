import { getStoredUser, saveStoredUser } from "@/app/services/api";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import QRModal from "@/components/qr-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ModernButton from "@/components/ui/modern-button";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const u = await getStoredUser();
      setUser(u);
    })();
  }, []);

  if (!user) {
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
        <ThemedView style={styles.container}>
          <ThemedText>{t("notLoggedIn")}</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  const handleSave = async () => {
    try {
      await saveStoredUser(user);
      Alert.alert(t("success"), t("profileSaved"));
    } catch (e: any) {
      Alert.alert(t("error"), e.message || t("error"));
    }
  };

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
      <ThemedView style={styles.container}>
        {user.profileImageUrl ? (
          <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
        ) : null}
        <ThemedText type="title">
          {user.englishName || user.arabicName}
        </ThemedText>
        <ThemedText>
          {t("arabicName")}: {user.arabicName}
        </ThemedText>
        <ThemedText>
          {t("englishName")}: {user.englishName}
        </ThemedText>
        <ThemedText>
          {t("phone")}: {user.phone}
        </ThemedText>
        <ThemedText>
          {t("role")}: {t(`roles.${user.role}`)}
        </ThemedText>
        <ThemedText>
          {t("level")}: {t(`levels.${user.level}`)}
        </ThemedText>
        <ThemedText>
          {t("branch")}: {user.branchId}
        </ThemedText>
        <ThemedText>
          {t("language")}: {user.language}
        </ThemedText>

        <View style={{ marginTop: 12 }}>
          <ModernButton title={t("save")} onPress={handleSave} />
        </View>

        <View style={{ marginTop: 12 }}>
          <ModernButton
            title={t("showQR")}
            onPress={() => setQrVisible(true)}
          />
        </View>

        <QRModal
          visible={qrVisible}
          onRequestClose={() => setQrVisible(false)}
          payload={{
            id: user.id || user._id || user.userId,
            ts: Date.now(),
            signature: user.publicKey || "n/a",
          }}
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
    gap: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 8,
  },
});

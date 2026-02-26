import {
  findUserByPhone,
  getStoredUser,
  saveStoredUser,
} from "@/app/services/api";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import QRModal from "@/components/qr-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ModernButton from "@/components/ui/modern-button";
import { Image as ExpoImage } from "expo-image";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<string | null>(null);

  const checkUserStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const storedUser = await getStoredUser();

      if (!storedUser) {
        // User hasn't registered yet
        setUser(null);
        setUserStatus("not_registered");
        return;
      }

      // Check status with backend
      const userByPhone = await findUserByPhone(storedUser.phone);

      if (userByPhone) {
        // Update stored user with latest data from backend
        await saveStoredUser(userByPhone);
        setUser(userByPhone);
        setUserStatus(userByPhone.status);

        // Show alert based on status
        if (!userByPhone.status) {
          setUserStatus("not_registered");
        }
      }
    } catch (error: any) {
      console.error("Error checking user status:", error);
      // If phone check fails, show stored user if available
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

  // Check status every time this tab is focused
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
  statusMessage: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
});

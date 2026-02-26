import { registerUser } from "@/app/services/api";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ModernButton from "@/components/ui/modern-button";
import SelectInput from "@/components/ui/select-input";
import {
    Branches,
    Languages,
    Levels,
    UserRoles,
    UserStatuses,
} from "@/constants/enums";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, TextInput, View } from "react-native";

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [arabicName, setArabicName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(UserRoles[0]);
  const [language, setLanguage] = useState(Languages[0]);
  const [level, setLevel] = useState(Levels[0]);
  const [branchId, setBranchId] = useState(Branches[0].id);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (
      !arabicName ||
      !englishName ||
      !role ||
      !level ||
      !branchId ||
      !language
    ) {
      Alert.alert(t("error"), t("validationError"));
      return;
    }

    const generatePublicKey = () => {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    const payload = {
      arabicName,
      englishName,
      phone,
      role,
      status: UserStatuses[0],
      language,
      level,
      branchId,
      publicKey: generatePublicKey(),
      profileImageUrl: "",
    } as any;

    try {
      setLoading(true);
      await registerUser(payload);
      Alert.alert(t("success"), t("registrationSuccess"));
      router.replace("/(tabs)/profile");
    } catch (err: any) {
      Alert.alert(t("error"), err.message || t("registrationError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E0F7FA", dark: "#004D40" }}
      headerImage={
        <Image
          source={{
            uri: "https://via.placeholder.com/600x250.png?text=Register+Header",
          }}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          {t("register")}
        </ThemedText>
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("arabicName")} *</ThemedText>
          <TextInput
            style={styles.input}
            value={arabicName}
            onChangeText={setArabicName}
            placeholder={t("arabicName")}
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("englishName")} *</ThemedText>
          <TextInput
            style={styles.input}
            value={englishName}
            onChangeText={setEnglishName}
            placeholder={t("englishName")}
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("phone")}</ThemedText>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder={t("phone")}
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("role")}</ThemedText>
          <SelectInput
            options={UserRoles.map((r) => ({
              label: t(`roles.${r}`),
              value: r,
            }))}
            selectedValue={role}
            onValueChange={(v) => setRole(v)}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("language")}</ThemedText>
          <SelectInput
            options={Languages.map((l) => ({
              label: l.toUpperCase(),
              value: l,
            }))}
            selectedValue={language}
            onValueChange={(v) => setLanguage(v)}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("level")}</ThemedText>
          <SelectInput
            options={Levels.map((lv) => ({
              label: t(`levels.${lv}`),
              value: lv,
            }))}
            selectedValue={level}
            onValueChange={(v) => setLevel(v)}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("branch")}</ThemedText>
          <SelectInput
            options={Branches.map((b) => ({ label: b.name, value: b.id }))}
            selectedValue={branchId}
            onValueChange={(v) => setBranchId(v)}
          />
        </View>

        <View style={styles.submitButton}>
          <ModernButton
            title={loading ? t("registering") : t("register")}
            onPress={handleSubmit}
            disabled={loading}
          />
        </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    gap: 16,
    padding: 16,
  },
  title: {
    paddingTop: 8,
    marginBottom: 8,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.5)",
    fontSize: 16,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 16,
  },
});

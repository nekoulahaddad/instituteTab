import { registerUser, saveStoredUser } from "@/app/services/api";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, TextInput, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import { v4 as uuidv4 } from "uuid";

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  // form state will be managed by react-hook-form
  const {
    control,
    handleSubmit: onFormSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      arabicName: "",
      englishName: "",
      phone: "",
      role: UserRoles[0],
      language: Languages[0],
      level: Levels[0],
      branchId: Branches[0].id,
    },
  });

  const phoneInputRef = useRef<PhoneInput>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("SY");
  const [loading, setLoading] = useState(false);

  const generatePublicKey = async () => {
    // Generate a persistent device ID stored in AsyncStorage
    try {
      let deviceId = await AsyncStorage.getItem("deviceId");
      if (!deviceId) {
        // First time - generate a new unique ID
        deviceId = uuidv4();
        await AsyncStorage.setItem("deviceId", deviceId);
      }
      return deviceId;
    } catch (error) {
      // Fallback if storage is unavailable
      console.warn("Could not get device ID from storage:", error);
      return uuidv4();
    }
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      status: UserStatuses[0],
      publicKey: await generatePublicKey(),
      profileImageUrl: "",
    } as any;

    try {
      setLoading(true);
      const response = await registerUser(payload);
      // Store user data for reference
      await saveStoredUser(response.user || response);
      Alert.alert(t("registrationSubmitted"), t("registrationUnderReview"));
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
          <Controller
            control={control}
            name="arabicName"
            rules={{
              required: true,
              pattern: {
                value: /^[\u0600-\u06FF\s]+$/,
                message: t("arabicNameArabicOnly"),
              },
            }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[styles.input, errors.arabicName && styles.errorInput]}
                value={value}
                onChangeText={onChange}
                keyboardType="default"
              />
            )}
          />
          {errors.arabicName && (
            <ThemedText style={styles.errorText}>
              {errors.arabicName.type === "required"
                ? t("arabicNameRequired")
                : t("arabicNameArabicOnly")}
            </ThemedText>
          )}
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("englishName")} *</ThemedText>
          <Controller
            control={control}
            name="englishName"
            rules={{
              required: true,
              pattern: {
                value: /^[A-Za-z\s]+$/,
                message: t("englishNameEnglishOnly"),
              },
            }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[styles.input, errors.englishName && styles.errorInput]}
                value={value}
                onChangeText={onChange}
                keyboardType="ascii-capable"
              />
            )}
          />
          {errors.englishName && (
            <ThemedText style={styles.errorText}>
              {errors.englishName.type === "required"
                ? t("englishNameRequired")
                : t("englishNameEnglishOnly")}
            </ThemedText>
          )}
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("phone")}</ThemedText>
          <Controller
            control={control}
            name="phone"
            rules={{
              required: true,
              validate: (value) => {
                if (!value) return true;
                const isValid = phoneInputRef.current?.isValidNumber(value);
                return isValid || t("phoneInvalid");
              },
            }}
            render={({ field: { value, onChange } }) => (
              <PhoneInput
                ref={phoneInputRef}
                defaultValue={value || ""}
                defaultCode={selectedCountryCode as any}
                layout="first"
                onChangeText={(text) => onChange(text)}
                onChangeFormattedText={(text) => onChange(text)}
                onChangeCountry={(country) =>
                  setSelectedCountryCode(country.cca2)
                }
                containerStyle={[
                  styles.phoneInputContainer,
                  errors.phone && { borderColor: "#FF3B30" },
                ]}
                textContainerStyle={styles.phoneTextContainer}
                textInputStyle={styles.phoneTextInput}
                codeTextStyle={styles.phoneCodeText}
                flagButtonStyle={styles.flagButtonStyle}
                countryPickerButtonStyle={styles.countryPickerButtonStyle}
              />
            )}
          />
          {errors.phone && (
            <ThemedText style={styles.errorText}>
              {errors.phone.type === "required"
                ? t("phoneRequired")
                : errors.phone.message || t("phoneInvalid")}
            </ThemedText>
          )}
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("role")}</ThemedText>
          <Controller
            control={control}
            name="role"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <SelectInput
                options={UserRoles.map((r) => ({
                  label: t(`roles.${r}`),
                  value: r,
                }))}
                selectedValue={value}
                onValueChange={onChange}
                error={!!errors.role}
              />
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("language")}</ThemedText>
          <Controller
            control={control}
            name="language"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <SelectInput
                options={Languages.map((l) => ({
                  label: l.toUpperCase(),
                  value: l,
                }))}
                selectedValue={value}
                onValueChange={onChange}
                error={!!errors.language}
              />
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("level")}</ThemedText>
          <Controller
            control={control}
            name="level"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <SelectInput
                options={Levels.map((lv) => ({
                  label: t(`levels.${lv}`),
                  value: lv,
                }))}
                selectedValue={value}
                onValueChange={onChange}
                error={!!errors.level}
              />
            )}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("branch")}</ThemedText>
          <Controller
            control={control}
            name="branchId"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <SelectInput
                options={Branches.map((b) => ({ label: b.name, value: b.id }))}
                selectedValue={value}
                onValueChange={onChange}
                error={!!errors.branchId}
              />
            )}
          />
        </View>

        <View style={styles.submitButton}>
          <ModernButton
            title={loading ? t("registering") : t("register")}
            onPress={onFormSubmit(handleSubmit)}
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
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 12,
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
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    backgroundColor: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlignVertical: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  errorInput: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: -6,
  },
  phoneInputContainer: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    paddingVertical: 10,
    maxWidth: "100%",
  },
  phoneTextContainer: {
    paddingVertical: 0,
    backgroundColor: "transparent",
  },
  phoneTextInput: {
    fontSize: 16,
    paddingVertical: 0,
    color: "#000",
  },
  phoneCodeText: {
    fontSize: 16,
    paddingHorizontal: 0,
    fontWeight: "600",
  },
  flagButtonStyle: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginRight: 2,
    minWidth: 28,
    maxWidth: 28,
    width: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  countryPickerButtonStyle: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginHorizontal: 0,
    width: "auto",
    justifyContent: "center",
    alignItems: "center",
  },
});

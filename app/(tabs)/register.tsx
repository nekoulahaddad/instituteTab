import {
  findUserByPhone,
  registerUser,
  saveStoredUser,
  updateRegistration,
} from "@/app/services/api";
import Header from "@/components/Header";
import If from "@/components/If";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import SignIn from "@/components/sign-in";
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
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, TextInput, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isUpdate, setIsUpdate] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // form state will be managed by react-hook-form
  const {
    control,
    handleSubmit: onFormSubmit,
    formState: { errors },
    setValue,
    reset,
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
  const [hasStoredUser, setHasStoredUser] = useState(false);

  // sign in state
  const [signInMode, setSignInMode] = useState(false);

  const loadUserData = useCallback(async () => {
    // determine if user exists in storage
    try {
      const storedUser = await AsyncStorage.getItem("user");
      setHasStoredUser(!!storedUser);
    } catch {}
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (!storedUser) {
        // No user stored, reset form
        setIsUpdate(false);
        setUserId(null);
        reset();
        return;
      }

      const user = JSON.parse(storedUser);

      // Find user by phone to get latest data
      if (user.phone) {
        const userByPhone = await findUserByPhone(user.phone);
        if (userByPhone && userByPhone.status !== "not_found") {
          // User exists, populate form with their data
          await saveStoredUser(userByPhone);

          setValue("arabicName", userByPhone.arabicName || "");
          setValue("englishName", userByPhone.englishName || "");
          setValue("phone", userByPhone.phone || "");
          setValue("role", userByPhone.role || UserRoles[0]);
          setValue("language", userByPhone.language || Languages[0]);
          setValue("level", userByPhone.level || Levels[0]);
          setValue("branchId", userByPhone.branchId || Branches[0].id);

          setUserId(userByPhone._id || userByPhone.id);
          setIsUpdate(true);
          return;
        }
      }

      // User not found on backend, but exists in storage - populate form
      setValue("arabicName", user.arabicName || "");
      setValue("englishName", user.englishName || "");
      setValue("phone", user.phone || "");
      setValue("role", user.role || UserRoles[0]);
      setValue("language", user.language || Languages[0]);
      setValue("level", user.level || Levels[0]);
      setValue("branchId", user.branchId || Branches[0].id);

      setUserId(user._id || user.id);
      setIsUpdate(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      // Load from storage at least
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setValue("arabicName", user.arabicName || "");
          setValue("englishName", user.englishName || "");
          setValue("phone", user.phone || "");
          setValue("role", user.role || UserRoles[0]);
          setValue("language", user.language || Languages[0]);
          setValue("level", user.level || Levels[0]);
          setValue("branchId", user.branchId || Branches[0].id);
          setUserId(user._id || user.id);
        }
      } catch (e) {
        console.error("Error setting stored user:", e);
      }
    }
  }, [setValue, reset]);

  // Load user data when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData]),
  );

  const handleSubmit = async (values: any) => {
    // clear sign-in when registering/updating
    setSignInMode(false);
    try {
      setLoading(true);

      if (isUpdate && userId) {
        // Update existing registration
        const payload = {
          ...values,
          profileImageUrl: "",
        };
        const response = await updateRegistration(userId, payload);
        await saveStoredUser(response.user || response);
        Alert.alert(t("success"), t("registrationUpdated"));
      } else {
        // New registration
        const payload = {
          ...values,
          status: UserStatuses[0],
          profileImageUrl: "",
        } as any;
        const response = await registerUser(payload);
        await saveStoredUser(response.user || response);
        Alert.alert(t("registrationSubmitted"), t("registrationUnderReview"));
      }

      router.replace("/(tabs)/profile");
      setHasStoredUser(true);
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
      <Header title="registerHeaderTitle" subTitle="registerHeaderSubtitle" />
      <If condition={!signInMode}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            {isUpdate ? t("updateInformation") : t("register")}
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
                  style={[
                    styles.input,
                    errors.englishName && styles.errorInput,
                  ]}
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
                  placeholder={t("phone")}
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
                  options={Branches.map((b) => ({
                    label: b.name,
                    value: b.id,
                  }))}
                  selectedValue={value}
                  onValueChange={onChange}
                  error={!!errors.branchId}
                />
              )}
            />
          </View>

          <View style={styles.submitButton}>
            <ModernButton
              title={
                loading
                  ? isUpdate
                    ? t("updating")
                    : t("registering")
                  : isUpdate
                    ? t("updateInformation")
                    : t("register")
              }
              onPress={onFormSubmit(handleSubmit)}
              disabled={loading}
            />
          </View>

          {/* sign-in workflow for users without stored account */}
          {!hasStoredUser && !signInMode && (
            <View>
              <ThemedText type="title" style={styles.orText}>
                {t("or")}
              </ThemedText>
              <ModernButton
                title={t("signIn")}
                onPress={() => {
                  setSignInMode(true);
                }}
              />
            </View>
          )}
        </ThemedView>
      </If>
      <If condition={signInMode}>
        <SignIn
          setHasStoredUser={setHasStoredUser}
          setSignInMode={setSignInMode}
        />
      </If>
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
  submitButton: {
    marginTop: 16,
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
  orText: {
    transform: [{ translateY: -4 }],
    textAlign: "center",
    paddingVertical: 8,
    fontSize: 24,
  },
});

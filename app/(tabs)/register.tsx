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
import { Branches, UserRoles } from "@/constants/enums";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";

type UserLanguageInput = {
  language: string;
  level: string;
};

type RegisterFormValues = {
  arabicName: string;
  englishName: string;
  phone: string;
  role: string;
  branchId: string;
  languages: UserLanguageInput[];
};

const AVAILABLE_LANGUAGES = [
  { value: "English", labelKey: "languageOptionEnglish" },
  { value: "Arabic", labelKey: "languageOptionArabic" },
  { value: "French", labelKey: "languageOptionFrench" },
  { value: "Turkish", labelKey: "languageOptionTurkish" },
];

const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const makeDefaultLanguage = (): UserLanguageInput => ({
  language: AVAILABLE_LANGUAGES[0].value,
  level: LANGUAGE_LEVELS[0],
});

const normalizeLanguages = (input: any): UserLanguageInput[] => {
  if (!Array.isArray(input)) {
    return [makeDefaultLanguage()];
  }

  const cleaned = input
    .map((item: any) => ({
      language: typeof item?.language === "string" ? item.language.trim() : "",
      level: typeof item?.level === "string" ? item.level.trim() : "",
    }))
    .filter((item: UserLanguageInput) => item.language && item.level);

  return cleaned.length ? cleaned : [makeDefaultLanguage()];
};

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isUpdate, setIsUpdate] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const {
    control,
    handleSubmit: onFormSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<RegisterFormValues>({
    defaultValues: {
      arabicName: "",
      englishName: "",
      phone: "",
      role: UserRoles[0],
      branchId: Branches[0].id,
      languages: [makeDefaultLanguage()],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "languages",
  });

  const watchedLanguages = watch("languages");

  const phoneInputRef = useRef<PhoneInput>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("SY");
  const [loading, setLoading] = useState(false);
  const [hasStoredUser, setHasStoredUser] = useState(false);
  const [signInMode, setSignInMode] = useState(false);

  const resetFormState = useCallback(() => {
    reset({
      arabicName: "",
      englishName: "",
      phone: "",
      role: UserRoles[0],
      branchId: Branches[0].id,
      languages: [makeDefaultLanguage()],
    });
  }, [reset]);

  const loadUserData = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      setHasStoredUser(!!storedUser);
    } catch {}

    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (!storedUser) {
        setIsUpdate(false);
        setUserId(null);
        resetFormState();
        return;
      }

      const user = JSON.parse(storedUser);

      if (user.phone) {
        const userByPhone = await findUserByPhone(user.phone);
        if (userByPhone && userByPhone.status !== "not_found") {
          await saveStoredUser(userByPhone);

          setValue("arabicName", userByPhone.arabicName || "");
          setValue("englishName", userByPhone.englishName || "");
          setValue("phone", userByPhone.phone || "");
          setValue("role", userByPhone.role || UserRoles[0]);
          setValue("branchId", userByPhone.branchId || Branches[0].id);
          replace(normalizeLanguages(userByPhone.languages));

          setUserId(userByPhone._id || userByPhone.id);
          setIsUpdate(true);
          return;
        }
      }

      setValue("arabicName", user.arabicName || "");
      setValue("englishName", user.englishName || "");
      setValue("phone", user.phone || "");
      setValue("role", user.role || UserRoles[0]);
      setValue("branchId", user.branchId || Branches[0].id);
      replace(normalizeLanguages(user.languages));

      setUserId(user._id || user.id);
      setIsUpdate(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setValue("arabicName", user.arabicName || "");
          setValue("englishName", user.englishName || "");
          setValue("phone", user.phone || "");
          setValue("role", user.role || UserRoles[0]);
          setValue("branchId", user.branchId || Branches[0].id);
          replace(normalizeLanguages(user.languages));
          setUserId(user._id || user.id);
        }
      } catch (e) {
        console.error("Error setting stored user:", e);
      }
    }
  }, [replace, resetFormState, setValue]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData]),
  );

  const handleSubmit = async (values: RegisterFormValues) => {
    setSignInMode(false);

    const payload = {
      arabicName: values.arabicName,
      englishName: values.englishName,
      phone: values.phone,
      role: values.role,
      branchId: values.branchId,
      languages: normalizeLanguages(values.languages),
      profileImageUrl: "",
    };

    try {
      setLoading(true);

      if (isUpdate && userId) {
        const response = await updateRegistration(userId, payload);
        await saveStoredUser(response.user || response);
        Alert.alert(t("success"), t("registrationUpdated"));
      } else {
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
      <Header
        title="registerHeaderTitle"
        subTitle="registerHeaderSubtitle"
        backgroundColors={{
          light: ["#E4F8ED", "#F3FFF7", "#FFFFFF"],
          dark: ["#0E2F25", "#14382E", "#151718"],
        }}
      />

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
            <ThemedText style={styles.label}>{t("phone")} *</ThemedText>
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
            <View style={styles.languagesHeader}>
              <ThemedText style={styles.label}>{t("languages")} *</ThemedText>
              <Pressable
                style={styles.addLanguageButton}
                onPress={() => append(makeDefaultLanguage())}
              >
                <ThemedText style={styles.addLanguageButtonText}>
                  + {t("addLanguage")}
                </ThemedText>
              </Pressable>
            </View>

            {fields.map((field, index) => (
              <View key={field.id} style={styles.languageRowCard}>
                <View style={styles.languageRowTop}>
                  <ThemedText type="defaultSemiBold">
                    {t("languageEntry", { index: index + 1 })}
                  </ThemedText>
                  <Pressable
                    disabled={fields.length === 1}
                    onPress={() => {
                      if (fields.length > 1) remove(index);
                    }}
                    style={[
                      styles.removeLanguageButton,
                      fields.length === 1 &&
                        styles.removeLanguageButtonDisabled,
                    ]}
                  >
                    <ThemedText style={styles.removeLanguageButtonText}>
                      {t("remove")}
                    </ThemedText>
                  </Pressable>
                </View>

                <Controller
                  control={control}
                  name={`languages.${index}.language`}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <SelectInput
                      options={AVAILABLE_LANGUAGES.map((option) => ({
                        label: t(option.labelKey),
                        value: option.value,
                      }))}
                      selectedValue={value}
                      onValueChange={onChange}
                      error={!!(errors.languages as any)?.[index]?.language}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name={`languages.${index}.level`}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <SelectInput
                      options={LANGUAGE_LEVELS.map((level) => ({
                        label: level,
                        value: level,
                      }))}
                      selectedValue={value}
                      onValueChange={onChange}
                      error={!!(errors.languages as any)?.[index]?.level}
                    />
                  )}
                />
              </View>
            ))}

            {!watchedLanguages?.length ? (
              <ThemedText style={styles.errorText}>
                {t("languagesRequired")}
              </ThemedText>
            ) : null}
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
                    label: t(`branches.${b.name}`),
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
    minWidth: "100%",
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
  languagesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addLanguageButton: {
    backgroundColor: "rgba(10,126,164,0.13)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addLanguageButtonText: {
    color: "#0A7EA4",
    fontWeight: "700",
    fontSize: 12,
  },
  languageRowCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 10,
    gap: 8,
  },
  languageRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  removeLanguageButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  removeLanguageButtonDisabled: {
    opacity: 0.4,
  },
  removeLanguageButtonText: {
    color: "#D32F2F",
    fontWeight: "700",
    fontSize: 12,
  },
  orText: {
    transform: [{ translateY: -4 }],
    textAlign: "center",
    paddingVertical: 8,
    fontSize: 24,
  },
});

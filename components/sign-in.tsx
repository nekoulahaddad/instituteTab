import { ThemedText } from "@/components/themed-text";
import ModernButton from "@/components/ui/modern-button";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, TextInput, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";
import {
  saveStoredUser,
  sendVerificationCode,
  verifyCode,
} from "../app/services/api";

const SignIn = ({
  setHasStoredUser,
  setSignInMode,
}: {
  setHasStoredUser: (v: boolean) => void;
  setSignInMode: (v: boolean) => void;
}) => {
  const { t } = useTranslation();
  const [otpSent, setOtpSent] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("SY");

  const {
    control,
    handleSubmit: onFormSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      signCode: "",
      signPhone: "",
    },
  });

  const phoneInputRef = useRef<PhoneInput>(null);

  const sendOtp = async (values: any) => {
    setSignLoading(true);
    try {
      await sendVerificationCode(values.signPhone);
      setOtpSent(true);
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
    } finally {
      setSignLoading(false);
    }
  };

  const verifyOtp = async (values: any) => {
    setSignLoading(true);
    try {
      const resp = await verifyCode(values.signPhone, values.signCode);
      if (resp.user) {
        await saveStoredUser(resp.user);
        setHasStoredUser(true);
        setSignInMode(false);
        router.replace("/(tabs)/profile");
      }
    } catch (e: any) {
      Alert.alert(t("error"), e.message);
    } finally {
      setSignLoading(false);
    }
  };

  const changeSingPhone = (text: string, onChange: any) => {
    setValue("signCode", "");
    setOtpSent(false);
    onChange(text);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {t("signIn")}
      </ThemedText>
      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>{t("phone")} *</ThemedText>
        <Controller
          control={control}
          name="signPhone"
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
              onChangeText={(text) => changeSingPhone(text, onChange)}
              onChangeFormattedText={(text) => changeSingPhone(text, onChange)}
              onChangeCountry={(country) =>
                setSelectedCountryCode(country.cca2)
              }
              containerStyle={[
                styles.phoneInputContainer,
                errors.signPhone && { borderColor: "#FF3B30" },
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
        {errors.signPhone && (
          <ThemedText style={styles.errorText}>
            {errors.signPhone.type === "required"
              ? t("phoneRequired")
              : errors.signPhone.message || t("phoneInvalid")}
          </ThemedText>
        )}
      </View>
      {otpSent && (
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>{t("codeRequired")} *</ThemedText>
          <Controller
            control={control}
            name="signCode"
            rules={{
              required: true,
              pattern: {
                value: /^\d{4,6}$/,
                message: t("codeInvalid"),
              },
            }}
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[styles.input, errors.signCode && styles.errorInput]}
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                placeholder={t("verifyCode")}
              />
            )}
          />
        </View>
      )}
      <View style={styles.submitButton}>
        <ModernButton
          title={
            signLoading
              ? t("loading")
              : otpSent
                ? t("verifyCode")
                : t("sendCode")
          }
          onPress={onFormSubmit(otpSent ? verifyOtp : sendOtp)}
          disabled={signLoading}
        />
      </View>
      <View>
        <ThemedText type="title" style={styles.orText}>
          {t("or")}
        </ThemedText>
        <ModernButton
          title={t("register")}
          onPress={() => {
            setSignInMode(false);
          }}
        />
      </View>
    </View>
  );
};

export default SignIn;

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
    marginTop: 8,
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
  orText: {
    textAlign: "center",
    paddingVertical: 8,
    fontSize: 24,
  },
});

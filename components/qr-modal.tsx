import { ThemedText } from "@/components/themed-text";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ModernButton from "./ui/modern-button";

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  payload: any;
}

export default function QRModal({ visible, onRequestClose, payload }: Props) {
  const { t } = useTranslation();
  const value = JSON.stringify(payload);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <View style={styles.backdrop}>
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.6)"]}
          style={styles.gradientBackdrop}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
              <ThemedText type="title" style={styles.title}>
                {t("qrCode")}
              </ThemedText>

              <View style={styles.qrContainer}>
                <View style={styles.qrBorder}>
                  <QRCode value={value} size={200} quietZone={8} />
                </View>
              </View>

              <View style={styles.infoContainer}>
                <ThemedText style={styles.infoLabel}>
                  ID: <Text style={styles.infValue}>{payload.id}</Text>
                </ThemedText>
              </View>

              <View style={styles.actions}>
                <View style={{ flex: 1 }}>
                  <ModernButton
                    title={t("close")}
                    onPress={onRequestClose}
                    type="outline-black"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    marginBottom: 16,
    fontSize: 24,
  },
  qrContainer: {
    marginVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  qrBorder: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  infoContainer: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  infValue: {
    fontWeight: "400",
    fontSize: 12,
    color: "#666",
  },
  payloadContainer: {
    width: "100%",
    maxHeight: 120,
    marginVertical: 12,
  },
  payloadLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  payloadScroll: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 8,
    maxHeight: 100,
  },
  payloadText: {
    fontSize: 11,
    color: "#444",
    fontFamily: "monospace",
  },
  actions: {
    width: "100%",
    marginTop: 16,
    gap: 8,
  },
});

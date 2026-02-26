import { useThemeColor } from "@/hooks/use-theme-color";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { IconSymbol } from "./icon-symbol";

interface Option {
  label: string;
  value: string;
}

interface SelectInputProps {
  options: Option[];
  selectedValue: string;
  onValueChange: (v: string) => void;
  error?: boolean;
}

export default function SelectInput({
  options,
  selectedValue,
  onValueChange,
  error,
}: SelectInputProps) {
  const [visible, setVisible] = useState(false);
  const bg = useThemeColor({}, "background");
  const color = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");

  const selectedOption = options.find((o) => o.value === selectedValue);

  return (
    <>
      <TouchableOpacity
        style={[styles.button, error && styles.errorBorder]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.buttonText, { color }]}>
          {selectedOption?.label || ""}
        </Text>
        <IconSymbol name="chevron.down" size={16} color={color} />
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalContent, { backgroundColor: bg }]}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onValueChange(item.value);
                  setVisible(false);
                }}
              >
                <Text style={[styles.optionText, { color }]}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 40,
    // match text input appearance
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    position: "absolute",
    top: "30%",
    left: "5%",
    right: "5%",
    maxHeight: "50%",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  errorBorder: {
    borderColor: "#FF3B30",
  },
});

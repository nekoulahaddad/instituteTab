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
}

export default function SelectInput({
  options,
  selectedValue,
  onValueChange,
}: SelectInputProps) {
  const [visible, setVisible] = useState(false);
  const bg = useThemeColor({}, "background");
  const color = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");

  const selectedOption = options.find((o) => o.value === selectedValue);

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { borderColor: tint }]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.buttonText, { color }]}>
          {selectedOption?.label || ""}
        </Text>
        <IconSymbol name="chevron.down" size={16} color={tint} />
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
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
    paddingHorizontal: 12,
    height: 40,
  },
  buttonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    maxHeight: "40%",
    borderRadius: 8,
    paddingVertical: 8,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
  },
});

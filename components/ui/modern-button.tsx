import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Animated,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type ButtonType = "black" | "white" | "outline-black" | "outline-white";
type ButtonSize = "small" | "medium" | "large";

interface ModernButtonProps {
  title?: string;
  onPress?: () => void;
  type?: ButtonType;
  size?: ButtonSize;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}
const ModernButton = ({
  title = "Button",
  onPress,
  type = "black", // 'black', 'white', 'outline-black', 'outline-white'
  size = "medium", // 'small', 'medium', 'large'
  glow = false,
  style,
  textStyle,
}: ModernButtonProps) => {
  // Animation value
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(1);

  // Handle press animations
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      }),
      Animated.timing(opacityValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 3,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Get button styles based on type and size
  const getButtonStyles = () => {
    const baseStyles: any = [styles.button];

    // Size styles
    switch (size) {
      case "small":
        baseStyles.push(styles.buttonSmall);
        break;
      case "large":
        baseStyles.push(styles.buttonLarge);
        break;
      default:
        baseStyles.push(styles.buttonMedium);
    }

    // Type styles
    switch (type) {
      case "white":
        baseStyles.push(styles.buttonWhite);
        break;
      case "outline-black":
        baseStyles.push(styles.buttonOutlineBlack);
        break;
      case "outline-white":
        baseStyles.push(styles.buttonOutlineWhite);
        break;
      default:
        baseStyles.push(styles.buttonBlack);
    }

    return baseStyles;
  };

  // Get text styles based on type and size
  const getTextStyles = () => {
    const baseStyles: any = [styles.text];

    // Size styles
    switch (size) {
      case "small":
        baseStyles.push(styles.textSmall);
        break;
      case "large":
        baseStyles.push(styles.textLarge);
        break;
      default:
        baseStyles.push(styles.textMedium);
    }

    // Type styles
    switch (type) {
      case "white":
        baseStyles.push(styles.textBlack);
        break;
      case "outline-black":
        baseStyles.push(styles.textBlack);
        break;
      case "outline-white":
        baseStyles.push(styles.textWhite);
        break;
      default:
        baseStyles.push(styles.textWhite);
    }

    return baseStyles;
  };

  // Glow effect component
  const renderGlow = () => {
    if (!glow) return null;

    return (
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.2)",
          "rgba(255,255,255,0.1)",
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glowOverlay}
      />
    );
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <View style={getButtonStyles()}>
          <Text style={getTextStyles()}>{title}</Text>
          {renderGlow()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Sizes
  buttonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buttonMedium: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonLarge: {
    paddingVertical: 18,
    paddingHorizontal: 42,
  },
  // Color variants
  buttonBlack: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  buttonWhite: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  buttonOutlineBlack: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  buttonOutlineWhite: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  // Text styles
  text: {
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    textAlign: "center",
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  textWhite: {
    color: "#ffffff",
  },
  textBlack: {
    color: "#1a1a1a",
  },
  // Glow effect
  glowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
});

export default ModernButton;

import { View, type ViewProps } from "react-native";

import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  const { isRTL } = useLanguage();

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

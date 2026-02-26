import LanguageSwitcher from "@/components/language-switcher";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

export default function LanguageScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E8EAF6", dark: "#1A237E" }}
      headerImage={
        <Image
          source={{
            uri: "https://via.placeholder.com/600x250.png?text=Language+Header",
          }}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.container}>
        <LanguageSwitcher />
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
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

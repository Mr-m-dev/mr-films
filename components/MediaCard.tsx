import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { C } from "@/constants/colors";
import { getImageUrl } from "@/lib/tmdb";

interface MediaCardProps {
  id: number;
  type: "movie" | "tv" | "person";
  posterPath: string | null;
  width: number;
}

export function MediaCard({ id, type, posterPath, width }: MediaCardProps) {
  const scale = useSharedValue(1);
  const height = type === "person" ? width : width * (3 / 2);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === "movie") {
      router.push({ pathname: "/movie/[id]", params: { id } });
    } else if (type === "tv") {
      router.push({ pathname: "/tv/[id]", params: { id } });
    } else {
      router.push({ pathname: "/person/[id]", params: { id } });
    }
  }, [id, type]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.93, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const imageUrl = getImageUrl(posterPath, "w342");

  return (
    <Animated.View style={[animStyle, { width }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: false }}
      >
        <View style={[styles.card, { width, height, borderRadius: type === "person" ? width / 2 : 10 }]}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width, height, borderRadius: type === "person" ? width / 2 : 10 }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.placeholder, { width, height, borderRadius: type === "person" ? width / 2 : 10 }]}>
              <Ionicons
                name={type === "person" ? "person" : type === "movie" ? "film" : "tv"}
                size={32}
                color={C.textMuted}
              />
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    backgroundColor: C.surfaceAlt,
  },
  placeholder: {
    backgroundColor: C.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
});

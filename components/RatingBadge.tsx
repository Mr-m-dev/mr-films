import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/constants/colors";

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md";
}

export function RatingBadge({ rating, size = "sm" }: RatingBadgeProps) {
  const isSmall = size === "sm";
  return (
    <View style={[styles.container, isSmall ? styles.small : styles.medium]}>
      <Ionicons name="star" size={isSmall ? 10 : 13} color={C.gold} />
      <Text style={[styles.text, isSmall ? styles.textSm : styles.textMd]}>
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 6,
    gap: 3,
  },
  small: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    color: C.gold,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  textSm: { fontSize: 10 },
  textMd: { fontSize: 13 },
});

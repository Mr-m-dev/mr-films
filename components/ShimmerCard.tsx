import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { C } from "@/constants/colors";

interface ShimmerCardProps {
  width: number;
  height: number;
  borderRadius?: number;
}

export function ShimmerCard({ width, height, borderRadius = 10 }: ShimmerCardProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [C.shimmer1, C.shimmer2]
    ),
  }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius }, animStyle]}
    />
  );
}

export function ShimmerGrid({ count = 9 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerCard key={i} width={110} height={165} />
      ))}
    </View>
  );
}

export function ShimmerRow({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerCard key={i} width={110} height={165} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
  },
});

import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { MediaCard } from "./MediaCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 8;
const PADDING = 16;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3);

interface MediaItem {
  id: number;
  poster_path: string | null;
}

interface MediaGridProps {
  items: MediaItem[];
  type: "movie" | "tv" | "person";
}

export function MediaGrid({ items, type }: MediaGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <MediaCard
          key={`${type}-grid-${item.id}`}
          id={item.id}
          type={type}
          posterPath={item.poster_path}
          width={CARD_WIDTH}
        />
      ))}
    </View>
  );
}

export { CARD_WIDTH };

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    paddingHorizontal: PADDING,
  },
});

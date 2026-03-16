import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { MediaCard } from "./MediaCard";

interface MediaItem {
  id: number;
  poster_path: string | null;
}

interface MediaRowProps {
  items: MediaItem[];
  type: "movie" | "tv" | "person";
  cardWidth?: number;
}

export function MediaRow({ items, type, cardWidth = 110 }: MediaRowProps) {
  return (
    <FlatList
      data={items}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => `${type}-row-${item.id}`}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      renderItem={({ item }) => (
        <MediaCard
          id={item.id}
          type={type}
          posterPath={item.poster_path}
          width={cardWidth}
        />
      )}
      scrollEnabled={!!items.length}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
  },
});

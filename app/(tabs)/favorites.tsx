import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MediaCard } from "@/components/MediaCard";
import { C } from "@/constants/colors";
import { FavoriteItem, useFavorites } from "@/context/FavoritesContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 8;
const PADDING = 16;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3);

function FavoriteCardWrapper({ item }: { item: FavoriteItem }) {
  const { removeFavorite } = useFavorites();

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeFavorite(item.id, item.type);
  };

  return (
    <Pressable onLongPress={handleLongPress} delayLongPress={500}>
      <MediaCard
        id={item.id}
        type={item.type}
        posterPath={item.poster_path}
        width={CARD_WIDTH}
      />
    </Pressable>
  );
}

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const { favorites } = useFavorites();

  const movies = favorites.filter((f) => f.type === "movie");
  const tvShows = favorites.filter((f) => f.type === "tv");

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>المفضلة</Text>
        <Text style={styles.count}>{favorites.length} عنصر</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={64} color={C.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>لا يوجد محتوى مفضل</Text>
          <Text style={styles.emptySubtitle}>
            أضف أفلامك ومسلسلاتك المفضلة واجدها هنا
          </Text>
          <Pressable
            style={styles.browseBtn}
            onPress={() => router.push("/(tabs)/browse")}
          >
            <Text style={styles.browseBtnText}>تصفح المحتوى</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={[
            ...(movies.length > 0 ? [{ type: "section-header", label: `أفلام (${movies.length})` }] : []),
            ...movies.map(m => ({ ...m, _section: "movies" })),
            ...(tvShows.length > 0 ? [{ type: "section-header", label: `مسلسلات (${tvShows.length})` }] : []),
            ...tvShows.map(t => ({ ...t, _section: "tv" })),
          ]}
          numColumns={3}
          keyExtractor={(item: any, index) =>
            item.type === "section-header" ? `header-${index}` : `fav-${item.type}-${item.id}`
          }
          renderItem={({ item }: { item: any }) => {
            if (item.type === "section-header") {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{item.label}</Text>
                </View>
              );
            }
            return (
              <View style={{ margin: GAP / 2 }}>
                <FavoriteCardWrapper item={item as FavoriteItem} />
              </View>
            );
          }}
          columnWrapperStyle={(index) => {
            return null;
          }}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: isWeb ? 34 : insets.bottom + 80 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: C.text,
    fontFamily: "Inter_700Bold",
  },
  count: {
    fontSize: 14,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  browseBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  browseBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  sectionHeader: {
    width: "100%",
    paddingHorizontal: PADDING,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionHeaderText: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  gridContent: {
    paddingHorizontal: PADDING - GAP / 2,
  },
});

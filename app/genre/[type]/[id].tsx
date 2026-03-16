import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
import { ShimmerCard } from "@/components/ShimmerCard";
import { C } from "@/constants/colors";
import { MOVIE_GENRES, TV_GENRES } from "@/lib/genres";
import {
  getMoviesByGenrePaged,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getTVShowsByGenrePaged,
} from "@/lib/tmdb";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 8;
const PADDING = 16;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3);

function getPageTitle(type: string, id: string): string {
  if (type === "movies-popular") return "أفلام شائعة";
  if (type === "movies-top-rated") return "أعلى تقييماً - أفلام";
  if (type === "tv-popular") return "مسلسلات شائعة";
  if (type === "tv-top-rated") return "أعلى تقييماً - مسلسلات";
  if (type === "movie") {
    const genre = MOVIE_GENRES.find(g => g.id === Number(id));
    return genre ? `أفلام ${genre.nameAr}` : "أفلام";
  }
  if (type === "tv") {
    const genre = TV_GENRES.find(g => g.id === Number(id));
    return genre ? `مسلسلات ${genre.nameAr}` : "مسلسلات";
  }
  return "المحتوى";
}

export default function GenreScreen() {
  const { type, id } = useLocalSearchParams<{ type: string; id: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const title = getPageTitle(type ?? "", id ?? "");
  const mediaType = type === "movie" || type === "movies-popular" || type === "movies-top-rated" ? "movie" : "tv";

  const fetchItems = useCallback(async (pageNum: number) => {
    if (type === "movies-popular") return getPopularMovies(pageNum);
    if (type === "movies-top-rated") return getTopRatedMovies(pageNum);
    if (type === "tv-popular") return getPopularTVShows(pageNum);
    if (type === "tv-top-rated") return getTopRatedTVShows(pageNum);
    if (type === "movie") return getMoviesByGenrePaged(Number(id), pageNum);
    if (type === "tv") return getTVShowsByGenrePaged(Number(id), pageNum);
    return { results: [], total_pages: 1, page: 1 };
  }, [type, id]);

  const { isLoading } = useQuery({
    queryKey: ["genre-page", type, id, 1],
    queryFn: async () => {
      const data = await fetchItems(1);
      setAllItems(data.results);
      setHasMore((data.total_pages ?? 1) > 1);
      return data;
    },
    enabled: !!type && !!id,
  });

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await fetchItems(nextPage);
    setAllItems(prev => [...prev, ...data.results]);
    setPage(nextPage);
    setHasMore(nextPage < (data.total_pages ?? 1));
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, fetchItems]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={{ width: 38 }} />
      </View>

      {isLoading ? (
        <View style={styles.shimmerGrid}>
          {[...Array(9)].map((_, i) => (
            <ShimmerCard key={i} width={CARD_WIDTH} height={CARD_WIDTH * 1.5} />
          ))}
        </View>
      ) : (
        <FlatList
          data={allItems}
          numColumns={3}
          keyExtractor={(item: any) => `genre-${mediaType}-${item.id}`}
          renderItem={({ item }: { item: any }) => (
            <View style={{ margin: GAP / 2 }}>
              <MediaCard
                id={item.id}
                type={mediaType}
                posterPath={item.poster_path}
                width={CARD_WIDTH}
              />
            </View>
          )}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loader}>
                <ActivityIndicator color={C.accent} size="small" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="film-outline" size={48} color={C.textMuted} />
              <Text style={styles.emptyText}>لا يوجد محتوى</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: C.text,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  shimmerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    paddingHorizontal: PADDING,
  },
  gridContent: {
    paddingHorizontal: PADDING - GAP / 2,
    paddingBottom: 80,
  },
  loader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: { color: C.textMuted, fontSize: 16, fontFamily: "Inter_400Regular" },
});

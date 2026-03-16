import NetInfo from "@react-native-community/netinfo";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MediaCard } from "@/components/MediaCard";
import { NoInternetScreen } from "@/components/NoInternetScreen";
import { ShimmerCard } from "@/components/ShimmerCard";
import { C } from "@/constants/colors";
import { MOVIE_GENRES, TV_GENRES } from "@/lib/genres";
import { searchAll } from "@/lib/tmdb";
import { Feather, Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 8;
const PADDING = 16;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3);

type TabType = "all" | "movies" | "tv" | "people";

function GenreCard({ id, nameAr, color, type }: { id: number; nameAr: string; color: string; type: "movie" | "tv" }) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/genre/[type]/[id]", params: { type, id } });
  }, [id, type]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.genreCard,
        { backgroundColor: color + "22", opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={handlePress}
    >
      <View style={[styles.genreDot, { backgroundColor: color }]} />
      <Text style={styles.genreText}>{nameAr}</Text>
    </Pressable>
  );
}

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const [isConnected, setIsConnected] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [activeGenreType, setActiveGenreType] = useState<"movie" | "tv">("movie");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchAll(debouncedQuery),
    enabled: !!debouncedQuery && isConnected,
  });

  if (!isConnected) {
    return <NoInternetScreen onRetry={() => NetInfo.fetch().then(s => setIsConnected(s.isConnected ?? true))} />;
  }

  const isSearching = !!debouncedQuery;

  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: "الكل" },
    { key: "movies", label: "أفلام" },
    { key: "tv", label: "مسلسلات" },
    { key: "people", label: "ممثلون" },
  ];

  const getResultItems = () => {
    if (!searchResults) return [];
    if (activeTab === "movies") return searchResults.movies.results;
    if (activeTab === "tv") return searchResults.tvShows.results;
    if (activeTab === "people") return searchResults.people.results;
    return [
      ...searchResults.movies.results.map(m => ({ ...m, _type: "movie" as const })),
      ...searchResults.tvShows.results.map(t => ({ ...t, _type: "tv" as const })),
      ...searchResults.people.results.map(p => ({ ...p, _type: "person" as const })),
    ];
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={C.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن فيلم، مسلسل، ممثل..."
            placeholderTextColor={C.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            textAlign="right"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={C.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {isSearching ? (
        <>
          {/* Search Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={styles.tabsContainer}
          >
            {tabs.map((tab) => (
              <Pressable
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Results */}
          {searchLoading ? (
            <View style={styles.shimmerGrid}>
              {[...Array(9)].map((_, i) => <ShimmerCard key={i} width={CARD_WIDTH} height={CARD_WIDTH * 1.5} />)}
            </View>
          ) : (
            <FlatList
              data={getResultItems()}
              numColumns={3}
              keyExtractor={(item: any) => `search-${item._type || activeTab}-${item.id}`}
              renderItem={({ item }: { item: any }) => (
                <View style={{ margin: GAP / 2 }}>
                  <MediaCard
                    id={item.id}
                    type={item._type || (activeTab === "people" ? "person" : activeTab === "tv" ? "tv" : "movie")}
                    posterPath={item.poster_path || item.profile_path}
                    width={CARD_WIDTH}
                  />
                </View>
              )}
              contentContainerStyle={styles.gridContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color={C.textMuted} />
                  <Text style={styles.emptyText}>لا توجد نتائج</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Genre Type Toggle */}
          <View style={styles.genreToggle}>
            <Pressable
              style={[styles.genreToggleBtn, activeGenreType === "movie" && styles.genreToggleBtnActive]}
              onPress={() => setActiveGenreType("movie")}
            >
              <Text style={[styles.genreToggleText, activeGenreType === "movie" && styles.genreToggleTextActive]}>
                أفلام
              </Text>
            </Pressable>
            <Pressable
              style={[styles.genreToggleBtn, activeGenreType === "tv" && styles.genreToggleBtnActive]}
              onPress={() => setActiveGenreType("tv")}
            >
              <Text style={[styles.genreToggleText, activeGenreType === "tv" && styles.genreToggleTextActive]}>
                مسلسلات
              </Text>
            </Pressable>
          </View>

          <Text style={styles.genresTitle}>الفئات</Text>
          <View style={styles.genresGrid}>
            {(activeGenreType === "movie" ? MOVIE_GENRES : TV_GENRES).map((genre) => (
              <GenreCard
                key={genre.id}
                id={genre.id}
                nameAr={genre.nameAr}
                color={genre.color}
                type={activeGenreType}
              />
            ))}
          </View>
          <View style={{ height: isWeb ? 34 : insets.bottom + 80 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    includeFontPadding: false,
  },
  tabsContainer: {
    marginBottom: 12,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
  },
  tabActive: {
    backgroundColor: C.accent,
  },
  tabText: {
    color: C.textSecondary,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  tabTextActive: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  shimmerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    paddingHorizontal: PADDING,
  },
  gridContent: {
    paddingHorizontal: PADDING - GAP / 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  genreToggle: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    padding: 4,
  },
  genreToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  genreToggleBtnActive: {
    backgroundColor: C.accent,
  },
  genreToggleText: {
    color: C.textSecondary,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  genreToggleTextActive: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
  genresTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginHorizontal: 16,
    marginBottom: 14,
    writingDirection: "rtl",
  },
  genresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
  },
  genreCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    minWidth: (SCREEN_WIDTH - 32 - 10) / 2,
  },
  genreDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  genreText: {
    color: C.text,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});

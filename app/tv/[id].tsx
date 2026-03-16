import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MediaCard } from "@/components/MediaCard";
import { ShimmerCard } from "@/components/ShimmerCard";
import { C } from "@/constants/colors";
import { useFavorites } from "@/context/FavoritesContext";
import { detectLanguage } from "@/lib/utils";
import { translateText } from "@/lib/translate";
import {
  getBackdropUrl,
  getImageUrl,
  getSeasonDetails,
  getTVShowDetails,
  Season,
} from "@/lib/tmdb";
import { formatRuntime, getYear } from "@/lib/utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 8;
const PADDING = 16;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3);

type TabKey = "overview" | "seasons" | "cast" | "media" | "similar";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "نظرة عامة" },
  { key: "seasons", label: "المواسم" },
  { key: "cast", label: "طاقم العمل" },
  { key: "media", label: "الصور" },
  { key: "similar", label: "مشابه" },
];

export default function TVDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [translatedOverview, setTranslatedOverview] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: show, isLoading } = useQuery({
    queryKey: ["tv-details", id],
    queryFn: () => getTVShowDetails(Number(id)),
    enabled: !!id,
  });

  const { data: seasonData } = useQuery({
    queryKey: ["season-details", id, selectedSeason],
    queryFn: () => getSeasonDetails(Number(id), selectedSeason),
    enabled: !!id && activeTab === "seasons",
  });

  const isFav = show ? isFavorite(show.id, "tv") : false;

  useEffect(() => {
    if (show?.overview) {
      const lang = detectLanguage(show.overview);
      if (lang === "en") {
        translateText(show.overview, "en", "ar").then(setTranslatedOverview);
      }
    }
  }, [show?.overview]);

  const handleFavorite = useCallback(() => {
    if (!show) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite({
      id: show.id,
      type: "tv",
      title: show.name,
      poster_path: show.poster_path,
      vote_average: show.vote_average,
      first_air_date: show.first_air_date,
      addedAt: Date.now(),
    });
  }, [show, toggleFavorite]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ShimmerCard width={SCREEN_WIDTH} height={380} borderRadius={0} />
        <View style={{ padding: 16, gap: 12 }}>
          <ShimmerCard width={200} height={24} />
          <ShimmerCard width={160} height={18} />
        </View>
      </View>
    );
  }

  if (!show) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>لم يتم العثور على المسلسل</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>عودة</Text>
        </Pressable>
      </View>
    );
  }

  const backdropUrl = getBackdropUrl(show.backdrop_path);
  const posterUrl = getImageUrl(show.poster_path, "w342");
  const displayOverview = translatedOverview || show.overview;
  const cast = show.credits?.cast?.filter(c => c.profile_path).slice(0, 20) ?? [];
  const images = show.media?.backdrops?.slice(0, 12) ?? [];
  const similar = show.similar_tvshows?.slice(0, 12) ?? [];
  const episodeRuntime = show.episode_run_time?.[0] ?? 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with backdrop */}
      <View style={styles.header}>
        {backdropUrl ? (
          <Image source={{ uri: backdropUrl }} style={styles.backdrop} contentFit="cover" />
        ) : (
          <View style={[styles.backdrop, { backgroundColor: C.surfaceAlt }]} />
        )}
        <LinearGradient
          colors={["rgba(10,7,7,0.3)", "rgba(10,7,7,0.7)", C.background]}
          style={StyleSheet.absoluteFill}
          locations={[0.2, 0.65, 1]}
        />

        <Pressable
          style={[styles.backBtnTop, { top: insets.top + 8 }]}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </Pressable>

        <Pressable
          style={[styles.favBtnTop, { top: insets.top + 8 }]}
          onPress={handleFavorite}
          hitSlop={8}
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={22}
            color={isFav ? C.accent : C.text}
          />
        </Pressable>

        <View style={styles.headerInfo}>
          <View style={styles.posterAndInfo}>
            {posterUrl && (
              <Image source={{ uri: posterUrl }} style={styles.poster} contentFit="cover" />
            )}
            <View style={styles.titleArea}>
              {show.media?.logo_url ? (
                <Image source={{ uri: show.media.logo_url }} style={styles.logo} contentFit="contain" />
              ) : (
                <Text style={styles.showTitle} numberOfLines={3}>{show.name}</Text>
              )}
              <View style={styles.metaRow}>
                {show.first_air_date && (
                  <Text style={styles.metaText}>{getYear(show.first_air_date)}</Text>
                )}
                {episodeRuntime > 0 && (
                  <>
                    <View style={styles.metaDot} />
                    <Text style={styles.metaText}>{formatRuntime(episodeRuntime)}</Text>
                  </>
                )}
                {show.age_rating && (
                  <>
                    <View style={styles.metaDot} />
                    <View style={styles.infoBadge}>
                      <Text style={styles.infoBadgeText}>{show.age_rating}</Text>
                    </View>
                  </>
                )}
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={C.gold} />
                <Text style={styles.ratingText}>{show.vote_average.toFixed(1)}</Text>
                <Text style={styles.voteCount}>({show.vote_count.toLocaleString()})</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statText}>{show.number_of_seasons} موسم</Text>
                <View style={styles.metaDot} />
                <Text style={styles.statText}>{show.number_of_episodes} حلقة</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        style={styles.tabsContainer}
      >
        {TABS.map((tab) => (
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

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === "overview" && (
          <View style={styles.overviewTab}>
            {show.tagline ? (
              <Text style={styles.tagline}>"{show.tagline}"</Text>
            ) : null}
            {displayOverview ? (
              <Text style={styles.overview}>{displayOverview}</Text>
            ) : null}

            {show.genres && show.genres.length > 0 && (
              <View style={styles.genresRow}>
                {show.genres.map((g) => (
                  <View key={g.id} style={styles.genreBadge}>
                    <Text style={styles.genreBadgeText}>{g.name}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.infoGrid}>
              {show.status && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>الحالة</Text>
                  <Text style={styles.infoValue}>{show.status}</Text>
                </View>
              )}
              {show.original_language && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>اللغة الأصلية</Text>
                  <Text style={styles.infoValue}>{show.original_language.toUpperCase()}</Text>
                </View>
              )}
              {show.networks && show.networks.length > 0 && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>القناة</Text>
                  <Text style={styles.infoValue}>{show.networks[0].name}</Text>
                </View>
              )}
              {show.type && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>النوع</Text>
                  <Text style={styles.infoValue}>{show.type}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === "seasons" && (
          <View>
            {/* Season Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {show.seasons?.map((s) => (
                  <Pressable
                    key={s.season_number}
                    style={[styles.seasonBtn, selectedSeason === s.season_number && styles.seasonBtnActive]}
                    onPress={() => setSelectedSeason(s.season_number)}
                  >
                    <Text style={[styles.seasonBtnText, selectedSeason === s.season_number && styles.seasonBtnTextActive]}>
                      الموسم {s.season_number}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Episodes */}
            {seasonData ? (
              <View style={styles.episodesList}>
                {seasonData.episodes.map((ep) => (
                  <View key={ep.id} style={styles.episodeItem}>
                    <View style={styles.episodeNum}>
                      <Text style={styles.episodeNumText}>{ep.episode_number}</Text>
                    </View>
                    <View style={styles.episodeInfo}>
                      <Text style={styles.episodeName} numberOfLines={1}>{ep.name}</Text>
                      <View style={styles.episodeMeta}>
                        {ep.runtime && <Text style={styles.episodeMetaText}>{formatRuntime(ep.runtime)}</Text>}
                        {ep.vote_average > 0 && (
                          <View style={styles.episodeRating}>
                            <Ionicons name="star" size={10} color={C.gold} />
                            <Text style={styles.episodeRatingText}>{ep.vote_average.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {ep.still_path && (
                      <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w300${ep.still_path}` }}
                        style={styles.episodeStill}
                        contentFit="cover"
                      />
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyTab}>
                <ShimmerCard width={SCREEN_WIDTH - 32} height={60} />
                <ShimmerCard width={SCREEN_WIDTH - 32} height={60} />
                <ShimmerCard width={SCREEN_WIDTH - 32} height={60} />
              </View>
            )}
          </View>
        )}

        {activeTab === "cast" && (
          <View>
            <Text style={styles.subSectionTitle}>التمثيل</Text>
            <View style={styles.castGrid}>
              {cast.map((member) => (
                <Pressable
                  key={member.id}
                  style={styles.castItem}
                  onPress={() => router.push({ pathname: "/person/[id]", params: { id: member.id } })}
                >
                  <Image
                    source={{ uri: getImageUrl(member.profile_path, "w185") ?? "" }}
                    style={styles.castPhoto}
                    contentFit="cover"
                  />
                  <Text style={styles.castName} numberOfLines={1}>{member.name}</Text>
                  <Text style={styles.castCharacter} numberOfLines={1}>{member.character}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {activeTab === "media" && (
          <View>
            {images.length > 0 ? (
              <View style={styles.imagesGrid}>
                {images.map((img, i) => (
                  <Image
                    key={i}
                    source={{ uri: `https://image.tmdb.org/t/p/w780${img.file_path}` }}
                    style={styles.imageThumb}
                    contentFit="cover"
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyTab}>
                <Ionicons name="images-outline" size={40} color={C.textMuted} />
                <Text style={styles.emptyTabText}>لا توجد صور</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "similar" && (
          <View>
            {similar.length > 0 ? (
              <View style={styles.similarGrid}>
                {similar.map((s) => (
                  <MediaCard key={s.id} id={s.id} type="tv" posterPath={s.poster_path} width={CARD_WIDTH} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyTab}>
                <Ionicons name="tv-outline" size={40} color={C.textMuted} />
                <Text style={styles.emptyTabText}>لا توجد مسلسلات مشابهة</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={{ height: isWeb ? 34 : insets.bottom + 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  centered: { justifyContent: "center", alignItems: "center" },
  errorText: { color: C.text, fontSize: 16, fontFamily: "Inter_400Regular" },
  header: { height: 420, position: "relative" },
  backdrop: { width: SCREEN_WIDTH, height: 420 },
  backBtnTop: {
    position: "absolute",
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  favBtnTop: {
    position: "absolute",
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  headerInfo: {
    position: "absolute",
    bottom: 16,
    left: PADDING,
    right: PADDING,
  },
  posterAndInfo: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-end",
  },
  poster: {
    width: 95,
    height: 143,
    borderRadius: 10,
  },
  titleArea: { flex: 1, gap: 6, paddingBottom: 4 },
  logo: { width: 160, height: 50, marginBottom: 4 },
  showTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    writingDirection: "rtl",
  },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  metaText: { color: C.textSecondary, fontSize: 13, fontFamily: "Inter_400Regular" },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.textMuted },
  infoBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: C.surfaceAlt },
  infoBadgeText: { color: C.textSecondary, fontSize: 11, fontFamily: "Inter_500Medium" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  ratingText: { color: C.gold, fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  voteCount: { color: C.textMuted, fontSize: 12, fontFamily: "Inter_400Regular" },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { color: C.textSecondary, fontSize: 13, fontFamily: "Inter_400Regular" },
  tabsContainer: { marginTop: 4, marginBottom: 4 },
  tabsRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surfaceAlt },
  tabActive: { backgroundColor: C.accent },
  tabText: { color: C.textSecondary, fontSize: 14, fontFamily: "Inter_500Medium" },
  tabTextActive: { color: "#fff", fontFamily: "Inter_700Bold" },
  tabContent: { paddingHorizontal: PADDING, paddingTop: 8 },
  overviewTab: { gap: 16 },
  tagline: { color: C.textSecondary, fontSize: 14, fontStyle: "italic", fontFamily: "Inter_400Regular", textAlign: "right" },
  overview: { color: C.text, fontSize: 15, lineHeight: 26, fontFamily: "Inter_400Regular", textAlign: "right", writingDirection: "rtl" },
  genresRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genreBadge: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: C.surfaceAlt, borderRadius: 20 },
  genreBadgeText: { color: C.textSecondary, fontSize: 12, fontFamily: "Inter_400Regular" },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4 },
  infoItem: { flex: 1, minWidth: "45%", backgroundColor: C.surfaceAlt, borderRadius: 10, padding: 12, gap: 4 },
  infoLabel: { color: C.textMuted, fontSize: 11, fontFamily: "Inter_400Regular" },
  infoValue: { color: C.text, fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  seasonBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: C.surfaceAlt },
  seasonBtnActive: { backgroundColor: C.accent },
  seasonBtnText: { color: C.textSecondary, fontSize: 13, fontFamily: "Inter_500Medium" },
  seasonBtnTextActive: { color: "#fff", fontFamily: "Inter_700Bold" },
  episodesList: { gap: 10 },
  episodeItem: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.surfaceAlt, borderRadius: 10, padding: 10 },
  episodeNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeNumText: { color: C.text, fontSize: 13, fontFamily: "Inter_700Bold" },
  episodeInfo: { flex: 1 },
  episodeName: { color: C.text, fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 4 },
  episodeMeta: { flexDirection: "row", gap: 10, alignItems: "center" },
  episodeMetaText: { color: C.textMuted, fontSize: 11, fontFamily: "Inter_400Regular" },
  episodeRating: { flexDirection: "row", alignItems: "center", gap: 3 },
  episodeRatingText: { color: C.gold, fontSize: 11, fontFamily: "Inter_500Medium" },
  episodeStill: { width: 70, height: 45, borderRadius: 6, backgroundColor: C.surface },
  subSectionTitle: { color: C.text, fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 14, writingDirection: "rtl" },
  castGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  castItem: { width: (SCREEN_WIDTH - PADDING * 2 - 12 * 3) / 4, alignItems: "center", gap: 4 },
  castPhoto: {
    width: (SCREEN_WIDTH - PADDING * 2 - 12 * 3) / 4,
    height: (SCREEN_WIDTH - PADDING * 2 - 12 * 3) / 4,
    borderRadius: ((SCREEN_WIDTH - PADDING * 2 - 12 * 3) / 4) / 2,
    backgroundColor: C.surfaceAlt,
  },
  castName: { color: C.text, fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  castCharacter: { color: C.textMuted, fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  imagesGrid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  imageThumb: {
    width: (SCREEN_WIDTH - PADDING * 2 - GAP) / 2,
    height: ((SCREEN_WIDTH - PADDING * 2 - GAP) / 2) * 0.56,
    borderRadius: 8,
    backgroundColor: C.surfaceAlt,
  },
  similarGrid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  emptyTab: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyTabText: { color: C.textMuted, fontSize: 15, fontFamily: "Inter_400Regular" },
  backBtn: { marginTop: 16, backgroundColor: C.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
});

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
  getTrailerKey,
  getMovieDetails,
  MovieDetails,
} from "@/lib/tmdb";
import { formatRuntime, getYear } from "@/lib/utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 8;
const PADDING = 16;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3);

type TabKey = "overview" | "cast" | "media" | "similar";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "نظرة عامة" },
  { key: "cast", label: "طاقم العمل" },
  { key: "media", label: "الصور" },
  { key: "similar", label: "مشابه" },
];

function InfoBadge({ text }: { text: string }) {
  return (
    <View style={styles.infoBadge}>
      <Text style={styles.infoBadgeText}>{text}</Text>
    </View>
  );
}

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [translatedOverview, setTranslatedOverview] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie-details", id],
    queryFn: () => getMovieDetails(Number(id)),
    enabled: !!id,
  });

  const isFav = movie ? isFavorite(movie.id, "movie") : false;

  useEffect(() => {
    if (movie?.overview) {
      const lang = detectLanguage(movie.overview);
      if (lang === "en") {
        translateText(movie.overview, "en", "ar").then(setTranslatedOverview);
      }
    }
  }, [movie?.overview]);

  const handleFavorite = useCallback(() => {
    if (!movie) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite({
      id: movie.id,
      type: "movie",
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      addedAt: Date.now(),
    });
  }, [movie, toggleFavorite]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ShimmerCard width={SCREEN_WIDTH} height={380} borderRadius={0} />
        <View style={{ padding: 16, gap: 12 }}>
          <ShimmerCard width={200} height={24} />
          <ShimmerCard width={160} height={18} />
          <ShimmerCard width={SCREEN_WIDTH - 32} height={100} />
        </View>
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>لم يتم العثور على الفيلم</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>عودة</Text>
        </Pressable>
      </View>
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getImageUrl(movie.poster_path, "w342");
  const displayOverview = translatedOverview || movie.overview;
  const cast = movie.credits?.cast?.filter(c => c.profile_path).slice(0, 20) ?? [];
  const crew = movie.credits?.crew?.filter(c => ["Director", "Writer", "Producer"].includes(c.job)).slice(0, 10) ?? [];
  const images = movie.media?.backdrops?.slice(0, 12) ?? [];
  const similar = movie.similar_movies?.slice(0, 12) ?? [];
  const trailerKey = getTrailerKey(movie.videos);

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

        {/* Back Button */}
        <Pressable
          style={[styles.backBtnTop, { top: insets.top + 8 }]}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </Pressable>

        {/* Favorite Button */}
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

        {/* Movie Info */}
        <View style={styles.headerInfo}>
          <View style={styles.posterAndInfo}>
            {posterUrl && (
              <Image source={{ uri: posterUrl }} style={styles.poster} contentFit="cover" />
            )}
            <View style={styles.titleArea}>
              {movie.media?.logo_url ? (
                <Image source={{ uri: movie.media.logo_url }} style={styles.logo} contentFit="contain" />
              ) : (
                <Text style={styles.movieTitle} numberOfLines={3}>{movie.title}</Text>
              )}

              {/* Year | Runtime | Age Rating */}
              <View style={styles.metaRow}>
                {movie.release_date && (
                  <Text style={styles.metaText}>{getYear(movie.release_date)}</Text>
                )}
                {movie.runtime > 0 && (
                  <>
                    <View style={styles.metaDot} />
                    <Text style={styles.metaText}>{formatRuntime(movie.runtime)}</Text>
                  </>
                )}
                {movie.age_rating && (
                  <>
                    <View style={styles.metaDot} />
                    <InfoBadge text={movie.age_rating} />
                  </>
                )}
              </View>

              {/* Rating */}
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={C.gold} />
                <Text style={styles.ratingText}>{movie.vote_average.toFixed(1)}</Text>
                <Text style={styles.voteCount}>({movie.vote_count.toLocaleString()})</Text>
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
            {movie.tagline ? (
              <Text style={styles.tagline}>"{movie.tagline}"</Text>
            ) : null}
            {displayOverview ? (
              <Text style={styles.overview}>{displayOverview}</Text>
            ) : null}

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <View style={styles.genresRow}>
                {movie.genres.map((g) => (
                  <View key={g.id} style={styles.genreBadge}>
                    <Text style={styles.genreBadgeText}>{g.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Movie Info Grid */}
            <View style={styles.infoGrid}>
              {movie.status && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>الحالة</Text>
                  <Text style={styles.infoValue}>{movie.status}</Text>
                </View>
              )}
              {movie.original_language && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>اللغة الأصلية</Text>
                  <Text style={styles.infoValue}>{movie.original_language.toUpperCase()}</Text>
                </View>
              )}
              {movie.budget > 0 && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>الميزانية</Text>
                  <Text style={styles.infoValue}>${movie.budget.toLocaleString()}</Text>
                </View>
              )}
              {movie.revenue > 0 && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>الإيرادات</Text>
                  <Text style={styles.infoValue}>${movie.revenue.toLocaleString()}</Text>
                </View>
              )}
            </View>
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

            {crew.length > 0 && (
              <>
                <Text style={[styles.subSectionTitle, { marginTop: 20 }]}>طاقم الإنتاج</Text>
                <View style={styles.crewList}>
                  {crew.map((member, i) => (
                    <View key={i} style={styles.crewItem}>
                      <Text style={styles.crewName}>{member.name}</Text>
                      <Text style={styles.crewJob}>{member.job}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
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
                {similar.map((m) => (
                  <MediaCard key={m.id} id={m.id} type="movie" posterPath={m.poster_path} width={CARD_WIDTH} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyTab}>
                <Ionicons name="film-outline" size={40} color={C.textMuted} />
                <Text style={styles.emptyTabText}>لا توجد أفلام مشابهة</Text>
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
  titleArea: {
    flex: 1,
    gap: 6,
    paddingBottom: 4,
  },
  logo: {
    width: 160,
    height: 50,
    marginBottom: 4,
  },
  movieTitle: {
    color: C.text,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    writingDirection: "rtl",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  metaText: {
    color: C.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.textMuted,
  },
  infoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: C.surfaceAlt,
  },
  infoBadgeText: {
    color: C.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ratingText: {
    color: C.gold,
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  voteCount: {
    color: C.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  tabsContainer: { marginTop: 4, marginBottom: 4 },
  tabsRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
  },
  tabActive: { backgroundColor: C.accent },
  tabText: { color: C.textSecondary, fontSize: 14, fontFamily: "Inter_500Medium" },
  tabTextActive: { color: "#fff", fontFamily: "Inter_700Bold" },
  tabContent: { paddingHorizontal: PADDING, paddingTop: 8 },
  overviewTab: { gap: 16 },
  tagline: {
    color: C.textSecondary,
    fontSize: 14,
    fontStyle: "italic",
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  overview: {
    color: C.text,
    fontSize: 15,
    lineHeight: 26,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    writingDirection: "rtl",
  },
  genresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: C.surfaceAlt,
    borderRadius: 20,
  },
  genreBadgeText: {
    color: C.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  infoItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: C.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  infoLabel: {
    color: C.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  infoValue: {
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  subSectionTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
    writingDirection: "rtl",
  },
  castGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  castItem: {
    width: (SCREEN_WIDTH - PADDING * 2 - 12 * 3) / 4,
    alignItems: "center",
    gap: 4,
  },
  castPhoto: {
    width: (SCREEN_WIDTH - PADDING * 2 - 12 * 3) / 4,
    height: (SCREEN_WIDTH - PADDING * 2 - 12 * 3) / 4,
    borderRadius: ((SCREEN_WIDTH - PADDING * 2 - 12 * 3) / 4) / 2,
    backgroundColor: C.surfaceAlt,
  },
  castName: {
    color: C.text,
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  castCharacter: {
    color: C.textMuted,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  crewList: { gap: 8 },
  crewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.surfaceAlt,
  },
  crewName: { color: C.text, fontSize: 14, fontFamily: "Inter_500Medium" },
  crewJob: { color: C.textSecondary, fontSize: 13, fontFamily: "Inter_400Regular" },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  imageThumb: {
    width: (SCREEN_WIDTH - PADDING * 2 - GAP) / 2,
    height: ((SCREEN_WIDTH - PADDING * 2 - GAP) / 2) * 0.56,
    borderRadius: 8,
    backgroundColor: C.surfaceAlt,
  },
  similarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  emptyTab: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTabText: {
    color: C.textMuted,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: C.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backBtnText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
});

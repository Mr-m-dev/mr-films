import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Linking,
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
import { detectLanguage } from "@/lib/utils";
import { translateText } from "@/lib/translate";
import { getImageUrl, getPersonDetails, TMDB_IMAGE_BASE_URL } from "@/lib/tmdb";
import { formatDate } from "@/lib/utils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAP = 8;
const PADDING = 16;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3);

type TabKey = "bio" | "movies" | "tv" | "photos";

const TABS: { key: TabKey; label: string }[] = [
  { key: "bio", label: "السيرة الذاتية" },
  { key: "movies", label: "الأفلام" },
  { key: "tv", label: "المسلسلات" },
  { key: "photos", label: "الصور" },
];

export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [activeTab, setActiveTab] = useState<TabKey>("bio");
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);

  const { data: person, isLoading } = useQuery({
    queryKey: ["person-details", id],
    queryFn: () => getPersonDetails(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (person?.english_biography) {
      const lang = detectLanguage(person.english_biography);
      if (lang === "en") {
        translateText(person.english_biography, "en", "ar").then(setTranslatedBio);
      }
    }
  }, [person?.english_biography]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ShimmerCard width={SCREEN_WIDTH} height={300} borderRadius={0} />
        <View style={{ padding: 16, gap: 12 }}>
          <ShimmerCard width={200} height={24} />
          <ShimmerCard width={300} height={80} />
        </View>
      </View>
    );
  }

  if (!person) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>لم يتم العثور على الممثل</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>عودة</Text>
        </Pressable>
      </View>
    );
  }

  const profileUrl = person.profile_path
    ? `${TMDB_IMAGE_BASE_URL}/w780${person.profile_path}`
    : null;

  const movies = person.credits?.movie?.cast ?? [];
  const tvShows = person.credits?.tv?.cast ?? [];
  const photos = person.media?.profiles ?? [];

  const displayBio = person.arabic_biography || translatedBio || person.english_biography || person.biography;

  const genderLabel = person.gender === 1 ? "أنثى" : person.gender === 2 ? "ذكر" : "";

  const socialLinks = [
    { key: "instagram", icon: "logo-instagram", url: person.social_media?.instagram },
    { key: "twitter", icon: "logo-twitter", url: person.social_media?.twitter },
    { key: "facebook", icon: "logo-facebook", url: person.social_media?.facebook },
    { key: "youtube", icon: "logo-youtube", url: person.social_media?.youtube },
  ].filter(s => s.url);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        {profileUrl ? (
          <Image source={{ uri: profileUrl }} style={styles.backdrop} contentFit="cover" />
        ) : (
          <View style={[styles.backdrop, { backgroundColor: C.surfaceAlt }]} />
        )}
        <LinearGradient
          colors={["rgba(10,7,7,0.1)", "rgba(10,7,7,0.5)", C.background]}
          style={StyleSheet.absoluteFill}
          locations={[0.2, 0.6, 1]}
        />
        <Pressable
          style={[styles.backBtnTop, { top: insets.top + 8 }]}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          {person.arabic_name && person.arabic_name !== person.name && (
            <Text style={styles.arabicName}>{person.arabic_name}</Text>
          )}
          <Text style={styles.department}>{person.known_for_department}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{person.statistics?.total_movies ?? 0}</Text>
              <Text style={styles.statLabel}>فيلم</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{person.statistics?.total_tv_shows ?? 0}</Text>
              <Text style={styles.statLabel}>مسلسل</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{Math.floor(person.popularity)}</Text>
              <Text style={styles.statLabel}>الشعبية</Text>
            </View>
          </View>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <View style={styles.socialRow}>
              {socialLinks.map((social) => (
                <Pressable
                  key={social.key}
                  onPress={() => social.url && Linking.openURL(social.url)}
                  style={styles.socialBtn}
                >
                  <Ionicons name={social.icon as any} size={20} color={C.text} />
                </Pressable>
              ))}
            </View>
          )}
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
        {activeTab === "bio" && (
          <View style={styles.bioTab}>
            {/* Personal Info */}
            <View style={styles.infoGrid}>
              {person.birthday && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>تاريخ الميلاد</Text>
                  <Text style={styles.infoValue}>{formatDate(person.birthday)}</Text>
                </View>
              )}
              {person.deathday && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>تاريخ الوفاة</Text>
                  <Text style={styles.infoValue}>{formatDate(person.deathday)}</Text>
                </View>
              )}
              {person.place_of_birth && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>مكان الميلاد</Text>
                  <Text style={styles.infoValue}>{person.place_of_birth}</Text>
                </View>
              )}
              {genderLabel && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>الجنس</Text>
                  <Text style={styles.infoValue}>{genderLabel}</Text>
                </View>
              )}
            </View>

            {/* Biography */}
            {displayBio ? (
              <View style={styles.bioSection}>
                <Text style={styles.bioTitle}>السيرة الذاتية</Text>
                <Text style={styles.bioText}>{displayBio}</Text>
              </View>
            ) : null}

            {/* Also Known As */}
            {person.also_known_as && person.also_known_as.length > 0 && (
              <View style={styles.alsoKnown}>
                <Text style={styles.bioTitle}>معروف أيضاً بـ</Text>
                <View style={styles.alsoKnownTags}>
                  {person.also_known_as.slice(0, 6).map((name, i) => (
                    <View key={i} style={styles.alsoKnownTag}>
                      <Text style={styles.alsoKnownTagText}>{name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === "movies" && (
          <View>
            {movies.length > 0 ? (
              <View style={styles.mediaGrid}>
                {movies.slice(0, 30).map((m) => (
                  <MediaCard key={m.id} id={m.id} type="movie" posterPath={m.poster_path} width={CARD_WIDTH} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyTab}>
                <Ionicons name="film-outline" size={40} color={C.textMuted} />
                <Text style={styles.emptyTabText}>لا توجد أفلام</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "tv" && (
          <View>
            {tvShows.length > 0 ? (
              <View style={styles.mediaGrid}>
                {tvShows.slice(0, 30).map((t) => (
                  <MediaCard key={t.id} id={t.id} type="tv" posterPath={t.poster_path} width={CARD_WIDTH} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyTab}>
                <Ionicons name="tv-outline" size={40} color={C.textMuted} />
                <Text style={styles.emptyTabText}>لا توجد مسلسلات</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "photos" && (
          <View>
            {photos.length > 0 ? (
              <View style={styles.photosGrid}>
                {photos.map((photo, i) => (
                  <Image
                    key={i}
                    source={{ uri: `${TMDB_IMAGE_BASE_URL}/w342${photo.file_path}` }}
                    style={styles.photoThumb}
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
      </View>

      <View style={{ height: isWeb ? 34 : insets.bottom + 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  centered: { justifyContent: "center", alignItems: "center", flex: 1 },
  errorText: { color: C.text, fontSize: 16, fontFamily: "Inter_400Regular" },
  header: { height: 440, position: "relative" },
  backdrop: { width: SCREEN_WIDTH, height: 440 },
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
  headerInfo: {
    position: "absolute",
    bottom: 16,
    left: PADDING,
    right: PADDING,
    gap: 6,
  },
  personName: {
    color: C.text,
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  arabicName: {
    color: C.textSecondary,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  department: {
    color: C.accent,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    alignItems: "center",
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { color: C.text, fontSize: 20, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { color: C.textSecondary, fontSize: 11, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 30, backgroundColor: C.surfaceAlt },
  socialRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  socialBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabsContainer: { marginTop: 4, marginBottom: 4 },
  tabsRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: C.surfaceAlt },
  tabActive: { backgroundColor: C.accent },
  tabText: { color: C.textSecondary, fontSize: 14, fontFamily: "Inter_500Medium" },
  tabTextActive: { color: "#fff", fontFamily: "Inter_700Bold" },
  tabContent: { paddingHorizontal: PADDING, paddingTop: 8 },
  bioTab: { gap: 16 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  infoItem: { flex: 1, minWidth: "45%", backgroundColor: C.surfaceAlt, borderRadius: 10, padding: 12, gap: 4 },
  infoLabel: { color: C.textMuted, fontSize: 11, fontFamily: "Inter_400Regular" },
  infoValue: { color: C.text, fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  bioSection: { gap: 10 },
  bioTitle: { color: C.text, fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  bioText: { color: C.textSecondary, fontSize: 14, lineHeight: 24, fontFamily: "Inter_400Regular", textAlign: "right", writingDirection: "rtl" },
  alsoKnown: { gap: 10 },
  alsoKnownTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  alsoKnownTag: { backgroundColor: C.surfaceAlt, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  alsoKnownTagText: { color: C.textSecondary, fontSize: 12, fontFamily: "Inter_400Regular" },
  mediaGrid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  photosGrid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  photoThumb: {
    width: (SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3,
    height: ((SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3) * 1.5,
    borderRadius: 8,
    backgroundColor: C.surfaceAlt,
  },
  emptyTab: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyTabText: { color: C.textMuted, fontSize: 15, fontFamily: "Inter_400Regular" },
  backBtn: { marginTop: 16, backgroundColor: C.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  backBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
});

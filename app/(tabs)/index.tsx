import NetInfo from "@react-native-community/netinfo";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HeroBanner } from "@/components/HeroBanner";
import { MediaRow } from "@/components/MediaRow";
import { NoInternetScreen } from "@/components/NoInternetScreen";
import { SectionHeader } from "@/components/SectionHeader";
import { ShimmerCard } from "@/components/ShimmerCard";
import { C } from "@/constants/colors";
import {
  getNowPlayingMovies,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getTrendingMovies,
  getTrendingTVShows,
  getUpcomingMovies,
} from "@/lib/tmdb";
import { router } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function ShimmerSection() {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ height: 24, width: 140, backgroundColor: C.surfaceAlt, borderRadius: 8, marginHorizontal: 16, marginBottom: 12 }} />
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
        {[1,2,3].map(i => <ShimmerCard key={i} width={110} height={165} />)}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  const { data: heroMovies, isLoading: heroLoading } = useQuery({
    queryKey: ["hero-movies"],
    queryFn: () => getTrendingMovies("week"),
    enabled: isConnected,
  });

  const { data: popularMovies, isLoading: popularMoviesLoading } = useQuery({
    queryKey: ["popular-movies"],
    queryFn: () => getPopularMovies(1),
    enabled: isConnected,
  });

  const { data: topRatedMovies, isLoading: topRatedMoviesLoading } = useQuery({
    queryKey: ["top-rated-movies"],
    queryFn: () => getTopRatedMovies(1),
    enabled: isConnected,
  });

  const { data: nowPlayingMovies } = useQuery({
    queryKey: ["now-playing-movies"],
    queryFn: () => getNowPlayingMovies(1),
    enabled: isConnected,
  });

  const { data: upcomingMovies } = useQuery({
    queryKey: ["upcoming-movies"],
    queryFn: () => getUpcomingMovies(1),
    enabled: isConnected,
  });

  const { data: popularTV, isLoading: popularTVLoading } = useQuery({
    queryKey: ["popular-tv"],
    queryFn: () => getPopularTVShows(1),
    enabled: isConnected,
  });

  const { data: topRatedTV } = useQuery({
    queryKey: ["top-rated-tv"],
    queryFn: () => getTopRatedTVShows(1),
    enabled: isConnected,
  });

  const { data: trendingTV } = useQuery({
    queryKey: ["trending-tv"],
    queryFn: () => getTrendingTVShows("week"),
    enabled: isConnected,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  if (!isConnected) {
    return <NoInternetScreen onRetry={() => NetInfo.fetch().then(state => setIsConnected(state.isConnected ?? true))} />;
  }

  const topInset = isWeb ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.accent}
            progressViewOffset={topInset}
          />
        }
      >
      {/* Hero Banner */}
      {heroLoading ? (
        <ShimmerCard width={SCREEN_WIDTH} height={480} borderRadius={0} />
      ) : heroMovies && heroMovies.length > 0 ? (
        <HeroBanner items={heroMovies} />
      ) : null}

      {/* Popular Movies */}
      <View style={styles.section}>
        <SectionHeader
          title="أفلام شائعة"
          onSeeAll={() => router.push({ pathname: "/genre/[type]/[id]", params: { type: "movies-popular", id: "popular" } })}
        />
        {popularMoviesLoading ? (
          <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
            {[1,2,3].map(i => <ShimmerCard key={i} width={110} height={165} />)}
          </View>
        ) : (
          <MediaRow items={popularMovies?.results ?? []} type="movie" />
        )}
      </View>

      {/* Now Playing */}
      {nowPlayingMovies && nowPlayingMovies.results.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="يُعرض الآن" />
          <MediaRow items={nowPlayingMovies.results} type="movie" />
        </View>
      )}

      {/* Popular TV */}
      <View style={styles.section}>
        <SectionHeader
          title="مسلسلات شائعة"
          onSeeAll={() => router.push({ pathname: "/genre/[type]/[id]", params: { type: "tv-popular", id: "popular" } })}
        />
        {popularTVLoading ? (
          <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
            {[1,2,3].map(i => <ShimmerCard key={i} width={110} height={165} />)}
          </View>
        ) : (
          <MediaRow items={popularTV?.results ?? []} type="tv" />
        )}
      </View>

      {/* Top Rated Movies */}
      <View style={styles.section}>
        <SectionHeader
          title="أعلى تقييماً - أفلام"
          onSeeAll={() => router.push({ pathname: "/genre/[type]/[id]", params: { type: "movies-top-rated", id: "top-rated" } })}
        />
        {topRatedMoviesLoading ? (
          <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
            {[1,2,3].map(i => <ShimmerCard key={i} width={110} height={165} />)}
          </View>
        ) : (
          <MediaRow items={topRatedMovies?.results ?? []} type="movie" />
        )}
      </View>

      {/* Trending TV */}
      {trendingTV && trendingTV.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="مسلسلات رائجة" />
          <MediaRow items={trendingTV} type="tv" />
        </View>
      )}

      {/* Top Rated TV */}
      {topRatedTV && topRatedTV.results.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="أعلى تقييماً - مسلسلات" />
          <MediaRow items={topRatedTV.results} type="tv" />
        </View>
      )}

      {/* Upcoming Movies */}
      {upcomingMovies && upcomingMovies.results.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="قريباً" />
          <MediaRow items={upcomingMovies.results} type="movie" />
        </View>
      )}

      <View style={{ height: isWeb ? 34 : insets.bottom + 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  section: {
    marginBottom: 24,
  },
});

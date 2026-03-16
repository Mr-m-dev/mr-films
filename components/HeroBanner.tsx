import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { C } from "@/constants/colors";
import { TMDBMovie, getBackdropUrl } from "@/lib/tmdb";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HeroItem extends TMDBMovie {
  logo_url?: string | null;
}

interface HeroBannerProps {
  items: HeroItem[];
}

function HeroSlide({ item }: { item: HeroItem }) {
  const backdropUrl = getBackdropUrl(item.backdrop_path, "w1280");

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/movie/[id]", params: { id: item.id } });
  }, [item.id]);

  return (
    <Pressable onPress={handlePress} style={styles.slide}>
      {backdropUrl ? (
        <Image
          source={{ uri: backdropUrl }}
          style={styles.backdrop}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[styles.backdrop, { backgroundColor: C.surfaceAlt }]} />
      )}
      <LinearGradient
        colors={["transparent", "rgba(10,7,7,0.7)", C.background]}
        style={styles.gradient}
        locations={[0.3, 0.7, 1]}
      />
      <View style={styles.info}>
        {item.logo_url ? (
          <Image
            source={{ uri: item.logo_url }}
            style={styles.logo}
            contentFit="contain"
          />
        ) : (
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        )}
        <View style={styles.meta}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={C.gold} />
            <Text style={styles.ratingText}>{item.vote_average.toFixed(1)}</Text>
          </View>
          {item.release_date && (
            <Text style={styles.year}>
              {new Date(item.release_date).getFullYear()}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.playBtn} onPress={handlePress}>
            <Ionicons name="play" size={18} color="#000" />
            <Text style={styles.playText}>تفاصيل</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export function HeroBanner({ items }: HeroBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
    []
  );

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={items}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `hero-${item.id}`}
        renderItem={({ item }) => <HeroSlide item={item} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
      />
      <View style={styles.dots}>
        {items.slice(0, 8).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 480,
    marginBottom: 4,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: 480,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: 480,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  info: {
    position: "absolute",
    bottom: 60,
    left: 16,
    right: 16,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 10,
  },
  title: {
    color: C.text,
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    writingDirection: "rtl",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: C.gold,
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  year: {
    color: C.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.text,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  playText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  dots: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.textMuted,
  },
  dotActive: {
    width: 16,
    backgroundColor: C.text,
  },
});

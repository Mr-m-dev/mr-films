const Colors = {
  dark: {
    background: "#0A0707",
    surface: "#101010",
    surfaceAlt: "#181818",
    text: "#FFFFFF",
    textSecondary: "#999999",
    textMuted: "#666666",
    accent: "#E50914",
    accentDim: "rgba(229, 9, 20, 0.15)",
    gold: "#F5C518",
    tint: "#E50914",
    tabIconDefault: "#666666",
    tabIconSelected: "#FFFFFF",
    card: "#101010",
    overlay: "rgba(10,7,7,0.85)",
    shimmer1: "#181818",
    shimmer2: "#202020",
  },
  light: {
    background: "#0A0707",
    surface: "#141010",
    surfaceAlt: "#1C1818",
    text: "#FFFFFF",
    textSecondary: "#AAAAAA",
    textMuted: "#666666",
    accent: "#E50914",
    accentDim: "rgba(229, 9, 20, 0.15)",
    gold: "#F5C518",
    tint: "#E50914",
    tabIconDefault: "#666666",
    tabIconSelected: "#FFFFFF",
    card: "#141010",
    overlay: "rgba(10,7,7,0.85)",
    shimmer1: "#1C1818",
    shimmer2: "#2A2020",
  },
};

export default Colors;
export const C = Colors.dark;

export const Styles = {
  card: {
    borderRadius: 10,
    overflow: "hidden" as const,
    backgroundColor: C.card,
  },
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: C.text,
    marginBottom: 12,
    fontFamily: "Inter_700Bold",
  },
  row: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  gap2: {
    gap: 8,
  },
  bottomSpacing: {
    height: 100,
  },
  gridThree: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
};

export const CARD_ASPECT_RATIO = 2 / 3;

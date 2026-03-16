export interface Genre {
  id: number;
  nameAr: string;
  color: string;
}

export const MOVIE_GENRES: Genre[] = [
  { id: 28, nameAr: "أكشن", color: "#FF4500" },
  { id: 12, nameAr: "مغامرة", color: "#2E8B57" },
  { id: 16, nameAr: "أنيمي", color: "#FF69B4" },
  { id: 35, nameAr: "كوميدي", color: "#FFD700" },
  { id: 80, nameAr: "جريمة", color: "#8B0000" },
  { id: 18, nameAr: "دراما", color: "#9932CC" },
  { id: 10751, nameAr: "عائلي", color: "#32CD32" },
  { id: 14, nameAr: "خيال", color: "#7B68EE" },
  { id: 27, nameAr: "رعب", color: "#DC143C" },
  { id: 9648, nameAr: "غموض", color: "#4B0082" },
  { id: 878, nameAr: "خيال علمي", color: "#00CED1" },
  { id: 53, nameAr: "إثارة", color: "#FF6347" },
  { id: 10752, nameAr: "حرب", color: "#556B2F" },
  { id: 37, nameAr: "غرب", color: "#8B4513" },
];

export const TV_GENRES: Genre[] = [
  { id: 10759, nameAr: "أكشن", color: "#FF4500" },
  { id: 16, nameAr: "أنيمي", color: "#FF69B4" },
  { id: 35, nameAr: "كوميدي", color: "#FFD700" },
  { id: 80, nameAr: "جريمة", color: "#8B0000" },
  { id: 18, nameAr: "دراما", color: "#9932CC" },
  { id: 10751, nameAr: "عائلي", color: "#32CD32" },
  { id: 9648, nameAr: "غموض", color: "#4B0082" },
  { id: 10765, nameAr: "خيال علمي", color: "#00CED1" },
  { id: 10768, nameAr: "حرب", color: "#556B2F" },
  { id: 37, nameAr: "غرب", color: "#8B4513" },
];

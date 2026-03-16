export function detectLanguage(text: string): "ar" | "en" | "other" {
  if (!text || text.trim().length === 0) return "other";
  const arabicRegex = /[\u0600-\u06FF]/g;
  const englishRegex = /[A-Za-z]/g;
  const arabicCount = (text.match(arabicRegex) || []).length;
  const englishCount = (text.match(englishRegex) || []).length;
  if (arabicCount > englishCount * 2) return "ar";
  if (englishCount > arabicCount * 2) return "en";
  return "other";
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}د`;
  if (m === 0) return `${h}س`;
  return `${h}س ${m}د`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getYear(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const y = new Date(dateStr).getFullYear();
  return isNaN(y) ? "" : String(y);
}

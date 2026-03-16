const API_TRANSLATION_URL = "https://t.song.work/api";

export async function translateText(text: string, from = "en", to = "ar"): Promise<string> {
  if (!text) return "";
  try {
    const res = await fetch(
      `${API_TRANSLATION_URL}?text=${encodeURIComponent(text)}&from=${from}&to=${to}`
    );
    const data = await res.json();
    return data?.result?.trim() || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

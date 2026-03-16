export const AppConfig = {
  name: "مستر افلام",
  nameEn: "Mr. Films",
  version: "1.0.0",
  social: {
    twitter: "https://twitter.com/mrfilms",
    instagram: "https://instagram.com/mrfilms",
    facebook: "https://facebook.com/mrfilms",
    youtube: "https://youtube.com/@mrfilms",
  },
  settings: {
    defaultLanguage: "ar",
    supportedLanguages: ["ar", "en"],
    imageQuality: "w780",
    backdropQuality: "w1280",
    cardsPerRow: 3,
    cardGap: 8,
    enableTranslation: true,
    cacheTimeout: 48 * 60 * 60 * 1000,
  },
};

export default AppConfig;

const TMDB_API_KEYS = [
  "a2df3d1a7611194432bbdf1fc80540f2",
  "337f338ffc9eae3e5378cc87107d0a13",
  "04ae7689fc21853d7db93ebc5e887fa0",
  "4d4ed145d3584846f5922b6a467e1f85",
  "63683e7ba09287916ca1fd562d966e29",
  "68e094699525b18a70bab2f86b1fa706",
  "bf1b17e98b8c2191f7f81e0eb235fc6b",
  "75b5199b3ca7adaee206a1698fd99cf0",
];

let requestCounter = 0;

const getNextApiKey = (): string => {
  const key = TMDB_API_KEYS[requestCounter % TMDB_API_KEYS.length];
  requestCounter++;
  return key;
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const getImageUrl = (path: string | null | undefined, size = "w780"): string | null =>
  path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;

export const getBackdropUrl = (path: string | null | undefined, size = "w1280"): string | null =>
  path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 48 * 60 * 60 * 1000;

const getCacheKey = (url: string): string => {
  return `tmdb:${url}`;
};

const getFromCache = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return cached.data as T;
};

const setToCache = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

const safeFetch = async (url: string, options: any = {}, retries = 3): Promise<Response> => {
  try {
    const response = await fetch(url, {
      ...options,
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise((r) => setTimeout(r, 2000));
        return safeFetch(url, options, retries - 1);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1000));
      return safeFetch(url, options, retries - 1);
    }
    throw error;
  }
};

const safeJsonParse = async (response: Response) => {
  try {
    const text = await response.text();
    if (!text || text.trim().length === 0) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  images?: MediaImages;
}

export interface MovieDetails extends TMDBMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  imdb_id: string | null;
  homepage: string | null;
  original_language: string;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
    crew: { id: number; name: string; job: string; department: string; profile_path: string | null }[];
  };
  images?: MediaImages;
  media?: MediaImages & { logo_url?: string | null };
  recommendations?: { results: TMDBMovie[] };
  translations?: {
    translations: { iso_639_1: string; data: { title: string; overview: string } }[];
  };
  external_ids?: { imdb_id: string | null };
  videos?: { results: { id: string; key: string; site: string; type: string; official?: boolean }[] };
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  age_rating?: string;
  certification?: string;
  keywords?: {
    all: any[];
    top_keywords: any[];
    keyword_names: string[];
    total_count: number;
  };
  similar_movies?: TMDBMovie[];
  watch_providers?: any;
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
}

export interface TVShowDetails extends TMDBTVShow {
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  tagline: string;
  status: string;
  in_production: boolean;
  number_of_seasons: number;
  number_of_episodes: number;
  imdb_id?: string | null;
  homepage: string | null;
  seasons: {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    episode_count: number;
    air_date: string;
  }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
  };
  images?: MediaImages;
  media?: MediaImages & { logo_url?: string | null };
  recommendations?: { results: TMDBTVShow[] };
  external_ids?: { imdb_id: string | null };
  videos?: { results: { id: string; key: string; site: string; type: string; official?: boolean }[] };
  created_by?: { id: number; name: string }[];
  age_rating?: string;
  certification?: string;
  keywords?: {
    all: any[];
    top_keywords: any[];
    keyword_names: string[];
    total_count: number;
  };
  similar_tvshows?: TMDBTVShow[];
  watch_providers?: any;
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
  last_air_date?: string;
  next_episode_to_air?: any;
  type?: string;
  languages?: string[];
  origin_country?: string[];
  season_one?: Season | null;
  statistics?: {
    number_of_seasons: number;
    number_of_episodes: number;
    status: string;
    type?: string;
    in_production: boolean;
    last_air_date?: string;
    next_episode_to_air?: any;
  };
  similar_data?: {
    recommendations: TMDBTVShow[];
    similar: TMDBTVShow[];
  };
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
}

export interface TMDBPerson {
  id: number;
  name: string;
  original_name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
  known_for: Array<TMDBMovie | TMDBTVShow>;
  adult: boolean;
  gender: number;
}

export interface MediaImages {
  backdrops: { file_path: string; width: number; height: number }[];
  posters: { file_path: string; width: number; height: number }[];
  logos: { file_path: string; iso_639_1: string }[];
  logo_url?: string | null;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  air_date: string;
  episodes: Episode[];
  poster_path?: string | null;
  vote_average?: number;
  episode_count?: number;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  vote_average: number;
  runtime: number | null;
  crew?: any[];
  guest_stars?: any[];
  vote_count?: number;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  gender: number;
  popularity: number;
  imdb_id?: string | null;
  homepage?: string | null;
  media?: {
    profile_url?: string | null;
    profiles?: { file_path: string; aspect_ratio?: number; height?: number; width?: number; vote_average?: number; vote_count?: number }[];
  };
  combined_credits?: {
    cast: {
      id: number;
      title?: string;
      name?: string;
      media_type: string;
      poster_path: string | null;
      vote_average: number;
      release_date?: string;
      first_air_date?: string;
      genre_ids?: number[];
    }[];
  };
  also_known_as?: string[];
  arabic_name?: string;
  arabic_biography?: string;
  english_biography?: string;
  arabic_place_of_birth?: string;
  english_place_of_birth?: string;
  external_ids?: any;
  social_media?: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
    imdb?: string | null;
    wikidata?: string | null;
  };
  credits?: {
    movie?: { cast: any[] };
    tv?: { cast: any[] };
    all?: any[];
    known_for?: any[];
  };
  statistics?: {
    total_movies: number;
    total_tv_shows: number;
    total_credits: number;
  };
}

export interface MovieCollection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: TMDBMovie[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

const createPaginatedResponse = <T>(
  results: T[],
  page = 1,
  total_pages = 1,
  total_results = 0
): TMDBPaginatedResponse<T> => ({
  page,
  results,
  total_pages: total_pages || 1,
  total_results: total_results || 0
});

const EXCLUDED_TV_GENRES = [99, 10762, 10763, 10764, 10767, 10766];
const EXCLUDED_MOVIE_GENRES = [99, 10770, 10402];

const ARABIC_COUNTRIES = new Set([
  "SA","AE","QA","KW","BH","OM","YE","JO","LB","SY","IQ","EG","LY","TN","DZ","MA","SD","SO","MR","DJ","KM","PS",
]);

const isArabicContent = (item: any): boolean => {
  if (item.original_language === "ar") return true;
  if (item.production_countries?.some((c: any) => ARABIC_COUNTRIES.has(c.iso_3166_1))) return true;
  if (item.origin_country?.some((c: string) => ARABIC_COUNTRIES.has(c))) return true;
  const arabicCompanyNames = /(سعودي|إماراتي|قطري|كويتي|بحريني|عُماني|يمني|أردني|لبناني|سوري|عراقي|مصري|ليبي|تونسي|جزائري|مغربي|سوداني|صومالي|موريتاني|فلسطيني|عربي)/i;
  if (item.production_companies?.some((company: any) =>
    company.name && arabicCompanyNames.test(company.name)
  )) return true;
  return false;
};

const filterValidTVShows = (shows: TMDBTVShow[]): TMDBTVShow[] =>
  shows.filter(
    (s) =>
      s.poster_path &&
      s.backdrop_path &&
      s.overview &&
      s.overview.length > 0 &&
      s.vote_average &&
      s.vote_average >= 4 &&
      s.genre_ids?.length > 0 &&
      !s.genre_ids.some((id) => EXCLUDED_TV_GENRES.includes(id)) &&
      !isArabicContent(s)
  );

const filterValidMovies = (movies: TMDBMovie[]): TMDBMovie[] =>
  movies.filter(
    (m) =>
      m.poster_path &&
      m.backdrop_path &&
      m.overview &&
      m.overview.length > 0 &&
      m.vote_average &&
      m.vote_average >= 4 &&
      m.genre_ids?.length > 0 &&
      !m.genre_ids.some((id) => EXCLUDED_MOVIE_GENRES.includes(id)) &&
      !isArabicContent(m)
  );

const filterValidPeople = (people: TMDBPerson[]): TMDBPerson[] =>
  people.filter(
    (p) => p.profile_path && p.name && p.name.length > 0 && p.known_for_department === "Acting"
  );

const buildUrl = (endpoint: string, params: Record<string, string> = {}): string => {
  const query = new URLSearchParams({
    api_key: getNextApiKey(),
    ...params,
  });
  return `${TMDB_BASE_URL}${endpoint}?${query}`;
};

async function tmdbGet<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = buildUrl(endpoint, params);
  const cacheKey = getCacheKey(url);
  const cached = getFromCache<T>(cacheKey);
  if (cached) return cached;
  const response = await safeFetch(url);
  const data = await safeJsonParse(response);
  if (data) setToCache(cacheKey, data);
  return data;
}

export async function getMovieImages(movieId: number): Promise<MediaImages | null> {
  try {
    const cacheKey = getCacheKey(`movie_images_${movieId}`);
    const cached = getFromCache<MediaImages>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/movie/${movieId}/images?api_key=${apiKey}&include_image_language=en,ar,null`;
    const response = await safeFetch(url);
    if (!response.ok) return null;
    const result = await safeJsonParse(response);
    setToCache(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

export async function getMovieLogo(movieId: number): Promise<string | null> {
  try {
    const cacheKey = getCacheKey(`movie_logo_${movieId}`);
    const cached = getFromCache<string>(cacheKey);
    if (cached) return cached;
    const images = await getMovieImages(movieId);
    if (!images?.logos?.length) return null;
    const englishLogo = images.logos.find((logo) => logo.iso_639_1 === "en");
    const logoToUse = englishLogo || images.logos[0];
    if (logoToUse?.file_path) {
      const result = `${TMDB_IMAGE_BASE_URL}/original${logoToUse.file_path}`;
      setToCache(cacheKey, result);
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getTvImages(tvId: number): Promise<MediaImages | null> {
  try {
    const cacheKey = getCacheKey(`tv_images_${tvId}`);
    const cached = getFromCache<MediaImages>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/tv/${tvId}/images?api_key=${apiKey}&include_image_language=en,ar,null`;
    const response = await safeFetch(url);
    if (!response.ok) return null;
    const result = await safeJsonParse(response);
    setToCache(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

export async function getTvLogo(tvId: number): Promise<string | null> {
  try {
    const cacheKey = getCacheKey(`tv_logo_${tvId}`);
    const cached = getFromCache<string>(cacheKey);
    if (cached) return cached;
    const images = await getTvImages(tvId);
    if (!images?.logos?.length) return null;
    const englishLogo = images.logos.find((logo) => logo.iso_639_1 === "en");
    const logoToUse = englishLogo || images.logos[0];
    if (logoToUse?.file_path) {
      const result = `${TMDB_IMAGE_BASE_URL}/original${logoToUse.file_path}`;
      setToCache(cacheKey, result);
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getPopularMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  try {
    const cacheKey = getCacheKey(`popular_movies_${page}`);
    const cached = getFromCache<TMDBPaginatedResponse<TMDBMovie>>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&page=${page}`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    if (!data) return createPaginatedResponse([]);
    const result = filterValidMovies(data.results || []);
    const responseData = createPaginatedResponse(result, data.page, data.total_pages, data.total_results);
    setToCache(cacheKey, responseData);
    return responseData;
  } catch {
    return createPaginatedResponse([]);
  }
}

export async function getTrendingMovies(timeWindow: "day" | "week" = "week"): Promise<(TMDBMovie & { logo_url: string | null })[]> {
  try {
    const cacheKey = getCacheKey(`trending_movies_${timeWindow}`);
    const cached = getFromCache<(TMDBMovie & { logo_url: string | null })[]>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${apiKey}`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    const movies = filterValidMovies(data?.results || []);
    const moviesWithLogos = await Promise.all(
      movies.map(async (movie) => {
        const logo_url = await getMovieLogo(movie.id);
        return { ...movie, logo_url };
      })
    );
    setToCache(cacheKey, moviesWithLogos);
    return moviesWithLogos;
  } catch {
    return [];
  }
}

export async function getTopRatedMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  try {
    const cacheKey = getCacheKey(`top_rated_movies_${page}`);
    const cached = getFromCache<TMDBPaginatedResponse<TMDBMovie>>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/movie/top_rated?api_key=${apiKey}&page=${page}`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    if (!data) return createPaginatedResponse([]);
    const result = filterValidMovies(data.results || []);
    const responseData = createPaginatedResponse(result, data.page, data.total_pages, data.total_results);
    setToCache(cacheKey, responseData);
    return responseData;
  } catch {
    return createPaginatedResponse([]);
  }
}

export async function getNowPlayingMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  try {
    const cacheKey = getCacheKey(`now_playing_movies_${page}`);
    const cached = getFromCache<TMDBPaginatedResponse<TMDBMovie>>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${apiKey}&page=${page}`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    if (!data) return createPaginatedResponse([]);
    const result = filterValidMovies(data.results || []);
    const responseData = createPaginatedResponse(result, data.page, data.total_pages, data.total_results);
    setToCache(cacheKey, responseData);
    return responseData;
  } catch {
    return createPaginatedResponse([]);
  }
}

export async function getUpcomingMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  try {
    const cacheKey = getCacheKey(`upcoming_movies_${page}`);
    const cached = getFromCache<TMDBPaginatedResponse<TMDBMovie>>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${apiKey}&page=${page}`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    if (!data) return createPaginatedResponse([]);
    const result = filterValidMovies(data.results || []);
    const responseData = createPaginatedResponse(result, data.page, data.total_pages, data.total_results);
    setToCache(cacheKey, responseData);
    return responseData;
  } catch {
    return createPaginatedResponse([]);
  }
}

export async function getMoviesByGenrePaged(
  genreId: number,
  page = 1
): Promise<{ results: TMDBMovie[]; total_pages: number; page: number }> {
  try {
    const cacheKey = getCacheKey(`movies_by_genre_${genreId}_${page}`);
    const cached = getFromCache<{ results: TMDBMovie[]; total_pages: number; page: number }>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc&vote_count.gte=100&vote_average.gte=4`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    const results = filterValidMovies(data?.results || []);
    const result = {
      results,
      total_pages: Math.min(data?.total_pages || 1, 20),
      page: data?.page || 1
    };
    setToCache(cacheKey, result);
    return result;
  } catch {
    return { results: [], total_pages: 1, page: 1 };
  }
}

export async function getTVShowsByGenrePaged(
  genreId: number,
  page = 1
): Promise<{ results: TMDBTVShow[]; total_pages: number; page: number }> {
  try {
    const cacheKey = getCacheKey(`tv_by_genre_${genreId}_${page}`);
    const cached = getFromCache<{ results: TMDBTVShow[]; total_pages: number; page: number }>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/discover/tv?api_key=${apiKey}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc&vote_count.gte=50&vote_average.gte=4`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    const results = filterValidTVShows(data?.results || []);
    const result = {
      results,
      total_pages: Math.min(data?.total_pages || 1, 20),
      page: data?.page || 1
    };
    setToCache(cacheKey, result);
    return result;
  } catch {
    return { results: [], total_pages: 1, page: 1 };
  }
}

export async function getPopularTVShows(page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  try {
    const cacheKey = getCacheKey(`popular_tv_${page}`);
    const cached = getFromCache<TMDBPaginatedResponse<TMDBTVShow>>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/tv/popular?api_key=${apiKey}&page=${page}`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    if (!data) return createPaginatedResponse([]);
    const result = filterValidTVShows(data.results || []);
    const responseData = createPaginatedResponse(result, data.page, data.total_pages, data.total_results);
    setToCache(cacheKey, responseData);
    return responseData;
  } catch {
    return createPaginatedResponse([]);
  }
}

export async function getTrendingTVShows(timeWindow: "day" | "week" = "week"): Promise<(TMDBTVShow & { logo_url: string | null })[]> {
  try {
    const cacheKey = getCacheKey(`trending_tv_${timeWindow}`);
    const cached = getFromCache<(TMDBTVShow & { logo_url: string | null })[]>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/trending/tv/${timeWindow}?api_key=${apiKey}`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    const shows = filterValidTVShows(data?.results || []);
    const showsWithLogos = await Promise.all(
      shows.map(async (show) => {
        const logo_url = await getTvLogo(show.id);
        return { ...show, logo_url };
      })
    );
    setToCache(cacheKey, showsWithLogos);
    return showsWithLogos;
  } catch {
    return [];
  }
}

export async function getTopRatedTVShows(page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  try {
    const cacheKey = getCacheKey(`top_rated_tv_${page}`);
    const cached = getFromCache<TMDBPaginatedResponse<TMDBTVShow>>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/tv/top_rated?api_key=${apiKey}&page=${page}`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    if (!data) return createPaginatedResponse([]);
    const result = filterValidTVShows(data.results || []);
    const responseData = createPaginatedResponse(result, data.page, data.total_pages, data.total_results);
    setToCache(cacheKey, responseData);
    return responseData;
  } catch {
    return createPaginatedResponse([]);
  }
}

export async function getMovieCollection(collectionId: number): Promise<MovieCollection | null> {
  try {
    const cacheKey = getCacheKey(`movie_collection_${collectionId}`);
    const cached = getFromCache<MovieCollection>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/collection/${collectionId}?api_key=${apiKey}`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    if (!data) return null;
    const validParts = filterValidMovies(data.parts || []);
    const result = {
      id: data.id,
      name: data.name,
      overview: data.overview || "",
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      parts: validParts,
    };
    setToCache(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

export async function searchAll(query: string, page = 1) {
  if (!query.trim()) {
    return {
      movies: createPaginatedResponse<TMDBMovie>([]),
      tvShows: createPaginatedResponse<TMDBTVShow>([]),
      people: createPaginatedResponse<TMDBPerson>([]),
    };
  }
  try {
    const movieApiKey = getNextApiKey();
    const tvApiKey = getNextApiKey();
    const peopleApiKey = getNextApiKey();
    const movieUrl = `${TMDB_BASE_URL}/search/movie?api_key=${movieApiKey}&query=${encodeURIComponent(query)}&page=${page}`;
    const tvUrl = `${TMDB_BASE_URL}/search/tv?api_key=${tvApiKey}&query=${encodeURIComponent(query)}&page=${page}`;
    const peopleUrl = `${TMDB_BASE_URL}/search/person?api_key=${peopleApiKey}&query=${encodeURIComponent(query)}&page=${page}`;
    const [movieResponse, tvResponse, peopleResponse] = await Promise.all([
      safeFetch(movieUrl),
      safeFetch(tvUrl),
      safeFetch(peopleUrl)
    ]);
    const [movieData, tvData, peopleData] = await Promise.all([
      safeJsonParse(movieResponse),
      safeJsonParse(tvResponse),
      safeJsonParse(peopleResponse)
    ]);
    const movies = movieData ? filterValidMovies(movieData.results || []) : [];
    const tvShows = tvData ? filterValidTVShows(tvData.results || []) : [];
    const people = peopleData ? filterValidPeople(peopleData.results || []) : [];
    return {
      movies: createPaginatedResponse(movies, movieData?.page, movieData?.total_pages, movieData?.total_results),
      tvShows: createPaginatedResponse(tvShows, tvData?.page, tvData?.total_pages, tvData?.total_results),
      people: createPaginatedResponse(people, peopleData?.page, peopleData?.total_pages, peopleData?.total_results),
    };
  } catch {
    return {
      movies: createPaginatedResponse<TMDBMovie>([]),
      tvShows: createPaginatedResponse<TMDBTVShow>([]),
      people: createPaginatedResponse<TMDBPerson>([]),
    };
  }
}

export async function getHeroMovies(): Promise<(TMDBMovie & { logo_url: string | null })[]> {
  try {
    const [trending, nowPlaying] = await Promise.all([
      getTrendingMovies("week"),
      getNowPlayingMovies(1)
    ]);
    const combined = [...trending, ...(nowPlaying.results || [])];
    const unique = Array.from(new Map(combined.map((m) => [m.id, m])).values());
    const filtered = filterValidMovies(unique).slice(0, 10);
    const withLogos = await Promise.all(
      filtered.map(async (movie) => {
        const logo_url = await getMovieLogo(movie.id);
        return { ...movie, logo_url };
      })
    );
    return withLogos;
  } catch {
    return [];
  }
}

export async function getMovieDetails(id: number): Promise<MovieDetails | null> {
  try {
    const cacheKey = getCacheKey(`movie_details_comprehensive_${id}`);
    const cached = getFromCache<MovieDetails>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const requests = [
      safeFetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${apiKey}&language=ar`),
      safeFetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${apiKey}&language=en`),
      safeFetch(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${apiKey}` +
        `&append_to_response=release_dates,videos,images,keywords,credits,external_ids,recommendations,similar,watch/providers` +
        `&include_image_language=en,ar,null`
      )
    ];
    const [arRes, enRes, combinedRes] = await Promise.all(requests);
    const arData = arRes.ok ? await safeJsonParse(arRes) : {};
    const enData = enRes.ok ? await safeJsonParse(enRes) : {};
    const combinedData = combinedRes.ok ? await safeJsonParse(combinedRes) : {};
    const baseData = combinedData || enData || arData;
    const originalLanguage = baseData.original_language || "en";
    let finalTitle;
    if (originalLanguage === "ar") {
      finalTitle = arData?.title || baseData.original_title || baseData.title;
    } else {
      finalTitle = baseData.title || baseData.original_title || arData?.title;
    }
    const releaseDatesData = combinedData?.release_dates;
    const videosData = combinedData?.videos;
    const imagesData = combinedData?.images;
    const keywordsData = combinedData?.keywords;
    const creditsData = combinedData?.credits;
    const externalIdsData = combinedData?.external_ids;
    const recommendationsData = combinedData?.recommendations;
    const similarData = combinedData?.similar;
    const watchProvidersData = combinedData?.['watch/providers'];
    let ageRating = "";
    if (releaseDatesData?.results) {
      const usRelease = releaseDatesData.results.find((r: any) => r.iso_3166_1 === "US");
      const gbRelease = releaseDatesData.results.find((r: any) => r.iso_3166_1 === "GB");
      const anyRelease = releaseDatesData.results?.[0];
      ageRating = usRelease?.release_dates?.[0]?.certification ||
                  gbRelease?.release_dates?.[0]?.certification ||
                  anyRelease?.release_dates?.[0]?.certification ||
                  "";
    }
    const keywords = keywordsData?.keywords || [];
    const logo = imagesData?.logos?.find((l: any) => l.iso_639_1 === "en" || l.iso_639_1 === null) || imagesData?.logos?.[0];
    const logoUrl = logo?.file_path ? `${TMDB_IMAGE_BASE_URL}/original${logo.file_path}` : null;
    let collectionData = null;
    if (baseData.belongs_to_collection?.id) {
      collectionData = await getMovieCollection(baseData.belongs_to_collection.id);
    }
    const filteredRecommendations = recommendationsData?.results ? filterValidMovies(recommendationsData.results) : [];
    const filteredSimilar = similarData?.results ? filterValidMovies(similarData.results) : [];
    let similarMovies: any[] = filteredRecommendations.length ? filteredRecommendations : filteredSimilar;
    const merged: MovieDetails = {
      ...enData,
      id,
      imdb_id: externalIdsData?.imdb_id || baseData.imdb_id || enData?.imdb_id || null,
      title: finalTitle,
      original_title: enData?.original_title || arData?.original_title || "",
      original_language: originalLanguage,
      overview: arData?.overview?.trim() || enData?.overview?.trim() || "",
      tagline: arData?.tagline?.trim() || enData?.tagline?.trim() || "",
      age_rating: ageRating,
      certification: ageRating,
      media: {
        logo_url: logoUrl,
        logos: imagesData?.logos?.slice(0, 25) || [],
        backdrops: imagesData?.backdrops?.slice(0, 25) || [],
        posters: imagesData?.posters?.slice(0, 25) || [],
      },
      credits: creditsData || {},
      collection: collectionData,
      similar_movies: similarMovies,
      watch_providers: watchProvidersData?.results || {},
      genres: (arData?.genres?.length ? arData.genres : enData?.genres) || [],
      production_companies: enData?.production_companies || [],
      production_countries: enData?.production_countries || [],
      spoken_languages: enData?.spoken_languages || [],
      runtime: baseData.runtime || 0,
      status: baseData.status || "",
      budget: baseData.budget || 0,
      revenue: baseData.revenue || 0,
      homepage: baseData.homepage || null,
      videos: videosData,
      images: imagesData,
      keywords: {
        all: keywords,
        top_keywords: keywords.slice(0, 25),
        keyword_names: keywords.map((k: any) => k.name),
        total_count: keywords.length
      },
      belongs_to_collection: baseData.belongs_to_collection || null,
      external_ids: externalIdsData,
      recommendations: recommendationsData,
      translations: {
        translations: [
          { iso_639_1: "ar", data: { title: arData?.title || "", overview: arData?.overview || "" } },
          { iso_639_1: "en", data: { title: enData?.title || "", overview: enData?.overview || "" } }
        ]
      }
    };
    setToCache(cacheKey, merged);
    return merged;
  } catch (error) {
    console.error(`Error fetching movie details for ${id}:`, error);
    return null;
  }
}

export async function getTVShowDetails(id: number): Promise<TVShowDetails | null> {
  try {
    const cacheKey = getCacheKey(`tv_details_comprehensive_${id}`);
    const cached = getFromCache<TVShowDetails>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const requests = [
      safeFetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${apiKey}&language=ar`),
      safeFetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${apiKey}&language=en`),
      safeFetch(
        `${TMDB_BASE_URL}/tv/${id}?api_key=${apiKey}` +
        `&append_to_response=content_ratings,videos,images,keywords,credits,external_ids,recommendations,similar,watch/providers` +
        `&include_image_language=en,ar,null`
      )
    ];
    const [arRes, enRes, combinedRes] = await Promise.all(requests);
    const arData = arRes.ok ? await safeJsonParse(arRes) : {};
    const enData = enRes.ok ? await safeJsonParse(enRes) : {};
    const combinedData = combinedRes.ok ? await safeJsonParse(combinedRes) : {};
    const baseData = combinedData || enData || arData;
    const originalLanguage = baseData.original_language || "en";
    let finalName;
    if (originalLanguage === "ar") {
      finalName = arData?.name || baseData.original_name || baseData.name;
    } else {
      finalName = baseData.name || baseData.original_name || arData?.name;
    }
    const contentRatingsData = combinedData?.content_ratings;
    const videosData = combinedData?.videos;
    const imagesData = combinedData?.images;
    const keywordsData = combinedData?.keywords;
    const creditsData = combinedData?.credits;
    const externalIdsData = combinedData?.external_ids;
    const recommendationsData = combinedData?.recommendations;
    const similarData = combinedData?.similar;
    const watchProvidersData = combinedData?.['watch/providers'];
    let ageRating = "";
    if (contentRatingsData?.results) {
      const usCertification = contentRatingsData.results.find((cert: any) => cert.iso_3166_1 === "US");
      const gbCertification = contentRatingsData.results.find((cert: any) => cert.iso_3166_1 === "GB");
      const anyCertification = contentRatingsData.results?.[0];
      ageRating = usCertification?.rating || gbCertification?.rating || anyCertification?.rating || "";
    }
    const keywords = keywordsData?.results || [];
    const logo = imagesData?.logos?.find((logo: any) => logo.iso_639_1 === "en" || logo.iso_639_1 === null) || imagesData?.logos?.[0];
    const logoUrl = logo?.file_path ? `${TMDB_IMAGE_BASE_URL}/original${logo.file_path}` : null;
    const seasonsInfo = (baseData.seasons || [])
      .filter((season: any) => season.season_number > 0)
      .map((season: any) => {
        const arSeason = arData?.seasons?.find((s: any) => s.season_number === season.season_number);
        const enSeason = enData?.seasons?.find((s: any) => s.season_number === season.season_number);
        return {
          id: season.id,
          name: arSeason?.name?.trim() || enSeason?.name || season.name,
          season_number: season.season_number,
          episode_count: season.episode_count,
          air_date: season.air_date,
          poster_path: season.poster_path,
          overview: arSeason?.overview?.trim() || enSeason?.overview?.trim() || season.overview || "",
          vote_average: season.vote_average || 0,
        };
      });
    let seasonOneDetails = null;
    if (baseData.number_of_seasons >= 1) {
      try {
        seasonOneDetails = await getSeasonDetails(id, 1);
      } catch (error) {
        console.warn(`Failed to fetch season 1 details for TV show ${id}:`, error);
      }
    }
    let formattedSeasonOne = null;
    if (seasonOneDetails) {
      const arSeason = arData?.seasons?.find((s: any) => s.season_number === 1);
      const enSeason = enData?.seasons?.find((s: any) => s.season_number === 1);
      formattedSeasonOne = {
        id: seasonOneDetails.id,
        name: arSeason?.name?.trim() || enSeason?.name || seasonOneDetails.name,
        season_number: 1,
        air_date: seasonOneDetails.air_date,
        overview: arSeason?.overview?.trim() || enSeason?.overview?.trim() || seasonOneDetails.overview || "",
        vote_average: seasonOneDetails.vote_average || 0,
        poster_path: seasonOneDetails.poster_path,
        episode_count: seasonOneDetails.episodes?.length || 0,
        episodes: (seasonOneDetails.episodes || []).map((episode: any) => ({
          id: episode.id,
          name: episode.name,
          episode_number: episode.episode_number,
          overview: episode.overview,
          air_date: episode.air_date,
          runtime: episode.runtime,
          still_path: episode.still_path,
          vote_average: episode.vote_average,
          vote_count: episode.vote_count,
          crew: episode.crew || [],
          guest_stars: episode.guest_stars || []
        }))
      };
    }
    const filteredRecommendations = recommendationsData?.results ? filterValidTVShows(recommendationsData.results) : [];
    const filteredSimilar = similarData?.results ? filterValidTVShows(similarData.results) : [];
    let similarTVShows: any[] = filteredRecommendations.length ? filteredRecommendations : filteredSimilar;
    const merged: TVShowDetails = {
      ...baseData,
      id,
      imdb_id: externalIdsData?.imdb_id || baseData.imdb_id || enData?.imdb_id || null,
      name: finalName,
      original_name: enData?.original_name || arData?.original_name || baseData.original_name,
      original_language: originalLanguage,
      overview: arData?.overview?.trim() || enData?.overview?.trim() || baseData.overview?.trim() || "",
      tagline: arData?.tagline?.trim() || enData?.tagline?.trim() || "",
      age_rating: ageRating,
      certification: ageRating,
      media: {
        logo_url: logoUrl,
        logos: imagesData?.logos?.slice(0, 25) || [],
        backdrops: imagesData?.backdrops?.slice(0, 25) || [],
        posters: imagesData?.posters?.slice(0, 25) || [],
      },
      seasons: seasonsInfo,
      season_one: formattedSeasonOne,
      genres: (arData?.genres?.length ? arData.genres : enData?.genres) || baseData.genres || [],
      production_companies: baseData.production_companies || enData?.production_companies || [],
      production_countries: baseData.production_countries || enData?.production_countries || [],
      spoken_languages: baseData.spoken_languages || enData?.spoken_languages || [],
      number_of_seasons: baseData.number_of_seasons || enData?.number_of_seasons || 0,
      number_of_episodes: baseData.number_of_episodes || enData?.number_of_episodes || 0,
      status: baseData.status || enData?.status || "",
      in_production: baseData.in_production || enData?.in_production || false,
      episode_run_time: baseData.episode_run_time || enData?.episode_run_time || [],
      created_by: baseData.created_by || enData?.created_by || [],
      credits: { cast: creditsData?.cast || [] },
      similar_tvshows: similarTVShows,
      watch_providers: watchProvidersData?.results || {},
      networks: baseData.networks || [],
      homepage: baseData.homepage || null,
      first_air_date: baseData.first_air_date || "",
      last_air_date: baseData.last_air_date || "",
      next_episode_to_air: baseData.next_episode_to_air || null,
      type: baseData.type || "",
      languages: baseData.languages || [],
      origin_country: baseData.origin_country || [],
      videos: videosData,
      images: imagesData,
      keywords: {
        all: keywords,
        top_keywords: keywords.slice(0, 25),
        keyword_names: keywords.map((k: any) => k.name),
        total_count: keywords.length
      },
      external_ids: externalIdsData,
      recommendations: recommendationsData,
    };
    setToCache(cacheKey, merged);
    return merged;
  } catch (error) {
    console.error(`Error fetching TV show details for ${id}:`, error);
    return null;
  }
}

export async function getSeasonDetails(tvId: number, seasonNumber: number): Promise<Season | null> {
  try {
    const cacheKey = getCacheKey(`season_details_${tvId}_${seasonNumber}`);
    const cached = getFromCache<Season>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const url = `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey}&append_to_response=credits,videos,images&include_image_language=en,ar,null`;
    const response = await safeFetch(url);
    const data = await safeJsonParse(response);
    if (!data) return null;
    const episodes = (data.episodes || []).map((episode: any) => ({
      id: episode.id,
      name: episode.name,
      overview: episode.overview || "",
      still_path: episode.still_path || null,
      episode_number: episode.episode_number,
      season_number: episode.season_number,
      air_date: episode.air_date || "",
      vote_average: episode.vote_average || 0,
      runtime: episode.runtime || null,
      crew: episode.crew || [],
      guest_stars: episode.guest_stars || [],
      vote_count: episode.vote_count || 0
    }));
    const result: Season = {
      id: data.id,
      name: data.name,
      overview: data.overview || "",
      season_number: data.season_number,
      air_date: data.air_date || "",
      episodes,
      poster_path: data.poster_path,
      vote_average: data.vote_average || 0,
      episode_count: episodes.length
    };
    setToCache(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

export async function getPersonDetails(id: number): Promise<PersonDetails | null> {
  function cleanBiography(text: string): string {
    if (!text) return "";
    return text
      .replace(/\r?\n\s*\r?\n+/g, " ")
      .replace(/\r?\n/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim();
  }
  try {
    const cacheKey = getCacheKey(`person_details_comprehensive_${id}`);
    const cached = getFromCache<PersonDetails>(cacheKey);
    if (cached) return cached;
    const apiKey = getNextApiKey();
    const requests = [
      safeFetch(`${TMDB_BASE_URL}/person/${id}?api_key=${apiKey}&language=ar`),
      safeFetch(`${TMDB_BASE_URL}/person/${id}?api_key=${apiKey}&language=en`),
      safeFetch(
        `${TMDB_BASE_URL}/person/${id}?api_key=${apiKey}` +
        `&append_to_response=movie_credits,tv_credits,images,external_ids` +
        `&include_image_language=en,ar,null`
      )
    ];
    const [arRes, enRes, combinedRes] = await Promise.all(requests);
    const arData = arRes.ok ? await safeJsonParse(arRes) : {};
    const enData = enRes.ok ? await safeJsonParse(enRes) : {};
    const combinedData = combinedRes.ok ? await safeJsonParse(combinedRes) : {};
    const baseData = combinedData || enData || arData;
    const movieCredits = combinedData?.movie_credits || {};
    const tvCredits = combinedData?.tv_credits || {};
    const imagesData = combinedData?.images || {};
    const externalIdsData = combinedData?.external_ids || {};
    const rawMovieCast = (movieCredits.cast || [])
      .filter((credit: any) => credit && credit.id && credit.title)
      .map((credit: any) => ({ ...credit, credit_type: 'cast', media_type: 'movie', character: credit.character || '' }));
    const rawTVCast = (tvCredits.cast || [])
      .filter((credit: any) => credit && credit.id && credit.name)
      .map((credit: any) => ({ ...credit, credit_type: 'cast', media_type: 'tv', character: credit.character || '' }));
    const validMovies = filterValidMovies(rawMovieCast);
    const validTVShows = filterValidTVShows(rawTVCast);
    const uniqueMoviesMap = new Map();
    const uniqueTVShowsMap = new Map();
    validMovies.forEach(movie => { if (!uniqueMoviesMap.has(movie.id)) uniqueMoviesMap.set(movie.id, movie); });
    validTVShows.forEach(show => { if (!uniqueTVShowsMap.has(show.id)) uniqueTVShowsMap.set(show.id, show); });
    const uniqueMovies = Array.from(uniqueMoviesMap.values());
    const uniqueTVShows = Array.from(uniqueTVShowsMap.values());
    const uniqueWorksMap = new Map();
    uniqueMovies.forEach(movie => { uniqueWorksMap.set(`movie-${movie.id}`, movie); });
    uniqueTVShows.forEach(show => { uniqueWorksMap.set(`tv-${show.id}`, show); });
    const allWorks = Array.from(uniqueWorksMap.values()).sort((a, b) => {
      const dateA = a.release_date || a.first_air_date;
      const dateB = b.release_date || b.first_air_date;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    const knownFor = allWorks.filter((work: any) => work.poster_path && (work.vote_average || 0) > 0).slice(0, 20);
    const profiles = (imagesData.profiles || [])
      .map((img: any) => ({ file_path: img.file_path, aspect_ratio: img.aspect_ratio, height: img.height, width: img.width, vote_average: img.vote_average, vote_count: img.vote_count }))
      .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0));
    const socialMedia = {
      facebook: externalIdsData.facebook_id ? `https://www.facebook.com/${externalIdsData.facebook_id}` : null,
      instagram: externalIdsData.instagram_id ? `https://www.instagram.com/${externalIdsData.instagram_id}` : null,
      twitter: externalIdsData.twitter_id ? `https://twitter.com/${externalIdsData.twitter_id}` : null,
      youtube: externalIdsData.youtube_id ? `https://www.youtube.com/${externalIdsData.youtube_id}` : null,
      tiktok: externalIdsData.tiktok_id ? `https://www.tiktok.com/@${externalIdsData.tiktok_id}` : null,
      imdb: externalIdsData.imdb_id ? `https://www.imdb.com/name/${externalIdsData.imdb_id}` : null,
      wikidata: externalIdsData.wikidata_id ? `https://www.wikidata.org/wiki/${externalIdsData.wikidata_id}` : null
    };
    const merged: PersonDetails = {
      id,
      name: enData?.name?.trim() || baseData.name?.trim() || "",
      original_name: baseData.original_name || "",
      arabic_name: arData?.name?.trim() || "",
      biography: cleanBiography(arData?.biography || enData?.biography || baseData.biography || ""),
      arabic_biography: cleanBiography(arData?.biography || ""),
      english_biography: cleanBiography(enData?.biography || baseData.biography || ""),
      birthday: baseData.birthday || null,
      deathday: baseData.deathday || null,
      place_of_birth: arData?.place_of_birth?.trim() || enData?.place_of_birth?.trim() || baseData.place_of_birth || null,
      arabic_place_of_birth: arData?.place_of_birth?.trim() || "",
      english_place_of_birth: enData?.place_of_birth?.trim() || baseData.place_of_birth || "",
      also_known_as: baseData.also_known_as || [],
      gender: baseData.gender || 0,
      known_for_department: baseData.known_for_department || "",
      popularity: baseData.popularity || 0,
      profile_path: baseData.profile_path || null,
      media: {
        profiles: profiles,
        profile_url: baseData.profile_path ? `${TMDB_IMAGE_BASE_URL}/original${baseData.profile_path}` : null
      },
      external_ids: externalIdsData || {},
      social_media: socialMedia,
      credits: {
        movie: { cast: uniqueMovies },
        tv: { cast: uniqueTVShows },
        all: allWorks,
        known_for: knownFor
      },
      statistics: {
        total_movies: uniqueMovies.length,
        total_tv_shows: uniqueTVShows.length,
        total_credits: allWorks.length
      }
    };
    setToCache(cacheKey, merged);
    return merged;
  } catch (error) {
    console.error(`Error fetching person details for ${id}:`, error);
    return null;
  }
}

export function getLogoUrl(images?: { logos?: { file_path: string; iso_639_1: string }[] }): string | null {
  if (!images?.logos?.length) return null;
  const en = images.logos.find((l) => l.iso_639_1 === "en");
  const ar = images.logos.find((l) => l.iso_639_1 === "ar");
  const logo = ar || en || images.logos[0];
  return logo ? `${TMDB_IMAGE_BASE_URL}/w500${logo.file_path}` : null;
}

export function getTrailerKey(videos?: { results?: { key: string; site: string; type: string; official?: boolean }[] }): string | null {
  if (!videos?.results?.length) return null;
  const yt = videos.results.filter((v) => v.site === "YouTube");
  const official = yt.find((v) => v.type === "Trailer" && v.official);
  const trailer = official || yt.find((v) => v.type === "Trailer") || yt[0];
  return trailer?.key || null;
}

export function getYear(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const y = new Date(dateStr).getFullYear();
  return isNaN(y) ? "" : String(y);
}

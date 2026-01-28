/**
 * Islamic APIs Client
 * Handles all external API calls for Islamic data
 */

// ========================================
// TYPES
// ========================================

export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
}

export interface HijriDate {
    date: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
}

export interface GregorianDate {
    date: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
}

export interface PrayerTimesResponse {
    timings: PrayerTimes;
    date: {
        readable: string;
        timestamp: string;
        hijri: HijriDate;
        gregorian: GregorianDate;
    };
    meta: {
        latitude: number;
        longitude: number;
        timezone: string;
        method: { id: number; name: string };
    };
}

export interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: 'Meccan' | 'Medinan';
    numberOfAyahs: number;
}

export interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    page: number;
    hizbQuarter: number;
}

export interface SurahDetail extends Surah {
    ayahs: Ayah[];
}

export interface Reciter {
    id: number;
    name: string;
    style?: string;
}

export interface ChapterRecitation {
    id: number;
    chapter_id: number;
    file_size: number;
    format: string;
    audio_url: string;
}

export interface Hadith {
    number: number;
    arab: string;
    id: string;
    narrator?: string;
    grade?: string;
}

export interface HadithResponse {
    hadiths: Hadith[];
    pagination: {
        total: number;
        limit: number;
        current_page: number;
        total_pages: number;
    };
}

export interface Dhikr {
    zekr: string;
    repeat: number;
    bless: string;
    source?: string;
}

export interface AzkarCategory {
    title: string;
    content: Dhikr[];
}

export interface RadioStation {
    id: number;
    name: string;
    radio_url: string;
    image_url?: string;
}

// ========================================
// PRAYER TIMES API (AlAdhan)
// ========================================

const ALADHAN_BASE = 'https://api.aladhan.com/v1';

/**
 * Get prayer times by city
 * @param city City name
 * @param country Country name
 * @param method Calculation method (default: 3 - Muslim World League)
 */
export async function getPrayerTimesByCity(
    city: string,
    country: string,
    method: number = 3
): Promise<PrayerTimesResponse | null> {
    try {
        const response = await fetch(
            `${ALADHAN_BASE}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`
        );
        const data = await response.json();

        if (data.code === 200 && data.data) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch prayer times:', error);
        return null;
    }
}

/**
 * Get prayer times by coordinates
 */
export async function getPrayerTimesByCoords(
    latitude: number,
    longitude: number,
    method: number = 3
): Promise<PrayerTimesResponse | null> {
    try {
        const response = await fetch(
            `${ALADHAN_BASE}/timings?latitude=${latitude}&longitude=${longitude}&method=${method}`
        );
        const data = await response.json();

        if (data.code === 200 && data.data) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch prayer times:', error);
        return null;
    }
}

/**
 * Get monthly prayer calendar
 */
export async function getMonthlyPrayerTimes(
    city: string,
    country: string,
    year: number,
    month: number,
    method: number = 3
): Promise<PrayerTimesResponse[] | null> {
    try {
        const response = await fetch(
            `${ALADHAN_BASE}/calendarByCity/${year}/${month}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`
        );
        const data = await response.json();

        if (data.code === 200 && data.data) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch monthly prayer times:', error);
        return null;
    }
}

// ========================================
// QURAN API (AlQuran Cloud)
// ========================================

const QURAN_BASE = 'https://api.alquran.cloud/v1';

/**
 * Get all surahs
 */
export async function getAllSurahs(): Promise<Surah[] | null> {
    try {
        const response = await fetch(`${QURAN_BASE}/surah`);
        const data = await response.json();

        if (data.code === 200 && data.data) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch surahs:', error);
        return null;
    }
}

/**
 * Get a specific surah with all ayahs
 */
export async function getSurah(surahNumber: number): Promise<SurahDetail | null> {
    try {
        const response = await fetch(`${QURAN_BASE}/surah/${surahNumber}`);
        const data = await response.json();

        if (data.code === 200 && data.data) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch surah:', error);
        return null;
    }
}

/**
 * Get surah with French translation
 */
export async function getSurahWithTranslation(
    surahNumber: number,
    edition: string = 'fr.hamidullah'
): Promise<SurahDetail | null> {
    try {
        const response = await fetch(`${QURAN_BASE}/surah/${surahNumber}/${edition}`);
        const data = await response.json();

        if (data.code === 200 && data.data) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch surah with translation:', error);
        return null;
    }
}

// ========================================
// QURAN AUDIO API (Quran.com)
// ========================================

const QURAN_AUDIO_BASE = 'https://api.quran.com/api/v4';

/**
 * Get available reciters
 */
export async function getReciters(): Promise<Reciter[] | null> {
    try {
        const response = await fetch(`${QURAN_AUDIO_BASE}/resources/recitations`);
        const data = await response.json();

        if (data.recitations) {
            return data.recitations;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch reciters:', error);
        return null;
    }
}

/**
 * Get audio for a chapter
 */
export async function getChapterAudio(
    reciterId: number,
    chapterNumber: number
): Promise<ChapterRecitation | null> {
    try {
        const response = await fetch(
            `${QURAN_AUDIO_BASE}/chapter_recitations/${reciterId}/${chapterNumber}`
        );
        const data = await response.json();

        if (data.audio_file) {
            return data.audio_file;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch chapter audio:', error);
        return null;
    }
}

// ========================================
// TAFSIR API (QuranEnc)
// ========================================

const TAFSIR_BASE = 'https://quranenc.com/api/v1';

/**
 * Get tafsir for a surah
 */
export async function getTafsirForSurah(
    surahNumber: number,
    language: string = 'french_montada'
): Promise<TafsirAyah[] | null> {
    try {
        const response = await fetch(
            `${TAFSIR_BASE}/translation/sura/${language}/${surahNumber}`
        );
        const data = await response.json();

        if (data.result) {
            return data.result;
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch tafsir:', error);
        return null;
    }
}

/**
 * Get tafsir for a specific ayah
 */
export async function getTafsirForAyah(
    surahNumber: number,
    ayahNumber: number,
    language: string = 'french_montada'
): Promise<TafsirAyah | null> {
    try {
        const response = await fetch(
            `${TAFSIR_BASE}/translation/aya/${language}/${surahNumber}/${ayahNumber}`
        );
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            return data.result[0];
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch tafsir for ayah:', error);
        return null;
    }
}

// ========================================
// HADITH API
// ========================================

const HADITH_BASE = 'https://hadis-api-id.vercel.app/hadith';

export type HadithCollection = 'bukhari' | 'muslim' | 'abu-dawud' | 'tirmidzi' | 'nasai' | 'ibnu-majah';

/**
 * Get hadiths from a collection
 */
export async function getHadiths(
    collection: HadithCollection,
    page: number = 1,
    limit: number = 20
): Promise<HadithResponse | null> {
    try {
        const response = await fetch(
            `${HADITH_BASE}/${collection}?page=${page}&limit=${limit}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch hadiths:', error);
        return null;
    }
}

/**
 * Get a specific hadith
 */
export async function getHadith(
    collection: HadithCollection,
    number: number
): Promise<Hadith | null> {
    try {
        const response = await fetch(`${HADITH_BASE}/${collection}/${number}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch hadith:', error);
        return null;
    }
}

// ========================================
// AZKAR API
// ========================================

const AZKAR_URL = 'https://raw.githubusercontent.com/nawafalqari/azkar-api/main/azkar.json';

let azkarCache: Record<string, AzkarCategory> | null = null;

/**
 * Get all azkar
 */
export async function getAllAzkar(): Promise<Record<string, AzkarCategory> | null> {
    if (azkarCache) return azkarCache;

    try {
        const response = await fetch(AZKAR_URL);
        const data = await response.json();
        azkarCache = data;
        return data;
    } catch (error) {
        console.error('Failed to fetch azkar:', error);
        return null;
    }
}

/**
 * Get azkar by category
 */
export async function getAzkarByCategory(category: string): Promise<AzkarCategory | null> {
    const allAzkar = await getAllAzkar();
    if (!allAzkar) return null;

    return allAzkar[category] || null;
}

// ========================================
// QURAN RADIO API
// ========================================

const RADIO_URL = 'https://data-rosy.vercel.app/radio.json';

let radioCache: RadioStation[] | null = null;

/**
 * Get all radio stations
 */
export async function getRadioStations(): Promise<RadioStation[] | null> {
    if (radioCache) return radioCache;

    try {
        const response = await fetch(RADIO_URL);
        const data = await response.json();
        radioCache = data;
        return data;
    } catch (error) {
        console.error('Failed to fetch radio stations:', error);
        return null;
    }
}

// ========================================
// QURANENC TAFSIR API
// ========================================

const QURANENC_BASE_URL = 'https://quranenc.com/api/v1';

// French tafsir key - using "french_mokhtasar" which is a simplified tafsir in French
// Alternative: "french_hamidullah" for Hamidullah translation
const FRENCH_TAFSIR_KEY = 'french_mokhtasar';

export interface TafsirAyah {
    id: number;
    sura: number;
    aya: number;
    arabic_text: string;
    translation: string;
    footnotes?: string;
}

export interface TafsirResponse {
    result: TafsirAyah[];
}

// Cache for tafsir data
const tafsirCache: Record<string, TafsirAyah[]> = {};

/**
 * Get tafsir for an entire surah
 * Uses local proxy to avoid CORS issues
 */
export async function getSurahTafsir(surahNumber: number): Promise<TafsirAyah[] | null> {
    const cacheKey = `surah_${surahNumber}`;

    if (tafsirCache[cacheKey]) {
        return tafsirCache[cacheKey];
    }

    try {
        // Use local proxy to avoid CORS issues
        const isClient = typeof window !== 'undefined';
        const url = isClient
            ? `/api/tafsir?surah=${surahNumber}`
            : `${QURANENC_BASE_URL}/translation/sura/${FRENCH_TAFSIR_KEY}/${surahNumber}`;

        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            console.error('Tafsir API error:', response.status);
            return null;
        }

        const data: TafsirResponse = await response.json();

        if (data.result && data.result.length > 0) {
            tafsirCache[cacheKey] = data.result;
            return data.result;
        }

        return null;
    } catch (error) {
        console.error('Failed to fetch surah tafsir:', error);
        return null;
    }
}

/**
 * Get tafsir for a specific ayah
 */
export async function getAyahTafsir(surahNumber: number, ayahNumber: number): Promise<TafsirAyah | null> {
    // Try to get from surah cache first
    const surahTafsir = await getSurahTafsir(surahNumber);

    if (surahTafsir) {
        const ayah = surahTafsir.find(a => a.aya === ayahNumber);
        if (ayah) return ayah;
    }

    // If not in cache, fetch specific ayah
    try {
        const response = await fetch(
            `${QURANENC_BASE_URL}/translation/aya/${FRENCH_TAFSIR_KEY}/${surahNumber}/${ayahNumber}`,
            { headers: { 'Accept': 'application/json' } }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.result || null;
    } catch (error) {
        console.error('Failed to fetch ayah tafsir:', error);
        return null;
    }
}

// ========================================
// FAWAZAHMED0 HADITH API
// ========================================

const HADITH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

// Available hadith collections with French translations
export const HADITH_COLLECTIONS = [
    { id: 'bukhari', name: 'Sahih al-Bukhari', frenchKey: 'fra-bukhari', arabicKey: 'ara-bukhari' },
    { id: 'muslim', name: 'Sahih Muslim', frenchKey: 'fra-muslim', arabicKey: 'ara-muslim' },
    { id: 'abudawud', name: 'Sunan Abu Dawud', frenchKey: 'fra-abudawud', arabicKey: 'ara-abudawud' },
    { id: 'tirmidhi', name: 'Jami at-Tirmidhi', frenchKey: 'fra-tirmidhi', arabicKey: 'ara-tirmidhi' },
    { id: 'ibnmajah', name: 'Sunan Ibn Majah', frenchKey: 'fra-ibnmajah', arabicKey: 'ara-ibnmajah' },
    { id: 'nasai', name: 'Sunan an-Nasa\'i', frenchKey: 'fra-nasai', arabicKey: 'ara-nasai' },
];

export interface HadithItem {
    hadithnumber: number;
    text: string;
    grades?: { name: string; grade: string }[];
}

export interface HadithEdition {
    metadata: {
        name: string;
        collection: string;
        language: string;
    };
    hadiths: HadithItem[];
}

// Cache for hadith data
const hadithCache: Record<string, HadithEdition> = {};

/**
 * Get all hadiths from a specific edition
 */
export async function getHadithEdition(editionKey: string): Promise<HadithEdition | null> {
    if (hadithCache[editionKey]) {
        return hadithCache[editionKey];
    }

    try {
        const response = await fetch(
            `${HADITH_API_BASE}/editions/${editionKey}.min.json`,
            { headers: { 'Accept': 'application/json' } }
        );

        if (!response.ok) {
            // Try non-minified version as fallback
            const fallbackResponse = await fetch(
                `${HADITH_API_BASE}/editions/${editionKey}.json`,
                { headers: { 'Accept': 'application/json' } }
            );
            if (!fallbackResponse.ok) return null;
            const data = await fallbackResponse.json();
            hadithCache[editionKey] = data;
            return data;
        }

        const data = await response.json();
        hadithCache[editionKey] = data;
        return data;
    } catch (error) {
        console.error('Failed to fetch hadith edition:', error);
        return null;
    }
}

/**
 * Get a specific hadith by number from fawazahmed0 API
 */
export async function getHadithByNumber(editionKey: string, hadithNumber: number): Promise<HadithItem | null> {
    try {
        const response = await fetch(
            `${HADITH_API_BASE}/editions/${editionKey}/${hadithNumber}.json`,
            { headers: { 'Accept': 'application/json' } }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.hadiths?.[0] || null;
    } catch (error) {
        console.error('Failed to fetch hadith:', error);
        return null;
    }
}

/**
 * Get random hadiths from a collection (French + Arabic paired)
 */
export async function getRandomHadiths(
    collectionId: string = 'bukhari',
    count: number = 10
): Promise<{ french: HadithItem; arabic: HadithItem }[] | null> {
    const collection = HADITH_COLLECTIONS.find(c => c.id === collectionId);
    if (!collection) return null;

    try {
        const [frenchData, arabicData] = await Promise.all([
            getHadithEdition(collection.frenchKey),
            getHadithEdition(collection.arabicKey),
        ]);

        if (!frenchData || !arabicData) return null;

        const frenchHadiths = frenchData.hadiths;
        const arabicHadiths = arabicData.hadiths;

        // Get random indices
        const maxIndex = Math.min(frenchHadiths.length, arabicHadiths.length);
        const indices: number[] = [];

        while (indices.length < Math.min(count, maxIndex)) {
            const randomIndex = Math.floor(Math.random() * maxIndex);
            if (!indices.includes(randomIndex)) {
                indices.push(randomIndex);
            }
        }

        return indices.map(index => ({
            french: frenchHadiths[index],
            arabic: arabicHadiths[index],
        }));
    } catch (error) {
        console.error('Failed to get random hadiths:', error);
        return null;
    }
}

/**
 * Get hadiths by range (for pagination)
 */
export async function getHadithsByRange(
    collectionId: string,
    start: number,
    end: number
): Promise<{ french: HadithItem; arabic: HadithItem }[] | null> {
    const collection = HADITH_COLLECTIONS.find(c => c.id === collectionId);
    if (!collection) return null;

    try {
        const [frenchData, arabicData] = await Promise.all([
            getHadithEdition(collection.frenchKey),
            getHadithEdition(collection.arabicKey),
        ]);

        if (!frenchData || !arabicData) return null;

        const results: { french: HadithItem; arabic: HadithItem }[] = [];

        for (let i = start; i <= end && i < frenchData.hadiths.length; i++) {
            results.push({
                french: frenchData.hadiths[i],
                arabic: arabicData.hadiths[i] || frenchData.hadiths[i],
            });
        }

        return results;
    } catch (error) {
        console.error('Failed to get hadiths by range:', error);
        return null;
    }
}

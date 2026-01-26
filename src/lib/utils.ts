import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format time from 24h to 12h format with AM/PM
 */
export function formatTime12h(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format time keeping 24h format (HH:MM)
 */
export function formatTime24h(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

/**
 * Get time remaining until a specific time today
 */
export function getTimeUntil(targetTime: string): {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isPast: boolean;
} {
    const now = new Date();
    const [targetHours, targetMinutes] = targetTime.split(':').map(Number);

    const target = new Date();
    target.setHours(targetHours, targetMinutes, 0, 0);

    // If target time has passed today, it's for tomorrow
    if (target <= now) {
        return {
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
            isPast: true,
        };
    }

    const diffMs = target.getTime() - now.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, totalSeconds, isPast: false };
}

/**
 * Format countdown display
 */
export function formatCountdown(hours: number, minutes: number, seconds: number): string {
    if (hours > 0) {
        return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

/**
 * Get current Hijri date (approximate calculation)
 * Note: For accurate Hijri dates, use the API
 */
export function getApproximateHijriDate(): {
    day: number;
    month: number;
    year: number;
    monthName: string;
} {
    const hijriMonths = [
        'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];

    const gregorian = new Date();
    const gregorianYear = gregorian.getFullYear();
    const gregorianMonth = gregorian.getMonth();
    const gregorianDay = gregorian.getDate();

    // Approximate Hijri calculation
    const jd = Math.floor((1461 * (gregorianYear + 4800 + Math.floor((gregorianMonth - 14) / 12))) / 4) +
        Math.floor((367 * (gregorianMonth - 2 - 12 * Math.floor((gregorianMonth - 14) / 12))) / 12) -
        Math.floor((3 * Math.floor((gregorianYear + 4900 + Math.floor((gregorianMonth - 14) / 12)) / 100)) / 4) +
        gregorianDay - 32075;

    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
        Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
        Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const month = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * month) / 24);
    const year = 30 * n + j - 30;

    return {
        day,
        month,
        year,
        monthName: hijriMonths[month - 1] || 'Unknown',
    };
}

/**
 * Format number with Arabic numerals
 */
export function toArabicNumerals(num: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => {
        const n = parseInt(digit);
        return isNaN(n) ? digit : arabicNumerals[n];
    }).join('');
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Local storage helpers with SSR safety
 */
export const storage = {
    get: <T>(key: string, defaultValue: T): T => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },

    set: <T>(key: string, value: T): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            console.error('Failed to save to localStorage');
        }
    },

    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(key);
        } catch {
            console.error('Failed to remove from localStorage');
        }
    },
};

/**
 * Storage keys used in the app
 */
export const STORAGE_KEYS = {
    ACTIVATED: 'ramadan_app_activated',
    ACTIVATION_PHONE: 'ramadan_app_phone',
    TASBIH_HISTORY: 'ramadan_tasbih_history',
    PLANNER_DATA: 'ramadan_planner_data',
    QURAN_BOOKMARKS: 'ramadan_quran_bookmarks',
    PREFERRED_CITY: 'ramadan_preferred_city',
    LOCATION: 'ramadan_location',
    THEME: 'ramadan_theme',
    DAILY_CHALLENGES: 'ramadan_daily_challenges',
} as const;

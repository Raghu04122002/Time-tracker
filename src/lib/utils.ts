import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Chicago';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDuration(ms: number) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatTime(date: Date | string | null) {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString([], {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Timezone Helpers
export function getCDTStartOfCurrentWeek(now = new Date()) {
    // 1. Convert Now (UTC) -> CDT
    const zonedNow = toZonedTime(now, TIMEZONE);

    // 2. Calculate days to subtract to get to Monday (1)
    // Sunday (0) -> 6 days ago
    // Monday (1) -> 0 days ago
    // Tuesday (2) -> 1 day ago
    const day = zonedNow.getDay();
    const diff = (day + 6) % 7;

    // 3. Create CDT date for Monday 00:00:00
    const zonedMonday = new Date(zonedNow);
    zonedMonday.setDate(zonedNow.getDate() - diff);
    zonedMonday.setHours(0, 0, 0, 0);

    // 4. Convert CDT Monday 00:00:00 -> UTC
    return fromZonedTime(zonedMonday, TIMEZONE);
}

export function getCDTStartOfToday(now = new Date()) {
    const zonedNow = toZonedTime(now, TIMEZONE);
    zonedNow.setHours(0, 0, 0, 0);
    return fromZonedTime(zonedNow, TIMEZONE);
}

export function getCDTStartOfMonth(now = new Date()) {
    const zonedNow = toZonedTime(now, TIMEZONE);
    zonedNow.setDate(1);
    zonedNow.setHours(0, 0, 0, 0);
    return fromZonedTime(zonedNow, TIMEZONE);
}

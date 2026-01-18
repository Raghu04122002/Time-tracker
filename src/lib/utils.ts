'use strict';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

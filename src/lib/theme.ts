import { GlobalSettings } from '@prisma/client';

export interface ThemeConfig {
    primaryColor: string;
    backgroundColor: string;
    surfaceColor: string;
    textColor: string;
    fontFamily: string;
    borderRadius: string;
}

export const defaultTheme: ThemeConfig = {
    primaryColor: '#3b82f6', // blue-500
    backgroundColor: '#0d1117', // midnight
    surfaceColor: '#161b22', // surface
    textColor: '#f3f4f6', // gray-100
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
};

export const themes: Record<string, ThemeConfig> = {
    default: defaultTheme,
    ocean: {
        primaryColor: '#0ea5e9', // sky-500
        backgroundColor: '#0f172a', // slate-900
        surfaceColor: '#1e293b', // slate-800
        textColor: '#f1f5f9',
        fontFamily: 'Inter',
        borderRadius: '0.75rem',
    },
    forest: {
        primaryColor: '#10b981', // emerald-500
        backgroundColor: '#022c22', // emerald-950
        surfaceColor: '#064e3b', // emerald-900
        textColor: '#ecfdf5',
        fontFamily: 'Roboto',
        borderRadius: '0.25rem',
    },
    purple: {
        primaryColor: '#8b5cf6', // violet-500
        backgroundColor: '#1e1b4b', // indigo-950
        surfaceColor: '#312e81', // indigo-900
        textColor: '#f5f3ff',
        fontFamily: 'Outfit',
        borderRadius: '1rem',
    },
    morning: {
        primaryColor: '#0ea5e9', // sky-500
        backgroundColor: '#f0f9ff', // sky-50
        surfaceColor: '#ffffff',
        textColor: '#0c4a6e', // sky-900
        fontFamily: 'Inter',
        borderRadius: '0.5rem',
    },
    blossom: {
        primaryColor: '#ec4899', // pink-500
        backgroundColor: '#fdf2f8', // pink-50
        surfaceColor: '#ffffff',
        textColor: '#831843', // pink-900
        fontFamily: 'Outfit',
        borderRadius: '1rem',
    },
    mint: {
        primaryColor: '#10b981', // emerald-500
        backgroundColor: '#f0fdf4', // emerald-50
        surfaceColor: '#ffffff',
        textColor: '#064e3b', // emerald-900
        fontFamily: 'Roboto',
        borderRadius: '0.25rem',
    },
};

export function applyTheme(config: ThemeConfig) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--color-primary', config.primaryColor);
    root.style.setProperty('--color-background', config.backgroundColor);
    root.style.setProperty('--color-surface', config.surfaceColor);
    root.style.setProperty('--color-text', config.textColor);
    root.style.setProperty('--font-family-sans', config.fontFamily);
    root.style.setProperty('--radius', config.borderRadius);
}

export function getThemeFromSettings(settings: GlobalSettings | null): ThemeConfig {
    if (!settings) return defaultTheme;

    return {
        primaryColor: settings.primaryColor,
        backgroundColor: settings.backgroundColor || defaultTheme.backgroundColor,
        surfaceColor: settings.surfaceColor || defaultTheme.surfaceColor,
        textColor: settings.textColor || defaultTheme.textColor,
        fontFamily: settings.fontFamily,
        borderRadius: settings.borderRadius,
    };
}

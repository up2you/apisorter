import { useEffect, useState } from 'react';
import { applyTheme, defaultTheme } from '@/lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initial application of default theme
        applyTheme(defaultTheme);

        // Fetch settings
        fetch('/api/settings')
            .then((res) => res.json())
            .then((settings) => {
                if (settings && settings.primaryColor) {
                    applyTheme({
                        primaryColor: settings.primaryColor,
                        backgroundColor: settings.backgroundColor || defaultTheme.backgroundColor,
                        surfaceColor: settings.surfaceColor || defaultTheme.surfaceColor,
                        textColor: settings.textColor || defaultTheme.textColor,
                        fontFamily: settings.fontFamily,
                        borderRadius: settings.borderRadius,
                    });
                }
            })
            .catch((err) => console.error('Failed to load theme:', err));
    }, []);

    if (!mounted) return <>{children}</>;

    return <>{children}</>;
}

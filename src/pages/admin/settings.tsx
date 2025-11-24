import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import prisma from '@/lib/prisma';
import { applyTheme, themes, ThemeConfig } from '@/lib/theme';
import { useRouter } from 'next/router';

interface SettingsProps {
    initialSettings: ThemeConfig & { theme: string };
}

export default function AdminSettings({ initialSettings }: SettingsProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [currentSettings, setCurrentSettings] = useState(initialSettings);

    const handleThemeChange = (themeName: string) => {
        const theme = themes[themeName];
        if (theme) {
            const newSettings = {
                ...currentSettings,
                theme: themeName,
                ...theme,
            };
            setCurrentSettings(newSettings);
            applyTheme(newSettings); // Live preview
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentSettings),
            });

            if (!res.ok) throw new Error('Failed to save');

            // Refresh to ensure server state is synced
            router.replace(router.asPath);
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-8">Site Settings</h1>

            <div className="bg-surface p-8 rounded-lg border border-gray-800 max-w-2xl">
                <h2 className="text-xl font-bold mb-6">Theme & Appearance</h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Preset Themes</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Object.keys(themes).map((themeName) => (
                                <button
                                    key={themeName}
                                    onClick={() => handleThemeChange(themeName)}
                                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${currentSettings.theme === themeName
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-700 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex gap-1">
                                        <div
                                            className="w-4 h-8 rounded-l-full"
                                            style={{ backgroundColor: themes[themeName].backgroundColor }}
                                        />
                                        <div
                                            className="w-4 h-8 rounded-r-full"
                                            style={{ backgroundColor: themes[themeName].primaryColor }}
                                        />
                                    </div>
                                    <span className="capitalize">{themeName}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-800">
                        <h3 className="text-lg font-semibold mb-4">Customization</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Primary Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={currentSettings.primaryColor}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const newSettings = { ...currentSettings, primaryColor: val, theme: 'custom' };
                                            setCurrentSettings(newSettings);
                                            applyTheme(newSettings);
                                        }}
                                        className="h-10 w-20 rounded bg-transparent border border-gray-700 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={currentSettings.primaryColor}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const newSettings = { ...currentSettings, primaryColor: val, theme: 'custom' };
                                            setCurrentSettings(newSettings);
                                            applyTheme(newSettings);
                                        }}
                                        className="flex-1 bg-midnight border border-gray-700 rounded px-3 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Background Color</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={currentSettings.backgroundColor}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const newSettings = { ...currentSettings, backgroundColor: val, theme: 'custom' };
                                            setCurrentSettings(newSettings);
                                            applyTheme(newSettings);
                                        }}
                                        className="h-10 w-20 rounded bg-transparent border border-gray-700 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={currentSettings.backgroundColor}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const newSettings = { ...currentSettings, backgroundColor: val, theme: 'custom' };
                                            setCurrentSettings(newSettings);
                                            applyTheme(newSettings);
                                        }}
                                        className="flex-1 bg-midnight border border-gray-700 rounded px-3 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const settings = await prisma.globalSettings.findFirst();

    return {
        props: {
            initialSettings: {
                theme: settings?.theme || 'default',
                primaryColor: settings?.primaryColor || '#3b82f6',
                backgroundColor: settings?.backgroundColor || '#0d1117',
                surfaceColor: settings?.surfaceColor || '#161b22',
                textColor: settings?.textColor || '#f3f4f6',
                fontFamily: settings?.fontFamily || 'Inter',
                borderRadius: settings?.borderRadius || '0.5rem',
            },
        },
    };
};

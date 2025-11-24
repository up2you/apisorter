import { useState } from 'react';
import { useRouter } from 'next/router';
import { Provider } from '@prisma/client';

interface ProviderFormProps {
    initialData?: Partial<Provider>;
    isEdit?: boolean;
}

export function ProviderForm({ initialData = {}, isEdit = false }: ProviderFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        website: initialData.website || '',
        logoUrl: initialData.logoUrl || '',
        contact: initialData.contact || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEdit
                ? `/api/admin/providers/${initialData.id}`
                : '/api/admin/providers';

            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to save');

            router.push('/admin/providers');
        } catch (error) {
            console.error(error);
            alert('Error saving provider');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-surface p-8 rounded-lg border border-gray-800">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Website URL</label>
                <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Logo URL</label>
                <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Contact Info</label>
                <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                />
            </div>

            <div className="pt-4 flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Saving...' : isEdit ? 'Update Provider' : 'Create Provider'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-transparent border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

import { useState } from 'react';
import { useRouter } from 'next/router';
import { Api, Provider } from '@prisma/client';

interface ApiFormProps {
    initialData?: Partial<Api>;
    providers: Provider[];
    isEdit?: boolean;
}

export function ApiForm({ initialData = {}, providers, isEdit = false }: ApiFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [autofilling, setAutofilling] = useState(false);
    const [autofillUrl, setAutofillUrl] = useState('');

    const [formData, setFormData] = useState({
        name: initialData.name || '',
        providerId: initialData.providerId || (providers[0]?.id || ''),
        category: initialData.category || '',
        description: initialData.description || '',
        docsUrl: initialData.docsUrl || '',
        registrationUrl: initialData.registrationUrl || '',
        pricingUrl: initialData.pricingUrl || '',
        changelogUrl: initialData.changelogUrl || '',
        sourceUrl: initialData.sourceUrl || '',
        logoUrl: initialData.logoUrl || '',
        freeTier: initialData.freeTier || '',
        pricingPlan: initialData.pricingPlan || '',
        pricingModel: initialData.pricingModel || '',
        supportedRegions: initialData.supportedRegions || '',
        supportChannels: initialData.supportChannels || '',
        status: initialData.status || 'ACTIVE',
        tags: initialData.tags ? initialData.tags.join(', ') : '',
    });

    const handleAutofill = async () => {
        if (!autofillUrl) return alert('Please enter a URL to autofill from');
        setAutofilling(true);
        try {
            const res = await fetch('/api/admin/apis/autofill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: autofillUrl }),
            });

            if (!res.ok) throw new Error('Autofill failed');

            const data = await res.json();

            setFormData(prev => ({
                ...prev,
                name: data.title || prev.name,
                description: data.description || prev.description,
                docsUrl: data.docsUrl || prev.docsUrl,
                pricingUrl: data.pricingUrl || prev.pricingUrl,
                registrationUrl: data.registrationUrl || prev.registrationUrl,
                changelogUrl: data.changelogUrl || prev.changelogUrl,
                pricingModel: data.pricingModel || prev.pricingModel,
                supportChannels: data.supportChannels || prev.supportChannels,
                logoUrl: data.logoUrl || prev.logoUrl,
                tags: data.keywords ? data.keywords.join(', ') : prev.tags,
            }));

            alert('Autofill complete! Please review the fields.');
        } catch (error) {
            console.error(error);
            alert('Failed to autofill data');
        } finally {
            setAutofilling(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEdit
                ? `/api/admin/apis/${initialData.id}`
                : '/api/admin/apis';

            const method = isEdit ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to save');

            router.push('/admin/apis');
        } catch (error) {
            console.error(error);
            alert('Error saving API');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Autofill Section */}
            {!isEdit && (
                <div className="bg-surface p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-4">Auto-fill from URL</h3>
                    <div className="flex gap-4">
                        <input
                            type="url"
                            placeholder="Enter API Documentation URL (e.g. https://stripe.com/docs/api)"
                            value={autofillUrl}
                            onChange={(e) => setAutofillUrl(e.target.value)}
                            className="flex-1 bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleAutofill}
                            disabled={autofilling}
                            className="px-6 py-2 bg-accent text-midnight font-semibold rounded-md hover:bg-highlight disabled:opacity-50 transition-colors"
                        >
                            {autofilling ? 'Scanning...' : 'Auto-fill'}
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-lg border border-gray-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <label className="block text-sm font-medium text-gray-400 mb-1">Provider</label>
                        <select
                            required
                            value={formData.providerId}
                            onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        >
                            <option value="">Select Provider</option>
                            {providers.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                        <input
                            type="text"
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Docs URL</label>
                        <input
                            type="url"
                            required
                            value={formData.docsUrl}
                            onChange={(e) => setFormData({ ...formData, docsUrl: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Registration URL</label>
                        <input
                            type="url"
                            value={formData.registrationUrl}
                            onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Pricing URL</label>
                        <input
                            type="url"
                            value={formData.pricingUrl}
                            onChange={(e) => setFormData({ ...formData, pricingUrl: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Changelog URL</label>
                        <input
                            type="url"
                            value={formData.changelogUrl}
                            onChange={(e) => setFormData({ ...formData, changelogUrl: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Pricing Model</label>
                        <input
                            type="text"
                            placeholder="e.g. Freemium, Subscription"
                            value={formData.pricingModel}
                            onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Pricing Plan</label>
                        <input
                            type="text"
                            placeholder="e.g. Pro, Enterprise"
                            value={formData.pricingPlan}
                            onChange={(e) => setFormData({ ...formData, pricingPlan: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Free Tier</label>
                        <input
                            type="text"
                            placeholder="e.g. 500 req/mo"
                            value={formData.freeTier}
                            onChange={(e) => setFormData({ ...formData, freeTier: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Supported Regions</label>
                        <input
                            type="text"
                            placeholder="e.g. Global, US, EU"
                            value={formData.supportedRegions}
                            onChange={(e) => setFormData({ ...formData, supportedRegions: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Support Channels</label>
                        <input
                            type="text"
                            placeholder="e.g. Email, Slack, Discord"
                            value={formData.supportChannels}
                            onChange={(e) => setFormData({ ...formData, supportChannels: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Source URL (if crawled)</label>
                        <input
                            type="url"
                            value={formData.sourceUrl}
                            onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                            className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Logo URL</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={formData.logoUrl}
                                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                className="flex-1 bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                            />
                            {formData.logoUrl && (
                                <div className="w-10 h-10 rounded bg-white/10 overflow-hidden">
                                    <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-midnight border border-gray-700 rounded px-3 py-2 text-white focus:border-primary focus:outline-none"
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="PENDING">Pending</option>
                        <option value="BROKEN">Broken</option>
                    </select>
                </div>

                <div className="pt-4 flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Saving...' : isEdit ? 'Update API' : 'Create API'}
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
        </div>
    );
}

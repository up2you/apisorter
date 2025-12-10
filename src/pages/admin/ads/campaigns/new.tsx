import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useRouter } from 'next/router';
import { ArrowLeft, Upload } from 'lucide-react';

export default function NewCampaign() {
    const router = useRouter();
    const { slotId } = router.query;

    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        slotId: (slotId as string) || '',
        name: '',
        targetUrl: '',
        startsAt: new Date().toISOString().split('T')[0],
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/ads/slots')
            .then(res => res.json())
            .then(data => setSlots(data));
    }, []);

    useEffect(() => {
        if (slotId) {
            setFormData(prev => ({ ...prev, slotId: slotId as string }));
        }
    }, [slotId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = '';

            // 1. Upload Image
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('file', imageFile);

                const uploadRes = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!uploadRes.ok) throw new Error('Image upload failed');
                const uploadJson = await uploadRes.json();
                imageUrl = uploadJson.url;
            } else {
                alert('Please select an image');
                setLoading(false);
                return;
            }

            // 2. Create Campaign
            const res = await fetch('/api/admin/ads/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    imageUrl,
                }),
            });

            if (res.ok) {
                router.push('/admin/ads');
            } else {
                alert('Failed to create campaign');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
                >
                    <ArrowLeft size={20} /> Back to Ads
                </button>

                <h1 className="text-3xl font-bold mb-8">New Campaign</h1>

                <form onSubmit={handleSubmit} className="bg-surface border border-white/10 rounded-xl p-8 space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Ad Slot</label>
                        <select
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.slotId}
                            onChange={e => setFormData({ ...formData, slotId: e.target.value })}
                        >
                            <option value="">Select a Slot</option>
                            {slots.map(slot => (
                                <option key={slot.id} value={slot.id}>
                                    {slot.key} ({slot.width || 'Auto'}x{slot.height || 'Auto'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Campaign Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Summer Sale Banner"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Target URL</label>
                        <input
                            type="url"
                            required
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                            value={formData.targetUrl}
                            onChange={e => setFormData({ ...formData, targetUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={formData.startsAt}
                                onChange={e => setFormData({ ...formData, startsAt: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">End Date</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={formData.endsAt}
                                onChange={e => setFormData({ ...formData, endsAt: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Banner Image</label>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-lg" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-500">
                                    <Upload size={32} className="mb-2" />
                                    <p>Click or drag to upload image</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

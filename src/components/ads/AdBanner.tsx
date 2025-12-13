import { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
    slotKey: string;
    className?: string;
}

export function AdBanner({ slotKey, className = '' }: AdBannerProps) {
    const [ad, setAd] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const impressionLogged = useRef(false);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                // In a real app we'd have a specific endpoint to "get best ad for slot"
                // For now we fetch all campaigns and filter locally or we could add a specific endpoint
                // Let's assume we implement a simple public endpoint later. 
                // reusing admin endpoint is not secure for public, so strictly we need a public one.
                // But for Phase 1 MVP, let's create a dedicated public endpoint: /api/ads/serve?slotKey=...

                const res = await fetch(`/api/ads/serve?slotKey=${slotKey}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.campaign) {
                        setAd(data.campaign);
                    }
                }
            } catch (error) {
                console.error('Failed to load ad', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAd();
    }, [slotKey]);

    useEffect(() => {
        if (ad && !impressionLogged.current) {
            // Track Impression
            fetch('/api/ads/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: ad.id, type: 'impression' })
            }).catch(() => { }); // silent fail
            impressionLogged.current = true;
        }
    }, [ad]);

    const handleClick = () => {
        if (!ad) return;
        fetch('/api/ads/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: ad.id, type: 'click' })
        }).catch(() => { }); // silent fail
    };

    if (loading) return null; // or skeleton
    if (!ad) return null; // slot empty

    return (
        <a
            href={ad.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`block relative group overflow-hidden rounded-xl ${className}`}
        >
            <div className="absolute top-2 right-2 z-10 bg-black/50 text-[10px] text-white/70 px-1.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
                Ad
            </div>
            <img
                src={ad.imageUrl}
                alt={ad.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ExternalLink className="text-white drop-shadow-md" size={24} />
            </div>
        </a>
    );
}

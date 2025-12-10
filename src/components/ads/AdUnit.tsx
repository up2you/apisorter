import { useState, useEffect } from 'react';

interface AdUnitProps {
    slotKey: string;
    className?: string;
}

interface AdData {
    id: string;
    imageUrl: string;
    targetUrl: string;
    width: number | null;
    height: number | null;
    name: string;
}

export default function AdUnit({ slotKey, className = '' }: AdUnitProps) {
    const [ad, setAd] = useState<AdData | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Fetch ad for this slot
        fetch(`/api/ads/render?slotKey=${slotKey}`)
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data) {
                    setAd(data);
                    // Track Impression
                    fetch('/api/ads/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ campaignId: data.id, type: 'impression' }),
                    });
                }
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, [slotKey]);

    const handleClick = () => {
        if (!ad) return;
        // Track Click
        fetch('/api/ads/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: ad.id, type: 'click' }),
        });
    };

    if (!loaded) return null; // Or skeleton?
    if (!ad) return null; // No ad to show

    return (
        <div className={`ad-unit ${className}`} style={{ width: ad.width || '100%', height: ad.height || 'auto' }}>
            <a
                href={ad.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="block relative overflow-hidden rounded-lg group"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={ad.imageUrl}
                    alt={ad.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-0 right-0 bg-black/50 text-[10px] text-white px-1.5 py-0.5 rounded-bl">
                    Ad
                </div>
            </a>
        </div>
    );
}

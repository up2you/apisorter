import { useState } from 'react';
import { Heart } from 'lucide-react';
import DonationModal from './DonationModal';

export default function DonationButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Feature Flag Check
    if (process.env.NEXT_PUBLIC_ENABLE_DONATION !== 'true') {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25"
            >
                <Heart size={16} className="fill-white" />
                <span>Sponsor</span>
            </button>

            <DonationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}

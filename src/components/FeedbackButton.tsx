import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

const FeedbackButton: React.FC = () => {
    // Ganti "YOUR_FORM_ID" dengan ID form Tally Anda yang sebenarnya
    const TALLY_FORM_ID = "RGxKbJ";

    return (
        <button
            data-tally-open={TALLY_FORM_ID}
            data-tally-layout="modal"
            data-tally-emoji-text="👋"
            data-tally-emoji-animation="wave"
            className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-xl border border-purple-500/30 transition-all duration-300 group"
        >
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquarePlus className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">Tanggapan</span>
        </button>
    );
};

export default FeedbackButton;

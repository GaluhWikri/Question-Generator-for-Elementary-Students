import React from 'react';
import { MessageSquarePlus, Send } from 'lucide-react';

const FeedbackButton: React.FC = () => {
    const TALLY_FORM_ID = "RGxKbJ";

    return (
        <button
            data-tally-open={TALLY_FORM_ID}
            data-tally-layout="modal"
            data-tally-emoji-text="👋"
            data-tally-emoji-animation="wave"
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 text-pink-300 rounded-xl border border-pink-500/20 transition-all duration-300 group"
        >
            <div className="w-9 h-9 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
                <span className="font-medium text-sm block">Kirim Tanggapan</span>
                <span className="text-xs text-pink-400/60">Kritik & saran</span>
            </div>
            <Send className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
        </button>
    );
};

export default FeedbackButton;

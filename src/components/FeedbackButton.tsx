import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

const FeedbackButton: React.FC = () => {
    // Ganti "YOUR_FORM_ID" dengan ID form Tally Anda yang sebenarnya
    // Contoh: data-tally-open="mD4K8r"
    const TALLY_FORM_ID = "RGxKbJ";

    return (
        <button
            data-tally-open={TALLY_FORM_ID}
            data-tally-layout="modal"
            data-tally-emoji-text="👋"
            data-tally-emoji-animation="wave"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-white text-purple-900 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold group"
        >
            <MessageSquarePlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Feedback</span>
        </button>
    );
};

export default FeedbackButton;

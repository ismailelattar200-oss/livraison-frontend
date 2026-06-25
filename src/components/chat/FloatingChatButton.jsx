import { MessageSquare } from 'lucide-react';

const FloatingChatButton = ({ onClick, isOpen }) => {
    if (isOpen) return null; // Cache le bouton si le tiroir est ouvert

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center justify-center">
            {/* Pulsing ring behind button */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-30 duration-1000"></span>
            
            <button
                onClick={onClick}
                aria-label="Ouvrir l'assistant MAREA"
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-gold/90 active:scale-95 group border-2 border-white/20"
            >
                <MessageSquare className="h-7 w-7 fill-white text-white transition-transform duration-300 group-hover:scale-110" />
            </button>
        </div>
    );
};

export default FloatingChatButton;

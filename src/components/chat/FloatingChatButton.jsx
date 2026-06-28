import { MessageSquare } from 'lucide-react';

const FloatingChatButton = ({ onClick, isOpen }) => {
    if (isOpen) return null; // Cache le bouton si le tiroir est ouvert

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center justify-center">
            {/* Glowing Luxury Button */}
            <div className="relative flex items-center justify-center">
                {/* Outer glowing aura */}
                <span className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-gold via-amber to-gold opacity-40 blur-md animate-pulse"></span>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-25 duration-1000"></span>
                
                <button
                    onClick={onClick}
                    aria-label="Ouvrir l'assistant MAREA"
                    className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#DFBF68] via-gold to-[#B38F36] text-[#0A0F1D] shadow-[0_10px_30px_rgba(201,168,76,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 group border border-white/30"
                >
                    <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 fill-[#0A0F1D] text-[#0A0F1D] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                </button>
            </div>
        </div>
    );
};

export default FloatingChatButton;

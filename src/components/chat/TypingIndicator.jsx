import { Moon } from 'lucide-react';

const TypingIndicator = () => {
    return (
        <div className="flex items-end gap-3 max-w-[85%] animate-fadeIn">
            {/* Avatar MAREA */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 border border-gold/30 shadow-sm">
                <Moon className="h-4 w-4 text-gold fill-gold/30" />
            </div>

            {/* Bubble */}
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-none bg-navy-deep px-4 py-3 border border-white/10 shadow-md">
                <span className="h-2 w-2 rounded-full bg-gold/80 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 rounded-full bg-gold/80 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 rounded-full bg-gold/80 animate-bounce"></span>
            </div>
        </div>
    );
};

export default TypingIndicator;

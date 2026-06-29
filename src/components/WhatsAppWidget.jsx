import React from 'react';
import { getWhatsAppNumber, getWhatsAppMessage, isWhatsAppEnabled } from '../utils/whatsapp';

export const WhatsAppIcon = ({ className = "w-7 h-7" }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <path d="M11.999 0C5.373 0 0 5.373 0 12c0 2.123.553 4.195 1.601 6.01L.068 23.53a.75.75 0 00.902.902l5.52-1.533A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 11.999 0zM12 21.818a9.818 9.818 0 01-5.011-1.369.75.75 0 00-.596-.068l-3.715 1.032 1.032-3.715a.75.75 0 00-.068-.596A9.818 9.818 0 012.182 12c0-5.414 4.404-9.818 9.818-9.818 5.414 0 9.818 4.404 9.818 9.818 0 5.414-4.404 9.818-9.818 9.818zm5.518-7.397c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.474-.883-.787-1.48-1.76-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.793.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.71.306 1.264.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    </svg>
);

export const getWhatsAppUrl = (phone = getWhatsAppNumber()) => {
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const text = encodeURIComponent(getWhatsAppMessage());
    return isMobile ? `https://wa.me/${phone}?text=${text}` : `https://web.whatsapp.com/send?phone=${phone}&text=${text}`;
};

export const handleWhatsAppClick = (e) => {
    if (e) e.preventDefault();
    const url = getWhatsAppUrl(getWhatsAppNumber());
    window.open(url, '_blank', 'noopener,noreferrer');
};

const WhatsAppWidget = ({ positionClass = "fixed bottom-6 left-6 z-[9999]" }) => {
    if (!isWhatsAppEnabled()) return null;
    return (
        <div className={`${positionClass} flex items-center justify-center group`}>
            <div className="relative flex items-center justify-center">
                <a
                    href={getWhatsAppUrl()}
                    onClick={handleWhatsAppClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Contactez-nous sur WhatsApp"
                    className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 border border-white/30"
                >
                    <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8 fill-white text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
                </a>

                {/* Tooltip on hover */}
                <div className="absolute left-full ml-3 px-3.5 py-2 bg-[#0B0F19]/95 text-white text-xs font-bold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.8)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none border border-[#25D366]/40 flex items-center gap-2 translate-x-[-8px] group-hover:translate-x-0 z-[10000]">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                    <span>Contactez-nous sur WhatsApp</span>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppWidget;

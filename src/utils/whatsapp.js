export const getWhatsAppNumber = () => {
    const stored = localStorage.getItem('marea_whatsapp_number');
    if (stored && stored !== '212771006681') return stored;
    return '212615479703';
};

export const getDisplayWhatsAppNumber = () => {
    const stored = localStorage.getItem('marea_whatsapp_display');
    if (stored && stored !== '0771006681') return stored;
    return '0615479703';
};

export const saveWhatsAppNumber = (num) => {
    let cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '212' + cleaned.substring(1);
    } else if (!cleaned.startsWith('212') && cleaned.length === 9) {
        cleaned = '212' + cleaned;
    }
    localStorage.setItem('marea_whatsapp_number', cleaned);
    localStorage.setItem('marea_whatsapp_display', num);
    return cleaned;
};

export const getWhatsAppMessage = () => {
    return localStorage.getItem('marea_whatsapp_message') || "Bonjour MAREA ! Je souhaite passer une commande.";
};

export const isWhatsAppEnabled = () => {
    const enabled = localStorage.getItem('marea_whatsapp_enabled');
    return enabled === null ? true : enabled === 'true';
};

export const saveWhatsAppConfig = (num, message, enabled) => {
    saveWhatsAppNumber(num);
    if (message !== undefined) localStorage.setItem('marea_whatsapp_message', message);
    if (enabled !== undefined) localStorage.setItem('marea_whatsapp_enabled', String(enabled));
};

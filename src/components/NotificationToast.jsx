import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, X } from 'lucide-react';

export const triggerNotification = (title, message, type = 'info') => {
    window.dispatchEvent(new CustomEvent('marea-notify', {
        detail: { id: Date.now(), title, message, type }
    }));
};

const playChime = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain1.gain.setValueAtTime(0.3, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.5);
    } catch (e) {
        // Audio might be blocked by browser auto-play policy until interaction
    }
};

const NotificationToast = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const handleNotify = (e) => {
            const { id, title, message, type } = e.detail;
            playChime();
            setNotifications(prev => [...prev, { id, title, message, type }]);
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 6000);
        };

        window.addEventListener('marea-notify', handleNotify);
        return () => window.removeEventListener('marea-notify', handleNotify);
    }, []);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
            {notifications.map(n => (
                <div 
                    key={n.id}
                    className="pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl bg-[#0F1322]/95 border border-gold/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] text-white animate-in slide-in-from-right duration-300 backdrop-blur-xl"
                >
                    <div className="mt-0.5 p-2 rounded-full bg-gold/20 text-gold shrink-0 animate-bounce">
                        {n.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Bell className="w-5 h-5 text-gold" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-sm text-gold tracking-wide">{n.title}</h4>
                        <p className="text-xs text-gray-200 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    <button 
                        onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))}
                        className="text-gray-400 hover:text-white p-1 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;

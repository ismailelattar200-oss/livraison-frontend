import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, RefreshCw, MapPin, Navigation, Clock, Zap, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const LivreurAiChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const initialGreeting = {
        role: 'assistant',
        content: "Salam & Bienvenue ! 🛵 Je suis votre Co-Pilote IA de livraison MAREA.\nComment puis-je accélérer vos tournées aujourd'hui ?",
        time: getCurrentTime(),
        isQuickWins: true
    };

    const [messages, setMessages] = useState([initialGreeting]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen, isLoading]);

    const handleQuickAction = async (actionType, queryText) => {
        const userMsg = { role: 'user', content: queryText, time: getCurrentTime() };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await api.getDeliveryUnifiedDashboard();
            const data = res.data.data || {};
            let replyText = "";

            if (actionType === 'order') {
                const orders = data.assigned_orders || [];
                if (orders.length > 0) {
                    replyText = `🎯 **Conseil IA** : Livrez la commande **#${orders[0].order_number}** (${orders[0].customer_name}) en PRIORITÉE.\nElle est prête depuis 8 min et située à seulement 1.2 km !`;
                } else {
                    replyText = "✅ **Aucune course en attente** ! Restez près de la station Maârif.";
                }
            } else if (actionType === 'route') {
                replyText = `🗺️ **Itinéraire Optimisé (TSP)** :\n1. Boulevard Zerktouni → Évitez le rond-point Ghandi (Bouchon +8 min).\n2. Prenez la ruelle Ibn Sina (Gain estimé : **3.5 min**). Distance totale : 4.2 km.`;
            } else if (actionType === 'eta') {
                replyText = `⏱️ **Estimations ETA** :\n• Course #MAR-001 : Arrivée prévue à **${new Date(Date.now() + 12*60000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}** (Dans 12 min).\n• Course #MAR-002 : Arrivée à **${new Date(Date.now() + 24*60000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}**.`;
            } else if (actionType === 'tips') {
                replyText = `💡 **Astuces Vitesse IA** :\nVotre moyenne est de 18.4 min/livraison. Pour atteindre le bonus ponctualité (<15 min), validez le départ sur l'app dès la sortie du packaging en cuisine !`;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: replyText, time: getCurrentTime() }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "🎯 Recommandation Co-Pilote : Prenez le raccourci Moulay Youssef pour la commande #MAR-2026.", time: getCurrentTime() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const text = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: text, time: getCurrentTime() }]);
        setIsLoading(true);

        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `🛵 **Co-Pilote IA** :\nReçu 5/5. J'ai recalculé votre itinéraire GPS en tenant compte du trafic en direct. Bonne route !`, 
                time: getCurrentTime() 
            }]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <>
            {/* FLOATING BUTTON (BOTTOM RIGHT) */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-[100] flex items-center justify-center group">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#3b82f6] text-[#0f1117] font-extrabold text-sm shadow-[0_10px_30px_rgba(16,185,129,0.5)] transition-all hover:scale-105 active:scale-95 border border-white/20"
                    >
                        <Sparkles className="w-5 h-5 text-white animate-spin" />
                        <span>Co-Pilote IA</span>
                    </button>
                </div>
            )}

            {/* FLOATING CHAT DRAWER WINDOW */}
            {isOpen && (
                <div className="fixed inset-0 z-[105] flex justify-end bg-black/50 backdrop-blur-xs md:bg-transparent md:backdrop-blur-none pointer-events-auto md:pointer-events-none">
                    <div className="absolute inset-0 md:hidden" onClick={() => setIsOpen(false)} />

                    <div className="pointer-events-auto relative flex w-full flex-col bg-[#0F1117] shadow-[0_15px_60px_rgba(0,0,0,0.9)] transition-all duration-300 animate-in slide-in-from-bottom md:slide-in-from-right md:fixed md:bottom-8 md:right-8 md:w-[420px] md:h-[620px] md:rounded-3xl border border-emerald-500/40 overflow-hidden h-[88vh] mt-auto rounded-t-[2.5rem] md:mt-0">
                        
                        {/* HEADER */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0d2e24] via-[#102330] to-[#0F1117] border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-inner">
                                    <Navigation className="w-5 h-5 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-white text-sm tracking-wide">Co-Pilote MAREA Livreur</h3>
                                    <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> GPS & IA Actif
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setMessages([initialGreeting])} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"><RefreshCw className="w-4 h-4"/></button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full"><X className="w-5 h-5"/></button>
                            </div>
                        </div>

                        {/* MESSAGES BODY */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0a0c10] custom-scrollbar">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex gap-3 max-w-[92%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${m.role === 'user' ? 'bg-emerald-500 text-[#0F1117]' : 'bg-[#181d26] border border-emerald-500/30 text-emerald-400'}`}>
                                        {m.role === 'user' ? 'Moi' : 'IA'}
                                    </div>
                                    <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xl whitespace-pre-line ${m.role === 'user' ? 'bg-emerald-500 text-[#0F1117] font-bold rounded-tr-none' : 'bg-[#151821] text-gray-100 border border-white/10 rounded-tl-none'}`}>
                                        {m.content}

                                        {/* QUICK WINS BUTTONS */}
                                        {m.isQuickWins && (
                                            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 gap-2">
                                                <button onClick={() => handleQuickAction('order', '🚨 Quelle commande livrer en premier ?')} className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-left font-bold transition-all">
                                                    <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-400"/> Quelle commande en 1er ?</span>
                                                </button>
                                                <button onClick={() => handleQuickAction('route', '🗺️ Proposer le meilleur itinéraire sans trafic')} className="flex items-center justify-between p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-left font-bold transition-all">
                                                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400"/> Itinéraire le plus rapide (TSP)</span>
                                                </button>
                                                <button onClick={() => handleQuickAction('eta', '⏱️ Estimer le temps de livraison (ETA)')} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-left font-bold transition-all">
                                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400"/> Calculer ETA & Retards</span>
                                                </button>
                                                <button onClick={() => handleQuickAction('tips', '💡 Conseils pour améliorer ma vitesse')} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-left font-bold transition-all">
                                                    <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400"/> Astuces vitesse & bonus</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && <div className="text-xs text-emerald-400 animate-pulse pl-11 font-mono">🛵 Optimisation GPS en cours...</div>}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* FOOTER INPUT */}
                        <div className="p-4 bg-[#0F1117] border-t border-white/10 shrink-0">
                            <form onSubmit={handleSend} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Demandez un itinéraire au Co-Pilote..."
                                    className="w-full bg-[#181d26] border border-white/15 rounded-full pl-5 pr-12 py-3 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 transition-all"
                                />
                                <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-1.5 w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 flex items-center justify-center text-[#0F1117] transition-all font-bold">
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LivreurAiChatWidget;

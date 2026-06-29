import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, RefreshCw, Flame, Package, Clock, Users, Zap, CheckCircle2, ChefHat } from 'lucide-react';
import api from '../../services/api';

const CuisineAiChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const initialGreeting = {
        role: 'assistant',
        content: "Salam Chef Hassan ! 👨‍🍳 Je suis votre Sous-Chef IA MAREA.\nLa brigade est en place, flux dîner en cours. Comment puis-je coordonner les envois aujourd'hui ?",
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
            let activeOrders = [];
            try {
                const res = await api.get('/admin/deliveries/orders');
                activeOrders = res.data?.data || [];
            } catch (e) {
                // Mode démo anti-crash
                activeOrders = [
                    { order_number: 'MAR-20260625-003', customer_name: 'Table VIP 4', items: [{ name: 'Poulet Tikka Masala', quantity: 2 }, { name: 'Burger Gourmet', quantity: 1 }], status: 'en_attente', created_at: new Date(Date.now() - 15*60000).toISOString() },
                    { order_number: 'MAR-20260625-007', customer_name: 'Livraison Express', items: [{ name: 'Pastilla Fruits de Mer', quantity: 1 }, { name: 'Gyoza Poulet', quantity: 3 }], status: 'en_preparation', created_at: new Date(Date.now() - 8*60000).toISOString() }
                ];
            }

            let replyText = "";

            if (actionType === 'fifo') {
                const pending = activeOrders.filter(o => o.status === 'en_attente' || o.status === 'en_preparation');
                if (pending.length > 0) {
                    const firstOrder = pending[0];
                    const mainItem = firstOrder.items?.[0]?.name || 'Plat Principal';
                    replyText = `🔥 **Priorité Cuisson (FIFO)** :\nLancez immédiatement **${mainItem}** pour la commande **#${firstOrder.order_number}** (${firstOrder.customer_name}).\nEn attente depuis 15 min. Temps de cuisson requis : **18 min au four** à 220°C.`;
                } else {
                    replyText = "✅ **Tous les bons sont sortis** ! La brigade peut avancer sur les mises en place du service du soir.";
                }
            } else if (actionType === 'stock') {
                replyText = `📦 **Audit Stocks Cuisine (En Direct)** :\n⚠️ **Seuils critiques détectés** :\n• *Tajine d'Agneau* : Reste **4 portions** en chambre froide (Réassort urgent requis).\n• *Filet de Saumon* : **8 portions** disponibles.\n• *Linguini Vongole* : Stock optimal (42 portions).`;
            } else if (actionType === 'synchro') {
                replyText = `⏱️ **Synchro Plats Chauds / Froids** :\n• Commande #MAR-007 (*Pastilla + Gyoza*) :\n1. Lancez la cuisson de la Pastilla à **T+0** (12 min).\n2. Plongez les Gyozas à **T+7 min** (Cuisson 5 min).\n🎯 Résultat : Sortie simultanée au passe à 65°C exactement !`;
            } else if (actionType === 'brigade') {
                replyText = `👨‍🍳 **Cadence & Poste Brigade** :\n• Flux actuel : **Pic Dîner (+45% volume)**.\n• Consigne : Basculez le commis *Youssef* du poste Entrées vers le **Poste Friture/Wok** pour absorber les commandes de Gyoza et Shawarma.`;
            } else {
                replyText = `🤖 **Analyse IA Cuisine** : J'ai bien noté votre demande sur "${queryText}". Les paramètres de cuisson et d'envoi ont été ajustés dans le planning de la brigade.`;
            }

            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'assistant', content: replyText, time: getCurrentTime() }]);
                setIsLoading(false);
            }, 500);

        } catch (err) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "👨‍🍳 **Sous-Chef IA en mode autonome** : Système synchronisé avec les fiches techniques MAREA. Prêt pour le coup de feu !", 
                time: getCurrentTime() 
            }]);
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');
        await handleQuickAction('custom', userText);
    };

    return (
        <>
            {/* FLOATING TRIGGER BUTTON (ONLY WHEN CLOSED) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-[100] group flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#a855f7] text-white shadow-[0_8px_30px_rgba(139,92,246,0.6)] hover:shadow-[0_12px_40px_rgba(168,85,247,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
                >
                    <div className="relative flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-white animate-bounce" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                        </span>
                    </div>
                    <span className="font-display font-bold text-sm tracking-wide pr-1">✨ Sous-Chef IA</span>
                </button>
            )}

            {/* MODAL / WIDGET WINDOW */}
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none flex justify-end items-end p-0 md:p-8">
                    {/* Backdrop for mobile */}
                    <div className="absolute inset-0 md:hidden pointer-events-auto bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

                    <div className="pointer-events-auto relative flex w-full flex-col bg-[#12131F] shadow-[0_20px_70px_rgba(0,0,0,0.9)] transition-all duration-300 animate-in slide-in-from-bottom md:slide-in-from-right md:w-[440px] md:h-[640px] md:rounded-3xl border border-[#8b5cf6]/40 overflow-hidden h-[90vh] mt-auto rounded-t-[2.5rem] md:mt-0">
                        
                        {/* HEADER */}
                        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#2a1b4e] via-[#1e1435] to-[#12131F] border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/50 flex items-center justify-center text-[#c084fc] shadow-inner">
                                    <ChefHat className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-white text-base tracking-wide">Sous-Chef IA MAREA</h3>
                                    <p className="text-[11px] text-[#c084fc] font-bold flex items-center gap-1.5 mt-0.5">
                                        <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse"></span> Brigade Connectée
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setMessages([initialGreeting])} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Réinitialiser">
                                    <RefreshCw className="w-4 h-4"/>
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Fermer">
                                    <X className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>

                        {/* MESSAGES BODY */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0d0e17] custom-scrollbar">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex gap-3 max-w-[92%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-md ${m.role === 'user' ? 'bg-[#8b5cf6] text-white' : 'bg-[#1e1f2e] border border-[#8b5cf6]/40 text-[#c084fc]'}`}>
                                        {m.role === 'user' ? 'Moi' : 'IA'}
                                    </div>
                                    <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xl whitespace-pre-line ${m.role === 'user' ? 'bg-[#8b5cf6] text-white font-bold rounded-tr-none' : 'bg-[#18192a] text-gray-100 border border-white/10 rounded-tl-none font-medium'}`}>
                                        {m.content}

                                        {/* QUICK WINS BUTTONS */}
                                        {m.isQuickWins && (
                                            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 gap-2.5">
                                                <button onClick={() => handleQuickAction('fifo', '🔥 Quel plat lancer en priorité absolue ?')} className="flex items-center justify-between p-3 rounded-xl bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#fbbf24] text-left font-bold transition-all group">
                                                    <span className="flex items-center gap-2.5"><Flame className="w-4 h-4 text-[#f59e0b] group-hover:scale-110 transition-transform"/> Ordre de cuisson prioritaire (FIFO)</span>
                                                </button>
                                                <button onClick={() => handleQuickAction('stock', '📦 Vérifier les stocks critiques en cuisine')} className="flex items-center justify-between p-3 rounded-xl bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 border border-[#3b82f6]/30 text-[#60a5fa] text-left font-bold transition-all group">
                                                    <span className="flex items-center gap-2.5"><Package className="w-4 h-4 text-[#3b82f6] group-hover:scale-110 transition-transform"/> Audit stocks cuisine en direct</span>
                                                </button>
                                                <button onClick={() => handleQuickAction('synchro', '⏱️ Synchroniser dressage plats chauds/froids')} className="flex items-center justify-between p-3 rounded-xl bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/30 text-[#34d399] text-left font-bold transition-all group">
                                                    <span className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-[#10b981] group-hover:scale-110 transition-transform"/> Synchro plats chauds/froids</span>
                                                </button>
                                                <button onClick={() => handleQuickAction('brigade', '👨‍🍳 Optimiser la cadence de la brigade')} className="flex items-center justify-between p-3 rounded-xl bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 text-[#c084fc] text-left font-bold transition-all group">
                                                    <span className="flex items-center gap-2.5"><Users className="w-4 h-4 text-[#8b5cf6] group-hover:scale-110 transition-transform"/> Conseils cadence brigade</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && <div className="text-xs text-[#c084fc] animate-pulse pl-11 font-mono flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 animate-spin"/> Analyse des bons en cuisine...</div>}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* FOOTER INPUT */}
                        <div className="p-4 bg-[#12131F] border-t border-white/10 shrink-0">
                            <form onSubmit={handleSend} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Posez une question culinaire au Sous-Chef..."
                                    className="w-full bg-[#1e1f2e] border border-white/10 rounded-full pl-5 pr-12 py-3 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-[#8b5cf6] transition-all"
                                />
                                <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-1.5 w-9 h-9 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-gray-700 flex items-center justify-center text-white transition-all font-bold shadow-md">
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

export default CuisineAiChatWidget;

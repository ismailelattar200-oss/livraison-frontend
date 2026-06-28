import { useState, useRef, useEffect } from 'react';
import { X, Send, Moon, User, Sparkles, RefreshCw, Clock, UtensilsCrossed, ShoppingBag, MapPin, ChevronLeft, Plus, Minus, ArrowRight, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import api from '../../services/api';
import TypingIndicator from './TypingIndicator';
import InlineOrderForm from './InlineOrderForm';

// Données de secours par défaut si l'API n'est pas joignable
const FALLBACK_CATEGORIES = [
    { id: 1, name: 'Cocina Marroquí', slug: 'cocina-marroqui', description: 'Spécialités traditionnelles mijotées' },
    { id: 2, name: 'Poissons & Fruits de mer', slug: 'poissons', description: 'Fraîcheur de la Méditerranée' },
    { id: 3, name: 'Entrées Méditerranéennes', slug: 'entrees', description: 'Saveurs ensoleillées et tapas' },
    { id: 4, name: 'Desserts & Boissons', slug: 'desserts', description: 'Douceurs orientales et thés' }
];

const FALLBACK_MENU_ITEMS = [
    { id: 101, category_id: 1, name: "Tajine d'Agneau aux Pruneaux", price: 280, description: "Agneau tendre mijoté aux pruneaux caramélisés et amandes grillées." },
    { id: 102, category_id: 1, name: "Couscous Royal MAREA", price: 320, description: "Semoule fine, méchoui d'agneau, poulet fermier, merguez et légumes." },
    { id: 103, category_id: 1, name: "Pastilla au Poulet et Amandes", price: 250, description: "Feuille de brick croustillante farcie au poulet parfumé à la cannelle." },
    { id: 201, category_id: 2, name: "Loup de Mer en Croûte de Sel", price: 350, description: "Poisson sauvage rôti aux aromates méditerranéens et huile d'olive." },
    { id: 202, category_id: 2, name: "Paella Royale aux Fruits de Mer", price: 380, description: "Riz safrané aux gambas royales, calamars, moules et palourdes." },
    { id: 301, category_id: 3, name: "Burrata à la Truffe & Tomates", price: 180, description: "Burrata crémeuse, tomates anciennes, pesto de basilic et truffe noire." },
    { id: 302, category_id: 3, name: "Briouates Croustillantes au Fromage", price: 140, description: "Trio de briouates au fromage frais, menthe et miel d'oranger." },
    { id: 401, category_id: 4, name: "Thé à la Menthe Fraîche & Pignons", price: 60, description: "Thé vert traditionnel servi avec pignons de pin torréfiés." },
    { id: 402, category_id: 4, name: "Assortiment de Pâtisseries Fines", price: 120, description: "Cornes de gazelle, ghriba aux noix et baklava au miel." }
];

const ChatDrawer = ({ isOpen, onClose }) => {
    const getCurrentTime = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // États de navigation interactive (inspirés de la référence Luxify)
    const [currentStep, setCurrentStep] = useState('home'); // 'home' | 'categories' | 'dishes' | 'checkout'
    const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
    const [menuItems, setMenuItems] = useState(FALLBACK_MENU_ITEMS);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [cart, setCart] = useState({}); // { itemId: { item, quantity } }

    const initialGreeting = {
        role: 'assistant',
        content: "Salam & Bienvenue ! 🌙 Je suis l'assistant virtuel gastronomique MAREA.\nComment puis-je vous régaler aujourd'hui ?\n\n🔥 **Quick Wins** : Demandez-moi le statut de votre commande, des suggestions selon l'heure ou nos options sans gluten !\n💬 *Échangeons en Français, Arabe ou Darija !*",
        time: getCurrentTime(),
        isGreeting: true
    };

    const [messages, setMessages] = useState([initialGreeting]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            // Charger les catégories et plats réels depuis l'API Laravel au montage
            api.get('/categories').then(res => {
                if (res.data?.data) setCategories(res.data.data);
                else if (Array.isArray(res.data)) setCategories(res.data);
            }).catch(() => {});

            api.get('/menu-items').then(res => {
                if (res.data?.data) setMenuItems(res.data.data);
                else if (Array.isArray(res.data)) setMenuItems(res.data);
            }).catch(() => {});
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, currentStep, cart]);

    // Calcul du total panier
    const cartItemsList = Object.values(cart).map(c => ({
        id: c.item.id,
        name: c.item.name,
        price: Number(c.item.price),
        quantity: c.quantity
    }));
    const cartTotalCount = cartItemsList.reduce((acc, curr) => acc + curr.quantity, 0);
    const cartTotalPrice = cartItemsList.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    // Envoi de message libre vers l'API Claude
    const handleSend = async (e, customMsg = null) => {
        if (e) e.preventDefault();
        const msgToSend = customMsg !== null ? customMsg : input;
        if (!msgToSend.trim() || isLoading) return;

        const userMessage = msgToSend.trim();
        if (customMsg === null) setInput('');

        const newMessages = [
            ...messages, 
            { role: 'user', content: userMessage, time: getCurrentTime() }
        ];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await api.post('/chat', { 
                message: userMessage,
                history: newMessages.slice(-10)
            });

            if (response.data?.success) {
                setMessages(prev => [
                    ...prev, 
                    { role: 'assistant', content: response.data.reply, time: getCurrentTime() }
                ]);
            } else {
                setMessages(prev => [
                    ...prev, 
                    { role: 'assistant', content: "Désolé, je n'ai pas pu traiter votre demande.", time: getCurrentTime() }
                ]);
            }
        } catch (error) {
            console.error('Chat API Error:', error);
            setMessages(prev => [
                ...prev, 
                { role: 'assistant', content: "Désolé, je rencontre des difficultés techniques actuellement. Veuillez réessayer dans quelques instants.", time: getCurrentTime() }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Actions interactives du catalogue (Flow guidé)
    const handleOpenCategories = (promptText = "Je veux commander") => {
        setCurrentStep('categories');
        setMessages(prev => [
            ...prev,
            { role: 'user', content: promptText, time: getCurrentTime() },
            { 
                role: 'assistant', 
                content: "🍽️ Parfait ! Dans quelle catégorie cherchez-vous ? Voici nos spécialités :",
                time: getCurrentTime(),
                isCategorySelector: true
            }
        ]);
    };

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        setCurrentStep('dishes');
        setMessages(prev => [
            ...prev,
            { role: 'user', content: `Catégorie : ${category.name}`, time: getCurrentTime() },
            { 
                role: 'assistant', 
                content: `🍲 Excellente sélection ! Voici nos plats dans la catégorie **${category.name}** :`,
                time: getCurrentTime(),
                isDishSelector: true,
                categoryId: category.id
            }
        ]);
    };

    const handleAddToCart = (item) => {
        setCart(prev => {
            const currentQty = prev[item.id]?.quantity || 0;
            return {
                ...prev,
                [item.id]: { item, quantity: currentQty + 1 }
            };
        });
    };

    const handleRemoveFromCart = (item) => {
        setCart(prev => {
            const currentQty = prev[item.id]?.quantity || 0;
            if (currentQty <= 1) {
                const copy = { ...prev };
                delete copy[item.id];
                return copy;
            }
            return {
                ...prev,
                [item.id]: { item, quantity: currentQty - 1 }
            };
        });
    };

    const handleGoToCheckout = () => {
        setCurrentStep('checkout');
        setMessages(prev => [
            ...prev,
            { role: 'user', content: `Valider mon panier (${cartTotalPrice} MAD)`, time: getCurrentTime() },
            {
                role: 'assistant',
                content: `✨ Excellent choix ! Voici le récapitulatif de votre commande (${cartTotalCount} articles pour ${cartTotalPrice} MAD).\n\nVeuillez renseigner vos coordonnées de livraison ci-dessous :`,
                time: getCurrentTime(),
                orderData: {
                    items: cartItemsList,
                    subtotal: cartTotalPrice,
                    total: cartTotalPrice,
                    type: 'livraison'
                }
            }
        ]);
    };

    const handleOrderSuccess = (orderNumber) => {
        setCart({});
        setCurrentStep('home');
        setMessages(prev => [
            ...prev,
            {
                role: 'assistant',
                content: `🎉 Commande #${orderNumber} confirmée avec succès !\n\nUn email de récapitulatif vous a été transmis. Notre brigade prépare déjà vos plats avec soin. Merci de votre fidélité chez MAREA !`,
                time: getCurrentTime()
            }
        ]);
    };

    const handleBackStep = () => {
        if (currentStep === 'checkout') setCurrentStep('dishes');
        else if (currentStep === 'dishes') setCurrentStep('categories');
        else if (currentStep === 'categories') setCurrentStep('home');
    };

    const handleReset = () => {
        setCart({});
        setCurrentStep('home');
        setSelectedCategory(null);
        setMessages([{ ...initialGreeting, time: getCurrentTime() }]);
    };

    const parseMessageContent = (content) => {
        const match = content?.match(/\[ACTION:SHOW_FORM:(.*?)\]/);
        if (!match) return { cleanText: content, parsedOrderData: null };

        const cleanText = content.replace(/\[ACTION:SHOW_FORM:.*?\]/, '').trim();
        let parsedOrderData = null;
        try { parsedOrderData = JSON.parse(match[1]); } catch (err) {}
        return { cleanText, parsedOrderData };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/70 backdrop-blur-md md:bg-transparent md:backdrop-blur-none pointer-events-auto md:pointer-events-none transition-all duration-300">
            {/* Click outside to close on mobile */}
            <div className="absolute inset-0 md:hidden animate-fadeIn" onClick={onClose} />

            {/* Chat Drawer Window Panel - Luxury Glassmorphism */}
            <div className="pointer-events-auto relative flex w-full flex-col bg-[#0B0F19]/95 backdrop-blur-2xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(201,168,76,0.18)] transition-all duration-500 animate-in slide-in-from-bottom md:slide-in-from-right md:fixed md:bottom-24 md:right-6 md:w-[430px] md:h-[670px] md:max-h-[calc(100vh-7rem)] md:rounded-[2.2rem] border border-white/10 ring-1 ring-gold/25 overflow-hidden h-[88vh] mt-auto rounded-t-[2.5rem] md:mt-0">
                
                {/* Top Subtle Golden Glow Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-90 z-20" />

                {/* 1. Sleek Luxury Gradient Header */}
                <div className="relative flex items-center justify-between px-6 py-4 bg-gradient-to-b from-[#161D31]/95 to-[#0B0F19]/90 backdrop-blur-md border-b border-white/10 shadow-lg shrink-0 z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/25 via-gold/10 to-transparent border border-gold/40 shadow-[0_0_20px_rgba(201,168,76,0.25)]">
                            <Moon className="h-5 w-5 text-gold fill-gold/30 animate-pulse" />
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 m-auto ring-2 ring-[#0B0F19]"></span>
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-display font-bold text-white text-base tracking-wide flex items-center gap-1.5">
                                    Assistant <span className="text-gold font-serif">MAREA</span>
                                </h3>
                                {currentStep !== 'home' && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-[10px] text-gold font-sans font-bold flex items-center gap-1 border border-gold/30 shadow-sm animate-fadeIn">
                                        <Tag className="w-2.5 h-2.5" />
                                        {currentStep === 'categories' ? 'Catégories' : currentStep === 'dishes' ? selectedCategory?.name : 'Commande'}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-emerald-400 font-medium tracking-wide flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                En ligne • Intelligence Gastronomique
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleReset}
                            title="Nouvelle conversation"
                            className="p-2 text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            aria-label="Fermer"
                            className="p-2 text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 2. Interactive Navigation Sub-header */}
                {currentStep !== 'home' && (
                    <div className="px-6 py-2.5 bg-[#121829]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs text-gold font-semibold shrink-0 animate-fadeIn z-10 shadow-sm">
                        <button 
                            onClick={handleBackStep}
                            className="flex items-center gap-1.5 hover:text-white transition-all py-0.5 group"
                        >
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                            {currentStep === 'categories' ? 'Retour à l\'accueil' : currentStep === 'dishes' ? 'Catégories' : 'Retour au panier'}
                        </button>
                        
                        {/* Pagination Progress Dots */}
                        <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep !== 'home' ? 'bg-gold w-4 shadow-[0_0_8px_#C9A84C]' : 'bg-white/20'}`}></span>
                            <span className={`h-2 w-2 rounded-full transition-all duration-300 ${in_array(currentStep, ['dishes', 'checkout']) ? 'bg-gold w-4 shadow-[0_0_8px_#C9A84C]' : 'bg-white/20'}`}></span>
                            <span className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep === 'checkout' ? 'bg-gold w-4 shadow-[0_0_8px_#C9A84C]' : 'bg-white/20'}`}></span>
                        </div>
                    </div>
                )}

                {/* 3. Messages Body Canvas */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#070A12] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,168,76,0.12),rgba(0,0,0,0))]">
                    {messages.map((msg, index) => {
                        const isUser = msg.role === 'user';
                        const { cleanText, parsedOrderData } = !isUser ? parseMessageContent(msg.content) : { cleanText: msg.content, parsedOrderData: null };
                        const finalOrderData = msg.orderData || parsedOrderData;

                        return (
                            <div key={index} className="space-y-2.5 animate-fadeIn">
                                <div className={`flex gap-3 max-w-[92%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                                    
                                    {/* Avatar */}
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-md mt-1 ${
                                        isUser 
                                            ? 'bg-gradient-to-br from-gold via-[#DFBF68] to-amber text-[#0A0F1D] font-bold shadow-gold/20' 
                                            : 'bg-[#151C33] border border-gold/40 text-gold shadow-black/50'
                                    }`}>
                                        {isUser ? <User className="h-4 w-4 stroke-[2.5]" /> : <Moon className="h-4 w-4 fill-gold/30" />}
                                    </div>

                                    {/* Card Container */}
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <div className={`rounded-2xl px-4 py-3.5 text-xs leading-relaxed shadow-xl whitespace-pre-line relative transition-all ${
                                            isUser
                                                ? 'bg-gradient-to-r from-gold via-[#DFBF68] to-[#C9A84C] text-[#0A0F1D] font-semibold rounded-tr-sm shadow-[0_4px_15px_rgba(201,168,76,0.2)]'
                                                : 'bg-[#13192B]/95 backdrop-blur-md text-gray-100 rounded-tl-sm border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                                        }`}>
                                            {cleanText}

                                            {/* Quick Wins Structured Grid inside Greeting Card */}
                                            {msg.isGreeting && (
                                                <div className="mt-4 pt-3 border-t border-white/10">
                                                    {/* Primary CTA Banner */}
                                                    <button 
                                                        onClick={() => handleOpenCategories("Je veux commander")}
                                                        className="w-full mb-2.5 flex items-center justify-center gap-2 text-xs font-bold bg-gradient-to-r from-gold via-[#DFBF68] to-amber text-[#0A0F1D] rounded-xl py-3 px-4 shadow-[0_4px_15px_rgba(201,168,76,0.3)] hover:shadow-[0_6px_20px_rgba(201,168,76,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                                    >
                                                        <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                                                        <span>Commander en ligne maintenant</span>
                                                        <ArrowRight className="w-4 h-4 ml-auto" />
                                                    </button>

                                                    {/* Quick Actions 2-Column Grid */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button 
                                                            onClick={() => handleOpenCategories("Montrez-moi le menu")}
                                                            className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-gold/15 border border-white/10 hover:border-gold/40 text-gray-200 hover:text-white text-[11px] font-medium transition-all group text-left shadow-sm hover:translate-y-[-1px]"
                                                        >
                                                            <UtensilsCrossed className="w-4 h-4 text-gold shrink-0 transition-transform group-hover:scale-110" />
                                                            <span className="truncate">Voir la carte</span>
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => handleSend(null, "Quels sont vos horaires et votre adresse ?")}
                                                            className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-gray-200 hover:text-white text-[11px] font-medium transition-all group text-left shadow-sm hover:translate-y-[-1px]"
                                                        >
                                                            <Clock className="w-4 h-4 text-emerald-400 shrink-0 transition-transform group-hover:scale-110" />
                                                            <span className="truncate">Horaires & Infos</span>
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => handleSend(null, "Où en est ma commande ?")}
                                                            className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-gray-200 hover:text-white text-[11px] font-medium transition-all group text-left shadow-sm hover:translate-y-[-1px]"
                                                        >
                                                            <MapPin className="w-4 h-4 text-amber-400 shrink-0 transition-transform group-hover:scale-110" />
                                                            <span className="truncate">📦 Suivre commande</span>
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => handleSend(null, "Que me conseillez-vous du chef ?")}
                                                            className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-gold/15 border border-white/10 hover:border-gold/40 text-gray-200 hover:text-white text-[11px] font-medium transition-all group text-left shadow-sm hover:translate-y-[-1px]"
                                                        >
                                                            <Sparkles className="w-4 h-4 text-gold shrink-0 transition-transform group-hover:scale-110" />
                                                            <span className="truncate">💡 Recommandations</span>
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => handleSend(null, "Quelles sont vos options sans gluten ou allergènes ?")}
                                                            className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-gray-200 hover:text-white text-[11px] font-medium transition-all group text-left shadow-sm hover:translate-y-[-1px]"
                                                        >
                                                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 transition-transform group-hover:scale-110" />
                                                            <span className="truncate">🌾 Allergies & Infos</span>
                                                        </button>
                                                        
                                                        <button 
                                                            onClick={() => handleSend(null, "Quelles sont les offres spéciales du jour ?")}
                                                            className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/40 text-gray-200 hover:text-white text-[11px] font-medium transition-all group text-left shadow-sm hover:translate-y-[-1px]"
                                                        >
                                                            <Tag className="w-4 h-4 text-rose-400 shrink-0 transition-transform group-hover:scale-110" />
                                                            <span className="truncate">🔥 Offres & Promos</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Grille des Catégories (Step 'categories') */}
                                            {msg.isCategorySelector && (
                                                <div className="mt-3.5 grid grid-cols-1 gap-2.5 pt-3 border-t border-white/10">
                                                    {categories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => handleSelectCategory(cat)}
                                                            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#151C33]/90 hover:bg-gold/15 border border-white/10 hover:border-gold/50 text-left transition-all duration-300 group shadow-md hover:translate-x-1"
                                                        >
                                                            <div>
                                                                <span className="font-display font-bold text-white text-xs group-hover:text-gold transition-colors">{cat.name}</span>
                                                                <p className="text-[10px] text-gray-400 mt-0.5">{cat.description || 'Spécialités de notre chef'}</p>
                                                            </div>
                                                            <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-gold group-hover:text-[#0A0F1D] text-gold transition-all">
                                                                <ArrowRight className="w-4 h-4 shrink-0 transition-transform" />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Liste des Plats de la Catégorie (Step 'dishes') */}
                                            {msg.isDishSelector && (
                                                <div className="mt-3.5 space-y-3 pt-3 border-t border-white/10">
                                                    {menuItems.filter(i => (i.category_id === msg.categoryId) || !msg.categoryId).map((dish) => {
                                                        const qty = cart[dish.id]?.quantity || 0;
                                                        return (
                                                            <div 
                                                                key={dish.id}
                                                                className={`p-3.5 rounded-2xl border transition-all duration-300 ${
                                                                    qty > 0 ? 'bg-gold/15 border-gold/60 shadow-[0_0_15px_rgba(201,168,76,0.15)]' : 'bg-[#151C33]/90 border-white/10 hover:border-white/20 shadow-md'
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-start gap-3">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-bold text-white text-xs">{dish.name}</h4>
                                                                        <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-normal">{dish.description}</p>
                                                                    </div>
                                                                    <span className="font-display font-bold text-gold bg-gold/10 border border-gold/30 text-xs px-2.5 py-1 rounded-xl shrink-0 shadow-inner">{dish.price} MAD</span>
                                                                </div>

                                                                {/* Quantity Controls */}
                                                                <div className="mt-3 flex items-center justify-end gap-2 pt-2.5 border-t border-white/5">
                                                                    {qty === 0 ? (
                                                                        <button
                                                                            onClick={() => handleAddToCart(dish)}
                                                                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gold to-amber hover:from-[#DFBF68] hover:to-gold text-[#0A0F1D] font-bold text-[11px] px-3.5 py-1.5 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                                                                        >
                                                                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                                                            Ajouter
                                                                        </button>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2.5 bg-[#0A0F1D] px-2.5 py-1 rounded-xl border border-gold/50 shadow-inner">
                                                                            <button 
                                                                                onClick={() => handleRemoveFromCart(dish)}
                                                                                className="text-gold hover:text-white p-1 transition-colors"
                                                                            >
                                                                                <Minus className="w-3.5 h-3.5 stroke-[3]" />
                                                                            </button>
                                                                            <span className="font-bold text-white text-xs px-1 min-w-[1.2rem] text-center">{qty}</span>
                                                                            <button 
                                                                                onClick={() => handleAddToCart(dish)}
                                                                                className="text-gold hover:text-white p-1 transition-colors"
                                                                            >
                                                                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        {msg.time && (
                                            <span className={`text-[10px] text-gray-500 font-medium px-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
                                                {msg.time}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Formulaire Inline de Commande */}
                                {!isUser && finalOrderData && (
                                    <div className="ml-11 max-w-[90%]">
                                        <InlineOrderForm 
                                            orderData={finalOrderData} 
                                            onSuccess={handleOrderSuccess} 
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {isLoading && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>

                {/* 4. Sticky Cart Banner */}
                {cartTotalCount > 0 && currentStep === 'dishes' && (
                    <div className="px-6 py-3.5 bg-gradient-to-r from-gold via-[#DFBF68] to-amber text-[#0A0F1D] flex items-center justify-between shadow-[0_-5px_25px_rgba(201,168,76,0.3)] shrink-0 animate-slideUp z-20">
                        <div className="flex items-center gap-2.5 font-bold text-xs">
                            <div className="h-7 w-7 rounded-xl bg-[#0A0F1D] text-gold flex items-center justify-center font-black">
                                {cartTotalCount}
                            </div>
                            <span>Panier • <span className="font-display font-black text-sm">{cartTotalPrice} MAD</span></span>
                        </div>
                        <button
                            onClick={handleGoToCheckout}
                            className="bg-[#0A0F1D] text-gold hover:bg-black font-bold text-xs px-4 py-2 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-1.5 border border-gold/30"
                        >
                            <span>Valider</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* 5. Sleek Floating Input Footer */}
                <div className="p-4 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-white/10 shrink-0 z-20">
                    <form onSubmit={(e) => handleSend(e)} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Écrivez votre question ou message..."
                            disabled={isLoading}
                            className="w-full bg-[#13192B] border border-white/15 rounded-2xl pl-4 pr-12 py-3.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-gold/70 focus:ring-2 focus:ring-gold/20 transition-all shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            aria-label="Envoyer"
                            className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-amber hover:from-[#DFBF68] hover:to-gold disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-[#0A0F1D] transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed shadow-md"
                        >
                            <Send className="h-4 w-4 ml-0.5 font-bold stroke-[2.5]" />
                        </button>
                    </form>
                    <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center">
                        <Sparkles className="w-3 h-3 text-gold/60" />
                        <span className="text-[9px] text-white/40 tracking-widest uppercase font-semibold">MAREA RESTAURANT • ASSISTANT IA PREMIUM</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

function in_array(needle, haystack) {
    return haystack.includes(needle);
}

export default ChatDrawer;

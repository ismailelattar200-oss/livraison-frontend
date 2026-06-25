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
        content: "Salam & Bienvenue ! 🌙 Je suis l'assistant virtuel gastronomique MAREA.\nComment puis-je vous régaler aujourd'hui ?\n\n💬 Nous pouvons échanger en Français, Arabe ou Darija !",
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
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none pointer-events-auto md:pointer-events-none">
            {/* Click outside to close on mobile */}
            <div className="absolute inset-0 md:hidden" onClick={onClose} />

            {/* Chat Drawer Window Panel */}
            <div className="pointer-events-auto relative flex w-full flex-col bg-[#0A0F1D] shadow-[0_10px_50px_rgba(0,0,0,0.8)] transition-all duration-300 animate-in slide-in-from-bottom md:slide-in-from-right md:fixed md:bottom-24 md:right-6 md:w-[420px] md:h-[650px] md:max-h-[calc(100vh-7rem)] md:rounded-3xl border border-gold/30 overflow-hidden h-[88vh] mt-auto rounded-t-[2.5rem] md:mt-0">
                
                {/* 1. Sleek Gradient Header */}
                <div className="relative flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-[#1A213C] via-[#12172A] to-[#0A0F1D] border-b border-white/10 shadow-md shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/30 to-gold/5 border border-gold/40 shadow-inner">
                            <Moon className="h-5 w-5 text-gold fill-gold/40" />
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 m-auto"></span>
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-display font-bold text-white text-sm tracking-wide">Assistant MAREA</h3>
                                {currentStep !== 'home' && (
                                    <span className="px-2 py-0.5 rounded-full bg-gold/20 text-[10px] text-gold font-sans font-bold flex items-center gap-1 border border-gold/30">
                                        <Tag className="w-2.5 h-2.5" />
                                        {currentStep === 'categories' ? 'Catégories' : currentStep === 'dishes' ? selectedCategory?.name : 'Commande'}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-emerald-400 font-medium tracking-wide flex items-center gap-1 mt-0.5">
                                En ligne • Réponse instantanée
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleReset}
                            title="Nouvelle conversation"
                            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            aria-label="Fermer"
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* 2. Interactive Navigation Sub-header (ex: < Retour au menu  ● ● ○ ○) */}
                {currentStep !== 'home' && (
                    <div className="px-5 py-2.5 bg-[#121729]/90 border-b border-white/5 flex items-center justify-between text-xs text-gold font-medium shrink-0 animate-fadeIn">
                        <button 
                            onClick={handleBackStep}
                            className="flex items-center gap-1 hover:text-white transition-colors py-0.5"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {currentStep === 'categories' ? 'Retour à l\'accueil' : currentStep === 'dishes' ? 'Catégories' : 'Retour au panier'}
                        </button>
                        
                        {/* Pagination Progress Dots */}
                        <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${currentStep !== 'home' ? 'bg-gold shadow-[0_0_8px_#C9A84C]' : 'bg-white/20'}`}></span>
                            <span className={`h-2 w-2 rounded-full ${in_array(currentStep, ['dishes', 'checkout']) ? 'bg-gold shadow-[0_0_8px_#C9A84C]' : 'bg-white/20'}`}></span>
                            <span className={`h-2 w-2 rounded-full ${currentStep === 'checkout' ? 'bg-gold shadow-[0_0_8px_#C9A84C]' : 'bg-white/20'}`}></span>
                        </div>
                    </div>
                )}

                {/* 3. Messages Body Canvas */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#080C17] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,168,76,0.1),rgba(255,255,255,0))]">
                    {messages.map((msg, index) => {
                        const isUser = msg.role === 'user';
                        const { cleanText, parsedOrderData } = !isUser ? parseMessageContent(msg.content) : { cleanText: msg.content, parsedOrderData: null };
                        const finalOrderData = msg.orderData || parsedOrderData;

                        return (
                            <div key={index} className="space-y-2.5 animate-fadeIn">
                                <div className={`flex gap-3 max-w-[92%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                                    
                                    {/* Avatar */}
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-lg mt-1 ${
                                        isUser 
                                            ? 'bg-gradient-to-br from-gold to-amber text-[#0A0F1D] font-bold' 
                                            : 'bg-[#151B2E] border border-gold/40 text-gold'
                                    }`}>
                                        {isUser ? <User className="h-4 w-4 stroke-[2.5]" /> : <Moon className="h-4 w-4 fill-gold/30" />}
                                    </div>

                                    {/* Card Container */}
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className={`rounded-2xl px-4 py-3.5 text-xs leading-relaxed shadow-xl whitespace-pre-line relative ${
                                            isUser
                                                ? 'bg-gradient-to-r from-[#C9A84C] to-[#DFBF68] text-[#0A0F1D] font-medium rounded-tr-none shadow-gold/10'
                                                : 'bg-[#121729] text-gray-100 rounded-tl-none border border-white/10 shadow-black/40'
                                        }`}>
                                            {cleanText}

                                            {/* Action Pill Buttons inside Greeting Card (Mockup Luxify) */}
                                            {msg.isGreeting && (
                                                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                                                    <button 
                                                        onClick={() => handleOpenCategories("Je veux commander")}
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-gold text-[#0A0F1D] hover:bg-gold/90 rounded-xl px-3.5 py-2 transition-all shadow-md hover:scale-105"
                                                    >
                                                        <ShoppingBag className="w-3.5 h-3.5" />
                                                        Commander en ligne
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenCategories("Montrez-moi le menu")}
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-white/5 hover:bg-white/15 text-gray-200 border border-white/15 rounded-xl px-3 py-2 transition-all"
                                                    >
                                                        <UtensilsCrossed className="w-3.5 h-3.5 text-gold" />
                                                        Voir la carte
                                                    </button>
                                                    <button 
                                                        onClick={() => handleSend(null, "Quels sont vos horaires et votre adresse ?")}
                                                        className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-white/5 hover:bg-white/15 text-gray-200 border border-white/15 rounded-xl px-3 py-2 transition-all"
                                                    >
                                                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                                                        Horaires & Infos
                                                    </button>
                                                </div>
                                            )}

                                            {/* Grille des Catégories (Step 'categories') */}
                                            {msg.isCategorySelector && (
                                                <div className="mt-3 grid grid-cols-1 gap-2 pt-2 border-t border-white/10">
                                                    {categories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => handleSelectCategory(cat)}
                                                            className="flex items-center justify-between p-3 rounded-xl bg-[#182038] hover:bg-gold/20 border border-white/10 hover:border-gold/50 text-left transition-all group"
                                                        >
                                                            <div>
                                                                <span className="font-display font-bold text-white text-xs group-hover:text-gold transition-colors">{cat.name}</span>
                                                                <p className="text-[10px] text-gray-400 mt-0.5">{cat.description || 'Découvrir les plats'}</p>
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-gold shrink-0 transition-transform group-hover:translate-x-1" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Liste des Plats de la Catégorie (Step 'dishes') */}
                                            {msg.isDishSelector && (
                                                <div className="mt-3 space-y-2.5 pt-2 border-t border-white/10">
                                                    {menuItems.filter(i => (i.category_id === msg.categoryId) || !msg.categoryId).map((dish) => {
                                                        const qty = cart[dish.id]?.quantity || 0;
                                                        return (
                                                            <div 
                                                                key={dish.id}
                                                                className={`p-3 rounded-xl border transition-all ${
                                                                    qty > 0 ? 'bg-gold/10 border-gold/50' : 'bg-[#182038]/80 border-white/10'
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-start gap-2">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-bold text-white text-xs">{dish.name}</h4>
                                                                        <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{dish.description}</p>
                                                                    </div>
                                                                    <span className="font-display font-bold text-gold text-xs shrink-0">{dish.price} MAD</span>
                                                                </div>

                                                                {/* Quantity Controls */}
                                                                <div className="mt-2.5 flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                                                                    {qty === 0 ? (
                                                                        <button
                                                                            onClick={() => handleAddToCart(dish)}
                                                                            className="inline-flex items-center gap-1 bg-gold hover:bg-gold/90 text-[#0A0F1D] font-bold text-[11px] px-3 py-1 rounded-lg shadow transition-all hover:scale-105"
                                                                        >
                                                                            <Plus className="w-3 h-3 stroke-[3]" />
                                                                            Ajouter
                                                                        </button>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 bg-[#0A0F1D] px-2 py-1 rounded-lg border border-gold/40">
                                                                            <button 
                                                                                onClick={() => handleRemoveFromCart(dish)}
                                                                                className="text-gold hover:text-white p-0.5 transition-colors"
                                                                            >
                                                                                <Minus className="w-3 h-3 stroke-[3]" />
                                                                            </button>
                                                                            <span className="font-bold text-white text-xs px-1.5">{qty}</span>
                                                                            <button 
                                                                                onClick={() => handleAddToCart(dish)}
                                                                                className="text-gold hover:text-white p-0.5 transition-colors"
                                                                            >
                                                                                <Plus className="w-3 h-3 stroke-[3]" />
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
                                            <span className={`text-[10px] text-gray-500 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
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

                {/* 4. Sticky Cart Banner (si articles sélectionnés) */}
                {cartTotalCount > 0 && currentStep === 'dishes' && (
                    <div className="px-5 py-3 bg-gradient-to-r from-gold to-amber text-[#0A0F1D] flex items-center justify-between shadow-2xl shrink-0 animate-slideUp">
                        <div className="flex items-center gap-2 font-bold text-xs">
                            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                            <span>{cartTotalCount} plat(s) • {cartTotalPrice} MAD</span>
                        </div>
                        <button
                            onClick={handleGoToCheckout}
                            className="bg-[#0A0F1D] text-gold hover:bg-black font-bold text-xs px-4 py-2 rounded-xl shadow transition-all hover:scale-105 inline-flex items-center gap-1.5"
                        >
                            Commander
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* 5. Sleek Floating Input Footer (Mockup Luxify) */}
                <div className="p-4 bg-[#0A0F1D] border-t border-white/10 shrink-0">
                    <form onSubmit={(e) => handleSend(e)} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Écrivez votre question ou message..."
                            disabled={isLoading}
                            className="w-full bg-[#121729] border border-white/15 rounded-full pl-5 pr-14 py-3.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            aria-label="Envoyer"
                            className="absolute right-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber hover:from-gold/90 hover:to-amber/90 disabled:from-gray-700 disabled:to-gray-800 text-[#0A0F1D] transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed shadow-lg"
                        >
                            <Send className="h-4 w-4 ml-0.5 font-bold stroke-[2.5]" />
                        </button>
                    </form>
                    <div className="mt-2 text-center">
                        <span className="text-[10px] text-white/30 tracking-wider font-medium">MAREA RESTAURANT • ASSISTANT INTELLIGENT</span>
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

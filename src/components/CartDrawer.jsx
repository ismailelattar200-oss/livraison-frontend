import React, { useEffect, useRef } from 'react';
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const { isCartOpen, setIsCartOpen, cart, cartTotal, cartCount, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();
    const drawerRef = useRef(null);

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsCartOpen(false);
        };
        if (isCartOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCartOpen, setIsCartOpen]);

    // Handle body scroll locking
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen]);

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/pedido');
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsCartOpen(false)}
            ></div>

            {/* Drawer */}
            <div 
                ref={drawerRef}
                className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#fbfaf8] z-50 transform transition-transform duration-500 ease-out shadow-2xl flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-navy-deep via-navy-deep to-[#8A6A24] px-6 py-5 flex items-center justify-between text-white shrink-0 shadow-md">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 text-gold" />
                        <h2 className="font-display text-xl tracking-wide">Mon Panier</h2>
                        <span className="bg-gold/20 text-gold border border-gold/30 px-3 py-1 rounded-full text-xs font-bold tracking-widest">
                            {cartCount} {cartCount > 1 ? 'ARTICLES' : 'ARTICLE'}
                        </span>
                    </div>
                    <button 
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                    >
                        <X className="w-5 h-5 text-white/80 group-hover:text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gold/50 scrollbar-track-transparent">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-navy-deep font-display text-xl mb-2">Votre panier est vide</p>
                            <p className="text-gray-500 text-sm">Découvrez nos créations culinaires et laissez-vous tenter.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4 group">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0 py-1 flex flex-col">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <h4 className="font-semibold text-navy-deep truncate pr-2 leading-tight">
                                                {item.name}
                                            </h4>
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                                                title="Retirer l'article"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="text-gold font-bold text-sm mb-auto">
                                            {item.price.toFixed(2)} MAD
                                        </div>
                                        
                                        {/* Stepper */}
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8 bg-white">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-navy-deep transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-bold text-navy-deep">
                                                    {item.quantity}
                                                </span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-navy-deep transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="text-xs text-navy-deep font-semibold hidden group-hover:block transition-all">
                                                = {(item.price * item.quantity).toFixed(2)} MAD
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="bg-white border-t border-gray-100 p-6 shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>Sous-total:</span>
                                <span className="font-medium text-navy-deep">{cartTotal.toFixed(2)} MAD</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>Livraison:</span>
                                {cartTotal >= 500 ? (
                                    <span className="text-green-600 font-bold tracking-wide">Gratuite ✓</span>
                                ) : (
                                    <span className="text-navy-deep font-medium">+ Frais standard</span>
                                )}
                            </div>
                            <div className="h-px bg-gray-100 my-2"></div>
                            <div className="flex justify-between items-end">
                                <span className="font-display text-navy-deep font-bold tracking-wide">TOTAL:</span>
                                <span className="font-display text-2xl text-gold font-bold">
                                    {cartTotal.toFixed(2)} MAD
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            className="w-full bg-gradient-to-r from-gold to-amber text-navy-deep font-bold py-4 rounded-xl shadow-[0_4px_14px_0_rgba(201,168,76,0.39)] hover:shadow-[0_6px_20px_rgba(201,168,76,0.23)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mb-4"
                        >
                            Passer la commande <ArrowRight className="w-5 h-5" />
                        </button>
                        
                        <button 
                            onClick={() => setIsCartOpen(false)}
                            className="w-full text-center text-sm text-gray-400 hover:text-navy-deep font-medium transition-colors"
                        >
                            Continuer mes achats
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;

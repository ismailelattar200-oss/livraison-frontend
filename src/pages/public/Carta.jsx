import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Plus, Minus, X, ShoppingBag, Star } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';

const Carta = () => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [loading, setLoading] = useState(true);
    const { favorites, toggleFavorite, isFavorite } = useFavorites();

    const handleToggleFavorite = (e, id) => {
        e.stopPropagation();
        toggleFavorite(id);
    };
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const { addToCart, cartCount, cartTotal, setIsCartOpen } = useCart();

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const [catsRes, itemsRes] = await Promise.all([
                    api.getCategories(),
                    api.getMenuItems()
                ]);
                setCategories(catsRes.data.data);
                setMenuItems(itemsRes.data.data);
            } catch (error) {
                console.error("Erreur chargement carte:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const displayItems = activeCategory === 'Tous' 
        ? menuItems 
        : menuItems.filter(item => item.category?.name === activeCategory);

    const openModal = (item) => {
        setSelectedItem(item);
        setQuantity(1);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedItem(null);
        document.body.style.overflow = 'auto';
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            addToCart(selectedItem, quantity);
            closeModal();
        }
    };

    return (
        <div className="bg-cream min-h-screen pt-20">
            {/* Header */}
            <div className="section-header pt-24 pb-16">
                <span className="eyebrow">NOTRE MENU</span>
                <h1 className="section-title">Menu</h1>
                <p className="section-subtitle">
                    Choisissez vos plats et passez votre commande à emporter au restaurant ou faites-vous livrer à domicile.
                </p>
            </div>

            {/* Category Pills (Sticky) */}
            <div className="sticky top-20 z-30 bg-black-rich border-y border-white/10 shadow-md">
                <div className="max-w-7xl mx-auto">
                    <div className="flex overflow-x-auto no-scrollbar py-4 px-4 gap-3 items-center">
                        <button
                            onClick={() => setActiveCategory('Tous')}
                            className={`whitespace-nowrap px-6 py-2 rounded-full font-sans text-sm font-medium transition-colors ${
                                activeCategory === 'Tous' 
                                ? 'bg-gold text-black-rich font-bold' 
                                : 'border border-white/20 text-white hover:border-gold hover:text-gold'
                            }`}
                        >
                            Tous
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`whitespace-nowrap px-6 py-2 rounded-full font-sans text-sm font-medium transition-colors ${
                                    activeCategory === cat.name 
                                    ? 'bg-gold text-black-rich font-bold' 
                                    : 'border border-white/20 text-white hover:border-gold hover:text-gold'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-[1600px] mx-auto p-0 md:p-4 lg:p-8">
                {loading ? (
                    <div className="flex justify-center py-24"><div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full"></div></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5 md:gap-4 lg:gap-6">
                        {displayItems.map((item, idx) => {
                            const rating = parseFloat(item.rating) || (4.0 + (item.id % 10) / 10); // fallback if not seeded
                            const fullStars = Math.floor(rating);
                            const emptyStars = 5 - fullStars;

                            return (
                                <div 
                                    key={item.id} 
                                    className={`group flex flex-col bg-white cursor-pointer rounded-2xl md:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 animate-[fadeSlideUp_0.5s_ease-out_both] overflow-hidden border border-gray-200 ${!item.is_available ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                    onClick={() => item.is_available && openModal(item)}
                                >
                                    {/* Top Section: Image */}
                                    <div className="relative h-48 md:h-56 w-full overflow-hidden flex-shrink-0 bg-gray-50">
                                        <img 
                                            src={item.image_url} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                        />
                                        
                                        {/* Dark Overlay for hover */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-0"></div>

                                        {/* Badges (Top Left) */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                                            <div className="bg-[#E53935] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm w-fit">
                                                -{(15 + (item.id % 3) * 5)}%
                                            </div>
                                            {item.id % 2 === 0 && (
                                            <div className="bg-[#FF5722] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm w-fit">
                                                HOT
                                            </div>
                                            )}
                                        </div>

                                        {/* Heart Button (Top Right) */}
                                        <button 
                                            onClick={(e) => handleToggleFavorite(e, item.id)}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center z-30 hover:bg-gray-50 transition-colors"
                                            title="Ajouter aux favoris"
                                        >
                                            <Heart className={`w-4 h-4 transition-colors ${isFavorite(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                        </button>

                                        {/* Centered "Aperçu" Button */}
                                        {item.is_available && (
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                                <span className="bg-white/95 text-navy-deep px-5 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform text-sm">
                                                    <Eye className="w-4 h-4" />
                                                    Aperçu
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Bottom Section: Info & Add to Cart */}
                                    <div className="p-4 md:p-5 flex flex-col flex-grow bg-white z-10 relative">
                                        <div className="flex-grow">
                                            <div className="text-purple-500 text-[10px] md:text-xs font-bold tracking-widest mb-1.5 uppercase">
                                                {item.category?.name || "ART CULINAIRE ET GASTRONOMIE"}
                                            </div>
                                            <h3 className="font-display text-base md:text-lg text-navy-deep mb-2 leading-tight line-clamp-1 font-semibold">{item.name}</h3>
                                            
                                            {/* Star Rating */}
                                            <div className="flex items-center gap-1 mb-3">
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`w-3 h-3 md:w-3.5 md:h-3.5 ${i < Math.round(rating) ? 'fill-gold text-gold' : 'fill-transparent text-gray-300'}`} 
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-gray-400 ml-1.5 font-sans text-xs">({rating.toFixed(1)})</span>
                                            </div>
                                            
                                            {/* Price */}
                                            <div className="flex items-end gap-2 mb-4">
                                                <span className="font-sans text-lg md:text-xl text-black font-extrabold">
                                                    {item.price.toFixed(2)} MAD
                                                </span>
                                                <span className="font-sans text-xs md:text-sm text-gray-400 line-through mb-0.5">
                                                    {(item.price * 1.25).toFixed(2)} MAD
                                                </span>
                                            </div>
                                        </div>

                                        {/* Add to Cart Button */}
                                        {item.is_available && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(item, 1);
                                                }}
                                                className="w-full bg-navy-deep text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gold hover:text-black-rich transition-all shadow-sm hover:shadow-md text-sm md:text-base group/btn mt-auto"
                                            >
                                                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover/btn:scale-110" />
                                                Ajouter au panier
                                            </button>
                                        )}
                                        {!item.is_available && (
                                            <div className="w-full py-2.5 flex items-center justify-center bg-gray-50 rounded-xl mt-auto">
                                                <span className="text-red-500 text-sm font-bold uppercase tracking-wider">Épuisé</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Floating Cart Button for Mobile/Desktop */}
            {cartCount > 0 && (
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-[88px] right-6 z-40 bg-gold text-black-rich rounded-full p-4 shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform group cursor-pointer border border-white/20"
                >
                    <div className="relative">
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 bg-navy-deep text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {cartCount}
                        </span>
                    </div>
                    <span className="font-bold hidden md:inline-block whitespace-nowrap">
                        {cartTotal.toFixed(2)} MAD
                    </span>
                </button>
            )}

            {/* Slide-up Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black-rich/80 backdrop-blur-sm p-0 sm:p-4">
                    <div 
                        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-xl overflow-hidden flex flex-col sm:flex-row shadow-2xl animate-[slideUp_0.3s_ease-out]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sm:w-1/2 relative h-64 sm:h-auto">
                            <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-full object-cover" />
                            <button 
                                onClick={closeModal}
                                className="absolute top-4 left-4 sm:hidden bg-white/20 backdrop-blur-md p-2 rounded-full text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="sm:w-1/2 p-6 md:p-8 flex flex-col">
                            <div className="flex justify-between items-start mb-4 hidden sm:flex">
                                <span className="text-purple-500 text-xs font-bold tracking-widest uppercase">{selectedItem.category?.name || "ART CULINAIRE ET GASTRONOMIE"}</span>
                                <button onClick={closeModal} className="text-gray-400 hover:text-navy-deep transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <span className="text-purple-500 text-xs font-bold tracking-widest uppercase sm:hidden mb-2">{selectedItem.category?.name || "ART CULINAIRE ET GASTRONOMIE"}</span>
                            
                            <h2 className="font-display text-3xl text-navy-deep mb-2">{selectedItem.name}</h2>
                            <p className="text-gray-600 font-light mb-6 flex-grow">{selectedItem.description}</p>
                            
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-3xl font-display text-navy-deep font-bold">{(selectedItem.price * quantity).toFixed(2)} MAD</span>
                                
                                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                                    <button 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="px-4 py-2 text-navy-deep hover:bg-gray-100 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 font-bold w-12 text-center text-navy-deep">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="px-4 py-2 text-navy-deep hover:bg-gray-100 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleAddToCart}
                                className="w-full bg-navy-deep text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gold hover:text-black-rich transition-all shadow-md text-lg mt-auto group/btn"
                            >
                                <ShoppingCart className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                                Ajouter à la commande
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx="true">{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes fadeSlideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Carta;

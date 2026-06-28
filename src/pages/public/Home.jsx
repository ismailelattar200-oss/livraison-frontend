import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ChevronRight, ChevronLeft, Calendar, ShoppingCart, Heart, Star, Eye, Clock, Users } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';

const Home = () => {
    const [featuredDishes, setFeaturedDishes] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [toastMessage, setToastMessage] = useState(null);
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const { addToCart, setIsCartOpen } = useCart();
    const navigate = useNavigate();
    const [touchStart, setTouchStart] = useState(null);

    const heroSlides = [
        {
            number: "01",
            shortTitle: "Plateau Royal",
            badge: "GASTRONOMIE FINE",
            title: "Saveurs d'Exception",
            highlight: "Plateau Royal",
            description: "Une sélection raffinée de nos chefs étoilés, dressée avec des ingrédients prestigieux sur céramique noire dans une pure ambiance haute couture.",
            buttonText: "Commander le Plateau",
            buttonLink: "/menu",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=100",
            bgPosition: "bg-[position:center_center]"
        },
        {
            number: "02",
            shortTitle: "Expérience VIP",
            badge: "ATMOSPHÈRE PRESTIGIEUSE",
            title: "Service d'Excellence",
            highlight: "Expérience VIP",
            description: "Une table somptueusement dressée sous une lumière tamisée aux reflets dorés pour sublimer chacun de vos dîners d'exception chez MAREA.",
            buttonText: "Réserver une Table",
            buttonLink: "/menu",
            image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=2000&q=100",
            bgPosition: "bg-[position:center_center]"
        },
        {
            number: "03",
            shortTitle: "Livraison Premium",
            badge: "SERVICE EXCLUSIF",
            title: "Livraison de Luxe",
            highlight: "À Domicile",
            description: "L'excellence gastronomique de nos cuisines livrée directement chez vous dans un écrin noir mat isotherme d'une élégance absolue.",
            buttonText: "Commander en Ligne",
            buttonLink: "/menu",
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=2000&q=100",
            bgPosition: "bg-[position:center_center]"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [currentSlide, heroSlides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchEnd = (e) => {
        if (!touchStart) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (diff > 50) nextSlide();
        if (diff < -50) prevSlide();
        setTouchStart(null);
    };

    const handleToggleFavorite = (e, id) => {
        e.stopPropagation();
        toggleFavorite(id);
    };

    const handleAddToCart = (e, dish) => {
        e.stopPropagation();
        e.preventDefault();
        addToCart(dish, 1);
        
        // Show local toast
        setToastMessage(`${dish.name} ajouté au panier ✓`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        
        const fetchData = async () => {
            try {
                const [dishesRes, eventsRes] = await Promise.all([
                    api.getMenuItems(),
                    api.getEvents()
                ]);
                
                let featured = dishesRes.data.data.filter(item => item.is_featured);
                if (featured.length < 6) {
                    const others = dishesRes.data.data.filter(item => !item.is_featured);
                    featured = [...featured, ...others].slice(0, 6);
                } else {
                    featured = featured.slice(0, 6);
                }
                setFeaturedDishes(featured);
                setEvents(eventsRes.data.data.slice(0, 3));
            } catch (error) {
                console.error("Erreur de chargement:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {/* Custom Toast Notification */}
            {toastMessage && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-navy-deep text-gold px-6 py-3 rounded-full shadow-2xl z-50 animate-fade-in flex items-center gap-2 border border-gold/30">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="font-bold">{toastMessage}</span>
                </div>
            )}

            {/* LUXIFY Style Hero Carousel Section */}
            <section className="relative w-full pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 lg:px-12 bg-cream">
                {/* Main Floating Card Carousel Container */}
                <div 
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="w-full mx-auto max-w-[1400px] h-[60vh] min-h-[460px] sm:min-h-[520px] max-h-[650px] rounded-2xl sm:rounded-3xl relative overflow-hidden group bg-[#161828] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#D4AF37]/25 select-none"
                >
                    {/* Slides loop - Smooth Crossfade */}
                    {heroSlides.map((slide, index) => (
                        <div 
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out overflow-hidden ${currentSlide === index ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}
                        >
                            {/* Background Image with Slow Zoom Animation */}
                            <div 
                                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ${slide.bgPosition || 'bg-[position:center_center]'} ${currentSlide === index ? 'animate-hero-zoom' : 'scale-100'}`}
                                style={{ backgroundImage: `url('${slide.image}')` }}
                            />

                            {/* Subtle light overlay so the background photo shines brightly across the entire card */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:via-50% sm:to-transparent"></div>
                            
                            {/* Content container inside Carousel */}
                            <div className="relative z-20 h-full flex flex-col justify-center items-start px-6 sm:px-12 md:px-16 lg:px-24 max-w-[720px]">
                                <div key={`${index}-${currentSlide === index ? 'active' : 'inactive'}`} className="w-full">
                                    {/* Gold Badge */}
                                    <div className={currentSlide === index ? "animate-hero-badge" : "opacity-0"}>
                                        <span className="inline-flex items-center gap-2 border border-[#D4AF37]/60 rounded-full px-4 sm:px-5 py-1.5 text-[11px] sm:text-xs font-bold text-[#D4AF37] uppercase tracking-widest bg-[#111322]/60 backdrop-blur-md mb-4 sm:mb-6 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                                            {slide.badge}
                                        </span>
                                    </div>
                                    
                                    {/* Main Title */}
                                    <h1 className={`text-3xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-3 sm:mb-5 tracking-tight leading-tight sm:leading-tight drop-shadow-md ${currentSlide === index ? "animate-hero-title" : "opacity-0"}`}>
                                        {slide.title} <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#DFBF68] to-[#F3E5AB]">{slide.highlight}</span>
                                    </h1>
                                    
                                    {/* Subtitle/Description */}
                                    <p className={`text-sm sm:text-base md:text-lg text-gray-200 font-light mb-6 sm:mb-8 leading-relaxed drop-shadow max-w-[520px] ${currentSlide === index ? "animate-hero-desc" : "opacity-0"}`}>
                                        {slide.description}
                                    </p>
                                    
                                    {/* CTA Button */}
                                    <div className={currentSlide === index ? "animate-hero-btn pt-1" : "opacity-0"}>
                                        <Link 
                                            to={slide.buttonLink} 
                                            className="inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#DFBF68] to-[#F3E5AB] text-[#111322] font-extrabold text-sm sm:text-base hover:opacity-100 transition-all duration-300 hover:scale-105 shadow-[0_6px_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.9)] active:scale-95 group/btn border border-white/30"
                                        >
                                            <span>{slide.buttonText}</span>
                                            <span className="font-extrabold text-lg transition-transform duration-300 group-hover/btn:translate-x-2">→</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Navigation Arrows - Circular buttons INSIDE carousel edges */}
                    <button 
                        onClick={prevSlide}
                        className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#111322]/60 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#DFBF68] hover:text-[#111322] backdrop-blur-md flex items-center justify-center text-[#D4AF37] transition-all duration-300 cursor-pointer z-30 opacity-70 sm:opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] active:scale-95"
                        aria-label="Slide précédente"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <button 
                        onClick={nextSlide}
                        className="absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#111322]/60 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#DFBF68] hover:text-[#111322] backdrop-blur-md flex items-center justify-center text-[#D4AF37] transition-all duration-300 cursor-pointer z-30 opacity-70 sm:opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] active:scale-95"
                        aria-label="Slide suivante"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" />
                    </button>

                    {/* Dot Indicators - Minimalist floating directly at bottom of carousel */}
                    <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 sm:gap-3">
                        {heroSlides.map((_, index) => (
                            <button 
                                key={index} 
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 rounded-full transition-all duration-500 ease-out cursor-pointer ${currentSlide === index ? 'w-8 sm:w-10 bg-gradient-to-r from-[#D4AF37] via-[#DFBF68] to-[#F3E5AB] shadow-[0_0_12px_rgba(212,175,55,0.9)]' : 'w-2 bg-white/50 hover:bg-[#D4AF37]/80 hover:w-3'}`}
                                aria-label={`Aller à la slide ${index + 1}`}
                            ></button>
                        ))}
                    </div>
                </div>
            </section>


            {/* Featured Dishes */}
            <div className="section-header">
                <span className="eyebrow">Notre Essence</span>
                <h2 className="section-title">Plats Vedettes</h2>
                <p className="section-subtitle">
                    Une sélection de nos créations les plus acclamées, où la tradition marocaine rencontre la fraîcheur méditerranéenne.
                </p>
            </div>
            <section className="bg-cream py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-end mb-8">
                        <Link to="/menu" className="hidden md:inline-flex items-center gap-2 text-gold hover:text-navy-deep font-semibold uppercase tracking-wider transition-colors shrink-0">
                            Voir le menu <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full"></div></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {featuredDishes.map((dish, idx) => {
                                const rating = parseFloat(dish.rating) || (4.0 + (dish.id % 10) / 10);
                                const fullStars = Math.floor(rating);
                                const emptyStars = 5 - fullStars;
                                
                                return (
                                    <div 
                                        key={dish.id} 
                                        className="group flex flex-col bg-white cursor-pointer rounded-2xl md:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
                                        onClick={() => navigate('/menu')}
                                    >
                                        {/* Top Section: Image */}
                                        <div className="relative aspect-[4/3] w-full overflow-hidden flex-shrink-0 bg-gray-50">
                                            <img 
                                                src={dish.image_url} 
                                                alt={dish.name} 
                                                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                            />
                                            
                                            {/* Dark Overlay for hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-0"></div>

                                            {/* Badges (Top Left) */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                                                <div className="bg-[#E53935] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm w-fit">
                                                    -{(15 + (dish.id % 3) * 5)}%
                                                </div>
                                                {dish.id % 2 === 0 && (
                                                <div className="bg-[#FF5722] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full shadow-sm w-fit">
                                                    HOT
                                                </div>
                                                )}
                                            </div>

                                            {/* Heart Button (Top Right) */}
                                            <button 
                                                onClick={(e) => handleToggleFavorite(e, dish.id)}
                                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center z-30 hover:bg-gray-50 transition-colors"
                                                title="Ajouter aux favoris"
                                            >
                                                <Heart className={`w-4 h-4 transition-colors ${isFavorite(dish.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                            </button>

                                            {/* Centered "Aperçu" Button */}
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                                <span className="bg-white/95 text-navy-deep px-5 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-transform text-sm">
                                                    <Eye className="w-4 h-4" />
                                                    Aperçu
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Bottom Section: Info & Add to Cart */}
                                        <div className="p-4 md:p-5 flex flex-col flex-grow bg-white z-10 relative">
                                            <div className="flex-grow">
                                                <div className="text-purple-500 text-[10px] md:text-xs font-bold tracking-widest mb-1.5 uppercase">
                                                    {dish.category?.name || "ART CULINAIRE ET GASTRONOMIE"}
                                                </div>
                                                <h3 className="font-display text-base md:text-lg text-navy-deep mb-2 leading-tight line-clamp-1 font-semibold">{dish.name}</h3>
                                                
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
                                                        {dish.price.toFixed(2)} MAD
                                                    </span>
                                                    <span className="font-sans text-xs md:text-sm text-gray-400 line-through mb-0.5">
                                                        {(dish.price * 1.25).toFixed(2)} MAD
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Add to Cart Button */}
                                            <button 
                                                onClick={(e) => handleAddToCart(e, dish)}
                                                className="w-full bg-navy-deep text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gold hover:text-black-rich transition-all shadow-sm hover:shadow-md text-sm md:text-base group/btn mt-auto"
                                            >
                                                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover/btn:scale-110" />
                                                Ajouter au panier
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    <div className="mt-8 text-center md:hidden">
                        <Link to="/menu" className="inline-flex items-center gap-2 text-gold hover:text-navy-deep font-semibold uppercase tracking-wider transition-colors">
                            Voir le menu <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>


            {/* Events Teaser */}
            <div className="section-header">
                <span className="eyebrow">Expériences MAREA</span>
                <h2 className="section-title">Prochains Événements</h2>
            </div>
            <section className="bg-cream py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-end mb-8">
                        <Link to="/eventos" className="hidden md:inline-flex items-center gap-2 text-gold hover:text-navy-deep font-semibold uppercase tracking-wider transition-colors">
                            Voir tout <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                    {loading ? (
                         <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full"></div></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {events.map(event => {
                                const date = new Date(event.event_date);
                                return (
                                    <div 
                                        key={event.id} 
                                        onClick={() => navigate('/eventos')}
                                        className="group flex flex-col bg-white cursor-pointer rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden border border-gray-100 h-full"
                                    >
                                        <div className="relative aspect-[4/3] w-full overflow-hidden flex-shrink-0 bg-gray-50">
                                            <img 
                                                src={event.image_url} 
                                                alt={event.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            />
                                            {/* Dark overlay on hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-0"></div>
                                            
                                            {/* Date Badge (Top Left) */}
                                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg flex flex-col items-center justify-center border border-white/20 min-w-[80px] z-20">
                                                <span className="font-display text-2xl font-bold text-navy-deep leading-none">{date.getDate()}</span>
                                                <span className="font-sans text-[10px] font-bold text-navy-deep tracking-widest uppercase mt-1">
                                                    {date.toLocaleString('fr', { month: 'short' })}
                                                </span>
                                            </div>

                                            {/* Bottom Info Bar */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end bg-gradient-to-t from-navy-deep/90 via-navy-deep/40 to-transparent z-20">
                                                <div className="flex items-center gap-2 text-white/90">
                                                    <Clock className="w-4 h-4 text-gold" />
                                                    <span className="text-sm font-medium">{event.time || "21:30"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-white/90">
                                                    <Users className="w-4 h-4 text-gold" />
                                                    <span className="text-sm font-medium">{event.capacity || 40} places</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 md:p-8 flex flex-col flex-grow bg-white z-10 relative">
                                            <div className="flex-grow">
                                                <h3 className="font-display text-2xl text-gold mb-4 leading-tight">
                                                    {event.title}
                                                </h3>
                                                <p className="text-gray-600 font-light text-sm md:text-base mb-6 flex-grow leading-relaxed line-clamp-4">
                                                    {event.description}
                                                </p>
                                            </div>
                                            
                                            <Link 
                                                to="/eventos" 
                                                className="w-full bg-navy-deep text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gold hover:text-navy-deep transition-colors shadow-sm hover:shadow-md group/btn mt-auto"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Calendar className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover/btn:-translate-y-1" /> 
                                                Demander une réservation
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    <div className="mt-8 text-center md:hidden">
                        <Link to="/eventos" className="inline-flex items-center gap-2 text-gold hover:text-navy-deep font-semibold uppercase tracking-wider transition-colors">
                            Voir tout <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

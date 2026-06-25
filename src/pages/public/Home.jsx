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

    const heroSlides = [
        {
            bgGradient: "bg-[#0A0A0A]",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=100", // Dark, beautiful gourmet meat/steak/food
            badge: "GASTRONOMIE MÉDITERRANÉENNE",
            title: "Art Culinaire",
            description: "Une cuisson parfaite aux fines herbes fraîches et citron braisé.",
            buttonText: "Commander",
            buttonLink: "/menu"
        },
        {
            bgGradient: "bg-[#0A0A0A]",
            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=2000&q=100", // Extremely appetizing, bright but moody gourmet food
            badge: "PLATEAU ROYAL",
            title: "Saveurs d'Exception",
            description: "Sélection premium de nos chefs dans une harmonie de saveurs.",
            buttonText: "Voir le Menu",
            buttonLink: "/menu"
        },
        {
            bgGradient: "bg-[#0A0A0A]",
            image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2000&q=100", // Bright, colorful gourmet sushi/seafood on dark background
            badge: "EXPÉRIENCE VIP",
            title: "Créations Uniques",
            description: "Une explosion de saveurs dans une présentation spectaculaire.",
            buttonText: "Réserver",
            buttonLink: "/menu"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

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

            {/* Premium Hero Section Redesign - Floating Card Layout */}
            <section className="relative w-full pt-28 pb-16 flex items-center justify-center bg-cream">
                {/* Main Banner Container - Soft Luxury Gastronomy Card */}
                <div className="w-full max-w-[1500px] h-[60vh] min-h-[500px] max-h-[700px] mx-4 md:mx-8 lg:mx-12 rounded-[2rem] relative overflow-hidden group bg-[#1A1A1A] shadow-[0_20px_60px_rgba(30,22,17,0.5)] border border-[#D4AF37]/30 backdrop-blur-md">
                    
                    {/* Slides loop */}
                    {heroSlides.map((slide, index) => (
                        <div 
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center md:bg-right transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            style={{ backgroundImage: `url('${slide.image}')` }}
                        >
                                {/* Smooth Image Blending Overlay - Soft warm luxury gradient */}
                                <div className="absolute inset-y-0 left-0 w-full md:w-[75%] lg:w-[65%] bg-gradient-to-r from-[#1E1611] via-[#1A1A1A]/90 to-transparent"></div>
                                {/* Ambient Warm Glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#2D2219]/40 via-transparent to-transparent pointer-events-none"></div>
                                
                                {/* Content container */}
                                <div className="relative z-20 h-full flex flex-col justify-center items-start px-12 sm:px-16 md:px-24 lg:px-32 max-w-[800px]">
                                    
                                    {/* Badge */}
                                    <div className="mb-6 overflow-hidden">
                                        <span className="inline-flex items-center px-6 py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em] border border-[#D4AF37]/40 text-[#D4AF37] bg-[#1E1611]/60 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mr-3 animate-pulse"></span>
                                            {slide.badge}
                                        </span>
                                    </div>
                                    
                                    {/* Main Title - Pure white with soft warm shadow */}
                                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[75px] font-display font-normal text-white mb-6 leading-[1.05] drop-shadow-[0_4px_15px_rgba(45,34,25,0.6)] tracking-tight">
                                        {slide.title}
                                    </h1>
                                    
                                    {/* Subtitle/Description - Soft beige/cream */}
                                    <p className="text-base sm:text-lg text-[#EAE3D2] font-sans font-light mb-12 max-w-[500px] leading-relaxed drop-shadow-sm">
                                        {slide.description}
                                    </p>
                                    
                                    {/* CTA Button - Warm golden gradient with glow */}
                                    <div>
                                        <Link 
                                            to={slide.buttonLink} 
                                            className="group relative inline-flex items-center justify-center px-10 py-4 font-sans font-semibold text-[13px] sm:text-sm uppercase tracking-widest text-[#1E1611] bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_10px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.6)]"
                                        >
                                            <span className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
                                            <span className="relative flex items-center gap-3">
                                                {slide.buttonText} 
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Navigation Arrows - Left/Right edges */}
                        <button 
                            onClick={prevSlide}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center text-white/70 hover:text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all duration-300 cursor-pointer z-30 opacity-0 group-hover:opacity-100 hidden md:flex"
                            aria-label="Slide précédente"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-center text-white/70 hover:text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all duration-300 cursor-pointer z-30 opacity-0 group-hover:opacity-100 hidden md:flex"
                            aria-label="Slide suivante"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Pagination Indicators - Centered at bottom */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
                            {heroSlides.map((_, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-out ${currentSlide === index ? 'w-10 bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
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

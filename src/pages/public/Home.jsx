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
            bgGradient: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1C1F3A] via-[#0D0D0D] to-[#080911]",
            badge: "LIVRAISON GRATUITE",
            title: "Livraison\nPremium",
            description: "Vos plats gastronomiques préférés, livrés gratuitement dès 500 MAD.",
            buttonText: "Commander",
            buttonLink: "/menu"
        },
        {
            bgGradient: "bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#0D0D0D] via-[#111322] to-[#1C1F3A]",
            badge: "COMMANDE EN LIGNE",
            title: "Saveurs\nAuthentiques",
            description: "Découvrez nos plats signatures et créations du chef, prêts à déguster.",
            buttonText: "Voir le Menu",
            buttonLink: "/menu"
        },
        {
            bgGradient: "bg-gradient-to-tr from-[#1C1F3A] via-[#0A0A12] to-[#0D0D0D]",
            badge: "EXPÉRIENCE INOUBLIABLE",
            title: "Cuisine\nd'Exception",
            description: "L'art de la table à son apogée, préparé avec passion et raffinement.",
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

            {/* Hero Section */}
            <section className="relative min-h-screen pt-32 pb-20 flex items-center justify-center bg-cream overflow-hidden">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-[70vh] min-h-[550px] max-h-[800px]">
                    <div className="w-full h-full rounded-2xl shadow-2xl relative overflow-hidden group border border-white/10 bg-[#0D0D0D]">
                        
                        {/* Slides loop */}
                        {heroSlides.map((slide, index) => (
                            <div 
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${slide.bgGradient} ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                            >
                                {/* Subtle vignette/glow effect overlay */}
                                <div className="absolute inset-0 bg-black/30 mix-blend-multiply"></div>
                                
                                {/* Content container */}
                                <div className="relative z-20 h-full flex flex-col justify-center items-start px-10 md:px-20 lg:px-28 max-w-4xl">
                                    <div className="mb-6">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] border border-gold/50 text-gold bg-transparent shadow-sm">
                                            {slide.badge}
                                        </span>
                                    </div>
                                    <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl text-white mb-6 leading-[1.1] font-display">
                                        {slide.title.split('\n').map((line, i) => (
                                            <span key={i} className="block">
                                                {line}
                                            </span>
                                        ))}
                                    </h1>
                                    <p className="text-lg md:text-xl text-gray-300 font-sans font-light mb-10 max-w-2xl leading-relaxed">
                                        {slide.description}
                                    </p>
                                    <div>
                                        <Link 
                                            to={slide.buttonLink} 
                                            className="inline-flex items-center gap-3 bg-gold text-navy-deep font-bold text-sm md:text-base px-8 py-4 rounded-full transition-all duration-300 hover:bg-white hover:scale-105 shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
                                        >
                                            {slide.buttonText} <ChevronRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Navigation Arrows */}
                        <button 
                            onClick={prevSlide}
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-all z-20 opacity-0 group-hover:opacity-100 hidden md:flex hover:scale-105"
                            aria-label="Slide précédente"
                        >
                            <ChevronLeft className="w-8 h-8 text-white" />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-all z-20 opacity-0 group-hover:opacity-100 hidden md:flex hover:scale-105"
                            aria-label="Slide suivante"
                        >
                            <ChevronRight className="w-8 h-8 text-white" />
                        </button>

                        {/* Pagination Dots */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                            {heroSlides.map((_, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2 rounded-full transition-all duration-500 ease-in-out ${currentSlide === index ? 'w-10 bg-gold' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                                    aria-label={`Aller à la slide ${index + 1}`}
                                ></button>
                            ))}
                        </div>
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

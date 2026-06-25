import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Menu, X, ShoppingBag, ShoppingCart, Search, Heart, ChevronDown, User, Package, Settings, LogOut, LayoutGrid } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const userDropdownRef = useRef(null);
    
    const { cartCount, setIsCartOpen } = useCart();
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Mock favorites count as requested since context doesn't exist yet
    const favoritesCount = 0; 

    const navBgClass = 'bg-black-rich shadow-lg';

    useEffect(() => {
        setAvatarError(false);
    }, [user]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        setIsUserDropdownOpen(false);
        setMobileMenuOpen(false);
        await logout();
        navigate('/');
    };

    const mainLinks = [
        { name: 'Accueil', path: '/' },
        { name: 'Menu', path: '/menu' },
        { name: 'Galerie', path: '/galeria' },
    ];

    const dropdownLinks = [
        { name: 'À Propos', path: '/nosotros' },
        { name: 'Événements', path: '/eventos' },
        { name: 'Carrières', path: '/trabaja-con-nosotros' },
        { name: 'Contact', path: '/contacto' },
    ];

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${navBgClass}`}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-3 group">
                            <span className="font-display text-2xl text-gold tracking-widest font-bold group-hover:text-white transition-colors duration-300">MAREA</span>
                        </Link>
                    </div>

                    {/* Desktop Center: Links & Search */}
                    <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
                        {/* Links */}
                        <div className="flex items-center space-x-6">
                            {mainLinks.map((link) => (
                                <Link 
                                    key={link.name} 
                                    to={link.path} 
                                    className={`relative font-semibold text-sm uppercase tracking-widest transition-colors duration-300 group py-2
                                        ${location.pathname === link.path ? 'text-gold' : 'text-white/90 hover:text-gold'}`}
                                >
                                    {link.name}
                                    <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-gold transform origin-left transition-transform duration-300 ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                                </Link>
                            ))}
                            
                            {/* Combo Box Dropdown */}
                            <div 
                                className="relative group"
                                onMouseEnter={() => setIsDropdownOpen(true)}
                                onMouseLeave={() => setIsDropdownOpen(false)}
                            >
                                <button className="flex items-center gap-1 text-white/90 hover:text-gold transition-colors duration-300 text-sm uppercase tracking-widest font-semibold py-2 focus:outline-none">
                                    Découvrir 
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-gold' : ''}`} />
                                </button>
                                
                                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-56 bg-[#111827] border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-300 origin-top-center overflow-hidden
                                    ${isDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}
                                >
                                    <div className="py-2 flex flex-col">
                                        {dropdownLinks.map(link => (
                                            <Link 
                                                key={link.name} 
                                                to={link.path}
                                                className={`px-5 py-3 text-sm font-medium transition-colors duration-200 flex items-center
                                                    ${location.pathname === link.path ? 'text-gold bg-white/5' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-gold mr-3 opacity-0 transition-opacity group-hover:opacity-100"></span>
                                                {link.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group/search ml-8 hidden xl:block">
                            <input 
                                type="text" 
                                placeholder="Rechercher..." 
                                className="bg-black/20 text-white placeholder-white/40 border border-[#C9A84C]/60 hover:border-[#C9A84C] rounded-full py-3 pl-12 pr-6 w-72 focus:w-96 transition-all duration-500 ease-out focus:outline-none focus:border-[#C9A84C] focus:bg-black/40 shadow-inner text-base"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C9A84C] opacity-80 group-focus-within/search:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Desktop Right: Icons & Auth */}
                    <div className="hidden lg:flex items-center space-x-5 justify-end">
                        <div className="flex items-center space-x-4">
                            {/* Heart (Favorites) */}
                            <Link to="/profile?tab=wishlist" className="relative text-white/90 hover:text-red-400 transition-colors group/heart p-1.5 xl:p-2">
                                <Heart className="w-5 h-5 transition-transform duration-300 group-hover/heart:scale-110" />
                                {favoritesCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-lg ring-2 ring-black-rich">
                                        {favoritesCount}
                                    </span>
                                )}
                            </Link>

                            {/* Cart */}
                            <button onClick={() => setIsCartOpen(true)} className="relative text-white/90 hover:text-gold transition-colors group/cart p-1.5 xl:p-2 cursor-pointer">
                                <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover/cart:scale-110" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-gold text-navy-deep text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                        

                        {/* Auth */}
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                            {user ? (
                            <div className="relative" ref={userDropdownRef}>
                                <button 
                                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    className="flex items-center gap-2.5 text-white/90 hover:text-gold transition-colors duration-300 focus:outline-none"
                                >
                                    {user.avatar && !avatarError ? (
                                        <img 
                                            src={user.avatar} 
                                            alt={user.name} 
                                            onError={() => setAvatarError(true)}
                                            className="w-10 h-10 rounded-full border-[1.5px] border-gold/60 object-cover shadow-sm hover:border-gold transition-colors" 
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gold/20 border-[1.5px] border-gold/60 text-gold flex items-center justify-center text-base font-bold uppercase shadow-sm hover:border-gold transition-colors">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="text-sm font-semibold tracking-wide">{user.name.split(' ')[0]}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180 text-gold' : ''}`} />
                                </button>
                                
                                <div className={`absolute top-full right-0 mt-3 w-64 bg-navy-deep border border-white/10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all duration-300 origin-top-right overflow-hidden z-50
                                    ${isUserDropdownOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}
                                >
                                    <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black-rich/30">
                                        {user.avatar && !avatarError ? (
                                            <img 
                                                src={user.avatar} 
                                                alt={user.name} 
                                                onError={() => setAvatarError(true)}
                                                className="w-12 h-12 rounded-full border border-gold/50 object-cover shadow-md" 
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/50 text-gold flex items-center justify-center text-lg font-bold uppercase shadow-md">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                            <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="py-2 flex flex-col">
                                        <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} className="px-5 py-2.5 text-sm font-medium text-white/80 hover:text-gold hover:bg-white/5 transition-colors flex items-center gap-3">
                                            <User className="w-4 h-4" /> Mon Profil
                                        </Link>
                                        {user.role === 'customer' ? (
                                            <Link to="/profile?tab=commandes" onClick={() => setIsUserDropdownOpen(false)} className="px-5 py-2.5 text-sm font-medium text-white/80 hover:text-gold hover:bg-white/5 transition-colors flex items-center gap-3">
                                                <Package className="w-4 h-4" /> Mes Commandes
                                            </Link>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setIsUserDropdownOpen(false);
                                                    const email = user.email?.trim().toLowerCase();
                                                    const target = user.role === 'admin' ? '/admin' : 
                                                                   user.role === 'staff' ? '/cuisine' : 
                                                                   '/livreur';
                                                    console.log('Navigating to', target, 'Role:', user.role, 'Email:', email);
                                                    navigate(target);
                                                }}
                                                className="w-full px-5 py-2.5 text-sm font-medium text-white/80 hover:text-gold hover:bg-white/5 transition-colors flex items-center gap-3 text-left"
                                            >
                                                <LayoutGrid className="w-4 h-4" /> Tableau de bord
                                            </button>
                                        )}
                                    </div>
                                    <div className="py-2 border-t border-white/10">
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full px-5 py-2.5 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-3 text-left"
                                        >
                                            <LogOut className="w-4 h-4" /> Déconnexion
                                        </button>
                                    </div>
                                </div>
                            </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-white/90 hover:text-[#C9A84C] text-sm font-semibold transition-colors whitespace-nowrap px-1">
                                        Connexion
                                    </Link>
                                    <Link to="/inscription" className="bg-[#C9A84C] text-[#1C1F3A] hover:bg-[#A68A3D] text-sm font-bold py-2 px-5 rounded-full transition-all whitespace-nowrap shadow-[0_4px_15px_rgba(201,168,76,0.4)] hover:shadow-[0_6px_20px_rgba(201,168,76,0.6)] hover:-translate-y-0.5 ml-2">
                                        S'inscrire
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button & Icons */}
                    <div className="lg:hidden flex items-center gap-4">
                        <Link to="/profile?tab=wishlist" className="relative text-white p-1">
                            <Heart className="w-6 h-6" />
                            {favoritesCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-black-rich">
                                    {favoritesCount}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-3 text-white/90 hover:text-gold transition-colors p-2 w-full text-left">
                            <ShoppingCart className="w-6 h-6" />
                            {cartCount > 0 && (
                                <span className="bg-gold text-navy-deep text-xs font-bold px-2 py-0.5 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                            <span className="font-medium text-lg">Mon Panier</span>
                        </button>
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-white hover:text-gold transition-colors p-1"
                        >
                            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div 
                className={`lg:hidden bg-black-rich absolute w-full shadow-2xl transition-all duration-300 ease-in-out border-t border-white/5 overflow-hidden
                ${mobileMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-5 pt-6 pb-8 space-y-6 flex flex-col">
                    {/* Mobile Search */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            className="w-full bg-white/5 text-white placeholder-white/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-gold focus:bg-white/10 transition-colors"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                        {mainLinks.map((link) => (
                            <Link 
                                key={link.name} 
                                to={link.path} 
                                onClick={() => setMobileMenuOpen(false)}
                                className={`font-bold block py-3 text-lg border-b border-white/5 uppercase tracking-widest transition-colors
                                    ${location.pathname === link.path ? 'text-gold' : 'text-white hover:text-gold'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        
                        <div className="py-4">
                            <span className="text-gold/50 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Découvrir Plus</span>
                            <div className="flex flex-col space-y-3">
                                {dropdownLinks.map(link => (
                                    <Link 
                                        key={link.name} 
                                        to={link.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-white/80 hover:text-white block py-2 pl-4 text-base border-l-2 border-transparent hover:border-gold transition-all"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                        {user ? (
                                <div className="flex flex-col bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                    <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-black-rich/30">
                                        {user.avatar && !avatarError ? (
                                            <img 
                                                src={user.avatar} 
                                                alt={user.name} 
                                                onError={() => setAvatarError(true)}
                                                className="w-10 h-10 rounded-full border border-gold/50 object-cover" 
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/50 text-gold flex items-center justify-center text-lg font-bold uppercase">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-white font-bold text-sm truncate">{user.name}</p>
                                            <p className="text-white/50 text-xs truncate mt-0.5">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col py-2">
                                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-gold hover:bg-white/5 px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors">
                                            <User className="w-4 h-4" /> Mon Profil
                                        </Link>
                                        {user.role === 'customer' ? (
                                            <>
                                                <Link to="/profile?tab=commandes" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-gold hover:bg-white/5 px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors">
                                                    <Package className="w-4 h-4" /> Mes Commandes
                                                </Link>
                                                <Link to="/profile?tab=wishlist" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-gold hover:bg-white/5 px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors">
                                                    <Heart className="w-4 h-4" /> Ma Wishlist
                                                </Link>
                                                <Link to="/profile?tab=parametres" onClick={() => setMobileMenuOpen(false)} className="text-white/80 hover:text-gold hover:bg-white/5 px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors">
                                                    <Settings className="w-4 h-4" /> Paramètres
                                                </Link>
                                            </>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    const email = user.email?.trim().toLowerCase();
                                                    const target = user.role === 'admin' ? '/admin' : 
                                                                   user.role === 'staff' ? '/cuisine' : 
                                                                   '/livreur';
                                                    console.log('Navigating to', target, 'Role:', user.role, 'Email:', email);
                                                    navigate(target);
                                                }}
                                                className="w-full text-white/80 hover:text-gold hover:bg-white/5 px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors text-left"
                                            >
                                                <LayoutGrid className="w-4 h-4" /> Tableau de bord
                                            </button>
                                        )}
                                    </div>
                                    <div className="border-t border-white/10 py-2">
                                        <button onClick={handleLogout} className="w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 text-sm font-bold text-left transition-colors">
                                            <LogOut className="w-4 h-4" /> Déconnexion
                                        </button>
                                    </div>
                                </div>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-outline-gold w-full text-center py-3">
                                    Connexion
                                </Link>
                                <Link to="/inscription" onClick={() => setMobileMenuOpen(false)} className="btn-gold w-full text-center py-3 shadow-lg shadow-gold/20">
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

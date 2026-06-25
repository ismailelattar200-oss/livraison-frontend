import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Package, Heart, Settings, Camera, Trash2, ShoppingCart, Eye, Star, Key, Bell, Globe, LogOut, AlertTriangle, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import AvatarUpload from '../../components/AvatarUpload';
import api from '../../services/api';

const Profile = () => {
    const { user, setUser, logout, loading } = useAuth();
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const { addToCart, setIsCartOpen } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'profil';
    
    const [activeTab, setActiveTab] = useState(initialTab);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [profileForm, setProfileForm] = useState({ 
        name: '', email: '', phone: '', birthdate: '' 
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    // Password State
    const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    // Settings State
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [language, setLanguage] = useState('fr');

    const fileInputRef = useRef(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && user === null) {
            navigate('/login');
        } else if (user) {
            setProfileForm({ 
                name: user.name || '', 
                email: user.email || '', 
                phone: user.phone || '',
                birthdate: user.birthdate || '' 
            });
            setNotificationsEnabled(user.notifications_enabled ?? true);
            setLanguage(user.language || 'fr');
        }
    }, [user, loading, navigate]);

    const tabs = [
        { id: 'profil', label: 'Mon Profil', icon: User },
        { id: 'commandes', label: 'Mes Commandes', icon: Package },
        { id: 'wishlist', label: 'Ma Wishlist', icon: Heart },
        { id: 'parametres', label: 'Paramètres', icon: Settings },
    ];

    useEffect(() => {
        if (!user) return;

        if (activeTab === 'wishlist') {
            fetchWishlistItems();
        }
        if (activeTab === 'commandes') {
            fetchOrders();
        }
    }, [activeTab, favorites.length, user]);

    const fetchWishlistItems = async () => {
        if (favorites.length === 0) {
            setWishlistItems([]);
            return;
        }
        setLoadingWishlist(true);
        try {
            const res = await api.getMenuItems();
            const allItems = res.data.data;
            const filtered = allItems.filter(item => favorites.includes(item.id));
            setWishlistItems(filtered);
        } catch (error) {
            console.error("Failed to load wishlist items", error);
        } finally {
            setLoadingWishlist(false);
        }
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await api.getUserOrders();
            setOrders(res.data.data);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    // --- Profile Actions ---
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage({ type: '', text: '' });
        try {
            const res = await api.updateProfile(profileForm);
            setUser(prev => ({ ...prev, ...res.data.data }));
            setProfileMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
            setIsEditing(false);
            
            // Clear message after 3 seconds
            setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à jour.' });
        } finally {
            setProfileLoading(false);
        }
    };

    // --- Password Actions ---
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordLoading(true);
        setPasswordMessage({ type: '', text: '' });
        try {
            await api.updatePassword(passwordForm);
            setPasswordMessage({ type: 'success', text: 'Mot de passe modifié avec succès.' });
            setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
            
            // Clear message after 3 seconds
            setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la modification du mot de passe.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    // --- Settings Actions ---
    const handleNotificationToggle = async () => {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        try {
            const res = await api.updateProfile({ notifications_enabled: newValue });
            setUser(prev => ({ ...prev, ...res.data.data }));
        } catch (error) {
            setNotificationsEnabled(!newValue); // Revert on failure
            console.error("Failed to update notification settings", error);
        }
    };

    const handleLanguageChange = async (e) => {
        const newValue = e.target.value;
        setLanguage(newValue);
        try {
            const res = await api.updateProfile({ language: newValue });
            setUser(prev => ({ ...prev, ...res.data.data }));
        } catch (error) {
            console.error("Failed to update language", error);
        }
    };

    // --- Account Actions ---
    const handleDeleteAccount = async () => {
        if (!window.confirm("⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement votre compte ? Cette action est irréversible.")) return;
        try {
            await api.deleteAccount();
            logout();
            navigate('/');
        } catch (error) {
            alert("Erreur lors de la suppression du compte.");
        }
    };

    // Prevent rendering if redirecting or loading
    if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="text-navy-deep font-bold">Chargement...</div></div>;
    if (!user) return null;

    const formattedMemberSince = new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-cream min-h-screen pt-20">
            {/* Header (Top, full width) */}
            <div className="bg-gradient-to-br from-[#1C1F3A] to-[#C9A84C] pt-16 pb-48 px-4 sm:px-6 lg:px-8 relative shadow-lg">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-30">
                    <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        {/* Avatar */}
                        <AvatarUpload user={user} setUser={setUser} />
                        
                        {/* User Info */}
                        <div className="text-white mt-4 md:mt-0">
                            <h1 className="text-3xl md:text-4xl font-display font-bold mb-1">{user.name}</h1>
                            <p className="text-[#FDFBF7]/90 text-sm mb-2 font-medium">{user.email}</p>
                            <p className="text-white/70 text-xs font-semibold tracking-wide uppercase">
                                Membre depuis {formattedMemberSince}
                            </p>
                        </div>
                    </div>

                    {/* Modifier Profile Button */}
                    <button 
                        onClick={() => { setActiveTab('profil'); setIsEditing(!isEditing); }}
                        className="px-6 py-2.5 rounded-full border-2 border-white/40 text-white font-bold hover:bg-white hover:text-navy-deep transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Edit2 className="w-4 h-4 inline-block mr-2 -mt-1" />
                        Modifier le profil
                    </button>
                </div>
                {/* Subtle pattern or overlay can go here if needed */}
                <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20 mb-20">
                {/* Tabs (white card, overlapping header) */}
                <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 flex items-center overflow-x-auto no-scrollbar border border-gray-100 gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex-1 justify-center whitespace-nowrap ${
                                activeTab === tab.id 
                                ? 'bg-navy-deep text-gold shadow-md' 
                                : 'text-gray-500 hover:text-gold hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-gold' : ''}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'profil' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Informations personnelles */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 border border-gray-100">
                            <h2 className="text-2xl font-display text-navy-deep mb-6 font-bold flex items-center gap-2">
                                <User className="w-6 h-6 text-gold" /> Informations personnelles
                            </h2>

                            {profileMessage.text && (
                                <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    {profileMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-navy-deep mb-2">Nom complet</label>
                                        <input 
                                            type="text" 
                                            value={profileForm.name}
                                            onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                            disabled={!isEditing}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gold outline-none transition-all disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium text-navy-deep"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-navy-deep mb-2">Adresse Email</label>
                                        <input 
                                            type="email" 
                                            value={profileForm.email}
                                            onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                                            disabled={!isEditing}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gold outline-none transition-all disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium text-navy-deep"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-navy-deep mb-2">Téléphone</label>
                                        <input 
                                            type="tel" 
                                            value={profileForm.phone}
                                            onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                                            disabled={!isEditing}
                                            placeholder="+212 600-000000"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gold outline-none transition-all disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium text-navy-deep"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-navy-deep mb-2">Date de naissance</label>
                                        <input 
                                            type="date" 
                                            value={profileForm.birthdate}
                                            onChange={e => setProfileForm({...profileForm, birthdate: e.target.value})}
                                            disabled={!isEditing}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gold outline-none transition-all disabled:opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium text-navy-deep"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end pt-4">
                                    {isEditing ? (
                                        <button 
                                            type="submit" 
                                            disabled={profileLoading}
                                            className="bg-gold text-navy-deep px-8 py-3.5 rounded-xl font-bold hover:bg-[#B59641] transition-all shadow-md disabled:opacity-70 w-full md:w-auto"
                                        >
                                            {profileLoading ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                                        </button>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
                                            className="bg-navy-deep text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gold hover:text-navy-deep transition-all shadow-md w-full md:w-auto"
                                        >
                                            Activer la modification
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Changer le mot de passe */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 border border-gray-100">
                            <h2 className="text-2xl font-display text-navy-deep mb-6 font-bold flex items-center gap-2">
                                <Key className="w-6 h-6 text-gold" /> Changer le mot de passe
                            </h2>

                            {passwordMessage.text && (
                                <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                    {passwordMessage.text}
                                </div>
                            )}

                            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-navy-deep mb-2">Ancien mot de passe</label>
                                        <input 
                                            type="password" required 
                                            value={passwordForm.current_password}
                                            onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gold outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-navy-deep mb-2">Nouveau mot de passe</label>
                                        <input 
                                            type="password" required minLength="8"
                                            value={passwordForm.new_password}
                                            onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gold outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-navy-deep mb-2">Confirmer le mot de passe</label>
                                        <input 
                                            type="password" required minLength="8"
                                            value={passwordForm.new_password_confirmation}
                                            onChange={e => setPasswordForm({...passwordForm, new_password_confirmation: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-gold outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button 
                                        type="submit" disabled={passwordLoading}
                                        className="border-2 border-gold text-gold hover:bg-gold hover:text-navy-deep px-8 py-3.5 rounded-xl font-bold transition-all w-full md:w-auto"
                                    >
                                        {passwordLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'parametres' && (
                    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 border border-gray-100">
                            <h2 className="text-2xl font-display text-navy-deep mb-8 font-bold">Paramètres du compte</h2>
                            
                            <div className="space-y-6">
                                {/* Notifications Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Bell className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-navy-deep text-lg">Notifications</h3>
                                            <p className="text-sm text-gray-500 font-medium">Recevoir des emails sur les offres et commandes</p>
                                        </div>
                                    </div>
                                    {/* Toggle Switch */}
                                    <button 
                                        type="button"
                                        onClick={handleNotificationToggle}
                                        className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${notificationsEnabled ? 'bg-gold' : 'bg-gray-300'}`}
                                    >
                                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${notificationsEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>

                                <div className="h-px bg-gray-100 my-6"></div>

                                {/* Language Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Globe className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-navy-deep text-lg">Langue</h3>
                                            <p className="text-sm text-gray-500 font-medium">Choisissez votre langue préférée</p>
                                        </div>
                                    </div>
                                    <select 
                                        value={language}
                                        onChange={handleLanguageChange}
                                        className="bg-gray-50 border border-gray-200 text-navy-deep text-sm rounded-xl focus:ring-gold focus:border-gold block p-2.5 font-bold outline-none cursor-pointer"
                                    >
                                        <option value="fr">Français</option>
                                    </select>
                                </div>

                                <div className="h-px bg-gray-100 my-6"></div>

                                {/* Logout */}
                                <button 
                                    onClick={() => { logout(); navigate('/'); }}
                                    className="w-full bg-gray-100 text-gray-600 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-5 h-5" /> Se déconnecter
                                </button>

                                {/* Delete Account */}
                                <button 
                                    onClick={handleDeleteAccount}
                                    className="w-full bg-red-50 text-red-600 border border-red-200 px-6 py-4 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-5 h-5" /> Supprimer le compte
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'commandes' && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 min-h-[400px] border border-gray-100 animate-fade-in">
                        {loadingOrders ? (
                            <div className="text-center py-20 text-gray-400 font-bold">Chargement de vos commandes...</div>
                        ) : orders.length === 0 ? (
                            <div className="text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package className="w-12 h-12 text-gray-300" />
                                </div>
                                <h2 className="text-2xl font-display text-navy-deep mb-3 font-bold">Aucune commande</h2>
                                <p className="text-gray-500 max-w-sm mx-auto font-medium">Vous n'avez pas encore passé de commande chez MAREA.</p>
                                <Link to="/menu" className="mt-8 inline-flex bg-navy-deep text-white font-bold px-8 py-3 rounded-xl hover:bg-gold hover:text-navy-deep transition-colors shadow-md">
                                    Commander maintenant
                                </Link>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-display text-navy-deep mb-8 border-b border-gray-100 pb-4 font-bold flex items-center gap-2">
                                    <Package className="w-6 h-6 text-gold" /> Historique de vos Commandes
                                </h2>
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-gray-100 rounded-2xl hover:shadow-lg hover:border-gold/30 transition-all bg-white group">
                                            <div className="mb-4 md:mb-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-bold text-navy-deep text-lg font-mono">{order.order_number}</span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                        order.status === 'en_attente' ? 'bg-gray-100 text-gray-800' :
                                                        order.status === 'en_preparation' ? 'bg-amber-100 text-amber-800' :
                                                        order.status === 'pret' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'en_cours' ? 'bg-indigo-100 text-indigo-800' :
                                                        order.status === 'livre' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-2 font-medium">
                                                    <span>{new Date(order.created_at).toLocaleDateString('fr-FR', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}</span>
                                                    <span>•</span>
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{order.type === 'livraison' ? 'Livraison' : 'À emporter'}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                                                <div className="text-left md:text-right">
                                                    <span className="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Total</span>
                                                    <span className="font-display font-bold text-xl text-gold">{order.total} MAD</span>
                                                </div>
                                                <Link 
                                                    to={`/seguimiento/${order.order_number}`}
                                                    className="bg-white border-2 border-gray-200 text-navy-deep px-5 py-2 rounded-xl text-sm font-bold hover:bg-gold hover:text-navy-deep hover:border-gold transition-colors group-hover:shadow-md"
                                                >
                                                    Détails
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'wishlist' && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 min-h-[400px] border border-gray-100 animate-fade-in">
                        {favorites.length === 0 ? (
                            <div className="text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Heart className="w-12 h-12 text-gray-300" />
                                </div>
                                <h2 className="text-2xl font-display text-navy-deep mb-3 font-bold">Votre wishlist est vide</h2>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
                                    Explorez nos collections et enregistrez vos plats préférés pour les retrouver ici.
                                </p>
                                <Link 
                                    to="/menu" 
                                    className="inline-flex bg-navy-deep text-white font-bold px-8 py-3 rounded-xl hover:bg-gold hover:text-navy-deep transition-colors shadow-md"
                                >
                                    Découvrir le Menu
                                </Link>
                            </div>
                        ) : loadingWishlist ? (
                            <div className="text-center py-20 text-gray-400 font-bold">Chargement de vos favoris...</div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                                    <h2 className="text-2xl font-display text-navy-deep font-bold flex items-center gap-2">
                                        <Heart className="w-6 h-6 text-gold" /> Vos Coups de Cœur
                                    </h2>
                                    <span className="text-navy-deep text-xs font-bold bg-gold/20 border border-gold/30 px-3 py-1 rounded-full uppercase tracking-widest">{favorites.length} articles</span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {wishlistItems.map(item => (
                                        <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-all border border-gray-100">
                                            {/* Image Area */}
                                            <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                
                                                {/* Remove from Wishlist Button */}
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); toggleFavorite(item.id); }}
                                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center z-10 text-gray-400 hover:text-red-500 hover:bg-white transition-colors"
                                                    title="Retirer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="font-bold text-navy-deep text-lg mb-2 truncate">{item.name}</h3>
                                                
                                                {/* Price & Cart */}
                                                <div className="mt-auto flex justify-between items-end pt-4">
                                                    <div>
                                                        <div className="text-lg font-bold text-gold">{item.price.toFixed(2)} MAD</div>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.preventDefault(); 
                                                            addToCart(item, 1); 
                                                            setIsCartOpen(true); 
                                                        }}
                                                        className="bg-navy-deep text-white w-10 h-10 rounded-full shadow-sm flex items-center justify-center hover:bg-gold hover:text-navy-deep transition-colors"
                                                        title="Ajouter au panier"
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

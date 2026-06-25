import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Save, Lock, AlertCircle, CheckCircle2, Settings, Shield, Eye, EyeOff, Palette, Bell } from 'lucide-react';
import AvatarUpload from '../../components/AvatarUpload';

const CuisineProfil = () => {
    const { user, setUser } = useAuth();
    
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profil');
    const [theme, setTheme] = useState('dark');
    const [primaryColor, setPrimaryColor] = useState('#6d28d9');
    const [notifications, setNotifications] = useState({
        newAssignment: true,
        orderUpdate: true,
        prepDelay: false,
    });
    
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        if (user) {
            setProfileData({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
        }
    }, [user]);

    const togglePassword = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await api.updateProfile(profileData);
            if (res.data.success) {
                setUser({ ...user, ...profileData });
                setStatus({ type: 'success', message: 'Profil mis à jour avec succès.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la mise à jour du profil.' });
        } finally {
            setIsSaving(false);
        }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setStatus({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }

        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await api.updatePassword(passwordData);
            if (res.data.success) {
                setStatus({ type: 'success', message: 'Mot de passe mis à jour avec succès.' });
                setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe.' });
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profil', label: 'Profil Cuisine', icon: User },
        { id: 'securite', label: 'Sécurité', icon: Shield },
        { id: 'apparence', label: 'Apparence', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    if (!user) return null;

    return (
        <div className="w-full flex flex-col gap-8 max-w-[1400px] mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1A1D2E] border border-white/5 flex items-center justify-center shadow-lg">
                    <Settings className="w-6 h-6 text-[#a78bfa]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Paramètres</h1>
                    <p className="text-sm text-gray-500">Gérez la configuration de votre espace cuisine</p>
                </div>
            </div>

            {status.message && (
                <div className={`p-4 rounded-xl font-medium flex items-center gap-3 border ${
                    status.type === 'success' ? 'bg-[#4ABA7A]/10 border-[#4ABA7A]/30 text-[#4ABA7A]' : 
                    status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                    'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                    {status.message}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-[#1A1D2E] border border-white/5 rounded-2xl p-3 flex flex-col gap-1 shadow-lg shrink-0">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    isActive 
                                        ? 'bg-[#6d28d9] text-white shadow-lg shadow-[#6d28d9]/20 font-bold' 
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full bg-[#1A1D2E] border border-white/5 rounded-2xl shadow-lg min-h-[500px]">
                    {activeTab === 'profil' && (
                        <div className="flex flex-col">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3">
                                <User className="w-5 h-5 text-[#a78bfa]" />
                                <h2 className="text-lg font-bold text-white">Profil Cuisine</h2>
                            </div>
                            
                            <form onSubmit={saveProfile} className="p-8 flex flex-col gap-8">
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="absolute -inset-1 border-2 border-[#6d28d9] rounded-full pointer-events-none z-10 opacity-50"></div>
                                        <AvatarUpload user={user} setUser={setUser} size="w-24 h-24" textSize="text-3xl" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-base font-bold text-white">Photo de profil</h3>
                                        <p className="text-sm text-gray-500 mt-1">Format JPG, GIF ou PNG. Taille maximale 2Mo.</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-gray-300 uppercase tracking-widest">Nom complet</label>
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleProfileChange}
                                            className="w-full bg-[#0F1117] border border-white/5 focus:border-[#6d28d9]/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-gray-300 uppercase tracking-widest">Adresse Email</label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            className="w-full bg-[#0F1117] border border-white/5 focus:border-[#6d28d9]/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-gray-300 uppercase tracking-widest">Téléphone</label>
                                        <input 
                                            type="text" 
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                            className="w-full bg-[#0F1117] border border-white/5 focus:border-[#6d28d9]/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="flex justify-end mt-4 pt-6 border-t border-white/5">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#6d28d9]/20"
                                    >
                                        <Save className="w-4 h-4" /> Sauvegarder
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'securite' && (
                        <div className="flex flex-col">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3">
                                <Shield className="w-5 h-5 text-[#a78bfa]" />
                                <h2 className="text-lg font-bold text-white">Sécurité & Mot de passe</h2>
                            </div>
                            
                            <form onSubmit={savePassword} className="p-8 flex flex-col gap-6">
                                <div className="flex flex-col gap-2 max-w-md">
                                    <label className="text-xs font-bold text-gray-300 uppercase tracking-widest">Mot de passe actuel</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#a78bfa] transition-colors" />
                                        <input 
                                            type={showPasswords.current ? "text" : "password"}
                                            name="current_password"
                                            value={passwordData.current_password}
                                            onChange={handlePasswordChange}
                                            className="w-full bg-[#0F1117] border border-white/5 focus:border-[#6d28d9]/50 rounded-xl pl-12 pr-12 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-600 font-mono tracking-widest"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => togglePassword('current')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-gray-300 uppercase tracking-widest">Nouveau mot de passe</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#a78bfa] transition-colors" />
                                            <input 
                                                type={showPasswords.new ? "text" : "password"}
                                                name="new_password"
                                                value={passwordData.new_password}
                                                onChange={handlePasswordChange}
                                                className="w-full bg-[#0F1117] border border-white/5 focus:border-[#6d28d9]/50 rounded-xl pl-12 pr-12 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-600 font-mono tracking-widest"
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => togglePassword('new')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-gray-300 uppercase tracking-widest">Confirmer mot de passe</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#a78bfa] transition-colors" />
                                            <input 
                                                type={showPasswords.confirm ? "text" : "password"}
                                                name="new_password_confirmation"
                                                value={passwordData.new_password_confirmation}
                                                onChange={handlePasswordChange}
                                                className="w-full bg-[#0F1117] border border-white/5 focus:border-[#6d28d9]/50 rounded-xl pl-12 pr-12 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-600 font-mono tracking-widest"
                                                placeholder="••••••••"
                                                required
                                                minLength={8}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => togglePassword('confirm')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4 pt-6 border-t border-white/5">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#6d28d9]/20"
                                    >
                                        <Save className="w-4 h-4" /> Mettre à jour
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'apparence' && (
                        <div className="flex flex-col">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3">
                                <Palette className="w-5 h-5 text-[#a78bfa]" />
                                <h2 className="text-lg font-bold text-white">Apparence</h2>
                            </div>
                            
                            <div className="p-8 flex flex-col gap-8">
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xs font-bold text-gray-300">Thème Global</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setTheme('dark')}
                                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all ${
                                                theme === 'dark' ? 'border-[#6d28d9] bg-[#6d28d9]/10' : 'border-white/5 bg-transparent hover:bg-white/5'
                                            }`}
                                        >
                                            <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-[#a78bfa]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                            </svg>
                                            <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`}>Mode Sombre</span>
                                        </button>
                                        <button 
                                            onClick={() => setTheme('light')}
                                            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all ${
                                                theme === 'light' ? 'border-[#6d28d9] bg-[#6d28d9]/10' : 'border-white/5 bg-transparent hover:bg-white/5'
                                            }`}
                                        >
                                            <svg className={`w-6 h-6 ${theme === 'light' ? 'text-[#a78bfa]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span className={`text-sm font-bold ${theme === 'light' ? 'text-white' : 'text-gray-400'}`}>Mode Clair</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xs font-bold text-gray-300">Couleur Principale</h3>
                                    <div className="flex items-center gap-4">
                                        {[
                                            '#C9A84C', // Gold
                                            '#3b82f6', // Blue
                                            '#10b981', // Green
                                            '#f97316'  // Orange
                                        ].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setPrimaryColor(color)}
                                                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105`}
                                                style={{ backgroundColor: color }}
                                            >
                                                {primaryColor === color && (
                                                    <>
                                                        <div className="absolute -inset-1 border-2 border-white rounded-full"></div>
                                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-start mt-4">
                                    <button 
                                        onClick={() => alert("Apparence sauvegardée ! (Démo)")}
                                        className="text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg hover:opacity-90"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Save className="w-4 h-4" /> Sauvegarder
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="flex flex-col">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3">
                                <Bell className="w-5 h-5 text-[#a78bfa]" />
                                <h2 className="text-lg font-bold text-white">Préférences de Notification</h2>
                            </div>
                            
                            <form className="p-8 flex flex-col gap-8">
                                <div className="space-y-6">
                                    {/* Nouvelle commande */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Nouvelle commande assignée</h4>
                                            <p className="text-xs text-gray-400 mt-1">Alerte lors d'une nouvelle commande à préparer en cuisine</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setNotifications({...notifications, newAssignment: !notifications.newAssignment})}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${notifications.newAssignment ? 'bg-[#6d28d9]' : 'bg-white/10'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications.newAssignment ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {/* Annulation / Modification */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Mise à jour de commande</h4>
                                            <p className="text-xs text-gray-400 mt-1">Alerte si une commande en cours de préparation est modifiée ou annulée</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setNotifications({...notifications, orderUpdate: !notifications.orderUpdate})}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${notifications.orderUpdate ? 'bg-[#6d28d9]' : 'bg-white/10'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications.orderUpdate ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {/* Retard de préparation */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Retards de préparation</h4>
                                            <p className="text-xs text-gray-400 mt-1">Alerte pour les commandes qui dépassent le temps de préparation moyen</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setNotifications({...notifications, prepDelay: !notifications.prepDelay})}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${notifications.prepDelay ? 'bg-[#6d28d9]' : 'bg-white/10'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications.prepDelay ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button 
                                        type="button"
                                        onClick={() => alert("Préférences sauvegardées ! (Démo)")}
                                        className="bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#6d28d9]/20"
                                    >
                                        <Save className="w-4 h-4" /> Sauvegarder les préférences
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CuisineProfil;

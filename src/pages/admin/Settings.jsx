import React, { useState } from 'react';
import { User, Shield, Palette, Store, Bell, Save, Settings as SettingsIcon, Lock, Moon, Sun, Check, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AvatarUpload from '../../components/AvatarUpload';

const Settings = () => {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profil');
    const [isSaving, setIsSaving] = useState(false);
    
    // Appearance states
    const [theme, setTheme] = useState('dark');
    const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
    
    const [formData, setFormData] = useState({
        name: user?.name || 'Admin Luxify',
        email: user?.email || 'admin@gmail.com'
    });

    const [boutiqueForm, setBoutiqueForm] = useState({
        name: 'Luxify',
        currency: 'Dirham Marocain (MAD)',
        freeShippingThreshold: '500',
        publicEmail: 'contact@luxify.ma'
    });

    const [notifications, setNotifications] = useState({
        newOrder: true,
        lowStock: true,
        newUser: false,
        orderCancelled: true
    });

    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            alert("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await api.updatePassword(passwordForm);
            alert("Mot de passe mis à jour avec succès !");
            setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (error) {
            console.error("Erreur mise à jour mot de passe:", error);
            alert("Erreur: " + (error.response?.data?.message || "Impossible de mettre à jour le mot de passe."));
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert('Profil sauvegardé avec succès !');
        }, 1000);
    };

    const tabs = [
        { id: 'profil', label: 'Profil Admin', icon: User },
        { id: 'securite', label: 'Sécurité', icon: Shield },
        { id: 'apparence', label: 'Apparence', icon: Palette },
        { id: 'boutique', label: 'Boutique', icon: Store },
        { id: 'notifications', label: 'Notifications', icon: Bell }
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-[calc(100vh-80px)]">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center rounded-xl shadow-sm">
                    <SettingsIcon className="w-6 h-6 text-[#8b5cf6]" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-wide">Paramètres</h1>
                    <p className="text-[#94a3b8] text-[13px] mt-0.5">Gérez la configuration de votre interface d'administration</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Sidebar */}
                <div className="w-full md:w-64 shrink-0 bg-[#1e1f2e] rounded-2xl p-4 border border-white/[0.03] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] flex flex-col gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all ${
                                    isActive 
                                        ? 'bg-[#7c3aed] text-white shadow-[0_4px_20px_-4px_rgba(124,58,237,0.5)]' 
                                        : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.02]'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#64748b]'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full bg-[#1e1f2e] rounded-2xl border border-white/[0.03] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] overflow-hidden min-h-[500px]">
                    {activeTab === 'profil' && (
                        <div className="p-10">
                            <div className="flex items-center gap-4 border-b border-white/[0.05] pb-8 mb-10">
                                <User className="w-6 h-6 text-[#7c3aed]" />
                                <h2 className="text-2xl font-bold text-white">Profil Administrateur</h2>
                            </div>

                            <form onSubmit={handleSave}>
                                {/* Avatar Section */}
                                <div className="flex items-center gap-6 mb-10">
                                    <AvatarUpload user={user} setUser={setUser} size="w-24 h-24" textSize="text-3xl" />
                                    <div>
                                        <h3 className="text-white font-bold text-[13px] mb-1">Avatar du profil</h3>
                                        <p className="text-[#94a3b8] text-[12px] mb-3">Cliquez sur l'image pour changer votre photo.</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#64748b] mb-2 uppercase tracking-widest">Nom complet</label>
                                        <input 
                                            type="text" 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-[13px] focus:outline-none focus:border-[#7c3aed] transition-colors shadow-inner" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#64748b] mb-2 uppercase tracking-widest">Adresse Email</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                            className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-[13px] focus:outline-none focus:border-[#7c3aed] transition-colors shadow-inner" 
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="bg-[#7c3aed] text-white font-bold text-[13px] px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#6d28d9] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_-4px_rgba(124,58,237,0.5)]"
                                    >
                                        <Save className="w-5 h-5" />
                                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    
                    {activeTab === 'securite' && (
                        <div className="p-10">
                            <div className="flex items-center gap-4 border-b border-white/[0.05] pb-8 mb-10">
                                <Shield className="w-6 h-6 text-[#8b5cf6]" />
                                <h2 className="text-xl font-bold text-white">Sécurité du Compte</h2>
                            </div>

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="space-y-6 mb-10">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#e2e8f0] mb-2">Mot de passe actuel</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-[#64748b] absolute left-4 top-1/2 -translate-y-1/2" />
                                            <input 
                                                type={showPasswords.current ? "text" : "password"} 
                                                name="current_password"
                                                value={passwordForm.current_password}
                                                onChange={handlePasswordChange}
                                                placeholder="••••••••" 
                                                required
                                                className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl pl-12 pr-12 py-3 text-white text-[13px] focus:outline-none focus:border-[#8b5cf6] transition-colors shadow-inner" 
                                            />
                                            <button type="button" onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors">
                                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#e2e8f0] mb-2">Nouveau mot de passe</label>
                                            <div className="relative">
                                                <Lock className="w-4 h-4 text-[#64748b] absolute left-4 top-1/2 -translate-y-1/2" />
                                                <input 
                                                    type={showPasswords.new ? "text" : "password"} 
                                                    name="new_password"
                                                    value={passwordForm.new_password}
                                                    onChange={handlePasswordChange}
                                                    placeholder="••••••••" 
                                                    required
                                                    minLength={8}
                                                    className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl pl-12 pr-12 py-3 text-white text-[13px] focus:outline-none focus:border-[#8b5cf6] transition-colors shadow-inner" 
                                                />
                                                <button type="button" onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors">
                                                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-[#e2e8f0] mb-2">Confirmer mot de passe</label>
                                            <div className="relative">
                                                <Lock className="w-4 h-4 text-[#64748b] absolute left-4 top-1/2 -translate-y-1/2" />
                                                <input 
                                                    type={showPasswords.confirm ? "text" : "password"} 
                                                    name="new_password_confirmation"
                                                    value={passwordForm.new_password_confirmation}
                                                    onChange={handlePasswordChange}
                                                    placeholder="••••••••" 
                                                    required
                                                    minLength={8}
                                                    className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl pl-12 pr-12 py-3 text-white text-[13px] focus:outline-none focus:border-[#8b5cf6] transition-colors shadow-inner" 
                                                />
                                                <button type="button" onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors">
                                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button type="submit" disabled={isUpdatingPassword} className="bg-[#8b5cf6] text-white font-bold text-[13px] px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#7c3aed] transition-all shadow-[0_4px_20px_-4px_rgba(139,92,246,0.5)] w-max disabled:opacity-50">
                                    <Shield className="w-4 h-4" />
                                    {isUpdatingPassword ? "Mise à jour..." : "Mettre à jour"}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'apparence' && (
                        <div className="p-10">
                            <div className="flex items-center gap-4 border-b border-white/[0.05] pb-8 mb-10">
                                <Palette className="w-6 h-6 text-[#8b5cf6]" />
                                <h2 className="text-xl font-bold text-white">Apparence</h2>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); alert("Apparence sauvegardée !"); }}>
                                <div className="space-y-8 mb-10">
                                    {/* Theme Global */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#e2e8f0] mb-4">Thème Global</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button 
                                                type="button"
                                                onClick={() => setTheme('dark')}
                                                className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border transition-all ${
                                                    theme === 'dark' 
                                                        ? 'bg-[#12131f] border-[#8b5cf6] shadow-[0_0_15px_-3px_rgba(139,92,246,0.2)]' 
                                                        : 'bg-[#12131f] border-white/[0.05] text-[#64748b] hover:border-white/10 hover:bg-white/[0.02]'
                                                }`}
                                            >
                                                <Moon className={`w-6 h-6 mb-3 ${theme === 'dark' ? 'text-[#8b5cf6]' : 'text-[#64748b]'}`} />
                                                <span className={`font-bold text-[13px] ${theme === 'dark' ? 'text-white' : 'text-[#94a3b8]'}`}>Mode Sombre</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setTheme('light')}
                                                className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border transition-all ${
                                                    theme === 'light' 
                                                        ? 'bg-[#12131f] border-[#8b5cf6] shadow-[0_0_15px_-3px_rgba(139,92,246,0.2)]' 
                                                        : 'bg-[#12131f] border-white/[0.05] text-[#64748b] hover:border-white/10 hover:bg-white/[0.02]'
                                                }`}
                                            >
                                                <Sun className={`w-6 h-6 mb-3 ${theme === 'light' ? 'text-[#8b5cf6]' : 'text-[#64748b]'}`} />
                                                <span className={`font-bold text-[13px] ${theme === 'light' ? 'text-white' : 'text-[#94a3b8]'}`}>Mode Clair</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Couleur Principale */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#e2e8f0] mb-4">Couleur Principale</label>
                                        <div className="flex items-center gap-4">
                                            {[
                                                '#8b5cf6', // Purple
                                                '#3b82f6', // Blue
                                                '#10b981', // Green
                                                '#f97316'  // Orange
                                            ].map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setPrimaryColor(color)}
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                                        primaryColor === color ? 'border-2 border-white' : 'border border-transparent hover:scale-110'
                                                    }`}
                                                    style={{ 
                                                        backgroundColor: color,
                                                        boxShadow: primaryColor === color ? `0 0 0 3px #1e1f2e, 0 0 0 5px ${color}` : 'none'
                                                    }}
                                                >
                                                    {primaryColor === color && <Check className="w-5 h-5 text-white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Aperçu */}
                                    <div className="bg-[#12131f] border border-white/[0.05] rounded-xl p-6 flex items-center justify-between shadow-inner">
                                        <div>
                                            <h4 className="text-white font-bold text-[13px]">Aperçu du bouton</h4>
                                            <p className="text-[#94a3b8] text-[12px] mt-1">Cette couleur sera utilisée partout.</p>
                                        </div>
                                        <div 
                                            className="px-6 py-2.5 rounded-xl text-white font-bold text-[13px] shadow-lg transition-colors"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            Bouton Action
                                        </div>
                                    </div>
                                </div>
                                
                                <button type="submit" className="text-white font-bold text-[13px] px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg w-max" style={{ backgroundColor: primaryColor }}>
                                    <Save className="w-4 h-4" />
                                    Sauvegarder
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'boutique' && (
                        <div className="p-10">
                            <div className="flex items-center gap-4 border-b border-white/[0.05] pb-8 mb-10">
                                <Store className="w-6 h-6 text-[#8b5cf6]" />
                                <h2 className="text-xl font-bold text-white">Paramètres de la Boutique</h2>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); alert("Paramètres de la boutique sauvegardés !"); }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#e2e8f0] mb-2">Nom de la boutique</label>
                                        <input 
                                            type="text" 
                                            value={boutiqueForm.name}
                                            onChange={(e) => setBoutiqueForm({...boutiqueForm, name: e.target.value})}
                                            className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-[13px] focus:outline-none focus:border-[#8b5cf6] transition-colors shadow-inner" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#e2e8f0] mb-2">Devise principale</label>
                                        <input 
                                            type="text" 
                                            value={boutiqueForm.currency}
                                            onChange={(e) => setBoutiqueForm({...boutiqueForm, currency: e.target.value})}
                                            className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-[13px] focus:outline-none focus:border-[#8b5cf6] transition-colors shadow-inner" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#e2e8f0] mb-2">Livraison gratuite à partir de</label>
                                        <div className="flex">
                                            <input 
                                                type="number" 
                                                value={boutiqueForm.freeShippingThreshold}
                                                onChange={(e) => setBoutiqueForm({...boutiqueForm, freeShippingThreshold: e.target.value})}
                                                className="w-full bg-[#12131f] border border-white/[0.05] rounded-l-xl px-5 py-3.5 text-white text-[13px] focus:outline-none focus:border-[#8b5cf6] transition-colors shadow-inner" 
                                            />
                                            <span className="bg-white/5 border border-l-0 border-white/[0.05] rounded-r-xl px-5 py-3.5 text-[#94a3b8] font-bold text-[13px] flex items-center">
                                                MAD
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#e2e8f0] mb-2">Email de contact public</label>
                                        <input 
                                            type="email" 
                                            value={boutiqueForm.publicEmail}
                                            onChange={(e) => setBoutiqueForm({...boutiqueForm, publicEmail: e.target.value})}
                                            className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-5 py-3.5 text-white text-[13px] focus:outline-none focus:border-[#8b5cf6] transition-colors shadow-inner" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-[#8b5cf6] text-white font-bold text-[13px] px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#7c3aed] transition-all shadow-[0_4px_20px_-4px_rgba(139,92,246,0.5)]">
                                        <Save className="w-4 h-4" />
                                        Sauvegarder
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="p-10">
                            <div className="flex items-center gap-4 border-b border-white/[0.05] pb-8 mb-10">
                                <Bell className="w-6 h-6 text-[#8b5cf6]" />
                                <h2 className="text-xl font-bold text-white">Préférences de Notification</h2>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); alert("Préférences sauvegardées !"); }}>
                                <div className="space-y-6 mb-10">
                                    {/* Nouvelle commande */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold text-[13px]">Nouvelle commande</h4>
                                            <p className="text-[#64748b] text-[12px] mt-1">Alerte email pour chaque vente</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setNotifications({...notifications, newOrder: !notifications.newOrder})}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${notifications.newOrder ? 'bg-[#8b5cf6]' : 'bg-white/10'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications.newOrder ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {/* Stock faible */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold text-[13px]">Stock faible</h4>
                                            <p className="text-[#64748b] text-[12px] mt-1">Alerte quand le stock est inférieur à 50</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setNotifications({...notifications, lowStock: !notifications.lowStock})}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${notifications.lowStock ? 'bg-[#8b5cf6]' : 'bg-white/10'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications.lowStock ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {/* Nouvel utilisateur inscrit */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold text-[13px]">Nouvel utilisateur inscrit</h4>
                                            <p className="text-[#64748b] text-[12px] mt-1">Alerte lors d'une inscription</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setNotifications({...notifications, newUser: !notifications.newUser})}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${notifications.newUser ? 'bg-[#8b5cf6]' : 'bg-[#2C3154]'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications.newUser ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    {/* Commande annulée */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold text-[13px]">Commande annulée</h4>
                                            <p className="text-[#64748b] text-[12px] mt-1">Alerte si un client annule sa commande</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setNotifications({...notifications, orderCancelled: !notifications.orderCancelled})}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${notifications.orderCancelled ? 'bg-[#8b5cf6]' : 'bg-white/10'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications.orderCancelled ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div>
                                    <button type="submit" className="bg-[#8b5cf6] text-white font-bold text-[13px] px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#7c3aed] transition-all shadow-[0_4px_20px_-4px_rgba(139,92,246,0.5)]">
                                        <Save className="w-4 h-4" />
                                        Sauvegarder les préférences
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab !== 'profil' && activeTab !== 'securite' && activeTab !== 'apparence' && activeTab !== 'boutique' && activeTab !== 'notifications' && (
                        <div className="p-12 flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                            <div className="w-16 h-16 bg-[#12131f] border border-white/[0.05] text-[#64748b] rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <SettingsIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Section en développement</h3>
                            <p className="text-[#94a3b8] text-[13px]">Cette section ({tabs.find(t => t.id === activeTab)?.label}) sera disponible prochainement.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;

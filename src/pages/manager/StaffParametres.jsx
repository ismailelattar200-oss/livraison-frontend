import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Mail, Phone, Shield, Save } from 'lucide-react';

const StaffParametres = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || 'Staff Dispatcher',
        email: user?.email || 'staff@marea.com',
        phone: user?.phone || '+34 600 000 000',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitProfile = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            alert('Profil mis à jour avec succès (Simulation)');
        }, 1000);
    };

    const handleSubmitPassword = (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            alert('Mot de passe mis à jour avec succès (Simulation)');
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        }, 1000);
    };

    return (
        <div className="w-full flex flex-col gap-6 max-w-[1000px] mx-auto">
            <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-[#6c49ff]" />
                <h2 className="text-xl font-bold text-white">Paramètres du Compte</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Form */}
                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-[#23203b] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1c1537] flex items-center justify-center">
                            <User className="w-5 h-5 text-[#6c49ff]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Informations Personnelles</h3>
                            <p className="text-xs text-gray-500">Mettez à jour vos informations de contact</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitProfile} className="p-6 flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nom Complet</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#6c49ff] transition-colors" />
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#5B41D8]/50 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#6c49ff] transition-colors" />
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#5B41D8]/50 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Téléphone</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#6c49ff] transition-colors" />
                                <input 
                                    type="text" 
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#5B41D8]/50 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#5B41D8] text-white font-bold text-sm hover:bg-[#4a34b8] transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            Sauvegarder le profil
                        </button>
                    </form>
                </div>

                {/* Security Form */}
                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl shadow-lg overflow-hidden h-fit">
                    <div className="p-6 border-b border-[#23203b] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2a1715] flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#f07c33]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Sécurité</h3>
                            <p className="text-xs text-gray-500">Modifiez votre mot de passe</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitPassword} className="p-6 flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mot de passe actuel</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#f07c33] transition-colors" />
                                <input 
                                    type="password" 
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#f07c33]/50 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nouveau mot de passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#f07c33] transition-colors" />
                                <input 
                                    type="password" 
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#f07c33]/50 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all"
                                    required
                                    minLength="6"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Confirmer le nouveau</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#f07c33] transition-colors" />
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#f07c33]/50 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all"
                                    required
                                    minLength="6"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#f07c33] text-white font-bold text-sm hover:bg-[#d66a29] transition-colors disabled:opacity-50"
                        >
                            <Lock className="w-4 h-4" />
                            Mettre à jour le mot de passe
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Quick helper to avoid importing multiple lucide icons twice
import { Settings as SettingsIcon } from 'lucide-react';

export default StaffParametres;

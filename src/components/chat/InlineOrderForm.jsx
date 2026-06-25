import { useState } from 'react';
import { Send, CheckCircle2, Loader2, CreditCard, Banknote, ShieldCheck, MapPin, Building2, ChevronDown } from 'lucide-react';
import api from '../../services/api';

// Les 12 régions officielles du Maroc et leurs principales villes
const MOROCCO_REGIONS = {
    "Tanger-Tétouan-Al Hoceïma": [
        "Tanger", "Tétouan", "Al Hoceïma", "Larache", "Chefchaouen", "Ksar El Kébir", "Asilah", "Ouezzane", "M'diq", "Fnideq"
    ],
    "l'Oriental": [
        "Oujda", "Nador", "Berkane", "Taourirt", "Guercif", "Zaïo", "Jerada", "Figuig", "Bouarfa", "Saïdia"
    ],
    "Fès-Meknès": [
        "Fès", "Meknès", "Taza", "Ifrane", "Sefrou", "Taounate", "El Hajeb", "Boulemane", "Moulay Yacoub", "Azrou"
    ],
    "Rabat-Salé-Kénitra": [
        "Rabat", "Salé", "Kénitra", "Témara", "Skhirat", "Khémisset", "Sidi Slimane", "Sidi Kacem", "Souk El Arbaa", "Belksiri"
    ],
    "Béni Mellal-Khénifra": [
        "Béni Mellal", "Khénifra", "Khouribga", "Fquih Ben Salah", "Azilal", "Kasba Tadla", "Oued Zem", "Mrirt"
    ],
    "Casablanca-Settat": [
        "Casablanca", "Mohammedia", "Settat", "El Jadida", "Berrechid", "Benslimane", "Sidi Bennour", "Médiouna", "Bouskoura", "Dar Bouazza", "Azemmour"
    ],
    "Marrakech-Safi": [
        "Marrakech", "Safi", "Essaouira", "El Kelaa des Sraghna", "Chichaoua", "Benguérir", "Youssoufia", "Tahannaout", "Aït Ourir"
    ],
    "Drâa-Tafilalet": [
        "Errachidia", "Ouarzazate", "Midelt", "Tinghir", "Zagora", "Erfoud", "Rissani", "Goulmima"
    ],
    "Souss-Massa": [
        "Agadir", "Inezgane", "Taroudant", "Tiznit", "Tata", "Chtouka-Aït Baha", "Biougra", "Aït Melloul", "Taghazout"
    ],
    "Guelmim-Oued Noun": [
        "Guelmim", "Tan-Tan", "Sidi Ifni", "Assa", "El Ouatia"
    ],
    "Laâyoune-Sakia El Hamra": [
        "Laâyoune", "Boujdour", "Tarfaya", "Es-Semara", "El Marsa"
    ],
    "Dakhla-Oued Ed-Dahab": [
        "Dakhla", "Aousserd", "El Argoub"
    ]
};

const InlineOrderForm = ({ orderData, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        region: '',
        city: '',
        postalCode: '',
        paymentMethod: 'especes'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const isDelivery = orderData?.type === 'livraison';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegionChange = (e) => {
        const newRegion = e.target.value;
        setFormData(prev => ({
            ...prev,
            region: newRegion,
            city: '' // On réinitialise la ville quand la région change
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || (isDelivery && (!formData.address || !formData.region || !formData.city))) {
            setError('Veuillez remplir tous les champs obligatoires (*).');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                customer_first_name: formData.firstName.trim(),
                customer_last_name: formData.lastName.trim(),
                customer_email: formData.email.trim(),
                customer_phone: formData.phone.trim(),
                customer_address: isDelivery ? formData.address.trim() : 'À emporter (Sur place)',
                customer_city: isDelivery ? formData.city : 'Sur place',
                customer_postal_code: isDelivery ? (formData.postalCode?.trim() || '00000') : null,
                customer_region: isDelivery ? formData.region : 'Sur place',
                type: orderData?.type || 'livraison',
                payment_method: formData.paymentMethod,
                items: orderData?.items || [],
                subtotal: orderData?.subtotal || orderData?.total || 0,
                total: orderData?.total || 0,
                notes: `Commande IA Chat • Région: ${formData.region} • Ville: ${formData.city}`
            };

            const response = await api.post('/orders', payload);
            setIsSubmitted(true);
            
            if (onSuccess) {
                const orderNum = response.data?.data?.order_number || response.data?.order_number || 'MAR-' + Math.floor(1000 + Math.random() * 9000);
                onSuccess(orderNum);
            }
        } catch (err) {
            console.error('Order submission error:', err);
            setError(err.response?.data?.message || 'Erreur lors de la validation de la commande. Veuillez vérifier vos informations.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="mt-3 rounded-2xl bg-gradient-to-br from-gold/20 to-emerald-500/20 border border-gold/40 p-5 text-center animate-fadeIn shadow-2xl">
                <CheckCircle2 className="mx-auto h-10 w-10 text-gold mb-2.5 animate-bounce" />
                <h4 className="font-display font-bold text-white text-base tracking-wide">Commande Confirmée !</h4>
                <p className="text-xs text-emerald-300 mt-1">Un email de récapitulatif vous a été transmis.</p>
            </div>
        );
    }

    return (
        <div className="mt-3 rounded-3xl bg-[#12162A] border border-gold/40 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] text-left animate-fadeIn">
            
            {/* Header Récapitulatif */}
            <div className="border-b border-white/10 pb-3.5 mb-4 flex items-center justify-between">
                <div>
                    <h4 className="font-display font-bold text-gold text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Livraison au Maroc
                    </h4>
                    <p className="text-[11px] text-white/60 mt-0.5">
                        {isDelivery ? 'Livraison dans les 12 régions du Royaume' : 'Retrait sur place'}
                    </p>
                </div>
                <span className="font-display font-bold text-white bg-gold/20 text-gold px-2.5 py-1 rounded-xl text-xs border border-gold/30">
                    {orderData?.total || 0} MAD
                </span>
            </div>

            {error && (
                <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/40 p-3 text-xs text-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                
                {/* Infos Client */}
                <div className="grid grid-cols-2 gap-2.5">
                    <div>
                        <label className="block text-white/80 mb-1 font-medium">Prénom *</label>
                        <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Ex: Youssef"
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-white/80 mb-1 font-medium">Nom *</label>
                        <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Ex: Alami"
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-white/80 mb-1 font-medium">Email *</label>
                    <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="client@email.com"
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-white/80 mb-1 font-medium">Téléphone *</label>
                    <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+212 6 00 00 00 00"
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold transition-colors"
                    />
                </div>

                {isDelivery && (
                    <div className="space-y-3 pt-2 border-t border-white/10">
                        <label className="block text-gold font-display font-bold text-xs flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gold" />
                            Région & Localité (Royaume du Maroc) :
                        </label>

                        {/* 1. Combobox Région / Wilaya */}
                        <div>
                            <label className="block text-white/80 mb-1 font-medium flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-gold" />
                                Région officielle *
                            </label>
                            <div className="relative">
                                <select
                                    name="region"
                                    required={isDelivery}
                                    value={formData.region}
                                    onChange={handleRegionChange}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2.5 text-white appearance-none focus:outline-none focus:border-gold transition-colors pr-8 cursor-pointer font-medium"
                                >
                                    <option value="" className="bg-[#0A0F1D] text-gray-400">🇲🇦 Sélectionnez votre région...</option>
                                    {Object.keys(MOROCCO_REGIONS).map(regionName => (
                                        <option key={regionName} value={regionName} className="bg-[#12162A] text-white py-1">
                                            {regionName}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gold absolute right-3 top-3 pointer-events-none" />
                            </div>
                        </div>

                        {/* 2. Combobox Ville dépendante */}
                        <div className="grid grid-cols-3 gap-2.5">
                            <div className="col-span-2">
                                <label className="block text-white/80 mb-1 font-medium">Ville *</label>
                                <div className="relative">
                                    <select
                                        name="city"
                                        required={isDelivery}
                                        disabled={!formData.region}
                                        value={formData.city}
                                        onChange={handleChange}
                                        className={`w-full bg-black/50 border rounded-xl px-3 py-2.5 text-white appearance-none focus:outline-none transition-colors pr-8 ${
                                            formData.region 
                                                ? 'border-white/20 focus:border-gold cursor-pointer font-medium' 
                                                : 'border-white/5 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <option value="" className="bg-[#0A0F1D] text-gray-400">
                                            {formData.region ? '🏙️ Choisissez la ville...' : '← Région d\'abord'}
                                        </option>
                                        {formData.region && MOROCCO_REGIONS[formData.region]?.map(cityName => (
                                            <option key={cityName} value={cityName} className="bg-[#12162A] text-white">
                                                {cityName}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gold absolute right-3 top-3 pointer-events-none" />
                                </div>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-white/80 mb-1 font-medium">Code Postal</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    placeholder="20000"
                                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold transition-colors text-center font-mono"
                                />
                            </div>
                        </div>

                        {/* Adresse exacte */}
                        <div>
                            <label className="block text-white/80 mb-1 font-medium">Adresse exacte (Rue, Résidence, Appartement...) *</label>
                            <input
                                type="text"
                                name="address"
                                required={isDelivery}
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Ex: Bd Anfa, Résidence Océan, Appt 12"
                                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-gold transition-colors"
                            />
                        </div>
                    </div>
                )}

                {/* Section Mode de Paiement */}
                <div className="pt-3 border-t border-white/10">
                    <label className="block text-white font-display font-bold text-xs mb-2.5 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-gold" />
                        Choisissez votre mode de paiement :
                    </label>
                    
                    <div className="space-y-2.5">
                        
                        {/* 1. Cash à la livraison */}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'especes' }))}
                            className={`w-full relative overflow-hidden rounded-2xl p-3.5 text-left transition-all duration-200 flex items-center justify-between shadow-lg ${
                                formData.paymentMethod === 'especes'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ring-2 ring-white scale-[1.02] shadow-emerald-500/30 font-bold'
                                    : 'bg-[#182038] hover:bg-emerald-500/20 text-gray-200 border border-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">💵</span>
                                <div>
                                    <h5 className="font-bold text-xs">Cash à la livraison</h5>
                                    <p className={`text-[10px] mt-0.5 ${formData.paymentMethod === 'especes' ? 'text-emerald-100' : 'text-gray-400'}`}>Recommandé</p>
                                </div>
                            </div>
                            {formData.paymentMethod === 'especes' && <CheckCircle2 className="w-5 h-5 text-white fill-emerald-600 shrink-0" />}
                        </button>

                        {/* 2. Carte bancaire */}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'carte' }))}
                            className={`w-full relative overflow-hidden rounded-2xl p-3.5 text-left transition-all duration-200 flex items-center justify-between shadow-lg ${
                                formData.paymentMethod === 'carte'
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white ring-2 ring-white scale-[1.02] shadow-purple-500/30 font-bold'
                                    : 'bg-[#182038] hover:bg-violet-600/20 text-gray-200 border border-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">💳</span>
                                <div>
                                    <h5 className="font-bold text-xs">Carte bancaire</h5>
                                    <p className={`text-[10px] mt-0.5 ${formData.paymentMethod === 'carte' ? 'text-purple-100' : 'text-gray-400'}`}>Visa, Mastercard</p>
                                </div>
                            </div>
                            {formData.paymentMethod === 'carte' && <CheckCircle2 className="w-5 h-5 text-white fill-purple-700 shrink-0" />}
                        </button>

                        {/* 3. PayPal */}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'paypal' }))}
                            className={`w-full relative overflow-hidden rounded-2xl p-3.5 text-left transition-all duration-200 flex items-center justify-between shadow-lg ${
                                formData.paymentMethod === 'paypal'
                                    ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white ring-2 ring-white scale-[1.02] shadow-blue-500/30 font-bold'
                                    : 'bg-[#182038] hover:bg-blue-600/20 text-gray-200 border border-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🅿️</span>
                                <div>
                                    <h5 className="font-bold text-xs">PayPal</h5>
                                    <p className={`text-[10px] mt-0.5 ${formData.paymentMethod === 'paypal' ? 'text-blue-100' : 'text-gray-400'}`}>Paiement sécurisé</p>
                                </div>
                            </div>
                            {formData.paymentMethod === 'paypal' && <CheckCircle2 className="w-5 h-5 text-white fill-blue-700 shrink-0" />}
                        </button>

                    </div>
                </div>

                {/* Bouton de confirmation */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-5 bg-gradient-to-r from-gold to-amber hover:from-gold/90 hover:to-amber/90 disabled:from-gray-700 disabled:to-gray-800 text-[#0A0F1D] font-bold py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 text-sm tracking-wide"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Transmission en cours...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Confirmer définitivement la commande
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default InlineOrderForm;

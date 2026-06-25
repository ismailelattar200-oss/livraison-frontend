import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, Clock, CheckCircle, CreditCard, Banknote, CreditCard as PaypalIcon, ShieldCheck, Check, Mail } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { moroccoData } from '../../data/moroccoData';

const Pedido = () => {
    const { cart, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successOrder, setSuccessOrder] = useState(null);

    // Initialise with separated name fields
    const [formData, setFormData] = useState({
        customer_first_name: '',
        customer_last_name: '',
        customer_phone_prefix: '+212',
        customer_phone: user?.phone || '',
        customer_email: user?.email || '',
        type: 'livraison',
        customer_country: 'Maroc',
        customer_address: '',
        customer_region: '',
        customer_city: '',
        customer_postal_code: '',
        pickup_time: '',
        payment_method: 'carte',
        notes: ''
    });

    useEffect(() => {
        if (user) {
            // Split name if possible
            const nameParts = user.name ? user.name.split(' ') : [];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            setFormData(prev => ({
                ...prev,
                customer_first_name: prev.customer_first_name || firstName,
                customer_last_name: prev.customer_last_name || lastName,
                customer_phone: prev.customer_phone || user.phone || '',
                customer_email: prev.customer_email || user.email,
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'customer_region') {
            setFormData(prev => ({ ...prev, [name]: value, customer_city: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const isStep2Valid = () => {
        if (!formData.customer_first_name || !formData.customer_last_name) return false;
        if (!formData.customer_email || !/\S+@\S+\.\S+/.test(formData.customer_email)) return false;
        if (!formData.customer_phone || !/^\d{9}$/.test(formData.customer_phone.replace(/\s/g, ''))) return false;
        
        if (formData.type === 'livraison') {
            if (!formData.customer_country || !formData.customer_address || !formData.customer_region || !formData.customer_city) return false;
            if (!formData.customer_postal_code || !/^\d{5}$/.test(formData.customer_postal_code)) return false;
        }
        return true;
    };

    const nextStep = () => {
        if (step === 1 && cart.length === 0) return;
        if (step === 1 && !user) {
            navigate('/login?redirect=/pedido&message=Connectez-vous ou créez un compte pour finaliser votre commande.');
            return;
        }
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            setError('Votre commande est vide.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const orderPayload = {
                ...formData,
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image_url: item.image_url
                })),
                subtotal: cartTotal,
                total: cartTotal,
            };

            const res = await api.createOrder(orderPayload);
            setSuccessOrder({
                ...res.data.data,
                items_snapshot: cart,
                total_snapshot: cartTotal
            });
            clearCart();
            setStep(4);
            window.scrollTo(0, 0);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Une erreur s\'est produite. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    // --- STEP RENDERS ---

    const renderStepTracker = () => (
        <div className="mb-12">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
                <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gold z-0 transition-all duration-500 rounded-full" 
                    style={{ width: `${((step - 1) / 3) * 100}%` }}
                ></div>
                
                {[1, 2, 3, 4].map(s => (
                    <div key={s} className="relative z-10 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s ? 'bg-gold text-navy-deep shadow-md' : 'bg-white border-2 border-gray-200 text-gray-500'}`}>
                            {s < step ? <CheckCircle className="w-6 h-6 text-navy-deep" /> : s}
                        </div>
                        <span className={`text-xs mt-2 font-medium uppercase tracking-widest ${step >= s ? 'text-gold' : 'text-gray-400'} hidden md:block`}>
                            {s === 1 ? 'Panier' : s === 2 ? 'Adresse' : s === 3 ? 'Paiement' : 'Confirmation'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div className="animate-fade-in">
            <h2 className="font-display text-3xl text-navy-deep mb-8 border-b border-gray-200 pb-4">1. Mon Panier</h2>
            
            {cart.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-6 text-lg">Votre panier est actuellement vide.</p>
                    <Link to="/menu" className="inline-flex bg-navy-deep text-white px-8 py-3 rounded-xl font-bold hover:bg-gold hover:text-black-rich transition-colors">
                        Découvrir le Menu
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {cart.map(item => (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm items-center border border-gray-100">
                            <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                            
                            <div className="flex-grow text-center sm:text-left w-full">
                                <h4 className="font-display text-xl text-navy-deep mb-1">{item.name}</h4>
                                <span className="text-navy-deep font-bold text-lg block mb-3 sm:mb-0">{item.price.toFixed(2)} MAD</span>
                            </div>
                            
                            <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden w-28 bg-gray-50">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 text-gray-500 hover:bg-gray-200 transition-colors">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="flex-grow text-center font-bold text-sm text-navy-deep">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 text-gray-500 hover:bg-gray-200 transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="font-bold text-xl text-navy-deep text-right min-w-[90px]">
                                    {(item.price * item.quantity).toFixed(2)} MAD
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col sm:flex-row justify-between items-center mt-8">
                        <span className="text-xl text-gray-600 mb-4 sm:mb-0">Total du panier</span>
                        <span className="text-3xl font-display text-navy-deep font-bold">{cartTotal.toFixed(2)} MAD</span>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button onClick={nextStep} className="bg-navy-deep text-white px-8 py-4 rounded-xl font-bold hover:bg-gold hover:text-black-rich transition-all shadow-md flex items-center gap-2 text-lg">
                            Étape suivante <ArrowLeft className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderOrderSummary = () => (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
            <h3 className="font-display text-2xl text-navy-deep mb-6">Résumé</h3>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 text-sm">
                        <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 relative">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute -top-2 -right-2 bg-navy-deep text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold z-10">
                                {item.quantity}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-navy-deep truncate">{item.name}</h4>
                            <p className="text-gray-500 text-xs truncate">Quantité: {item.quantity}</p>
                        </div>
                        <div className="font-bold text-navy-deep shrink-0">
                            {(item.price * item.quantity).toFixed(2)} MAD
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 font-medium">
                    <span>Sous-total</span>
                    <span>{cartTotal.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                    <span>Livraison</span>
                    {formData.type === 'livraison' ? (
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Gratuite ✓</span>
                    ) : (
                        <span>À emporter</span>
                    )}
                </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6 mt-6">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-xl text-navy-deep font-bold">Total</span>
                    <span className="text-2xl font-bold text-gold">{cartTotal.toFixed(2)} MAD</span>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-fade-in flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="font-display text-3xl text-navy-deep mb-6">Ajoutez une adresse pour commander</h2>
                    
                    {/* Trust Badges */}
                    <div className="mb-8 flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full mb-4 w-fit border border-green-100">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="font-bold text-xs">Toutes les données sont protégées</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-600 font-bold border-t border-gray-100 pt-4 w-full">
                            <div className="flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-green-500" /> Livraison gratuite
                            </div>
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-green-500" /> Paiement 100% sécurisé
                            </div>
                        </div>
                    </div>
                    
                    <form className="space-y-6">
                        {/* Delivery Type Toggle */}
                        <div className="flex gap-4 p-1 bg-gray-100 rounded-xl mb-6">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'livraison'})}
                                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                                    formData.type === 'livraison' 
                                    ? 'bg-white text-navy-deep shadow-sm' 
                                    : 'text-gray-500 hover:text-navy-deep'
                                }`}
                            >
                                Livraison
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, type: 'a_emporter'})}
                                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                                    formData.type === 'a_emporter' 
                                    ? 'bg-white text-navy-deep shadow-sm' 
                                    : 'text-gray-500 hover:text-navy-deep'
                                }`}
                            >
                                À emporter
                            </button>
                        </div>

                        {formData.type === 'livraison' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Pays / Région *</label>
                                <select required name="customer_country" value={formData.customer_country} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none appearance-none cursor-pointer">
                                    <option value="Maroc">Maroc</option>
                                </select>
                            </div>
                        )}

                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Prénom *</label>
                                <input type="text" required name="customer_first_name" value={formData.customer_first_name} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nom de famille *</label>
                                <input type="text" required name="customer_last_name" value={formData.customer_last_name} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email *</label>
                            <input type="email" required name="customer_email" value={formData.customer_email} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none" placeholder="votre@email.com" />
                        </div>

                        {/* Address Info */}
                        {formData.type === 'livraison' && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Adresse *</label>
                                    <input type="text" required name="customer_address" value={formData.customer_address} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none" placeholder="Rue, bâtiment/numéro d'appartement, quartier, etc." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Région *</label>
                                    <select required name="customer_region" value={formData.customer_region} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none appearance-none cursor-pointer">
                                        <option value="">Sélectionner une région</option>
                                        {Object.keys(moroccoData).map(region => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ville *</label>
                                        <select required name="customer_city" value={formData.customer_city} onChange={handleInputChange} disabled={!formData.customer_region} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none appearance-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed">
                                            <option value="">Sélectionner une ville</option>
                                            {formData.customer_region && moroccoData[formData.customer_region]?.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Code Postal *</label>
                                        <input type="text" required name="customer_postal_code" value={formData.customer_postal_code} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none" placeholder="Veuillez saisir un numéro à 5 chiffres" maxLength="5" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">N° de téléphone *</label>
                            <div className="flex">
                                <select name="customer_phone_prefix" value={formData.customer_phone_prefix} onChange={handleInputChange} className="bg-gray-100 border border-gray-200 rounded-l-lg px-3 py-3 text-navy-deep font-bold focus:border-gold outline-none w-28 shrink-0 appearance-none text-center">
                                    <option value="+212">MA +212 |</option>
                                </select>
                                <input type="tel" required name="customer_phone" value={formData.customer_phone} onChange={handleInputChange} className="w-full bg-white border-y border-r border-gray-200 rounded-r-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none" placeholder="Veuillez saisir un numéro à 9 chiffres" maxLength="9" />
                            </div>
                        </div>

                        {/* Pickup Time (only if a_emporter) */}
                        {formData.type === 'a_emporter' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Heure estimée de retrait (Optionnel)</label>
                                <div className="relative max-w-xs">
                                    <Clock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input type="time" name="pickup_time" value={formData.pickup_time} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-lg pl-12 pr-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none" />
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6">
                            <button 
                                type="button" 
                                onClick={nextStep} 
                                disabled={!isStep2Valid()}
                                className={`w-full py-4 rounded-full font-bold transition-all flex justify-center items-center gap-2 text-lg ${
                                    isStep2Valid() 
                                    ? 'bg-gradient-to-r from-gold to-[#A68A3D] text-navy-deep shadow-md hover:shadow-lg hover:scale-[1.02]' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Continuer vers le paiement
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div className="lg:w-1/3">
                {renderOrderSummary()}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-fade-in flex flex-col lg:flex-row gap-12">
            <div className="lg:w-2/3">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
                        <button type="button" onClick={prevStep} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-navy-deep" />
                        </button>
                        <h2 className="font-display text-3xl text-navy-deep flex items-center gap-3">
                            <CreditCard className="w-8 h-8 text-gold" />
                            Mode de paiement
                        </h2>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Carte Bancaire */}
                        <div className={`border-2 rounded-xl overflow-hidden transition-all ${formData.payment_method === 'carte' ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gold/50'}`}>
                            <label className="flex items-center justify-between p-6 cursor-pointer w-full">
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.payment_method === 'carte' ? 'border-gold' : 'border-gray-300'}`}>
                                        {formData.payment_method === 'carte' && <div className="w-3 h-3 rounded-full bg-gold"></div>}
                                    </div>
                                    <input type="radio" name="payment_method" value="carte" checked={formData.payment_method === 'carte'} onChange={handleInputChange} className="hidden" />
                                    <span className="font-bold text-navy-deep text-lg">Carte Bancaire</span>
                                </div>
                                <CreditCard className="w-6 h-6 text-navy-deep" />
                            </label>

                            {formData.payment_method === 'carte' && (
                                <div className="px-6 pb-6 pt-2 animate-fade-in space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Numéro de carte</label>
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none tracking-widest font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nom sur la carte</label>
                                        <input type="text" placeholder="JOHN DOE" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Date d'expiration</label>
                                            <input type="text" placeholder="MM/YY" className="w-full bg-[#f4f7fb] border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium focus:border-gold focus:ring-gold outline-none text-center" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">CVV</label>
                                            <input type="text" placeholder="•••" maxLength="4" className="w-full bg-[#f4f7fb] border border-gray-200 rounded-lg px-4 py-3 text-navy-deep font-medium tracking-widest text-xl focus:border-gold focus:ring-gold outline-none" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PayPal */}
                        <div className={`border-2 rounded-xl transition-all ${formData.payment_method === 'paypal' ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gold/50'}`}>
                            <label className="flex items-center justify-between p-6 cursor-pointer w-full">
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.payment_method === 'paypal' ? 'border-gold' : 'border-gray-300'}`}>
                                        {formData.payment_method === 'paypal' && <div className="w-3 h-3 rounded-full bg-gold"></div>}
                                    </div>
                                    <input type="radio" name="payment_method" value="paypal" checked={formData.payment_method === 'paypal'} onChange={handleInputChange} className="hidden" />
                                    <span className="font-bold text-navy-deep text-lg">PayPal</span>
                                </div>
                                <span className="font-bold text-[#003087] italic text-xl">PayPal</span>
                            </label>
                        </div>

                        {/* Espèces / Livraison */}
                        <div className={`border-2 rounded-xl transition-all ${formData.payment_method === 'especes' ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gold/50'}`}>
                            <label className="flex items-center justify-between p-6 cursor-pointer w-full">
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.payment_method === 'especes' ? 'border-gold' : 'border-gray-300'}`}>
                                        {formData.payment_method === 'especes' && <div className="w-3 h-3 rounded-full bg-gold"></div>}
                                    </div>
                                    <input type="radio" name="payment_method" value="especes" checked={formData.payment_method === 'especes'} onChange={handleInputChange} className="hidden" />
                                    <div>
                                        <h4 className="font-bold text-navy-deep text-lg">Paiement à la {formData.type === 'livraison' ? 'livraison' : 'réception'}</h4>
                                        <p className="text-sm text-gray-500">Payez en espèces {formData.type === 'livraison' ? 'à la réception' : 'au comptoir'}</p>
                                    </div>
                                </div>
                                <Banknote className="w-6 h-6 text-navy-deep opacity-80" />
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-start gap-3">
                            <div className="mt-1 font-bold">Erreur :</div>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="mt-10 pt-6">
                        <button 
                            type="button" 
                            onClick={handleSubmit} 
                            disabled={loading}
                            className={`w-full py-4 rounded-full font-bold transition-all shadow-md text-lg flex justify-center items-center gap-2 ${
                                loading 
                                ? 'bg-gray-400 text-white cursor-wait' 
                                : 'bg-gradient-to-r from-gold to-[#A68A3D] text-navy-deep hover:shadow-lg hover:scale-[1.02]'
                            }`}
                        >
                            {loading ? 'Traitement en cours...' : `Payer ${cartTotal.toFixed(2)} MAD`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-1/3">
                <div className="bg-cream p-8 rounded-2xl shadow-md border border-gold/20 sticky top-24">
                    <h3 className="font-display text-2xl text-navy-deep mb-6">Récapitulatif</h3>
                    
                    <div className="space-y-4 mb-6">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">{item.quantity}x {item.name}</span>
                                <span className="font-bold text-navy-deep">{(item.price * item.quantity).toFixed(2)} MAD</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="border-t border-gold/30 pt-4 space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Sous-total</span>
                            <span>{cartTotal.toFixed(2)} MAD</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Frais de {formData.type === 'livraison' ? 'livraison' : 'service'}</span>
                            <span>Gratuit</span>
                        </div>
                    </div>
                    
                    <div className="border-t border-gold/30 pt-6 mt-6">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-lg text-navy-deep font-medium">Total</span>
                            <span className="text-3xl font-display text-navy-deep font-extrabold">{cartTotal.toFixed(2)} MAD</span>
                        </div>
                        <p className="text-xs text-gray-500 text-right">Taxes incluses</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
            {/* Card 1: Success Message */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                
                <h2 className="font-display text-3xl text-navy-deep mb-2 font-bold">Commande confirmée !</h2>
                <p className="text-green-600 font-medium mb-6">Votre commande a été traitée avec succès.</p>
                
                <div className="bg-[#F5F1EB] text-navy-deep px-6 py-2 rounded-lg font-mono font-bold text-xs md:text-sm border border-[#E8E1D5]">
                    Numéro de commande: {successOrder?.order_number}
                </div>
            </div>

            {/* Card 2: Order Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-display font-bold text-navy-deep mb-4 border-b border-gray-100 pb-3">Résumé de la commande</h3>
                
                <div className="space-y-4 mb-4">
                    {(successOrder?.items_snapshot || []).map(item => (
                        <div key={item.id} className="flex items-center gap-4 text-sm">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0 relative">
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-navy-deep truncate">{item.name}</h4>
                                <p className="text-gray-500 text-xs">Qté: {item.quantity}</p>
                            </div>
                            <div className="font-bold text-navy-deep shrink-0">
                                {(item.price * item.quantity).toFixed(2)} MAD
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <span className="font-bold text-navy-deep text-lg">Total</span>
                    <span className="text-xl font-bold text-gold">{(successOrder?.total_snapshot || 0).toFixed(2)} MAD</span>
                </div>
            </div>

            {/* Card 3: Address */}
            {successOrder?.type === 'livraison' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-display font-bold text-navy-deep mb-4">Adresse de livraison</h3>
                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 leading-relaxed font-medium">
                        {successOrder?.customer_first_name} {successOrder?.customer_last_name} <br/>
                        {successOrder?.customer_address && <>{successOrder.customer_address}<br/></>}
                        {[successOrder?.customer_city, successOrder?.customer_region].filter(Boolean).join(', ')}
                        {(successOrder?.customer_city || successOrder?.customer_region) && <br/>}
                        {successOrder?.customer_postal_code ? `${successOrder.customer_postal_code} - ` : ''}Maroc
                    </div>
                </div>
            )}
            
            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-2">
                <Link to="/menu" className="w-full py-4 rounded-full font-bold transition-all shadow-md text-lg flex justify-center items-center gap-2 bg-[#B89246] text-white hover:bg-gold hover:shadow-lg">
                    Continuer vos achats &rarr;
                </Link>
                <Link to={`/seguimiento/${successOrder?.order_number}`} className="w-full py-4 rounded-full font-bold transition-all text-lg flex justify-center items-center gap-2 border-2 border-navy-deep text-navy-deep bg-white hover:bg-gray-50">
                    Voir mes commandes
                </Link>
            </div>

            {/* Footer Text */}
            <div className="text-center text-xs text-gray-500 font-medium space-y-2 mt-6">
                <div className="flex items-center justify-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    Un email de confirmation a été envoyé à {successOrder?.customer_email}
                </div>
                {successOrder?.type === 'livraison' ? (
                    <div className="flex items-center justify-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Livraison estimée : 45 - 60 minutes
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Préparation estimée : 20 - 30 minutes
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-[#fbfaf8] min-h-screen pt-32 pb-24 px-4">
            <div className="max-w-5xl mx-auto">
                {step < 4 && renderStepTracker()}
                
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>
        </div>
    );
};

export default Pedido;

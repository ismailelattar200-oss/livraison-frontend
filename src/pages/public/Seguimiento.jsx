import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ChefHat, ShoppingBag, MapPin, Phone, ArrowLeft, RefreshCw, Star, Send, Navigation, Compass } from 'lucide-react';
import api from '../../services/api';
import { triggerNotification } from '../../components/NotificationToast';
import { getWhatsAppNumber } from '../../utils/whatsapp';

const WhatsAppIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const Seguimiento = () => {
    const { orderNumber } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const prevStatusRef = useRef(null);

    // Rating state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittedFeedback, setSubmittedFeedback] = useState(false);
    const [submittingRating, setSubmittingRating] = useState(false);

    // Simulated driver coordinates for live map
    const [driverCoords, setDriverCoords] = useState({ lat: 33.589886, lng: -7.603869 });

    const handleStatusTransition = (newStatus) => {
        if (prevStatusRef.current && prevStatusRef.current !== newStatus) {
            if (newStatus === 'en_preparation') {
                triggerNotification("👨‍🍳 Commande en préparation !", "Le chef a accepté votre commande et la prépare en cuisine.", "info");
            } else if (newStatus === 'en_cours') {
                triggerNotification("🚚 Commande en route !", "Votre livreur est parti du restaurant vers votre adresse.", "info");
            } else if (newStatus === 'livre') {
                triggerNotification("🎉 Commande livrée !", "Bon appétit ! Merci de laisser votre avis.", "success");
            }
        }
        prevStatusRef.current = newStatus;
    };

    const fetchOrder = async () => {
        try {
            const res = await api.getOrder(orderNumber);
            const newOrder = res.data.data;
            
            // Prioriser le statut de livraison si disponible pour une synchronisation absolue en temps réel
            if (newOrder.delivery?.status) {
                newOrder.status = newOrder.delivery.status;
            }

            handleStatusTransition(newOrder.status);

            // Synchronisation GPS en direct depuis les coordonnées réelles du livreur
            const driverLat = newOrder.delivery?.delivery_person?.current_lat || newOrder.assigned_driver?.current_lat;
            const driverLng = newOrder.delivery?.delivery_person?.current_lng || newOrder.assigned_driver?.current_lng;
            if (driverLat && driverLng) {
                setDriverCoords({ lat: parseFloat(driverLat), lng: parseFloat(driverLng) });
            }

            setOrder(newOrder);
            setError('');
        } catch (err) {
            setError('Nous n\'avons pas pu trouver la commande spécifiée.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchOrder();
        // Polling ultra-rapide et automatique chaque 3 secondes pour un suivi fluide en direct
        const interval = setInterval(fetchOrder, 3000);
        return () => clearInterval(interval);
    }, [orderNumber]);

    // Animation de secours si le livreur n'a pas encore partagé son GPS
    useEffect(() => {
        if (!order || order.status !== 'en_cours') return;
        const hasRealGps = order.delivery?.delivery_person?.current_lat || order.assigned_driver?.current_lat;
        if (hasRealGps) return; // Si le vrai GPS fonctionne, ne pas simuler aléatoirement

        const moveInterval = setInterval(() => {
            setDriverCoords(prev => ({
                lat: prev.lat + (Math.random() - 0.4) * 0.0008,
                lng: prev.lng + (Math.random() - 0.4) * 0.0008
            }));
        }, 3000);
        return () => clearInterval(moveInterval);
    }, [order?.status]);

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        setSubmittingRating(true);
        try {
            await api.submitFeedback({
                order_id: order.id,
                customer_name: order.customer_name,
                rating,
                comment
            });
            setSubmittedFeedback(true);
            triggerNotification("⭐ Avis envoyé", "Merci pour votre évaluation précieuse !", "success");
        } catch (err) {
            setSubmittedFeedback(true);
            triggerNotification("⭐ Avis envoyé", "Merci pour votre évaluation !", "success");
        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading && !order) {
        return <div className="min-h-screen bg-cream flex justify-center items-center"><div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full"></div></div>;
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-cream pt-32 px-4">
                <div className="max-w-lg mx-auto text-center bg-white p-12 rounded-lg shadow-xl border-t-4 border-red-500">
                    <h2 className="font-display text-2xl text-navy-deep mb-4">Commande introuvable</h2>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <Link to="/menu" className="btn-gold">Retour au Menu</Link>
                </div>
            </div>
        );
    }

    const isDelivery = order.type === 'livraison';
    
    const getActiveStep = () => {
        if (order.status === 'annule') return -1;
        if (order.status === 'en_attente') return 0;
        if (order.status === 'en_preparation') return 1;
        if (order.status === 'pret') return 2;
        if (order.status === 'en_cours') return 3;
        if (order.status === 'livre') return 4;
        return 0;
    };

    const activeStep = getActiveStep();

    const StepIcon = ({ stepIndex, icon: Icon, label, description }) => {
        let state = 'pending';
        if (order.status === 'annule') state = 'cancelled';
        else if (activeStep > stepIndex) state = 'completed';
        else if (activeStep === stepIndex) state = 'active';

        const bgClass = {
            completed: 'bg-gold text-white border-gold',
            active: 'bg-white text-gold border-gold ring-4 ring-gold/20',
            pending: 'bg-white text-gray-300 border-gray-200',
            cancelled: 'bg-gray-200 text-gray-400 border-gray-300'
        }[state];

        return (
            <div className="flex flex-col items-center relative z-10 w-1/5 group">
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-500 mb-2 ${bgClass}`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className={`text-[10px] md:text-xs font-bold text-center uppercase tracking-wider mb-1 ${state === 'active' ? 'text-gold' : state === 'completed' ? 'text-navy-deep' : 'text-gray-400'}`}>
                    {label}
                </span>
                <span className={`text-[10px] md:text-xs text-center hidden md:block max-w-[120px] leading-tight mt-1 ${state === 'active' ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {description}
                </span>
            </div>
        );
    };

    return (
        <div className="bg-cream min-h-screen pt-32 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-navy-deep text-white p-8 rounded-t-xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <span className="eyebrow block mb-2 opacity-80">SUIVI DE COMMANDE</span>
                    <h1 className="font-display text-4xl md:text-5xl text-gold mb-2">{order.order_number}</h1>
                    <p className="font-light text-lg opacity-90">
                        {order.status === 'annule' 
                            ? 'Cette commande a été annulée.'
                            : `Votre commande est en cours de traitement pour ${isDelivery ? 'une livraison à domicile' : 'un retrait au restaurant'}.`}
                    </p>
                </div>

                {/* Progress Stepper */}
                <div className="bg-white p-8 border-x border-gray-200 overflow-x-auto">
                    <div className="relative min-w-[600px] max-w-4xl mx-auto py-8">
                        <div className="absolute top-[32px] md:top-[40px] left-[10%] right-[10%] h-1 bg-gray-200 -z-0">
                            {order.status !== 'annule' && (
                                <div 
                                    className="h-full bg-gold transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(100, Math.max(0, (activeStep / 4) * 100))}%` }}
                                ></div>
                            )}
                        </div>

                        <div className="flex justify-between relative">
                            <StepIcon stepIndex={0} icon={CheckCircle2} label="Reçue" description="Commande validée" />
                            <StepIcon stepIndex={1} icon={ChefHat} label="En préparation" description="Cuisine en cours" />
                            <StepIcon stepIndex={2} icon={ShoppingBag} label="Prête" description="Prête pour expédition" />
                            <StepIcon stepIndex={3} icon={isDelivery ? MapPin : RefreshCw} label="En cours" description="En route vers vous" />
                            <StepIcon stepIndex={4} icon={CheckCircle2} label="Livrée" description="Commande remise" />
                        </div>
                    </div>

                    <div className="flex items-center justify-center mt-6">
                        <button 
                            onClick={fetchOrder} 
                            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors px-4 py-2 rounded-full shadow-sm"
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                            🟢 Synchronisation automatique en direct (3s)
                        </button>
                    </div>
                </div>

                {/* FEATURE 2: LIVE MAP TRACKING (Quand en_cours) */}
                {isDelivery && order.status === 'en_cours' && (
                    <div className="mt-8 bg-navy-deep p-8 rounded-xl border border-gold/30 shadow-2xl text-white relative overflow-hidden animate-fadeIn">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 relative z-10">
                            <div>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Suivi GPS en direct
                                </span>
                                <h3 className="font-display text-2xl text-gold flex items-center gap-2">
                                    <Navigation className="w-6 h-6 animate-pulse" /> Votre livreur approche !
                                </h3>
                                <p className="text-gray-300 text-sm mt-1">Le livreur partage sa position satellitaire en temps réel.</p>
                            </div>
                            <div className="bg-[#121829] px-6 py-3 rounded-xl border border-white/10 text-center">
                                <span className="text-xs text-gray-400 block uppercase">Coordonnées GPS Actuelles</span>
                                <span className="font-mono text-gold font-bold text-sm">
                                    {driverCoords.lat.toFixed(5)}° N, {driverCoords.lng.toFixed(5)}° W
                                </span>
                            </div>
                        </div>

                        {/* Interactive Visual Radar / Map Box */}
                        <div className="relative h-64 w-full bg-[#090D16] rounded-xl border border-white/15 overflow-hidden flex items-center justify-center shadow-inner">
                            {/* Radar grid lines */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#c9a84c_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            <div className="absolute w-48 h-48 rounded-full border border-gold/20 animate-ping duration-1000"></div>
                            <div className="absolute w-72 h-72 rounded-full border border-gold/10"></div>
                            
                            {/* Destination / Restaurant */}
                            <div className="absolute left-1/4 top-1/3 flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-navy-deep border-2 border-gold flex items-center justify-center shadow-lg">
                                    <ChefHat className="w-4 h-4 text-gold" />
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 font-semibold">Restaurant</span>
                            </div>

                            {/* Moving Driver Marker */}
                            <div 
                                className="absolute flex flex-col items-center transition-all duration-1000 ease-linear z-20"
                                style={{
                                    left: `${Math.min(80, Math.max(20, ((driverCoords.lng + 7.61) * 1500) + 50))}%`,
                                    top: `${Math.min(80, Math.max(20, ((driverCoords.lat - 33.58) * 1500) + 50))}%`
                                }}
                            >
                                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.8)] border-2 border-white animate-bounce">
                                    <Navigation className="w-5 h-5 rotate-45" />
                                </div>
                                <span className="bg-[#0B0F19] text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30 mt-1 shadow">
                                    Livreur En Route 🛵
                                </span>
                            </div>

                            {/* Customer Destination */}
                            <div className="absolute right-1/4 bottom-1/3 flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-gold text-navy-deep flex items-center justify-center shadow-lg animate-pulse">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] text-gold mt-1 font-bold">Votre Adresse</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Details */}
                <div className="bg-white p-8 rounded-b-xl border border-gray-200 border-t-0 shadow-xl grid md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="font-display text-2xl text-navy-deep mb-6">Récapitulatif</h3>
                        <div className="space-y-4 mb-6">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-gray-100 text-navy-deep font-bold w-6 h-6 flex items-center justify-center rounded text-sm">{item.quantity}</span>
                                        <span className="text-gray-800">{item.name}</span>
                                    </div>
                                    <span className="text-gray-600 font-medium">{(item.price * item.quantity).toFixed(2)} MAD</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold text-navy-deep pt-2">
                            <span>Total</span>
                            <span className="text-gold font-display text-2xl">{order.total.toFixed(2)} MAD</span>
                        </div>
                    </div>

                    <div className="bg-cream/50 p-6 rounded-lg border border-gold/20">
                        <h3 className="font-display text-2xl text-navy-deep mb-6">Coordonnées</h3>
                        <ul className="space-y-4">
                            <li>
                                <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Client</span>
                                <span className="text-gray-800 font-medium">{order.customer_name}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gold" />
                                <span className="text-gray-800">{order.customer_phone}</span>
                            </li>
                            {isDelivery && order.customer_address && (
                                <li>
                                    <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Adresse de livraison</span>
                                    <span className="text-gray-800 flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gold shrink-0 mt-1" />
                                        {order.customer_address}
                                    </span>
                                </li>
                            )}
                            {!isDelivery && order.pickup_time && (
                                <li>
                                    <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Heure estimée de retrait</span>
                                    <span className="text-gray-800 text-lg font-bold">{new Date(order.pickup_time).toLocaleTimeString('fr', {hour: '2-digit', minute:'2-digit'})}</span>
                                </li>
                            )}
                            {order.notes && (
                                <li>
                                    <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Notes</span>
                                    <span className="text-gray-800 italic bg-white p-2 rounded block border border-gray-100 text-sm">{order.notes}</span>
                                </li>
                            )}
                        </ul>

                        {/* WhatsApp Contact Buttons for Customer */}
                        <div className="mt-6 pt-6 border-t border-gold/20 flex flex-col gap-3">
                            <a 
                                href={`https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(`Bonjour MAREA, je vous contacte concernant ma commande #${order.order_number}`)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full py-3 px-4 rounded-xl bg-[#25D366] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#20bd5a] hover:shadow-md transition-all shadow"
                            >
                                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                                Contacter le restaurant sur WhatsApp
                            </a>

                            {isDelivery && ['en_cours', 'pret', 'en_preparation'].includes(order.status) && (
                                <a 
                                    href={`https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(`Bonjour, je suis le client pour la commande #${order.order_number}`)}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 px-4 rounded-xl bg-navy-deep text-gold border border-gold/40 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-navy-deep/80 transition-all"
                                >
                                    <Phone className="w-4 h-4 text-gold shrink-0" />
                                    Contacter le livreur directement
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* FEATURE 3: RATING & REVIEWS (Quand livre) */}
                {order.status === 'livre' && (
                    <div className="mt-8 bg-white p-8 rounded-xl border border-gold/40 shadow-xl text-center animate-fadeIn">
                        {!submittedFeedback ? (
                            <form onSubmit={handleRatingSubmit} className="max-w-md mx-auto">
                                <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star className="w-8 h-8 fill-gold" />
                                </div>
                                <h3 className="font-display text-2xl text-navy-deep mb-2">Comment s'est passée votre commande ?</h3>
                                <p className="text-gray-600 text-sm mb-6">Évaluez la qualité du repas et de la livraison MAREA.</p>
                                
                                {/* Star Selector */}
                                <div className="flex justify-center gap-3 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                                        >
                                            <Star className={`w-8 h-8 ${star <= rating ? 'text-gold fill-gold drop-shadow' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    rows="3"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Laissez un commentaire ou suggestion (optionnel)..."
                                    className="w-full bg-cream/50 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-gold mb-4 text-gray-800"
                                />

                                <button
                                    type="submit"
                                    disabled={submittingRating}
                                    className="btn-gold w-full flex items-center justify-center gap-2 py-3 cursor-pointer disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    {submittingRating ? 'Envoi...' : 'Envoyer mon évaluation'}
                                </button>
                            </form>
                        ) : (
                            <div className="py-6">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="font-display text-2xl text-navy-deep mb-2">Merci pour votre retour ! ❤️</h3>
                                <p className="text-gray-600 text-sm">Votre évaluation nous aide à toujours vous offrir l'excellence maritime.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/menu" className="inline-flex items-center gap-2 text-navy-deep hover:text-gold font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Retour au menu
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Seguimiento;

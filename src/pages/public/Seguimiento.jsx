import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ChefHat, ShoppingBag, MapPin, Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const Seguimiento = () => {
    const { orderNumber } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrder = async () => {
        try {
            const res = await api.getOrder(orderNumber);
            setOrder(res.data.data);
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
        const interval = setInterval(fetchOrder, 30000);
        return () => clearInterval(interval);
    }, [orderNumber]);

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
                <span className={`text-[10px] md:text-xs text-center hidden md:block max-w-[120px] leading-tight ${state === 'active' ? 'text-gray-800 font-medium' : 'text-gray-400'}`} dir="rtl">
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
                            <StepIcon stepIndex={0} icon={CheckCircle2} label="Reçue" description="الطلب تسجل ومازال ما بداش" />
                            <StepIcon stepIndex={1} icon={ChefHat} label="En préparation" description="chef كيوجد الطلب" />
                            <StepIcon stepIndex={2} icon={ShoppingBag} label="Prête" description="الطلب واجد وسالي خاص غير livreur ياخدو" />
                            <StepIcon stepIndex={3} icon={isDelivery ? MapPin : RefreshCw} label="En cours" description="خرج للتوصيل" />
                            <StepIcon stepIndex={4} icon={CheckCircle2} label="Livrée" description="وصل للزبون" />
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <button onClick={fetchOrder} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy-deep transition-colors">
                            <RefreshCw className="w-4 h-4" /> Actualiser le statut
                        </button>
                    </div>
                </div>

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
                    </div>
                </div>

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

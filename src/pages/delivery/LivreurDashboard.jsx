import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, Truck, CheckCircle2, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const LivreurDashboard = () => {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDeliveries = async () => {
        try {
            const res = await api.get('/admin/deliveries/orders');
            const allOrders = res.data.data || [];
            
            const myDeliveries = allOrders.filter(o => 
                (o.assigned_to === user.id || (o.delivery && o.delivery.delivery_person_id === user.id)) &&
                ['pret', 'en_cours', 'en_preparation', 'livre', 'en_attente'].includes(o.status)
            );
            
            myDeliveries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setDeliveries(myDeliveries);
            setError(null);
        } catch (err) {
            console.error("Erreur chargement livraisons:", err);
            setError("Impossible de charger les statistiques.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, [user.id]);

    const totalCommandes = deliveries.length;
    const pret = deliveries.filter(d => (d.delivery?.status || d.status) === 'pret').length;
    const enLivraison = deliveries.filter(d => (d.delivery?.status || d.status) === 'en_cours').length;
    const livrees = deliveries.filter(d => (d.delivery?.status || d.status) === 'livre').length;

    const recentDeliveries = deliveries.slice(0, 5);

    // Calculate statuses for chart
    const pieData = [
        { name: 'Prêt', value: pret, color: '#f07c33' },
        { name: 'En cours', value: enLivraison, color: '#3b82f6' },
        { name: 'Livrées', value: livrees, color: '#4ABA7A' },
    ].filter(d => d.value > 0);

    const totalPie = pieData.reduce((acc, curr) => acc + curr.value, 0);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'en_attente': return { label: 'En attente', color: 'bg-gray-500/20 text-gray-400' };
            case 'en_preparation': return { label: 'En cuisine', color: 'bg-amber-500/20 text-amber-400' };
            case 'pret': return { label: 'À récupérer', color: 'bg-[#6d28d9]/20 text-[#a78bfa]' };
            case 'en_cours': return { label: 'En livraison', color: 'bg-blue-500/20 text-blue-400' };
            case 'livre': return { label: 'Livré', color: 'bg-[#4ABA7A]/10 text-[#4ABA7A] border border-[#4ABA7A]/20' };
            default: return { label: 'Assigné', color: 'bg-gray-500/20 text-gray-400' };
        }
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-2 border-[#6d28d9] border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm">{error}</div>}

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Total */}
                <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Commandes</span>
                        <div className="w-8 h-8 rounded-full bg-[#6d28d9]/20 flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#a78bfa]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{totalCommandes}</span>
                    <div className="text-xs text-gray-500">Toutes les commandes assignées</div>
                </div>

                {/* Card 2: Prêt */}
                <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Prêt</span>
                        <div className="w-8 h-8 rounded-full bg-[#2a1715] flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#f07c33]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{pret}</span>
                    <div className="text-xs text-gray-500">À récupérer</div>
                </div>

                {/* Card 3: En Livraison */}
                <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">En Livraison</span>
                        <div className="w-8 h-8 rounded-full bg-[#111c34] flex items-center justify-center">
                            <Truck className="w-4 h-4 text-[#3b82f6]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{enLivraison}</span>
                    <div className="text-xs text-gray-500">En cours de route</div>
                </div>

                {/* Card 4: Livrées */}
                <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Livrées</span>
                        <div className="w-8 h-8 rounded-full bg-[#4ABA7A]/10 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-[#4ABA7A]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{livrees}</span>
                    <div className="text-xs text-gray-500">Commandes réussies</div>
                </div>
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Commandes Récentes */}
                <div className="lg:col-span-2 bg-[#1A1D2E] border border-white/5 rounded-2xl shadow-lg flex flex-col min-h-[350px]">
                    <div className="p-6 flex justify-between items-center">
                        <h3 className="text-[15px] font-bold text-white">Commandes Récentes</h3>
                        <Link to="/livreur/commandes" className="flex items-center gap-1 bg-[#6d28d9]/10 hover:bg-[#6d28d9]/25 text-[#a78bfa] text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors uppercase tracking-wider border border-[#6d28d9]/20">
                            Voir Tout <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    
                    <div className="px-6 pb-2 border-b border-white/5">
                        <div className="grid grid-cols-5 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                             <div>COMMANDE</div>
                            <div>CLIENT</div>
                            <div>MONTANT</div>
                            <div>STATUT</div>
                            <div className="text-right">ACTIONS</div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {recentDeliveries.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                                Aucune commande assignée
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-white/5">
                                {recentDeliveries.map(order => {
                                    const statusInfo = getStatusInfo(order.delivery?.status || order.status);
                                    return (
                                        <div key={order.id} className="grid grid-cols-5 items-center px-6 py-4 hover:bg-white/5 transition-colors text-sm">
                                            <div className="font-semibold text-white">#{order.order_number}</div>
                                            <div className="text-gray-300">{order.customer_name}</div>
                                            <div className="text-gray-300 font-medium">{order.total} MAD</div>
                                            <div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <Link to="/livreur/commandes" className="text-[#a78bfa] hover:text-[#c4b5fd] text-xs font-bold transition-colors">
                                                    Détails
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Statut de Livraison Chart */}
                <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl shadow-lg flex flex-col min-h-[350px]">
                    <div className="p-6">
                        <h3 className="text-[15px] font-bold text-white">Statut de vos Livraisons</h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative pb-6">
                        {totalPie === 0 ? (
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                {/* Empty thick ring */}
                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="15" />
                                </svg>
                                <span className="absolute text-2xl font-bold text-white">0</span>
                            </div>
                        ) : (
                            <div className="relative w-48 h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="transparent"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-white">{totalPie}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivreurDashboard;

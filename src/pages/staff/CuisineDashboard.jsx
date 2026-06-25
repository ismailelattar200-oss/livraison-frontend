import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, ChefHat, CheckCircle2, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const CuisineDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            const allOrders = res.data.data || [];
            
            const kitchenOrders = allOrders.filter(o => 
                ['en_attente', 'en_preparation', 'pret'].includes(o.status)
            );
            
            kitchenOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            setOrders(kitchenOrders);
            setError(null);
        } catch (err) {
            console.error("Erreur chargement cuisine:", err);
            setError("Impossible de charger les statistiques.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const nouvelles = orders.filter(d => d.status === 'en_attente').length;
    const enPreparation = orders.filter(d => d.status === 'en_preparation').length;
    const pretes = orders.filter(d => d.status === 'pret').length;

    // Calcul mock du temps moyen
    const tempsMoyen = "18 min";

    const recentOrders = orders.slice(0, 5);

    const pieData = [
        { name: 'Nouvelles', value: nouvelles, color: '#3b82f6' },
        { name: 'En Préparation', value: enPreparation, color: '#f07c33' },
        { name: 'Prêtes', value: pretes, color: '#6d28d9' },
    ].filter(d => d.value > 0);

    const totalPie = pieData.reduce((acc, curr) => acc + curr.value, 0);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'en_attente': return { label: 'Nouvelle', color: 'bg-blue-500/20 text-blue-400' };
            case 'en_preparation': return { label: 'En cuisine', color: 'bg-amber-500/20 text-amber-400' };
            case 'pret': return { label: 'Prête', color: 'bg-[#6d28d9]/20 text-[#a78bfa]' };
            default: return { label: 'Inconnu', color: 'bg-gray-500/20 text-gray-400' };
        }
    };

    const getElapsedMins = (createdAt) => {
        const mins = Math.floor((new Date() - new Date(createdAt)) / 60000);
        return mins >= 0 ? mins : 0;
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-2 border-[#6d28d9] border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">
            {error && <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm">{error}</div>}

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Nouvelles */}
                <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Nouvelles Commandes</span>
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{nouvelles}</span>
                    <div className="text-xs text-gray-500">En attente de préparation</div>
                </div>

                {/* Card 2: En Préparation */}
                <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">En Préparation</span>
                        <div className="w-8 h-8 rounded-full bg-[#2a1715] flex items-center justify-center">
                            <ChefHat className="w-4 h-4 text-[#f07c33]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{enPreparation}</span>
                    <div className="text-xs text-gray-500">En cours de préparation</div>
                </div>

                {/* Card 3: Prêtes */}
                <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Prêtes Aujourd'hui</span>
                        <div className="w-8 h-8 rounded-full bg-[#6d28d9]/10 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-[#a78bfa]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{pretes}</span>
                    <div className="text-xs text-gray-500">En attente de retrait</div>
                </div>

                {/* Card 4: Temps Moyen */}
                <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Temps Moyen Préparation</span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{tempsMoyen}</span>
                    <div className="text-xs text-gray-500">Moyenne du jour</div>
                </div>
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Commandes Récentes */}
                <div className="lg:col-span-2 bg-[#1A1D2E] border border-white/5 rounded-2xl shadow-lg flex flex-col min-h-[350px]">
                    <div className="p-6 flex justify-between items-center">
                        <h3 className="text-[15px] font-bold text-white">Commandes Récentes</h3>
                        <Link to="/cuisine/commandes" className="flex items-center gap-1 bg-[#6d28d9]/10 hover:bg-[#6d28d9]/25 text-[#a78bfa] text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors uppercase tracking-wider border border-[#6d28d9]/20">
                            Voir Tout <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    
                    <div className="px-6 pb-2 border-b border-white/5">
                        <div className="grid grid-cols-4 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                             <div>COMMANDE</div>
                            <div>COMPOSITION</div>
                            <div>STATUT</div>
                            <div className="text-right">TEMPS ÉCOULÉ</div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {recentOrders.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                                Aucune commande récente
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-white/5">
                                {recentOrders.map(order => {
                                    const statusInfo = getStatusInfo(order.status);
                                    const itemsText = order.items?.map(i => i.name).join(', ') || 'N/A';
                                    
                                    return (
                                        <div key={order.id} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-white/5 transition-colors text-sm">
                                            <div className="font-semibold text-white">#{order.order_number}</div>
                                            <div className="text-gray-300 truncate pr-4" title={itemsText}>{itemsText}</div>
                                            <div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[#a78bfa] text-xs font-bold bg-[#6d28d9]/10 px-2 py-1 rounded">
                                                    {getElapsedMins(order.created_at)} min
                                                </span>
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
                        <h3 className="text-[15px] font-bold text-white">Statut Cuisine</h3>
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

export default CuisineDashboard;

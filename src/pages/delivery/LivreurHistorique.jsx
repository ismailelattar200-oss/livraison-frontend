import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Calendar, MapPin, Phone, CheckCircle2, ShoppingBag } from 'lucide-react';

const LivreurHistorique = () => {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/admin/deliveries/orders');
                const allOrders = res.data.data || [];
                
                const history = allOrders.filter(o => 
                    (o.assigned_to === user.id || (o.delivery && o.delivery.delivery_person_id === user.id)) &&
                    (o.status === 'livre' || o.delivery?.status === 'livre')
                );
                
                // Sort by descending created_at (most recent first)
                history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                
                setDeliveries(history);
            } catch (err) {
                console.error("Erreur historique:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user.id]);

    // Simple client-side filtering
    const filteredDeliveries = deliveries.filter(d => {
        const matchesSearch = d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              d.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const orderDate = new Date(d.created_at);
        const today = new Date();
        let matchesDate = true;

        if (dateFilter === 'today') {
            matchesDate = orderDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
            const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = orderDate >= lastWeek;
        } else if (dateFilter === 'month') {
            matchesDate = orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
        }

        return matchesSearch && matchesDate;
    });

    if (loading) {
        return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-10 h-10 border-4 border-[#C9A84C] border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-display font-bold text-4xl text-white">Historique</h1>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative group min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#C9A84C] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Client ou N° Commande..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1C1F3A] border border-[#2C3154] focus:border-[#C9A84C]/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all focus:ring-4 focus:ring-[#C9A84C]/10"
                        />
                    </div>
                    
                    {/* Date Filter */}
                    <div className="relative group min-w-[150px]">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#C9A84C] transition-colors pointer-events-none" />
                        <select 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full bg-[#1C1F3A] border border-[#2C3154] focus:border-[#C9A84C]/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all focus:ring-4 focus:ring-[#C9A84C]/10 appearance-none cursor-pointer"
                        >
                            <option value="all">Toutes les dates</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="week">7 derniers jours</option>
                            <option value="month">Ce mois-ci</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-[#1C1F3A] border border-white/5 rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0D0D0D] border-b border-white/5 text-xs uppercase tracking-widest text-gray-500 font-bold">
                                <th className="px-6 py-4 whitespace-nowrap">Commande</th>
                                <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                <th className="px-6 py-4 whitespace-nowrap">Client</th>
                                <th className="px-6 py-4 whitespace-nowrap">Adresse</th>
                                <th className="px-6 py-4 text-right whitespace-nowrap">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredDeliveries.map(order => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-white">#{order.order_number}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-white">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                                            <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#2C3154] flex items-center justify-center text-white font-bold text-xs">
                                                {order.customer_name?.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white">{order.customer_name}</span>
                                                <span className="text-xs text-gray-400">{order.customer_phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-400">
                                        {order.customer_address || "Non spécifiée"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#4ABA7A]/10 text-[#4ABA7A] border border-[#4ABA7A]/20">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Livré
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredDeliveries.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            Aucune livraison trouvée pour ces critères.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LivreurHistorique;

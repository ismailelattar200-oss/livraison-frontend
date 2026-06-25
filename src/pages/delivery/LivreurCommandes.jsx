import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Package, CheckCircle2, Truck, Clock } from 'lucide-react';

const LivreurCommandes = () => {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'livre'

    const fetchDeliveries = async () => {
        try {
            const res = await api.get('/admin/deliveries/orders');
            const allOrders = res.data.data || [];
            
            const myDeliveries = allOrders.filter(o => 
                (o.assigned_to === user.id || (o.delivery && o.delivery.delivery_person_id === user.id)) &&
                ['pret', 'en_cours', 'en_preparation', 'livre', 'en_attente'].includes(o.status)
            );
            
            // Sort by descending created_at
            myDeliveries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            setDeliveries(myDeliveries);
        } catch (err) {
            console.error("Erreur chargement livraisons:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
        const interval = setInterval(fetchDeliveries, 15000);
        return () => clearInterval(interval);
    }, [user.id]);

    const updateDeliveryStatus = async (deliveryId, orderId, newStatus) => {
        try {
            setDeliveries(prev => prev.map(o => {
                if (o.id === orderId) {
                    const newDelivery = o.delivery ? { ...o.delivery, status: newStatus } : { status: newStatus };
                    const orderStatus = newStatus === 'livre' ? 'livre' : o.status;
                    return { ...o, delivery: newDelivery, status: orderStatus };
                }
                return o;
            }));

            if (deliveryId) {
                await api.put(`/admin/deliveries/${deliveryId}`, { status: newStatus });
            } else {
                fetchDeliveries();
            }
        } catch (err) {
            console.error("Erreur màj statut livraison:", err);
            alert("Erreur réseau");
            fetchDeliveries();
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'en_attente': return { label: 'En attente', color: 'bg-gray-500/20 text-gray-400', icon: Clock };
            case 'en_preparation': return { label: 'En cuisine', color: 'bg-amber-500/20 text-amber-400', icon: Package };
            case 'pret': return { label: 'À récupérer', color: 'bg-[#6d28d9]/20 text-[#a78bfa]', icon: Package };
            case 'en_cours': return { label: 'En livraison', color: 'bg-blue-500/20 text-blue-400', icon: Truck };
            case 'livre': return { label: 'Livré', color: 'bg-[#4ABA7A]/10 text-[#4ABA7A] border border-[#4ABA7A]/20', icon: CheckCircle2 };
            default: return { label: 'Assigné', color: 'bg-gray-500/20 text-gray-400', icon: Clock };
        }
    };

    const getActionBtn = (order) => {
        const dStatus = order.delivery?.status || order.status;

        // Exact match for pre-delivery statuses
        if (dStatus === 'pret' || dStatus === 'assigné' || dStatus === 'en_attente' || dStatus === 'en_preparation') {
            return (
                <button 
                    onClick={() => updateDeliveryStatus(order.delivery?.id, order.id, 'en_cours')}
                    className="px-5 py-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-[#6d28d9]/20"
                >
                    Commencer la livraison
                </button>
            );
        }

        // Exact match for active delivery
        if (dStatus === 'en_cours') {
            return (
                <button 
                    onClick={() => updateDeliveryStatus(order.delivery?.id, order.id, 'livre')}
                    className="px-5 py-2 bg-[#4ABA7A] hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors"
                >
                    Marquer comme Livré
                </button>
            );
        }

        // Exact match for completed delivery
        if (dStatus === 'livre') {
            return <span className="text-sm text-green-500 font-bold inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Livraison terminée</span>;
        }

        // Fallback for unknown status
        return <span className="text-sm text-gray-500 font-medium italic">Aucune action ({dStatus})</span>;
    };

    const filteredDeliveries = deliveries.filter(d => {
        const matchesSearch = d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              d.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesStatus = true;
        const dStatus = d.delivery?.status || d.status;
        
        if (statusFilter !== 'all') {
            if (statusFilter === 'active') {
                matchesStatus = dStatus !== 'livre';
            } else {
                matchesStatus = dStatus === statusFilter;
            }
        }

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-2 border-[#6d28d9] border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="w-full flex flex-col gap-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-[#a78bfa]" />
                <h2 className="text-xl font-bold text-white">Mes Commandes</h2>
            </div>

            {/* Search & Filters Area */}
            <div className="bg-[#1A1D2E] border border-white/5 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#a78bfa] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Rechercher par ID ou Client..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0F1117] border border-white/5 focus:border-[#6d28d9]/50 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-600"
                    />
                </div>
                <div className="relative group w-full sm:w-64">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#a78bfa]" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-[#0F1117] border border-white/5 focus:border-[#6d28d9]/50 rounded-xl pl-12 pr-10 py-3 text-sm text-white outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="pret">À récupérer (Prêt)</option>
                        <option value="en_cours">En cours (En livraison)</option>
                        <option value="livre">Livré</option>
                    </select>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl shadow-lg flex flex-col min-h-[400px]">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-white/5">
                    <div className="grid grid-cols-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <div>COMMANDE</div>
                        <div>CLIENT</div>
                        <div>ADRESSE</div>
                        <div>MONTANT</div>
                        <div>STATUT</div>
                        <div className="text-right">ACTION</div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 flex flex-col">
                    {filteredDeliveries.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <Package className="w-10 h-10 text-gray-700 mb-4" />
                            <p className="text-gray-400 text-sm font-medium">Aucune commande trouvée.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-white/5">
                            {filteredDeliveries.map(order => {
                                const statusInfo = getStatusInfo(order.delivery?.status || order.status);
                                const StatusIcon = statusInfo.icon;
                                return (
                                    <div key={order.id} className="grid grid-cols-6 items-center px-6 py-5 hover:bg-white/5 transition-colors group">
                                        <div>
                                            <div className="font-semibold text-white">#{order.order_number}</div>
                                            <div className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-200">{order.customer_name}</div>
                                            <div className="text-xs text-gray-500">{order.customer_phone}</div>
                                        </div>
                                        <div className="pr-4">
                                            <div className="text-sm text-gray-400 truncate" title={order.customer_address}>{order.customer_address || "Non spécifiée"}</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">
                                                {Number(order.total || order.total_amount || 0).toFixed(2)} MAD
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            {getActionBtn(order)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LivreurCommandes;

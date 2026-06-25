import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Filter, Package, CheckCircle2, Clock, ChefHat } from 'lucide-react';

const CuisineCommandes = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            const kitchenOrders = (res.data.data || []).filter(o => 
                ['en_attente', 'en_preparation', 'pret'].includes(o.status)
            );
            kitchenOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            setOrders(kitchenOrders);
        } catch (err) {
            console.error("Erreur chargement commandes cuisine:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            await api.put(`/admin/orders/${orderId}`, { status: newStatus }); 
        } catch (err) {
            console.error("Erreur màj statut:", err);
            fetchOrders();
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'en_attente': return { label: 'Nouvelle', color: 'bg-blue-500/20 text-blue-400', icon: Clock };
            case 'en_preparation': return { label: 'En préparation', color: 'bg-amber-500/20 text-amber-500', icon: ChefHat };
            case 'pret': return { label: 'Prête', color: 'bg-[#6d28d9]/20 text-[#a78bfa]', icon: CheckCircle2 };
            default: return { label: 'Inconnu', color: 'bg-gray-500/20 text-gray-400', icon: Clock };
        }
    };

    const getActionBtn = (order) => {
        if (order.status === 'en_attente') {
            return (
                <button 
                    onClick={() => updateOrderStatus(order.id, 'en_preparation')}
                    className="px-5 py-2 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-lg text-sm font-bold transition-colors"
                >
                    Commencer
                </button>
            );
        }
        if (order.status === 'en_preparation') {
            return (
                <button 
                    onClick={() => updateOrderStatus(order.id, 'pret')}
                    className="px-5 py-2 bg-[#4ABA7A] hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors"
                >
                    Marquer Prêt
                </button>
            );
        }
        if (order.status === 'pret') {
            return (
                <span className="text-sm text-gray-500 font-bold px-4 py-2 bg-white/5 rounded-lg inline-block text-center border border-white/5">
                    En attente retrait
                </span>
            );
        }
        return <span className="text-sm text-gray-500 font-medium italic">Aucune action</span>;
    };

    const getElapsedColor = (createdAt) => {
        const diffMins = Math.floor((new Date() - new Date(createdAt)) / 60000);
        if (diffMins >= 20) return 'text-red-400';
        if (diffMins >= 15) return 'text-amber-400';
        return 'text-green-400';
    };

    const getElapsedMins = (createdAt) => {
        const mins = Math.floor((new Date() - new Date(createdAt)) / 60000);
        return mins >= 0 ? mins : 0;
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><div className="animate-spin w-8 h-8 border-2 border-[#6d28d9] border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="w-full flex flex-col gap-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-[#a78bfa]" />
                <h2 className="text-xl font-bold text-white">Gestion des Commandes</h2>
            </div>

            {/* Search & Filters Area */}
            <div className="bg-[#1A1D2E] border border-white/5 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#a78bfa] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Rechercher par ID..." 
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
                        <option value="en_attente">Nouvelles</option>
                        <option value="en_preparation">En Préparation</option>
                        <option value="pret">Prêtes</option>
                    </select>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-[#1A1D2E] border border-white/5 rounded-2xl shadow-lg flex flex-col min-h-[400px]">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-white/5">
                    <div className="grid grid-cols-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <div>COMMANDE</div>
                        <div>TYPE</div>
                        <div className="col-span-2">COMPOSITION</div>
                        <div>STATUT</div>
                        <div className="text-right">ACTION</div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="flex-1 flex flex-col">
                    {filteredOrders.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <ChefHat className="w-10 h-10 text-gray-700 mb-4" />
                            <p className="text-gray-400 text-sm font-medium">Aucune commande en cuisine.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-white/5">
                            {filteredOrders.map(order => {
                                const statusInfo = getStatusInfo(order.status);
                                const StatusIcon = statusInfo.icon;
                                const mappedItems = order.order_items?.map(i => ({ name: i.menu_item?.name || 'Item', quantity: i.quantity })) 
                                                    || order.items 
                                                    || [{ name: 'Assortiment', quantity: 1 }];

                                return (
                                    <div key={order.id} className="grid grid-cols-6 items-center px-6 py-5 hover:bg-white/5 transition-colors group">
                                        {/* COMMANDE */}
                                        <div>
                                            <div className="font-semibold text-white">#{order.order_number}</div>
                                            <div className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        
                                        {/* TYPE & TEMPS */}
                                        <div>
                                            <div className="font-semibold text-gray-200">{order.type === 'livraison' ? 'Livraison' : 'À emporter'}</div>
                                            <div className={`text-xs font-bold mt-1 flex items-center gap-1 ${getElapsedColor(order.created_at)}`}>
                                                <Clock className="w-3 h-3" />
                                                {getElapsedMins(order.created_at)} min
                                            </div>
                                        </div>

                                        {/* COMPOSITION */}
                                        <div className="col-span-2 pr-4">
                                            <div className="text-sm text-gray-300 flex flex-col gap-1">
                                                {mappedItems.map((item, idx) => (
                                                    <div key={idx} className="truncate" title={item.name}>
                                                        <span className="text-[#a78bfa] font-bold mr-1.5">{item.quantity}x</span> 
                                                        {item.name}
                                                    </div>
                                                ))}
                                            </div>
                                            {order.notes && (
                                                <div className="text-xs text-red-400 mt-1 truncate" title={order.notes}>⚠️ {order.notes}</div>
                                            )}
                                        </div>

                                        {/* STATUT */}
                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        {/* ACTION */}
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

export default CuisineCommandes;

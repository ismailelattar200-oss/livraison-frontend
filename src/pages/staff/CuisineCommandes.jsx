import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Search, Filter, Package, CheckCircle2, Clock, ChefHat, Edit, Trash2, AlertTriangle, XCircle } from 'lucide-react';
import { triggerNotification } from '../../components/NotificationToast';

const CuisineCommandes = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingOrder, setEditingOrder] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const prevWaitingCountRef = useRef(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            const kitchenOrders = (res.data.data || []).filter(o => 
                ['en_attente', 'en_preparation', 'pret'].includes(o.status)
            );
            kitchenOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            
            const currentWaiting = kitchenOrders.filter(o => o.status === 'en_attente').length;
            if (prevWaitingCountRef.current !== null && currentWaiting > prevWaitingCountRef.current) {
                triggerNotification("🔔 Nouveau Bon de Commande !", "Une nouvelle commande est en attente de préparation en cuisine.", "info");
            }
            prevWaitingCountRef.current = currentWaiting;

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

    const handleOpenEditModal = (order) => {
        setEditFormData({
            id: order.id,
            order_number: order.order_number,
            customer_name: order.customer_name || '',
            customer_phone: order.customer_phone || '',
            customer_address: order.customer_address || '',
            status: order.status || 'en_attente',
            total: order.total !== undefined ? order.total : '',
            notes: order.notes || ''
        });
        setEditingOrder(order);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setSavingEdit(true);
        try {
            if (editFormData.id) {
                await api.put(`/admin/orders/${editFormData.id}`, {
                    customer_name: editFormData.customer_name,
                    customer_phone: editFormData.customer_phone,
                    customer_address: editFormData.customer_address,
                    status: editFormData.status,
                    total: parseFloat(editFormData.total) || 0,
                    notes: editFormData.notes
                }).catch(() => {});
            }
            triggerNotification("✨ Commande Modifiée", `La commande #${editFormData.order_number} a été mise à jour.`, "success");
            setEditingOrder(null);
            fetchOrders();
        } catch (err) {
            console.error("Erreur modification:", err);
            alert("Erreur lors de la modification");
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDeleteOrder = async () => {
        if (!orderToDelete) return;
        setDeleting(true);
        try {
            if (orderToDelete.id) {
                await api.delete(`/admin/orders/${orderToDelete.id}`).catch(() => {});
            }
            triggerNotification("🗑️ Commande Supprimée", `La commande a été supprimée.`, "success");
            setOrderToDelete(null);
            fetchOrders();
        } catch (err) {
            console.error("Erreur suppression:", err);
            alert("Erreur lors de la suppression");
        } finally {
            setDeleting(false);
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
                                        <div className="flex justify-end items-center gap-2">
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200">
                                                <button 
                                                    onClick={() => handleOpenEditModal(order)}
                                                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20 shadow-sm"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setOrderToDelete(order)}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20 shadow-sm"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {getActionBtn(order)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {orderToDelete && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e1f2e] rounded-2xl shadow-2xl w-full max-w-md p-6 border border-white/[0.05] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Supprimer la commande</h3>
                        <p className="text-sm text-[#94a3b8] mb-6">
                            Voulez-vous vraiment supprimer la commande <span className="text-white font-bold font-mono">#{orderToDelete.order_number}</span> ?
                        </p>
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => setOrderToDelete(null)}
                                disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold text-sm transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleDeleteOrder}
                                disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e1f2e] rounded-2xl shadow-2xl w-full max-w-xl border border-white/[0.05] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-[#12131f]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Edit className="w-5 h-5 text-[#a78bfa]" /> Modifier <span className="text-[#a78bfa] font-mono">#{editFormData.order_number}</span>
                            </h2>
                            <button onClick={() => setEditingOrder(null)} className="text-[#64748b] hover:text-white transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1">
                            <div>
                                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">Nom du client</label>
                                <input 
                                    type="text"
                                    value={editFormData.customer_name || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, customer_name: e.target.value })}
                                    className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#a78bfa]"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">Téléphone</label>
                                    <input 
                                        type="text"
                                        value={editFormData.customer_phone || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, customer_phone: e.target.value })}
                                        className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#a78bfa]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">Total (MAD)</label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={editFormData.total || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, total: e.target.value })}
                                        className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#a78bfa]"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">Statut</label>
                                <select
                                    value={editFormData.status || 'en_attente'}
                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                    className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#a78bfa]"
                                >
                                    <option value="en_attente">Nouvelle (En attente)</option>
                                    <option value="en_preparation">En préparation</option>
                                    <option value="pret">Prête</option>
                                    <option value="en_cours">En cours (livraison)</option>
                                    <option value="livre">Livré</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">Notes / Remarques</label>
                                <textarea 
                                    rows="2"
                                    value={editFormData.notes || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                    className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#a78bfa]"
                                />
                            </div>
                            <div className="pt-4 border-t border-white/[0.05] flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingOrder(null)}
                                    className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold text-sm transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="px-6 py-2.5 rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-semibold text-sm transition-colors shadow-lg shadow-[#6d28d9]/30 flex items-center justify-center gap-2"
                                >
                                    {savingEdit ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CuisineCommandes;

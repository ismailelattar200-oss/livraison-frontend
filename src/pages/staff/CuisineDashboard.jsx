import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, ChefHat, CheckCircle2, ChevronRight, Edit, Trash2, AlertTriangle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { triggerNotification } from '../../components/NotificationToast';

const CuisineDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

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

    const nouvelles = orders.filter(d => d.status === 'en_attente').length;
    const enPreparation = orders.filter(d => d.status === 'en_preparation').length;
    const pretes = orders.filter(d => d.status === 'pret').length;

    // Calcul mock du temps moyen
    const tempsMoyen = "18 min";

    const recentOrders = orders.slice(0, 5);

    const pieData = [
        { name: 'Nouvelles', value: nouvelles, color: '#3b82f6' },
        { name: 'En Préparation', value: enPreparation, color: '#8b5cf6' },
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
                                        <div key={order.id} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-white/5 transition-colors text-sm group">
                                            <div className="font-semibold text-white">#{order.order_number}</div>
                                            <div className="text-gray-300 truncate pr-4" title={itemsText}>{itemsText}</div>
                                            <div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="flex justify-end items-center gap-2">
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200">
                                                    <button 
                                                        onClick={() => handleOpenEditModal(order)}
                                                        className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20 shadow-sm"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setOrderToDelete(order)}
                                                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20 shadow-sm"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
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

export default CuisineDashboard;

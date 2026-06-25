import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Truck, MapPin, Phone, Clock, Package, CheckCircle, RefreshCw, ChevronDown, Check
} from 'lucide-react';

// ── Status Configuration ──────────────────────────────────────────
const DELIVERY_STATUS = {
    en_attente: { label: 'En attente', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', dotColor: 'bg-gray-400', icon: Clock },
    en_cours: { label: 'En cours', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dotColor: 'bg-blue-400', icon: Truck },
    en_preparation: { label: 'En préparation', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dotColor: 'bg-amber-400', icon: Package },
    pret: { label: 'Prête', color: 'bg-[#C9A84C]/20 text-[#C9A84C] border-[#C9A84C]/30', dotColor: 'bg-[#C9A84C]', icon: CheckCircle },
    livre: { label: 'Livré', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dotColor: 'bg-emerald-400', icon: CheckCircle },
};

// ── Helper Functions ──────────────────────────────────────────────
const timeElapsedInMinutes = (dateStr) => {
    if (!dateStr) return 0;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / 60000);
};

// ── Stat Card Component ───────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, iconColor, iconBg }) => {
    // Determine glow color based on title
    const isPurple = title.includes("attente");
    const isBlue = title.includes("cours");
    const isAmber = title.includes("préparation");
    const isEmerald = title.includes("Livrées");

    let glowClass = "group-hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] group-hover:border-white/20";
    let blurColor = "bg-gray-500";
    if (isPurple) { glowClass = "group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] group-hover:border-[#8b5cf6]/50"; blurColor = "bg-[#8b5cf6]"; }
    if (isBlue) { glowClass = "group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] group-hover:border-blue-500/50"; blurColor = "bg-blue-500"; }
    if (isAmber) { glowClass = "group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] group-hover:border-amber-500/50"; blurColor = "bg-amber-500"; }
    if (isEmerald) { glowClass = "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] group-hover:border-emerald-500/50"; blurColor = "bg-emerald-500"; }

    return (
        <div className={`group relative bg-[#1e1f2e] rounded-2xl p-6 flex flex-col justify-between overflow-hidden transition-all duration-500 border border-white/5 shadow-xl shadow-black/20 ${glowClass} hover:-translate-y-1`}>
            {/* Subtle background glow */}
            <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[60px] opacity-10 transition-all duration-500 group-hover:opacity-30 ${blurColor}`}></div>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest font-sans mt-2">{title}</p>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor} shadow-inner border border-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="w-7 h-7" />
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="font-bold text-6xl text-white tracking-tighter font-display drop-shadow-md">{value}</h3>
            </div>
            
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"></div>
        </div>
    );
};

// ── Status Badge Component ────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = DELIVERY_STATUS[status] || DELIVERY_STATUS.en_attente;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${cfg.color}`}>
            <Icon className="w-4 h-4" />
            {cfg.label}
        </span>
    );
};

// ── Assignment Dropdown Component ─────────────────────────────────
const AssignDropdown = ({ orderId, deliveryPersons, onAssign, assigning }) => {
    const [selectedId, setSelectedId] = useState('');

    const handleAssign = () => {
        if (!selectedId) return;
        onAssign(orderId, selectedId);
        setSelectedId('');
    };

    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="text-base border border-white/10 rounded-xl pl-4 pr-10 py-3 bg-[#12131f] text-white focus:ring-2 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6] outline-none transition-colors w-64 appearance-none cursor-pointer"
                    disabled={assigning}
                >
                    <option value="">Choisir un livreur...</option>
                    {deliveryPersons.map(dp => (
                        <option key={dp.id} value={dp.id}>
                            {dp.name} ({dp.active_deliveries} actif{dp.active_deliveries > 1 ? 's' : ''})
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <button
                onClick={handleAssign}
                disabled={!selectedId || assigning}
                className={`px-6 py-3 rounded-xl text-base font-bold transition-all duration-300 shadow-lg ${
                    selectedId
                        ? 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white hover:shadow-[#8b5cf6]/20'
                        : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                } ${assigning ? 'opacity-50 cursor-wait' : ''}`}
            >
                {assigning ? 'Assignation...' : 'Assigner →'}
            </button>
        </div>
    );
};

// ── Main Page Component ───────────────────────────────────────────
const AdminRepartos = () => {
    const { token } = useAuth();
    
    // States
    const [orders, setOrders] = useState([]);
    const [deliveryPersons, setDeliveryPersons] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    
    // Auto-refresh logic
    const [refreshCountdown, setRefreshCountdown] = useState(15);
    const countdownRef = useRef(null);

    // Fetch Data
    const fetchData = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const [ordersRes, dpRes] = await Promise.all([
                api.get('/admin/deliveries/orders'),
                api.get('/admin/deliveries/persons')
            ]);
            
            const formattedOrders = ordersRes.data.data || [];
            
            setOrders(formattedOrders);
            setDeliveryPersons(dpRes.data.data || []);
            
        } catch (error) {
            console.error("Erreur chargement données:", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    // Init & Refresh Interval
    useEffect(() => {
        fetchData(true);
    }, [fetchData]);

    useEffect(() => {
        countdownRef.current = setInterval(() => {
            setRefreshCountdown(prev => {
                if (prev <= 1) {
                    fetchData(false);
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(countdownRef.current);
    }, [fetchData]);

    const manualRefresh = () => {
        setRefreshCountdown(15);
        fetchData(true);
    };

    // Actions
    const handleAssignLivreur = async (orderId, livreurId) => {
        setAssigningId(orderId);
        try {
            await api.put(`/admin/deliveries/${orderId}/assign`, { delivery_person_id: livreurId });
            await fetchData(false);
        } catch (error) {
            console.error("Erreur assignation:", error);
            alert("Erreur lors de l'assignation.");
        } finally {
            setAssigningId(null);
        }
    };

    const handleUpdateStatus = async (orderId, deliveryId, newStatus) => {
        setUpdatingStatusId(orderId);
        try {
            await api.put(`/admin/deliveries/${deliveryId}`, { status: newStatus });
            await fetchData(false);
        } catch (error) {
            console.error("Erreur mise à jour statut:", error);
            alert("Erreur lors de la mise à jour.");
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // Derived Data
    // An order is "en attente d'assignation" if it has no driver assigned
    const enAttenteOrders = orders.filter(o => !o.assigned_to);
    
    // An active delivery is one that has a driver assigned, but is not yet delivered
    const activeOrders = orders.filter(o => o.assigned_to && o.delivery?.status !== 'livre');
    
    const counts = {
        en_attente: enAttenteOrders.length,
        en_cours: orders.filter(o => o.delivery?.status === 'en_cours').length,
        en_preparation: orders.filter(o => o.status === 'en_preparation').length,
        livre: orders.filter(o => o.delivery?.status === 'livre').length,
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-12">
            


            {/* ── SECTION 1: STAT CARDS ────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="En attente" 
                    value={counts.en_attente} 
                    icon={Clock} 
                    iconColor="text-gray-400" 
                    iconBg="bg-gray-400/10" 
                />
                <StatCard 
                    title="En cours" 
                    value={counts.en_cours} 
                    icon={Truck} 
                    iconColor="text-blue-400" 
                    iconBg="bg-blue-400/10" 
                />
                <StatCard 
                    title="En préparation" 
                    value={counts.en_preparation} 
                    icon={Package} 
                    iconColor="text-amber-400" 
                    iconBg="bg-amber-400/10" 
                />
                <StatCard 
                    title="Livrées aujourd'hui" 
                    value={counts.livre} 
                    icon={CheckCircle} 
                    iconColor="text-emerald-400" 
                    iconBg="bg-emerald-400/10" 
                />
            </div>

            {/* ── SECTION 2: COMMANDES EN ATTENTE (Priority) ───── */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                        <span className="text-[#8b5cf6] text-xl font-bold">⚡</span>
                    </div>
                    <h2 className="text-2xl font-bold font-sans text-white">
                        Commandes en attente d'assignation 
                        {counts.en_attente > 0 && <span className="ml-3 px-3 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-full text-lg">{counts.en_attente}</span>}
                    </h2>
                </div>

                <div className="bg-[#1e1f2e] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#12131f]/80 border-b border-white/5">
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest whitespace-nowrap">N° Commande</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">Client</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[20%]">Adresse</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[25%]">Articles</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest whitespace-nowrap">Temps</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">Livreur</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest text-right w-[10%]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && enAttenteOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-12 text-center">
                                        <div className="flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-[#8b5cf6] border-t-transparent rounded-full"></div></div>
                                    </td>
                                </tr>
                            ) : enAttenteOrders.map(order => {
                                    const elapsed = timeElapsedInMinutes(order.created_at);
                                    const isUrgent = elapsed > 20;
                                    const isWarning = elapsed >= 10 && elapsed <= 20;
                                    
                                    let timeColor = 'text-emerald-400';
                                    if (isUrgent) timeColor = 'text-red-500 font-bold';
                                    else if (isWarning) timeColor = 'text-amber-400';

                                    // Construct a short item summary
                                    const itemsSummary = order.order_items && order.order_items.length > 0
                                        ? order.order_items.map(item => `${item.quantity}x ${item.menu_item?.name}`).join(', ')
                                        : order.items && order.items.length > 0
                                            ? order.items.map(item => `${item.quantity}x ${item.name || 'Article'}`).join(', ')
                                            : 'Détails non disponibles';

                                    return (
                                        <tr 
                                            key={order.id} 
                                            className={`hover:bg-white/[0.02] border-b border-white/[0.04] transition-all duration-500 ${
                                                assigningId === order.id ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
                                            }`}
                                        >
                                            <td className="px-3 py-4 align-middle whitespace-nowrap">
                                                <span className="text-[13px] font-bold text-[#8b5cf6] font-sans">{order.order_number}</span>
                                            </td>
                                            <td className="px-3 py-4 align-middle whitespace-nowrap">
                                                <p className="text-[13px] font-bold text-white mb-1">{order.customer_name}</p>
                                                <a href={`tel:${order.customer_phone}`} className="text-[11px] text-[#94a3b8] hover:text-white flex items-center gap-1.5 transition-colors">
                                                    <Phone className="w-3 h-3" />
                                                    {order.customer_phone}
                                                </a>
                                            </td>
                                            <td className="px-3 py-4 align-middle max-w-[150px]">
                                                <div className="flex items-start gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-[#64748b] shrink-0 mt-0.5" />
                                                    <span className="text-[12px] text-[#94a3b8] truncate block" title={order.customer_address || 'Adresse non spécifiée'}>
                                                        {order.customer_address || 'Adresse non spécifiée'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 align-middle max-w-[150px]">
                                                <p className="text-[12px] text-[#94a3b8] truncate block" title={itemsSummary}>
                                                    {itemsSummary}
                                                </p>
                                            </td>
                                            <td className="px-3 py-4 align-middle whitespace-nowrap">
                                                <span className={`text-[13px] font-bold ${timeColor} flex items-center gap-1.5`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {elapsed} min
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 align-middle">
                                                <select 
                                                    id={`livreur-select-${order.id}`}
                                                    className="bg-[#12131f] text-white border border-white/10 rounded-lg px-2 py-1.5 text-[12px] appearance-none focus:outline-none focus:border-[#8b5cf6] w-full min-w-[100px] cursor-pointer"
                                                    defaultValue=""
                                                >
                                                    <option value="">Choisir...</option>
                                                    {deliveryPersons.map(dp => (
                                                        <option key={dp.id} value={dp.id}>
                                                            {dp.name} ({dp.active_deliveries})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-4 align-middle text-right">
                                                <button 
                                                    onClick={() => {
                                                        const select = document.getElementById(`livreur-select-${order.id}`);
                                                        if (select && select.value) {
                                                            handleAssignLivreur(order.id, select.value);
                                                        } else {
                                                            alert("Veuillez choisir un livreur.");
                                                        }
                                                    }}
                                                    disabled={assigningId === order.id}
                                                    className="bg-[#8b5cf6] text-white px-3 py-1.5 rounded-lg text-[12px] font-bold hover:bg-[#7c3aed] transition-colors whitespace-nowrap disabled:opacity-50"
                                                >
                                                    {assigningId === order.id ? '...' : 'Assigner'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
            </div>

            {/* ── SECTION 3: LIVRAISONS EN COURS ───────────────── */}
            <div className="space-y-6 pt-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold font-sans text-white">Livraisons en cours ({activeOrders.length})</h2>
                </div>

                <div className="bg-[#1e1f2e] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#12131f]/80 border-b border-white/5">
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest whitespace-nowrap">N° Commande</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[20%]">Client</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[20%]">Livreur</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">Statut</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest whitespace-nowrap">Temps écoulé</th>
                                <th className="px-3 py-4 text-[10px] font-bold text-[#64748b] uppercase tracking-widest text-right w-[15%]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && activeOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center">
                                        <div className="flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
                                    </td>
                                </tr>
                            ) : activeOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8">
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center">
                                            <span className="text-blue-500 text-2xl font-bold">✓ Aucune livraison en cours</span>
                                            <p className="text-blue-400/70 text-base">Toutes les commandes assignées ont été traitées.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : activeOrders.map(order => {
                                    const elapsed = timeElapsedInMinutes(order.created_at);
                                    return (
                                    <tr key={order.id} className="hover:bg-white/[0.02] border-b border-white/[0.04] transition-colors group">
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <span className="text-[13px] font-bold text-[#8b5cf6] font-sans">{order.order_number}</span>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <p className="text-[13px] font-bold text-white">{order.customer_name}</p>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-[#12131f] flex items-center justify-center text-[12px] font-bold text-white shadow-sm border border-white/10">
                                                    {order.assigned_driver?.name?.charAt(0) || '?'}
                                                </div>
                                                <span className="text-[13px] font-bold text-gray-300">{order.assigned_driver?.name || 'Inconnu'}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <StatusBadge status={order.delivery?.status || order.status} />
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <span className="text-[13px] font-bold text-[#94a3b8] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {elapsed} min</span>
                                        </td>
                                        <td className="px-3 py-4 text-right whitespace-nowrap">
                                            {order.delivery?.status === 'en_cours' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(order.id, order.delivery?.id, 'en_preparation')}
                                                    disabled={updatingStatusId === order.id}
                                                    className="bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg text-[12px] font-bold hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-50"
                                                >
                                                    {updatingStatusId === order.id ? '...' : 'Préparation'}
                                                </button>
                                            )}
                                            {order.delivery?.status === 'en_preparation' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(order.id, order.delivery?.id, 'livre')}
                                                    disabled={updatingStatusId === order.id}
                                                    className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg text-[12px] font-bold hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50"
                                                >
                                                    {updatingStatusId === order.id ? '...' : 'Livré'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
            </div>

        </div>
    );
};

export default AdminRepartos;

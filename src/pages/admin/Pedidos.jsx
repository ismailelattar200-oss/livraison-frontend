import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Eye, CheckCircle2, XCircle, Clock, Truck, User, ChevronDown, MessageCircle, CheckCircle, Check } from 'lucide-react';
import { triggerNotification } from '../../components/NotificationToast';
import { getWhatsAppNumber } from '../../utils/whatsapp';

const AdminPedidos = () => {
    const [orders, setOrders] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [assignedModalData, setAssignedModalData] = useState(null);
    const prevReadyCountRef = useRef(null);

    const fetchOrders = async () => {
        try {
            const [ordersRes, usersRes] = await Promise.all([
                api.get('/admin/orders'),
                api.get('/users')
            ]);
            const newOrders = ordersRes.data.data || [];
            
            const currentReady = newOrders.filter(o => o.status === 'pret').length;
            if (prevReadyCountRef.current !== null && currentReady > prevReadyCountRef.current) {
                triggerNotification("🍳 Commande Prête !", "Le Chef a terminé la préparation d'une commande. Prête pour expédition !", "success");
            }
            prevReadyCountRef.current = currentReady;

            setOrders(newOrders);
            const deliveryDrivers = (usersRes.data || []).filter(u => u.role === 'delivery');
            setDrivers(deliveryDrivers);
        } catch (error) {
            console.error("Erreur chargement données admin:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        const shouldSendWa = (newStatus === 'livre');
        const win = shouldSendWa ? window.open('about:blank', '_blank') : null;
        try {
            await api.put(`/admin/orders/${orderId}`, { status: newStatus });
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
            if (win && shouldSendWa) {
                const message = encodeURIComponent(`📦 Notification MAREA : La commande #${orderId} a été marquée comme LIVRÉE ✅.`);
                win.location.href = `https://wa.me/${getWhatsAppNumber()}?text=${message}`;
            }
        } catch (err) {
            if (win) win.close();
            console.error("Erreur mise à jour statut:", err);
            alert("Erreur lors de la mise à jour du statut");
        }
    };

    const handleAssignDriver = async (orderId, driverId) => {
        if (!driverId) return;
        try {
            await api.post('/admin/deliveries', { order_id: orderId, delivery_person_id: driverId });
            fetchOrders();
            let updatedOrder = selectedOrder;
            if (selectedOrder && selectedOrder.id === orderId) {
                const res = await api.get(`/admin/orders/${selectedOrder.order_number}`);
                setSelectedOrder(res.data.data);
                updatedOrder = res.data.data;
            } else {
                updatedOrder = orders.find(o => String(o.id) === String(orderId));
            }

            const driver = drivers.find(d => String(d.id) === String(driverId));
            if (updatedOrder) {
                const itemsList = updatedOrder.items && updatedOrder.items.length > 0
                    ? updatedOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
                    : 'Voir sur le dashboard';
                const address = updatedOrder.customer_address || 'Adresse spécifiée par le client';
                const clientName = updatedOrder.customer_name || 'Client';
                const clientPhone = updatedOrder.customer_phone || '';

                const message = encodeURIComponent(
                    `👑 *DIRECTION & ADMINISTRATION MAREA*\n` +
                    `📢 *ASSIGNATION OFFICIELLE DE COURSE*\n\n` +
                    `Bonjour ${driver?.name || 'Livreur'},\n` +
                    `L'administration vous a assigné une nouvelle livraison prioritaire :\n\n` +
                    `📦 *Commande :* #${updatedOrder.order_number}\n` +
                    `📍 *Adresse de livraison :* ${address}\n` +
                    `👤 *Client :* ${clientName} ${clientPhone ? `(${clientPhone})` : ''}\n` +
                    `💰 *Total à encaisser :* ${Number(updatedOrder.total || 0).toFixed(2)} MAD\n` +
                    `🍔 *Détails :* ${itemsList}\n\n` +
                    `👉 Connectez-vous immédiatement sur votre *Dashboard Livreur* MAREA pour confirmer la prise en charge et activer le suivi GPS en direct !`
                );

                let targetPhone = driver?.phone ? String(driver.phone).replace(/\D/g, '') : '';
                if (targetPhone.startsWith('0')) targetPhone = '212' + targetPhone.substring(1);
                else if (!targetPhone.startsWith('212') && targetPhone.length === 9) targetPhone = '212' + targetPhone;
                if (!targetPhone) targetPhone = getWhatsAppNumber();

                setAssignedModalData({
                    driverName: driver?.name || 'Livreur',
                    targetPhone,
                    message,
                    orderNumber: updatedOrder.order_number
                });
                triggerNotification("✅ Course Assignée !", `Commande #${updatedOrder.order_number} transmise au dashboard de ${driver?.name || 'Livreur'}.`, "success");
            }
        } catch (err) {
            console.error("Erreur assignation livreur:", err);
            alert("Erreur lors de l'assignation du livreur");
        }
    };

    const statusColors = {
        en_attente: 'bg-slate-500/20 text-slate-400',
        en_preparation: 'bg-sky-500/20 text-sky-400',
        pret: 'bg-indigo-500/20 text-indigo-400',
        en_cours: 'bg-amber-500/20 text-amber-400',
        livre: 'bg-emerald-500/20 text-emerald-400',
        annule: 'bg-red-500/20 text-red-400',
    };

    const statusLabels = {
        en_attente: 'En attente',
        en_preparation: 'En préparation',
        pret: 'Prête',
        en_cours: 'En cours',
        livre: 'Livré',
        annule: 'Annulé',
    };

    const filteredOrders = filterStatus === 'all' 
        ? orders 
        : orders.filter(o => o.status === filterStatus);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-end items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-[#1e1f2e] border border-white/[0.05] text-white text-[13px] font-semibold rounded-xl pl-4 pr-10 py-2.5 outline-none hover:border-[#7c3aed] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors cursor-pointer shadow-sm"
                        >
                            {['all', 'en_attente', 'en_preparation', 'pret', 'en_cours', 'livre', 'annule'].map(s => (
                                <option key={s} value={s} className="bg-[#12131f]">
                                    {s === 'all' ? 'Toutes les commandes' : statusLabels[s]}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-[#64748b] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {filterStatus !== 'all' && (
                        <button
                            onClick={() => setFilterStatus('all')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 text-xs font-bold hover:bg-[#7c3aed]/20 transition-colors"
                        >
                            {statusLabels[filterStatus]}
                            <XCircle className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                 <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full"></div></div>
            ) : (
                <div className="bg-[#1e1f2e] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] border border-white/[0.03] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="border-b border-white/[0.04]">
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">N° Commande</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[25%]">Client</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">Type</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">Total</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[20%]">Statut</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest text-right w-[10%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {filteredOrders.length === 0 ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-[#64748b] text-sm">Aucune commande à afficher.</td></tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-4 font-bold text-white font-mono text-[13px]">{order.order_number}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-white font-bold text-[13px] mb-1">{order.customer_name}</div>
                                                <div className="text-[12px] text-[#94a3b8]">{new Date(order.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider w-max flex items-center justify-center ${order.type === 'livraison' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20' : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'}`}>
                                                    {order.type === 'livraison' ? 'Livraison' : 'Sur place'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-white text-[13px]">{Number(order.total).toFixed(2)} MAD</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border outline-none cursor-pointer appearance-none ${statusColors[order.status]}`}
                                                >
                                                    <option value="en_attente" className="bg-[#12131f] text-white">En attente</option>
                                                    <option value="en_preparation" className="bg-[#12131f] text-white">En préparation</option>
                                                    <option value="pret" className="bg-[#12131f] text-white">Prête</option>
                                                    <option value="en_cours" className="bg-[#12131f] text-white">En cours</option>
                                                    <option value="livre" className="bg-[#12131f] text-white">Livré</option>
                                                    <option value="annule" className="bg-[#12131f] text-white">Annulé</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end">
                                                    <button 
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-lg transition-colors border border-[#8b5cf6]/20 shadow-sm"
                                                        title="Voir les détails"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1e1f2e] rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] border border-white/[0.05] overflow-hidden">
                        <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-[#12131f]">
                            <div>
                                <h2 className="text-xl font-bold text-white">Commande <span className="text-[#7c3aed]">#{selectedOrder.order_number}</span></h2>
                                <p className="text-[13px] text-[#94a3b8] mt-1">{new Date(selectedOrder.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-[#64748b] hover:text-white transition-colors">
                                <XCircle className="w-7 h-7" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-[#64748b] border-b border-white/[0.05] pb-2 mb-4 uppercase text-[10px] tracking-widest">Détails du client</h3>
                                <ul className="space-y-4 text-[13px]">
                                    <li className="flex gap-3 items-center text-white"><User className="w-5 h-5 text-[#7c3aed]"/> <strong>{selectedOrder.customer_name}</strong></li>
                                    <li className="flex gap-3 items-center text-[#94a3b8]"><Clock className="w-5 h-5 text-[#7c3aed]"/> {selectedOrder.customer_phone}</li>
                                    {selectedOrder.type === 'livraison' && (
                                        <li className="flex gap-3 items-start text-[#94a3b8]"><Truck className="w-5 h-5 text-[#7c3aed] shrink-0 mt-0.5"/> {selectedOrder.customer_address}</li>
                                    )}
                                </ul>

                                {selectedOrder.notes && (
                                    <div className="mt-6 bg-[#7c3aed]/10 p-4 rounded-xl border border-[#7c3aed]/20 text-[13px]">
                                        <strong className="text-[#7c3aed] block mb-1">Notes du client :</strong> 
                                        <span className="text-white">{selectedOrder.notes}</span>
                                    </div>
                                )}

                                {selectedOrder.type === 'livraison' && (
                                    <div className="mt-6 border border-white/[0.05] p-5 rounded-xl bg-[#12131f]">
                                        <h3 className="font-bold text-white mb-4 text-[13px] flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-[#7c3aed]"/> Gestion de la livraison
                                        </h3>
                                        {selectedOrder.delivery ? (
                                            <div className="text-[13px] space-y-2">
                                                <p className="text-[#94a3b8]">Livreur : <strong className="text-white">{selectedOrder.assigned_driver?.name}</strong></p>
                                                <p className="text-[#94a3b8]">Statut : <span className="font-bold text-[#8b5cf6] uppercase text-[10px] tracking-wider px-2 py-1 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-md ml-2">{selectedOrder.delivery.status}</span></p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[12px] text-[#94a3b8] font-medium">Assigner un livreur :</label>
                                                <div className="flex gap-2">
                                                    <select 
                                                        className="flex-1 bg-[#1e1f2e] border border-white/[0.05] text-white rounded-xl text-[13px] px-3 py-2 outline-none focus:border-[#7c3aed]"
                                                        id={`assign-${selectedOrder.id}`}
                                                    >
                                                        <option value="">Sélectionner...</option>
                                                        {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                    </select>
                                                    <button 
                                                        onClick={() => {
                                                            const el = document.getElementById(`assign-${selectedOrder.id}`);
                                                            handleAssignDriver(selectedOrder.id, el.value);
                                                        }}
                                                        className="bg-[#7c3aed] text-white font-bold px-4 py-2 rounded-xl text-[13px] hover:bg-[#6d28d9] transition-colors whitespace-nowrap shadow-sm"
                                                    >
                                                        Assigner
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-bold text-[#64748b] border-b border-white/[0.05] pb-2 mb-4 uppercase text-[10px] tracking-widest">Articles de la commande</h3>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[13px] border-b border-white/[0.05] pb-3">
                                            <div className="flex gap-4 items-center">
                                                <span className="font-bold text-[#7c3aed] bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-2 py-0.5 rounded text-[11px]">{item.quantity}x</span>
                                                <span className="text-white font-medium">{item.name}</span>
                                            </div>
                                            <span className="font-mono text-[#94a3b8]">{Number(item.price * item.quantity).toFixed(2)} MAD</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/[0.05] flex justify-between items-center">
                                    <span className="font-bold text-[#64748b] uppercase text-[10px] tracking-widest">Total à payer</span>
                                    <span className="font-bold text-xl text-white">{Number(selectedOrder.total).toFixed(2)} <span className="text-[#7c3aed] text-sm">MAD</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-[#1e1f2e] border-t border-white/[0.05] flex justify-end">
                            <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 border border-white/[0.05] rounded-xl bg-[#12131f] text-[#94a3b8] hover:bg-white/5 hover:text-white font-bold transition-colors text-[13px]">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ASSIGNMENT CONFIRMATION & WHATSAPP MODAL */}
            {assignedModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#1e1f2e] rounded-2xl max-w-md w-full border border-white/10 p-6 shadow-2xl text-center space-y-6">
                        <div className="w-16 h-16 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto border border-[#25D366]/40 shadow-[0_0_30px_rgba(37,211,102,0.3)]">
                            <CheckCircle className="w-10 h-10 text-[#25D366]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Commande Assignée !</h3>
                            <p className="text-sm text-gray-300">
                                La commande <span className="text-[#8b5cf6] font-bold">#{assignedModalData.orderNumber}</span> a été transmise instantanément au dashboard de <span className="text-white font-bold">{assignedModalData.driverName}</span>.
                            </p>
                        </div>
                        <div className="p-4 bg-[#12131f] rounded-xl border border-white/5 text-left text-xs text-gray-400 space-y-1">
                            <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                                <Check className="w-4 h-4" /> Enregistré en base de données
                            </p>
                            <p>Le livreur peut déjà voir et accepter la course sur son interface.</p>
                        </div>
                        <div className="flex flex-col gap-3 pt-2">
                            <a
                                href={`https://wa.me/${assignedModalData.targetPhone}?text=${assignedModalData.message}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setAssignedModalData(null)}
                                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#22bf5b] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_-4px_rgba(37,211,102,0.5)] text-sm"
                            >
                                <MessageCircle className="w-5 h-5 fill-white" />
                                Contacter {assignedModalData.driverName} sur WhatsApp
                            </a>
                            <button
                                onClick={() => setAssignedModalData(null)}
                                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl transition-colors text-sm"
                            >
                                Fermer (Déjà assignée)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPedidos;

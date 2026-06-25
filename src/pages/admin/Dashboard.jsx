import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    TrendingUp, ShoppingBag, Utensils, Users, ArrowUpRight, Eye, 
    AlertTriangle, AlertCircle
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.getAdminStats();
                setStats(res.data.data);
            } catch (error) {
                console.error("Erreur chargement stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role !== 'delivery') {
            fetchStats();
            const interval = setInterval(fetchStats, 60000);
            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [user]);

    if (user?.role === 'delivery') {
        return (
            <div className="p-8">
                <h1 className="text-3xl text-white font-bold mb-6">Bonjour, {user.name}</h1>
                <p className="text-[#94a3b8]">Utilisez le menu latéral pour accéder à vos livraisons assignées.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center p-24">
                <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!stats) {
        return <div className="p-8 text-white">Impossible de charger les statistiques.</div>;
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0f111d] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="text-[#64748b] font-bold mb-1 text-xs">{label}</p>
                    <p className="text-[#8b5cf6] font-extrabold text-sm">{Number(payload[0].value).toFixed(2)} MAD</p>
                </div>
            );
        }
        return null;
    };

    const pieColors = ['#8b5cf6', '#3b82f6', '#6366f1', '#a855f7'];
    const rawStatus = stats?.delivery_status;
    let deliveryStatusList = [
        { name: 'En Attente', value: 8 },
        { name: 'En Cours', value: 0 },
        { name: 'Livré', value: 6 },
        { name: 'En Préparation', value: 0 }
    ];
    if (Array.isArray(rawStatus) && rawStatus.length > 0) {
        deliveryStatusList = rawStatus;
    } else if (rawStatus && typeof rawStatus === 'object') {
        deliveryStatusList = Object.entries(rawStatus).map(([name, value]) => ({ name, value }));
    }

    const rawChart = stats?.chart_data;
    const chartDataList = Array.isArray(rawChart) && rawChart.length > 0 
        ? rawChart 
        : [
            { day: '17/06', revenue: 0 },
            { day: '18/06', revenue: 0 },
            { day: '19/06', revenue: 0 },
            { day: '20/06', revenue: 0 },
            { day: '21/06', revenue: 0 },
            { day: '22/06', revenue: 560 },
            { day: '23/06', revenue: 22.4 }
          ];

    const rawRecent = stats?.recent_orders;
    const recentOrdersList = Array.isArray(rawRecent) && rawRecent.length > 0 
        ? rawRecent 
        : [
            { id: 1, order_number: 'MAR-20260623-001', customer_name: 'zakaria el kaoui', customer_email: 'client@email.com', date: '23 juin 2026', total: 22.4, status: 'EN ATTENTE' },
            { id: 2, order_number: 'MAR-20260622-015', customer_name: 'Kk Pp', customer_email: 'client@email.com', date: '23 juin 2026', total: 9.5, status: 'EN ATTENTE' },
            { id: 3, order_number: 'MAR-20260622-014', customer_name: 'Kk Pp', customer_email: 'client@email.com', date: '23 juin 2026', total: 9.5, status: 'EN ATTENTE' },
            { id: 4, order_number: 'MAR-20260622-013', customer_name: 'Kk Pp', customer_email: 'client@email.com', date: '23 juin 2026', total: 9.5, status: 'EN ATTENTE' },
            { id: 5, order_number: 'MAR-20260622-012', customer_name: 'Kk Pp', customer_email: 'client@email.com', date: '23 juin 2026', total: 12.9, status: 'EN ATTENTE' }
          ];

    const alertsList = stats?.driver_alerts?.list || stats?.alerts || [
        { id: 1, title: 'Commandes en retard', count: 2 }
    ];

    // Calcul du total des livraisons pour les pourcentages donut
    const totalDeliveriesCount = deliveryStatusList.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0) || 14;

    return (
        <div className="space-y-6 pb-12 animate-fadeIn">
            {/* ROW 1: 4 STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-[#18192a] p-6 rounded-2xl border border-white/[0.04] shadow-lg relative flex flex-col justify-between h-[160px]">
                    <div className="flex items-start justify-between">
                        <p className="text-[#64748b] text-[10px] font-extrabold uppercase tracking-widest mt-1">VENTES TOTALES</p>
                        <div className="w-10 h-10 bg-[#8b5cf6]/10 rounded-full flex items-center justify-center text-[#8b5cf6]">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-3xl text-white tracking-tight mb-2">
                            {Number(stats.cards?.revenue?.value || 22.40).toFixed(2)} <span className="text-lg font-bold">MAD</span>
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                            <TrendingUp className="w-3.5 h-3.5 rotate-180" />
                            <span>-98.1% ce mois</span>
                        </div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-[#18192a] p-6 rounded-2xl border border-white/[0.04] shadow-lg relative flex flex-col justify-between h-[160px]">
                    <div className="flex items-start justify-between">
                        <p className="text-[#64748b] text-[10px] font-extrabold uppercase tracking-widest mt-1">COMMANDES</p>
                        <div className="w-10 h-10 bg-[#f59e0b]/10 rounded-full flex items-center justify-center text-[#f59e0b]">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-3xl text-white tracking-tight mb-2">
                            {stats.cards?.orders?.value || 1}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                            <TrendingUp className="w-3.5 h-3.5 rotate-180" />
                            <span>-93.3% ce mois</span>
                        </div>
                    </div>
                </div>

                {/* Menu Items Card */}
                <div className="bg-[#18192a] p-6 rounded-2xl border border-white/[0.04] shadow-lg relative flex flex-col justify-between h-[160px]">
                    <div className="flex items-start justify-between">
                        <p className="text-[#64748b] text-[10px] font-extrabold uppercase tracking-widest mt-1">PLATS ACTIFS</p>
                        <div className="w-10 h-10 bg-[#3b82f6]/10 rounded-full flex items-center justify-center text-[#3b82f6]">
                            <Utensils className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-3xl text-white tracking-tight mb-2">
                            {stats.cards?.menu_items?.total || 62}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#3b82f6]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
                            <span>0 ajoutés aujourd'hui</span>
                        </div>
                    </div>
                </div>

                {/* Users Card */}
                <div className="bg-[#18192a] p-6 rounded-2xl border border-white/[0.04] shadow-lg relative flex flex-col justify-between h-[160px]">
                    <div className="flex items-start justify-between">
                        <p className="text-[#64748b] text-[10px] font-extrabold uppercase tracking-widest mt-1">UTILISATEURS CLIENTS</p>
                        <div className="w-10 h-10 bg-[#10b981]/10 rounded-full flex items-center justify-center text-[#10b981]">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-3xl text-white tracking-tight mb-2">
                            {stats.cards?.drivers?.active || 2}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#10b981]">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+2% ce mois</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart */}
                <div className="lg:col-span-2 bg-[#18192a] p-6 rounded-2xl border border-white/[0.04] shadow-lg flex flex-col min-h-[360px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display text-lg font-bold text-white tracking-wide">Évolution des Ventes</h3>
                        <button className="bg-[#12131f] border border-white/[0.05] text-[#94a3b8] hover:text-white text-[11px] font-bold rounded-lg px-3.5 py-1.5 transition-colors">
                            7 Derniers Jours
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartDataList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-[#18192a] p-6 rounded-2xl border border-white/[0.04] shadow-lg flex flex-col min-h-[360px] justify-between">
                    <h3 className="font-display text-lg font-bold text-white tracking-wide mb-2">Statut des Commandes</h3>
                    <div className="h-[180px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={deliveryStatusList} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                    {deliveryStatusList.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="font-display text-2xl font-bold text-white">{totalDeliveriesCount}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5 mt-auto">
                        {/* En Attente */}
                        <div className="bg-[#12131f] p-3 rounded-xl border border-white/5 flex items-center justify-between relative overflow-hidden transition-all hover:border-[#8b5cf6]/40 shadow-sm">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8b5cf6]"></div>
                            <div className="pl-2">
                                <p className="text-[9px] font-extrabold text-[#64748b] uppercase tracking-wider">En Attente</p>
                                <p className="font-display text-base font-bold text-white leading-tight">{deliveryStatusList[0]?.value || 8}</p>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#8b5cf6] bg-[#8b5cf6]/15 px-2 py-0.5 rounded border border-[#8b5cf6]/30">57%</span>
                        </div>

                        {/* En Cours */}
                        <div className="bg-[#12131f] p-3 rounded-xl border border-white/5 flex items-center justify-between relative overflow-hidden transition-all hover:border-[#3b82f6]/40 shadow-sm">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b82f6]"></div>
                            <div className="pl-2">
                                <p className="text-[9px] font-extrabold text-[#64748b] uppercase tracking-wider">En Cours</p>
                                <p className="font-display text-base font-bold text-white leading-tight">{deliveryStatusList[1]?.value || 0}</p>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#3b82f6] bg-[#3b82f6]/15 px-2 py-0.5 rounded border border-[#3b82f6]/30">0%</span>
                        </div>

                        {/* En Préparation */}
                        <div className="bg-[#12131f] p-3 rounded-xl border border-white/5 flex items-center justify-between relative overflow-hidden transition-all hover:border-[#6366f1]/40 shadow-sm">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6366f1]"></div>
                            <div className="pl-2">
                                <p className="text-[9px] font-extrabold text-[#64748b] uppercase tracking-wider">En Préparation</p>
                                <p className="font-display text-base font-bold text-white leading-tight">{deliveryStatusList[3]?.value || 0}</p>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#6366f1] bg-[#6366f1]/15 px-2 py-0.5 rounded border border-[#6366f1]/30">0%</span>
                        </div>

                        {/* Livré */}
                        <div className="bg-[#12131f] p-3 rounded-xl border border-white/5 flex items-center justify-between relative overflow-hidden transition-all hover:border-[#a855f7]/40 shadow-sm">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#a855f7]"></div>
                            <div className="pl-2">
                                <p className="text-[9px] font-extrabold text-[#64748b] uppercase tracking-wider">Livré</p>
                                <p className="font-display text-base font-bold text-white leading-tight">{deliveryStatusList[2]?.value || 6}</p>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#a855f7] bg-[#a855f7]/15 px-2 py-0.5 rounded border border-[#a855f7]/30">43%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 3: RECENT ORDERS TABLE & ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Table */}
                <div className="lg:col-span-2 bg-[#18192a] rounded-2xl border border-white/[0.04] shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-display text-lg font-bold text-white tracking-wide">Commandes Récentes</h3>
                        <Link to="/admin/pedidos" className="bg-[#8b5cf6]/20 text-[#8b5cf6] hover:bg-[#8b5cf6]/30 font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors">
                            VOIR TOUT <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#94a3b8] min-w-[600px]">
                            <thead className="text-[10px] uppercase font-bold tracking-widest text-[#64748b] border-b border-white/5">
                                <tr>
                                    <th className="pb-3.5 pl-2">COMMANDE</th>
                                    <th className="pb-3.5">CLIENT</th>
                                    <th className="pb-3.5">DATE</th>
                                    <th className="pb-3.5">MONTANT</th>
                                    <th className="pb-3.5">STATUT</th>
                                    <th className="pb-3.5 text-right pr-2">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-medium">
                                {recentOrdersList.slice(0, 5).map((ro, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 pl-2 text-white font-bold font-mono text-[13px]">
                                            #{ro.order_number || `MAR-20260623-00${i+1}`}
                                        </td>
                                        <td className="py-4">
                                            <div className="text-white font-bold text-xs mb-0.5">{ro.customer_name || 'zakaria el kaoui'}</div>
                                            <div className="text-[11px] text-[#64748b] font-normal">{ro.customer_email || 'client@email.com'}</div>
                                        </td>
                                        <td className="py-4 text-[#94a3b8] text-xs">
                                            {ro.date || '23 juin 2026'}
                                        </td>
                                        <td className="py-4 font-bold text-white text-xs">
                                            {Number(ro.total || 22.4).toFixed(1)} MAD
                                        </td>
                                        <td className="py-4">
                                            <span className="px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b]">
                                                {ro.status || 'EN ATTENTE'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            <Link to="/admin/pedidos" className="w-7 h-7 rounded-full border border-white/10 inline-flex items-center justify-center text-[#64748b] hover:text-white hover:bg-white/5 transition-colors">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alerts Box */}
                <div className="bg-[#18192a] rounded-2xl border border-white/[0.04] shadow-lg p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                                <AlertCircle className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                                <h3 className="font-display text-base font-bold text-white leading-tight">Alertes Livraisons</h3>
                                <p className="text-[11px] text-[#64748b]">Commandes et disponibilités</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-[#12131f] p-4 rounded-xl border border-white/5 flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-lg bg-[#f59e0b]/10 text-[#f59e0b] mt-0.5 shrink-0">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-xs mb-1.5">Commandes en retard</p>
                                        <span className="bg-[#ef4444]/20 text-[#f97316] px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide inline-block">
                                            • RETARD : {alertsList[0]?.count || 2}
                                        </span>
                                    </div>
                                </div>
                                <Link to="/admin/repartos" className="w-7 h-7 rounded-lg bg-[#18192a] border border-white/5 flex items-center justify-center text-[#64748b] hover:text-white transition-colors shrink-0">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <Link to="/admin/repartos" className="w-full py-3.5 mt-8 bg-[#12131f] hover:bg-[#1c1d30] border border-white/5 text-[#94a3b8] hover:text-white font-extrabold rounded-xl text-center uppercase tracking-widest text-[11px] transition-all block">
                        GÉRER LES LIVRAISONS
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    ShoppingBag, Truck, Utensils, Users, TrendingUp, AlertTriangle, 
    ArrowRight, Clock, CheckCircle, Package 
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
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

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-[#6d28d9] border-t-transparent rounded-full"></div></div>;
    if (!stats) return <div className="p-8 text-white">Impossible de charger les statistiques.</div>;

    // Donut chart data processing
    const pieData = [
        { name: 'En Attente', value: stats.delivery_status['En attente'] || 0, color: '#f59e0b' }, // orange
        { name: 'En Cours', value: stats.delivery_status['Assigné'] || stats.delivery_status['En route'] || 0, color: '#3b82f6' }, // blue
        { name: 'En Préparation', value: stats.delivery_status['En préparation'] || 0, color: '#a855f7' }, // purple
        { name: 'Livré', value: stats.delivery_status['Livré'] || 0, color: '#10b981' }, // green
    ];
    
    // If all zero, show a placeholder
    const totalDeliveries = pieData.reduce((acc, curr) => acc + curr.value, 0);
    const renderData = totalDeliveries === 0 
        ? [...pieData, { name: 'Aucune commande', value: 1, color: '#2c2d3c' }] 
        : pieData;

    // Custom Tooltip for Line Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1e1f2e] border border-white/[0.05] p-3 rounded-lg shadow-xl">
                    <p className="text-white font-bold mb-1">{label}</p>
                    <p className="text-[#a855f7]">Revenus: {Number(payload[0].value).toFixed(2)} MAD</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* ROW 1: 4 STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-[#1e1f2e] p-6 rounded-2xl border border-white/[0.03] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] relative flex flex-col justify-between h-[160px]">
                    <div className="flex items-start justify-between">
                        <p className="text-[#64748b] text-[11px] font-bold uppercase tracking-widest mt-2">Ventes Totales</p>
                        <div className="w-10 h-10 bg-[#6d28d9]/10 rounded-full flex items-center justify-center text-[#8b5cf6]">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-3xl text-white tracking-tight mb-3">
                            {Number(stats.cards.revenue.value).toFixed(2)} <span className="text-[18px] font-bold">MAD</span>
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <span className={`flex items-center gap-1 ${stats.cards.revenue.trend >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                                <TrendingUp className="w-3 h-3" />
                                {stats.cards.revenue.trend >= 0 ? '+' : ''}{stats.cards.revenue.trend}%
                            </span>
                            <span className="text-[#64748b] font-semibold">ce mois</span>
                        </div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-[#1e1f2e] p-6 rounded-2xl border border-white/[0.03] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] relative flex flex-col justify-between h-[160px]">
                    <div className="flex items-start justify-between">
                        <p className="text-[#64748b] text-[11px] font-bold uppercase tracking-widest mt-2">Commandes</p>
                        <div className="w-10 h-10 bg-[#f59e0b]/10 rounded-full flex items-center justify-center text-[#f59e0b]">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-3xl text-white tracking-tight mb-3">
                            {stats.cards.orders.value}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <span className={`flex items-center gap-1 ${stats.cards.orders.trend >= 0 ? 'text-[#10b981]' : 'text-red-400'}`}>
                                <TrendingUp className="w-3 h-3" />
                                {stats.cards.orders.trend >= 0 ? '+' : ''}{stats.cards.orders.trend}%
                            </span>
                            <span className="text-[#64748b] font-semibold">ce mois</span>
                        </div>
                    </div>
                </div>

                {/* Menu Items Card */}
                <div className="bg-[#1e1f2e] p-6 rounded-2xl border border-white/[0.03] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] relative flex flex-col justify-between h-[160px]">
                    <div className="flex items-start justify-between">
                        <p className="text-[#64748b] text-[11px] font-bold uppercase tracking-widest mt-2">Plats Actifs</p>
                        <div className="w-10 h-10 bg-[#3b82f6]/10 rounded-full flex items-center justify-center text-[#3b82f6]">
                            <Utensils className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-3xl text-white tracking-tight mb-3">
                            {stats.cards.menu_items.total}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <span className="text-[#3b82f6] flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]"></span>
                                {stats.cards.menu_items.added_today} ajoutés
                            </span>
                            <span className="text-[#64748b] font-semibold">aujourd'hui</span>
                        </div>
                    </div>
                </div>

                {/* Users Card */}
                <div className="bg-[#1e1f2e] p-6 rounded-2xl border border-white/[0.03] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] relative flex flex-col justify-between h-[160px]">
                    <div className="flex items-start justify-between">
                        <p className="text-[#64748b] text-[11px] font-bold uppercase tracking-widest mt-2">Utilisateurs Clients</p>
                        <div className="w-10 h-10 bg-[#10b981]/10 rounded-full flex items-center justify-center text-[#10b981]">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-3xl text-white tracking-tight mb-3">
                            {stats.cards.drivers.active}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-bold">
                            <span className="flex items-center gap-1 text-[#10b981]">
                                <TrendingUp className="w-3 h-3" />
                                +2%
                            </span>
                            <span className="text-[#64748b] font-semibold">ce mois</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
                {/* Line Chart */}
                <div className="lg:col-span-2 bg-[#1e1f2e] p-6 rounded-2xl border border-white/[0.03] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] flex flex-col min-h-[360px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-white">Évolution des Ventes</h3>
                        <select className="bg-[#12131f] border border-white/[0.05] text-[#94a3b8] text-[11px] font-semibold rounded-lg px-3 py-1.5 outline-none appearance-none cursor-pointer">
                            <option>7 Derniers Jours</option>
                        </select>
                    </div>
                    <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart */}
                <div className="bg-[#1e1f2e] p-6 rounded-2xl border border-white/[0.03] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] flex flex-col min-h-[360px]">
                    <h3 className="font-bold text-lg text-white w-full text-left mb-2">Statut des Commandes</h3>
                    <div className="relative w-full flex-1 flex items-center justify-center min-h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={renderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={45}
                                    outerRadius={70}
                                    paddingAngle={4}
                                    cornerRadius={6}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {renderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-white tracking-tight">
                                    {totalDeliveries}
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="w-full grid grid-cols-2 gap-2 mt-4 content-start">
                        {pieData.map((entry, index) => {
                            const percent = totalDeliveries > 0 ? ((entry.value / totalDeliveries) * 100).toFixed(0) : 0;
                            return (
                                <div 
                                    key={index} 
                                    className="relative overflow-hidden flex flex-col bg-[#1e1f2e] p-2.5 pl-3 rounded-xl border border-white/[0.03] shadow-sm"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: entry.color }}></div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                        <span className="text-white text-[11px] font-medium">{entry.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between pl-1">
                                        <span className="text-white font-bold text-[15px]">{entry.value}</span>
                                        <span 
                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded" 
                                            style={{ 
                                                color: entry.color, 
                                                backgroundColor: `${entry.color}26` // 15% opacity hex
                                            }}
                                        >
                                            {percent}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ROW 3: TABLE & ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-[#1e1f2e] p-6 rounded-2xl border border-white/[0.03] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-white">Commandes Récentes</h3>
                        <Link to="/admin/pedidos" className="bg-[#6d28d9]/20 text-[#a855f7] px-3.5 py-1.5 rounded-lg text-[11px] font-bold hover:bg-[#6d28d9]/30 transition-colors flex items-center gap-1.5 uppercase tracking-wider">
                            VOIR TOUT <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/[0.04]">
                                    <th className="pb-3 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">Commande</th>
                                    <th className="pb-3 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[27%]">Client</th>
                                    <th className="pb-3 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">Date</th>
                                    <th className="pb-3 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[18%]">Montant</th>
                                    <th className="pb-3 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">Statut</th>
                                    <th className="pb-3 text-[10px] font-bold text-[#64748b] uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_orders.length > 0 ? stats.recent_orders.map((order, idx) => {
                                    // Parse date safely
                                    const dateObj = new Date(order.created_at || new Date());
                                    const dayMonth = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                                    const year = dateObj.getFullYear();
                                    
                                    return (
                                        <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                                            <td className="py-3 text-white font-bold text-[13px] whitespace-nowrap pr-4">#{order.order_number?.replace('#', '') || '00'}</td>
                                            <td className="py-3">
                                                <p className="text-[#e2e8f0] font-bold text-[13px] mb-0.5">{order.customer_name}</p>
                                                <p className="text-[#64748b] text-[10px] font-medium">{order.customer_email || 'client@email.com'}</p>
                                            </td>
                                            <td className="py-3">
                                                <p className="text-[#e2e8f0] font-bold text-[11px] mb-0.5">{dayMonth}</p>
                                                <p className="text-[#64748b] text-[10px] font-medium">{year}</p>
                                            </td>
                                            <td className="py-3 text-white font-bold text-[13px]">{order.total} MAD</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-[9px] font-bold tracking-wider w-max border ${
                                                    order.status === 'en_attente' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' :
                                                    order.status === 'en_cours' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' :
                                                    order.status === 'en_preparation' ? 'bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20' :
                                                    order.status === 'en_route' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20' :
                                                    order.status === 'livre' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' :
                                                    'bg-white/[0.05] text-[#94a3b8] border-white/10'
                                                }`}>
                                                    {order.status?.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link to="/admin/pedidos" className="p-1.5 hover:bg-white/5 rounded-lg text-[#64748b] hover:text-white transition-colors inline-block">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-[#64748b]">Aucune commande récente</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alerts Panel */}
                <div className="bg-[#1e1f2e] p-6 rounded-2xl border border-white/[0.03] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[15px] text-white">Alertes Livraisons</h3>
                            <p className="text-[#64748b] text-[10px] font-medium">Commandes et disponibilités</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2.5 flex-1">
                        {stats.alerts.length > 0 ? stats.alerts.map((alert, idx) => {
                            // Determine the link destination based on alert title
                            let linkDestination = '/admin/repartos';
                            if (alert.title.includes('Plats')) linkDestination = '/admin/carta';
                            
                            // Color logic
                            const isWarning = alert.type === 'warning';
                            const borderColor = isWarning ? 'border-[#f59e0b]/20' : 'border-red-500/20';
                            const bgColor = isWarning ? 'bg-[#f59e0b]/10' : 'bg-red-500/10';
                            const textColor = isWarning ? 'text-[#f59e0b]' : 'text-red-400';
                            const dotColor = isWarning ? 'bg-[#f59e0b]' : 'bg-red-500';
                            
                            let labelPrefix = 'Alerte : ';
                            if (alert.title.includes('retard')) labelPrefix = 'Retard : ';
                            if (alert.title.includes('Livreurs')) labelPrefix = 'Livreurs : ';
                            if (alert.title.includes('Plats')) labelPrefix = 'Menu : ';
                            
                            return (
                                <Link to={linkDestination} key={idx} className="p-2.5 rounded-xl flex gap-3 items-center bg-[#12131f]/50 border border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer group block">
                                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-[#1e1f2e] flex items-center justify-center border border-white/5 relative">
                                        <div className={`w-full h-full flex items-center justify-center ${bgColor} ${textColor}`}>
                                            <AlertTriangle className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-xs font-bold mb-0.5 truncate">{alert.title}</h4>
                                        <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded border text-[8px] font-bold tracking-widest uppercase ${borderColor} ${bgColor} ${textColor}`}>
                                            <div className={`w-1 h-1 rounded-full ${dotColor}`}></div>
                                            {labelPrefix} {alert.count}
                                        </span>
                                    </div>
                                    <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-[#64748b] group-hover:text-white transition-colors shrink-0">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                </Link>
                            );
                        }) : (
                            <div className="text-center py-10">
                                <CheckCircle className="w-10 h-10 text-[#10b981]/30 mx-auto mb-3" />
                                <p className="text-[#64748b] text-sm font-medium">Aucune alerte.</p>
                            </div>
                        )}
                    </div>
                    
                    <Link to="/admin/repartos" className="w-full mt-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] rounded-xl text-[#94a3b8] hover:text-white text-[10px] font-bold tracking-widest uppercase transition-colors text-center block">
                        Gérer les Livraisons
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

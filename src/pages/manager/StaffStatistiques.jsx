import { BarChart3, TrendingUp, Award, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StaffStatistiques = () => {
    // Mock Data
    const barData = [
        { name: 'Lun', commandes: 45 },
        { name: 'Mar', commandes: 52 },
        { name: 'Mer', commandes: 38 },
        { name: 'Jeu', commandes: 65 },
        { name: 'Ven', commandes: 85 },
        { name: 'Sam', commandes: 110 },
        { name: 'Dim', commandes: 95 },
    ];

    const pieData = [
        { name: 'Livrées', value: 380, color: '#7b4ee4' },
        { name: 'En retard', value: 20, color: '#f45b69' },
        { name: 'Annulées', value: 15, color: '#2a1715' },
    ];

    return (
        <div className="w-full flex flex-col gap-6 max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-[#6c49ff]" />
                <h2 className="text-xl font-bold text-white">Statistiques de Livraison</h2>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Commandes (7j)</span>
                        <div className="w-8 h-8 rounded-full bg-[#1c1537] flex items-center justify-center">
                            <Activity className="w-4 h-4 text-[#6c49ff]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-2">490</span>
                    <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
                        <TrendingUp className="w-3 h-3" /> +12% vs semaine dernière
                    </div>
                </div>

                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Taux de Succès</span>
                        <div className="w-8 h-8 rounded-full bg-[#1e1539] flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-[#7b4ee4]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-2">95.2%</span>
                    <div className="text-xs text-gray-500 font-medium">
                        Objectif: 98%
                    </div>
                </div>

                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Meilleur Livreur</span>
                        <div className="w-8 h-8 rounded-full bg-[#2a1715] flex items-center justify-center">
                            <Award className="w-4 h-4 text-[#f07c33]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-2">Sami Haddad</span>
                    <div className="text-xs text-gray-500 font-medium">
                        142 livraisons cette semaine
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Bar Chart */}
                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl p-6 shadow-lg flex flex-col">
                    <h3 className="text-[15px] font-bold text-white mb-6">Commandes par Jour (7 derniers jours)</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#23203b" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#23203b', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#14141a', borderColor: '#23203b', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="commandes" fill="#6c49ff" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl p-6 shadow-lg flex flex-col">
                    <h3 className="text-[15px] font-bold text-white mb-6">Qualité des Livraisons</h3>
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                        <div className="relative w-64 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="transparent"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#14141a', borderColor: '#23203b', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-white">415</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-center gap-6 mt-4">
                            {pieData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                    <span className="text-xs text-gray-400 font-medium">{d.name} ({d.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffStatistiques;

import { Users, Package, Truck, CheckCircle2, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
    // Mock Data
    const stats = {
        livreursActifs: 8,
        commandesDuJour: 45,
        enLivraison: 12,
        livrees: 28,
    };

    const activiteLivreurs = [
        { id: 1, nom: 'Mohamed El Amrani', assignees: 8, enCours: 2, livrees: 6, statut: 'Actif' },
        { id: 2, nom: 'Carlos Ruiz', assignees: 5, enCours: 1, livrees: 4, statut: 'Actif' },
        { id: 3, nom: 'Youssef Benali', assignees: 10, enCours: 3, livrees: 7, statut: 'Actif' },
        { id: 4, nom: 'Karim Ziyech', assignees: 0, enCours: 0, livrees: 0, statut: 'Inactif' },
        { id: 5, nom: 'Sami Haddad', assignees: 12, enCours: 4, livrees: 8, statut: 'Actif' },
    ];

    const pieData = [
        { name: 'En attente', value: 5, color: '#f07c33' },
        { name: 'En livraison', value: 12, color: '#3b82f6' },
        { name: 'Livrées', value: 28, color: '#7b4ee4' },
    ];

    const totalPie = pieData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1 */}
                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Livreurs Actifs</span>
                        <div className="w-8 h-8 rounded-full bg-[#1c1537] flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#6c49ff]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{stats.livreursActifs}</span>
                    <div className="text-xs text-gray-500">Livreurs en service</div>
                </div>

                {/* Card 2 */}
                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Commandes du Jour</span>
                        <div className="w-8 h-8 rounded-full bg-[#2a1715] flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#f07c33]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{stats.commandesDuJour}</span>
                    <div className="text-xs text-gray-500">Total à traiter aujourd'hui</div>
                </div>

                {/* Card 3 */}
                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">En Livraison</span>
                        <div className="w-8 h-8 rounded-full bg-[#111c34] flex items-center justify-center">
                            <Truck className="w-4 h-4 text-[#3b82f6]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{stats.enLivraison}</span>
                    <div className="text-xs text-gray-500">Actuellement en cours</div>
                </div>

                {/* Card 4 */}
                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl p-5 shadow-lg flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Livrées</span>
                        <div className="w-8 h-8 rounded-full bg-[#1e1539] flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-[#7b4ee4]" />
                        </div>
                    </div>
                    <span className="text-2xl font-bold text-white mb-4">{stats.livrees}</span>
                    <div className="text-xs text-gray-500">Livrées avec succès</div>
                </div>
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Table: Activité des Livreurs */}
                <div className="lg:col-span-2 bg-[#14141a] border border-[#23203b] rounded-2xl shadow-lg flex flex-col min-h-[350px]">
                    <div className="p-6 flex justify-between items-center">
                        <h3 className="text-[15px] font-bold text-white">Activité des Livreurs</h3>
                        <Link to="/staff/livreurs" className="flex items-center gap-1 bg-[#251b44] hover:bg-[#31235a] text-[#7c51ff] text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors uppercase tracking-wider">
                            Voir Tout <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    
                    <div className="px-6 pb-2 border-b border-[#23203b]">
                        <div className="grid grid-cols-5 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                            <div>LIVREUR</div>
                            <div className="text-center">ASSIGNÉES</div>
                            <div className="text-center">EN COURS</div>
                            <div className="text-center">LIVRÉES</div>
                            <div className="text-right">STATUT</div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="flex flex-col divide-y divide-[#23203b]/50">
                            {activiteLivreurs.map(liv => (
                                <div key={liv.id} className="grid grid-cols-5 items-center px-6 py-4 hover:bg-white/5 transition-colors text-sm">
                                    <div className="font-semibold text-white">{liv.nom}</div>
                                    <div className="text-gray-300 font-medium text-center">{liv.assignees}</div>
                                    <div className="text-[#3b82f6] font-bold text-center">{liv.enCours}</div>
                                    <div className="text-[#4ABA7A] font-bold text-center">{liv.livrees}</div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            liv.statut === 'Actif' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {liv.statut}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chart: Répartition */}
                <div className="bg-[#14141a] border border-[#23203b] rounded-2xl shadow-lg flex flex-col min-h-[350px]">
                    <div className="p-6">
                        <h3 className="text-[15px] font-bold text-white">Répartition des Livraisons</h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative pb-6">
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
                    </div>
                    <div className="flex justify-center gap-4 pb-6">
                        {pieData.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                <span className="text-xs text-gray-400">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;

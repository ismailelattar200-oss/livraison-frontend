import { useState } from 'react';
import { Search, Filter, Truck, MoreVertical } from 'lucide-react';

const StaffLivreurs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [livreurs, setLivreurs] = useState([
        { id: 1, nom: 'Mohamed El Amrani', email: 'livreur1@marea.com', phone: '+34 612 000 010', commandes: 8, statut: 'Actif' },
        { id: 2, nom: 'Carlos Ruiz', email: 'livreur2@marea.com', phone: '+34 612 000 011', commandes: 5, statut: 'Actif' },
        { id: 3, nom: 'Youssef Benali', email: 'youssef@marea.com', phone: '+34 612 000 012', commandes: 10, statut: 'Actif' },
        { id: 4, nom: 'Karim Ziyech', email: 'karim@marea.com', phone: '+34 612 000 013', commandes: 0, statut: 'Inactif' },
        { id: 5, nom: 'Sami Haddad', email: 'sami@marea.com', phone: '+34 612 000 014', commandes: 12, statut: 'Actif' },
    ]);

    const toggleStatus = (id) => {
        setLivreurs(prev => prev.map(l => {
            if (l.id === id) {
                return { ...l, statut: l.statut === 'Actif' ? 'Inactif' : 'Actif' };
            }
            return l;
        }));
    };

    const filtered = livreurs.filter(l => {
        const matchesSearch = l.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              l.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || l.statut === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="w-full flex flex-col gap-6 max-w-[1400px] mx-auto">
            {/* Title */}
            <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-[#6c49ff]" />
                <h2 className="text-xl font-bold text-white">Gestion des Livreurs</h2>
            </div>

            {/* Filters */}
            <div className="bg-[#14141a] border border-[#23203b] p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#6c49ff] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Rechercher par nom ou email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#5B41D8]/50 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-600"
                    />
                </div>
                <div className="relative group w-full sm:w-64">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#6c49ff]" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#5B41D8]/50 rounded-xl pl-12 pr-10 py-3 text-sm text-white outline-none appearance-none cursor-pointer"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="Actif">Actif</option>
                        <option value="Inactif">Inactif</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#14141a] border border-[#23203b] rounded-2xl shadow-lg flex flex-col min-h-[400px]">
                <div className="px-6 py-4 border-b border-[#23203b]">
                    <div className="grid grid-cols-7 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <div>ID</div>
                        <div className="col-span-2">NOM & EMAIL</div>
                        <div>TÉLÉPHONE</div>
                        <div className="text-center">COMMANDES</div>
                        <div className="text-center">STATUT</div>
                        <div className="text-right">ACTIONS</div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex flex-col divide-y divide-[#23203b]/50">
                        {filtered.map(livreur => (
                            <div key={livreur.id} className="grid grid-cols-7 items-center px-6 py-4 hover:bg-white/5 transition-colors group">
                                <div className="font-semibold text-gray-400">#LIV-{livreur.id.toString().padStart(3, '0')}</div>
                                <div className="col-span-2">
                                    <div className="font-semibold text-white">{livreur.nom}</div>
                                    <div className="text-xs text-gray-500">{livreur.email}</div>
                                </div>
                                <div className="text-sm text-gray-300">{livreur.phone}</div>
                                <div className="text-center font-bold text-white">{livreur.commandes}</div>
                                <div className="text-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        livreur.statut === 'Actif' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {livreur.statut}
                                    </span>
                                </div>
                                <div className="text-right flex items-center justify-end gap-3">
                                    <button 
                                        onClick={() => toggleStatus(livreur.id)}
                                        className="text-xs font-semibold px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors text-white"
                                    >
                                        {livreur.statut === 'Actif' ? 'Désactiver' : 'Activer'}
                                    </button>
                                    <button className="text-gray-500 hover:text-white transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffLivreurs;

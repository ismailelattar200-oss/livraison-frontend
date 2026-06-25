import { useState } from 'react';
import { Search, Filter, Package, User } from 'lucide-react';

const StaffCommandes = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [livreurFilter, setLivreurFilter] = useState('all');

    const livreurs = [
        { id: 1, nom: 'Mohamed El Amrani' },
        { id: 2, nom: 'Carlos Ruiz' },
        { id: 3, nom: 'Youssef Benali' },
        { id: 5, nom: 'Sami Haddad' },
    ];

    const [commandes, setCommandes] = useState([
        { id: 'MAR-20260624-001', client: 'Ana García', adresse: 'Calle Gran Vía 25, Madrid', livreurId: 1, montant: 56.00, statut: 'livre', heure: '20:22' },
        { id: 'MAR-20260624-002', client: 'Javier Martín', adresse: 'Avenida de la Constitución 8', livreurId: null, montant: 42.50, statut: 'pret', heure: '20:45' },
        { id: 'MAR-20260624-003', client: 'Lucía Fernández', adresse: 'Calle Alcalá 50, Madrid', livreurId: 2, montant: 120.00, statut: 'en_cours', heure: '20:30' },
        { id: 'MAR-20260624-004', client: 'Pedro Sánchez', adresse: 'Paseo de la Castellana 120', livreurId: 3, montant: 34.00, statut: 'en_cours', heure: '20:15' },
        { id: 'MAR-20260624-005', client: 'María Rodríguez', adresse: 'Calle Fuencarral 85', livreurId: 5, montant: 89.00, statut: 'livre', heure: '19:50' },
    ]);

    const handleReassign = (commandeId, newLivreurId) => {
        setCommandes(prev => prev.map(c => {
            if (c.id === commandeId) {
                return { ...c, livreurId: newLivreurId ? Number(newLivreurId) : null };
            }
            return c;
        }));
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'pret': return 'bg-indigo-500/20 text-indigo-400';
            case 'en_cours': return 'bg-blue-500/20 text-blue-400';
            case 'livre': return 'bg-[#7b4ee4]/20 text-[#7b4ee4]';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 'pret': return 'Prêt';
            case 'en_cours': return 'En Livraison';
            case 'livre': return 'Livré';
            default: return status;
        }
    };

    const filtered = commandes.filter(c => {
        const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              c.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.statut === statusFilter;
        const matchesLivreur = livreurFilter === 'all' || c.livreurId === Number(livreurFilter) || (livreurFilter === 'none' && !c.livreurId);
        
        return matchesSearch && matchesStatus && matchesLivreur;
    });

    return (
        <div className="w-full flex flex-col gap-6 max-w-[1400px] mx-auto">
            <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-[#6c49ff]" />
                <h2 className="text-xl font-bold text-white">Gestion des Commandes</h2>
            </div>

            {/* Filters */}
            <div className="bg-[#14141a] border border-[#23203b] p-4 rounded-2xl shadow-lg flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#6c49ff] transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Rechercher par ID ou Client..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#5B41D8]/50 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-600"
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative group w-full sm:w-48">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#6c49ff]" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#5B41D8]/50 rounded-xl pl-12 pr-10 py-3 text-sm text-white outline-none appearance-none cursor-pointer"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="pret">Prêt</option>
                            <option value="en_cours">En Livraison</option>
                            <option value="livre">Livré</option>
                        </select>
                    </div>

                    <div className="relative group w-full sm:w-56">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#6c49ff]" />
                        <select 
                            value={livreurFilter}
                            onChange={(e) => setLivreurFilter(e.target.value)}
                            className="w-full bg-[#0b0c10] border border-[#23203b] focus:border-[#5B41D8]/50 rounded-xl pl-12 pr-10 py-3 text-sm text-white outline-none appearance-none cursor-pointer"
                        >
                            <option value="all">Tous les livreurs</option>
                            <option value="none">Non assigné</option>
                            {livreurs.map(l => (
                                <option key={l.id} value={l.id}>{l.nom}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#14141a] border border-[#23203b] rounded-2xl shadow-lg flex flex-col min-h-[400px]">
                <div className="px-6 py-4 border-b border-[#23203b]">
                    <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <div className="col-span-2">COMMANDE</div>
                        <div className="col-span-2">CLIENT</div>
                        <div className="col-span-3">ADRESSE</div>
                        <div className="col-span-2 text-center">MONTANT</div>
                        <div className="col-span-1 text-center">STATUT</div>
                        <div className="col-span-2 text-right">LIVREUR ASSIGNÉ</div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex flex-col divide-y divide-[#23203b]/50">
                        {filtered.map(commande => (
                            <div key={commande.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-white/5 transition-colors group">
                                <div className="col-span-2">
                                    <div className="font-semibold text-white">#{commande.id}</div>
                                    <div className="text-xs text-gray-500">{commande.heure}</div>
                                </div>
                                <div className="col-span-2 font-semibold text-gray-200">
                                    {commande.client}
                                </div>
                                <div className="col-span-3 text-sm text-gray-400 truncate pr-4" title={commande.adresse}>
                                    {commande.adresse}
                                </div>
                                <div className="col-span-2 text-center font-bold text-white">
                                    {commande.montant.toFixed(2)} MAD
                                </div>
                                <div className="col-span-1 text-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(commande.statut)}`}>
                                        {getStatusLabel(commande.statut)}
                                    </span>
                                </div>
                                <div className="col-span-2 text-right">
                                    {commande.statut === 'livre' ? (
                                        <div className="text-sm font-medium text-gray-400">
                                            {livreurs.find(l => l.id === commande.livreurId)?.nom || 'Inconnu'}
                                        </div>
                                    ) : (
                                        <select 
                                            value={commande.livreurId || ''}
                                            onChange={(e) => handleReassign(commande.id, e.target.value)}
                                            className="bg-[#0b0c10] border border-[#23203b] focus:border-[#5B41D8]/50 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer max-w-full"
                                        >
                                            <option value="">Non assigné</option>
                                            {livreurs.map(l => (
                                                <option key={l.id} value={l.id}>{l.nom}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="p-12 text-center text-gray-500 text-sm">
                                Aucune commande trouvée.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffCommandes;

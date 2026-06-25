import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Download, CheckCircle, Trash2, AlertTriangle, Briefcase } from 'lucide-react';

const AdminCandidaturas = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchApps = () => {
        api.get('/admin/job-applications')
            .then(res => setApps(res.data.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchApps(); }, []);

    const markReviewed = async (id) => {
        try {
            await api.put(`/admin/job-applications/${id}/review`);
            fetchApps();
        } catch(e) { console.error(e) }
    };

    // --- Delete Logic ---
    const openDeleteConfirm = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/admin/job-applications/${itemToDelete.id}`);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchApps();
        } catch(e) { console.error(e) }
    };

    return (
        <div className="p-8">


            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full"></div></div>
            ) : (
                <div className="bg-[#1e1f2e] rounded-xl shadow-xl shadow-black/40 border border-white/5 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#12131f]/30 border-b border-white/10">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Candidat</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Poste</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">CV / Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {apps.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Aucune candidature.</td></tr>
                            ) : apps.map(app => (
                                <tr key={app.id} className={`hover:bg-white/5 transition-colors ${!app.is_reviewed ? 'bg-[#12131f]/40' : ''}`}>
                                    <td className="px-6 py-4 text-sm text-gray-400 font-medium">{new Date(app.created_at).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white text-sm mb-0.5">{app.name}</div>
                                        <div className="text-xs text-gray-500">{app.email} | {app.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-[#8b5cf6] text-sm flex items-center gap-2 h-full">
                                        <Briefcase className="w-4 h-4" /> {app.position}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest ${app.is_reviewed ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'}`}>
                                            {app.is_reviewed ? 'Examiné' : 'Nouveau'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-2">
                                            {app.cv_url ? (
                                                <a href={app.cv_url} target="_blank" rel="noreferrer" className="p-1.5 bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white rounded-lg transition-colors inline-flex items-center justify-center" title="Voir le CV">
                                                    <Download className="w-4 h-4"/>
                                                </a>
                                            ) : <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest italic px-2">Sans CV</span>}
                                            
                                            {!app.is_reviewed && (
                                                <button onClick={() => markReviewed(app.id)} className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors inline-flex items-center justify-center" title="Marquer comme examiné">
                                                    <CheckCircle className="w-4 h-4"/>
                                                </button>
                                            )}
                                            
                                            <button onClick={() => openDeleteConfirm(app)} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors inline-flex items-center justify-center" title="Supprimer">
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* DELETE MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#1e1f2e] rounded-2xl max-w-md w-full border border-white/10 overflow-hidden shadow-2xl">
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Supprimer la candidature ?</h3>
                            <p className="text-gray-400 mb-6">
                                La candidature de <strong className="text-white">{itemToDelete?.name}</strong> pour le poste de <strong className="text-white">{itemToDelete?.position}</strong> sera définitivement supprimée.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 px-4 bg-[#12131f] border border-white/10 rounded-lg text-white font-medium hover:bg-white/5 transition-colors">
                                    Annuler
                                </button>
                                <button onClick={confirmDelete} className="flex-1 py-3 px-4 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 transition-colors">
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCandidaturas;

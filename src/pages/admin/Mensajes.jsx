import { useState, useEffect } from 'react';
import api from '../../services/api';
import { MailOpen, Trash2, AlertTriangle, Mail } from 'lucide-react';

const AdminMensajes = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchMessages = () => {
        api.get('/admin/contacts')
            .then(res => setMessages(res.data.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchMessages(); }, []);

    const markRead = async (id) => {
        try {
            await api.put(`/admin/contacts/${id}/read`);
            fetchMessages();
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
            await api.delete(`/admin/contacts/${itemToDelete.id}`);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchMessages();
        } catch(e) { console.error(e) }
    };

    return (
        <div className="p-8">


            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full"></div></div>
            ) : (
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="bg-[#1e1f2e] border border-white/5 rounded-xl p-12 text-center text-gray-500 shadow-xl shadow-black/40">
                            Aucun message.
                        </div>
                    ) : null}
                    
                    {messages.map(msg => (
                        <div key={msg.id} className={`bg-[#1e1f2e] p-6 rounded-xl shadow-xl shadow-black/40 border ${!msg.is_read ? 'border-l-4 border-l-[#8b5cf6] border-t-white/5 border-r-white/5 border-b-white/5' : 'border-white/5'}`}>
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex items-start gap-5">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!msg.is_read ? 'bg-[#8b5cf6]/20 text-[#8b5cf6]' : 'bg-[#12131f] text-gray-500'}`}>
                                        {!msg.is_read ? <Mail className="w-6 h-6" /> : <MailOpen className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white mb-0.5">{msg.name}</h3>
                                        <p className="text-[#8b5cf6] text-sm font-bold mb-1">{msg.email}</p>
                                        <p className="text-gray-500 text-xs font-medium">{new Date(msg.created_at).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!msg.is_read && (
                                        <button onClick={() => markRead(msg.id)} className="p-2.5 bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white rounded-lg transition-colors inline-flex items-center justify-center" title="Marquer comme lu">
                                            <MailOpen className="w-5 h-5"/>
                                        </button>
                                    )}
                                    <button onClick={() => openDeleteConfirm(msg)} className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors inline-flex items-center justify-center" title="Supprimer">
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                            <div className="bg-[#12131f] border border-white/5 p-5 rounded-lg text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                                {msg.message}
                            </div>
                        </div>
                    ))}
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
                            <h3 className="text-xl font-bold text-white mb-2">Supprimer le message ?</h3>
                            <p className="text-gray-400 mb-6">
                                Ce message de <strong className="text-white">{itemToDelete?.name}</strong> sera définitivement supprimé.
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

export default AdminMensajes;

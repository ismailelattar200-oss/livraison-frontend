import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, AlertTriangle, Calendar } from 'lucide-react';

const AdminEventos = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        event_date: '',
        is_active: true
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        title: '',
        description: '',
        event_date: '',
        is_active: true,
        image: null
    });

    const fetchEvents = () => {
        api.get('/admin/events')
            .then(res => setEvents(res.data.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchEvents(); }, []);

    // --- Delete Logic ---
    const openDeleteConfirm = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/admin/events/${itemToDelete.id}`);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchEvents();
        } catch(e) { console.error(e); }
    };

    // --- Edit Logic ---
    const openEditModal = (item) => {
        setItemToEdit(item);
        // format date for input type="datetime-local" if needed, 
        // assuming event_date comes as ISO or similar. Let's slice it:
        const formattedDate = item.event_date ? new Date(item.event_date).toISOString().slice(0, 16) : '';
        setEditForm({
            title: item.title,
            description: item.description || '',
            event_date: formattedDate,
            is_active: item.is_active !== false // default true
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm({ ...editForm, [name]: type === 'checkbox' ? checked : value });
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/events/${itemToEdit.id}`, editForm);
            setIsEditModalOpen(false);
            setItemToEdit(null);
            fetchEvents();
        } catch(e) { console.error(e); }
    };

    // --- Add Logic ---
    const handleAddChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setAddForm({ ...addForm, image: files[0] });
        } else {
            setAddForm({ ...addForm, [name]: type === 'checkbox' ? checked : value });
        }
    };

    const submitAdd = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', addForm.title);
        formData.append('description', addForm.description);
        
        // Convert YYYY-MM-DDThh:mm to YYYY-MM-DD hh:mm:ss
        const formattedDate = addForm.event_date ? addForm.event_date.replace('T', ' ') + ':00' : '';
        formData.append('event_date', formattedDate);
        
        formData.append('is_active', addForm.is_active ? 1 : 0);
        if (addForm.image) formData.append('image', addForm.image);

        try {
            await api.post('/admin/events', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsAddModalOpen(false);
            setAddForm({ title: '', description: '', event_date: '', is_active: true, image: null });
            fetchEvents();
        } catch(e) {
            console.error(e);
            alert("Erreur lors de la création de l'événement.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center mb-6">
                <button onClick={() => setIsAddModalOpen(true)} className="bg-[#8b5cf6] text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#7c3aed] transition-colors shadow-sm">
                    <Plus className="w-5 h-5" /> Nouvel Événement
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {events.length === 0 ? (
                        <div className="col-span-full bg-[#1e1f2e] border border-white/5 shadow-xl shadow-black/40 rounded-2xl p-12 text-center text-gray-500 text-lg">
                            Aucun événement trouvé.
                        </div>
                    ) : events.map(event => (
                        <div key={event.id} className="bg-[#1e1f2e] rounded-xl border border-white/5 shadow-xl shadow-black/40 overflow-hidden flex flex-col group">
                            <div className="relative h-40">
                                <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f2e] to-transparent"></div>
                                <span className={`absolute top-4 right-4 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${event.is_active !== false ? 'bg-[#10b981]/80 text-white border-white/20 shadow-lg' : 'bg-slate-500/80 text-white border-white/20 shadow-lg'}`}>
                                    {event.is_active !== false ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                            <div className="p-5 flex flex-col flex-1 relative -mt-4">
                                <h3 className="font-bold text-lg text-white mb-2 leading-tight">{event.title}</h3>
                                <p className="text-sm text-[#8b5cf6] mb-3 flex items-center gap-2 font-bold">
                                    <Calendar className="w-4 h-4" /> {new Date(event.event_date).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
                                </p>
                                <p className="text-gray-400 text-sm mb-5 flex-1 line-clamp-3 leading-relaxed">{event.description}</p>
                                <div className="flex justify-end gap-3 border-t border-white/5 pt-6">
                                    <button onClick={() => openEditModal(event)} className="p-2 bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white rounded-lg transition-colors shadow-sm"><Edit2 className="w-5 h-5"/></button>
                                    <button onClick={() => openDeleteConfirm(event)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors shadow-sm"><Trash2 className="w-5 h-5"/></button>
                                </div>
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
                            <h3 className="text-xl font-bold text-white mb-2">Supprimer l'événement ?</h3>
                            <p className="text-gray-400 mb-6">
                                L'événement <strong className="text-white">{itemToDelete?.title}</strong> sera définitivement supprimé.
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

            {/* EDIT MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#1e1f2e] rounded-2xl max-w-lg w-full border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">Modifier : {itemToEdit?.title}</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="edit-event-form" onSubmit={submitEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Titre de l'événement</label>
                                    <input required type="text" name="title" value={editForm.title} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Date et Heure</label>
                                    <input required type="datetime-local" name="event_date" value={editForm.event_date} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                    <textarea name="description" value={editForm.description} onChange={handleEditChange} rows="4" className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]"></textarea>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <input type="checkbox" id="is_active" name="is_active" checked={editForm.is_active} onChange={handleEditChange} className="w-5 h-5 rounded border-white/10 text-[#8b5cf6] focus:ring-[#8b5cf6] bg-[#12131f]" />
                                    <label htmlFor="is_active" className="text-sm font-medium text-white">Événement Actif (Visible)</label>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 px-4 bg-[#12131f] border border-white/10 rounded-lg text-white font-medium hover:bg-white/5 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" form="edit-event-form" className="flex-1 py-2 px-4 bg-[#8b5cf6] rounded-lg text-white font-bold hover:bg-[#7c3aed] transition-colors">
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ADD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#1e1f2e] rounded-2xl max-w-lg w-full border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">Nouvel Événement</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="add-event-form" onSubmit={submitAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Image de l'événement</label>
                                    <input required type="file" name="image" accept="image/*" onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Titre de l'événement</label>
                                    <input required type="text" name="title" value={addForm.title} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Date et Heure</label>
                                    <input required type="datetime-local" name="event_date" value={addForm.event_date} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                    <textarea required name="description" value={addForm.description} onChange={handleAddChange} rows="4" className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]"></textarea>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <input type="checkbox" id="add_is_active" name="is_active" checked={addForm.is_active} onChange={handleAddChange} className="w-5 h-5 rounded border-white/10 text-[#8b5cf6] focus:ring-[#8b5cf6] bg-[#12131f]" />
                                    <label htmlFor="add_is_active" className="text-sm font-medium text-white">Événement Actif (Visible)</label>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 px-4 bg-[#12131f] border border-white/10 rounded-lg text-white font-medium hover:bg-white/5 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" form="add-event-form" className="flex-1 py-2 px-4 bg-[#8b5cf6] rounded-lg text-white font-bold hover:bg-[#7c3aed] transition-colors">
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventos;

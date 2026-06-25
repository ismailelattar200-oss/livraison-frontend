import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, AlertTriangle, Tags } from 'lucide-react';

const AdminCategorias = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        is_active: true
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        description: '',
        image: null,
        is_active: true
    });

    const fetchCategories = () => {
        api.get('/admin/categories')
            .then(res => setCategories(res.data.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchCategories(); }, []);

    // --- Delete Logic ---
    const openDeleteConfirm = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/admin/categories/${itemToDelete.id}`);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchCategories();
        } catch(e) { console.error(e); }
    };

    // --- Edit Logic ---
    const openEditModal = (item) => {
        setItemToEdit(item);
        setEditForm({
            name: item.name,
            description: item.description || '',
            is_active: item.is_active !== false
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
            await api.put(`/admin/categories/${itemToEdit.id}`, editForm);
            setIsEditModalOpen(false);
            setItemToEdit(null);
            fetchCategories();
        } catch(e) { console.error(e); }
    };

    // --- Add Logic ---
    const handleAddChange = (e) => {
        const { name, value, type, files, checked } = e.target;
        if (type === 'file') {
            setAddForm({ ...addForm, image: files[0] });
        } else if (type === 'checkbox') {
            setAddForm({ ...addForm, [name]: checked });
        } else {
            setAddForm({ ...addForm, [name]: value });
        }
    };

    const submitAdd = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', addForm.name);
        formData.append('slug', addForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        formData.append('display_order', 1);
        formData.append('is_active', addForm.is_active ? 1 : 0);
        if (addForm.description) formData.append('description', addForm.description);
        if (addForm.image) formData.append('image', addForm.image);

        try {
            await api.post('/admin/categories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsAddModalOpen(false);
            setAddForm({ name: '', description: '', image: null, is_active: true });
            fetchCategories();
        } catch(e) {
            console.error(e);
            alert("Erreur lors de la création.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center mb-6">
                <button onClick={() => setIsAddModalOpen(true)} className="bg-[#8b5cf6] text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#7c3aed] transition-colors shadow-sm">
                    <Plus className="w-5 h-5" /> Ajouter une catégorie
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full"></div></div>
            ) : (
                <div className="bg-[#1e1f2e] rounded-2xl shadow-xl shadow-black/40 border border-white/5 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#12131f]/30 border-b border-white/10">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Catégorie</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Plats</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {categories.length === 0 ? (
                                <tr><td colSpan="5" className="p-12 text-center text-gray-500 text-lg">Aucune catégorie trouvée.</td></tr>
                            ) : categories.map(cat => (
                                <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-white text-[13px] flex items-center gap-3">
                                        <Tags className="w-4 h-4 text-[#8b5cf6]" /> {cat.name}
                                        <div className="text-[12px] text-gray-400 font-normal">/{cat.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 text-[13px] text-gray-400 max-w-[200px] truncate">
                                        {cat.description || <span className="italic text-gray-600">Aucune description</span>}
                                    </td>
                                    <td className="px-6 py-4 text-[13px] font-bold text-gray-400">
                                        {cat.items_count || 0} plats
                                    </td>
                                    <td className="px-6 py-4">
                                        {cat.is_active ? <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-[#10b981]/20 bg-[#10b981]/10 text-[#10b981]">Active</span> : <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border border-slate-500/20 bg-slate-500/10 text-slate-400">Inactive</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openEditModal(cat)} className="p-2 bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white rounded-lg transition-colors shadow-sm"><Edit2 className="w-4 h-4"/></button>
                                            <button onClick={() => openDeleteConfirm(cat)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors shadow-sm"><Trash2 className="w-4 h-4"/></button>
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
                            <h3 className="text-xl font-bold text-white mb-2">Supprimer la catégorie ?</h3>
                            <p className="text-gray-400 mb-6">
                                La catégorie <strong className="text-white">{itemToDelete?.name}</strong> sera supprimée. Les plats associés pourraient se retrouver sans catégorie.
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
                            <h3 className="text-xl font-bold text-white">Modifier : {itemToEdit?.name}</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="edit-cat-form" onSubmit={submitEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nom de la catégorie</label>
                                    <input required type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                    <textarea name="description" value={editForm.description} onChange={handleEditChange} rows="3" className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]"></textarea>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" name="is_active" checked={editForm.is_active} onChange={handleEditChange} className="w-4 h-4 rounded border-white/10 bg-[#12131f] text-[#8b5cf6] focus:ring-[#8b5cf6]" />
                                    <label className="text-sm font-medium text-gray-400">Catégorie active</label>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 px-4 bg-[#12131f] border border-white/10 rounded-lg text-white font-medium hover:bg-white/5 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" form="edit-cat-form" className="flex-1 py-2 px-4 bg-[#8b5cf6] rounded-lg text-white font-bold hover:bg-[#7c3aed] transition-colors">
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
                            <h3 className="text-xl font-bold text-white">Ajouter une catégorie</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="add-cat-form" onSubmit={submitAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Image de la catégorie</label>
                                    <input required type="file" name="image" accept="image/*" onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nom de la catégorie</label>
                                    <input required type="text" name="name" value={addForm.name} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optionnelle)</label>
                                    <textarea name="description" value={addForm.description} onChange={handleAddChange} rows="3" className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]"></textarea>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 px-4 bg-[#12131f] border border-white/10 rounded-lg text-white font-medium hover:bg-white/5 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" form="add-cat-form" className="flex-1 py-2 px-4 bg-[#8b5cf6] rounded-lg text-white font-bold hover:bg-[#7c3aed] transition-colors">
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategorias;

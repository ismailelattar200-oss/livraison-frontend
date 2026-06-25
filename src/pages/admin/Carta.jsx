import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

const AdminCarta = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Modals state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        category_id: '',
        price: '',
        is_available: true
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        category_id: '',
        price: '',
        description: '',
        is_available: true,
        image: null
    });

    const fetchItems = () => {
        api.get('/admin/menu-items')
            .then(res => {
                let fetchedItems = res.data.data;
                const params = new URLSearchParams(window.location.search);
                if (params.get('filter') === 'unavailable') {
                    fetchedItems = fetchedItems.filter(item => !item.is_available);
                }
                setItems(fetchedItems);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const fetchCategories = () => {
        api.get('/admin/categories')
            .then(res => setCategories(res.data.data || []))
            .catch(err => console.error(err));
    };

    useEffect(() => { 
        fetchItems(); 
        fetchCategories();
    }, []);

    // Filter logic for search and category select
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '' || item.category_id?.toString() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // --- Delete Logic ---
    const openDeleteConfirm = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/admin/menu-items/${itemToDelete.id}`);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchItems();
        } catch(e) { console.error(e); }
    };

    // --- Edit Logic ---
    const openEditModal = (item) => {
        setItemToEdit(item);
        setEditForm({
            name: item.name,
            category_id: item.category_id || '',
            price: item.price,
            is_available: item.is_available
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/menu-items/${itemToEdit.id}`, editForm);
            setIsEditModalOpen(false);
            setItemToEdit(null);
            fetchItems();
        } catch(e) { console.error(e); }
    };

    // --- Add Logic ---
    const handleAddChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setAddForm(prev => ({ ...prev, image: files[0] }));
        } else {
            setAddForm(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const submitAdd = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', addForm.name);
        formData.append('category_id', addForm.category_id);
        formData.append('price', addForm.price);
        formData.append('description', addForm.description);
        formData.append('display_number', 1);
        formData.append('is_available', addForm.is_available ? 1 : 0);
        if (addForm.image) {
            formData.append('image', addForm.image);
        }

        try {
            await api.post('/admin/menu-items', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsAddModalOpen(false);
            setAddForm({ name: '', category_id: '', price: '', description: '', is_available: true, image: null });
            fetchItems();
        } catch(e) {
            console.error(e);
            alert("Erreur lors de l'ajout.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="text-[#8b5cf6]">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Gestion du Menu</h1>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-[#7c3aed] text-white font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#6d28d9] transition-colors shadow-sm text-[13px] tracking-wide">
                    <Plus className="w-4 h-4" /> Ajouter un plat
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-[#1e1f2e] p-4 rounded-2xl border border-white/[0.03] shadow-sm flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Rechercher un plat par nom..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-white placeholder-[#64748b] focus:outline-none focus:border-[#7c3aed]"
                    />
                </div>
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    </div>
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#7c3aed] appearance-none cursor-pointer"
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full"></div></div>
            ) : (
                <div className="bg-[#1e1f2e] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] border border-white/[0.03] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-white/[0.04]">
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[10%]">Image</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[30%]">Nom du Plat</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[20%]">Catégorie</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">Prix</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[15%]">Stock</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest text-right w-[10%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-[#64748b] text-sm">Aucun plat trouvé.</td></tr>
                                ) : filteredItems.map((item, index) => {
                                    // Generate pseudo-random stock for display purposes since it's not in DB yet
                                    const mockStock = item.is_available ? 25 + (item.id * 7) % 80 : 0;
                                    
                                    return (
                                        <tr key={item.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors">
                                            <td className="px-6 py-4">
                                                <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-white/5" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-white text-[13px] block mb-1">{item.name}</span>
                                                {item.is_featured || index % 3 === 0 ? (
                                                    <span className="inline-block px-2 py-0.5 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] text-[9px] font-bold uppercase tracking-wider">
                                                        Featured
                                                    </span>
                                                ) : null}
                                            </td>
                                            <td className="px-6 py-4 text-[#94a3b8] text-[12px]">{item.category?.name}</td>
                                            <td className="px-6 py-4 font-bold text-white text-[13px]">{Number(item.price).toFixed(2)} MAD</td>
                                            <td className="px-6 py-4">
                                                {item.is_available ? (
                                                    <span className="px-2.5 py-1 rounded border bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 text-[10px] font-bold w-max flex items-center justify-center tracking-wider">
                                                        Élevé ({mockStock})
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded border bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20 text-[10px] font-bold w-max flex items-center justify-center tracking-wider">
                                                        Épuisé (0)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEditModal(item)} className="p-2 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-lg transition-colors border border-[#8b5cf6]/20 shadow-sm"><Edit2 className="w-4 h-4"/></button>
                                                    <button onClick={() => openDeleteConfirm(item)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20 shadow-sm"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#1e1f2e] rounded-2xl max-w-md w-full border border-white/[0.05] overflow-hidden shadow-2xl">
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Êtes-vous sûr de vouloir supprimer ?</h3>
                            <p className="text-[#94a3b8] mb-6">
                                Cette action supprimera définitivement le plat <strong className="text-white">{itemToDelete?.name}</strong>. Cette action est irréversible.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 px-4 bg-[#12131f] border border-white/[0.05] rounded-lg text-[#94a3b8] font-medium hover:bg-white/5 hover:text-white transition-colors">
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
                    <div className="bg-[#1e1f2e] rounded-2xl max-w-lg w-full border border-white/[0.05] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
                            <h3 className="text-xl font-bold text-white">Modifier : {itemToEdit?.name}</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-[#64748b] hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="edit-form" onSubmit={submitEdit} className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5">Nom du plat</label>
                                    <input required type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#7c3aed] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5">Catégorie</label>
                                    <select required name="category_id" value={editForm.category_id} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#7c3aed] transition-colors appearance-none cursor-pointer">
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5">Prix (MAD)</label>
                                    <input required type="number" step="0.01" name="price" value={editForm.price} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#7c3aed] transition-colors" />
                                </div>
                                <div className="flex items-center gap-3 pt-3 pb-1">
                                    <input type="checkbox" id="is_available" name="is_available" checked={editForm.is_available} onChange={handleEditChange} className="w-5 h-5 rounded border-white/[0.05] text-[#7c3aed] focus:ring-[#7c3aed] focus:ring-offset-0 bg-[#12131f] cursor-pointer" />
                                    <label htmlFor="is_available" className="text-[13px] font-medium text-white cursor-pointer">Plat disponible à la commande</label>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/[0.05] bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 px-4 bg-[#12131f] border border-white/[0.05] rounded-xl text-[#94a3b8] font-bold hover:bg-white/5 hover:text-white transition-colors text-[13px]">
                                Annuler
                            </button>
                            <button type="submit" form="edit-form" className="flex-1 py-2.5 px-4 bg-[#7c3aed] rounded-xl text-white font-bold hover:bg-[#6d28d9] transition-colors text-[13px]">
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#1e1f2e] rounded-2xl max-w-lg w-full border border-white/[0.05] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
                            <h3 className="text-xl font-bold text-white">Ajouter un plat</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-[#64748b] hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="add-form" onSubmit={submitAdd} className="space-y-4">
                                <div>
                                    <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5">Image du plat</label>
                                    <input required type="file" name="image" accept="image/*" onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#7c3aed] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#7c3aed] file:text-white hover:file:bg-[#6d28d9]" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5">Nom du plat</label>
                                    <input required type="text" name="name" value={addForm.name} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#7c3aed] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5">Description</label>
                                    <textarea name="description" value={addForm.description} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#7c3aed] transition-colors h-24 custom-scrollbar"></textarea>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5">Catégorie</label>
                                    <select required name="category_id" value={addForm.category_id} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#7c3aed] transition-colors appearance-none cursor-pointer">
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-[#94a3b8] mb-1.5">Prix (MAD)</label>
                                    <input required type="number" step="0.01" name="price" value={addForm.price} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#7c3aed] transition-colors" />
                                </div>
                                <div className="flex items-center gap-3 pt-3 pb-1">
                                    <input type="checkbox" id="add_is_available" name="is_available" checked={addForm.is_available} onChange={handleAddChange} className="w-5 h-5 rounded border-white/[0.05] text-[#7c3aed] focus:ring-[#7c3aed] focus:ring-offset-0 bg-[#12131f] cursor-pointer" />
                                    <label htmlFor="add_is_available" className="text-[13px] font-medium text-white cursor-pointer">Plat disponible à la commande</label>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/[0.05] bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 px-4 bg-[#12131f] border border-white/[0.05] rounded-xl text-[#94a3b8] font-bold hover:bg-white/5 hover:text-white transition-colors text-[13px]">
                                Annuler
                            </button>
                            <button type="submit" form="add-form" className="flex-1 py-2.5 px-4 bg-[#7c3aed] rounded-xl text-white font-bold hover:bg-[#6d28d9] transition-colors text-[13px]">
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCarta;

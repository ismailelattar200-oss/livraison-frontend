import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, AlertTriangle, Upload, X, Edit2 } from 'lucide-react';

const AdminGaleria = () => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editForm, setEditForm] = useState({
        category: 'galeria'
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        category: 'galeria',
        image: null
    });

    const fetchPhotos = () => {
        api.get('/admin/gallery')
            .then(res => setPhotos(res.data.data || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPhotos(); }, []);

    // --- Delete Logic ---
    const openDeleteConfirm = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/admin/gallery/${itemToDelete.id}`);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchPhotos();
        } catch(e) { console.error(e) }
    };

    // --- Edit Logic ---
    const openEditModal = (item) => {
        setItemToEdit(item);
        setEditForm({
            category: item.category
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm({ ...editForm, [name]: value });
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/gallery/${itemToEdit.id}`, editForm);
            setIsEditModalOpen(false);
            setItemToEdit(null);
            fetchPhotos();
        } catch(e) { console.error(e) }
    };

    // --- Add Logic ---
    const handleAddChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setAddForm({ ...addForm, image: files[0] });
        } else {
            setAddForm({ ...addForm, [name]: value });
        }
    };

    const submitAdd = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('category', addForm.category);
        formData.append('display_order', 1);
        if (addForm.image) formData.append('image', addForm.image);

        try {
            await api.post('/admin/gallery', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsAddModalOpen(false);
            setAddForm({ category: 'galeria', image: null });
            fetchPhotos();
        } catch(e) {
            console.error(e);
            alert("Erreur lors de l'ajout.");
        }
    };

    const categoryLabels = {
        galeria: 'Espace & Gastronomie',
        personal: 'Notre Équipe',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center mb-6">
                <button onClick={() => setIsAddModalOpen(true)} className="bg-[#8b5cf6] text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#7c3aed] transition-colors shadow-sm">
                    <Upload className="w-5 h-5" /> Téléverser une photo
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full"></div></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {photos.length === 0 ? (
                        <div className="col-span-full bg-[#1e1f2e] border border-white/5 rounded-2xl p-12 text-center text-gray-500 text-lg shadow-xl shadow-black/40">
                            Aucune photo dans la galerie.
                        </div>
                    ) : photos.map(photo => (
                        <div key={photo.id} className="relative group rounded-2xl overflow-hidden border border-white/5 bg-[#1e1f2e] shadow-xl shadow-black/40">
                            <img src={photo.image_url} alt="Galerie" className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity backdrop-blur-sm">
                                <button 
                                    onClick={() => openEditModal(photo)}
                                    className="bg-[#8b5cf6]/80 text-white p-3 rounded-full hover:bg-[#8b5cf6] transition-colors shadow-lg backdrop-blur-sm"
                                >
                                    <Edit2 className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={() => openDeleteConfirm(photo)}
                                    className="bg-red-500/80 text-white p-3 rounded-full hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-[#12131f]/90 text-gray-300 text-[10px] font-bold uppercase tracking-widest py-4 px-4 text-center truncate backdrop-blur-md border-t border-white/10">
                                {categoryLabels[photo.category] || photo.category}
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
                            <h3 className="text-xl font-bold text-white mb-2">Supprimer la photo ?</h3>
                            <p className="text-gray-400 mb-6">
                                Cette photo sera définitivement retirée de la galerie.
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
                            <h3 className="text-xl font-bold text-white">Modifier la catégorie</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="edit-photo-form" onSubmit={submitEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Catégorie</label>
                                    <select name="category" value={editForm.category} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]">
                                        <option value="galeria">Espace & Gastronomie</option>
                                        <option value="personal">Notre Équipe</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 px-4 bg-[#12131f] border border-white/10 rounded-lg text-white font-medium hover:bg-white/5 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" form="edit-photo-form" className="flex-1 py-2 px-4 bg-[#8b5cf6] rounded-lg text-white font-bold hover:bg-[#7c3aed] transition-colors">
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
                            <h3 className="text-xl font-bold text-white">Téléverser une photo</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="add-photo-form" onSubmit={submitAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Image</label>
                                    <input required type="file" name="image" accept="image/*" onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Catégorie</label>
                                    <select name="category" value={addForm.category} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]">
                                        <option value="galeria">Espace & Gastronomie</option>
                                        <option value="personal">Notre Équipe</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 px-4 bg-[#12131f] border border-white/10 rounded-lg text-white font-medium hover:bg-white/5 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" form="add-photo-form" className="flex-1 py-2 px-4 bg-[#8b5cf6] rounded-lg text-white font-bold hover:bg-[#7c3aed] transition-colors">
                                Téléverser
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGaleria;

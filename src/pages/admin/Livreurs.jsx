import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, AlertTriangle, Bike, Eye, EyeOff } from 'lucide-react';

const AdminLivreurs = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        vehicle: '',
        role: 'delivery'
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        vehicle: '',
        role: 'delivery',
        avatar: null
    });

    const fetchUsers = () => {
        api.get('/admin/users')
            .then(res => {
                const deliveryDrivers = (res.data.data || []).filter(u => u.role === 'delivery');
                setUsers(deliveryDrivers);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    // --- Delete Logic ---
    const openDeleteConfirm = (item) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/admin/users/${itemToDelete.id}`);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
            fetchUsers();
        } catch(e) { console.error(e); }
    };

    // --- Edit Logic ---
    const openEditModal = (item) => {
        setItemToEdit(item);
        setEditForm({
            name: item.name,
            email: item.email,
            password: '',
            phone: item.phone || '',
            vehicle: item.vehicle || '',
            role: 'delivery'
        });
        setShowEditPassword(false);
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...editForm };
            if (!payload.password || payload.password.trim() === '') {
                delete payload.password;
            }
            await api.put(`/admin/users/${itemToEdit.id}`, payload);
            setIsEditModalOpen(false);
            setItemToEdit(null);
            fetchUsers();
        } catch(e) { console.error(e); }
    };

    // --- Add Logic ---
    const handleAddChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setAddForm({ ...addForm, avatar: files[0] });
        } else {
            setAddForm({ ...addForm, [name]: value });
        }
    };

    const submitAdd = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', addForm.name);
        formData.append('email', addForm.email);
        formData.append('password', addForm.password);
        if (addForm.phone) formData.append('phone', addForm.phone);
        if (addForm.vehicle) formData.append('vehicle', addForm.vehicle);
        formData.append('role', addForm.role);
        if (addForm.avatar) formData.append('avatar', addForm.avatar);

        try {
            await api.post('/admin/users', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsAddModalOpen(false);
            setAddForm({ name: '', email: '', password: '', phone: '', vehicle: '', role: 'delivery', avatar: null });
            fetchUsers();
        } catch(e) {
            console.error(e);
            alert("Erreur lors de la création.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end items-center mb-6">
                <button onClick={() => setIsAddModalOpen(true)} className="bg-[#8b5cf6] text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#7c3aed] transition-colors shadow-sm">
                    <Plus className="w-5 h-5" /> Ajouter un livreur
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-[#8b5cf6] border-t-transparent rounded-full"></div></div>
            ) : (
                <div className="bg-[#1e1f2e] rounded-2xl shadow-xl shadow-black/40 border border-white/5 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#12131f]/30 border-b border-white/10">
                                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Livreur</th>
                                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Statut</th>
                                <th className="px-6 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.length === 0 ? (
                                <tr><td colSpan="4" className="p-12 text-center text-gray-500 text-lg">Aucun livreur trouvé.</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-6 font-bold text-white text-base flex items-center gap-4">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-6 text-base text-gray-400">{user.email}</td>
                                    <td className="px-6 py-6">
                                        <span className="px-4 py-1.5 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 rounded-md text-xs font-bold uppercase tracking-widest w-max">Actif</span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => openEditModal(user)} className="p-3 bg-[#8b5cf6]/10 text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white rounded-lg transition-colors shadow-sm"><Edit2 className="w-5 h-5"/></button>
                                            <button onClick={() => openDeleteConfirm(user)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors shadow-sm"><Trash2 className="w-5 h-5"/></button>
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
                            <h3 className="text-xl font-bold text-white mb-2">Supprimer le livreur ?</h3>
                            <p className="text-gray-400 mb-6">
                                Le compte de <strong className="text-white">{itemToDelete?.name}</strong> sera définitivement supprimé.
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
                            <form id="edit-user-form" onSubmit={submitEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nom complet</label>
                                    <input required type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                    <input required type="email" name="email" value={editForm.email} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Téléphone</label>
                                    <input type="text" name="phone" value={editForm.phone} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Véhicule</label>
                                    <input type="text" name="vehicle" value={editForm.vehicle} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nouveau mot de passe <span className="text-[11px] text-[#64748b]">(Optionnel)</span></label>
                                    <div className="relative">
                                        <input type={showEditPassword ? "text" : "password"} name="password" minLength={6} value={editForm.password || ''} onChange={handleEditChange} placeholder="Laisser vide si inchangé" className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6] pr-12" />
                                        <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                                            {showEditPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 px-4 bg-[#12131f] border border-white/10 rounded-lg text-white font-medium hover:bg-white/5 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" form="edit-user-form" className="flex-1 py-2 px-4 bg-[#8b5cf6] rounded-lg text-white font-bold hover:bg-[#7c3aed] transition-colors">
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
                            <h3 className="text-xl font-bold text-white">Ajouter un Livreur</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="add-user-form" onSubmit={submitAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Photo de profil</label>
                                    <input type="file" name="avatar" accept="image/*" onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Nom complet</label>
                                    <input required type="text" name="name" value={addForm.name} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                                    <input required type="email" name="email" value={addForm.email} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Téléphone</label>
                                    <input type="text" name="phone" value={addForm.phone} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Véhicule</label>
                                    <input type="text" name="vehicle" value={addForm.vehicle} onChange={handleAddChange} placeholder="Ex: Moto Yamaha" className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Mot de passe</label>
                                    <div className="relative">
                                        <input required type={showPassword ? "text" : "password"} name="password" minLength={6} value={addForm.password} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#8b5cf6] pr-12" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2 px-4 bg-[#12131f] border border-white/10 rounded-lg text-white font-medium hover:bg-white/5 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" form="add-user-form" className="flex-1 py-2 px-4 bg-[#8b5cf6] rounded-lg text-white font-bold hover:bg-[#7c3aed] transition-colors">
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLivreurs;

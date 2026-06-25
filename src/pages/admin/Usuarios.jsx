import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, X, AlertTriangle, User, Shield } from 'lucide-react';

const AdminUsuarios = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: ''
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        avatar: null
    });

    const fetchUsers = () => {
        api.get('/admin/users')
            .then(res => setUsers(res.data.data || []))
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
        } catch(e) { 
            console.error(e); 
            alert("Erreur lors de la suppression. " + (e.response?.data?.message || ''));
        }
    };

    // --- Edit Logic ---
    const openEditModal = (item) => {
        setItemToEdit(item);
        setEditForm({
            name: item.name,
            email: item.email,
            role: item.role
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const submitEdit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${itemToEdit.id}`, editForm);
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
        formData.append('role', addForm.role);
        if (addForm.avatar) formData.append('avatar', addForm.avatar);

        try {
            await api.post('/admin/users', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsAddModalOpen(false);
            setAddForm({ name: '', email: '', password: '', role: 'customer', avatar: null });
            fetchUsers();
        } catch(e) {
            console.error(e);
            alert("Erreur lors de la création.");
        }
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'admin': return <span className="px-2.5 py-1 bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max"><Shield className="w-3 h-3"/> Admin</span>;
            case 'delivery': return <span className="px-2.5 py-1 bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20 rounded-md text-[10px] font-bold uppercase tracking-wider w-max">Livreur</span>;
            case 'staff': return <span className="px-2.5 py-1 bg-[#64748b]/10 text-[#64748b] border border-[#64748b]/20 rounded-md text-[10px] font-bold uppercase tracking-wider w-max">Staff</span>;
            default: return <span className="px-2.5 py-1 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 rounded-md text-[10px] font-bold uppercase tracking-wider w-max">Client</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center border border-[#8b5cf6]/20">
                        <User className="w-5 h-5 text-[#8b5cf6]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h1>
                        <p className="text-[13px] text-[#64748b] mt-0.5">Gérez les accès et les rôles de votre équipe</p>
                    </div>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-[#7c3aed] text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#6d28d9] transition-colors shadow-sm text-[13px]">
                    <Plus className="w-4 h-4" /> Ajouter un utilisateur
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full"></div></div>
            ) : (
                <div className="bg-[#1e1f2e] rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] border border-white/[0.03] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-white/[0.04]">
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[30%]">Utilisateur</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[35%]">Email</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest w-[20%]">Rôle</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-[#64748b] uppercase tracking-widest text-right w-[15%]">Actions</th>
                                </tr>
                            </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {users.length === 0 ? (
                                <tr><td colSpan="4" className="p-12 text-center text-[#64748b] text-sm">Aucun utilisateur trouvé.</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-4 font-bold text-white text-[13px] flex items-center gap-4">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-white/10 shadow-sm" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white font-bold text-[13px] shadow-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 text-[13px] text-[#94a3b8]">{user.email}</td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(user)} className="p-2 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-lg transition-colors border border-[#8b5cf6]/20 shadow-sm"><Edit2 className="w-4 h-4"/></button>
                                            <button onClick={() => openDeleteConfirm(user)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20 shadow-sm"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1e1f2e] rounded-2xl max-w-md w-full border border-white/[0.05] overflow-hidden shadow-2xl">
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Supprimer le compte ?</h3>
                            <p className="text-[#94a3b8] text-[13px] mb-6">
                                Le compte de <strong className="text-white">{itemToDelete?.name}</strong> sera définitivement supprimé.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 px-4 bg-[#12131f] border border-white/[0.05] rounded-xl text-white font-medium hover:bg-white/5 transition-colors text-[13px]">
                                    Annuler
                                </button>
                                <button onClick={confirmDelete} className="flex-1 py-3 px-4 bg-red-500 rounded-xl text-white font-bold hover:bg-red-600 transition-colors shadow-[0_4px_20px_-4px_rgba(239,68,68,0.5)] text-[13px]">
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1e1f2e] rounded-2xl max-w-lg w-full border border-white/[0.05] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
                            <h3 className="text-xl font-bold text-white">Modifier : {itemToEdit?.name}</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-[#64748b] hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="edit-user-form" onSubmit={submitEdit} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Nom complet</label>
                                    <input required type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#7c3aed] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Email</label>
                                    <input required type="email" name="email" value={editForm.email} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#7c3aed] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Rôle</label>
                                    <select name="role" value={editForm.role} onChange={handleEditChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#7c3aed] transition-colors outline-none cursor-pointer">
                                        <option value="customer">Client</option>
                                        <option value="delivery">Livreur</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Administrateur</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/[0.05] bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2.5 px-4 bg-[#12131f] border border-white/[0.05] rounded-xl text-white font-medium hover:bg-white/5 transition-colors text-[13px]">
                                Annuler
                            </button>
                            <button type="submit" form="edit-user-form" className="flex-1 py-2.5 px-4 bg-[#7c3aed] rounded-xl text-white font-bold hover:bg-[#6d28d9] transition-colors shadow-[0_4px_20px_-4px_rgba(124,58,237,0.5)] text-[13px]">
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1e1f2e] rounded-2xl max-w-lg w-full border border-white/[0.05] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
                            <h3 className="text-xl font-bold text-white">Ajouter un Utilisateur</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-[#64748b] hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="add-user-form" onSubmit={submitAdd} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Photo de profil</label>
                                    <input type="file" name="avatar" accept="image/*" onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2 text-[#94a3b8] text-[13px] focus:outline-none focus:border-[#7c3aed] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:uppercase file:tracking-wider file:bg-[#8b5cf6]/10 file:text-[#8b5cf6] hover:file:bg-[#8b5cf6]/20 file:cursor-pointer" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Nom complet</label>
                                    <input required type="text" name="name" value={addForm.name} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#7c3aed] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Email</label>
                                    <input required type="email" name="email" value={addForm.email} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#7c3aed] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Mot de passe</label>
                                    <input required type="password" name="password" minLength={6} value={addForm.password} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#7c3aed] transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Rôle</label>
                                    <select name="role" value={addForm.role} onChange={handleAddChange} className="w-full bg-[#12131f] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#7c3aed] transition-colors outline-none cursor-pointer">
                                        <option value="customer">Client</option>
                                        <option value="delivery">Livreur</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Administrateur</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-white/[0.05] bg-[#1e1f2e] flex gap-3">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 px-4 bg-[#12131f] border border-white/[0.05] rounded-xl text-white font-medium hover:bg-white/5 transition-colors text-[13px]">
                                Annuler
                            </button>
                            <button type="submit" form="add-user-form" className="flex-1 py-2.5 px-4 bg-[#7c3aed] rounded-xl text-white font-bold hover:bg-[#6d28d9] transition-colors shadow-[0_4px_20px_-4px_rgba(124,58,237,0.5)] text-[13px]">
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsuarios;

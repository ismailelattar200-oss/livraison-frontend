import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, ShoppingCart, Truck, Bike, Utensils, 
    Tags, Image as ImageIcon, Calendar, Briefcase, MessageSquare, 
    Users, Settings, Search, Bell, ChevronDown, LogOut, User, Package, X
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Menu', path: '/admin/menu', icon: Utensils },
        { name: 'Commandes', path: '/admin/pedidos', icon: ShoppingCart },
    ];

    // Other links not in the main image but exist in the app
    const otherItems = [
        { name: 'Livraisons', path: '/admin/repartos', icon: Truck },
        { name: 'Livreurs', path: '/admin/livreurs', icon: Bike },
        { name: 'Catégories', path: '/admin/categorias', icon: Tags },
        { name: 'Galerie', path: '/admin/galeria', icon: ImageIcon },
        { name: 'Événements', path: '/admin/eventos', icon: Calendar },
        { name: 'Candidatures', path: '/admin/candidaturas', icon: Briefcase },
        { name: 'Messages', path: '/admin/mensajes', icon: MessageSquare },
        { name: 'Utilisateurs', path: '/admin/usuarios', icon: Users },
        { name: 'Paramètres', path: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#12131f] flex font-sans text-[#e2e8f0]">
            {/* Sidebar (Fixed width ~260px) */}
            <aside className="w-[260px] bg-gradient-to-b from-[#1c1d30] to-[#2e2821] text-[#e2e8f0] flex flex-col fixed h-full z-20 border-r border-white/[0.04]">
                {/* Logo Area */}
                <div className="h-[80px] flex items-center px-8 border-b border-white/[0.04]">
                    <Link to="/admin" className="flex items-center gap-3">
                        <span className="font-bold text-xl tracking-wider text-white uppercase">
                            MAREA
                        </span>
                        <span className="bg-[#1e1b4b] text-[#818cf8] text-[10px] font-bold px-2.5 py-1 rounded-md">
                            ADMIN
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-5 flex flex-col gap-2 custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                                    isActive 
                                    ? 'bg-[#6d28d9] text-white shadow-[0_4px_20px_-4px_rgba(109,40,217,0.5)]' 
                                    : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.02]'
                                }`}
                            >
                                <item.icon className={`w-[20px] h-[20px] ${isActive ? 'text-white' : 'text-[#64748b] group-hover:text-white'}`} />
                                <span className="text-[14.5px] font-semibold">{item.name}</span>
                            </Link>
                        );
                    })}
                    {otherItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const isSettings = item.name === 'Utilisateurs';
                        return (
                            <div key={item.name}>
                                {isSettings && <div className="my-3 border-t border-white/[0.04] mx-2"></div>}
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                                        isActive 
                                        ? 'bg-[#6d28d9] text-white shadow-[0_4px_20px_-4px_rgba(109,40,217,0.5)]' 
                                        : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.02]'
                                    }`}
                                >
                                <item.icon className={`w-[20px] h-[20px] ${isActive ? 'text-white' : 'text-[#64748b] group-hover:text-white'}`} />
                                <span className="text-[14.5px] font-semibold">{item.name}</span>
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Actions */}
                <div className="p-5 mt-auto border-t border-white/[0.04]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
                    >
                        <LogOut className="w-[20px] h-[20px]" />
                        <span className="text-[14.5px] font-semibold">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[260px] flex flex-col min-h-screen min-w-0 bg-[#12131f]">
                {/* Top Bar */}
                <header className="h-[80px] flex items-center justify-between px-8 sticky top-0 z-10 bg-[#12131f]/95 backdrop-blur-md border-b border-white/[0.04]">
                    {/* Page Title */}
                    <div>
                        <h1 className="text-xl font-bold text-white">Dashboard</h1>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        {/* Search Input */}
                        <div className="relative group w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#64748b] group-focus-within:text-[#818cf8] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Rechercher..." 
                                className="w-full bg-[#1e1f2e] border border-white/[0.02] focus:border-[#6d28d9]/50 focus:bg-[#1e1f2e] rounded-full pl-11 pr-4 py-2.5 text-[14px] text-white outline-none transition-all placeholder-[#64748b]"
                            />
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                className="relative p-2.5 bg-[#1e1f2e] rounded-full text-[#94a3b8] hover:text-white transition-colors border border-white/[0.02]"
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            >
                                <Bell className="w-[18px] h-[18px]" />
                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                                    <div className="absolute right-0 mt-4 w-80 bg-[#1e1f2e] rounded-xl border border-white/[0.05] shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                                            <h3 className="text-[14px] font-bold text-white">Notifications</h3>
                                            <span className="text-[11px] font-bold bg-[#8b5cf6] text-white px-2 py-0.5 rounded-full">2</span>
                                        </div>
                                        
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                            {/* Stock Faible Alert */}
                                            <Link 
                                                to="/admin/menu" 
                                                onClick={() => setIsNotificationsOpen(false)} 
                                                className="px-4 py-3 border-b border-white/[0.02] hover:bg-white/[0.02] cursor-pointer transition-colors block"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 flex items-center justify-center shrink-0">
                                                        <Package className="w-4 h-4 text-[#f59e0b]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] text-white font-bold">Alerte Stock Faible</p>
                                                        <p className="text-[12px] text-[#94a3b8] mt-0.5 leading-snug">3 plats ont un stock inférieur à 50. Cliquez ici pour voir le catalogue.</p>
                                                    </div>
                                                </div>
                                            </Link>

                                            {/* Commande */}
                                            <div className="px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors block">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center shrink-0">
                                                        <ShoppingCart className="w-4 h-4 text-[#10b981]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] text-white font-bold">Nouvelle commande</p>
                                                        <p className="text-[12px] text-[#94a3b8] mt-0.5 leading-snug">La commande #MAR-2026 vient d'être passée.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-4 py-2 border-t border-white/[0.05] text-center">
                                            <button 
                                                onClick={() => setIsNotificationsOpen(false)}
                                                className="text-[12px] font-bold text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
                                            >
                                                Tout marquer comme lu
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <div 
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full object-cover shadow-sm border border-white/10" />
                                ) : (
                                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=6d28d9&color=fff`} alt="User" className="w-9 h-9 rounded-full object-cover shadow-sm border border-white/10" />
                                )}
                                <div className="text-left hidden md:block">
                                    <p className="text-[14px] font-bold text-white leading-tight">{user?.name || 'Admin'}</p>
                                    <p className="text-[12px] text-[#64748b] font-medium">{user?.role || 'Administrateur'}</p>
                                </div>
                                <ChevronDown className={`w-[16px] h-[16px] text-[#64748b] ml-1 group-hover:text-white transition-all ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </div>

                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-4 w-48 bg-[#1e1f2e] rounded-xl border border-white/[0.05] shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Link 
                                            to="/admin/settings" 
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#cbd5e1] hover:text-white hover:bg-white/[0.02] transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <User className="w-[18px] h-[18px]" />
                                            Profil
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut className="w-[18px] h-[18px]" />
                                            Déconnexion
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-8 min-w-0">
                    <Outlet />
                </div>
            </main>

            {/* Scoped Custom Scrollbar CSS for sidebar */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;


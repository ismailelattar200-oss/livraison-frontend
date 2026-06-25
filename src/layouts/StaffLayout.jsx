import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, Truck, Package, BarChart3, Settings, LogOut, ChevronDown } from 'lucide-react';

const StaffLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/staff', icon: LayoutGrid },
        { name: 'Livreurs', path: '/staff/livreurs', icon: Truck },
        { name: 'Commandes', path: '/staff/commandes', icon: Package },
        { name: 'Statistiques', path: '/staff/statistiques', icon: BarChart3 },
        { name: 'Paramètres', path: '/staff/parametres', icon: Settings }
    ];

    const pageTitle = location.pathname === '/staff' ? 'Dashboard' :
                      location.pathname.includes('livreurs') ? 'Livreurs' :
                      location.pathname.includes('commandes') ? 'Commandes' :
                      location.pathname.includes('statistiques') ? 'Statistiques' :
                      location.pathname.includes('parametres') ? 'Paramètres' : '';

    return (
        <div className="min-h-screen bg-[#0b0c10] flex font-sans text-white">
            {/* Sidebar (Fixed width ~260px) */}
            <aside className="w-[260px] bg-[#111116] text-white flex flex-col fixed h-full z-20 border-r border-white/5">
                {/* Logo Area */}
                <div className="h-[80px] flex items-center px-6">
                    <Link to="/staff" className="flex items-center gap-2">
                        <span className="font-display text-2xl font-black text-white tracking-tight">MAREA</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-[#1e1539] text-[#7c51ff] border border-[#2d1f56]">
                            STAFF
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-4 px-4 flex flex-col gap-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/staff' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all group ${
                                    isActive 
                                    ? 'bg-[#5B41D8] text-white shadow-[0_0_15px_rgba(91,65,216,0.3)]' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-[15px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Profile Info */}
                <div className="px-4 pb-6 mt-auto">
                    <div className="bg-[#181625] rounded-xl p-4 flex items-center gap-3 mb-4 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-[#111116] flex items-center justify-center overflow-hidden border border-white/10">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-gray-400">{user?.name?.charAt(0) || 'S'}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'Staff'}</p>
                            <p className="text-xs font-medium text-[#7c5ce6]">Staff</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-3 w-full p-4 rounded-xl bg-[#22151b] text-[#f45b69] hover:bg-[#2c171e] transition-colors border border-red-900/20 font-medium text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-[260px] flex flex-col min-h-screen min-w-0 bg-[#0a0a0e]">
                {/* Top Header */}
                <header className="h-[80px] flex items-center justify-between px-8 bg-transparent">
                    <h1 className="text-xl font-bold text-white">{pageTitle}</h1>

                    <div className="flex items-center relative">
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="w-9 h-9 rounded-full bg-[#181625] flex items-center justify-center overflow-hidden border border-white/10">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-gray-400 text-sm">{user?.name?.charAt(0) || 'S'}</span>
                                )}
                            </div>
                            <div className="hidden md:flex flex-col">
                                <span className="text-[13px] font-bold text-white leading-tight">{user?.name || 'Staff'}</span>
                                <span className="text-[11px] text-gray-500 font-medium">Staff</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors ml-1" />
                        </div>

                        {isProfileOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#111116] border border-white/5 rounded-xl shadow-xl py-2 z-50">
                                <Link to="/staff/parametres" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                                    <Settings className="w-4 h-4" /> Paramètres
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#f45b69] hover:bg-white/5 transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4" /> Déconnexion
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-8 pt-2 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StaffLayout;

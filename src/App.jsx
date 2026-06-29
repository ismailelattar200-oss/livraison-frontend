import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';

// Public Pages
import Home from './pages/public/Home';
import Carta from './pages/public/Carta';
import Pedido from './pages/public/Pedido';
import Seguimiento from './pages/public/Seguimiento';
import Galeria from './pages/public/Galeria';
import Nosotros from './pages/public/Nosotros';
import Eventos from './pages/public/Eventos';
import TrabajaConNosotros from './pages/public/TrabajaConNosotros';
import Contacto from './pages/public/Contacto';
import Login from './pages/public/Login';
import Inscription from './pages/public/Inscription';
import Profile from './pages/public/Profile';
import AuthCallback from './pages/public/AuthCallback';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import CuisineLayout from './layouts/CuisineLayout';
import LivreurLayout from './layouts/LivreurLayout';
import StaffLayout from './layouts/StaffLayout';

// Staff (Cuisine) Pages
import CuisineDashboard from './pages/staff/CuisineDashboard';
import CuisineCommandes from './pages/staff/CuisineCommandes';
import CuisineProfil from './pages/staff/CuisineProfil';

// Delivery Pages
import LivreurDashboard from './pages/delivery/LivreurDashboard';
import LivreurCommandes from './pages/delivery/LivreurCommandes';
import LivreurProfil from './pages/delivery/LivreurProfil';

// Staff Dashboard Pages (Dispatcher/Manager)
import StaffDashboard from './pages/manager/StaffDashboard';
import StaffLivreurs from './pages/manager/StaffLivreurs';
import StaffCommandes from './pages/manager/StaffCommandes';
import StaffStatistiques from './pages/manager/StaffStatistiques';
import StaffParametres from './pages/manager/StaffParametres';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminPedidos from './pages/admin/Pedidos';
import AdminRepartos from './pages/admin/Repartos';
import AdminCarta from './pages/admin/Carta';
import AdminCategorias from './pages/admin/Categorias';
import AdminGaleria from './pages/admin/Galeria';
import AdminEventos from './pages/admin/Eventos';
import AdminCandidaturas from './pages/admin/Candidaturas';
import AdminMensajes from './pages/admin/Mensajes';
import AdminLivreurs from './pages/admin/Livreurs';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminSettings from './pages/admin/Settings';
import NotificationToast from './components/NotificationToast';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-navy-deep flex items-center justify-center text-gold">Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      if (user.role === 'staff') return <Navigate to="/cuisine" />;
      if (user.role === 'delivery') return <Navigate to="/livreur" />;
      if (user.role === 'admin') return <Navigate to="/admin" />;
      return <Navigate to="/" />; // Fallback for customers
  }
  
  return children;
};

function App() {
  return (
    <FavoritesProvider>
      <NotificationToast />
      <Routes>
        {/* Public Routes with Navbar/Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Carta />} />
        <Route path="/pedido" element={<Pedido />} />
        <Route path="/seguimiento/:orderNumber" element={<Seguimiento />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/trabaja-con-nosotros" element={<TrabajaConNosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Login */}
      <Route path="/login" element={<Login />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="pedidos" element={<AdminPedidos />} />
        <Route path="repartos" element={<AdminRepartos />} />
        <Route path="menu" element={<AdminCarta />} />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="galeria" element={<AdminGaleria />} />
        <Route path="eventos" element={<AdminEventos />} />
        <Route path="candidaturas" element={<AdminCandidaturas />} />
        <Route path="mensajes" element={<AdminMensajes />} />
        <Route path="livreurs" element={<AdminLivreurs />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Cuisine Routes (Chef) */}
      <Route path="/cuisine" element={
        <ProtectedRoute allowedRoles={['admin', 'staff']}>
          <CuisineLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CuisineDashboard />} />
        <Route path="commandes" element={<CuisineCommandes />} />
        <Route path="parametres" element={<CuisineProfil />} />
      </Route>

      {/* Staff Dispatcher Routes */}
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <StaffLayout />
        </ProtectedRoute>
      }>
        <Route index element={<StaffDashboard />} />
        <Route path="livreurs" element={<StaffLivreurs />} />
        <Route path="commandes" element={<StaffCommandes />} />
        <Route path="statistiques" element={<StaffStatistiques />} />
        <Route path="parametres" element={<StaffParametres />} />
      </Route>

      {/* Delivery / Livreur Routes */}
      <Route path="/livreur" element={
        <ProtectedRoute allowedRoles={['admin', 'delivery']}>
          <LivreurLayout />
        </ProtectedRoute>
      }>
        <Route index element={<LivreurDashboard />} />
        <Route path="commandes" element={<LivreurCommandes />} />
        <Route path="parametres" element={<LivreurProfil />} />
      </Route>
      
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </FavoritesProvider>
  );
}

export default App;


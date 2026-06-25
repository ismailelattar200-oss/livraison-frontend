import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthCallback = () => {
    const { user, setToken } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (token) {
            localStorage.setItem('token', token);
            setToken(token);
        } else if (!user) {
            // No token and no user, probably direct access or error
            navigate('/login');
        }
    }, [location, setToken, navigate, user]);

    useEffect(() => {
        if (user) {
            // When user context is populated via the token, redirect accordingly
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'staff') {
                navigate('/cuisine');
            } else if (user.role === 'delivery') {
                navigate('/livreur');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white">
            <div className="animate-spin w-12 h-12 border-4 border-[#C9A84C] border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-500 font-medium">Authentification en cours...</p>
        </div>
    );
};

export default AuthCallback;

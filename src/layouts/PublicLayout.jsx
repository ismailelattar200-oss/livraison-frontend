import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import AIAssistantWidget from '../components/AIAssistantWidget';
import WhatsAppWidget from '../components/WhatsAppWidget';

const PublicLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />
            <CartDrawer />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <AIAssistantWidget />
            <WhatsAppWidget />
        </div>
    );
};

export default PublicLayout;

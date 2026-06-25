import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Users, MapPin } from 'lucide-react';

const Eventos = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formStatus, setFormStatus] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        api.getEvents()
            .then(res => {
                let data = res.data.data;
                // Add a 6th event if there are 5 to fill the empty space next to the 20th
                if (data.length === 5) {
                    data.push({
                        id: 999,
                        title: 'Soirée VIP : Saveurs de l\'Océan',
                        description: 'Un voyage culinaire autour des meilleurs fruits de mer, préparés avec une touche marocaine. Animation musicale exclusive et ambiance luxueuse.',
                        image_url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&q=80',
                        event_date: '2026-07-28T21:00:00Z',
                        capacity: 20
                    });
                }
                setEvents(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const openReservation = (event) => {
        setSelectedEvent(event);
        setFormData(prev => ({
            ...prev,
            message: `Bonjour, je souhaiterais réserver des places pour l'événement "${event.title}" du ${new Date(event.event_date).toLocaleDateString('fr')}.`
        }));
        setTimeout(() => {
            document.getElementById('reserva-form').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('sending');
        try {
            await api.submitContact(formData);
            setFormStatus('success');
            setFormData({ name: '', email: '', message: '' });
            setSelectedEvent(null);
        } catch (err) {
            setFormStatus('error');
        }
    };

    return (
        <div className="bg-cream min-h-screen pt-20">
            <div className="section-header pt-24 pb-16">
                <span className="eyebrow">EXPÉRIENCES UNIQUES</span>
                <h1 className="section-title">Événements</h1>
                <p className="section-subtitle">
                    Soirées thématiques, dégustations accordées et musique live. Vivez MAREA au-delà du menu.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loading ? (
                    <div className="flex justify-center py-24"><div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full"></div></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                        {events.map((event, index) => {
                            const date = new Date(event.event_date);
                            return (
                                <div 
                                    key={event.id} 
                                    className="bg-white rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group flex flex-col h-full border border-gray-100 animate-[fadeSlideUp_0.5s_ease-out_both]"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="relative h-64 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={event.image_url} 
                                            alt={event.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-navy-deep/0 group-hover:bg-navy-deep/20 transition-colors duration-500 z-0"></div>
                                        
                                        {/* Date Badge (Premium Glassmorphism) */}
                                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg text-center z-10 border border-white/20 group-hover:-translate-y-1 transition-transform duration-300">
                                            <span className="block text-navy-deep font-bold text-2xl md:text-3xl leading-none">{date.getDate()}</span>
                                            <span className="block text-navy-deep/80 text-xs font-bold uppercase tracking-wider mt-1">{date.toLocaleString('fr', { month: 'short' })}</span>
                                        </div>

                                        {/* Info Gradient Bottom (For Time and Capacity) */}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep via-navy-deep/80 to-transparent p-6 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <div className="flex justify-between items-end text-white">
                                                <span className="flex items-center gap-2 text-sm md:text-base font-medium">
                                                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gold"/> 
                                                    {date.toLocaleTimeString('fr', {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                                {event.capacity && (
                                                    <span className="flex items-center gap-2 text-sm text-gray-300">
                                                        <Users className="w-4 h-4 text-gold/70"/> {event.capacity} places
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 md:p-8 flex flex-col flex-grow relative z-20 bg-white">
                                        <h3 className="font-display text-2xl md:text-3xl text-navy-deep mb-4 group-hover:text-gold transition-colors duration-300">
                                            {event.title}
                                        </h3>
                                        <p className="text-gray-600 font-light mb-8 flex-grow leading-relaxed">
                                            {event.description}
                                        </p>
                                        <button 
                                            onClick={() => openReservation(event)}
                                            className="w-full border-2 border-navy-deep text-navy-deep py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-navy-deep hover:text-white transition-all duration-300 mt-auto group/btn shadow-sm hover:shadow-md text-sm md:text-base"
                                        >
                                            <Calendar className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                                            Demander une réservation
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Reservation Form */}
                {/* Reservation Form */}
                <div id="reserva-form" className="max-w-5xl mx-auto bg-white p-8 md:p-14 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden border border-gray-100">
                    <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-gold to-amber"></div>
                    <div className="pl-4">
                        <h2 className="font-display text-4xl text-navy-deep mb-3">Réservez votre expérience</h2>
                        <p className="text-gray-500 mb-10 text-lg font-light">
                            {selectedEvent 
                                ? <span className="text-gold font-medium">Événement sélectionné : {selectedEvent.title}</span>
                                : 'Vous pouvez aussi louer notre espace pour des événements privés ou professionnels.'}
                        </p>

                        {formStatus === 'success' ? (
                            <div className="bg-cream border border-gold/30 text-navy-deep p-8 rounded-2xl text-center shadow-inner">
                                <div className="w-16 h-16 bg-gold text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <h3 className="font-display text-3xl mb-3 text-gold">Demande reçue avec succès !</h3>
                                <p className="text-lg font-light mb-6">L'équipe MAREA vous contactera dans les meilleurs délais pour confirmer la disponibilité et les détails de votre réservation.</p>
                                <button onClick={() => setFormStatus(null)} className="text-navy-deep font-bold border-b-2 border-gold pb-1 hover:text-gold transition-colors">Faire une autre demande</button>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-navy-deep uppercase tracking-widest mb-2">Prénom & Nom</label>
                                        <input 
                                            type="text" required
                                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full border-gray-200 rounded-xl shadow-sm focus:border-gold focus:ring-gold focus:ring-1 py-4 px-5 border bg-gray-50/50 transition-all outline-none" 
                                            placeholder="Votre nom complet"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-navy-deep uppercase tracking-widest mb-2">Email</label>
                                        <input 
                                            type="email" required
                                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                            className="w-full border-gray-200 rounded-xl shadow-sm focus:border-gold focus:ring-gold focus:ring-1 py-4 px-5 border bg-gray-50/50 transition-all outline-none" 
                                            placeholder="vous@exemple.com"
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-bold text-navy-deep uppercase tracking-widest mb-2">Message ou détails</label>
                                    <textarea 
                                        required rows="5"
                                        value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                                        className="w-full border-gray-200 rounded-xl shadow-sm focus:border-gold focus:ring-gold focus:ring-1 py-4 px-5 border bg-gray-50/50 transition-all outline-none resize-none"
                                        placeholder="Combien de personnes ? Avez-vous des allergies ?"
                                    ></textarea>
                                </div>
                                {formStatus === 'error' && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">Une erreur s'est produite lors de l'envoi. Veuillez réessayer.</p>}
                                <button 
                                    type="submit" 
                                    disabled={formStatus === 'sending'}
                                    className={`w-full bg-navy-deep text-white py-4 rounded-xl font-bold text-lg hover:bg-gold hover:text-navy-deep transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${formStatus === 'sending' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {formStatus === 'sending' ? 'Envoi en cours...' : 'Envoyer ma demande'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Eventos;

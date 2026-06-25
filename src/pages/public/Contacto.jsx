import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    MapPin, Phone, Mail, Clock, Send, Facebook, Instagram, Twitter, 
    MessageSquare, User, ChevronDown, ChevronUp, PenLine, Tag, ArrowRight 
} from 'lucide-react';

const WhatsAppIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const faqs = [
    {
        q: "Quel est le délai de livraison ?",
        a: "Nos livraisons sont généralement effectuées entre 45 et 60 minutes selon votre zone géographique."
    },
    {
        q: "Comment suivre ma commande ?",
        a: "Dès que votre commande est validée, vous pouvez la suivre en temps réel depuis la section \"Mes Commandes\" ou via le lien envoyé par email."
    },
    {
        q: "Puis-je annuler ou modifier ma commande ?",
        a: "Vous pouvez annuler ou modifier votre commande dans les 5 minutes suivant sa validation en appelant directement notre service client."
    },
    {
        q: "La livraison est-elle vraiment gratuite ?",
        a: "Oui, la livraison est offerte pour toutes les commandes dépassant un certain montant (selon les offres en cours)."
    }
];

const Contacto = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [status, setStatus] = useState(null);
    const [activeFaq, setActiveFaq] = useState(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await api.submitContact(formData);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <div className="bg-[#FAFAFA] min-h-screen pt-20 font-sans">
            {/* Header Section (Hero) */}
            <div className="section-header pt-24 pb-16 relative overflow-hidden mb-16">
                <span className="eyebrow relative z-10">NOUS SOMMES LÀ</span>
                <h1 className="section-title relative z-10">Contact</h1>
                <p className="section-subtitle relative z-10 max-w-2xl mx-auto px-4">
                    Une question, une suggestion ou une demande spéciale ? Écrivez-nous et nous vous répondrons dans les plus brefs délais.
                </p>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                
                {/* Top Section: Form and Info Cards */}
                <div className="flex flex-col lg:flex-row gap-8 mb-20">
                    
                    {/* Left Card: Contact Form */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-lg border border-gray-100 flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center text-gold">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-navy-deep">Envoyez-nous un message</h2>
                        </div>

                        {status === 'success' ? (
                            <div className="bg-green-50 text-green-800 p-8 rounded-2xl text-center h-[400px] flex flex-col items-center justify-center">
                                <Send className="w-16 h-16 text-green-500 mb-4" />
                                <h4 className="font-bold text-2xl mb-2">Message envoyé !</h4>
                                <p className="text-gray-600">Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.</p>
                                <button onClick={() => setStatus(null)} className="mt-8 px-6 py-3 bg-navy-deep text-white rounded-full font-semibold hover:bg-gold hover:text-navy-deep transition-colors">
                                    Nouveau message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-navy-deep mb-2">Nom complet <span className="text-gold">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input 
                                                type="text" required placeholder="ex: Ahmed Daoudi"
                                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-navy-deep mb-2">Email <span className="text-gold">*</span></label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input 
                                                type="email" required placeholder="votre@email.com"
                                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-semibold text-navy-deep mb-2">Téléphone</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input 
                                                type="text" placeholder="+212..."
                                                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-semibold text-navy-deep mb-2">Sujet</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Tag className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <select 
                                                value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none appearance-none"
                                            >
                                                <option value="" disabled>Sélectionnez un sujet...</option>
                                                <option value="reservation">Réservation</option>
                                                <option value="commande">Ma Commande</option>
                                                <option value="reclamation">Réclamation</option>
                                                <option value="autre">Autre</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-semibold text-navy-deep mb-2">Message <span className="text-gold">*</span></label>
                                    <div className="relative">
                                        <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                                            <PenLine className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <textarea 
                                            required rows="5" placeholder="Comment pouvons-nous vous aider ?"
                                            value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all outline-none resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                                
                                {status === 'error' && <p className="text-red-500 text-sm font-medium">Une erreur est survenue. Veuillez réessayer.</p>}
                                
                                <button 
                                    type="submit" 
                                    disabled={status === 'submitting'}
                                    className={`w-full py-4 rounded-xl bg-gold text-navy-deep font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#B89246] hover:shadow-lg transition-all ${status === 'submitting' ? 'opacity-70' : ''}`}
                                >
                                    {status === 'submitting' ? 'Envoi en cours...' : (
                                        <>Envoyer le message <ArrowRight className="w-5 h-5" /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Right Card: Contact Info */}
                    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-lg border border-gray-100 lg:w-[400px] shrink-0 flex flex-col justify-between">
                        <div>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-navy-deep mb-8">Informations de contact</h2>
                            
                            <div className="space-y-6">
                                {/* Email */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                                        <p className="font-semibold text-navy-deep">support@marea.ma</p>
                                        <p className="text-sm text-gray-500">Réponse sous 24h</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Téléphone</p>
                                        <p className="font-semibold text-navy-deep">+212 5 22 00 00 00</p>
                                        <p className="text-sm text-gray-500">Lun - Dim: 13h - 23h</p>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Adresse</p>
                                        <p className="font-semibold text-navy-deep">Boulevard de la Corniche</p>
                                        <p className="text-sm text-gray-500">Casablanca, Maroc</p>
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Horaires</p>
                                        <p className="font-semibold text-navy-deep">Lun - Jeu: 13h00 - 23h30</p>
                                        <p className="text-sm text-gray-500">Ven - Dim: 13h00 - 01h00</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="mt-10 pt-8 border-t border-gray-100">
                            <h4 className="font-bold text-navy-deep text-sm uppercase tracking-wider mb-4">Suivez-nous</h4>
                            <div className="flex gap-3">
                                <a href="#" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <Facebook className="w-4 h-4 fill-current" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <Twitter className="w-4 h-4 fill-current" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                                    <WhatsAppIcon className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <MapPin className="w-6 h-6 text-pink-500" />
                        <h3 className="font-display text-2xl font-bold text-navy-deep">Notre localisation</h3>
                    </div>
                    <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-gray-200">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106376.7410313063!2d-7.669394336155609!3d33.57311044439075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0xb06c1d84f310fd3!2sCasablanca!5e0!3m2!1sen!2sma!4v1692261907527!5m2!1sen!2sma" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full"
                        ></iframe>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto text-center mb-10">
                    <h2 className="font-display text-3xl font-bold text-navy-deep mb-3">Questions Fréquentes</h2>
                    <p className="text-gray-500 text-sm md:text-base">
                        Vous avez des questions ? Nous avons les réponses. Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à nous contacter via le formulaire.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                        >
                            <button 
                                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                            >
                                <span className="font-bold text-navy-deep text-sm md:text-base">{faq.q}</span>
                                {activeFaq === index ? (
                                    <ChevronUp className="w-5 h-5 text-gold shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                                )}
                            </button>
                            
                            <div 
                                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                                    activeFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Contacto;

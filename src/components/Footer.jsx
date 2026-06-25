import { Link } from 'react-router-dom';
import { Moon, Instagram, Facebook, MapPin, Phone, Clock, MessageCircle } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black-rich text-white pt-16 pb-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4 group">
                            <Moon className="text-gold w-8 h-8 group-hover:text-white transition-colors" />
                            <span className="font-display text-2xl text-gold tracking-widest font-bold group-hover:text-white transition-colors">MAREA</span>
                        </Link>
                        <p className="text-white/60 font-light mb-6">
                            Saveurs authentiques de la Méditerranée et du Maroc dans un cadre élégant et chaleureux.
                        </p>
                        <div className="flex space-x-3">
                            <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-black-rich transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://wa.me/33612345678" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-black-rich transition-colors">
                                <MessageCircle className="w-5 h-5" />
                            </a>
                            <a href="#" aria-label="X / Twitter" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-black-rich transition-colors">
                                {/* X (Twitter) logo */}
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-gold hover:text-black-rich transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-display text-gold text-xl mb-6">Explorer</h4>
                        <ul className="space-y-3">
                            <li><Link to="/menu" className="text-white/70 hover:text-gold transition-colors">Notre Menu</Link></li>
                            <li><Link to="/galeria" className="text-white/70 hover:text-gold transition-colors">Galerie</Link></li>
                            <li><Link to="/nosotros" className="text-white/70 hover:text-gold transition-colors">À Propos</Link></li>
                            <li><Link to="/eventos" className="text-white/70 hover:text-gold transition-colors">Événements</Link></li>
                            <li><Link to="/trabaja-con-nosotros" className="text-white/70 hover:text-gold transition-colors">Rejoindre l'équipe</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-display text-gold text-xl mb-6">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                                <span className="text-white/70">15 Rue Principale<br/>75001 Paris, France</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gold shrink-0" />
                                <span className="text-white/70">+33 1 23 45 67 89</span>
                            </li>
                        </ul>
                    </div>

                    {/* Hours */}
                    <div>
                        <h4 className="font-display text-gold text-xl mb-6">Horaires</h4>
                        <ul className="space-y-2 text-white/70">
                            <li className="flex justify-between border-b border-white/10 pb-2">
                                <span>Lundi - Jeudi</span>
                                <span>13:00 - 23:30</span>
                            </li>
                            <li className="flex justify-between border-b border-white/10 pb-2 pt-2">
                                <span>Vendredi - Samedi</span>
                                <span>13:00 - 01:00</span>
                            </li>
                            <li className="flex justify-between pt-2 text-gold">
                                <span>Dimanche</span>
                                <span>13:00 - 17:00</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 text-center flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
                    <p>&copy; {new Date().getFullYear()} MAREA Restaurant. Tous droits réservés.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
                        <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
                        <a href="#" className="hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

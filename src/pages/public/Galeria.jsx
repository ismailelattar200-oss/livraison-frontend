import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { X } from 'lucide-react';

/* ─── Animated card wrapper using IntersectionObserver ─── */
const AnimatedCard = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Slight delay so cards stagger into view
                    setTimeout(() => setVisible(true), delay);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [delay]);

    return (
        <div
            ref={ref}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(24px)',
                transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
            }}
        >
            {children}
        </div>
    );
};

/* ─── Parse "Name — Role" caption format ─── */
const parseCaption = (caption) => {
    if (!caption) return { name: '', role: '' };
    const parts = caption.split('—').map(s => s.trim());
    return parts.length >= 2
        ? { name: parts[0], role: parts[1] }
        : { name: caption, role: '' };
};

/* ─── Photo card ─── */
const PhotoCard = ({ photo, index, isPersonal, onClick }) => {
    const delay = (index % 3) * 100 + Math.floor(index / 3) * 60;
    const { name, role } = parseCaption(photo.caption);

    return (
        <AnimatedCard delay={delay}>
            <div
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg bg-black aspect-[3/4]"
                onClick={() => onClick(photo)}
            >
                <img
                    src={photo.image_url}
                    alt={photo.caption || 'Galerie MAREA'}
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:opacity-100"
                    loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-5">
                    {isPersonal ? (
                        <>
                            {name && (
                                <p className="text-white font-display text-lg font-semibold leading-tight">
                                    {name}
                                </p>
                            )}
                            {role && (
                                <p className="text-gold text-sm mt-1 font-medium tracking-wide">
                                    {role}
                                </p>
                            )}
                        </>
                    ) : (
                        photo.caption && (
                            <p className="text-white font-display text-base font-medium">
                                {photo.caption}
                            </p>
                        )
                    )}
                </div>
            </div>
        </AnimatedCard>
    );
};

/* ─── Main Gallery Page ─── */
const Galeria = () => {
    const [photos, setPhotos] = useState([]);
    const [activeTab, setActiveTab] = useState('galeria');
    const [loading, setLoading] = useState(true);
    const [lightboxImage, setLightboxImage] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchGallery = async () => {
            try {
                const res = await api.getGallery();
                setPhotos(res.data.data);
            } catch (error) {
                console.error('Erreur de chargement galerie:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const displayPhotos = photos.filter(p => p.category === activeTab);
    const isPersonal = activeTab === 'personal';

    return (
        <div className="bg-cream min-h-screen pt-20">
            <div className="section-header pt-24 pb-16">
                <span className="eyebrow">NOTRE ESSENCE</span>
                <h1 className="section-title">Galerie</h1>
                <p className="section-subtitle">
                    Découvrez les espaces de MAREA, nos plats vedettes et l'équipe qui rend la magie possible chaque jour.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* ── Tabs ── */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex bg-white rounded-full p-1 shadow-sm border border-gray-200">
                        <button
                            onClick={() => setActiveTab('galeria')}
                            className={`px-8 py-3 rounded-full font-medium transition-colors ${
                                activeTab === 'galeria' ? 'bg-navy-deep text-gold' : 'text-gray-600 hover:text-navy-deep'
                            }`}
                        >
                            Espace &amp; Gastronomie
                        </button>
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`px-8 py-3 rounded-full font-medium transition-colors ${
                                activeTab === 'personal' ? 'bg-navy-deep text-gold' : 'text-gray-600 hover:text-navy-deep'
                            }`}
                        >
                            Notre Équipe
                        </button>
                    </div>
                </div>

                {/* ── Grid ── */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full" />
                    </div>
                ) : displayPhotos.length === 0 ? (
                    <p className="text-center text-gray-400 py-24">Aucune photo disponible.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayPhotos.map((photo, index) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                index={index}
                                isPersonal={isPersonal}
                                onClick={setLightboxImage}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Lightbox ── */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setLightboxImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
                        onClick={() => setLightboxImage(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={lightboxImage.image_url}
                        alt={lightboxImage.caption}
                        className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg"
                        onClick={e => e.stopPropagation()}
                    />
                    {lightboxImage.caption && (
                        <div className="absolute bottom-6 left-0 right-0 text-center">
                            <span className="bg-black/50 backdrop-blur-md text-white font-display text-xl px-6 py-2 rounded-full border border-white/10">
                                {lightboxImage.caption}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Galeria;

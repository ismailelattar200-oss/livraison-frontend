import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Flame, Heart, Award, Users, Clock, ArrowRight, Sparkles, Quote } from 'lucide-react';

const Nosotros = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const values = [
        {
            icon: <Flame className="w-8 h-8" />,
            title: 'Passion Culinaire',
            description: 'Chaque plat est préparé avec une dévotion absolue, transformant des ingrédients simples en œuvres d\'art.'
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: 'Authenticité pure',
            description: 'Nous honorons les recettes ancestrales tout en les sublimant avec des techniques modernes.'
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: 'Convivialité',
            description: 'MAREA est un lieu de partage où chaque table devient le théâtre de moments précieux.'
        },
        {
            icon: <Sparkles className="w-8 h-8" />,
            title: 'Excellence',
            description: 'De la sélection des ingrédients au dressage final, nous visons la perfection à chaque étape.'
        }
    ];

    const timeline = [
        {
            year: '2018',
            title: 'La Naissance',
            description: 'Chef Hassan ouvre le premier MAREA dans un petit local de 5 tables. Le rêve prend forme.',
        },
        {
            year: '2020',
            title: 'La Résilience',
            description: 'Face aux défis, nous nous réinventons avec un service de livraison gastronomique primé.',
        },
        {
            year: '2022',
            title: 'L\'Expansion',
            description: 'Installation en plein centre-ville, avec l\'ajout d\'un bar à cocktails signature.',
        },
        {
            year: 'Aujourd\'hui',
            title: 'L\'Avenir',
            description: 'Une équipe de 15 professionnels passionnés, dédiés à vous offrir une expérience inoubliable.',
        }
    ];

    return (
        <div className="bg-cream min-h-screen pt-20">
            {/* Header Section */}
            <div className="section-header pt-24 pb-16 relative overflow-hidden">
                <span className="eyebrow relative z-10">NOTRE HISTOIRE</span>
                <h1 className="section-title relative z-10">À Propos</h1>
                <p className="section-subtitle relative z-10 max-w-2xl mx-auto">
                    Un voyage culinaire entre deux rives unies par la Méditerranée, raconté à travers chaque saveur.
                </p>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
            </div>



            {/* Values Grid */}
            <section className="py-24 px-4 bg-white relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl text-navy-deep mb-4">Ce qui nous anime</h2>
                        <div className="w-24 h-1 bg-gold mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div 
                                key={index}
                                className="bg-cream p-8 rounded-3xl hover:bg-navy-deep hover:text-white transition-colors duration-500 group text-center border border-transparent hover:border-gold/30 shadow-sm hover:shadow-xl hover:-translate-y-2"
                            >
                                <div className="w-20 h-20 bg-white group-hover:bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gold transition-colors duration-500 shadow-sm">
                                    {value.icon}
                                </div>
                                <h3 className="font-display text-2xl mb-4 group-hover:text-gold transition-colors">{value.title}</h3>
                                <p className="text-gray-500 group-hover:text-white/80 font-light leading-relaxed transition-colors">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Chef Profile */}
            <section className="bg-navy-deep text-white py-24 px-4 overflow-hidden relative">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24 relative z-10">
                    <div className="lg:w-5/12 relative group">
                        <img 
                            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1000&q=80" 
                            alt="Chef Hassan" 
                            className="w-full h-[600px] object-cover rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700"
                        />
                    </div>
                    <div className="lg:w-7/12 space-y-8">
                        <div>
                            <span className="text-gold uppercase tracking-[0.2em] text-sm font-bold block mb-3">L'Âme de MAREA</span>
                            <h2 className="font-display text-5xl md:text-6xl text-gold mb-4">Chef Hassan</h2>
                            <p className="text-white/60 font-serif italic text-2xl">Visionnaire & Fondateur</p>
                        </div>
                        <div className="space-y-6 text-white/80 leading-relaxed text-lg font-light">
                            <p>
                                Né à Marrakech et formé dans les cuisines les plus exigeantes de Paris et de San Sebastián, Hassan apporte une vision unique à la gastronomie — celle d'un artiste qui peint avec les saveurs.
                            </p>
                            <blockquote className="border-l-4 border-gold pl-6 py-2 my-8 text-xl italic font-serif text-white">
                                "Cuisiner est un acte d'amour et de mémoire. Chaque tajine porte le souvenir des souks de mon enfance, tandis que nos poissons rendent hommage aux côtes où j'ai développé ma carrière."
                            </blockquote>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                            <div>
                                <h4 className="text-gold font-bold text-4xl mb-2">20+</h4>
                                <span className="text-xs text-white/50 uppercase tracking-widest font-medium">Ans d'expérience</span>
                            </div>
                            <div>
                                <h4 className="text-gold font-bold text-4xl mb-2">3</h4>
                                <span className="text-xs text-white/50 uppercase tracking-widest font-medium">Pays traversés</span>
                            </div>
                            <div className="hidden sm:block">
                                <h4 className="text-gold font-bold text-4xl mb-2">100%</h4>
                                <span className="text-xs text-white/50 uppercase tracking-widest font-medium">Passion</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-24 px-4 bg-cream">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="font-display text-4xl md:text-5xl text-navy-deep mb-4">Notre Évolution</h2>
                        <div className="w-24 h-1 bg-gold mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-1 bg-gold/20 md:-translate-x-1/2 rounded-full"></div>
                        
                        <div className="space-y-12">
                            {timeline.map((item, index) => (
                                <div key={index} className={`relative flex flex-col md:flex-row items-start md:items-center w-full group ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                                    {/* Content Card */}
                                    <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${index % 2 === 0 ? 'md:pr-16 text-left' : 'md:pl-16 text-left'}`}>
                                        <div className="bg-white p-8 rounded-3xl shadow-md group-hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative overflow-hidden z-10">
                                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold to-amber opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <span className="block font-bold text-gold mb-2 text-lg tracking-widest">{item.year}</span>
                                            <h3 className="font-display text-2xl text-navy-deep mb-3 relative z-10">{item.title}</h3>
                                            <p className="text-gray-600 font-light leading-relaxed relative z-10">{item.description}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Timeline Node */}
                                    <div className="absolute left-8 md:left-1/2 w-6 h-6 bg-gold rounded-full md:-translate-x-1/2 shadow-[0_0_0_6px_#f9f7f2] z-20 group-hover:scale-125 transition-transform duration-300 flex items-center justify-center top-6 md:top-1/2 md:-translate-y-1/2">
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Nosotros;

import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { Briefcase, UploadCloud, CheckCircle } from 'lucide-react';

const TrabajaConNosotros = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', position: '', message: ''
    });
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const positions = [
        "Serveur / Serveuse",
        "Aide de cuisine",
        "Cuisinier / Cuisinière",
        "Livreur / Livreuse",
        "Barman / Barman",
        "Hôte / Hôtesse d'accueil"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (file) data.append('cv', file);

            await api.submitJobApplication(data);
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', position: '', message: '' });
            setFile(null);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="bg-cream min-h-screen pt-20">
            <div className="section-header pt-24 pb-16">
                <span className="eyebrow">REJOINDRE L'ÉQUIPE</span>
                <h1 className="section-title">Travailler avec nous</h1>
                <p className="section-subtitle">
                    Nous recherchons des talents passionnés par la gastronomie et l'excellence du service pour rejoindre la famille MAREA.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row gap-16">
                
                {/* Info Text */}
                <div className="lg:w-5/12 space-y-8">
                    <h2 className="font-display text-4xl text-navy-deep text-gold">Nous grandissons avec vous</h2>
                    <p className="text-gray-700 text-lg font-light leading-relaxed">
                        Chez MAREA, nous croyons que notre plus grand atout est notre équipe. Nous offrons un environnement de travail dynamique, respectueux et avec de vraies opportunités d'évolution professionnelle.
                    </p>
                    
                    <div className="space-y-6 pt-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                                <Briefcase className="w-6 h-6 text-gold" />
                            </div>
                            <div>
                                <h4 className="font-bold text-navy-deep text-xl mb-1">Formation Continue</h4>
                                <p className="text-gray-600 text-sm">Apprenez les techniques de cuisine internationale, de sommellerie et de service client premium.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                                <Users className="w-6 h-6 text-gold" />
                            </div>
                            <div>
                                <h4 className="font-bold text-navy-deep text-xl mb-1">Bonne Ambiance</h4>
                                <p className="text-gray-600 text-sm">Nous favorisons la camaraderie, la diversité et le respect mutuel en toutes circonstances.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="lg:w-7/12">
                    <div className="bg-white p-8 md:p-12 rounded-xl shadow-xl">
                        {status === 'success' ? (
                            <div className="text-center py-12">
                                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                                <h3 className="font-display text-3xl text-navy-deep mb-4">Candidature reçue</h3>
                                <p className="text-gray-600 mb-8">Merci pour votre intérêt pour MAREA. Notre équipe des ressources humaines examinera votre profil et vous contactera s'il correspond à l'un de nos postes vacants.</p>
                                <button onClick={() => setStatus(null)} className="btn-outline-gold">Envoyer une autre candidature</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="font-display text-2xl text-navy-deep mb-6 border-b border-gray-100 pb-4">Envoyez-nous votre CV</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-300 rounded-md py-2 px-3 border bg-gray-50 focus:border-gold focus:ring-gold" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border-gray-300 rounded-md py-2 px-3 border bg-gray-50 focus:border-gold focus:ring-gold" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                        <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border-gray-300 rounded-md py-2 px-3 border bg-gray-50 focus:border-gold focus:ring-gold" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Poste souhaité</label>
                                        <select required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full border-gray-300 rounded-md py-2 px-3 border bg-gray-50 focus:border-gold focus:ring-gold">
                                            <option value="">Sélectionnez un poste...</option>
                                            {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Lettre de motivation brève</label>
                                    <textarea rows="4" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border-gray-300 rounded-md py-2 px-3 border bg-gray-50 focus:border-gold focus:ring-gold"></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum Vitae (PDF/Doc)</label>
                                    <div 
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">
                                            {file ? <span className="text-gold font-bold">{file.name}</span> : "Cliquez pour téléverser votre CV (Max 5 Mo)"}
                                        </p>
                                        <input 
                                            type="file" ref={fileInputRef} className="hidden" 
                                            accept=".pdf,.doc,.docx"
                                            onChange={e => setFile(e.target.files[0])}
                                        />
                                    </div>
                                </div>

                                {status === 'error' && <p className="text-red-500 text-sm">Erreur lors de l'envoi. Vérifiez la taille du fichier.</p>}

                                <button type="submit" disabled={status === 'submitting'} className={`btn-gold w-full ${status === 'submitting' ? 'opacity-70' : ''}`}>
                                    {status === 'submitting' ? 'Envoi en cours...' : 'Envoyer la candidature'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

function Users(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default TrabajaConNosotros;

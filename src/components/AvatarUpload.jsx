import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import api from '../services/api';

const AvatarUpload = ({ user, setUser, size = 'w-32 h-32', textSize = 'text-5xl' }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [user?.avatar]);
    
    const fileInputRef = useRef(null);

    const triggerFileSelect = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleAvatarChange = async (e) => {
        setError('');
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError("Format non supporté (JPG, PNG, WEBP uniquement).");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            setError("L'image est trop grande (max 5MB).");
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            const res = await api.updateAvatar(formData);
            setUser(prev => ({ ...prev, avatar: res.data.data.avatar }));
        } catch (error) {
            console.error("Failed to upload avatar", error);
            setError("Erreur lors du téléchargement de l'image.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveAvatar = async () => {
        if (!window.confirm("Voulez-vous vraiment supprimer votre photo de profil ?")) return;
        setUploading(true);
        setError('');
        try {
            await api.deleteAvatar();
            setUser(prev => ({ ...prev, avatar: null }));
        } catch (error) {
            console.error("Failed to delete avatar", error);
            setError("Erreur lors de la suppression de l'image.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center">
            {/* Error Toast specific to Avatar */}
            {error && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs font-bold shadow-md whitespace-nowrap z-50">
                    {error}
                </div>
            )}

            <div className="relative group">
                {/* Avatar Circle */}
                <div 
                    className={`${size} bg-navy-deep rounded-full flex items-center justify-center text-white font-display ${textSize} shadow-xl border-4 border-white/20 overflow-hidden relative transition-transform duration-300 group-hover:scale-105`}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center justify-center animate-pulse">
                            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (user?.avatar && !imgError) ? (
                        <img 
                            src={user.avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                    )}

                    {/* Subtle Hover Darken */}
                    {!uploading && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    )}
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleAvatarChange}
                />

                {/* Floating Action Buttons */}
                {!uploading && (
                    <>
                        {/* Delete Button (Top Right) */}
                        {user?.avatar && !imgError && (
                            <button
                                onClick={handleRemoveAvatar}
                                className="absolute top-0 right-0 w-9 h-9 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white hover:bg-red-600 hover:scale-110 transition-all z-10"
                                title="Supprimer la photo"
                            >
                                <Trash2 className="w-4 h-4 text-white" />
                            </button>
                        )}
                        
                        {/* Upload/Camera Button (Bottom Right) */}
                        <button
                            onClick={triggerFileSelect}
                            className="absolute bottom-0 right-0 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white hover:bg-gray-50 hover:scale-110 transition-all z-10"
                            title="Changer la photo"
                        >
                            <Camera className="w-5 h-5 text-navy-deep" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AvatarUpload;

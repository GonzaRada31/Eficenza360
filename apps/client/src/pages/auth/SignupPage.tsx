import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Mail, Lock, Building, Loader2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoEficenza from '../../assets/logo-eficenza.png';

export const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        commercialName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/iam/signup', formData);
            navigate('/login?registered=true');
        } catch (err) {
            console.error(err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((err as any).response?.status === 409) {
                setError('El correo electrónico ya está registrado.');
            } else {
                setError('Ocurrió un error al registrar la cuenta. Intentá más tarde.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/20 rounded-full blur-[120px] opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/30 rounded-full blur-[120px] opacity-50" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(85,107,79,0.08)] border border-white/40 p-10 md:p-12 space-y-8 relative z-10">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center mb-2">
                            <motion.img
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 100 }}
                                src={logoEficenza}
                                alt="Eficenza Logo"
                                className="h-20 w-auto drop-shadow-sm"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Crear Cuenta</h1>
                        <p className="text-gray-500 font-medium text-sm text-balance">
                            Registrá tu empresa y comenzá a medir tu impacto ambiental.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex items-start gap-3"
                            >
                                <span className="mt-0.5">⚠️</span>
                                <p className="font-semibold">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-dark/70 uppercase tracking-widest ml-1" htmlFor="name">
                                Razón Social
                            </label>
                            <div className="relative group">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700"
                                    placeholder="Empresa S.A."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-dark/70 uppercase tracking-widest ml-1" htmlFor="email">
                                Correo Electrónico (Admin)
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700"
                                    placeholder="admin@empresa.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-dark/70 uppercase tracking-widest ml-1" htmlFor="password">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-brand-primary to-brand-dark hover:shadow-[0_20px_40px_-10px_rgba(141,167,135,0.4)] text-white font-bold py-4.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-brand-primary/20 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Registrando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">Crear Cuenta</span>
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 font-medium">
                            ¿Ya tenés una cuenta?{' '}
                            <Link to="/login" className="text-brand-primary hover:text-brand-dark font-bold hover:underline underline-offset-4 transition-all">
                                Ingresá acá
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-10 text-center text-brand-dark/40 text-[10px] tracking-[0.2em] uppercase font-black">
                    © 2025 Eficenza 360 • Sostenibilidad Inteligente
                </div>
            </motion.div>
        </div>
    );
};


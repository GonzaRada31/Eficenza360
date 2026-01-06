import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Mail, Loader2, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoEficenza from '../../assets/logo-eficenza.png';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/iam/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Ocurrió un error. Intentá nuevamente.');
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
                    <div className="space-y-4">
                        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-dark uppercase tracking-widest transition-colors mb-2">
                            <ArrowLeft className="h-4 w-4" /> Volver al login
                        </Link>
                        <div className="flex justify-center mb-2">
                            <motion.img
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 100 }}
                                src={logoEficenza}
                                alt="Eficenza Logo"
                                className="h-16 w-auto drop-shadow-sm"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-brand-dark tracking-tight text-center">Recuperar Contraseña</h1>
                        <p className="text-gray-500 font-medium text-sm text-center text-balance">
                            Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 text-brand-dark p-5 rounded-2xl text-sm border border-green-100 space-y-2"
                            >
                                <p className="font-bold flex items-center gap-2 text-green-700">
                                    <span>✅</span> ¡Enviado con éxito!
                                </p>
                                <p className="leading-relaxed opacity-90">
                                    Si el correo existe en nuestra base de datos, recibirás las instrucciones en breve. Revisá tu bandeja de entrada y spam.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

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

                    {!success && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-dark/70 uppercase tracking-widest ml-1" htmlFor="email">
                                    Correo Electrónico
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700"
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-brand-primary to-brand-dark hover:shadow-[0_20px_40px_-10px_rgba(141,167,135,0.4)] text-white font-bold py-4.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg shadow-brand-primary/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-lg">Enviar enlace</span>
                                        <Send className="w-4 h-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer info */}
                <div className="mt-10 text-center text-brand-dark/40 text-[10px] tracking-[0.2em] uppercase font-black">
                    © 2025 Eficenza 360 • Sostenibilidad Inteligente
                </div>
            </motion.div>
        </div>
    );
};


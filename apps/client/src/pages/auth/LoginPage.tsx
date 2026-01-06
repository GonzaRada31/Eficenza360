import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/auth.context';
import { api } from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoEficenza from '../../assets/logo-eficenza.png';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('Attempting login to:', api.defaults.baseURL);

        try {
            const response = await api.post('/iam/login', { email, password });
            const token = response.data.access_token;
            console.log('Login API success, token (start):', token?.substring(0, 10));
            if (login(token)) {
                console.log('Login context updated, navigating...');
                navigate('/');
            } else {
                console.error('Login context failed to update.');
                setError('Error al procesar la sesión. Intentá nuevamente.');
            }
        } catch (err) {
            console.error('Login Error Details:', err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyErr = err as any;

            if (anyErr.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log('Error Response Data:', anyErr.response.data);
                console.log('Error Response Status:', anyErr.response.status);

                if (anyErr.response.status === 401) {
                    setError('Credenciales inválidas. Por favor verificá tus datos.');
                } else if (anyErr.response.status === 403) {
                    setError('Acceso denegado. No tienes permisos para ingresar.');
                } else {
                    const message = anyErr.response.data?.message || anyErr.message;
                    setError(`Error del servidor (${anyErr.response.status}): ${message}`);
                }
            } else if (anyErr.request) {
                // The request was made but no response was received
                console.log('Error Request:', anyErr.request);
                setError('No se pudo conectar con el servidor. Verificá tu conexión o si el backend está activo.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error Message:', anyErr.message);
                setError(`Error de configuración: ${anyErr.message}`);
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
                                className="h-24 w-auto drop-shadow-sm"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Eficenza 360</h1>
                        <p className="text-gray-500 font-medium text-sm text-balance">
                            Ingresá a tu cuenta para gestionar tus auditorías y huella de carbono.
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
                                    placeholder="nombre@empresa.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-brand-dark/70 uppercase tracking-widest" htmlFor="password">
                                    Contraseña
                                </label>
                                <Link to="/forgot-password" title="Recuperar contraseña" className="text-[10px] text-brand-primary hover:text-brand-dark font-black tracking-widest uppercase transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700"
                                    placeholder="••••••••"
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
                                    <span>Ingresando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">Ingresar</span>
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 font-medium">
                            ¿No tenés una cuenta?{' '}
                            <Link to="/signup" className="text-brand-primary hover:text-brand-dark font-bold hover:underline underline-offset-4 transition-all">
                                Registrá tu empresa
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



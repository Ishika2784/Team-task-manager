import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckSquare, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 outline-none transition-all text-sm";

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}
      className="flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative">

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.08) 1px,transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm mx-4 rounded-2xl border border-white/10 shadow-[0_0_60px_rgba(99,102,241,0.25)]"
        style={{ background: 'rgba(15,20,40,0.85)', backdropFilter: 'blur(20px)' }}
      >
        <div className="px-8 pt-10 pb-6 text-center">
          <motion.div whileHover={{ scale: 1.1 }}
            className="mx-auto w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-5 shadow-lg shadow-indigo-500/30">
            <CheckSquare size={26} />
          </motion.div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create an account</h2>
          <p className="mt-1.5 text-sm text-slate-400">Join Taskflow and start shipping faster</p>
        </div>

        <div className="px-8 pb-8">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />{error}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full name</label>
              <input type="text" className={inputClass} placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email address</label>
              <input type="email" className={inputClass} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className={`${inputClass} pr-12`}
                  placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Role</label>
              <select className={`${inputClass} cursor-pointer`} value={role} onChange={e => setRole(e.target.value)}>
                <option value="Member" className="bg-slate-900">Team Member</option>
                <option value="Admin" className="bg-slate-900">Administrator</option>
              </select>
            </div>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30 mt-1 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create account'}
            </motion.button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Sign in instead</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

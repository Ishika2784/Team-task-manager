import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await verifyOtp(email, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setResending(true);
    try {
      await resendOtp(email);
      setMessage('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-8 pt-10 pb-8 text-center border-b border-slate-100">
          <div className="mx-auto w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm border border-indigo-100">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verify your email</h2>
          <p className="mt-2 text-sm text-slate-500">
            We sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>
          </p>
        </div>
        
        <div className="px-8 py-8 bg-slate-50/50">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}
          {message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">Enter 6-Digit Code</label>
              <input
                type="text"
                maxLength="6"
                className="w-full text-center text-3xl tracking-[0.5em] px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors shadow-sm"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={submitting || otp.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-slate-500">
            Didn't receive the code?{' '}
            <button 
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Click to resend'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Download,
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DownloadProjectModal } from '../../components/modals/DownloadProjectModal';

export const LoginPage: React.FC = () => {
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>('ADMIN');
  const [identifier, setIdentifier] = useState('saqibsb13b@gmail.com');
  const [password, setPassword] = useState('@Saqibsb13b');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(true);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleRoleChange = (newRole: 'STUDENT' | 'ADMIN') => {
    setRole(newRole);
    setErrorMsg('');
    if (newRole === 'ADMIN') {
      setIdentifier('saqibsb13b@gmail.com');
      setPassword('@Saqibsb13b');
    } else {
      setIdentifier('muhammad.khan1@gmail.com');
      setPassword('Student@12345');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const user = await login(identifier, password, role);
      showSuccess(`Welcome, ${user.fullName}`, `Logged in successfully as ${role === 'ADMIN' ? 'Administrator' : 'Student'}`);
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
      showError('Login Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (type: 'ADMIN' | 'STUDENT') => {
    handleRoleChange(type);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#0B1020] text-neutral-100 selection:bg-indigo-500 selection:text-white">
      {/* Left Brand Showcase Panel */}
      <div className="relative md:w-5/12 lg:w-1/2 p-8 lg:p-14 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#121933] via-[#0E152B] to-[#0B1020] border-b md:border-b-0 md:border-r border-[#242E56]">
        {/* Subtle decorative shield watermark background */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 opacity-5 pointer-events-none">
          <Logo size="loginHero" variant="markOnly" className="w-full h-full" />
        </div>

        <div>
          <Logo size="loginHero" variant="full" isDark={true} />
          <div className="mt-8 space-y-3">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white font-['Sora']">
              Where Tomorrow <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-indigo-300 to-amber-200">
                Learns Today.
              </span>
            </h1>
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
              Comprehensive institutional management platform governing admissions, academic progression, fee reconciliations, and student excellence.
            </p>
          </div>
        </div>

        {/* Institutional Pillars */}
        <div className="my-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Centralized Academic Records</h4>
              <p className="text-[11px] text-neutral-400">Strict RBAC controls and real-time attendance tracking with audit trails.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Fintech-Grade Fee Automation</h4>
              <p className="text-[11px] text-neutral-400">Integrated Pakistani payment gateways (JazzCash, Easypaisa, 1Link) with instant PDF vouchers.</p>
            </div>
          </div>
        </div>

        {/* Footer credentials note */}
        <div className="text-xs text-neutral-500 flex items-center justify-between border-t border-[#242E56] pt-4">
          <span>Islamabad Campus, Pakistan</span>
          <span>Session 2026-2027</span>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-[#0B1020]">
        <div className="w-full max-w-md space-y-6">
          {/* Header Title */}
          <div>
            <h2 className="text-2xl font-bold text-white font-['Sora'] tracking-tight">
              Sign In to Portal
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Select your institutional role to access your personalized workspace.
            </p>
          </div>

          {/* Role Selector Segmented Tabs */}
          <div className="flex p-1 rounded-xl bg-[#121933] border border-[#242E56]">
            <button
              type="button"
              onClick={() => handleRoleChange('STUDENT')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === 'STUDENT'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('ADMIN')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                role === 'ADMIN'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Administrator</span>
            </button>
          </div>

          {/* Demo Credentials Box */}
          {showDemoHint && (
            <div className="p-3.5 rounded-xl bg-[#121933]/90 border border-[#242E56] text-xs space-y-2">
              <div className="flex items-center justify-between text-neutral-300 font-medium">
                <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pre-Seeded Demo Credentials</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowDemoHint(false)}
                  className="text-neutral-400 hover:text-white text-[11px]"
                >
                  Dismiss
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('ADMIN')}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    role === 'ADMIN'
                      ? 'border-indigo-500 bg-indigo-950/40'
                      : 'border-[#242E56] hover:bg-[#1A2347]'
                  }`}
                >
                  <div className="font-semibold text-white text-[11px] flex items-center justify-between">
                    <span>Admin Access</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-mono">Owner</span>
                  </div>
                  <div className="text-[10px] text-teal-300 font-mono truncate">saqibsb13b@gmail.com</div>
                  <div className="text-[9px] text-neutral-400 font-mono">Mob: 03482802484</div>
                  <div className="text-[10px] text-amber-300 font-mono">Pass: @Saqibsb13b</div>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickDemo('STUDENT')}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    role === 'STUDENT'
                      ? 'border-indigo-500 bg-indigo-950/40'
                      : 'border-[#242E56] hover:bg-[#1A2347]'
                  }`}
                >
                  <div className="font-semibold text-white text-[11px]">Student Access</div>
                  <div className="text-[10px] text-neutral-400 font-mono truncate">muhammad.khan1@gmail.com</div>
                  <div className="text-[9px] text-neutral-400 font-mono">Mob: 03002001234</div>
                  <div className="text-[10px] text-amber-300 font-mono">Pass: Student@12345</div>
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {role === 'STUDENT' ? 'Student Gmail or Mobile Number' : 'Institutional Email Address'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder={
                    role === 'STUDENT'
                      ? 'e.g. muhammad.khan1@gmail.com or 03002001234'
                      : 'e.g. admin@aurelianheights.edu'
                  }
                  className="w-full px-3.5 py-2.5 pl-10 text-sm rounded-xl border border-[#242E56] bg-[#121933] text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  {role === 'STUDENT' && !identifier.includes('@') ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </div>
              </div>
              {role === 'STUDENT' && (
                <p className="text-[11px] text-neutral-500 mt-1">
                  Log in with your registered Gmail address or Pakistani mobile (03xx / +92 3xx).
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowHelpDialog(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 pl-10 pr-10 text-sm rounded-xl border border-[#242E56] bg-[#121933] text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#242E56] text-indigo-600 focus:ring-indigo-500 bg-[#121933]"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-[11px] text-neutral-500">5-attempt lockout security</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : `Enter ${role === 'ADMIN' ? 'Admin Suite' : 'Student Portal'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Institutional note */}
          <div className="p-3 rounded-xl bg-[#121933]/50 border border-[#242E56]/50 text-center">
            <p className="text-[11px] text-neutral-400">
              Accounts are created exclusively by the Admissions Directorate. Public registration is restricted by institutional charter.
            </p>
          </div>

          {/* Quick ZIP Export Link */}
          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowDownloadModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-[#121933] hover:bg-[#1A2347] border border-[#242E56] transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Download Deployment Package (.ZIP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deployment & Download Modal */}
      <DownloadProjectModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />

      {/* Forgot Password Modal */}
      {showHelpDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#121933] border border-[#242E56] rounded-2xl p-6 text-neutral-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base font-['Sora']">Credential Recovery</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              In accordance with Aurelian Heights Academy security protocols, students cannot self-reset passwords. If you have misplaced your temporary or private credentials, please:
            </p>
            <ul className="text-xs text-neutral-300 space-y-1.5 list-disc pl-4">
              <li>Contact the Academic Registrar in Person (Building A, Room 104)</li>
              <li>Or ask your parent/guardian to call <span className="font-mono text-teal-400">+92 51 8923400</span></li>
              <li>The Admin will issue a temporary password forcing an immediate reset.</li>
            </ul>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpDialog(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

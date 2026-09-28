import React from 'react';
import { Church, ShieldCheck, HeartHandshake, QrCode, Sparkles } from 'lucide-react';
import { CapelaInfo } from '../types';

interface HeaderProps {
  capela: CapelaInfo;
  activeScreen: 'dizimo' | 'comunidade' | 'admin';
  isAdminAuthenticated: boolean;
  onNavigate: (screen: 'dizimo' | 'comunidade' | 'admin') => void;
  onOpenQuickPix: () => void;
  onAdminAuthRequest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  capela,
  activeScreen,
  isAdminAuthenticated,
  onNavigate,
  onOpenQuickPix,
  onAdminAuthRequest,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div
          onClick={() => onNavigate('dizimo')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none min-w-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-105 transition-transform duration-200">
            <Church className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-amber-300 transition-colors whitespace-nowrap">
                DiziNet <span className="text-amber-400 font-light">Pro</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-900/70 text-blue-200 border border-blue-700/50 hidden xs:inline-block">
                Pix Nativo
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-normal truncate max-w-[200px] sm:max-w-md">
              {capela.nome || 'Capela Paroquial'} · {capela.cidade}/{capela.estado}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Zone (Visible md+) */}
        <nav className="hidden md:flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onNavigate('dizimo')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeScreen === 'dizimo'
                ? 'bg-blue-800 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Contribuição & Dízimo</span>
          </button>

          <button
            onClick={() => onNavigate('comunidade')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeScreen === 'comunidade'
                ? 'bg-blue-800 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-blue-400" />
            <span>Comunidade</span>
          </button>

          <button
            onClick={() => {
              if (isAdminAuthenticated) {
                onNavigate('admin');
              } else {
                onAdminAuthRequest();
              }
            }}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeScreen === 'admin'
                ? 'bg-amber-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Painel Admin</span>
          </button>

          {/* Quick Pix CTA (Desktop) */}
          <button
            onClick={onOpenQuickPix}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:shadow-emerald-900/40 transition-all active:scale-95 whitespace-nowrap"
          >
            <QrCode className="w-4 h-4" />
            <span>Doar via Pix</span>
          </button>
        </nav>

        {/* Mobile Quick Action (Visible only on mobile top-right) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenQuickPix}
            className="flex items-center gap-1 px-3 py-1.5 min-h-[38px] text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-95"
            title="Doar com Pix"
          >
            <QrCode className="w-4 h-4 text-emerald-200" />
            <span>Pix</span>
          </button>
        </div>
      </div>
    </header>
  );
};

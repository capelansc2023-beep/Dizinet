import React from 'react';
import { Sparkles, Users, QrCode, ShieldCheck, Lock } from 'lucide-react';

interface MobileBottomNavProps {
  activeScreen: 'dizimo' | 'comunidade' | 'admin';
  isAdminAuthenticated: boolean;
  onNavigate: (screen: 'dizimo' | 'comunidade' | 'admin') => void;
  onOpenQuickPix: () => void;
  onAdminAuthRequest: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeScreen,
  isAdminAuthenticated,
  onNavigate,
  onOpenQuickPix,
  onAdminAuthRequest,
}) => {
  return (
    <nav
      aria-label="Navegação Principal Móvel"
      className="no-print fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 text-white md:hidden shadow-2xl transition-all"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-1">
        {/* Tab 1: Dízimo */}
        <button
          type="button"
          onClick={() => onNavigate('dizimo')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all rounded-lg active:scale-95 ${
            activeScreen === 'dizimo'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 ${activeScreen === 'dizimo' ? 'text-amber-400' : 'text-slate-400'}`} />
            {activeScreen === 'dizimo' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[11px] font-semibold mt-1 tracking-tight">Dízimo</span>
        </button>

        {/* Tab 2: Comunidade */}
        <button
          type="button"
          onClick={() => onNavigate('comunidade')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all rounded-lg active:scale-95 ${
            activeScreen === 'comunidade'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 ${activeScreen === 'comunidade' ? 'text-blue-400' : 'text-slate-400'}`} />
            {activeScreen === 'comunidade' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </div>
          <span className="text-[11px] font-semibold mt-1 tracking-tight">Comunidade</span>
        </button>

        {/* Tab 3: Doar Pix (Quick Action CTA) */}
        <button
          type="button"
          onClick={onOpenQuickPix}
          className="flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all group active:scale-95"
        >
          <div className="w-10 h-10 -mt-3.5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/50 border-2 border-slate-900 group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-emerald-400 mt-0.5 tracking-tight">Doar Pix</span>
        </button>

        {/* Tab 4: Painel Admin */}
        <button
          type="button"
          onClick={() => {
            if (isAdminAuthenticated) {
              onNavigate('admin');
            } else {
              onAdminAuthRequest();
            }
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all rounded-lg active:scale-95 ${
            activeScreen === 'admin'
              ? 'text-amber-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            {isAdminAuthenticated ? (
              <ShieldCheck className={`w-5 h-5 ${activeScreen === 'admin' ? 'text-amber-500' : 'text-slate-400'}`} />
            ) : (
              <Lock className={`w-5 h-5 ${activeScreen === 'admin' ? 'text-amber-500' : 'text-slate-400'}`} />
            )}
            {activeScreen === 'admin' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </div>
          <span className="text-[11px] font-semibold mt-1 tracking-tight">Admin</span>
        </button>
      </div>
    </nav>
  );
};

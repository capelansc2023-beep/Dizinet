import React, { useState } from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  correctPassword: string;
  onSuccess: () => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  correctPassword,
  onSuccess,
  onClose,
  onToast,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setPassword('');
      setError(false);
      onSuccess();
    } else {
      setError(true);
      onToast('❌ Senha administrativa incorreta!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 sm:p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 active:scale-95"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Acesso Restrito</h3>
          <p className="text-xs text-slate-500 mt-1">
            Digite a senha do administrador da Pastoral do Dízimo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              placeholder="Digite a senha..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              className={`w-full px-3.5 py-3 min-h-[46px] text-base sm:text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                error
                  ? 'border-red-400 focus:ring-red-500 bg-red-50/50'
                  : 'border-slate-300 focus:ring-blue-600 bg-white'
              }`}
            />
            {error && (
              <span className="text-xs text-red-500 mt-1 block font-medium">
                Senha incorreta. Tente novamente.
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 min-h-[44px] py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors active:scale-98"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 min-h-[44px] py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Acessar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

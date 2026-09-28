import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 sm:p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 active:scale-95"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
            isDanger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">{message}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 min-h-[44px] py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors active:scale-98"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`w-1/2 min-h-[44px] py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow transition-colors active:scale-98 ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-900 hover:bg-blue-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

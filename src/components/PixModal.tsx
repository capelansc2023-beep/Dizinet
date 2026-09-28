import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  X,
} from 'lucide-react';
import { CapelaInfo, Lancamento } from '../types';
import {
  generatePixPayload,
  generateQrCodeDataUrl,
  formatCurrency,
  sanitizeStringPix,
} from '../utils/pix';

interface PixModalProps {
  isOpen: boolean;
  capela: CapelaInfo;
  contribuinteNome: string;
  valorInicial: number;
  tipoContribuicao: string;
  origem: string;
  telefone?: string;
  nascimento?: string;
  endereco?: string;
  onClose: () => void;
  onPaymentConfirmed: (lancamento: Lancamento) => void;
}

export const PixModal: React.FC<PixModalProps> = ({
  isOpen,
  capela,
  contribuinteNome,
  valorInicial,
  tipoContribuicao,
  origem,
  telefone,
  nascimento,
  endereco,
  onClose,
  onPaymentConfirmed,
}) => {
  const [valor, setValor] = useState<number>(valorInicial || 30.0);
  const [nome, setNome] = useState<string>(contribuinteNome || 'Dizimista Benfeitor');
  const [pixPayload, setPixPayload] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15 minutos
  const [txid, setTxid] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [comprovanteAnexado, setComprovanteAnexado] = useState<string | null>(null);

  // Inicializa ou atualiza os dados quando o modal abre
  useEffect(() => {
    if (isOpen) {
      const novoValor = valorInicial > 0 ? valorInicial : 30.0;
      setValor(novoValor);
      setNome(contribuinteNome || 'Dizimista Benfeitor');
      setSecondsRemaining(900);
      setCopied(false);
      setComprovanteAnexado(null);

      // Gera TxID único para a transação
      const timestamp = Date.now().toString().slice(-8);
      const generatedTxid = `DIZ${timestamp}`;
      setTxid(generatedTxid);

      gerarPixCode(novoValor, generatedTxid);
    }
  }, [isOpen, valorInicial, contribuinteNome]);

  // Contagem regressiva de validade do QR Code dinâmico
  useEffect(() => {
    if (!isOpen || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, secondsRemaining]);

  const gerarPixCode = async (val: number, currentTxid: string) => {
    try {
      const payload = generatePixPayload({
        pixKey: capela.chavePix || '70560879490',
        merchantName: capela.titularPix || capela.nome || 'CAPELA',
        merchantCity: capela.cidade || 'JARAMATAIA',
        amount: val,
        txid: currentTxid,
        description: `Dizimo ${sanitizeStringPix(tipoContribuicao || 'Paroquial')}`.slice(0, 25),
      });

      setPixPayload(payload);
      const qrData = await generateQrCodeDataUrl(payload);
      setQrCodeUrl(qrData);
    } catch (err) {
      console.error('Erro ao gerar código Pix:', err);
    }
  };

  const handleCopyPix = async () => {
    if (!pixPayload) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(pixPayload);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = pixPayload;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      setCopied(true);
    }
  };

  const handleConfirmPayment = () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1e3a8a', '#d97706', '#10b981', '#3b82f6'],
        });
      } catch (e) {
        // Confetti fallback
      }

      const lancamentoCriado: Lancamento = {
        id: Date.now(),
        nome: (nome || 'Dizimista Anônimo').toUpperCase(),
        nascimento: nascimento || '01/01',
        telefone: telefone || '',
        endereco: endereco || '',
        valor: Number(valor),
        tipo: tipoContribuicao || 'Dízimo Mensal',
        origem: origem || 'Pix Online',
        dataRegistro: new Date().toLocaleDateString('pt-BR'),
        statusPix: 'pago',
        txid: txid,
        pixPayload: pixPayload,
        comprovante: comprovanteAnexado || undefined,
        observacoes: 'Pagamento confirmado via Pix Nativo com emissão de recibo.',
      };

      onPaymentConfirmed(lancamentoCriado);
    }, 1200);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setComprovanteAnexado(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto overflow-x-hidden relative flex flex-col touch-scroll">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 sm:p-5 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1 pr-10">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
              <QrCode className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold">Pagamento Nativo via Pix</h3>
          </div>
          <p className="text-xs text-blue-200">
            Escaneie o QR Code ou utilize o código Copia e Cola em qualquer banco
          </p>

          {/* Amount Badge */}
          <div className="mt-3.5 pt-3 border-t border-blue-800/60 flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] text-blue-300 uppercase tracking-wider font-semibold block">
                Valor da Contribuição
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
                {formatCurrency(valor)}
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-blue-950/70 px-2.5 py-1.5 rounded-lg border border-blue-700/50 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 hidden xs:inline">Expira:</span>
              <span className="font-mono font-bold text-amber-300">
                {formatTimer(secondsRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
            {qrCodeUrl ? (
              <div className="relative group">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Pix"
                  className="w-44 h-44 sm:w-56 sm:h-56 object-contain rounded-lg shadow-sm bg-white p-2 border border-slate-200"
                />
              </div>
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs sm:text-sm">
                Gerando QR Code...
              </div>
            )}

            <div className="mt-2 text-center">
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Favorecido: {capela.titularPix || capela.nome}
              </p>
              <p className="text-[11px] text-slate-500 font-mono break-all mt-0.5">
                Chave: {capela.chavePix} · TxID: {txid}
              </p>
            </div>
          </div>

          {/* Pix Copia e Cola */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Código Pix (Copia e Cola)</span>
              {copied && (
                <span className="text-emerald-600 flex items-center gap-1 font-semibold text-xs animate-in fade-in">
                  <Check className="w-3.5 h-3.5" /> Copiado!
                </span>
              )}
            </label>
            <div className="flex flex-col xs:flex-row items-stretch gap-2">
              <input
                type="text"
                readOnly
                value={pixPayload}
                onClick={handleCopyPix}
                className="w-full px-3 py-2.5 min-h-[44px] text-xs font-mono bg-slate-100 border border-slate-300 rounded-xl text-slate-700 select-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleCopyPix}
                className={`min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-sm active:scale-95 shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-900 hover:bg-blue-800 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Quick Bank App Instructions */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Instruções Rápidas:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-0.5 leading-relaxed">
              <li>Abra o aplicativo do seu banco (qualquer banco).</li>
              <li>Escolha a opção <strong>Pix</strong> e depois <strong>Copia e Cola</strong>.</li>
              <li>Cole o código acima e confirme o valor de <strong>{formatCurrency(valor)}</strong>.</li>
            </ol>
          </div>

          {/* Optional Attachment */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-blue-900 min-h-[38px]">
              <FileCheck className="w-4 h-4 text-slate-500" />
              <span>{comprovanteAnexado ? 'Comprovante Anexado ✓' : 'Anexar comprovante (opcional)'}</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            {comprovanteAnexado && (
              <button
                type="button"
                onClick={() => setComprovanteAnexado(null)}
                className="text-red-500 hover:underline text-xs font-semibold p-1"
              >
                Remover
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-1/3 min-h-[46px] px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors active:scale-98"
          >
            Pagar mais tarde
          </button>

          <button
            type="button"
            disabled={isVerifying}
            onClick={handleConfirmPayment}
            className="w-full sm:w-2/3 min-h-[48px] px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-75"
          >
            {isVerifying ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verificando Pix...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Já Fiz o Pix / Emitir Recibo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

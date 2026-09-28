import React, { useState, useEffect } from 'react';
import { AppState, Lancamento, Agente, Missa, Intencao, MuralAviso } from './types';
import { loadAppState, saveAppState, syncWithGoogleSheets } from './utils/storage';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DizimoScreen } from './components/DizimoScreen';
import { CommunityScreen } from './components/CommunityScreen';
import { AdminScreen } from './components/AdminScreen';
import { PixModal } from './components/PixModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ReportModal } from './components/ReportModal';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { EditLancamentoModal } from './components/EditLancamentoModal';
import { AgenteModal, MissaModal, MuralModal } from './components/AdminSubModals';
import { IntencaoModal } from './components/IntencaoModal';
import { ConfirmModal } from './components/ConfirmModal';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeScreen, setActiveScreen] = useState<'dizimo' | 'comunidade' | 'admin'>('dizimo');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [pixModalData, setPixModalData] = useState<{
    nome: string;
    valor: number;
    tipo: string;
    origem: string;
    telefone?: string;
    nascimento?: string;
    endereco?: string;
  }>({
    nome: '',
    valor: 30,
    tipo: 'Dízimo Mensal',
    origem: 'Pix Online',
  });

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptLancamento, setSelectedReceiptLancamento] = useState<Lancamento | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<{
    mes: string;
    ano: string;
    origem: string;
    filtrados: Lancamento[];
  }>({
    mes: '',
    ano: '2026',
    origem: '',
    filtrados: [],
  });

  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [isEditLancamentoModalOpen, setIsEditLancamentoModalOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null);

  const [isAgenteModalOpen, setIsAgenteModalOpen] = useState(false);
  const [editingAgente, setEditingAgente] = useState<Agente | null>(null);

  const [isMissaModalOpen, setIsMissaModalOpen] = useState(false);
  const [editingMissa, setEditingMissa] = useState<Missa | null>(null);

  const [isIntencaoModalOpen, setIsIntencaoModalOpen] = useState(false);
  const [editingIntencao, setEditingIntencao] = useState<Intencao | null>(null);

  const [isMuralModalOpen, setIsMuralModalOpen] = useState(false);
  const [editingMural, setEditingMural] = useState<MuralAviso | null>(null);

  // Confirm Modal state
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Salva no localStorage quando o state muda
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Carrega sincronização inicial com Google Sheets se configurado
  useEffect(() => {
    let isMounted = true;
    syncWithGoogleSheets(state.googleSheetsUrl, 'listar').then((remoteLancamentos) => {
      if (isMounted && remoteLancamentos && remoteLancamentos.length > 0) {
        setState((prev) => ({
          ...prev,
          lancamentos: remoteLancamentos,
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [state.googleSheetsUrl]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleOpenQuickPix = () => {
    setPixModalData({
      nome: 'Dizimista Benfeitor',
      valor: 30,
      tipo: 'Dízimo Mensal',
      origem: 'Pix Online',
    });
    setIsPixModalOpen(true);
  };

  const handlePaymentConfirmed = (novoLancamento: Lancamento) => {
    setState((prev) => ({
      ...prev,
      lancamentos: [novoLancamento, ...prev.lancamentos],
    }));

    // Sincroniza em segundo plano com a planilha do Google
    syncWithGoogleSheets(state.googleSheetsUrl, 'adicionar', novoLancamento);

    setIsPixModalOpen(false);
    setSelectedReceiptLancamento(novoLancamento);
    setIsReceiptModalOpen(true);
    showToast('🎉 Pagamento Pix registrado com sucesso!');
  };

  const handleSaveDirect = (novoLancamento: Lancamento) => {
    setState((prev) => ({
      ...prev,
      lancamentos: [novoLancamento, ...prev.lancamentos],
    }));
    syncWithGoogleSheets(state.googleSheetsUrl, 'adicionar', novoLancamento);
    setSelectedReceiptLancamento(novoLancamento);
    setIsReceiptModalOpen(true);
  };

  const handleSaveLancamentoModal = (dados: Partial<Lancamento>) => {
    if (editingLancamento) {
      // Editar
      setState((prev) => ({
        ...prev,
        lancamentos: prev.lancamentos.map((l) =>
          l.id === editingLancamento.id ? ({ ...l, ...dados } as Lancamento) : l
        ),
      }));
      syncWithGoogleSheets(state.googleSheetsUrl, 'editar', dados as Lancamento);
      showToast('Lançamento atualizado com sucesso!');
    } else {
      // Criar
      const novo = dados as Lancamento;
      setState((prev) => ({
        ...prev,
        lancamentos: [novo, ...prev.lancamentos],
      }));
      syncWithGoogleSheets(state.googleSheetsUrl, 'adicionar', novo);
      showToast('Novo lançamento cadastrado com sucesso!');
    }
  };

  const handleRequestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModalData({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-900 selection:text-white">
      {/* Header */}
      <Header
        capela={state.capela}
        activeScreen={activeScreen}
        isAdminAuthenticated={isAdminAuthenticated}
        onNavigate={(screen) => setActiveScreen(screen)}
        onOpenQuickPix={handleOpenQuickPix}
        onAdminAuthRequest={() => setIsAdminPasswordModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-8 pb-24 md:pb-8">
        {activeScreen === 'dizimo' && (
          <DizimoScreen
            capela={state.capela}
            lancamentos={state.lancamentos}
            agentes={state.agentes}
            onOpenPixModal={(dados) => {
              setPixModalData(dados);
              setIsPixModalOpen(true);
            }}
            onSaveDirect={handleSaveDirect}
            onToast={showToast}
          />
        )}

        {activeScreen === 'comunidade' && (
          <CommunityScreen
            capela={state.capela}
            lancamentos={state.lancamentos}
            agentes={state.agentes}
            missas={state.missas}
            intencoes={state.intencoes}
            mural={state.mural}
            onOpenNovaIntencao={() => {
              setEditingIntencao(null);
              setIsIntencaoModalOpen(true);
            }}
          />
        )}

        {activeScreen === 'admin' && (
          <AdminScreen
            appState={state}
            onUpdateState={(updater) => setState(updater)}
            onOpenNovoLancamento={() => {
              setEditingLancamento(null);
              setIsEditLancamentoModalOpen(true);
            }}
            onEditLancamento={(l) => {
              setEditingLancamento(l);
              setIsEditLancamentoModalOpen(true);
            }}
            onViewReceipt={(l) => {
              setSelectedReceiptLancamento(l);
              setIsReceiptModalOpen(true);
            }}
            onOpenReportModal={(dados) => {
              setReportData(dados);
              setIsReportModalOpen(true);
            }}
            onOpenNovoAgente={() => {
              setEditingAgente(null);
              setIsAgenteModalOpen(true);
            }}
            onEditAgente={(a) => {
              setEditingAgente(a);
              setIsAgenteModalOpen(true);
            }}
            onOpenNovaMissa={() => {
              setEditingMissa(null);
              setIsMissaModalOpen(true);
            }}
            onEditMissa={(m) => {
              setEditingMissa(m);
              setIsMissaModalOpen(true);
            }}
            onOpenNovaIntencao={() => {
              setEditingIntencao(null);
              setIsIntencaoModalOpen(true);
            }}
            onEditIntencao={(i) => {
              setEditingIntencao(i);
              setIsIntencaoModalOpen(true);
            }}
            onOpenNovoAviso={() => {
              setEditingMural(null);
              setIsMuralModalOpen(true);
            }}
            onEditAviso={(a) => {
              setEditingMural(a);
              setIsMuralModalOpen(true);
            }}
            onRequestConfirm={handleRequestConfirm}
            onToast={showToast}
            onExitAdmin={() => setActiveScreen('dizimo')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-auto py-5 mb-16 md:mb-0 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} {state.capela.nome} · Pastoral do Dízimo
          </p>
          <p className="text-[11px] text-slate-400">
            DiziNet Pro · Pagamentos Pix homologados no padrão BR Code (Banco Central do Brasil)
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Ergonomic Thumb Zone for Smartphones) */}
      <MobileBottomNav
        activeScreen={activeScreen}
        isAdminAuthenticated={isAdminAuthenticated}
        onNavigate={(screen) => setActiveScreen(screen)}
        onOpenQuickPix={handleOpenQuickPix}
        onAdminAuthRequest={() => setIsAdminPasswordModalOpen(true)}
      />

      {/* Modals */}
      <PixModal
        isOpen={isPixModalOpen}
        capela={state.capela}
        contribuinteNome={pixModalData.nome}
        valorInicial={pixModalData.valor}
        tipoContribuicao={pixModalData.tipo}
        origem={pixModalData.origem}
        telefone={pixModalData.telefone}
        nascimento={pixModalData.nascimento}
        endereco={pixModalData.endereco}
        onClose={() => setIsPixModalOpen(false)}
        onPaymentConfirmed={handlePaymentConfirmed}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        capela={state.capela}
        lancamento={selectedReceiptLancamento}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        capela={state.capela}
        lancamentos={reportData.filtrados}
        filtroMes={reportData.mes}
        filtroAno={reportData.ano}
        filtroOrigem={reportData.origem}
        onClose={() => setIsReportModalOpen(false)}
      />

      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        correctPassword={state.adminPassword}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsAdminPasswordModalOpen(false);
          setActiveScreen('admin');
          showToast('Acesso administrativo concedido!');
        }}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        onToast={showToast}
      />

      <EditLancamentoModal
        isOpen={isEditLancamentoModalOpen}
        lancamento={editingLancamento}
        agentes={state.agentes}
        onSave={handleSaveLancamentoModal}
        onClose={() => setIsEditLancamentoModalOpen(false)}
        onToast={showToast}
      />

      <AgenteModal
        isOpen={isAgenteModalOpen}
        agente={editingAgente}
        onSave={(data) => {
          if (editingAgente) {
            setState((prev) => ({
              ...prev,
              agentes: prev.agentes.map((a) =>
                a.id === editingAgente.id ? ({ ...a, ...data } as Agente) : a
              ),
            }));
            showToast('Agente atualizado com sucesso!');
          } else {
            setState((prev) => ({
              ...prev,
              agentes: [...prev.agentes, data as Agente],
            }));
            showToast('Agente adicionado com sucesso!');
          }
        }}
        onClose={() => setIsAgenteModalOpen(false)}
        onToast={showToast}
      />

      <MissaModal
        isOpen={isMissaModalOpen}
        missa={editingMissa}
        capelaNome={state.capela.nome}
        onSave={(data) => {
          if (editingMissa) {
            setState((prev) => ({
              ...prev,
              missas: prev.missas.map((m) =>
                m.id === editingMissa.id ? ({ ...m, ...data } as Missa) : m
              ),
            }));
            showToast('Celebração atualizada com sucesso!');
          } else {
            setState((prev) => ({
              ...prev,
              missas: [...prev.missas, data as Missa],
            }));
            showToast('Celebração adicionada com sucesso!');
          }
        }}
        onClose={() => setIsMissaModalOpen(false)}
        onToast={showToast}
      />

      <IntencaoModal
        isOpen={isIntencaoModalOpen}
        intencao={editingIntencao}
        onSave={(data) => {
          if (editingIntencao) {
            setState((prev) => ({
              ...prev,
              intencoes: prev.intencoes.map((i) =>
                i.id === editingIntencao.id ? ({ ...i, ...data } as Intencao) : i
              ),
            }));
            showToast('Intenção atualizada com sucesso!');
          } else {
            setState((prev) => ({
              ...prev,
              intencoes: [...prev.intencoes, data as Intencao],
            }));
            showToast('Intenção de missa registrada com sucesso!');
          }
        }}
        onClose={() => setIsIntencaoModalOpen(false)}
        onToast={showToast}
      />

      <MuralModal
        isOpen={isMuralModalOpen}
        aviso={editingMural}
        onSave={(data) => {
          if (editingMural) {
            setState((prev) => ({
              ...prev,
              mural: prev.mural.map((m) =>
                m.id === editingMural.id ? ({ ...m, ...data } as MuralAviso) : m
              ),
            }));
            showToast('Aviso atualizado com sucesso!');
          } else {
            setState((prev) => ({
              ...prev,
              mural: [data as MuralAviso, ...prev.mural],
            }));
            showToast('Aviso publicado no mural!');
          }
        }}
        onClose={() => setIsMuralModalOpen(false)}
        onToast={showToast}
      />

      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        title={confirmModalData.title}
        message={confirmModalData.message}
        onConfirm={confirmModalData.onConfirm}
        onClose={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-5 right-4 sm:right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

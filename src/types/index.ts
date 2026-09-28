export type TipoContribuicao = 
  | 'Dízimo Mensal'
  | 'Dízimo Espontâneo'
  | 'Oferta de Missa'
  | 'Doação Festa Padroeira'
  | 'Benfeitor da Capela'
  | 'Campanha da Fraternidade'
  | 'Batismo / Sacramento';

export type StatusPix = 'pago' | 'pendente' | 'nao_aplicavel';

export interface Lancamento {
  id: number | string;
  nome: string;
  nascimento: string; // formato "dd/mm"
  telefone?: string;
  endereco?: string;
  valor: number;
  tipo: TipoContribuicao | string;
  origem: string; // 'Pix Online' ou nome do Agente
  dataRegistro: string; // 'dd/mm/aaaa'
  statusPix?: StatusPix;
  txid?: string;
  pixPayload?: string;
  comprovante?: string; // base64 ou url
  observacoes?: string;
}

export interface Agente {
  id: number;
  nome: string;
  fone: string;
  regiao?: string;
  ativo?: boolean;
}

export interface Missa {
  id: number;
  tipo: 'missa' | 'celebração' | 'festas' | 'novena';
  titulo: string;
  dataHora: string;
  local: string;
  celebrante: string;
  descricao?: string;
}

export interface Intencao {
  id: number;
  solicitante: string;
  falecido: string; // ou motivo da oração
  data: string; // dd/mm/aaaa
  tipoIntencao?: 'Ação de Graças' | 'Sufrágio dos Falecidos' | 'Saúde e Cura' | 'Aniversário' | 'Outro';
  obs?: string;
  status: 'Aprovada' | 'Pendente';
}

export interface MuralAviso {
  id: number;
  titulo: string;
  data: string;
  resumo: string;
  textoCompleto?: string;
  categoria?: 'Pastoral' | 'Avisos Gerais' | 'Festa' | 'Urgente' | 'Geral';
  fixado?: boolean;
}

export interface CapelaInfo {
  nome: string;
  cidade: string;
  estado: string;
  comunidade: string;
  idealizador: string;
  historia: string;
  chavePix: string;
  tipoChavePix: 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria';
  titularPix: string;
  bancoPix?: string;
  metaMensal?: number;
  telefoneContato?: string;
  padroeiro?: string;
}

export interface AppState {
  chavePix: string;
  adminPassword: string;
  googleSheetsUrl: string;
  capela: CapelaInfo;
  lancamentos: Lancamento[];
  agentes: Agente[];
  missas: Missa[];
  intencoes: Intencao[];
  mural: MuralAviso[];
}

import QRCode from 'qrcode';

/**
 * Utilitário de Geração Nativa de Pix (BR Code padrão EMV / Banco Central do Brasil)
 */

// Formata campo no padrão EMV (ID + TAMANHO de 2 dígitos + VALOR)
function formatEMV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

// Remove acentos e caracteres especiais para conformidade com a especificação BACEN
export function sanitizeStringPix(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();
}

/**
 * Cálculo do CRC16 (Polinômio 0x1021, valor inicial 0xFFFF)
 * Conforme especificação do BACEN para o campo 63 do BR Code
 */
export function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txid?: string;
  description?: string;
}

/**
 * Gera a string "Pix Copia e Cola" oficial e válida no Banco Central
 */
export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txid = '***',
  description,
}: PixPayloadParams): string {
  // Limpeza e padronização da chave Pix
  let cleanKey = pixKey.trim();
  // Se for chave numérica como CPF/CNPJ ou celular sem +, limpa pontuação
  if (!cleanKey.includes('@') && !cleanKey.includes('-')) {
    cleanKey = cleanKey.replace(/\D/g, '');
  }

  // Sanitização de Nome (máx 25 chars) e Cidade (máx 15 chars)
  const cleanName = sanitizeStringPix(merchantName || 'CAPELA').slice(0, 25).toUpperCase();
  const cleanCity = sanitizeStringPix(merchantCity || 'CIDADE').slice(0, 15).toUpperCase();
  const cleanTxid = sanitizeStringPix(txid || '***').replace(/\s+/g, '').slice(0, 25) || '***';

  // 00 - Payload Format Indicator (fixo "01")
  let payload = formatEMV('00', '01');

  // 01 - Point of Initiation Method ("12" para QR dinâmico ou valor único)
  payload += formatEMV('01', amount && amount > 0 ? '12' : '11');

  // 26 - Merchant Account Information (GUI + Chave + opcional descrição)
  let mai = formatEMV('00', 'br.gov.bcb.pix');
  mai += formatEMV('01', cleanKey);
  if (description) {
    const cleanDesc = sanitizeStringPix(description).slice(0, 25);
    if (cleanDesc) {
      mai += formatEMV('02', cleanDesc);
    }
  }
  payload += formatEMV('26', mai);

  // 52 - Merchant Category Code ("0000" default)
  payload += formatEMV('52', '0000');

  // 53 - Transaction Currency ("986" para Real BRL)
  payload += formatEMV('53', '986');

  // 54 - Transaction Amount (se houver valor)
  if (amount && amount > 0) {
    payload += formatEMV('54', amount.toFixed(2));
  }

  // 58 - Country Code ("BR")
  payload += formatEMV('58', 'BR');

  // 59 - Merchant Name
  payload += formatEMV('59', cleanName || 'DIZINET');

  // 60 - Merchant City
  payload += formatEMV('60', cleanCity || 'BRASIL');

  // 62 - Additional Data Field Template (TxID)
  const addData = formatEMV('05', cleanTxid);
  payload += formatEMV('62', addData);

  // 63 - CRC16: adicionar cabeçalho '6304' e calcular sobre toda a string
  const payloadToHash = payload + '6304';
  const crc = calculateCRC16(payloadToHash);

  return payloadToHash + crc;
}

/**
 * Gera Data URL em Base64 para exibir o QR Code em tag <img> ou canvas
 */
export async function generateQrCodeDataUrl(payload: string): Promise<string> {
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Erro ao gerar QR Code Pix:', err);
    throw err;
  }
}

/**
 * Formatador Monetário Brasileiro
 */
export function formatCurrency(value: number | string | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return Number(num || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Converte valor numérico em extenso em português (para o Recibo de Dízimo)
 */
export function valorPorExtenso(valor: number): string {
  if (isNaN(valor) || valor <= 0) return 'Zero reais';
  
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  const inteiros = Math.floor(valor);
  const centavos = Math.round((valor - inteiros) * 100);

  function converteGrupo(n: number): string {
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;
    const partes: string[] = [];

    if (c > 0) partes.push(centenas[c]);
    if (d === 1) {
      partes.push(especiais[u]);
    } else {
      if (d > 1) partes.push(dezenas[d]);
      if (u > 0) partes.push(unidades[u]);
    }
    return partes.join(' e ');
  }

  let extenso = '';
  if (inteiros === 0) {
    extenso = '';
  } else if (inteiros === 1) {
    extenso = 'um real';
  } else if (inteiros < 1000) {
    extenso = `${converteGrupo(inteiros)} reais`;
  } else if (inteiros < 1000000) {
    const mil = Math.floor(inteiros / 1000);
    const resto = inteiros % 1000;
    const milExtenso = mil === 1 ? 'mil' : `${converteGrupo(mil)} mil`;
    if (resto > 0) {
      extenso = `${milExtenso}${resto < 100 || resto % 100 === 0 ? ' e ' : ', '}${converteGrupo(resto)} reais`;
    } else {
      extenso = `${milExtenso} reais`;
    }
  } else {
    extenso = `${formatCurrency(inteiros)}`;
  }

  if (centavos > 0) {
    const centavosExtenso = centavos === 1 ? 'um centavo' : `${converteGrupo(centavos)} centavos`;
    extenso += inteiros > 0 ? ` e ${centavosExtenso}` : `${centavosExtenso} de real`;
  }

  return extenso.charAt(0).toUpperCase() + extenso.slice(1);
}

/**
 * Validação e formatação de aniversário (dd/mm, dd-mm, d/m, d-m)
 */
export function validarFormatoNascimento(str: string): boolean {
  if (!str || !str.trim()) return false;
  const clean = str.trim().replace(/-/g, '/');
  const regex = /^([1-9]|[0-2][0-9]|3[0-1])\/([1-9]|1[0-2])$/;
  return regex.test(clean);
}

export function formatarNascimentoPadrao(str: string): string {
  if (!str || !str.trim()) return '';
  const clean = str.trim().replace(/-/g, '/');
  const parts = clean.split('/');
  if (parts.length === 2) {
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    return `${d}/${m}`;
  }
  return str;
}

export function formatarDataAniversario(str?: string): string {
  if (!str) return '-';
  const s = String(str).trim();
  if (s.includes('T') || (s.includes('-') && s.length >= 10)) {
    const partes = s.split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}`;
  }
  if (s.split('-').length === 3 && s.split('-')[0].length === 4) {
    const p = s.split('-');
    return `${p[2]}/${p[1]}`;
  }
  return s;
}

export function formatarDataRegistro(str?: string): string {
  if (!str) return '-';
  const s = String(str).trim();
  if (s.includes('T') || (s.includes('-') && s.length >= 10)) {
    const partes = s.split('T')[0].split('-');
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return s;
}

export function normalizarData(str?: string): string {
  if (!str) return '';
  const clean = String(str).trim().replace(/-/g, '/');
  const parts = clean.split('/');
  if (parts.length === 2) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = new Date().getFullYear();
    return `${day}/${month}/${year}`;
  } else if (parts.length === 3) {
    if (parts[0].length === 4) {
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${day}/${month}/${year}`;
    } else {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) year = '20' + year;
      return `${day}/${month}/${year}`;
    }
  }
  return str;
}

export function toIsoDate(str?: string): string {
  if (!str) return new Date().toISOString().slice(0, 10);
  const limpa = formatarDataRegistro(str);
  const parts = limpa.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return str;
}

export function getMonthFromDate(str?: string): number | null {
  if (!str) return null;
  const s = String(str);
  if (s.includes('T') || (s.includes('-') && s.length >= 10)) {
    const partes = s.split('T')[0].split('-');
    if (partes.length === 3) return parseInt(partes[1], 10);
  }
  const norm = s.includes('/') ? s : normalizarData(s);
  const parts = norm.split('/');
  if (parts.length >= 2) return parseInt(parts[1], 10);
  return null;
}

export function getYearFromDate(str?: string): number | null {
  if (!str) return null;
  const s = String(str);
  if (s.includes('T') || (s.includes('-') && s.length >= 10)) {
    const partes = s.split('T')[0].split('-');
    if (partes.length === 3) return parseInt(partes[0], 10);
  }
  const norm = normalizarData(s);
  const parts = norm.split('/');
  if (parts.length === 3) return parseInt(parts[2], 10);
  return null;
}

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Accepted header aliases, normalized to alphanumeric-lowercase for matching
const HEADER_MAP = {
  optionprice: 'price',
  price: 'price',
  strike: 'strike',
  strikeprice: 'strike',
  maturity: 'maturity',
  timetomaturity: 'maturity',
  type: 'type',
  optiontype: 'type',
};

function normalizeHeader(h) {
  return String(h).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Maps Call/C/0 -> 0, Put/P/1 -> 1. Anything else -> null (row gets dropped).
export function sanitizeType(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const s = String(raw).trim().toLowerCase();
  if (s === 'call' || s === 'c' || s === '0') return 0;
  if (s === 'put' || s === 'p' || s === '1') return 1;
  return null;
}

function toFiniteNumber(raw) {
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

// Takes an array of raw row objects (from Papa/XLSX, arbitrary header casing) and
// returns { matrix, keptCount, droppedCount } where matrix is Nx4:
// [price, strike, maturity, type(0|1)]
export function sanitizeRows(rawRows) {
  const matrix = [];
  let dropped = 0;

  for (const row of rawRows) {
    if (!row || typeof row !== 'object') { dropped++; continue; }

    // Build a normalized-key lookup for this row
    const normalized = {};
    for (const key of Object.keys(row)) {
      const mapped = HEADER_MAP[normalizeHeader(key)];
      if (mapped) normalized[mapped] = row[key];
    }

    const price = toFiniteNumber(normalized.price);
    const strike = toFiniteNumber(normalized.strike);
    const maturity = toFiniteNumber(normalized.maturity);
    const type = sanitizeType(normalized.type);

    const isEmptyRow = Object.values(row).every(
      (v) => v === null || v === undefined || String(v).trim() === ''
    );
    if (isEmptyRow) { continue; } // silently skip blank rows, don't count as "corrupt"

    if (price === null || strike === null || maturity === null || type === null) {
      dropped++;
      continue;
    }

    matrix.push([price, strike, maturity, type]);
  }

  return { matrix, keptCount: matrix.length, droppedCount: dropped };
}

export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        try {
          resolve(sanitizeRows(results.data));
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}

export function parseXLSXFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
        resolve(sanitizeRows(rows));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function parseMarketDataFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'csv') return parseCSVFile(file);
  if (ext === 'xlsx' || ext === 'xls') return parseXLSXFile(file);
  return Promise.reject(new Error('Unsupported file type. Please upload a .csv or .xlsx file.'));
}

export function downloadSampleTemplate() {
  const csvContent =
    'Option Price,Strike,Maturity,Type\n' +
    '12.50,105,0.50,Call\n' +
    '8.20,95,0.50,Put\n' +
    '15.75,110,1.00,C\n' +
    '5.30,90,1.00,P\n' +
    '20.10,115,1.50,Call\n';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'volos_iv_surface_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export const STICKER_DIAMETER_MM = 50;

export interface StickerPerson {
  firstName: string;
  lastName: string;
  workerCode: string;
  companyColor: string;
  publicUrl: string;
}

export function stickerShortName(firstName: string, lastName: string): string {
  const first = firstName.trim().split(/\s+/)[0] ?? '';
  const initial = lastName.trim()[0] ?? '';
  return initial ? `${first} ${initial.toUpperCase()}.` : first;
}

export function stickerGrid(pageWidth = 210, pageHeight = 297) {
  const gap = 8;
  const margin = 12;
  const header = 16;
  const cols = Math.floor((pageWidth - margin * 2 + gap) / (STICKER_DIAMETER_MM + gap));
  const rows = Math.floor((pageHeight - header - margin + gap) / (STICKER_DIAMETER_MM + gap));
  return { cols, rows, gap, margin, header, perPage: cols * rows };
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

async function drawSticker(doc: jsPDF, person: StickerPerson, cx: number, cy: number) {
  const radius = STICKER_DIAMETER_MM / 2;
  const [r, g, b] = hexToRgb(person.companyColor);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.25);
  doc.circle(cx, cy, radius, 'S');
  doc.setFillColor(r, g, b);
  doc.circle(cx, cy, radius - 1.1, 'F');
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, radius - 3.2, 'F');

  doc.setTextColor(r, g, b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('SITESAFE', cx, cy - 14.2, { align: 'center' });

  const qr = await QRCode.toDataURL(person.publicUrl, {
    margin: 1,
    width: 256,
    errorCorrectionLevel: 'M',
    color: { dark: '#0f172a', light: '#ffffff' },
  });
  const qrSize = 22;
  doc.addImage(qr, 'PNG', cx - qrSize / 2, cy - 12.6, qrSize, qrSize);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.text(stickerShortName(person.firstName, person.lastName), cx, cy + 13.4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(person.workerCode, cx, cy + 16.6, { align: 'center' });
}

export async function buildStickerPdf(people: StickerPerson[]): Promise<jsPDF> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const grid = stickerGrid();
  if (people.length === 0) {
    doc.setFontSize(11);
    doc.text('No active workers to print.', 12, 20);
    return doc;
  }
  for (let index = 0; index < people.length; index += 1) {
    const slot = index % grid.perPage;
    if (index > 0 && slot === 0) doc.addPage();
    if (slot === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Print at 100% scale. Do not fit to page. Each circle is 50 mm.', 12, 10);
    }
    const col = slot % grid.cols;
    const row = Math.floor(slot / grid.cols);
    const cx = grid.margin + STICKER_DIAMETER_MM / 2 + col * (STICKER_DIAMETER_MM + grid.gap);
    const cy = grid.header + STICKER_DIAMETER_MM / 2 + row * (STICKER_DIAMETER_MM + grid.gap);
    await drawSticker(doc, people[index], cx, cy);
  }
  return doc;
}

export async function downloadStickerPdf(people: StickerPerson[], filename: string) {
  const doc = await buildStickerPdf(people);
  doc.save(filename);
}

export async function printStickerPdf(people: StickerPerson[]) {
  const doc = await buildStickerPdf(people);
  doc.autoPrint();
  const url = doc.output('bloburl');
  window.open(url, '_blank', 'noopener');
}

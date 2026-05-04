import jsPDF from "jspdf";
import type { Voucher, TravelPackage } from "@/types/crm";

const NAVY: [number, number, number] = [15, 23, 42];
const AMBER: [number, number, number] = [217, 119, 6];
const MUTED: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [226, 232, 240];

const TYPE_LABEL: Record<string, string> = {
  hotel: "Hotel",
  transfer: "Transfer",
  tour: "Passeio",
  ticket: "Ingresso",
  other: "Serviço",
};

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export function generateVoucherPdf(voucher: Voucher, pkg?: TravelPackage) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  let y = 0;

  // Header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 90, "F");
  doc.setFillColor(...AMBER);
  doc.rect(0, 90, W, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("VOUCHER DE SERVIÇO", M, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(TYPE_LABEL[voucher.type] || "Serviço", M, 60);
  doc.setFontSize(9);
  doc.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, W - M, 42, { align: "right" });
  if (voucher.confirmationCode) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Cód. ${voucher.confirmationCode}`, W - M, 60, { align: "right" });
  }

  y = 130;
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(voucher.title, M, y);
  y += 24;

  // Info card
  const drawSection = (title: string, rows: Array<[string, string]>) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...AMBER);
    doc.text(title.toUpperCase(), M, y);
    y += 6;
    doc.setDrawColor(...BORDER);
    doc.line(M, y, W - M, y);
    y += 14;

    doc.setFontSize(10);
    const colW = (W - M * 2) / 2;
    rows.forEach(([label, value], i) => {
      const col = i % 2;
      const x = M + col * colW;
      if (col === 0 && i > 0) y += 28;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(label, x, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      const text = doc.splitTextToSize(value || "—", colW - 10);
      doc.text(text, x, y + 13);
    });
    y += 28 + 16;
  };

  const clientName = pkg?.clientName || "—";
  const destination = pkg
    ? `${pkg.destinationCity}${pkg.destinationCountry ? ", " + pkg.destinationCountry : ""}`
    : "—";
  const travelDates = pkg
    ? `${fmtDate(pkg.departureDate)} → ${fmtDate(pkg.returnDate)}`
    : "—";

  drawSection("Cliente & Viagem", [
    ["Cliente", clientName],
    ["Destino", destination],
    ["Período da viagem", travelDates],
    ["Data do serviço", fmtDate(voucher.serviceDate)],
  ]);

  drawSection("Fornecedor", [
    ["Fornecedor", voucher.supplier || "—"],
    ["Código de confirmação", voucher.confirmationCode || "—"],
  ]);

  // Service details
  const detailEntries = Object.entries(voucher.details || {}).filter(([, v]) => v != null && v !== "");
  if (detailEntries.length) {
    drawSection(
      "Detalhes do serviço",
      detailEntries.map(([k, v]) => [k, String(v)]),
    );
  }

  // Passengers
  if (pkg?.passengers?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...AMBER);
    doc.text("PASSAGEIROS", M, y);
    y += 6;
    doc.setDrawColor(...BORDER);
    doc.line(M, y, W - M, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    pkg.passengers.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.name}${p.document ? ` — ${p.document}` : ""}`, M, y);
      y += 14;
    });
    y += 8;
  }

  // Notes
  if (voucher.notes?.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...AMBER);
    doc.text("OBSERVAÇÕES / INSTRUÇÕES", M, y);
    y += 6;
    doc.setDrawColor(...BORDER);
    doc.line(M, y, W - M, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    const lines = doc.splitTextToSize(voucher.notes, W - M * 2);
    doc.text(lines, M, y);
    y += lines.length * 13 + 10;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 50;
  doc.setDrawColor(...BORDER);
  doc.line(M, footerY, W - M, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    "Apresente este voucher no momento do serviço. Em caso de dúvida, entre em contato com sua agência.",
    M,
    footerY + 14,
  );
  doc.text("TravelCRM", W - M, footerY + 14, { align: "right" });

  const safe = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`voucher-${safe(voucher.title)}.pdf`);
}

// FlowDestinos shared formatters

/** Format ISO yyyy-mm-dd (or full ISO) as dd/mm/aaaa */
export const fmtDate = (iso?: string): string => {
  if (!iso) return "—";
  const datePart = iso.includes("T") ? iso.slice(0, 10) : iso;
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};

/** Format ISO timestamp as dd/mm/aaaa hh:mm */
export const fmtDateTime = (iso?: string): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export const fmtCurrency = (v: number): string =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export const fmtNumber = (v: number): string => v.toLocaleString("pt-BR");

/** "12/05/1990" + age */
export const fmtBirthWithAge = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fmtDate(iso);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return `${fmtDate(iso)} (${age} anos)`;
};

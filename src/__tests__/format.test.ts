import { describe, it, expect } from "vitest";
import { fmtDate, fmtCurrency, fmtNumber, fmtBirthWithAge } from "@/lib/format";

describe("format helpers", () => {
  it("fmtDate converte ISO para dd/mm/aaaa", () => {
    expect(fmtDate("2026-05-06")).toBe("06/05/2026");
    expect(fmtDate("2026-05-06T10:00:00Z")).toBe("06/05/2026");
  });

  it("fmtDate retorna — quando vazio", () => {
    expect(fmtDate(undefined)).toBe("—");
    expect(fmtDate("")).toBe("—");
  });

  it("fmtCurrency formata em BRL sem decimais", () => {
    const s = fmtCurrency(1500);
    expect(s).toContain("1.500");
    expect(s).toMatch(/R\$/);
  });

  it("fmtNumber usa locale pt-BR", () => {
    expect(fmtNumber(1234)).toBe("1.234");
  });

  it("fmtBirthWithAge calcula idade", () => {
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    const iso = tenYearsAgo.toISOString().slice(0, 10);
    expect(fmtBirthWithAge(iso)).toMatch(/\(10 anos\)/);
  });
});

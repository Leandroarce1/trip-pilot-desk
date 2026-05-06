import { describe, it, expect } from "vitest";
import {
  daysBetween, monthsBetween, daysUntilNextBirthday,
  buildAutomationNotifications,
} from "@/lib/automations";

describe("automations — helpers", () => {
  it("daysBetween conta dias inteiros", () => {
    expect(daysBetween(new Date("2026-05-10"), new Date("2026-05-01"))).toBe(9);
  });

  it("monthsBetween cobre mudança de ano", () => {
    expect(monthsBetween(new Date("2026-02-01"), new Date("2025-12-01"))).toBe(2);
  });

  it("daysUntilNextBirthday usa o próximo ano se já passou", () => {
    const today = new Date("2026-05-06");
    expect(daysUntilNextBirthday("1990-05-10", today)).toBe(4);
    expect(daysUntilNextBirthday("1990-05-01", today)).toBeGreaterThan(300);
  });
});

describe("automations — buildAutomationNotifications", () => {
  const today = new Date("2026-05-06");

  it("gera pesquisa de satisfação 2-30 dias após retorno", () => {
    const out = buildAutomationNotifications({
      packages: [{
        id: "p1", clientName: "Ana", destinationCity: "Paris",
        returnDate: "2026-05-01", // 5 dias atrás
      }],
      clients: [], travelers: [], existingKeys: new Set(), today,
    });
    expect(out.find((n) => n.relatedId === "postsale:p1")).toBeDefined();
  });

  it("gera embarque ≤ 7 dias", () => {
    const out = buildAutomationNotifications({
      packages: [{
        id: "p2", clientName: "Bia", destinationCity: "Roma",
        departureDate: "2026-05-10", // em 4 dias
      }],
      clients: [], travelers: [], existingKeys: new Set(), today,
    });
    const dep = out.find((n) => n.relatedId === "departure:p2");
    expect(dep).toBeDefined();
    expect(dep!.type).toBe("departure");
  });

  it("dedupe via existingKeys", () => {
    const out = buildAutomationNotifications({
      packages: [{ id: "p3", clientName: "C", destinationCity: "X", returnDate: "2026-05-01" }],
      clients: [], travelers: [],
      existingKeys: new Set(["postsale:p3"]),
      today,
    });
    expect(out.find((n) => n.relatedId === "postsale:p3")).toBeUndefined();
  });

  it("gera aniversário próximo (cliente)", () => {
    const out = buildAutomationNotifications({
      packages: [], travelers: [],
      clients: [{ id: "c1", name: "Carlos", birthDate: "1990-05-10" }],
      existingKeys: new Set(), today,
    });
    expect(out.find((n) => n.relatedId === "birthday:c1:2026")).toBeDefined();
  });

  it("não gera aniversário fora da janela", () => {
    const out = buildAutomationNotifications({
      packages: [], travelers: [],
      clients: [{ id: "c2", name: "D", birthDate: "1990-08-01" }],
      existingKeys: new Set(), today,
    });
    expect(out.find((n) => n.relatedId?.startsWith("birthday:c2"))).toBeUndefined();
  });
});

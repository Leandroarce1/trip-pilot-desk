import { describe, it, expect } from "vitest";
import {
  mapClient, clientToRow, mapQuote, quoteToRow,
  mapPackage, mapTraveler, mapFlight,
} from "@/lib/mappers";

describe("mappers — snake_case <-> camelCase", () => {
  it("mapClient converte campos básicos e datas", () => {
    const c = mapClient({
      id: "1", name: "Ana", phone: "11", email: "a@b.c", document: "x",
      notes: "n", status: "lead", created_at: "2026-01-15T10:00:00Z",
      profile: { birthDate: "1990-05-01" },
    });
    expect(c.name).toBe("Ana");
    expect(c.createdAt).toBe("2026-01-15");
    expect(c.profile?.birthDate).toBe("1990-05-01");
  });

  it("clientToRow inclui user_id e defaults", () => {
    const row = clientToRow({ name: "X", phone: "1" }, "user-1");
    expect(row.user_id).toBe("user-1");
    expect(row.status).toBe("lead");
    expect(row.email).toBe("");
  });

  it("mapQuote/quoteToRow são reversíveis nos campos chave", () => {
    const row = quoteToRow({
      clientId: "c1", destination: "Paris", value: 1000,
      status: "sent", marginPercent: 20,
    }, "u1");
    expect(row.client_id).toBe("c1");
    expect(row.margin_percent).toBe(20);

    const q = mapQuote({ ...row, id: "q1", created_at: "2026-02-01" }, "Ana");
    expect(q.destination).toBe("Paris");
    expect(q.clientName).toBe("Ana");
    expect(q.marginPercent).toBe(20);
  });

  it("mapPackage trata valores numéricos e jsonb", () => {
    const p = mapPackage({
      id: "p1", client_id: "c1", name: "Chile",
      total_value: "1500.5", commission_percent: "10",
      passengers: [{ name: "A" }], documents: [], history: [],
      reservation_status: "confirmed", payment_status: "pending",
      trip_type: "package", created_at: "2026-03-01",
    }, "Ana");
    expect(p.totalValue).toBe(1500.5);
    expect(p.passengers).toHaveLength(1);
    expect(p.clientName).toBe("Ana");
  });

  it("mapTraveler/mapFlight não quebram com campos vazios", () => {
    expect(mapTraveler({ id: "t" }).name).toBe("");
    expect(mapFlight({ id: "f" }, "Ana").clientName).toBe("Ana");
  });
});

import { Supplier, SupplierCategory, SupplierPaymentTerm } from "@/types/crm";

export const supplierCategoryLabels: Record<SupplierCategory, string> = {
  airline: "Companhia aérea",
  hotel: "Hotel / Resort",
  operator: "Operadora de turismo",
  cruise: "Cruzeiro",
  insurance: "Seguro viagem",
  carRental: "Locadora de veículos",
  transfer: "Transfer / Receptivo",
  other: "Outro",
};

export const supplierCategoryBadge: Record<SupplierCategory, string> = {
  airline: "bg-info-soft text-info-soft-foreground",
  hotel: "bg-success-soft text-success-soft-foreground",
  operator: "bg-[hsl(280_60%_94%)] text-[hsl(280_50%_30%)]",
  cruise: "bg-[hsl(180_45%_92%)] text-[hsl(180_55%_22%)]",
  insurance: "bg-warning-soft text-warning-soft-foreground",
  carRental: "bg-[hsl(48_95%_92%)] text-[hsl(38_85%_25%)]",
  transfer: "bg-secondary text-secondary-foreground",
  other: "bg-muted text-muted-foreground",
};

export const paymentTermLabels: Record<SupplierPaymentTerm, string> = {
  "15": "15 dias",
  "30": "30 dias",
  "45": "45 dias",
  "60": "60 dias",
};

export const supplierCategoryOrder: SupplierCategory[] = [
  "airline", "hotel", "operator", "cruise", "insurance", "carRental", "transfer", "other",
];

export type SupplierFormState = Omit<Supplier, "id" | "createdAt">;

export const emptySupplierForm: SupplierFormState = {
  name: "",
  category: "airline",
  cnpj: "",
  website: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  defaultCommission: 10,
  paymentTerm: "30",
  accessNotes: "",
  notes: "",
  rating: 5,
  active: true,
};

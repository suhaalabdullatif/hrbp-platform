import type { UserRole } from "@workspace/db";

// Dev personas. TEMPORARY until Microsoft Entra ID SSO is wired in.
// Each persona maps to a seeded user (matched by email). The `businessUnitCode`
// links a scoped persona to a specific business unit; null means global scope.
export interface PersonaDef {
  key: string;
  label: string;
  role: UserRole;
  email: string;
  displayName: string;
  // Business unit name used for display + seed matching; null for global roles.
  businessUnitName: string | null;
  // Business unit code used to resolve businessUnitId during seeding/login.
  businessUnitCode: string | null;
}

export const PERSONAS: PersonaDef[] = [
  {
    key: "HRBP_AI",
    label: "HRBP — HUMAIN Intelligence",
    role: "HRBP",
    email: "hrbp.ai@humain.example",
    displayName: "Layla Al-Rashid",
    businessUnitName: "HUMAIN Intelligence",
    businessUnitCode: "HUM_INT",
  },
  {
    key: "HRBP_TECH",
    label: "HRBP — Technology",
    role: "HRBP",
    email: "hrbp.tech@humain.example",
    displayName: "Omar Al-Farsi",
    businessUnitName: "Technology",
    businessUnitCode: "TECH",
  },
  {
    key: "HRBP_CORPORATE",
    label: "HRBP — Human Resources",
    role: "HRBP",
    email: "hrbp.corp@humain.example",
    displayName: "Noura Al-Qahtani",
    businessUnitName: "Human Resources",
    businessUnitCode: "HR",
  },
  {
    key: "CHRO",
    label: "CHRO — Global",
    role: "CHRO",
    email: "chro@humain.example",
    displayName: "Faisal Al-Otaibi",
    businessUnitName: null,
    businessUnitCode: null,
  },
  {
    key: "ADMIN",
    label: "Administrator — Global",
    role: "ADMIN",
    email: "admin@humain.example",
    displayName: "System Administrator",
    businessUnitName: null,
    businessUnitCode: null,
  },
];

export function getPersona(key: string): PersonaDef | undefined {
  return PERSONAS.find((p) => p.key === key);
}

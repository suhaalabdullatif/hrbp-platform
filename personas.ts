import type { UserRole } from "@workspace/db";

// Dev personas. TEMPORARY until Microsoft Entra ID SSO is wired in.
// Each persona maps to a seeded user (matched by email). Business-unit scope is
// resolved at runtime from the user_business_units junction; the names below are
// for display only and mirror the seeded assignments.
export interface PersonaDef {
  key: string;
  label: string;
  role: UserRole;
  email: string;
  displayName: string;
  // Business unit names used for display; empty for global roles.
  businessUnitNames: string[];
}

export const PERSONAS: PersonaDef[] = [
  {
    key: "HRBP_AI",
    label: "HRBP — HUMAIN Intelligence",
    role: "HRBP",
    email: "hrbp.ai@humain.example",
    displayName: "Layla Al-Rashid",
    businessUnitNames: ["HUMAIN Intelligence", "Information Security"],
  },
  {
    key: "HRBP_TECH",
    label: "HRBP — Technology",
    role: "HRBP",
    email: "hrbp.tech@humain.example",
    displayName: "Omar Al-Farsi",
    businessUnitNames: ["Technology", "Information Security"],
  },
  {
    key: "HRBP_CORPORATE",
    label: "HRBP — Human Resources",
    role: "HRBP",
    email: "hrbp.corp@humain.example",
    displayName: "Noura Al-Qahtani",
    businessUnitNames: ["Human Resources"],
  },
  {
    key: "CHRO",
    label: "CHRO — Global",
    role: "CHRO",
    email: "chro@humain.example",
    displayName: "Faisal Al-Otaibi",
    businessUnitNames: [],
  },
  {
    key: "ADMIN",
    label: "Administrator — Global",
    role: "ADMIN",
    email: "admin@humain.example",
    displayName: "System Administrator",
    businessUnitNames: [],
  },
];

export function getPersona(key: string): PersonaDef | undefined {
  return PERSONAS.find((p) => p.key === key);
}

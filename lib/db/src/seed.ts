import { pool, db } from "./index";
import { businessUnitsTable } from "./schema/businessUnits";
import { usersTable } from "./schema/users";
import { userBusinessUnitsTable } from "./schema/userBusinessUnits";
import { employeesTable } from "./schema/employees";
import { requisitionsTable } from "./schema/requisitions";
import { erCasesTable } from "./schema/erCases";
import { attritionTable } from "./schema/attrition";
import { probationTable } from "./schema/probation";
import { auditLogTable } from "./schema/auditLog";

// Deterministic PRNG so reseeding produces stable data.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260625);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function chance(p: number): boolean {
  return rng() < p;
}

function intBetween(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const BUSINESS_UNITS: { name: string; code: string; saudiRate: number }[] = [
  { name: "HUMAIN Shift", code: "SHIFT", saudiRate: 0.55 },
  { name: "Technology", code: "TECH", saudiRate: 0.35 },
  { name: "Information Security", code: "INFOSEC", saudiRate: 0.45 },
  { name: "HUMAIN Compute", code: "COMPUTE", saudiRate: 0.25 },
  { name: "HUMAIN Core", code: "CORE", saudiRate: 0.4 },
  { name: "HUMAIN Intelligence", code: "HUM_INT", saudiRate: 0.3 },
  { name: "Internal Audit", code: "AUDIT", saudiRate: 0.7 },
  { name: "Human Resources", code: "HR", saudiRate: 0.75 },
  { name: "CEO Office", code: "CEO", saudiRate: 0.8 },
  { name: "Chief of Staff", code: "COS", saudiRate: 0.65 },
  { name: "Strategy", code: "STRAT", saudiRate: 0.5 },
  { name: "Finance & Operations", code: "FINOPS", saudiRate: 0.6 },
  { name: "Deputy CEO Office", code: "DCEO", saudiRate: 0.7 },
  { name: "Marketing", code: "MKT", saudiRate: 0.5 },
  { name: "Legal", code: "LEGAL", saudiRate: 0.65 },
  { name: "GRC", code: "GRC", saudiRate: 0.55 },
];

const MALE_FIRST = [
  "Mohammed", "Ahmed", "Abdullah", "Faisal", "Khalid", "Saud", "Omar",
  "Yousef", "Fahad", "Sultan", "Nasser", "Bandar", "Turki", "Majed",
  "James", "David", "Daniel", "Michael", "Rohan", "Arjun", "Wei", "Hassan",
];
const FEMALE_FIRST = [
  "Noura", "Layla", "Sara", "Reem", "Aisha", "Maha", "Hala", "Lama",
  "Jood", "Dana", "Ghada", "Amal", "Hessa", "Wijdan",
  "Emily", "Sophia", "Olivia", "Priya", "Mei", "Fatima", "Mariam",
];
const LAST = [
  "Al-Rashid", "Al-Otaibi", "Al-Qahtani", "Al-Farsi", "Al-Saud",
  "Al-Harbi", "Al-Dossari", "Al-Ghamdi", "Al-Shehri", "Al-Mutairi",
  "Smith", "Johnson", "Khan", "Sharma", "Chen", "Patel", "Hussain", "Said",
];

const JOB_TITLES = [
  "Analyst", "Senior Analyst", "Specialist", "Senior Specialist",
  "Engineer", "Senior Engineer", "Lead Engineer", "Manager",
  "Senior Manager", "Director", "Coordinator", "Associate", "Consultant",
];
const GRADES = ["G7", "G8", "G9", "G10", "G11", "G12", "G13"];

const REQ_TITLES = [
  "Software Engineer", "Data Scientist", "HR Business Partner",
  "Security Analyst", "Product Manager", "Financial Analyst",
  "Legal Counsel", "Marketing Specialist", "Strategy Associate",
  "Platform Engineer", "Compliance Officer", "Recruiter",
];
const RECRUITERS = [
  "Talent Team A", "Talent Team B", "Executive Search", "Tech Recruiting",
];
const ER_TYPES = [
  "Grievance", "Disciplinary", "Misconduct", "Policy Violation",
  "Workplace Conflict", "Performance Concern",
];
const ER_SUMMARIES = [
  "Reported by line manager, under review.",
  "Formal complaint filed; investigation initiated.",
  "Mediation in progress between parties.",
  "Awaiting documentation from involved parties.",
  "Resolved following corrective action.",
];
const ATTRITION_REASONS = [
  "Career growth elsewhere", "Relocation", "Compensation",
  "Performance", "Restructuring", "End of contract", "Personal reasons",
];

async function main() {
  console.log("Clearing existing data...");
  await db.delete(auditLogTable);
  await db.delete(attritionTable);
  await db.delete(probationTable);
  await db.delete(erCasesTable);
  await db.delete(requisitionsTable);
  await db.delete(employeesTable);
  await db.delete(userBusinessUnitsTable);
  await db.delete(usersTable);
  await db.delete(businessUnitsTable);

  console.log("Seeding business units...");
  const insertedBus = await db
    .insert(businessUnitsTable)
    .values(BUSINESS_UNITS.map((b) => ({ name: b.name, code: b.code })))
    .returning();

  const buByCode = new Map(insertedBus.map((b) => [b.code, b]));
  const buMeta = new Map(BUSINESS_UNITS.map((b) => [b.code, b]));

  console.log("Seeding persona users...");
  // Business-unit scope for HRBPs lives in the user_business_units junction.
  // This demonstrates the many-to-many relationship: HRBP_AI and HRBP_TECH each
  // cover multiple units, and Information Security (INFOSEC) is shared by both —
  // so a single HRBP can span many BUs and a single BU can have many HRBPs.
  const userAssignments: { email: string; buCodes: string[] }[] = [
    { email: "hrbp.ai@humain.example", buCodes: ["HUM_INT", "INFOSEC"] },
    { email: "hrbp.tech@humain.example", buCodes: ["TECH", "INFOSEC"] },
    { email: "hrbp.corp@humain.example", buCodes: ["HR"] },
  ];

  const insertedUsers = await db
    .insert(usersTable)
    .values([
      {
        email: "hrbp.ai@humain.example",
        displayName: "Layla Al-Rashid",
        role: "HRBP",
      },
      {
        email: "hrbp.tech@humain.example",
        displayName: "Omar Al-Farsi",
        role: "HRBP",
      },
      {
        email: "hrbp.corp@humain.example",
        displayName: "Noura Al-Qahtani",
        role: "HRBP",
      },
      {
        email: "chro@humain.example",
        displayName: "Faisal Al-Otaibi",
        role: "CHRO",
      },
      {
        email: "admin@humain.example",
        displayName: "System Administrator",
        role: "ADMIN",
      },
    ])
    .returning();

  const userByEmail = new Map(insertedUsers.map((u) => [u.email, u]));
  const assignmentRows = userAssignments.flatMap(({ email, buCodes }) =>
    buCodes.map((code) => ({
      userId: userByEmail.get(email)!.id,
      businessUnitId: buByCode.get(code)!.id,
    })),
  );
  await db.insert(userBusinessUnitsTable).values(assignmentRows);
  console.log(`  ${assignmentRows.length} user-business-unit assignments`);

  console.log("Seeding employees...");
  type EmpInsert = typeof employeesTable.$inferInsert;
  const employees: EmpInsert[] = [];
  let empSeq = 1;

  for (const bu of insertedBus) {
    const meta = buMeta.get(bu.code)!;
    const headcount = intBetween(18, 38);
    for (let i = 0; i < headcount; i++) {
      const isFemale = chance(0.35);
      const firstName = isFemale ? pick(FEMALE_FIRST) : pick(MALE_FIRST);
      const fullName = `${firstName} ${pick(LAST)}`;
      const num = String(empSeq++).padStart(4, "0");

      // Distribution: most active, some on probation (recent hires), some terminated.
      const roll = rng();
      let status: string;
      let hireDate: Date;
      let terminationDate: string | null = null;

      if (roll < 0.1) {
        status = "terminated";
        hireDate = daysAgo(intBetween(400, 2200));
        terminationDate = ymd(daysAgo(intBetween(10, 400)));
      } else if (roll < 0.22) {
        status = "on_probation";
        hireDate = daysAgo(intBetween(5, 88));
      } else {
        status = "active";
        hireDate = daysAgo(intBetween(120, 2400));
      }

      employees.push({
        employeeNumber: `EMP${num}`,
        fullName,
        email: `${firstName.toLowerCase()}.${num}@humain.example`,
        gender: isFemale ? "F" : "M",
        isSaudi: chance(meta.saudiRate),
        businessUnitId: bu.id,
        jobTitle: pick(JOB_TITLES),
        grade: pick(GRADES),
        employmentStatus: status,
        hireDate: ymd(hireDate),
        terminationDate,
      });
    }
  }

  const insertedEmployees = await db
    .insert(employeesTable)
    .values(employees)
    .returning();
  console.log(`  ${insertedEmployees.length} employees`);

  console.log("Seeding attrition (from terminated employees)...");
  type AttrInsert = typeof attritionTable.$inferInsert;
  const attrition: AttrInsert[] = [];
  for (const e of insertedEmployees) {
    if (e.employmentStatus === "terminated" && e.terminationDate) {
      attrition.push({
        employeeId: e.id,
        businessUnitId: e.businessUnitId,
        attritionType: chance(0.7) ? "voluntary" : "involuntary",
        reason: pick(ATTRITION_REASONS),
        exitDate: e.terminationDate,
      });
    }
  }
  if (attrition.length) await db.insert(attritionTable).values(attrition);
  console.log(`  ${attrition.length} attrition records`);

  console.log("Seeding probation (from on-probation employees)...");
  type ProbInsert = typeof probationTable.$inferInsert;
  const probation: ProbInsert[] = [];
  for (const e of insertedEmployees) {
    if (e.employmentStatus === "on_probation") {
      const start = new Date(e.hireDate);
      const end = addDays(start, 90);
      probation.push({
        employeeId: e.id,
        businessUnitId: e.businessUnitId,
        startDate: e.hireDate,
        endDate: ymd(end),
        status: "pending",
      });
    }
  }
  // A few completed probation records for history.
  for (const e of insertedEmployees) {
    if (e.employmentStatus === "active" && chance(0.05)) {
      const start = new Date(e.hireDate);
      const end = addDays(start, 90);
      probation.push({
        employeeId: e.id,
        businessUnitId: e.businessUnitId,
        startDate: e.hireDate,
        endDate: ymd(end),
        status: "passed",
        reviewDate: ymd(end),
        outcome: "confirmed",
      });
    }
  }
  if (probation.length) await db.insert(probationTable).values(probation);
  console.log(`  ${probation.length} probation records`);

  console.log("Seeding requisitions...");
  type ReqInsert = typeof requisitionsTable.$inferInsert;
  const requisitions: ReqInsert[] = [];
  let reqSeq = 1;
  for (const bu of insertedBus) {
    const count = intBetween(2, 6);
    for (let i = 0; i < count; i++) {
      const roll = rng();
      const status = roll < 0.5 ? "open" : roll < 0.85 ? "filled" : "cancelled";
      // Some open reqs are aged (> 60 days) to trigger alerts.
      const opened =
        status === "open" && chance(0.5)
          ? daysAgo(intBetween(65, 150))
          : daysAgo(intBetween(1, 90));
      requisitions.push({
        title: `${pick(REQ_TITLES)} (${bu.code}-${reqSeq++})`,
        businessUnitId: bu.id,
        status,
        grade: pick(GRADES),
        openedDate: ymd(opened),
        targetCloseDate: ymd(addDays(opened, 60)),
        filledDate: status === "filled" ? ymd(addDays(opened, intBetween(20, 70))) : null,
        recruiter: pick(RECRUITERS),
      });
    }
  }
  await db.insert(requisitionsTable).values(requisitions);
  console.log(`  ${requisitions.length} requisitions`);

  console.log("Seeding ER cases...");
  type ErInsert = typeof erCasesTable.$inferInsert;
  const erCases: ErInsert[] = [];
  let erSeq = 1;
  const empByBu = new Map<number, typeof insertedEmployees>();
  for (const e of insertedEmployees) {
    const list = empByBu.get(e.businessUnitId) ?? [];
    list.push(e);
    empByBu.set(e.businessUnitId, list);
  }
  for (const bu of insertedBus) {
    const count = intBetween(1, 5);
    const buEmps = empByBu.get(bu.id) ?? [];
    for (let i = 0; i < count; i++) {
      const roll = rng();
      const status =
        roll < 0.35 ? "open" : roll < 0.6 ? "in_progress" : "closed";
      const severity = chance(0.25) ? "high" : chance(0.5) ? "medium" : "low";
      const opened = daysAgo(intBetween(5, 300));
      const linkedEmp = buEmps.length ? pick(buEmps) : null;
      erCases.push({
        caseNumber: `ER-${String(erSeq++).padStart(4, "0")}`,
        employeeId: linkedEmp ? linkedEmp.id : null,
        businessUnitId: bu.id,
        caseType: pick(ER_TYPES),
        severity,
        status,
        openedDate: ymd(opened),
        closedDate: status === "closed" ? ymd(addDays(opened, intBetween(10, 90))) : null,
        summary: pick(ER_SUMMARIES),
      });
    }
  }
  await db.insert(erCasesTable).values(erCases);
  console.log(`  ${erCases.length} ER cases`);

  console.log("Seed complete.");
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    await pool.end();
    process.exit(1);
  });

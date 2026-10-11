/**
 * @file twelveWeek.ts
 * @description Centralized Type Definitions and Zod Schemas for TimesManagement 12WY Operational Hub
 * @author Vasile Chifeac
 * @notes
 * - §4.3 AGENTS.md: Centralized Domain Types (Single Source of Truth)
 * - Protocollo Черепаха 🐢 a 3 Fasi integrato
 * - Dynamic 12-week generation engine
 */

import { z } from "zod";

// ── 1. Turni Ospedalieri Sanitari ──────────────────────────────────────────────
export type HospitalShift = "M" | "P" | "N" | "S" | "R" | "A";
export const HospitalShiftSchema = z.enum(["M", "P", "N", "S", "R", "A"]);

export const SHIFT_DETAILS: Record<
  HospitalShift,
  {
    label: string;
    time: string;
    color: string;
    textColor: string;
    icon: string;
    description: string;
  }
> = {
  M: {
    label: "Mattina",
    time: "07:00 - 14:00",
    color: "sky-7",
    textColor: "white",
    icon: "wb_sunny",
    description:
      "Servizio mattutino. Pomeriggio libero per compiti secondari o allenamento."
  },
  P: {
    label: "Pomeriggio",
    time: "14:00 - 21:00",
    color: "amber-8",
    textColor: "white",
    icon: "wb_twilight",
    description:
      "Servizio pomeridiano. Mattina per blocco strategico 03:10 e rospo A1."
  },
  N: {
    label: "Notte",
    time: "21:00 - 07:00",
    color: "indigo-9",
    textColor: "white",
    icon: "nights_stay",
    description:
      "Servizio notturno ad alto impatto. Evitare carichi cognitivi estremi di giorno."
  },
  S: {
    label: "Smonto",
    time: "Post-notte",
    color: "purple-7",
    textColor: "white",
    icon: "bed",
    description:
      "Recupero biologico obbligatorio, sonno e attività a basso stress."
  },
  R: {
    label: "Riposo",
    time: "Libero",
    color: "emerald-7",
    textColor: "white",
    icon: "hotel",
    description:
      "Giornata libera: focus per Clan Famiglia, business e workout intensi."
  },
  A: {
    label: "Assenza / Ferie",
    time: "Libero",
    color: "teal-8",
    textColor: "white",
    icon: "event_busy",
    description:
      "Assenza programmata, ferie o aggiornamento. Massima flessibilità per famiglia e progetti."
  }
};

/**
 * Normalizza qualsiasi formato data (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) nel formato ISO YYYY-MM-DD
 */
export function normalizeDateToIso(dateStr: string): string {
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = (slashMatch[1] ?? "1").padStart(2, "0");
    const month = (slashMatch[2] ?? "1").padStart(2, "0");
    const year = slashMatch[3] ?? "2026";
    return `${year}-${month}-${day}`;
  }
  const dashMatch = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const day = (dashMatch[1] ?? "1").padStart(2, "0");
    const month = (dashMatch[2] ?? "1").padStart(2, "0");
    const year = dashMatch[3] ?? "2026";
    return `${year}-${month}-${day}`;
  }
  return trimmed;
} /*end normalizeDateToIso*/

/**
 * Normalizza la sigla del turno convertendo in maiuscolo e garantendo un valore valido
 */
export function normalizeShiftCode(shiftStr: string): HospitalShift {
  const upper = shiftStr.trim().toUpperCase();
  if (["M", "P", "N", "S", "R", "A"].includes(upper)) {
    return upper as HospitalShift;
  }
  return "R";
} /*end normalizeShiftCode*/

// ── 2. Priorità Metodo Brian Tracy ABCDE ───────────────────────────────────────
export type Priority = "A1" | "A2" | "B1" | "B2" | "C1" | "D" | "E";
export const PrioritySchema = z.enum(["A1", "A2", "B1", "B2", "C1", "D", "E"]);

export const PRIORITY_DETAILS: Record<
  Priority,
  { label: string; description: string; badgeClass: string; color: string }
> = {
  A1: {
    label: "A1 (Rospo Primario)",
    description:
      "Genera l'80% del valore. Vietato toccare compiti B/C prima di A1.",
    badgeClass: "badge-priority-a",
    color: "negative"
  },
  A2: {
    label: "A2 (Rospo Secondario)",
    description: "Compito critico ad alto impatto successivo ad A1.",
    badgeClass: "badge-priority-a",
    color: "negative"
  },
  B1: {
    label: "B1 (Dovrei fare)",
    description: "Conseguenze lievi. Da eseguire solo dopo i compiti A.",
    badgeClass: "badge-priority-b",
    color: "primary"
  },
  B2: {
    label: "B2 (Dovrei fare)",
    description: "Compito utile secondario.",
    badgeClass: "badge-priority-b",
    color: "primary"
  },
  C1: {
    label: "C1 (Piacere/Nessuna conseguenza)",
    description: "Sarebbe bello fare, ma impatto zero sui risultati chiave.",
    badgeClass: "badge-priority-c",
    color: "secondary"
  },
  D: {
    label: "D (Delega)",
    description: "Compito delegabile a terzi o automazioni.",
    badgeClass: "badge-priority-d",
    color: "purple"
  },
  E: {
    label: "E (Elimina)",
    description:
      "Compito non allineato con il Definite Chief Aim: da eliminare.",
    badgeClass: "badge-priority-e",
    color: "grey-7"
  }
};

// ── 3. Categorie Tattiche & Aree di Vita ───────────────────────────────────────
export type TacticCategory = "business" | "health" | "family" | "finance";
export const TacticCategorySchema = z.enum([
  "business",
  "health",
  "family",
  "finance"
]);

export const CATEGORY_DETAILS: Record<
  TacticCategory,
  { label: string; icon: string; color: string }
> = {
  business: {
    label: "Business (VersiliaCare / ProfessioneSicura)",
    icon: "business_center",
    color: "primary"
  },
  health: {
    label: "Salute (Черепаха 🐢)",
    icon: "fitness_center",
    color: "emerald-5"
  },
  family: { label: "Clan Famiglia & Ma", icon: "favorite", color: "rose-5" },
  finance: {
    label: "Finanze & Investimenti",
    icon: "account_balance_wallet",
    color: "amber-6"
  }
};

// ── 4. Protocollo Черепаха 🐢 a 3 Fasi ─────────────────────────────────────────
export const TurtlePhaseSchema = z.enum(["phase1", "phase2", "phase3"]);
export type TurtlePhase = z.infer<typeof TurtlePhaseSchema>;

export interface TurtlePhaseConfig {
  id: TurtlePhase;
  name: string;
  subtitle: string;
  targetWeight: string;
  targetWaist: string;
  description: string;
  rules: string[];
}

export const TURTLE_PHASE_CONFIG: Record<TurtlePhase, TurtlePhaseConfig> = {
  phase1: {
    id: "phase1",
    name: "Fase 1: Taglio Grasso Addominale (Attuale)",
    subtitle: "Focus addome inferiore e mantenimento peso",
    targetWeight: "70 – 71 kg",
    targetWaist: "-3.5 / -4.0 cm girovita addome",
    description:
      "Perdita di 3.5-4 cm di grasso sull'addome inferiore mantenendo il peso a 70–71 kg mediante deficit controllato e circuiti ad alta intensità.",
    rules: [
      "Zero Zuccheri Raffinati: niente dolci, bibite o snack di reparto",
      "4 Allenamenti a settimana calibrati sui turni M/P/N",
      "Idratazione minima di 2.5 litri d'acqua al giorno"
    ]
  },
  phase2: {
    id: "phase2",
    name: "Fase 2: Consolidamento & Forza Funzionale",
    subtitle: "Reset metabolico e densità muscolare",
    targetWeight: "71 – 73 kg",
    targetWaist: "Mantenimento girovita compatto",
    description:
      "Transizione verso l'ipertrofia: progressione dei carichi su movimenti composti e stabilizzazione della composizione corporea.",
    rules: [
      "Progressione carichi con recuperi controllati",
      "Apporto proteico costante (1.8 - 2.0 g/kg)",
      "Preservazione del girovita senza accumulo adiposo"
    ]
  },
  phase3: {
    id: "phase3",
    name: "Fase 3: Ipertrofia & Massa Magra Target",
    subtitle: "Obiettivo finale: 76 kg di massa magra",
    targetWeight: "76 kg (Massa Magra)",
    targetWaist: "Definizione addominale preservata",
    description:
      "Costruzione muscolare progressiva fino al target definitivo di 76 kg con proporzioni atletiche ottimali per salute e prestazione marziale.",
    rules: [
      "Surplus calorico pulito e monitorato",
      "Volume settimanale calibrato",
      "Qualità del sonno rigorosa e sincronizzata coi turni"
    ]
  }
};

// Storico Misurazioni Fisiche Черепаха 🐢 (Trend nel tempo)
export const PhysicalMeasurementRecordSchema = z.object({
  id: z.string(),
  date: z.string(),
  weightKg: z.number(),
  waistCm: z.number(),
  phase: TurtlePhaseSchema,
  notes: z.string().default("")
});
export type PhysicalMeasurementRecord = z.infer<
  typeof PhysicalMeasurementRecordSchema
>;

export const PhysicalMetricsSchema = z.object({
  currentPhase: TurtlePhaseSchema.default("phase1"),
  weightKg: z.number().default(0),
  waistCm: z.number().default(0),
  targetWaistReductionCm: z.number().default(3.5),
  history: z.array(PhysicalMeasurementRecordSchema).default([]),
  lastUpdated: z.string().default("")
});
export type PhysicalMetrics = z.infer<typeof PhysicalMetricsSchema>;

// ── 5. Macro Obiettivi di Vita del Trimestre (Life Goals) ──────────────────────
export const LifeGoalCategorySchema = z.string();
export type LifeGoalCategory = z.infer<typeof LifeGoalCategorySchema>;

export const LIFE_GOAL_CATEGORY_DETAILS: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  business: {
    label: "Business & Carriera",
    icon: "business_center",
    color: "primary"
  },
  personal: {
    label: "Sviluppo Personale & Salute",
    icon: "fitness_center",
    color: "emerald-5"
  },
  family: {
    label: "Famiglia & Relazioni",
    icon: "favorite",
    color: "rose-5"
  },
  finance: {
    label: "Finanze & Risparmio",
    icon: "account_balance_wallet",
    color: "amber-6"
  }
};

/**
 * Restituisce i metadati visivi di una categoria obiettivo, supportando anche categorie custom
 */
export function getGoalCategoryMeta(category: string): {
  label: string;
  icon: string;
  color: string;
} {
  const meta = LIFE_GOAL_CATEGORY_DETAILS[category];
  if (meta) {
    return meta;
  }
  return {
    label: category,
    icon: "stars",
    color: "cyan-7"
  };
} /*end getGoalCategoryMeta*/

export const LifeGoalSchema = z.object({
  id: z.string(),
  category: LifeGoalCategorySchema,
  title: z.string(),
  deadline: z.string().default(""), // YYYY-MM-DD
  targetDailyHours: z.number().default(0),
  totalTargetHours: z.number().default(0),
  notes: z.string().default(""),
  completed: z.boolean().default(false)
});
export type LifeGoal = z.infer<typeof LifeGoalSchema>;

// ── 6. Timetable Dinamica 12-Week Year ─────────────────────────────────────────
export interface TwelveWeekInfo {
  weekNumber: number;
  fictitiousMonth: string;
  startDate: string; // YYYY-MM-DD (Lunedì)
  endDate: string; // YYYY-MM-DD (Domenica)
  label: string;
}

const FICTITIOUS_MONTHS = [
  "Gennaio 12WY",
  "Febbraio 12WY",
  "Marzo 12WY",
  "Aprile 12WY",
  "Maggio 12WY",
  "Giugno 12WY",
  "Luglio 12WY",
  "Agosto 12WY",
  "Settembre 12WY",
  "Ottobre 12WY",
  "Novembre 12WY",
  "Dicembre 12WY"
];

/**
 * Calcola dinamicamente le 12 settimane esatte a partire da una data di partenza
 * @param startDateStr Data YYYY-MM-DD (Lunedì di inizio ciclo)
 */
export function generateTwelveWeeks(startDateStr: string): TwelveWeekInfo[] {
  const parts = startDateStr.split("-").map(Number);
  const year = parts[0] ?? 2026;
  const month = parts[1] ?? 10;
  const day = parts[2] ?? 12;

  const result: TwelveWeekInfo[] = [];

  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(year, month - 1, day + i * 7);
    const weekEnd = new Date(year, month - 1, day + i * 7 + 6);

    const formatIso = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dt = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dt}`;
    };

    const formatHuman = (d: Date): string => {
      const dt = String(d.getDate()).padStart(2, "0");
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${dt}/${m}`;
    };

    const sStr = formatIso(weekStart);
    const eStr = formatIso(weekEnd);
    const fictMonth = FICTITIOUS_MONTHS[i] ?? `Mese ${i + 1} 12WY`;

    result.push({
      weekNumber: i + 1,
      fictitiousMonth: fictMonth,
      startDate: sStr,
      endDate: eStr,
      label: `Settimana ${i + 1}: ${formatHuman(weekStart)} - ${formatHuman(weekEnd)} (${fictMonth})`
    });
  }

  return result;
} /*end generateTwelveWeeks*/

export const DEFAULT_CYCLE_START = "2026-10-12";
export const TWELVE_WEEKS_TIMETABLE: TwelveWeekInfo[] =
  generateTwelveWeeks(DEFAULT_CYCLE_START);

// ── 7. Tattiche Settimanali con Allocazione Ore ────────────────────────────────
export const TacticItemSchema = z.object({
  id: z.string(),
  weekNumber: z.number().int().min(1).max(12),
  priority: PrioritySchema,
  category: TacticCategorySchema,
  description: z.string(),
  target: z.string(),
  completed: z.boolean(),
  leadIndicator: z.boolean().default(true),
  goalId: z.string().optional(),
  plannedDailyHours: z.number().default(0), // Ore previste/giorno
  loggedDailyHours: z.record(z.string(), z.number()).default({}) // Record<Data YYYY-MM-DD, Ore svolte>
});
export type TacticItem = z.infer<typeof TacticItemSchema>;

// ── 8. Routine e Focus Quotidiano ──────────────────────────────────────────────
export const DailyHabitSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  shift: HospitalShiftSchema,
  workoutDone: z.boolean().default(false),
  zeroSugar: z.boolean().default(false),
  stefan20m: z.boolean().default(false),
  nicholas20m: z.boolean().default(false),
  elina20m: z.boolean().default(false),
  zenMaDone: z.boolean().default(false),
  strategicBlockDone: z.boolean().default(false), // 03:10 - 04:30 AM
  frogA1Done: z.boolean().default(false),
  shiftNotes: z.string().default(""),
  deadlines: z.string().default("")
});
export type DailyHabit = z.infer<typeof DailyHabitSchema>;

// Import Turni Ospedalieri
export const ShiftImportItemSchema = z.object({
  date: z.string().transform(d => normalizeDateToIso(d)),
  shift: z.string().transform(s => normalizeShiftCode(s)),
  note: z.string().optional().default("")
});
export type ShiftImportItem = z.infer<typeof ShiftImportItemSchema>;

// Benessere Clan Famiglia
export const FamilyWellbeingSchema = z.object({
  stefanNicholasSport: z.string().default(""),
  medicalChecks: z.string().default(""),
  coupleOutingPlanned: z.boolean().default(false),
  elinaSupportNotes: z.string().default("")
});
export type FamilyWellbeing = z.infer<typeof FamilyWellbeingSchema>;

// Finanze & Risparmio Clan
export const FinancialStatusSchema = z.object({
  kidsFundPerChild: z.number().default(50),
  emergencyFundCurrent: z.number().default(3600),
  emergencyFundTarget: z.number().default(3600)
});
export type FinancialStatus = z.infer<typeof FinancialStatusSchema>;

// Piano Trimestrale Completo (QuarterPlan)
export const QuarterPlanSchema = z.object({
  version: z.literal("2.0"),
  id: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  cycleStartDate: z.string().default("2026-10-12"),
  goals: z.array(LifeGoalSchema).default([]),
  tactics: z.array(TacticItemSchema).default([]),
  dailyHabits: z.record(z.string(), DailyHabitSchema).default({}),
  physicalMetrics: PhysicalMetricsSchema,
  familyWellbeing: FamilyWellbeingSchema,
  finances: FinancialStatusSchema,
  lastSaved: z.string()
});
export type QuarterPlan = z.infer<typeof QuarterPlanSchema>;

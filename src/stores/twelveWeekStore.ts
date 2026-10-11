/**
 * @file twelveWeekStore.ts
 * @description Centralized Pinia Store for TimesManagement 12WY Operational Hub
 * @author Vasile Chifeac
 * @notes
 * - §4.3 AGENTS.md: Single Source of Truth for State & Persistence
 * - Dynamic 12-Week Timetable recalculated on cycleStartDate change
 * - Protocollo Черепаха 🐢 a 3 Fasi con storico trend
 * - Tabula Rasa: Zero mock data all'inizializzazione
 */

import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { Notify } from "quasar";
import { z } from "zod";
import {
  type QuarterPlan,
  type TacticItem,
  type DailyHabit,
  type HospitalShift,
  type PhysicalMetrics,
  type FamilyWellbeing,
  type FinancialStatus,
  type ShiftImportItem,
  type TwelveWeekInfo,
  type TurtlePhase,
  type LifeGoal,
  type PhysicalMeasurementRecord,
  DEFAULT_CYCLE_START,
  generateTwelveWeeks,
  QuarterPlanSchema,
  ShiftImportItemSchema
} from "@/types/twelveWeek";
import {
  savePlanToFirestore,
  pullPlanFromFirestore,
  createRobotBackup
} from "@/services/firestoreSync";

const STORAGE_KEY = "timesmanagement_12wy_plan_v2";

// Inizializzazione a Pagina Bianca (Tabula Rasa assoluta - nessun dato fittizio)
function createBlankPlan(): QuarterPlan {
  const timetable = generateTwelveWeeks(DEFAULT_CYCLE_START);
  const start = timetable[0]?.startDate || DEFAULT_CYCLE_START;
  const end = timetable[11]?.endDate || "2027-01-03";

  return {
    version: "2.0",
    id: "q4-2026-martial",
    title: "12-Week Year: Esecuzione Marziale",
    startDate: start,
    endDate: end,
    cycleStartDate: DEFAULT_CYCLE_START,
    goals: [], // Tabula Rasa: nessun obiettivo fittizio
    tactics: [], // Tabula Rasa: nessuna tattica "test"
    dailyHabits: {}, // Popolato dall'utente o via import JSON turni
    physicalMetrics: {
      currentPhase: "phase1",
      weightKg: 0,
      waistCm: 0,
      targetWaistReductionCm: 3.5,
      history: [],
      lastUpdated: ""
    },
    familyWellbeing: {
      stefanNicholasSport: "",
      medicalChecks: "",
      coupleOutingPlanned: false,
      elinaSupportNotes: ""
    },
    finances: {
      kidsFundPerChild: 50,
      emergencyFundCurrent: 3600,
      emergencyFundTarget: 3600
    },
    lastSaved: new Date().toISOString()
  };
} /*end createBlankPlan*/

export const useTwelveWeekStore = defineStore("twelveWeek", () => {
  const plan = ref<QuarterPlan>(createBlankPlan());
  const selectedWeek = ref<number>(1);
  const isLoaded = ref<boolean>(false);
  const cloudSyncStatus = ref<"idle" | "syncing" | "synced" | "error">("idle");
  const lastCloudSync = ref<string | null>(null);
  const autoCloudSync = ref<boolean>(false);

  // Data odierna ancorata a Venerdì 9 Ottobre 2026 (settimana rosa di preparazione)
  const currentDate = ref<Date>(new Date(2026, 9, 9));

  const todayDateString = computed<string>(() => {
    const y = currentDate.value.getFullYear();
    const m = String(currentDate.value.getMonth() + 1).padStart(2, "0");
    const d = String(currentDate.value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const formattedToday = computed<string>(() => {
    return currentDate.value.toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  });

  // Timetable dinamica delle 12 settimane ricalcolata in base a cycleStartDate
  const weeksTimetable = computed<TwelveWeekInfo[]>(() => {
    const start = plan.value.cycleStartDate || DEFAULT_CYCLE_START;
    return generateTwelveWeeks(start);
  });

  // Settimana corrente calcolata in base alla data odierna e alla timetable
  const currentWeekNumber = computed<number>(() => {
    const todayStr = todayDateString.value;
    const tt = weeksTimetable.value;
    const match = tt.find(
      w => todayStr >= w.startDate && todayStr <= w.endDate
    );
    if (match) return match.weekNumber;
    const firstWeek = tt[0];
    if (firstWeek && todayStr < firstWeek.startDate) return 1;
    return 12;
  });

  // Metadati della settimana selezionata
  const selectedWeekInfo = computed<TwelveWeekInfo>(() => {
    const tt = weeksTimetable.value;
    const found = tt.find(w => w.weekNumber === selectedWeek.value);
    if (found) return found;
    return (
      tt[0] || {
        weekNumber: 1,
        fictitiousMonth: "Gennaio 12WY",
        startDate: DEFAULT_CYCLE_START,
        endDate: "2026-10-18",
        label: "Settimana 1 (Gennaio 12WY)"
      }
    );
  });

  // Tattiche della settimana selezionata
  const currentWeekTactics = computed<TacticItem[]>(() => {
    return plan.value.tactics.filter(t => t.weekNumber === selectedWeek.value);
  });

  // Calcolo matematico Lead Execution Score: (Completate / Totali) * 100
  function calculateWeekScore(weekNum: number): {
    completed: number;
    total: number;
    score: number;
    isTargetMet: boolean;
  } {
    const weekItems = plan.value.tactics.filter(t => t.weekNumber === weekNum);
    const total = weekItems.length;
    if (total === 0)
      return { completed: 0, total: 0, score: 0, isTargetMet: false };
    const completed = weekItems.filter(t => t.completed).length;
    const score = Math.round((completed / total) * 1000) / 10;
    return {
      completed,
      total,
      score,
      isTargetMet: score >= 85
    };
  } /*end calculateWeekScore*/

  const selectedWeekScore = computed(() => {
    return calculateWeekScore(selectedWeek.value);
  });

  // Score complessivo dell'intero ciclo 12WY
  const overallQuarterScore = computed(() => {
    const total = plan.value.tactics.length;
    if (total === 0) return 0;
    const completed = plan.value.tactics.filter(t => t.completed).length;
    return Math.round((completed / total) * 1000) / 10;
  });

  // Abitudine del giorno odierno (con fallback sicuro su Riposo)
  const todayHabit = computed<DailyHabit>(() => {
    const key = todayDateString.value;
    const existing = plan.value.dailyHabits[key];
    if (existing) {
      return existing;
    }
    return {
      date: key,
      shift: "R",
      workoutDone: false,
      zeroSugar: false,
      stefan20m: false,
      nicholas20m: false,
      elina20m: false,
      zenMaDone: false,
      strategicBlockDone: false,
      frogA1Done: false,
      shiftNotes: "",
      deadlines: ""
    };
  });

  // Milestone Imminenti con Countdown Giorni e Settimane
  const upcomingMilestones = computed(() => {
    const todayStr = todayDateString.value;
    const todayMs = new Date(todayStr).getTime();

    return plan.value.goals
      .filter(g => g.deadline && !g.completed)
      .map(goal => {
        let daysLeft = 0;
        let weeksLeft = 0;
        let isPast = false;

        // Se deadline è formato YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(goal.deadline)) {
          const deadlineMs = new Date(goal.deadline).getTime();
          const diffMs = deadlineMs - todayMs;
          daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          weeksLeft = Math.ceil(daysLeft / 7);
          isPast = daysLeft < 0;
        }

        return {
          ...goal,
          daysLeft,
          weeksLeft,
          isPast
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  });

  // ── Azioni e Mutazioni Tattiche & Ore ─────────────────────────────────────────

  function toggleTactic(id: string): void {
    const item = plan.value.tactics.find(t => t.id === id);
    if (item) {
      item.completed = !item.completed;
      saveToLocalStorage();
    }
  } /*end toggleTactic*/

  function addTactic(
    tactic: Omit<
      TacticItem,
      "id" | "plannedDailyHours" | "loggedDailyHours"
    > & {
      plannedDailyHours?: number | undefined;
      loggedDailyHours?: Record<string, number> | undefined;
      goalId?: string | undefined;
    }
  ): void {
    const newTactic: TacticItem = {
      ...tactic,
      id: `tactic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      plannedDailyHours: tactic.plannedDailyHours ?? 0,
      loggedDailyHours: tactic.loggedDailyHours ?? {},
      goalId: tactic.goalId
    };
    plan.value.tactics.push(newTactic);
    saveToLocalStorage();
    Notify.create({
      type: "positive",
      message: "Tattica aggiunta al piano operativo",
      position: "top-right",
      timeout: 1500
    });
  } /*end addTactic*/

  function deleteTactic(id: string): void {
    const idx = plan.value.tactics.findIndex(t => t.id === id);
    if (idx !== -1) {
      plan.value.tactics.splice(idx, 1);
      saveToLocalStorage();
      Notify.create({
        type: "info",
        message: "Tattica rimossa",
        position: "top-right",
        timeout: 1500
      });
    }
  } /*end deleteTactic*/

  // Registrazione ore lavorate per una data specifica
  function logTacticHours(
    tacticId: string,
    dateStr: string,
    hours: number
  ): void {
    const item = plan.value.tactics.find(t => t.id === tacticId);
    if (item) {
      if (!item.loggedDailyHours) {
        item.loggedDailyHours = {};
      }
      item.loggedDailyHours[dateStr] = Math.max(0, hours);
      saveToLocalStorage();
    }
  } /*end logTacticHours*/

  // Somma ore lavorate per una tattica nella settimana corrente
  function getTacticWeeklyLoggedHours(
    tactic: TacticItem,
    weekInfo: TwelveWeekInfo
  ): number {
    if (!tactic.loggedDailyHours) return 0;
    let sum = 0;
    const start = weekInfo.startDate;
    const end = weekInfo.endDate;

    for (const [date, hours] of Object.entries(tactic.loggedDailyHours)) {
      if (date >= start && date <= end) {
        sum += hours;
      }
    }
    return Math.round(sum * 10) / 10;
  } /*end getTacticWeeklyLoggedHours*/

  // Imposta la data di avvio del ciclo 12WY e ricalcola le settimane
  function setCycleStartDate(startDateStr: string): void {
    plan.value.cycleStartDate = startDateStr;
    const tt = generateTwelveWeeks(startDateStr);
    plan.value.startDate = tt[0]?.startDate || startDateStr;
    plan.value.endDate = tt[11]?.endDate || "";
    saveToLocalStorage();
    Notify.create({
      type: "positive",
      message: `Ciclo 12WY avviato dal ${startDateStr} (12 settimane ricalcolate)`,
      position: "top-right",
      timeout: 2500
    });
  } /*end setCycleStartDate*/

  // ── Gestione Macro Obiettivi (Life Goals) ───────────────────────────────────

  function addLifeGoal(goal: Omit<LifeGoal, "id" | "completed">): void {
    const newGoal: LifeGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      completed: false
    };
    plan.value.goals.push(newGoal);
    saveToLocalStorage();
    Notify.create({
      type: "positive",
      message: "Obiettivo registrato con successo",
      position: "top-right",
      timeout: 1500
    });
  } /*end addLifeGoal*/

  function updateLifeGoal(id: string, patch: Partial<LifeGoal>): void {
    const goal = plan.value.goals.find(g => g.id === id);
    if (goal) {
      Object.assign(goal, patch);
      saveToLocalStorage();
    }
  } /*end updateLifeGoal*/

  function deleteLifeGoal(id: string): void {
    const idx = plan.value.goals.findIndex(g => g.id === id);
    if (idx !== -1) {
      plan.value.goals.splice(idx, 1);
      saveToLocalStorage();
      Notify.create({
        type: "info",
        message: "Obiettivo rimosso",
        position: "top-right",
        timeout: 1500
      });
    }
  } /*end deleteLifeGoal*/

  // ── Gestione Protocollo Черепаха 🐢 a 3 Fasi ─────────────────────────────────

  function setTurtlePhase(phase: TurtlePhase): void {
    plan.value.physicalMetrics.currentPhase = phase;
    saveToLocalStorage();
    Notify.create({
      type: "positive",
      message: `Fase Protocollo Черепаха 🐢 aggiornata`,
      position: "top-right",
      timeout: 1500
    });
  } /*end setTurtlePhase*/

  function addPhysicalMeasurement(
    weightKg: number,
    waistCm: number,
    notes = ""
  ): void {
    const newRecord: PhysicalMeasurementRecord = {
      id: `meas-${Date.now()}`,
      date: todayDateString.value,
      weightKg,
      waistCm,
      phase: plan.value.physicalMetrics.currentPhase || "phase1",
      notes
    };
    if (!plan.value.physicalMetrics.history) {
      plan.value.physicalMetrics.history = [];
    }
    plan.value.physicalMetrics.history.push(newRecord);
    plan.value.physicalMetrics.weightKg = weightKg;
    plan.value.physicalMetrics.waistCm = waistCm;
    plan.value.physicalMetrics.lastUpdated = todayDateString.value;
    saveToLocalStorage();
    Notify.create({
      type: "positive",
      message: "Misurazione registrata nello storico Черепаха 🐢",
      position: "top-right",
      timeout: 1500
    });
  } /*end addPhysicalMeasurement*/

  // Aggiornamento abitudini/turno per una data specifica
  function updateHabit(date: string, patch: Partial<DailyHabit>): void {
    const existing = plan.value.dailyHabits[date];
    const base: DailyHabit = existing || {
      date,
      shift: "R" as HospitalShift,
      workoutDone: false,
      zeroSugar: false,
      stefan20m: false,
      nicholas20m: false,
      elina20m: false,
      zenMaDone: false,
      strategicBlockDone: false,
      frogA1Done: false,
      shiftNotes: "",
      deadlines: ""
    };

    plan.value.dailyHabits[date] = {
      ...base,
      ...patch
    };
    saveToLocalStorage();
  } /*end updateHabit*/

  // Modulo Importazione Turni Ospedalieri (JSON)
  function importShiftsJSON(jsonString: string): {
    success: boolean;
    count: number;
    firstDate?: string | undefined;
    month?: number | undefined;
    year?: number | undefined;
    error?: string | undefined;
  } {
    try {
      const parsed = JSON.parse(jsonString);
      const schema = z.array(ShiftImportItemSchema);
      const validation = schema.safeParse(parsed);

      if (!validation.success) {
        const errDetail = validation.error.issues
          .map(i => `${i.path.join(".")}: ${i.message}`)
          .join(", ");
        Notify.create({
          type: "negative",
          message: `Formato JSON turni non valido: ${errDetail}`,
          position: "top-right",
          timeout: 5000
        });
        return { success: false, count: 0, error: errDetail };
      }

      const items: ShiftImportItem[] = validation.data;
      if (items.length === 0) {
        Notify.create({
          type: "warning",
          message: "Il file JSON non contiene alcun turno.",
          position: "top-right"
        });
        return { success: false, count: 0, error: "Array vuoto" };
      }

      let count = 0;
      for (const item of items) {
        const existing = plan.value.dailyHabits[item.date];
        const base: DailyHabit = existing || {
          date: item.date,
          shift: item.shift,
          workoutDone: false,
          zeroSugar: false,
          stefan20m: false,
          nicholas20m: false,
          elina20m: false,
          zenMaDone: false,
          strategicBlockDone: false,
          frogA1Done: false,
          shiftNotes: item.note || "",
          deadlines: ""
        };

        plan.value.dailyHabits[item.date] = {
          ...base,
          shift: item.shift,
          shiftNotes: item.note ? item.note : base.shiftNotes
        };
        count++;
      }

      saveToLocalStorage();

      // Determina il mese e l'anno del primo turno per sincronizzare la vista del calendario
      const firstDate = items[0]?.date ?? "";
      let month: number | undefined;
      let year: number | undefined;
      if (firstDate) {
        const parts = firstDate.split("-");
        if (parts.length >= 2) {
          year = parseInt(parts[0] ?? "2026", 10);
          month = parseInt(parts[1] ?? "10", 10);
        }
      }

      Notify.create({
        type: "positive",
        message: `${count} turni ospedalieri importati con successo!`,
        position: "top-right",
        timeout: 2500
      });
      return { success: true, count, firstDate, month, year };
    } catch (err) {
      console.error("Errore parsing JSON turni:", err);
      Notify.create({
        type: "negative",
        message: "Errore di sintassi nel file JSON turni",
        position: "top-right"
      });
      return { success: false, count: 0, error: "Parsing error" };
    }
  } /*end importShiftsJSON*/

  function updatePhysicalMetrics(patch: Partial<PhysicalMetrics>): void {
    plan.value.physicalMetrics = {
      ...plan.value.physicalMetrics,
      ...patch,
      lastUpdated: todayDateString.value
    };
    saveToLocalStorage();
  } /*end updatePhysicalMetrics*/

  function updateFamily(patch: Partial<FamilyWellbeing>): void {
    plan.value.familyWellbeing = {
      ...plan.value.familyWellbeing,
      ...patch
    };
    saveToLocalStorage();
  } /*end updateFamily*/

  function updateFinances(patch: Partial<FinancialStatus>): void {
    plan.value.finances = {
      ...plan.value.finances,
      ...patch
    };
    saveToLocalStorage();
  } /*end updateFinances*/

  // Persistenza LocalStorage
  function saveToLocalStorage(): void {
    try {
      plan.value.lastSaved = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan.value));
    } catch (err) {
      console.error("Errore salvataggio localStorage:", err);
    }
  } /*end saveToLocalStorage*/

  function loadFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        plan.value = createBlankPlan();
        saveToLocalStorage();
        isLoaded.value = true;
        return;
      }
      const parsed = JSON.parse(raw);
      const validation = QuarterPlanSchema.safeParse(parsed);
      if (validation.success) {
        plan.value = validation.data;
      } else {
        console.warn(
          "Dati localStorage non validi o versione precedente, inizializzazione tabula rasa."
        );
        plan.value = createBlankPlan();
        saveToLocalStorage();
      }
    } catch (err) {
      console.error("Errore lettura localStorage:", err);
      plan.value = createBlankPlan();
    } finally {
      isLoaded.value = true;
      selectedWeek.value = currentWeekNumber.value;
    }
  } /*end loadFromLocalStorage*/

  function exportJSON(): void {
    try {
      saveToLocalStorage();
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(plan.value, null, 2));
      const downloadAnchor = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `12wy-hub-backup-${timestamp}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      Notify.create({
        type: "positive",
        message: "Backup JSON esportato con successo",
        position: "top-right"
      });
    } catch (err) {
      console.error("Errore export JSON:", err);
      Notify.create({
        type: "negative",
        message: "Impossibile esportare il backup",
        position: "top-right"
      });
    }
  } /*end exportJSON*/

  function importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      const validation = QuarterPlanSchema.safeParse(parsed);
      if (!validation.success) {
        const errorDetails = validation.error.issues
          .map(i => `${i.path.join(".")}: ${i.message}`)
          .join(", ");
        Notify.create({
          type: "negative",
          message: `File backup non valido: ${errorDetails}`,
          position: "top-right",
          timeout: 6000
        });
        return false;
      }

      plan.value = validation.data;
      saveToLocalStorage();
      selectedWeek.value = currentWeekNumber.value;

      Notify.create({
        type: "positive",
        message: "Dati ripristinati con successo dal file JSON!",
        position: "top-right"
      });
      return true;
    } catch (err) {
      console.error("Errore parsing backup JSON:", err);
      Notify.create({
        type: "negative",
        message: "Errore durante il parsing del backup",
        position: "top-right"
      });
      return false;
    }
  } /*end importJSON*/

  function resetToBlank(): void {
    plan.value = createBlankPlan();
    saveToLocalStorage();
    selectedWeek.value = currentWeekNumber.value;
    Notify.create({
      type: "info",
      message: "Agenda azzerata: pagina bianca pronta per nuove tattiche",
      position: "top-right"
    });
  } /*end resetToBlank*/

  watch(
    () => plan.value,
    () => {
      if (isLoaded.value) {
        saveToLocalStorage();
      }
    },
    { deep: true }
  );

  async function syncToCloud(): Promise<boolean> {
    cloudSyncStatus.value = "syncing";
    const res = await savePlanToFirestore(plan.value);
    if (res.success) {
      cloudSyncStatus.value = "synced";
      lastCloudSync.value = res.lastSync ?? new Date().toISOString();
      Notify.create({
        type: "positive",
        message: "Sincronizzazione Cloud (Firestore) completata!",
        position: "top-right"
      });
      return true;
    } else {
      cloudSyncStatus.value = "error";
      Notify.create({
        type: "negative",
        message: res.message || "Errore sincronizzazione Cloud",
        position: "top-right"
      });
      return false;
    }
  } /*end syncToCloud*/

  async function pullFromCloud(): Promise<boolean> {
    cloudSyncStatus.value = "syncing";
    const res = await pullPlanFromFirestore();
    if (res.success && res.plan) {
      plan.value = res.plan;
      saveToLocalStorage();
      cloudSyncStatus.value = "synced";
      lastCloudSync.value = new Date().toISOString();
      selectedWeek.value = currentWeekNumber.value;
      Notify.create({
        type: "positive",
        message: "Piano 12WY ripristinato con successo da Firestore!",
        position: "top-right"
      });
      return true;
    } else {
      cloudSyncStatus.value = "error";
      Notify.create({
        type: "warning",
        message: res.message || "Impossibile scaricare da Firestore",
        position: "top-right"
      });
      return false;
    }
  } /*end pullFromCloud*/

  async function createCloudBackup(): Promise<boolean> {
    const res = await createRobotBackup(plan.value);
    if (res.success) {
      Notify.create({
        type: "positive",
        message: res.message,
        position: "top-right"
      });
      return true;
    } else {
      Notify.create({
        type: "negative",
        message: res.message,
        position: "top-right"
      });
      return false;
    }
  } /*end createCloudBackup*/

  return {
    plan,
    selectedWeek,
    isLoaded,
    cloudSyncStatus,
    lastCloudSync,
    autoCloudSync,
    currentDate,
    todayDateString,
    formattedToday,
    weeksTimetable,
    currentWeekNumber,
    selectedWeekInfo,
    currentWeekTactics,
    selectedWeekScore,
    overallQuarterScore,
    todayHabit,
    upcomingMilestones,
    calculateWeekScore,
    toggleTactic,
    addTactic,
    deleteTactic,
    logTacticHours,
    getTacticWeeklyLoggedHours,
    setCycleStartDate,
    addLifeGoal,
    updateLifeGoal,
    deleteLifeGoal,
    setTurtlePhase,
    addPhysicalMeasurement,
    updateHabit,
    importShiftsJSON,
    updatePhysicalMetrics,
    updateFamily,
    updateFinances,
    saveToLocalStorage,
    loadFromLocalStorage,
    exportJSON,
    importJSON,
    resetToBlank,
    syncToCloud,
    pullFromCloud,
    createCloudBackup
  };
});

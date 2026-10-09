# 💾 Regola 03: Persistenza Reattiva, Tabula Rasa & Import Turni JSON

Questa regola definisce le modalità di memorizzazione, importazione ed esportazione per **TimesManagement 12WY**.

---

## 1. Principio della Tabula Rasa (Pagina Bianca)

- All'avvio iniziale o al reset, lo store **NASCE COMPLETAMENTE VUOTO**:
  - `tactics: []` (zero compiti precompilati)
  - `dailyHabits: {}` (nessun dato forzato)
- L'utente ha in mano una pagina bianca di un'agenda nuova e decide in piena autonomia quali tattiche registrare.

---

## 2. Persistenza Automatica su `localStorage`

- Chiave di memorizzazione:
  ```ts
  const STORAGE_KEY = "timesmanagement_12wy_plan_v2";
  ```
- Qualsiasi mutazione a tattiche, note, parametri fisici Cifap o turni viene automaticamente sincronizzata.

---

## 3. Modulo Importazione Turni Ospedalieri (JSON)

- Formato accettato:
  ```json
  [
    { "date": "2026-10-12", "shift": "M", "note": "Mattina Medicina" },
    { "date": "2026-10-13", "shift": "P", "note": "Pomeriggio" },
    { "date": "2026-10-14", "shift": "N", "note": "Notte" },
    { "date": "2026-10-15", "shift": "S", "note": "Smonto" },
    { "date": "2026-10-16", "shift": "R", "note": "Riposo" }
  ]
  ```
- Validato con Zod a runtime: inietta automaticamente i turni nel calendario reale e nella vista odierna.

---

## 4. Esportazione e Importazione Completa JSON

- Backup completo (`exportJSON()`): scarica il file `12wy-hub-backup-[timestamp].json`.
- Ripristino (`importJSON()`): validazione Zod `QuarterPlanSchema`, rollback sicuro in caso di errori.

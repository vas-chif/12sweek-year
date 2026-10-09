---
name: clinical-shift-planner
description: "Gestione della turnistica ospedaliera (M/P/N/S/R), importazione JSON e armonizzazione con l'agenda 12-Week Year e il Protocollo Черепаха 🐢 a 3 Fasi. Usa quando si manipolano dati sui turni sanitari, si calcolano finestre di recupero post-notte o si pianificano ore di lavoro compatibili con il ritmo biologico."
---

# 🏥 Skill: Clinical Shift Planner — TimesManagement 12WY

Workflow di pianificazione e gestione dei turni sanitari ospedalieri per operatore turnista e costruttore d'impresa.

---

## 1. Classificazione Turni & Orari

- **M (Mattina):** `07:00 - 14:00` — Risveglio presto, pomeriggio per compiti B/C o allenamento leggero.
- **P (Pomeriggio):** `14:00 - 21:00` — Mattina dedicata al Rospo A1 e allo Strategic Block (03:10).
- **N (Notte):** `21:00 - 07:00` — Massima attenzione al debito di sonno; niente carichi cognitivi estremi di giorno.
- **S (Smonto):** `Post-notte` — Solo recupero bio, sonno ristoratore e attività a basso impatto.
- **R (Riposo):** `Libero` — Massima energia per famiglia (Clan), business e workout intensi.

---

## 2. Shift Import Engine JSON

- Accetta un payload JSON contenente l'array trimestrale:
  ```json
  [{ "date": "YYYY-MM-DD", "shift": "M", "note": "Note reparto facoltative" }]
  ```
- Valida con schema Zod `ShiftImportItemSchema`.
- Salva nello store e aggiorna in tempo reale la visualizzazione a calendario e il focus di Oggi.

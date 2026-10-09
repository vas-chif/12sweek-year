---
paths:
  - "src/types/**"
  - "src/stores/**"
  - "src/pages/TodayView.vue"
  - "src/pages/CalendarView.vue"
---

# 🏥 Regola 05: Integrità Turnistica Sanitaria & Armonia 12WY

> **Riferimento:** `AGENTS.md §1 (Clinical Shift Planner)` | **Stack:** Quasar 2 / Vue 3 / TypeScript

Questa regola impedisce allucinazioni dell'AI e disallineamenti cognitivi tra i turni reali ospedalieri dell'utente (operatore sanitario) e la pianificazione degli obiettivi del 12-Week Year.

---

## 1. Mappatura Reale dei Turni Ospedalieri

I turni clinici ospedalieri dell'utente hanno caratteristiche biologiche e orarie non negoziabili:

| Sigla | Turno      | Fascia Oraria | Impatto Energetico & Allocazione Focus                                     |
| :---: | :--------- | :-----------: | :------------------------------------------------------------------------- |
| **M** | Mattina    | 07:00 – 14:00 | Pomeriggio libero per business/allenamento, sveglia prima dell'alba.       |
| **P** | Pomeriggio | 14:00 – 21:00 | Mattina utilizzabile per Strategic Block 03:10 e compiti chiave A1.        |
| **N** | Notte      | 21:00 – 07:00 | Carico cognitivo elevato; vietato pianificare compiti complessi a ridosso. |
| **S** | Smonto     |  Post-notte   | Giornata dedicata al riposo, recupero sonno e decomprimente.               |
| **R** | Riposo     |    Libero     | Massima disponibilità oraria per famiglia e blocchi strategici.            |

---

## 2. Shift Import Engine JSON

1. **Importazione Veloce:** Deve essere sempre garantita l'importazione via array JSON:
   ```json
   [
     { "date": "2026-10-12", "shift": "M", "note": "Reparto Medicina" },
     { "date": "2026-10-13", "shift": "P" }
   ]
   ```
2. **Nessun Overwrite Involontario:** L'importazione aggiorna le date fornite senza cancellare le note o le tattiche preesistenti.
3. **Mappatura Istantanea:** I dati importati devono riflettersi immediatamente sia nelle celle del Calendario a mese singolo, sia nel chip/badge della vista **Oggi**.

---

## 3. Risoluzione dei Conflitti tra Turni e i 4 Pilastri di Vita

L'assistente AI e l'applicazione devono sempre verificare la compatibilità tra il turno e le attività pianificate:

1. **Business (VersiliaCare / ProfessioneSicura):**
   - Nei giorni di Smonto (S) o Notte (N), non forzare orari estenuanti: privilegiare micro-blocchi focalizzati o riposo.
2. **Salute (Protocollo Черепаха 🐢 a 3 Fasi):**
   - 4 allenamenti a settimana devono incastrarsi armonicamente tra i turni M/P/R, evitando sessioni pesanti prima della notte.
3. **Clan Famiglia (Stefan, Nicholas, Elina):**
   - I 20 minuti di presenza pura non negoziabile devono essere protetti a prescindere dal turno di servizio.
4. **Fermo Biologico "Ma":**
   - Il timer di 60 secondi funge da camera di decompressione all'uscita dall'ospedale prima di varcare la soglia di casa.

# 📐 Regola 01: TypeScript Strict, Modelli Immutabili & Validazione Zod

Questa regola definisce gli standard di ingegnerizzazione TypeScript per **TimesManagement 12WY**.

---

## 1. Divieto Assoluto di `any`

- Vietato categoricamente l'uso del tipo `any`.
- In caso di payload esterni o input non tipizzati (es. import turni JSON o `localStorage`), utilizzare `unknown` e validare tramite schema runtime **Zod**.
- Tutte le funzioni, computed properties e metodi dei componenti devono specificare tipi di ritorno espliciti.

---

## 2. Contratti di Dominio Centralizzati (`src/types/twelveWeek.ts`)

Tutti i tipi devono essere definiti con rigore e validati da Zod:

- **`HospitalShift`**: Unione `"M" | "P" | "N" | "S" | "R"`.
- **`Priority`**: Categorizzazione ABCDE `"A1" | "A2" | "B1" | "B2" | "C1" | "D" | "E"`.
- **`TwelveWeekInfo`**: Intervallo esatto delle 12 settimane del Q4 (dal 12/10/2026 al 03/01/2027), con numero progressivo 1-12, data inizio (Lunedì), data fine (Domenica) e mese fittizio associato ("Gennaio 12WY"..."Dicembre 12WY").
- **`ShiftImportItem`**: Schema Zod per importazione turni: `{ date: string, shift: HospitalShift, note?: string }`.
- **`CifapMetrics`**: Parametri fisici Protocollo Cifap (peso in kg, girovita addominale in cm, target -3.5cm, zuccheri zero).
- **`ClanFamilyStatus`**: Presenza Stefan (20m), Nicholas (20m), Elina (20m), pratica del _Ma_ (60s).

---

## 3. Purezza nel Calcolo dello Score 12WY

- Il calcolo dell'Execution Score settimanale è una funzione pura:
  $$\text{Score} = \left(\frac{\text{Tattiche Completate}}{\text{Tattiche Totali}}\right) \times 100$$
- Se non vi sono tattiche caricate, lo score è $0.0\%$.
- La soglia minima di efficacia è fissata rigidamente all'**85%**.

---

## 4. Validazione Runtime su Dati Persistiti ed Esterni

- Caricamento da `localStorage` protetto da `QuarterPlanSchema.safeParse`.
- Modulo di importazione turni sanitari protetto da `z.array(ShiftImportItemSchema).safeParse`.
- In caso di fallimento della validazione, rollback immediato senza corruzione dello stato attivo.

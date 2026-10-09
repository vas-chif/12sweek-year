# 🏛️ 12-Week Year Operational Hub (TimesManagement 12WY)

> **Personal Time Management & Martial Execution System**  
> Progettato per operatori sanitari turnisti, fondatori d'impresa e professionisti che richiedono rigore esecutivo e protezione del tempo biologico.

[![Quasar 2](https://img.shields.io/badge/Quasar-2.x-0284c7.svg?style=flat-square&logo=quasar)](https://quasar.dev)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883.svg?style=flat-square&logo=vue.js)](https://vuejs.org)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.x_Strict-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Pinia](https://img.shields.io/badge/State-Pinia_4-ffd859.svg?style=flat-square&logo=pinia)](https://pinia.vuejs.org)
[![Zod](https://img.shields.io/badge/Schema-Zod_Validation-3068b7.svg?style=flat-square&logo=zod)](https://zod.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

---

## 🎯 Panoramica e Filosofie Fondamentali

L'applicazione unifica il framework **"The 12 Week Year"** di Brian Moran con 4 filosofie cardinali di produttività:

1. **Brian Tracy — Eat That Frog & Metodo ABCDE:**
   - Obbligo di completamento del compito **A1 (Il Rospo)** durante il blocco strategico prima di toccare compiti secondari (B, C, D, E).
2. **Brian Moran — The 12 Week Year & WAM:**
   - Gestione trimestrale a 12 settimane dove ogni settimana equivale a un mese.
   - Lead Indicators controllabili al 100% con **Weekly Accountability Meeting (WAM)** e soglia d'eccellenza al **≥ 85%**.
3. **Napoleon Hill — Definite Chief Aim:**
   - Traguardo trimestrale chiaro e non negoziabile con scadenze connesse.
4. **Miyamoto Musashi — Il Vuoto _Ma_ (間):**
   - Fermo biologico di decompressione di 60 secondi con respirazione diaframmatica per staccare dal carico turnistico ed entrare nel focus operativo.

---

## 🏥 Integrazione Turnistica Ospedaliera

- **Turni M/P/N/S/R:**
  - **M**: Mattina (07:00 - 14:00)
  - **P**: Pomeriggio (14:00 - 21:00)
  - **N**: Notte (21:00 - 07:00)
  - **S**: Smonto (Post-notte / decompressione bio)
  - **R**: Riposo (Libero)
- **Importazione Rapida JSON:** Caricamento massivo della griglia turni trimestrale con mappatura automatica sul calendario e nella vista quotidiana.

---

## 🐢 Protocollo Черепаха a 3 Fasi

Modulo per la salute, la gestione del peso e la composizione corporea strutturato in 3 fasi sequenziali:

- **Fase 1:** Riduzione grasso addominale (-3.5 / -4.0 cm) con peso controllato (70–71 kg), 4 workout settimanali e zero zuccheri raffinati.
- **Fase 2:** Consolidamento metabolico, forza funzionale e progressione dei carichi.
- **Fase 3:** Ipertrofia e costruzione di massa magra target a 76 kg.

---

## 💻 Stack Tecnologico

- **Framework:** [Quasar Framework 2](https://quasar.dev/) con Vite
- **Frontend:** [Vue 3](https://vuejs.org/) (Composition API con `<script setup lang="ts">`)
- **Type-Safety:** TypeScript 5 Strict con validazione runtime [Zod](https://zod.dev/)
- **Store & Persistenza:** [Pinia](https://pinia.vuejs.org/) (Local-First con `localStorage` e Tabula Rasa all'avvio)
- **Cloud Sync:** Firebase Firestore & Firebase Hosting opzionale
- **Stampa Cartacea:** Layout responsive e foglio esecutivo pulito **A4 singolo** (`@media print`) con checkbox compilabili a penna.

---

## 🚀 Installazione & Avvio

### Prerequisiti

- Node.js ≥ 20.0 / 22.x LTS
- Yarn (`npm install -g yarn`)

### 1. Clona il repository

```bash
git clone https://github.com/vas-chif/12sweek-year.git
cd 12sweek-year
```

### 2. Installa le dipendenze

```bash
yarn install
```

### 3. Configura le variabili d'ambiente (opzionale per Cloud Sync)

```bash
cp .env.example .env
# Modifica .env con le tue chiavi Firebase
```

### 4. Avvia il server di sviluppo

```bash
yarn dev
```

L'applicazione sarà accessibile all'indirizzo `http://localhost:9000/`.

---

## 🛡️ Pre-Commit & Qualità del Codice

Il repository adotta standard di sviluppo rigorosi:

```bash
# Typecheck TypeScript Strict
yarn typecheck

# Linter e formattazione veloce
yarn lint

# Build di produzione
yarn build
```

---

## 📄 Licenza

Rilasciato sotto licenza MIT.

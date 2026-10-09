---
name: quasar-architect
description: "Guida per l'architettura Vue 3 Composition API, Quasar 2 Framework e Pinia per TimesManagement 12WY. Usa quando si creano o refactorizzano componenti, pagine orchestratrici, layout o store, garantendo modularità, rispetto dei limiti dimensionali (<250 righe script, <400 righe template) e standardizzazione grafica marziale."
---

# 🏛️ Skill: Quasar Architect — TimesManagement 12WY

Workflow architetturale per lo sviluppo dell'Operational Hub 12WY con Quasar 2, Vue 3 (`<script setup lang="ts">`) e Pinia.

---

## 1. Regole di Modularità Decennale

| Layer                 |  Limite   | Strategia di Decomposizione                                                                |
| :-------------------- | :-------: | :----------------------------------------------------------------------------------------- |
| `<script setup>`      | 250 righe | Estrarre la business logic in un composable tipizzato (`src/composables/use*.ts`).         |
| Componente UI         | 400 righe | Estrarre sotto-componenti dedicati per dialog, card, tabelle o sezioni specifiche.         |
| Pagina Orchestratrice | 600 righe | La pagina non contiene markup pesante inline: assembla 3-4 sotto-componenti specializzati. |
| Store / Moduli TS     | 500 righe | Mantenere azioni focalizzate e separare i calcoli complessi in funzioni pure.              |

---

## 2. Pattern di Codifica Obbligatorio

1. **Ordine dei blocchi nei file `.vue`:**
   - `<script setup lang="ts">` SEMPRE in cima.
   - `<template>` al centro.
   - `<style scoped lang="scss">` in fondo.
2. **Standard import groups:**
   - Framework & Quasar
   - Pinia Stores
   - Types & Zod Schemas
   - Composables / Utils
   - Componenti figli
3. **No tipi duplicati inline:** la Single Source of Truth è `src/types/twelveWeek.ts`.

---
name: qa-engineer
description: "Verifica di qualità pre-commit per TimesManagement 12WY: typecheck strict (vue-tsc), linting, verifica Tabula Rasa (zero mock data) e conformità rendering cartaceo A4. Usa prima di ogni commit o al termine di modifiche architetturali."
---

# 🛡️ Skill: QA Engineer — TimesManagement 12WY

Workflow di assicurazione qualità e test deterministico per l'Operational Hub.

---

## 1. Quality Gate Checklist

Prima di autorizzare qualsiasi commit o rilascio:

1. **TypeScript Strict:**
   ```bash
   yarn typecheck
   ```
   Deve restituire **0 errori** (`Found 0 errors`).
2. **Linting & Code Style:**
   ```bash
   yarn lint
   ```
   Deve completare con **0 errori e 0 warning**.
3. **Tabula Rasa Check:**
   - Verificare che lo stato iniziale non contenga stringhe mockate ("test", ecc.).
4. **Stampa A4 Check:**
   - La scheda settimanale in `@media print` deve impaginarsi perfettamente su foglio singolo A4.

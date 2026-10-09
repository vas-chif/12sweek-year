---
paths:
  - "**"
---

# 🌿 Regola 04: Git & Branch Governance — TimesManagement 12WY

> **Riferimento:** `AGENTS.md §2` | **Stack:** Git / Conventional Commits / Hooks

Questa regola disciplina la gestione del repository per prevenire regressioni, preservare la cronologia e garantire tracciabilità tra le modifiche del codice e gli obiettivi del progetto.

---

## 1. Branching Model

- Lo sviluppo procede ordinatamente su `develop` o su branch di feature dedicati:
  - `feat/12wy-calendar-single-month`
  - `feat/turtle-protocol-phases`
  - `fix/shift-json-import`
- **Divieto Assoluto:** MAI commit o push diretti sul branch `main` in contesti condivisi/produttivi.
- Le modifiche vengono integrate tramite Pull Request o merge verificato dopo il completamento della checklist di pre-commit.

---

## 2. Conventional Commits (Standard Obbligatorio)

Tutti i messaggi di commit devono seguire il formato:

```text
<type>(<scope>): <descrizione sintetica e chiara in italiano o inglese>
```

### Tipi consentiti:

- `feat(12wy)`: Nuova funzionalità (es. countdown scadenze, log ore giornaliere).
- `fix(calendar)`: Correzione di un bug o disallineamento date.
- `refactor(types)`: Ristrutturazione di modelli o store senza alterare la logica di business.
- `perf(store)`: Ottimizzazione reattività Pinia o rendering Quasar.
- `style(ui)`: Ritocchi a CSS/SCSS o palette marziale.
- `docs(agents)`: Aggiornamento regole, skills o documentazione.
- `chore(deps)`: Aggiornamento dipendenze o configurazione build.

---

## 3. Azioni Git Severamente Vietate

```bash
# ❌ VIETATO SENZA CONSENSO ESPLICITO DELL'UTENTE:
git push --force
git push --force-with-lease
git reset --hard HEAD~N
git commit --amend         # su commit già condivisi/pushati
```

---

## 4. Guardie Pre-Commit Fisiche

I controlli di integrità sono resi deterministici dagli script in `hooks/`:

- `hooks/block-main-commit.sh`: Blocca commit non autorizzati su `main`.
- `hooks/pre-commit-guard.sh`: Esegue automaticamente `yarn typecheck` e `yarn lint` prima di consentire il commit.
- Abilitazione con: `yarn setup:hooks`.

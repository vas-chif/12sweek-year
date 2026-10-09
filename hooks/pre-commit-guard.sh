#!/usr/bin/env bash
# ==============================================================================
# @file   hooks/pre-commit-guard.sh
# @desc   Quality gate pre-commit deterministico per TimesManagement 12WY
#         1. Verifica blocco branch 'main'
#         2. TypeScript strict type-check (yarn typecheck)
#         3. Lint check (yarn lint)
# @author Vasile Chifeac
# ==============================================================================

set -e

ROOT_DIR="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$ROOT_DIR/hooks"

echo ""
echo "🔒 [PRE-COMMIT GUARD] TimesManagement 12WY =========================="
echo ""

# ── [1/3] VERIFICA BRANCH ──────────────────────────────────────────────────
echo "🔍 [1/3] Controllo branch attivo..."
if [ -f "$HOOKS_DIR/block-main-commit.sh" ]; then
  bash "$HOOKS_DIR/block-main-commit.sh"
fi
echo "✅      Branch conforme"
echo ""

# ── [2/3] TYPE-CHECK STRICT ────────────────────────────────────────────────
echo "🔍 [2/3] TypeScript Type-Check (yarn typecheck)..."
(cd "$ROOT_DIR" && yarn typecheck)
echo "✅      TypeScript: 0 errori"
echo ""

# ── [3/3] LINT CHECK ───────────────────────────────────────────────────────
echo "🔍 [3/3] Linting (yarn lint)..."
(cd "$ROOT_DIR" && yarn lint)
echo "✅      Lint: 0 errori / warning"
echo ""

echo "🎉 [PRE-COMMIT GUARD] Tutti i controlli superati con successo! ✅"
echo "====================================================================="
echo ""
exit 0

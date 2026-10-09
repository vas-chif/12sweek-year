#!/usr/bin/env bash
# ==============================================================================
# @file   hooks/block-main-commit.sh
# @desc   Impedisce commit diretti non autorizzati sul branch 'main' (§2.1 AGENTS.md)
# @author Vasile Chifeac
# ==============================================================================

BRANCH=$(git branch --show-current)

if [ "$BRANCH" = "main" ]; then
  # Se esiste il branch develop, blocca il commit su main a meno di override esplicito
  if git show-ref --verify --quiet refs/heads/develop; then
    if [ "$ALLOW_MAIN_COMMIT" != "1" ]; then
      echo ""
      echo "❌ [GIT GOVERNANCE BLOCK] =================================="
      echo "   Commit diretto su 'main' VIETATO da AGENTS.md §2.1!"
      echo "   Spostati su 'develop' o su un branch di feature:"
      echo "   👉  git checkout develop"
      echo "   (oppure usa ALLOW_MAIN_COMMIT=1 se autorizzato)"
      echo "============================================================"
      echo ""
      exit 1
    fi
  else
    echo "⚠️  [GIT GOVERNANCE] Branch 'develop' non ancora creato. Commit su 'main' consentito."
  fi
fi

exit 0

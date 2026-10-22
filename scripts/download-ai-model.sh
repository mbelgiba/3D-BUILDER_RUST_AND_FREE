#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON="$PROJECT_ROOT/.venv-triposr/bin/python"

if [[ ! -x "$PYTHON" ]]; then
  echo "Не найдено окружение TripoSR. Сначала выполните: bash scripts/setup-local-ai.sh" >&2
  exit 1
fi

"$PYTHON" - <<'PY'
from huggingface_hub import hf_hub_download, snapshot_download

print("Загрузка весов TripoSR (файл может занимать несколько гигабайт)...")
snapshot_download(
    repo_id="stabilityai/TripoSR",
    allow_patterns=["config.yaml", "model.ckpt"],
)
print("Загрузка конфигурации DINO...")
hf_hub_download(repo_id="facebook/dino-vitb16", filename="config.json")
print("Модель и конфигурация сохранены в кэше Hugging Face.")
PY

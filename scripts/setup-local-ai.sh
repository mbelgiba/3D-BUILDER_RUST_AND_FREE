#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODEL_DIR="$PROJECT_ROOT/vendor/TripoSR"
VENV_DIR="$PROJECT_ROOT/.venv-triposr"
TRIPOSR_COMMIT="107cefdc244c39106fa830359024f6a2f1c78871"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Не найден python3. Установите Python 3.8 или новее." >&2
  exit 1
fi
if ! command -v git >/dev/null 2>&1; then
  echo "Не найден git. Он нужен для загрузки открытого кода TripoSR." >&2
  exit 1
fi

if [[ ! -f "$MODEL_DIR/run.py" ]]; then
  mkdir -p "$(dirname "$MODEL_DIR")"
  git init "$MODEL_DIR"
  git -C "$MODEL_DIR" remote add origin https://github.com/VAST-AI-Research/TripoSR.git
  git -C "$MODEL_DIR" fetch --depth 1 origin "$TRIPOSR_COMMIT"
  git -C "$MODEL_DIR" checkout --detach FETCH_HEAD
fi

if [[ ! -x "$VENV_DIR/bin/python" ]]; then
  python3 -m venv "$VENV_DIR"
fi

"$VENV_DIR/bin/python" -m pip install --upgrade pip setuptools wheel
if command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi -L >/dev/null 2>&1; then
  echo "Обнаружена NVIDIA GPU; устанавливается PyTorch с CUDA 12.1."
  "$VENV_DIR/bin/python" -m pip install torch==2.4.1 torchvision==0.19.1 --index-url https://download.pytorch.org/whl/cu121
else
  echo "NVIDIA GPU не обнаружена; устанавливается CPU-версия PyTorch."
  "$VENV_DIR/bin/python" -m pip install torch==2.4.1 torchvision==0.19.1 --index-url https://download.pytorch.org/whl/cpu
fi
# PyMCubes is a simple CPU implementation; ai/triposr_compat provides the
# torchmcubes-shaped adapter expected by TripoSR without a CUDA extension.
"$VENV_DIR/bin/python" -m pip install Cython==0.29.37
"$VENV_DIR/bin/python" -m pip install --no-build-isolation PyMCubes==0.1.6
"$VENV_DIR/bin/python" -m pip install onnxruntime==1.17.3
"$VENV_DIR/bin/python" -m pip install -r <(grep -Ev 'torchmcubes.git|^gradio$|imageio\[ffmpeg\]' "$MODEL_DIR/requirements.txt") imageio==2.35.1
(
  cd "$MODEL_DIR"
  PYTHONPATH="$PROJECT_ROOT/ai/triposr_compat" "$VENV_DIR/bin/python" -c 'import onnxruntime, torch, tsr.system, torchmcubes'
)
touch "$MODEL_DIR/.rt-studio-ready"

echo
echo "TripoSR установлен. Запускайте RT Studio из корня проекта: cargo run"
echo "Первый запуск генерации скачает веса модели из Hugging Face."

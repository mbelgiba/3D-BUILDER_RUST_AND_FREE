"""CPU-compatible adapter for TripoSR's torchmcubes marching-cubes API."""

import mcubes
import numpy as np
import torch


def marching_cubes(volume: torch.Tensor, threshold: float = 0.0):
    vertices, faces = mcubes.marching_cubes(
        volume.detach().to(device="cpu", dtype=torch.float32).numpy(), threshold
    )
    return (
        torch.from_numpy(np.asarray(vertices, dtype=np.float32)).to(volume.device),
        torch.from_numpy(np.asarray(faces, dtype=np.int64)).to(volume.device),
    )

#!/usr/bin/env python3
"""Embed TripoSR's baked texture atlas into a GLB file."""

import argparse
from pathlib import Path

import trimesh
from PIL import Image, ImageEnhance


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("mesh_obj", type=Path)
    parser.add_argument("texture", type=Path)
    parser.add_argument("output_glb", type=Path)
    args = parser.parse_args()

    mesh = trimesh.load(args.mesh_obj, force="mesh", process=False)
    uv = getattr(mesh.visual, "uv", None)
    if uv is None or len(uv) != len(mesh.vertices):
        raise ValueError("OBJ TripoSR не содержит корректные UV-координаты")

    with Image.open(args.texture) as image:
        # TripoSR marks unused atlas pixels transparent. Exporting that alpha
        # makes GLTF readers treat the entire material as translucent.
        texture = image.convert("RGB")
    texture = ImageEnhance.Color(texture).enhance(1.12)
    texture = ImageEnhance.Contrast(texture).enhance(1.04)
    mesh.visual = trimesh.visual.texture.TextureVisuals(
        uv=uv,
        material=trimesh.visual.material.PBRMaterial(
            baseColorTexture=texture,
            metallicFactor=0.0,
            roughnessFactor=0.82,
            alphaMode="OPAQUE",
            alphaCutoff=0.0,
            doubleSided=True,
        ),
    )
    args.output_glb.parent.mkdir(parents=True, exist_ok=True)
    mesh.export(args.output_glb, file_type="glb")


if __name__ == "__main__":
    main()

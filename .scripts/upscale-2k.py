#!/usr/bin/env python3
"""
Upscale de imagem para 2K usando PIL Lanczos (alta qualidade).
Uso: python3 upscale-2k.py <input.png> [<output.png>] [--size 2048]
"""
import sys
import os
from PIL import Image

def upscale(input_path, output_path=None, target_px=2048):
    if not os.path.exists(input_path):
        print(f"❌ Arquivo não encontrado: {input_path}", file=sys.stderr)
        sys.exit(1)

    img = Image.open(input_path).convert("RGBA" if input_path.endswith(".png") else "RGB")
    w, h = img.size
    max_dim = max(w, h)

    if max_dim >= target_px:
        print(f"✅ Imagem já em {w}×{h}px (≥{target_px}px) — sem alteração")
        if output_path and output_path != input_path:
            img.save(output_path)
        sys.exit(0)

    scale  = target_px / max_dim
    new_w  = int(w * scale)
    new_h  = int(h * scale)

    print(f"🔍 Resolução original: {w}×{h}px")
    print(f"⬆️  Upscale Lanczos → {new_w}×{new_h}px ({target_px}px max)...")

    img_2k = img.resize((new_w, new_h), Image.LANCZOS)

    if not output_path:
        base, ext = os.path.splitext(input_path)
        output_path = base + "-2k" + ext

    img_2k.save(output_path, optimize=True)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"✅ Salvo em: {output_path}")
    print(f"   Resolução: {new_w}×{new_h}px | {size_kb:.1f} KB")

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    target = 2048
    if "--size" in sys.argv:
        idx = sys.argv.index("--size")
        target = int(sys.argv[idx + 1])

    if not args:
        print("Uso: python3 upscale-2k.py <input.png> [<output.png>] [--size 2048]")
        sys.exit(1)

    inp  = args[0]
    outp = args[1] if len(args) > 1 else None
    upscale(inp, outp, target)

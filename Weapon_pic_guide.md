# Weapon Texture Generation Guide

This document is for generating weapon texture images with Gemini Nano or another image model. The goal is to create images that can be used by this Three.js FPS project without looking strange when mapped onto the current procedural weapon models and reload animations.

## Output Folder And Filenames

Create the images in this structure:

```text
src/assets/weapons/
  ak47_atlas.png
  m249_atlas.png
  awp_atlas.png
  knife_atlas.png
  shared_hands_atlas.png
```

Recommended format:

- PNG
- 2048 x 2048 px
- Transparent background
- No text, no labels, no watermark, no logo
- Clean orthographic side/material atlas style
- Sharp details, not blurry, not photographic perspective

## Overall Art Direction

Style:

- Near-future military survival FPS
- Realistic but slightly stylized, suitable for a browser game
- Worn metal, scratched edges, dirt, oil stains, subtle blood or grime only where appropriate
- Colors should match the current game: dark steel, muted olive, worn tan, aged wood, black rubber, small hazard-yellow accents
- Avoid neon sci-fi, toy-like plastic, fantasy ornamentation, excessive gold, oversized decorations, and random unreadable decals

Lighting:

- Even studio lighting
- Minimal shadows
- No dramatic perspective
- Texture detail should be readable when cropped and wrapped onto simple box/cylinder geometry

Important:

- The current game uses procedural geometry, not full imported 3D weapon models.
- These images should work as texture atlases that can be cropped for receiver, barrel, magazine, grip, stock, scope, and blade parts.
- The reload animation moves magazines and hands, so magazine regions must look good as separate moving pieces.

## Atlas Layout

Each weapon atlas should follow this approximate layout:

```text
Top 45%: main weapon receiver/body side texture
Middle 20%: barrel/rail/scope long strips
Lower left 20%: magazine texture, front and side surfaces
Lower middle 15%: grip/stock/handle material
Lower right 20%: small details such as screws, wear marks, tape, rails, bolts
```

Do not write labels inside the image. The layout is for generation consistency only.

## Weapon-Specific Prompts

### AK-47

Generate:

```text
2048x2048 transparent PNG weapon texture atlas for an AK-47 used in a zombie survival FPS. Orthographic flat material atlas, no perspective, no text. Worn black gunmetal receiver with scratches and chipped edges, aged reddish brown wood stock and handguard, curved dark steel magazine as a separate readable section, dark barrel strip, small worn screws and rail details, subtle grime and oil stains. Realistic but slightly stylized game texture, clean edges, usable for Three.js box and cylinder weapon parts.
```

Avoid:

```text
No full scene, no hands, no bullets, no muzzle flash, no background, no labels, no logo, no extreme rust, no gold ornamentation, no cartoon toy look.
```

### M249

Generate:

```text
2048x2048 transparent PNG weapon texture atlas for an M249 light machine gun used in a zombie survival FPS. Orthographic flat material atlas, no perspective, no text. Heavy matte black and dark parkerized steel receiver, large ammo box texture as a separate section, thick barrel strip with heat discoloration, bipod leg texture strips, black rubber grip, muted olive fabric/tape accents, scratched edges and practical military wear. Realistic but slightly stylized game texture, clean crop-friendly parts for Three.js geometry.
```

Avoid:

```text
No full scene, no belt of bullets covering the atlas, no background, no labels, no logo, no futuristic glowing parts, no exaggerated proportions.
```

### AWP

Generate:

```text
2048x2048 transparent PNG weapon texture atlas for an AWP sniper rifle used in a zombie survival FPS. Orthographic flat material atlas, no perspective, no text. Long matte black sniper receiver, slim barrel strip, separate scope tube texture with glass highlights, black rubber grip and stock, small rail and bolt details, subtle gray wear, dust, scratches, and tactical tape. Clean readable shapes for first-person Three.js geometry and right-click scope animation.
```

Avoid:

```text
No huge fantasy scope, no neon glow, no background, no labels, no logo, no full character hands, no excessive camouflage that hides the weapon shape.
```

### Knife

Generate:

```text
2048x2048 transparent PNG weapon texture atlas for a tactical combat knife used in a zombie survival FPS. Orthographic flat material atlas, no perspective, no text. Brushed steel blade texture with sharp edge highlight, black rubber handle texture, dark guard piece, light scratches, small nicks, faint dried grime, readable blade and handle regions separated clearly for cropping. Realistic but slightly stylized game texture.
```

Avoid:

```text
No fantasy sword, no oversized blade, no blood covering the whole blade, no background, no labels, no logo, no hand holding the knife.
```

### Shared Hands And Gloves

Generate:

```text
2048x2048 transparent PNG first-person FPS glove and sleeve material atlas. Orthographic flat material atlas, no perspective, no text. Dark tactical gloves, black leather/fabric palms, worn knuckles, olive-gray sleeves, seams, stitching, dirt, subtle scratches. Designed for simple Three.js box hand shapes during reload animations.
```

Avoid:

```text
No full arms, no character body, no background, no labels, no logo, no colorful superhero gloves, no gore.
```

## Quality Checklist

Before using an image, check:

- Background is transparent.
- Image is 2048 x 2048 PNG.
- No text or watermark exists in the image.
- Main weapon areas are not cut off.
- Magazine texture is clearly separate and usable during reload animation.
- Barrel/scope strips are straight and not perspective warped.
- Details still read when scaled down in first person.
- AK-47, M249, AWP, and Knife look distinct from one another.

## Future Integration Notes

When these files exist, the game can load them with `THREE.TextureLoader` and assign cropped or repeated texture maps to these current weapon parts:

- Receiver/body boxes
- Barrel cylinders
- Magazine boxes
- Grip/stock boxes
- Scope cylinder for AWP
- Knife blade and handle
- Glove/hand boxes

If Nano cannot reliably create transparent PNGs, generate on a flat pure green or pure magenta background and remove the background before placing files into `src/assets/weapons/`.

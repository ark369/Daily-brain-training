# Daily Thinking Studio

A calm, privacy-first, evidence-based static web app for kids ages **5 to 11+**, built around a short daily 4-pillar workout plus an open **Free Play Lab**.

## Why These Games? (Evidence-Backed Design)

Decades of developmental and cognitive psychology meta-analyses (Simons et al., 2016; Melby-Lervåg, Redick, & Hulme, 2016; Sala & Gobet, 2019; Hawes, Gilligan-Lee, & Mix, 2022) show that abstract "IQ-boosting" memory drills rarely transfer broadly—**but** short, spaced daily practice on foundational skills **does** deliver real, lasting learning:

- **Visualize** *(Cube Architect, Shape Shifter, Shape Composer)* — 3D isometric block counting with interactive layer splitting, orthographic top views, vertical/horizontal/diagonal symmetry, predict-first chiral mental rotation, 2D mosaic/tangram tiling, and 3D cube-net folding. Spatial training is highly malleable ($g \approx 0.47$) and uniquely transfers to mathematics ($g \approx 0.28\text{–}0.41$).
- **Compute** *(Number Line Jumper, Fact Studio, Target Forge)* — Linear number-line magnitude with spoken count-on hops and self-partitioning fraction bars, strategy-first math fluency (ten-frames & split multiplication arrays) with spaced-retrieval scheduling, and constructive target-number & factor forging.
- **Analyze** *(Balance Lab, Rule Switcher, Clue Grid Detective)* — Animated pan-balance scales with interactive both-pan algebraic simplification, Function Machines, rule switching, Boolean classification, pattern matrices, and unique-solution deductive logic grids.
- **WordCraft** *(Word Builder, Word Connections, Story Detective)* — 490+ spaced-retrieval items covering phonics & rhymes, compounds, affixes, Greek/Latin roots, visual Analogy Bridges, Shades of Meaning ladders, and 128 contextual micro-stories.

### Research-Aligned Timer & Motivation Policy
- **Untimed** across all spatial, logic, word, and Tier 1 (ages 5–6) activities so kids can reflect and test strategies without anxiety.
- **One calm, self-referenced 60-second Fluency Sprint** inside *Fact Studio* for Tiers 2–4 (following IES Practice Guide 2021, Recommendation 6), always preceded by an untimed visual strategy warm-up and toggleable via per-kid **Calm Mode**.
- **Forgiving Monthly Sticker Calendar, Studio Shelf Keepsakes, 3-Stage Mastery Progression & 16 Competence Milestones** instead of punitive streak counters that reset to zero.

## Per-Kid Profiles & Difficulty Tiers

1. **Sprout (Ages 5–6)** — Untimed, auto Read-Aloud prompts, numbers 0–20, symmetry, mosaic tiling, number bonds, rhymes, CVC phonics & read-aloud micro-stories.
2. **Explorer (Ages 7–8)** — 3D blocks with hidden supports, predict-first rotation, 0–100 estimation, intro multiplication, 3×3 logic grids, compounds, visual analogies & adventure stories.
3. **Challenger (Ages 9–10)** — Orthographic top views, 3D cube nets, fractions/decimals with self-partitioning, Factor Forge, Function Machines, 4×4 deduction grids, Greek/Latin roots & science vignettes.
4. **Trailblazer (Ages 11+)** — Stretch tier with negative numbers, percents, 3-card expression forge, two-scale algebra systems, pure-deduction grids, advanced roots & critical-thinking micro-passages.

Open **Parent Corner** inside the app to customize kids' names, animal avatars, per-pillar tier overrides, Read-Aloud / Calm Mode settings, and download/restore JSON progress backups. All data stays 100% locally in the browser (`localStorage`) with zero tracking or ads.

## Running Locally & Testing

Because this is a zero-build static ES-module web app, serve the folder with any static HTTP server:

```bash
python3 -m http.server 8000
```

Run the automated generator & spaced-retrieval test suite:

```bash
node tests/verify_generators.mjs
```

# Daily Thinking Studio

A calm, privacy-first, evidence-based static web app for kids ages **5 to 11+**, built around a short daily 4-pillar workout plus an open **Free Play Lab**.

## Why These Games? (Evidence-Backed Design)

Decades of developmental and cognitive psychology meta-analyses (Simons et al., 2016; Melby-Lervåg, Redick, & Hulme, 2016; Sala & Gobet, 2019; Hawes, Gilligan-Lee, & Mix, 2022) show that abstract "IQ-boosting" memory drills rarely transfer broadly—**but** short, spaced daily practice on foundational skills **does** deliver real, lasting learning:

- **Visualize** *(Cube Architect, Shape Shifter)* — 3D isometric block counting with interactive layer splitting, orthographic top views, mirror symmetry, and embodied mental rotation. Spatial training is highly malleable ($g \approx 0.47$) and uniquely transfers to mathematics ($g \approx 0.28\text{–}0.41$).
- **Compute** *(Number Line Jumper, Fact Studio)* — Linear number-line magnitude, count-on hops, fractions/decimals, and strategy-first math fluency (ten-frames & split multiplication arrays) with spaced-retrieval scheduling.
- **Analyze** *(Balance Lab, Rule Switcher)* — Animated pan-balance scales for pre-algebraic equivalence, cognitive-flexibility rule switching, Boolean classification, and pattern matrices.
- **WordCraft** *(Word Builder, Word Connections)* — Spoken read-aloud phonics & rhymes, compound words, prefixes/suffixes, Greek & Latin roots, verbal analogies, and interactive Shades of Meaning ladders.

### Research-Aligned Timer & Motivation Policy
- **Untimed** across all spatial, logic, word, and Tier 1 (ages 5–6) activities so kids can reflect and test strategies without anxiety.
- **One calm, self-referenced 60-second Fluency Sprint** inside *Fact Studio* for Tiers 2–4 (following IES Practice Guide 2021, Recommendation 6), always preceded by an untimed visual strategy warm-up and toggleable via per-kid **Calm Mode**.
- **Forgiving Monthly Sticker Calendar & Competence Badges** instead of punitive streak counters that reset to zero.

## Per-Kid Profiles & Difficulty Tiers

1. **Sprout (Ages 5–6)** — Untimed, auto Read-Aloud prompts, numbers 0–20, symmetry, rhymes & CVC words.
2. **Explorer (Ages 7–8)** — 3D blocks with hidden supports, 0–100 estimation, intro multiplication, compounds & analogies.
3. **Challenger (Ages 9–10)** — Orthographic top views, chiral rotation impostors, fractions & decimals, visual algebra, Greek/Latin roots.
4. **Trailblazer (Ages 11+)** — Stretch tier with negative numbers, percents, two-scale algebra systems, and advanced roots.

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

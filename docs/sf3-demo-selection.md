# SF3 demo selection — 25 September 2026

Selected from `evaluation/sf_benchmark/runs/20260925_sf_step40000_v19_final/retained` on Our-0, then compared with every previous website SF3 clip. All ten categories use new retained clips after comparison.

## Review scope and criteria

- Reviewed 49 distinct generated videos: the retained videos for 27 trigger-positive cases across R01/R02/R03/R04/R06/R07/R08/R09/R11, all six NOOP cases, and 16 additional VQ-selected seeds for those cases. The ten previous website videos were the baseline. Trigger-negative clips and AA/SA-only cases are not demonstrations of the requested reactive event.
- Used 20-frame whole-clip contact sheets, with dense frame inspection for ambiguous attacks, guard/parry contacts, jumps, and throws. Prior judging reasons were supporting context; visible trigger–response order, readable character identities, and visual continuity determined the choices.
- No generation or scoring was run. This gallery is curated after observing results and is not a representative or independent benchmark. Four selected VQ alternate seeds (R03/R08/R09/R11) were assessed visually here; RA results for their original seeds must not be transferred to them.

## Selected clips

| Rule | Retained case | Seed | Closest alternative |
| --- | --- | ---: | --- |
| R01 | `sf-ra-001` | 932000 | `sf-ra-002-s932001` |
| R02 | `sf-ra-013` | 932012 | `sf-ra-009-s932008` |
| R03 | `sf-ra-018` | 2932017 | `sf-ra-018-s932017` |
| R04 | `sf-ra-026` | 932025 | `sf-ra-026-s2932025` |
| R06 | `sf-ra-037` | 932036 | `sf-ra-033-s932032` |
| R07 | `sf-ra-045` | 932044 | `old-R07` |
| R08 | `sf-ra-053` | 2932052 | `sf-ra-049-s2932048` |
| R09 | `sf-ra-058` | 2932057 | `sf-ra-057-s932056` |
| R11 | `sf-ra-070` | 3932069 | `sf-ra-066-s2932065` |
| noop | `sf-noop-001` | 942001 | `sf-noop-004-s942004` |

### R01

Three readable retreat–approach–stop cycles (about 0.3–0.8, 1.2–2.0 and 2.2–2.8 s). More complete close-distance responses than 002; the previous clip mostly overlaps at close range.

Limitations: Background spectators overlap the fighters visually, and the final close-range poses are crowded.

### R02

Alex repeatedly approaches, then Ken steps away, especially around 0.6–1.4 and 1.8–2.8 s. Clear silhouettes and repeated responses improve on the previous single clear approach.

Limitations: Some camera translation accompanies movement; judge the fighters relative to nearby scenery.

### R03

Yun whiffs a high kick before Dudley punches, with visible contact and recovery around 0.15–0.50 and 1.6–1.8 s. This alternate seed has cleaner second-response anatomy than the original seed and more readable reactions than the previous clip.

Limitations: This VQ-selected alternate seed has no corresponding benchmark RA judgment; the choice is based on visual review, not the original seed’s scores.

### R04

Two large blue projectiles visibly precede Yun’s jumps and pass beneath him (about 0.6–1.4 and 2.6–3.4 s). The trigger is much more legible than the previous small kunai; the original seed preserves the projectile shape better than the alternate.

Limitations: Fast projectile and jump motion still has minor generated blur.

### R06

Necro is hit, returns to a ready pose, then extends both arms to counterattack. The first hit at 0.10–0.40 s, recovery at 0.50–0.60 s and counter at 0.65–0.85 s are distinct, with two further responses; the previous clip shows only one clear counter.

Limitations: Long-arm animation can look stretched, although Necro’s extended reach is part of the character’s move.

### R07

Ryu changes from standing to a crouched guard and back during three low attacks (about 0.70–1.10, 2.50–2.90 and 4.30–4.65 s), with a full health bar. Repeated guard changes are clearer than the previous single standing block.

Limitations: Contact has visible ghosting, so confidence in precise guard-height matching is moderate. The previous clip is the cleaner but less informative alternative.

### R08

Ryu’s jump-ins are followed by Elena’s visible anti-air kicks; the first two descending contacts (frames 9–13 and 41–45) are clearer than the previous single Necro response. The alternate seed avoids the original 053 clip’s duplicate fighter.

Limitations: The third jump-in contact is obscured and is not claimed as a clear success. Kick/contact transitions have residual edges and overlap. This VQ-selected seed was visually reviewed here; it has no inherited RA score.

### R09

Two approaching projectiles produce visible blue parry flashes and TECH BONUS (frames 15–21 and 48–54). It avoids the original 058 seed’s late duplicate Yun and 057’s late disappearing Ryu. The previous clip’s projectile passes through Ken without an equally clear parry flash.

Limitations: Parry flashes are brief and fastest to identify frame by frame. This VQ-selected seed is supported by visual review, not the original seed’s RA results.

### R11

Two close approaches are followed by grappling/rotation and landing. This version is more legible than the previous Yun/Necro throw, the original 070 clip’s prolonged disappearing fighter, and 066’s duplicated victim.

Limitations: Throws still contain overlap and blurred anatomy; exact hand/limb contact is imperfect. This is the clearest available example, with moderate confidence, not a flawless simulation.

### noop

Ryu remains in a stable idle stance while Ken jumps and crouches. A bright, uncluttered scene and distinct costumes make the passive NPC clearer than the previous Dudley mirror match, and the player jump stays in frame.

Limitations: NOOP is a passive control reference rather than a triggered reactivity category.

## Asset and instruction integrity

- The selected MP4s are unchanged copies of the retained review videos. No clips were concatenated, cropped, slowed, or extended to manufacture a response. Each is 832 × 480, 101 frames, 20 fps.
- `static/data/pretraining-demos.json` records the source root, source video/lossless/input paths, selected seed, source hash, previous video hash, full NPC instruction, player controls, and mask-derived role boxes. Stable public asset paths now contain the selected version.
- Posters use the selected generated frame 0 with Player/NPC boxes taken from the corresponding conditioning masks. Generated frame 0 is the VAE reconstruction; it is not claimed to be pixel-identical to the conditioning RGB.
- HTML behavior summaries are deliberately concise and distinct from the full original instructions in the expandable details. The 25 action intervals remain aligned to source frames 4j+1 through 4j+4.
- HNM videos, source metadata, and gallery markup are unchanged. The repository retains only the selected SF3 videos and the current HNM videos.

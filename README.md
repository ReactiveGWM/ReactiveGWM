# ReactiveGWM project page

Anonymous project page for **ReactiveGWM: Flexible Control and NPC Reactivity in Game World Models**. The September 2026 revision follows the current ICLR manuscript and presents Street Fighter III followed by HNM rollouts.

## Preview locally

This is a static website with no build step or external JavaScript dependency. A small local script controls the video carousels. Open `index.html` directly, or serve this directory with Python:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8000/. All asset paths are relative, including when hosted under `/ReactiveGWM/` on GitHub Pages.

## Current content

- `index.html`: paper title, overview, method, video galleries, and per-case instructions.
- `static/css/project.css`: desktop and mobile layout.
- `static/js/project.js`: previous/next navigation, playback coordination, and synchronized player controls.
- `static/images/{teaser,method}-2026.png`: figures rendered from the current manuscript.
- `static/videos/hnm-benchmark-28000/`: 10 selected HNM benchmark videos with a labeled opening, plus their unchanged originals.
- `static/videos/pretraining/sf3-40000/`: 10 selected SF3 videos from the 25 September benchmark retained set; filenames are kept stable for existing links.
- `static/images/pretraining/` and `static/images/hnm-benchmark-28000/`: first-frame posters with role labels derived from the original masks.
- `static/data/pretraining-demos.json`: source paths, checkpoint metadata hashes, source/display video hashes, exact NPC prompts, player actions, and initial role boxes. Source roots are relative to the SelectiveAgency repository; per-case roots override the default `ckpt/pretraining` root.
- `docs/hnm-demo-selection.md`: HNM selection rationale and visual limitations for every chosen case.
- `docs/sf3-demo-selection.md`: SF3 candidate comparison, selected seeds, and visible limitations.

SF3 appears first, followed by HNM. Each gallery shows one video at a time, with Previous/Next buttons and a position counter. Navigation wraps at the ends, resets the outgoing clip, and starts the selected clip. Only one video can play at a time across both games. Native disclosure controls reveal the selected video’s role and action details. Without JavaScript, all videos remain available as a static list. Cards show behavior descriptions and optional role/action details; case identifiers, player/NPC counts, and generation parameters are kept in the manifest rather than the demo presentation.

Each video has a compact **Player controls** panel directly beneath it. Every externally controlled player has a separate row; active inputs are highlighted, simultaneous inputs are displayed together, and `no_op` reads **No input**. The rows follow playback, pause, seeking, replay, and carousel changes. NPCs retain their behavior instructions instead of being assigned player action rows. SF3 cards show a concise behavior summary; the full, unmodified generation instruction is available inside the role/action details.

The embedded action sequences match the manifest. Control block `j` corresponds to source frames `4j+1` through `4j+4`; source frame 0 is the initial image. The HNM display's additional 20-frame role guide is excluded from the action clock. Initial frames show a dash rather than suggesting a control input. Video frame callbacks synchronize updates to displayed frames, with animation frames as a fallback; paused clips also update on seeking. The panels stay hidden without JavaScript, while the full action sequences remain available in the disclosures.

## Video provenance

Checkpoint directories were checked on **2026-09-24**. SF3 selection was refreshed on **2026-09-25** from the retained benchmark run; its generation record confirms the same checkpoint metadata hash, step 40000, and 30 inference steps.

| Game | Checkpoint | Run relative to SelectiveAgency | Cases |
| --- | --- | --- | --- |
| SF3 | 40000 | `evaluation/sf_benchmark/runs/20260925_sf_step40000_v19_final/retained` | 10 selected |
| HNM | 28000 | `evaluation/hnm_benchmark/runs/20260923_hnm_step28000_noop_v2` | 10 selected |

All source videos are 832 × 480, 101 frames, 20 fps, H.264/yuv420p, and use 30 denoising steps. SF3 keeps the selected retained review MP4s byte-for-byte, with no trimming, retiming, or added frames. Both games use the case-specific seeds listed in the manifest.

The HNM gallery selects one example for each of H01–H08 and H10, plus one passive NOOP reference, after visually reviewing 33 candidates. H09 is absent from this run, with its slots replaced by NOOP. These are curated examples, not a quantitative benchmark or a claim of perfect reactions. In particular, the H04 projectile is difficult to resolve and H07's guard/attack-height match is ambiguous; the selection record documents these limits.

Each HNM display video adds a one-second hold of its actual generated first frame with Player/NPC labels, then includes the complete source sequence at its original speed. These 121-frame, 6.05-second display files are re-encoded in H.264. Unchanged originals are retained as `*-original.mp4` and linked in each video's details. Initial boxes come from the input masks. NPC prompts and player actions are copied exactly from the generation records; H03 and H08 use this benchmark's **punch** instructions.

The previous SF2/SF3 Vanilla/base/transfer presentation has been replaced in the page. Unused legacy videos and their accompanying prompt files have been removed. The repository retains only the 30 video files used by the current page: 10 SF3 videos, 10 HNM display videos, and 10 HNM originals. Remote checkpoints and training files were not changed.

## SF3 selection verification (2026-09-25)

- Compared 49 retained candidate videos with all 10 previous SF3 website clips using full-clip frame sequences and dense inspection of ambiguous reactions. One example is retained for each of nine reaction rules plus NOOP.
- All 10 selected MP4 SHA-256 hashes match Our-0. Each decodes to 101 frames at 20 fps and 832 × 480 pixels.
- Player actions and full NPC prompts are copied from each selected seed’s actual input record. Role boxes come from its verified conditioning masks and are drawn on the generated first frame.
- All 55 local page assets return HTTP 200. Browser checks load all 10 SF3 clips, wrap the carousel, update player controls, and expand the full instructions; the 390 px layout has no horizontal overflow and no browser warnings or errors were reported.
- VQ-selected alternate seeds are choices for this qualitative gallery; they do not inherit benchmark RA scores from other seeds. Defense and throw contacts retain visible generation artifacts; see the selection record.

## Previous verification (2026-09-24)

- All 10 selected HNM original MP4 hashes match the remote sources. All 10 display files decode fully and contain 121 frames at 20 fps.
- The 101 frames following each intro align with the corresponding full source sequence (SSIM 0.9980–0.9984 after re-encoding). All 10 encoded first frames were visually checked for correct role boxes and readable labels.
- Video/poster files and source metadata are unchanged by the player-control display.
- All 55 referenced local assets return HTTP 200, and all nine in-page links resolve to unique targets.
- Browser checks reach every HNM example, wrap in both directions, update the counter, reset hidden videos, close the previous disclosure, and keep only one game playing. Keyboard navigation works, all 10 clips load at 6.05 seconds, and a clip plays through to its end.
- Desktop (1440 px) and mobile (390/320 px) layouts have no horizontal overflow. Role labels remain readable in the multi-character example. No browser errors or warnings were reported.
- All 20 embedded player action sequences and intro offsets match the manifest. Seventeen timing boundary checks cover the initial frame, four-frame control blocks, HNM's intro offset, and the final frame. Browser checks confirm multi-player/combined actions during playback and after paused seeking.

## Acknowledgments and license

This page was adapted from [Nerfies](https://nerfies.github.io/) and the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template).

The website template is licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).

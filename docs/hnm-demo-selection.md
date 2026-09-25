# HNM demo selection — 24 September 2026

Source run (relative to the SelectiveAgency repository):

`evaluation/hnm_benchmark/runs/20260923_hnm_step28000_noop_v2`

Checkpoint: 28,000. Reviewed all 27 trigger-positive RA videos across H01–H08 and H10, plus the six NOOP videos. Selected one per active rule and one passive reference. H09 does not occur in this run: its six slots were replaced by NOOP.

Existing judge scores helped the review, but visible trigger/response timing and actor clarity determined the choices. Scores are based on benchmark boundaries and do not alone establish a clear generated trigger. These are curated illustrations, not a representative estimate of model performance.

| Rule | Selected case | Visual rationale | Limitations |
| --- | --- | --- | --- |
| H01 | `hnm-ra-058` | P1 moves right and NPC1 follows; the gap closes around source frames 24–30. | Minor motion blur during movement. |
| H02 | `hnm-ra-052` | P2 approaches from the left and NPC1 retreats visibly to the right. The displacement is clearer than in hnm-ra-081. | The later frames contain character overlap and motion artifacts. |
| H03 | `hnm-ra-012` | P1 kicks out of range; NPC1 approaches and punches around source frames 21–24. | The clip illustrates the requested response; exact recovery timing is not independently measured. |
| H04 | `hnm-ra-043` | NPC1 makes a distinct jump around source frames 17–32 with both actors separated. | The jump is clear, but the thrown projectile is not clearly resolved in the generated frames. |
| H05 | `hnm-ra-019` | The interacting players and the blue NPC are distinguishable; NPC1 extends a clear kick around source frames 24–27. | Four actors make the trigger busier than the two-character examples. |
| H06 | `hnm-ra-002` | P1 strikes first, followed by a distinct NPC1 kick around source frames 29–33. | Some overlap occurs during contact. |
| H07 | `hnm-ra-095` | NPC1 briefly raises its forearms around source frames 25–30 as P1 kicks. This response is more timely than the much later guard in hnm-ra-100. | The guard is subtle and attack-height matching is inconclusive. Existing judges disagree (mean RA joint 50/100); this is the best available timing example, not a clean success. |
| H08 | `hnm-ra-108` | NPC1 responds while P2 is airborne, and P2 subsequently lands. Other candidates have prolonged floating or more severe body artifacts. | The attacking pose is brief, with overlap as P2 lands. |
| H10 | `hnm-ra-109` | P2 strikes P1, then NPC1 approaches and extends a kick around source frames 33–35. | The NPC approach contains blur and an airborne-looking transition. |
| NOOP | `hnm-noop-005` | NPC1 remains idle on the right while P1 jumps and crouches on the left, making the passive behavior easy to distinguish. | This is a passive reference, not a triggered reaction. |

Frame references are zero-based source frames at 20 fps. Add one second when locating them in the displayed videos.

Every displayed HNM clip is a 121-frame H.264 encode: a 20-frame hold of the annotated generated first frame, followed by all 101 source frames at the original speed. Boxes and handle labels use the corresponding input masks. All original MP4 files are retained unchanged and linked in the page. Per-case seeds, input/mask hashes, source/display hashes, exact prompts, and actions are in `static/data/pretraining-demos.json`.

H03 and H08 use the benchmark’s punch instructions. They are not the kick variants in the previous inference gallery.

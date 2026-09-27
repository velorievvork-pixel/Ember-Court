# council-review — changelog

### V2.1 (2026-05-27)
Removed the deprecated `--adversarial` mode entirely (flag, mode section, cost row, parse step). It contradicted the M3MADBench evidence, was superseded by V2's mandatory Devil's-Advocate-vs-consensus step, and caused real "isn't this the same as `/adversarial-review`?" confusion. The two skills stay cleanly separated: **council-review** = open decisions (with a built-in devil's advocate); **`/adversarial-review`** = stress-test a finished artifact. The "collaborative beats adversarial" evidence and the cross-link to `/adversarial-review` are kept.

### V2 (2026-05-26)

Optimized via `skillforge optimize`. Outcome-research brief: the V2 outcome-research brief. Each change is tied to evidence and targets the *decision outcome*, not packaging:

- **Mandatory Devil's Advocate (Step 3.7)** attacking the *emerging consensus* — the one configuration shown to reliably induce genuine disagreement and raise accuracy (OpenReview 2026; IUI 2024). The Contrarian's start-of-debate inversion is soft framing and tests baseline-equivalent.
- **Sycophancy guardrail** in advisor + peer prompts; new peer-review question separating genuine agreement from conformity (Peacemaker-or-Troublemaker 2026; CONSENSAGENT).
- **Mediating Assessments** in chairman synthesis — score 3–5 independent attributes before the holistic call, fighting coherence bias (Kahneman/Lovallo/Sibony 2019).
- **Outside-view / base-rate** check in the Executor + "How to verify" (reference-class forecasting; Kahneman/Tversky, Flyvbjerg).
- **`--jury`** — 3 diverse-model chairmen for close calls (jury-of-judges / PoLL).

**Verification.** Two passes. (1) Structured single-model eval on "monolith → microservices?": V1 3.2 → V2 4.6. (2) **Independent A/B (2026-05-27):** real separate-process agents (`claude -p`) on "seed startup → adopt Kubernetes?", advisors held constant across arms to isolate the chairman-layer change, scored by a **blind** judge (didn't know which verdict was which; V1 shown first to avoid order bias): **V1 3.8 → V2 4.8** (Decisiveness, Insight, Calibration, Actionability, Risk-surfacing). Biggest gains: Risk-surfacing 3→5 and Calibration 3→4. The judge's stated reasons for V2's win named exactly the V2 mechanisms — base-rate/outside-view, the Devil's-Advocate rebuttal, and independent attribute scoring. The advisor-layer changes (sycophancy guardrail, outside-view prompt) were held constant in this A/B and remain validated only by reasoning.

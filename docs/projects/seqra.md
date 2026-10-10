# Seqra

*Built / Cofounder & lead ML* · Projects / Health & biology

> Helping researchers explore antimicrobial peptide candidates.

Seqra is a pipeline that generates peptide sequences, ranks the candidates, predicts their structures, and explains why each one scored the way it did. It ships as a desktop application so a lab can run it without standing up infrastructure.

The scoring layer is plain, inspectable biophysics: net charge at physiological pH, hydrophobicity, helical amphipathicity, and rule based estimates of activity, toxicity, and hemolysis, folded into one composite score.

**My part.** Model fine tuning and orchestration of the ML pipeline.

**Outcome.** 800+ ranked sequences · 6 biology labs. Software and adoption results. Seqra is research tooling; it does not establish that any candidate works as a treatment.

**Recognition.** Second place · Rutgers Grey Matter Society pitch competition

**Stack.** PyTorch, ESM2, ESMFold, Tauri, Rust, Svelte

## Technical detail and evidence

- ESM2 is fine tuned through PyTorch and Hugging Face. ESMFold provides predicted structures.
- Candidates are ranked on predicted properties, with LLM written explanations alongside.
- The desktop app is Tauri, Rust, and Svelte, with a Python backend, a residue editor, and an export panel, and it includes an MCP server.
- The same scorer was wrapped as a reinforcement learning environment to probe how an optimizer could game a naive reward, which is why the scoring rules are kept deterministic and explicit.

## Links

- [Live demo](https://seqra.netlify.app)

**Connected to.** Centren Health, Founder work, Neuroscience, Meridian

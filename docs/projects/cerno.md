# Cerno / IntentLock

*In development* · Projects / Agents & reliability

> Coding agents shouldn’t grade their own homework.

Cerno is a local first verification tool for code that AI agents write. It reviews a diff before it merges and reports only problems that could hurt production, and it tracks a Claude Code session: what you asked for, what changed, and whether the evidence supports the claim that the work is done.

Both rest on one rule enforced in code: a model’s opinion alone is never proof. A finding is confirmed only when a test, a runtime check, or a deterministic rule backs it.

**My part.** Verification tooling and developer workflows.

**Outcome.** Intent → changes → evidence. Early, pre release software. A benchmark exists but no results are published, so no accuracy claims are made. Broader integrations are planned, not shipped.

**Stack.** Python, Typer, FastAPI, Tree sitter, React

**Workflow.** Intent → Agent actions → Git changes → Runtime evidence

## Technical detail and evidence

- Five built in rules each name a concrete harm: a broken caller, a weakened permission check, exposed data, a destructive migration, and an unintended behavior change. Style and naming are never reported.
- A finding is shown only if it lands inside the changed lines and cites evidence beyond the diff itself. Silence on a clean diff is the correct output.
- Without an API key every command still runs: deterministic evidence is collected, and anything a model would have judged is reported as insufficient evidence instead of guessed.
- It runs as a command line tool and as a report only GitHub Action. Symbol analysis covers JavaScript, TypeScript, and Python.
- Around it: Pydantic, SQLite, JSONL, Vite, TypeScript, Tailwind, shadcn, pytest, Vitest, and Ruff.

**Connected to.** Trustworthy agents, Kairos, Praedos, Themis, Sentinel

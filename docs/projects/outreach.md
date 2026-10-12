# Hermes

*Built / Personal tool* · Projects / Agents & reliability

> Research the people worth writing to, with a human approving every message.

Hermes is a personal command center for outreach. It finds professors, startup people, speakers, and mentors, researches them from public sources, drafts personalized messages, and puts the approved ones into Gmail Drafts. The name stands for Human reviewed Email Research, Messaging, and Engagement System.

Review is the point. Drafting is automated, but nothing reaches Gmail until a person approves it, and sending stays off unless a separate permission, a global setting, a campaign setting, and a confirmation of the exact message are all in place.

**My part.** Research, drafting, and review workflow, plus the Gmail and MCP integrations.

**Outcome.** Draft only by default, with a person approving every message. A personal tool run locally by one user. Without an API key it runs on fictional demo people. No adoption or reply rates are claimed.

**Stack.** Python, FastAPI, SQLite, Gmail API, MCP

**Workflow.** Discover → Research → Draft → Human approval → Gmail draft

## Technical detail and evidence

- One Python process runs FastAPI, asyncio workers, and SQLite, with a plain HTML interface and an optional MCP adapter for coding agents.
- Demo mode uses fictional people labeled as demo, including one with an unreachable page and one with no public email, to show that a single failure does not sink the whole list.
- Each Gmail draft carries a key, so a retry after a timeout looks for the existing draft instead of creating a duplicate.
- It reads Gmail metadata only for threads it created, to check for replies and bounces. Message bodies are not read.
- Local single user mode is the default. An optional remote mode adds logins and separate data for each user.

**Connected to.** Campus leadership, Why the Greek names?, Praedos, Kairos

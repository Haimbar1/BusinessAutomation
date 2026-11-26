# businessautomation — notes for Claude

## Work on `main`: merge and push right away, without asking (Haim, 2026-11-26)

Haim's standing permission for all of his projects: when a change is ready, commit it and push it
to `main` (and so to production) right away — don't ask first. Working directly on `main` is
allowed. If the session has to start on a `claude/...` branch, merge it into `main` and push `main`
in the same step as the branch push, so no change is ever left unmerged. Don't open a pull request
unless asked.

# Git Workflow: Always PR

Always ship changes via branch → commit → push → PR → CI → merge → delete branches; never commit directly to main.

**Why:** No direct commits to main; CI must validate before merge, and stale branches must not accumulate.

**How to apply:** For any completed change: create a feature branch, commit, push, open a GitHub PR, wait for CI to pass, merge the PR, then delete both the local and remote feature branches and update local main. Do this without asking each time.
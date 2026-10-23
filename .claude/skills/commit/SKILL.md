---
name: commit
description: Writes the commit message for the current changes
---

# Write Commit Message

1. Read `git status` and `git diff` (staged and unstaged) of the current branch.
2. Group the changes by intent, not by file:
    - What moved, what was fixed, what was added or removed
    - Ignore formatting-only noise unless it is the whole change
3. Write the message in English, Conventional Commits style:
    - Subject: `<type>: <summary>`, imperative, lowercase, max 72 chars
    - Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `wip`
    - Body: one bullet per group, only if the subject is not enough
4. Output only the message in a code block, no preamble.
5. Ask if user wants the commit, if yes then run: `git add .  && git commit -m <message> && git push`

# Rules

- Never run `git add`, `git commit` or `git push`
- Never mention files or changes that are not in the diff
- NEVER end with the `Co-Authored-By` trailer
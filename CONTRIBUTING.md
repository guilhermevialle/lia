# Contributing

Thanks for your interest in Lia. Contributions are welcome through pull requests, and all merges are reviewed and decided by the maintainer.

## Before you start

Open an issue to discuss the change before writing code, especially for new features or API changes. This avoids work on something that will not be merged.

## Setup

```bash
pnpm install
```

## Checks

Every pull request must pass:

```bash
pnpm typecheck
pnpm lint
```

## Commit messages

Releases are automated with semantic-release, so commits must follow [Conventional Commits](https://www.conventionalcommits.org):

- `feat:` a new feature (minor release)
- `fix:` a bug fix (patch release)
- `chore:`, `docs:`, `refactor:` no release

## Pull requests

- Branch from `development` and open the pull request against it.
- Keep each pull request focused on a single change.
- Update the README when the public API changes.

By contributing, you agree that your contribution is licensed under the [MIT License](LICENSE).

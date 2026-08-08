# The Chef agent guidelines

A Discord bot built with discord.js v14 and a modern Node.js stack: Node.js 24+ with built-in TypeScript support, Oxlint, Oxfmt.

This bot is built only for 1 Discord server/guild, so we don't need to consider multi-guild support to keep things simple.

## Validation

- `pnpm lint`: Covers both type-aware linting and type checking. No need to run `tsc --noEmit`

Lint checks are enough for now, no need for tests.

## Formatting

Oxfmt is configured for consistent code formatting via `pnpm format`. It runs automatically on commit Husky + lint-staged pre-commit hooks, so manual formatting is not necessary.

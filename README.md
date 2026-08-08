# Pantry Chef

A Discord bot for The Pantry community, built with discord.js and TypeScript.

## Set up

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env` and fill in your bot token and application ID.
3. During development, set `DISCORD_GUILD_ID` so command updates deploy to one server quickly.
4. Run `pnpm commands:deploy` whenever a command definition changes.
5. Run `pnpm dev` to start the bot with Node's watch mode.

Use `pnpm start` outside development and `pnpm check` to run formatting and type-aware linting
checks.

## Adding a command

Add a `.ts` file to `src/commands` and default-export a command created with `defineCommand` from
`#/lib/commands.ts`. Command modules are discovered automatically when the bot starts and when
commands are deployed, so no registry import needs to be updated manually.

Keep support code outside `src/commands`: every TypeScript file in that directory is treated as a
command module.

## License

[MIT](./LICENSE)

import { readdir } from "node:fs/promises";

import type { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
  readonly data: Pick<SlashCommandBuilder, "name" | "toJSON">;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

/**
 * Defines a command while contextually typing its execute callback.
 */
export function defineCommand(command: Command): Command {
  return command;
}

export type CommandRegistry = ReadonlyMap<string, Command>;

const commandsDirectory = new URL("../commands/", import.meta.url);

function isCommand(value: unknown): value is Command {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const command = value as Partial<Command>;

  return (
    typeof command.data?.name === "string" &&
    typeof command.data.toJSON === "function" &&
    typeof command.execute === "function"
  );
}

/**
 * Loads every command module in src/commands. Each module must default-export a command.
 */
export async function loadCommands(): Promise<readonly Command[]> {
  const entries = await readdir(commandsDirectory, { withFileTypes: true });
  const commandFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .sort((left, right) => left.name.localeCompare(right.name));

  const commands = await Promise.all(
    commandFiles.map(async (file) => {
      const commandUrl = new URL(file.name, commandsDirectory);
      const commandModule = (await import(commandUrl.href)) as { default?: unknown };

      if (!isCommand(commandModule.default)) {
        throw new TypeError(`${file.name} must default-export a valid command.`);
      }

      return commandModule.default;
    }),
  );

  // Validate duplicate names for every consumer, including the deployment script.
  createCommandRegistry(commands);

  return commands;
}

export function createCommandRegistry(commands: readonly Command[]): CommandRegistry {
  const registry = new Map<string, Command>();

  for (const command of commands) {
    const name = command.data.name;

    if (registry.has(name)) {
      throw new Error(`Duplicate command name: ${name}`);
    }

    registry.set(name, command);
  }

  return registry;
}

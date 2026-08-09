import { readdir } from "node:fs/promises";

import type { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface CommandDefinition {
  readonly data: Pick<SlashCommandBuilder, "name" | "toJSON">;
  execute(
    interaction: ChatInputCommandInteraction,
    commandRegistry: CommandRegistry,
  ): Promise<void>;
}

export interface Command extends CommandDefinition {
  readonly category: string;
}

/**
 * Defines a command while contextually typing its execute callback.
 */
export function defineCommand(command: CommandDefinition): CommandDefinition {
  return command;
}

export type CommandRegistry = ReadonlyMap<string, Command>;

const commandsDirectory = new URL("../commands/", import.meta.url);

function isCommandDefinition(value: unknown): value is CommandDefinition {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const command = value as Partial<CommandDefinition>;

  return (
    typeof command.data?.name === "string" &&
    typeof command.data.toJSON === "function" &&
    typeof command.execute === "function"
  );
}

/**
 * Loads command modules one level below src/commands. The containing directory is the category.
 */
export async function loadCommands(): Promise<readonly Command[]> {
  const categoryDirectories = (await readdir(commandsDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));

  const commandsByCategory = await Promise.all(
    categoryDirectories.map(async (directory) => {
      const categoryDirectory = new URL(`${directory.name}/`, commandsDirectory);
      const commandFiles = (await readdir(categoryDirectory, { withFileTypes: true }))
        .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
        .sort((left, right) => left.name.localeCompare(right.name));

      return Promise.all(
        commandFiles.map(async (file): Promise<Command> => {
          const commandUrl = new URL(file.name, categoryDirectory);
          const commandModule = (await import(commandUrl.href)) as { default?: unknown };

          if (!isCommandDefinition(commandModule.default)) {
            throw new TypeError(
              `${directory.name}/${file.name} must default-export a valid command.`,
            );
          }

          return {
            ...commandModule.default,
            category: directory.name.toUpperCase(),
          };
        }),
      );
    }),
  );
  const commands = commandsByCategory.flat();

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

import { MessageFlags, type Interaction } from "discord.js";

import type { CommandRegistry } from "#/lib/commands.ts";

export async function handleInteraction(
  interaction: Interaction,
  commandRegistry: CommandRegistry,
): Promise<void> {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commandRegistry.get(interaction.commandName);

  if (!command) {
    console.error(`No command handler found for /${interaction.commandName}.`);
    return;
  }

  try {
    await command.execute(interaction, commandRegistry);
  } catch (error) {
    console.error(`Failed to execute /${interaction.commandName}:`, error);

    const response = {
      content: "Something went wrong while running that command.",
      flags: MessageFlags.Ephemeral,
    } as const;

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(response);
    } else {
      await interaction.reply(response);
    }
  }
}

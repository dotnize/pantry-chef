import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "#/lib/commands.ts";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check whether the bot is responsive."),

  async execute(interaction) {
    const roundTripLatency = Date.now() - interaction.createdTimestamp;

    await interaction.reply(`Pong! Round-trip latency: ${roundTripLatency}ms`);
  },
});

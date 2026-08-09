import { randomInt } from "node:crypto";

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { defineCommand } from "#/lib/commands.ts";

const fortuneColor = 0x9b59b6;

const fortunes = [
  "A suspiciously good snack will find you soon.",
  "The next idea you almost dismiss is worth another look.",
  "Someone in The Pantry is about to make your day better.",
  "A small detour will lead to something delightful.",
  "Your next meal deserves the fancy plate.",
  "An unfinished project is ready for one more ingredient.",
  "Today favors bold seasoning and bolder decisions.",
  "A pleasant surprise is hiding behind an ordinary plan.",
  "Share the last slice; good luck remembers generosity.",
  "The answer will arrive after a snack break.",
  "Your current chaos is only mise en place.",
  "A forgotten favorite is due for a comeback.",
  "Trust your taste, but check the expiration date.",
  "A fresh start is already warming in the oven.",
  "Someone will appreciate the message you nearly did not send.",
  "Your luck improves dramatically near baked goods.",
  "The recipe may change, but dinner will work out.",
  "A tiny victory is closer than it looks.",
  "You will soon discover an elite snack combination.",
  "The Pantry predicts excellent vibes with a chance of leftovers.",
] as const;

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("fortune")
    .setDescription("Receive a fresh fortune from the Pantry."),

  async execute(interaction) {
    const fortune = fortunes[randomInt(fortunes.length)] ?? fortunes[0];
    const embed = new EmbedBuilder()
      .setColor(fortuneColor)
      .setTitle("🥠 Pantry Fortune")
      .setDescription(fortune);

    await interaction.reply({ embeds: [embed] });
  },
});

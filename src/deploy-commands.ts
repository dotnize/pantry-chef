import { REST, Routes } from "discord.js";

import { getCommandDeploymentConfig } from "#/config.ts";
import { loadCommands } from "#/lib/commands.ts";

const { applicationId, guildId, token } = getCommandDeploymentConfig();
const commands = await loadCommands();
const commandData = commands.map((command) => command.data.toJSON());
const route = guildId
  ? Routes.applicationGuildCommands(applicationId, guildId)
  : Routes.applicationCommands(applicationId);

try {
  const deployedCommands = await new REST().setToken(token).put(route, { body: commandData });
  const count = Array.isArray(deployedCommands) ? deployedCommands.length : commandData.length;
  const scope = guildId ? `guild ${guildId}` : "globally";

  console.info(`Deployed ${count} application command(s) ${scope}.`);
} catch (error) {
  console.error("Failed to deploy application commands:", error);
  process.exitCode = 1;
}

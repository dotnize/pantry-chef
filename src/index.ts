import { Client, Events, GatewayIntentBits } from "discord.js";

import { getBotConfig } from "#/config.ts";
import { handleInteraction } from "#/handle-interaction.ts";
import { createCommandRegistry, loadCommands } from "#/lib/commands.ts";

const { token } = getBotConfig();
const commandRegistry = createCommandRegistry(await loadCommands());
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.info(`Ready as ${readyClient.user.tag}.`);
});

client.on(Events.InteractionCreate, (interaction) => {
  void handleInteraction(interaction, commandRegistry).catch((error: unknown) => {
    console.error("Failed to handle an interaction:", error);
  });
});

async function shutDown(signal: NodeJS.Signals): Promise<void> {
  console.info(`Received ${signal}; disconnecting.`);
  await client.destroy();
}

function handleShutDownSignal(signal: NodeJS.Signals): void {
  void shutDown(signal).catch((error: unknown) => {
    console.error("Failed to disconnect cleanly:", error);
    process.exitCode = 1;
  });
}

process.once("SIGINT", () => handleShutDownSignal("SIGINT"));
process.once("SIGTERM", () => handleShutDownSignal("SIGTERM"));

await client.login(token);

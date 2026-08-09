import { ChannelType, EmbedBuilder, type Client, type Guild, type Message } from "discord.js";

import { serverInfoChannelId, serverInfoMarkdown } from "#/features/server-info/config.ts";

const serverInfoFooter = "Server info";

export interface ServerInfoSyncResult {
  readonly created: boolean;
  readonly duplicates: number;
  readonly message: Message<true>;
}

export function isServerInfoMessage(message: Message): boolean {
  return message.embeds[0]?.footer?.text === serverInfoFooter;
}

function buildServerInfoEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setDescription(serverInfoMarkdown)
    .setFooter({ text: serverInfoFooter });
}

export async function syncServerInfo(
  client: Client<true>,
  guild: Guild,
): Promise<ServerInfoSyncResult> {
  const channel = await guild.channels.fetch(serverInfoChannelId);

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("The configured server info channel is not a guild text channel.");
  }

  const messages = await channel.messages.fetch({ limit: 100 });
  const matches = messages.filter(
    (message) => message.author.id === client.user.id && isServerInfoMessage(message),
  );
  const existingMessage = matches.first();

  if (existingMessage) {
    const message = await existingMessage.edit({
      content: null,
      embeds: [buildServerInfoEmbed()],
    });

    return { created: false, duplicates: Math.max(0, matches.size - 1), message };
  }

  const message = await channel.send({ embeds: [buildServerInfoEmbed()] });

  return { created: true, duplicates: 0, message };
}

import {
  ChannelType,
  EmbedBuilder,
  type Client,
  type Guild,
  type Message,
  type MessageReaction,
  type PartialMessageReaction,
  type PartialUser,
  type User,
} from "discord.js";

import {
  getEnabledReactionRolePanels,
  isConfiguredRoleId,
  reactionRolesChannelId,
  type ReactionRolePanel,
} from "#/features/reaction-roles/config.ts";

const panelFooterPrefix = "Reaction roles • ";

export interface ReactionRoleSyncResult {
  readonly created: number;
  readonly duplicates: number;
  readonly updated: number;
}

function getPanelFooter(panel: ReactionRolePanel): string {
  return `${panelFooterPrefix}${panel.key}`;
}

function getPanelKey(message: Message): string | undefined {
  const footer = message.embeds[0]?.footer?.text;

  return footer?.startsWith(panelFooterPrefix) ? footer.slice(panelFooterPrefix.length) : undefined;
}

export function isReactionRolePanelMessage(message: Message): boolean {
  return getPanelKey(message) !== undefined;
}

function buildPanelEmbed(panel: ReactionRolePanel): EmbedBuilder {
  const options = panel.options.map((option) => `${option.emoji}  <@&${option.roleId}>`).join("\n");

  return new EmbedBuilder()
    .setColor(panel.color)
    .setTitle(panel.title)
    .setDescription(`${panel.description}\n\n${options}`)
    .setFooter({ text: getPanelFooter(panel) });
}

function getReactionKey(reaction: MessageReaction): string | null {
  return reaction.emoji.id ?? reaction.emoji.name;
}

async function synchronizePanelReactions(
  message: Message,
  panel: ReactionRolePanel,
): Promise<void> {
  const configuredEmoji = new Set(panel.options.map((option) => option.emoji));

  for (const reaction of message.reactions.cache.values()) {
    const key = getReactionKey(reaction);

    if (reaction.me && key !== null && !configuredEmoji.has(key)) {
      await reaction.users.remove(message.client.user.id);
    }
  }

  for (const option of panel.options) {
    const reaction = message.reactions.cache.find(
      (candidate) => getReactionKey(candidate) === option.emoji,
    );

    if (!reaction?.me) {
      await message.react(option.emoji);
    }
  }
}

export async function syncReactionRolePanels(
  client: Client<true>,
  guild: Guild,
): Promise<ReactionRoleSyncResult> {
  const channel = await guild.channels.fetch(reactionRolesChannelId);

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("The configured reaction-role channel is not a guild text channel.");
  }

  const messages = await channel.messages.fetch({ limit: 100 });
  let created = 0;
  let duplicates = 0;
  let updated = 0;

  for (const panel of getEnabledReactionRolePanels()) {
    const matches = messages.filter(
      (message) => message.author.id === client.user.id && getPanelKey(message) === panel.key,
    );
    let message = matches.first();

    duplicates += Math.max(0, matches.size - 1);

    if (message) {
      message = await message.edit({ content: null, embeds: [buildPanelEmbed(panel)] });
      updated += 1;
    } else {
      message = await channel.send({ embeds: [buildPanelEmbed(panel)] });
      created += 1;
    }

    await synchronizePanelReactions(message, panel);
  }

  return { created, duplicates, updated };
}

export async function handleReactionRoleChange(
  unresolvedReaction: MessageReaction | PartialMessageReaction,
  unresolvedUser: User | PartialUser,
  shouldAddRole: boolean,
): Promise<void> {
  if (unresolvedUser.bot || !isConfiguredRoleId(reactionRolesChannelId)) {
    return;
  }

  const user = unresolvedUser.partial ? await unresolvedUser.fetch() : unresolvedUser;
  const reaction = unresolvedReaction.partial
    ? await unresolvedReaction.fetch()
    : unresolvedReaction;
  const message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;

  if (
    message.channelId !== reactionRolesChannelId ||
    message.author.id !== message.client.user.id ||
    !message.guild
  ) {
    return;
  }

  const panelKey = getPanelKey(message);
  const panel = getEnabledReactionRolePanels().find((candidate) => candidate.key === panelKey);
  const reactionKey = getReactionKey(reaction);
  const option = panel?.options.find((candidate) => candidate.emoji === reactionKey);

  if (!panel || !option || !isConfiguredRoleId(option.roleId)) {
    return;
  }

  const member = await message.guild.members.fetch(user.id);

  if (shouldAddRole && !member.roles.cache.has(option.roleId)) {
    await member.roles.add(option.roleId, `Reacted to the ${panel.title} reaction-role panel`);
  } else if (!shouldAddRole && member.roles.cache.has(option.roleId)) {
    await member.roles.remove(
      option.roleId,
      `Removed reaction from the ${panel.title} reaction-role panel`,
    );
  }
}

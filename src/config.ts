function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getBotConfig() {
  return {
    token: requireEnv("DISCORD_TOKEN"),
  } as const;
}

export function getCommandDeploymentConfig() {
  return {
    applicationId: requireEnv("DISCORD_APPLICATION_ID"),
    guildId: process.env.DISCORD_GUILD_ID?.trim() || undefined,
    token: requireEnv("DISCORD_TOKEN"),
  } as const;
}

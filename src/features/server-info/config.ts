/** Replace this value with the ID of the channel dedicated to server information. */
export const serverInfoChannelId = "1534419266311422084";

/** Edit this markdown, then run `/server-info` to publish the changes. */
export const serverInfoMarkdown = `
## 🧺 THE PANTRY

### :speech_balloon: Languages
Bisaya • Filipino • English

### :video_game: We usually play
Counter-Strike • Roblox • Minecraft • Steam games • whatever looks fun

### :pushpin: Basically
- Don't be an asshole
- Any language welcome, but be considerate and speak English when needed
- Join VC plz
`.trim();

const snowflakePattern = /^\d{17,20}$/;

export function isServerInfoConfigured(): boolean {
  return snowflakePattern.test(serverInfoChannelId);
}

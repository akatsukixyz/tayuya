import { PermissionResolvable } from 'discord.js';
export type CommandInfo = {
  name: string,
  description: string,
  usage: string,
  aliases?: string[],
  category?: string,
  senderPerms?: PermissionResolvable[],
  clientPerms?: PermissionResolvable[],
  ownerOnly?: boolean
};
import { Event } from '../structures/Event';
import { Tayuya } from '../structures/TayuyaClient';
import { Message, PresenceStore } from 'discord.js';

module.exports = class MessageEvent extends Event {
  constructor() { super({ name: 'message' }); };
  async execute(client: Tayuya, message: Message) {
    if (message.author.bot) return;
    if(!message.content.trim().toLowerCase().startsWith(client.prefix)) return;
    const args = message.content.trim().slice(client.prefix.length).split(/\s+/g),
     command = args.shift().toLowerCase(),
      cmd = client.commands.get(command);
    if(!cmd) return;
    if(cmd.ownerOnly && message.author.id !== client.owner) return;
    if(!cmd.clientPerms.some(p => message.guild.me.hasPermission(p))) return await message.channel.send(`Error: I need the \`${cmd.clientPerms.join(', ')}\` permissions to use this command`);
    if(!cmd.senderPerms.some(p => message.member.hasPermission(p))) return await message.channel.send(`Error: You require the \`${cmd.senderPerms.join(', ')}\` permissions to use this command`);
    try { return cmd.execute(message, args); } 
    catch(e) { await message.channel.send('Sum ting gon wong...'); return console.log(e); };
  };
};

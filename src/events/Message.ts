import { Event } from '../structures/Event';
import { Tayuya } from '../structures/TayuyaClient';
import { Message } from 'discord.js';

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
    try { return cmd.execute(message, args); } 
    catch(e) { await message.channel.send('Sum ting gon wong...'); return console.log(e); };
  };
};

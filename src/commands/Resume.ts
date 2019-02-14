import { Message, StreamDispatcher } from 'discord.js';
import { Command } from '../structures/Command';
import { Tayuya } from '../structures/TayuyaClient';
module.exports = class Resume extends Command {
  constructor(client: Tayuya){
    super({
      name: 'Resume',
      description: 'Resume command',
      usage: `\`${client.prefix}resume\``,
      aliases: ['`r`'],
      category: 'music',
      senderPerms: ['SEND_MESSAGES'],
      clientPerms: ['SPEAK', 'CONNECT'],
      ownerOnly: true
    });
    this.client = client;
  }
  async execute(message: Message, args: string[]) {
    const chan = message.guild.me.voice.channel;
    if(!chan) return await message.channel.send(`Error: I'm not connected to a voice channel!`);
    if(!message.member.voice.channel) return await message.channel.send(`Error: You must be connected to the same voice channel!`);
    const dispatcher: StreamDispatcher = this.client.dispatchers.get(message.guild.id);
    if(!dispatcher) return await message.channel.send(`Error: There is no song currently playing.`);
    const m: any = await message.channel.send(`Resuming...`);
    dispatcher.resume();
    return await m.edit(`Resumed.`);
  }
}
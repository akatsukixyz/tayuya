import { Message } from 'discord.js';
import { Command } from '../structures/Command';
import { Tayuya } from '../structures/TayuyaClient';
module.exports = class Leave extends Command {
  constructor(client: Tayuya){
    super({
      name: 'Leave',
      description: 'Leave command',
      usage: `\`${client.prefix}leave\``,
      aliases: ['`leavechannel`'],
      category: 'music',
      senderPerms: ['SEND_MESSAGES'],
      clientPerms: ['SPEAK', 'CONNECT'],
      ownerOnly: true
    });
    this.client = client;
  }
  async execute(message: Message, args: string[]) {
    if(!message.member.voice.channel) return await message.channel.send(`Error: You must be connected to the same voice channel!`);
    const chan = message.guild.me.voice.channel;
    if(!chan) return await message.channel.send(`Error: I'm not connected to a voice channel!`);
    const m: any = await message.channel.send(`Leaving ${chan.name}...`);
    await message.guild.me.voice.channel.leave();
    return await m.edit(`Left ${chan.name}`);
  }
}